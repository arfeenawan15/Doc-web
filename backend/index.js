import 'dotenv/config';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Appointment from './appointment.js';
import User from './user.js';
import Settings from './settings.js';
import { defaultServices, defaultHospitals } from './seedData.js';
import { sendAppointmentEmail, sendAdminNewBookingNotification } from './emailService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CREDS_FILE = path.join(__dirname, 'admin_credentials.json');

// Load admin credentials: from JSON file if exists, else fall back to .env
const loadAdminCreds = () => {
  try {
    if (fs.existsSync(CREDS_FILE)) {
      return JSON.parse(fs.readFileSync(CREDS_FILE, 'utf-8'));
    }
  } catch { /* ignore */ }
  return {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  };
};

const saveAdminCreds = (creds) => {
  fs.writeFileSync(CREDS_FILE, JSON.stringify(creds, null, 2), 'utf-8');
};

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

/* ─── Middleware ─── */
app.use(cors({
  origin: (origin, callback) => {
    const allowedDomains = [
      'https://drwaqasawan.com',
      'https://www.drwaqasawan.com',
      'https://drwaqasahmadawan.vercel.app'
    ];
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || allowedDomains.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

/* ─── JWT Auth Middleware ─── */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Access denied. No token.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

/* ─── MongoDB Connection ─── */
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected');
    // Seed settings if empty
    try {
      const count = await Settings.countDocuments();
      if (count === 0) {
        console.log('🌱 Seeding default settings...');
        await Settings.create({
          services: defaultServices,
          hospitals: defaultHospitals,
          doctorAvailable: true,
          availabilityMessage: "Doctor is currently unavailable."
        });
        console.log('✅ Settings seeded successfully.');
      }
    } catch (err) {
      console.error('❌ Error seeding settings:', err.message);
    }
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

/* ─── Settings API ─── */
app.get('/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        services: defaultServices,
        hospitals: defaultHospitals
      });
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/settings', authMiddleware, async (req, res) => {
  try {
    const updated = await Settings.findOneAndUpdate({}, { $set: req.body }, { new: true, upsert: true });
    res.json({ success: true, data: updated, message: 'Settings updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ─── Health Check ─── */
app.get('/', (req, res) => {
  res.json({ status: 'API Running', timestamp: new Date() });
});

/* ─── POST /auth/signup — User Registration ─── */
app.post('/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'Please provide all fields.' });

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  try {
    // DNS MX Record check to ensure email domain exists
    const domain = email.split('@')[1];
    try {
      const mxRecords = await dns.promises.resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        return res.status(400).json({ success: false, message: 'Email domain does not exist or cannot receive mail.' });
      }
    } catch (dnsErr) {
      if (dnsErr.code === 'ENOTFOUND' || dnsErr.code === 'ENODATA') {
        return res.status(400).json({ success: false, message: 'Invalid email domain.' });
      }
      // If network is restricted (e.g., ECONNREFUSED, timeout), we allow it to pass.
    }

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ success: false, message: 'Email already in use.' });

    const user = await User.create({ name, email, password });

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, message: 'Internal server error.' });
  }
});

/* ─── POST /auth/login — User Authentication ─── */
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Please provide email and password.' });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ─── POST /admin/login — Admin Authentication ─── */
app.post('/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password required.' });

  const creds = loadAdminCreds();
  if (!creds.email || !creds.password)
    return res.status(500).json({ success: false, message: 'Admin credentials not configured on server.' });

  if (email !== creds.email || password !== creds.password)
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });

  const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ success: true, token, message: 'Login successful.' });
});

/* ─── POST /admin/change-credentials — Securely Update Admin Login ─── */
app.post('/admin/change-credentials', authMiddleware, (req, res) => {
  const { currentPassword, newEmail, newPassword } = req.body;

  if (!currentPassword || !newEmail || !newPassword)
    return res.status(400).json({ success: false, message: 'All fields are required.' });

  if (newPassword.length < 8)
    return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail))
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });

  const creds = loadAdminCreds();
  if (currentPassword !== creds.password)
    return res.status(401).json({ success: false, message: 'Current password is incorrect.' });

  // Save new credentials to file
  saveAdminCreds({ email: newEmail, password: newPassword });

  // Issue a fresh token with the new email
  const token = jwt.sign({ email: newEmail, role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ success: true, message: 'Credentials updated successfully.', token });
});

/* ─── GET /admin/stats — Dashboard Statistics ─── */
app.get('/admin/stats', authMiddleware, async (req, res) => {
  try {
    const [total, pending, confirmed, cancelled] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'confirmed' }),
      Appointment.countDocuments({ status: 'cancelled' }),
    ]);

    // Appointments per hospital
    const byHospital = await Appointment.aggregate([
      { $group: { _id: '$hospital', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Appointments per service
    const byService = await Appointment.aggregate([
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Recent 7-day daily trend for analytics chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCount = await Appointment.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    const dailyTrend = await Appointment.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      stats: { total, pending, confirmed, cancelled, recentCount, dailyTrend, byHospital, byService }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ─── POST /appointments — Book an Appointment (Public) ─── */
app.post('/appointments', async (req, res) => {
  try {
    console.log('📥 New appointment request:', req.body);
    const newAppointment = new Appointment(req.body);
    const saved = await newAppointment.save();
    console.log('💾 Saved to MongoDB:', saved._id);

    // Notify doctor / admin via email immediately
    sendAdminNewBookingNotification(saved).then(result => {
      if (result && result.success) {
        console.log(`📧 Admin notification email sent for appointment: ${saved._id}`);
      } else {
        console.error(`⚠️ Failed to send admin notification email:`, result?.error);
      }
    }).catch(err => {
      console.error(`⚠️ Error triggering admin notification email:`, err.message);
    });

    res.status(201).json({ success: true, message: 'Appointment booked successfully!', data: saved });
  } catch (err) {
    console.error('❌ Save Error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

/* ─── GET /appointments/me — Fetch User's Own Appointments (Protected) ─── */
app.get('/appointments/me', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.admin.email;
    if (!userEmail) return res.status(403).json({ success: false, message: 'Invalid token payload.' });
    const appointments = await Appointment.find({ guardianEmail: userEmail }).sort({ createdAt: -1 });
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (err) {
    console.error('❌ Fetch Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ─── PUT /appointments/me/:id/cancel — User Cancel Own Appointment (Protected) ─── */
app.put('/appointments/me/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.admin.email;
    if (!userEmail) return res.status(403).json({ success: false, message: 'Invalid token payload.' });
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    
    if (appointment.guardianEmail !== userEmail) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You can only cancel your own appointments.' });
    }
    
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Appointment is already cancelled.' });
    }
    
    appointment.status = 'cancelled';
    const updated = await appointment.save();
    
    // Auto-send cancellation email
    let emailResult = await sendAppointmentEmail(updated, 'cancelled');
    updated.emailStatus = emailResult.success ? 'sent' : 'failed';
    updated.lastEmailError = emailResult.success ? '' : (emailResult.error || 'Unknown error');
    await updated.save();

    res.json({ success: true, message: 'Appointment cancelled.', data: updated, emailSent: emailResult.success });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ─── GET /appointments — Fetch All Appointments (Protected) ─── */
app.get('/appointments', authMiddleware, async (req, res) => {
  try {
    const { status, search } = req.query;
    let filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { guardianName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { hospital: { $regex: search, $options: 'i' } },
      ];
    }
    const appointments = await Appointment.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (err) {
    console.error('❌ Fetch Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ─── PUT /appointments/:id — Update Appointment (Protected) ─── */
app.put('/appointments/:id', authMiddleware, async (req, res) => {
  try {
    // Get the old appointment to detect status change
    const oldAppointment = await Appointment.findById(req.params.id);
    if (!oldAppointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    let updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    // Auto-send email if status changed to confirmed or cancelled
    let emailResult = null;
    const newStatus = req.body.status;
    if (newStatus && newStatus !== oldAppointment.status && (newStatus === 'confirmed' || newStatus === 'cancelled')) {
      emailResult = await sendAppointmentEmail(updated, newStatus);
      console.log(`📧 Status changed to ${newStatus} — email ${emailResult.success ? 'sent' : 'failed'}`);
      
      // Save email status to DB
      updated = await Appointment.findByIdAndUpdate(
        req.params.id,
        { 
          $set: { 
            emailStatus: emailResult.success ? 'sent' : 'failed',
            lastEmailError: emailResult.success ? '' : (emailResult.error || 'Unknown error')
          } 
        },
        { new: true }
      );
    }

    res.json({
      success: true,
      message: 'Appointment updated.',
      data: updated,
      emailSent: emailResult ? emailResult.success : false,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ─── POST /appointments/:id/resend-email — Resend email manually (Protected) ─── */
app.post('/appointments/:id/resend-email', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    if (appointment.status === 'pending') {
      return res.status(400).json({ success: false, message: 'Cannot send notification for pending appointments. Please confirm or cancel first.' });
    }

    const emailResult = await sendAppointmentEmail(appointment, appointment.status);
    
    // Save email status to DB
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          emailStatus: emailResult.success ? 'sent' : 'failed',
          lastEmailError: emailResult.success ? '' : (emailResult.error || 'Unknown error')
        } 
      },
      { new: true }
    );

    res.json({
      success: true,
      message: emailResult.success ? 'Email sent successfully!' : 'Email delivery failed.',
      data: updated,
      emailSent: emailResult.success
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ─── DELETE /appointments/:id — Delete an Appointment (Protected) ─── */
app.delete('/appointments/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    res.json({ success: true, message: 'Appointment deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ─── Start Server ─── */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});