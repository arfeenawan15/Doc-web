import nodemailer from 'nodemailer';

/* ─── Transporter Setup ─── */
let gmailTransporter = null;
const FALLBACK_ADMIN_EMAIL = 'drwaqasahmadawan@gmail.com';
const FALLBACK_APP_PASSWORD = 'ejcbvsdbyreivxuz';

function getGmailTransporter() {
  if (!gmailTransporter) {
    const user = process.env.ADMIN_EMAIL || FALLBACK_ADMIN_EMAIL;
    const pass = process.env.EMAIL_APP_PASSWORD || FALLBACK_APP_PASSWORD;
    gmailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }
  return gmailTransporter;
}

/**
 * Universal email sender that supports Gmail SMTP (via nodemailer)
 * and falls back or uses Brevo API if configured.
 */
async function dispatchEmail({ to, subject, html, text }) {
  const adminEmail = process.env.ADMIN_EMAIL || FALLBACK_ADMIN_EMAIL;
  const appPassword = process.env.EMAIL_APP_PASSWORD || FALLBACK_APP_PASSWORD;

  // 1. If Brevo API Key is present, try Brevo HTTP first
  if (process.env.BREVO_API_KEY) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'Dr. Waqas Ahmad Awan', email: adminEmail },
          to: [{ email: to }],
          subject,
          htmlContent: html,
          textContent: text
        })
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, messageId: data.messageId };
      }
      console.warn('Brevo returned error, falling back to Gmail SMTP:', data.message);
    } catch (err) {
      console.warn('Brevo request failed, falling back to Gmail SMTP:', err.message);
    }
  }

  // 2. Default & Reliable: Gmail SMTP via Nodemailer
  if (appPassword) {
    try {
      const transporter = getGmailTransporter();
      const info = await transporter.sendMail({
        from: {
          name: 'Dr. Waqas Ahmad Awan Clinic',
          address: adminEmail,
        },
        replyTo: adminEmail,
        to,
        subject,
        text,
        html,
        headers: {
          'X-Priority': '1',
          'X-Mailer': 'DrWaqasClinic-Notifier'
        }
      });
      console.log(`[EmailService] Delivered email to ${to}: messageId=${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[EmailService] Gmail SMTP error sending to ${to}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  return { success: false, error: 'No email credentials configured.' };
}

/* ─── Plain Text Generator for Patient ─── */
function generatePatientPlainText(appointment, newStatus) {
  const isConfirmed = newStatus === 'confirmed';
  const statusText = isConfirmed ? 'Confirmed' : 'Cancelled';

  let text = `Appointment ${statusText} - Dr. Waqas Ahmad Awan\n`;
  text += `Pediatric Surgeon & Child Specialist\n`;
  text += `${'─'.repeat(50)}\n\n`;
  text += `Dear ${appointment.guardianName},\n\n`;

  if (isConfirmed) {
    text += `We are pleased to inform you that the appointment for ${appointment.patientName} has been confirmed.\n\n`;
  } else {
    text += `We regret to inform you that the appointment for ${appointment.patientName} has been cancelled.\n\n`;
  }

  text += `APPOINTMENT DETAILS\n`;
  text += `${'─'.repeat(30)}\n`;
  text += `Patient Name: ${appointment.patientName}\n`;
  text += `Age: ${appointment.age} years\n`;
  text += `Guardian: ${appointment.guardianName}\n`;
  text += `Phone: ${appointment.phone}\n`;
  text += `Date: ${appointment.date}\n`;
  text += `Time: ${appointment.time}\n`;
  text += `Hospital: ${appointment.hospital}\n`;
  text += `Service: ${appointment.service}\n`;

  if (appointment.concern) text += `Concern: ${appointment.concern}\n`;
  if (appointment.doctorNotes) text += `Doctor's Notes: ${appointment.doctorNotes}\n`;

  text += `\n`;
  if (isConfirmed) {
    text += `REMINDERS:\n`;
    text += `- Please arrive 10-15 minutes before your scheduled time.\n`;
    text += `- Bring any previous medical reports or records.\n`;
    text += `- Contact us if you need to reschedule.\n`;
  } else {
    text += `If you believe this was a mistake or wish to rebook, please contact our clinic directly or book a new appointment through our website.\n`;
  }

  text += `\n${'─'.repeat(50)}\n`;
  text += `Dr. Waqas Ahmad Awan - Pediatric Surgeon & Child Specialist\n`;
  text += `This is an automated notification from our clinic.\n`;

  return text;
}

/**
 * Send appointment status email to the patient/guardian
 * @param {Object} appointment - The appointment document from MongoDB
 * @param {string} newStatus - 'confirmed' or 'cancelled'
 */
export async function sendAppointmentEmail(appointment, newStatus) {
  if (!appointment || !appointment.guardianEmail) {
    return { success: false, error: 'No guardian email provided' };
  }

  const isConfirmed = newStatus === 'confirmed';
  const statusColor = isConfirmed ? '#10b981' : '#ef4444';
  const statusText = isConfirmed ? 'CONFIRMED' : 'CANCELLED';

  const subject = isConfirmed
    ? `Appointment Confirmed - Dr. Waqas Ahmad Awan`
    : `Appointment Update - Dr. Waqas Ahmad Awan`;

  const htmlBody = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment ${isConfirmed ? 'Confirmation' : 'Update'}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9; padding:30px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding:32px 40px; text-align:center;">
                <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700; letter-spacing:0.5px;">
                  Dr. Waqas Ahmad Awan
                </h1>
                <p style="margin:6px 0 0; color:#e0f2fe; font-size:14px;">Pediatric Surgeon &amp; Child Specialist (بچوں کا ڈاکٹر اور سرجن)</p>
              </td>
            </tr>

            <!-- Status Badge -->
            <tr>
              <td style="padding:28px 40px 10px; text-align:center;">
                <div style="display:inline-block; background:${statusColor}; color:#ffffff; padding:10px 28px; border-radius:50px; font-size:15px; font-weight:700; letter-spacing:1px;">
                  APPOINTMENT ${statusText}
                </div>
              </td>
            </tr>

            <!-- Greeting -->
            <tr>
              <td style="padding:20px 40px 10px;">
                <p style="margin:0; color:#1e293b; font-size:15px; line-height:1.6;">
                  Dear <strong>${appointment.guardianName}</strong>,
                </p>
                <p style="margin:8px 0 0; color:#475569; font-size:14px; line-height:1.6;">
                  ${isConfirmed 
                    ? `We are pleased to inform you that the medical appointment for <strong>${appointment.patientName}</strong> has been <span style="color:${statusColor}; font-weight:700;">confirmed</span>. Below are your scheduled consultation details:`
                    : `We regret to inform you that the appointment for <strong>${appointment.patientName}</strong> has been <span style="color:${statusColor}; font-weight:700;">cancelled</span>. Below are the appointment details for your reference:`
                  }
                </p>
              </td>
            </tr>

            <!-- Appointment Details Card -->
            <tr>
              <td style="padding:15px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0;">
                  <tr>
                    <td style="padding:20px 24px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding:8px 0; border-bottom:1px solid #e2e8f0;">
                            <span style="color:#64748b; font-size:12px; text-transform:uppercase; font-weight:600;">Patient Name</span><br>
                            <span style="color:#0f172a; font-size:15px; font-weight:700;">${appointment.patientName}</span>
                          </td>
                          <td style="padding:8px 0; border-bottom:1px solid #e2e8f0; text-align:right;">
                            <span style="color:#64748b; font-size:12px; text-transform:uppercase; font-weight:600;">Age</span><br>
                            <span style="color:#0f172a; font-size:15px; font-weight:700;">${appointment.age} years</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0; border-bottom:1px solid #e2e8f0;">
                            <span style="color:#64748b; font-size:12px; text-transform:uppercase; font-weight:600;">Guardian Name</span><br>
                            <span style="color:#0f172a; font-size:14px; font-weight:600;">${appointment.guardianName}</span>
                          </td>
                          <td style="padding:8px 0; border-bottom:1px solid #e2e8f0; text-align:right;">
                            <span style="color:#64748b; font-size:12px; text-transform:uppercase; font-weight:600;">Phone</span><br>
                            <span style="color:#0f172a; font-size:14px; font-weight:600;">${appointment.phone}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0; border-bottom:1px solid #e2e8f0;">
                            <span style="color:#64748b; font-size:12px; text-transform:uppercase; font-weight:600;">Scheduled Date</span><br>
                            <span style="color:#0284c7; font-size:15px; font-weight:700;">${appointment.date}</span>
                          </td>
                          <td style="padding:8px 0; border-bottom:1px solid #e2e8f0; text-align:right;">
                            <span style="color:#64748b; font-size:12px; text-transform:uppercase; font-weight:600;">Time</span><br>
                            <span style="color:#0284c7; font-size:15px; font-weight:700;">${appointment.time}</span>
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding:8px 0; border-bottom:1px solid #e2e8f0;">
                            <span style="color:#64748b; font-size:12px; text-transform:uppercase; font-weight:600;">Hospital Branch</span><br>
                            <span style="color:#0f172a; font-size:14px; font-weight:600;">${appointment.hospital}</span>
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding:8px 0; border-bottom:1px solid #e2e8f0;">
                            <span style="color:#64748b; font-size:12px; text-transform:uppercase; font-weight:600;">Service Requested</span><br>
                            <span style="color:#0f172a; font-size:14px;">${appointment.service}</span>
                          </td>
                        </tr>
                        ${appointment.concern ? `
                        <tr>
                          <td colspan="2" style="padding:8px 0; border-bottom:1px solid #e2e8f0;">
                            <span style="color:#64748b; font-size:12px; text-transform:uppercase; font-weight:600;">Patient's Concern</span><br>
                            <span style="color:#334155; font-size:14px;">${appointment.concern}</span>
                          </td>
                        </tr>
                        ` : ''}
                        ${appointment.doctorNotes ? `
                        <tr>
                          <td colspan="2" style="padding:8px 0;">
                            <span style="color:#64748b; font-size:12px; text-transform:uppercase; font-weight:600;">Doctor's Clinical Notes</span><br>
                            <span style="color:#0284c7; font-size:14px; font-weight:600;">${appointment.doctorNotes}</span>
                          </td>
                        </tr>
                        ` : ''}
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            ${isConfirmed ? `
            <tr>
              <td style="padding:5px 40px 20px;">
                <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:16px 20px;">
                  <p style="margin:0; color:#166534; font-size:13px; line-height:1.6;">
                    <strong>Important Visit Instructions:</strong><br>
                    • Please arrive 10-15 minutes prior to your scheduled consultation.<br>
                    • Bring any previous ultrasound, blood test, or surgical reports.<br>
                    • If you need to reschedule or have urgent questions, contact us via WhatsApp: +92 331 8034846.
                  </p>
                </div>
              </td>
            </tr>
            ` : `
            <tr>
              <td style="padding:5px 40px 20px;">
                <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:10px; padding:16px 20px;">
                  <p style="margin:0; color:#991b1b; font-size:13px; line-height:1.6;">
                    <strong>Note:</strong><br>
                    If you believe this cancellation was in error or wish to choose another date, please contact the clinic or book again on our website.
                  </p>
                </div>
              </td>
            </tr>
            `}

            <!-- Footer -->
            <tr>
              <td style="background:#f8fafc; padding:20px 40px; text-align:center; border-top:1px solid #e2e8f0;">
                <p style="margin:0; color:#64748b; font-size:12px; line-height:1.5;">
                  Dr. Waqas Ahmad Awan · Pediatric Surgeon &amp; Child Specialist
                </p>
                <p style="margin:6px 0 0; color:#94a3b8; font-size:11px;">
                  Al Manzoor Hospital Mian Channu &amp; Sughran Wazeer Hospital Multan
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  return dispatchEmail({
    to: appointment.guardianEmail,
    subject,
    html: htmlBody,
    text: generatePatientPlainText(appointment, newStatus)
  });
}

/**
 * Send an immediate notification email to the DOCTOR / ADMIN
 * whenever any patient books a new appointment through the website.
 * @param {Object} appointment - The newly saved appointment document
 */
export async function sendAdminNewBookingNotification(appointment) {
  const adminEmail = process.env.ADMIN_EMAIL || 'drwaqasahmadawan@gmail.com';

  const subject = `🔔 New Booking Alert: ${appointment.patientName} (${appointment.hospital} - ${appointment.date})`;

  const htmlBody = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Appointment Alert</title>
  </head>
  <body style="margin:0; padding:0; background-color:#0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a; padding:30px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding:28px 36px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <span style="background:rgba(255,255,255,0.2); color:#ffffff; font-size:11px; font-weight:700; text-transform:uppercase; padding:4px 10px; border-radius:20px; letter-spacing:0.5px;">
                        NEW APPOINTMENT ALERT
                      </span>
                      <h1 style="margin:10px 0 0; color:#ffffff; font-size:22px; font-weight:700;">
                        ${appointment.patientName} (${appointment.age} yrs)
                      </h1>
                      <p style="margin:4px 0 0; color:#bae6fd; font-size:13px;">
                        ${appointment.hospital} · ${appointment.service}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Body Details -->
            <tr>
              <td style="padding:28px 36px;">
                <p style="margin:0 0 18px; color:#334155; font-size:14px;">
                  Dr. Waqas, a new patient has booked an appointment online. Here are the booking details:
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; margin-bottom:20px;">
                  <tr>
                    <td style="padding:18px 22px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding:8px 0; border-bottom:1px solid #e2e8f0; width:45%;">
                            <span style="color:#64748b; font-size:11px; text-transform:uppercase; font-weight:600;">Patient Name</span><br>
                            <span style="color:#0f172a; font-size:15px; font-weight:700;">${appointment.patientName}</span>
                          </td>
                          <td style="padding:8px 0; border-bottom:1px solid #e2e8f0;">
                            <span style="color:#64748b; font-size:11px; text-transform:uppercase; font-weight:600;">Age</span><br>
                            <span style="color:#0f172a; font-size:15px; font-weight:700;">${appointment.age} years old</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0; border-bottom:1px solid #e2e8f0;">
                            <span style="color:#64748b; font-size:11px; text-transform:uppercase; font-weight:600;">Guardian Name</span><br>
                            <span style="color:#0f172a; font-size:14px; font-weight:600;">${appointment.guardianName}</span>
                          </td>
                          <td style="padding:8px 0; border-bottom:1px solid #e2e8f0;">
                            <span style="color:#64748b; font-size:11px; text-transform:uppercase; font-weight:600;">Phone</span><br>
                            <a href="tel:${appointment.phone}" style="color:#0284c7; font-size:14px; font-weight:700; text-decoration:none;">${appointment.phone}</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0; border-bottom:1px solid #e2e8f0;">
                            <span style="color:#64748b; font-size:11px; text-transform:uppercase; font-weight:600;">Guardian Email</span><br>
                            <a href="mailto:${appointment.guardianEmail}" style="color:#0284c7; font-size:14px; text-decoration:none;">${appointment.guardianEmail}</a>
                          </td>
                          <td style="padding:8px 0; border-bottom:1px solid #e2e8f0;">
                            <span style="color:#64748b; font-size:11px; text-transform:uppercase; font-weight:600;">Requested Date &amp; Time</span><br>
                            <span style="color:#059669; font-size:14px; font-weight:700;">${appointment.date} (${appointment.time})</span>
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding:8px 0; border-bottom:1px solid #e2e8f0;">
                            <span style="color:#64748b; font-size:11px; text-transform:uppercase; font-weight:600;">Hospital Branch</span><br>
                            <span style="color:#0f172a; font-size:14px; font-weight:600;">${appointment.hospital}</span>
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding:8px 0; ${appointment.concern ? 'border-bottom:1px solid #e2e8f0;' : ''}">
                            <span style="color:#64748b; font-size:11px; text-transform:uppercase; font-weight:600;">Service</span><br>
                            <span style="color:#0f172a; font-size:14px;">${appointment.service}</span>
                          </td>
                        </tr>
                        ${appointment.concern ? `
                        <tr>
                          <td colspan="2" style="padding:8px 0;">
                            <span style="color:#64748b; font-size:11px; text-transform:uppercase; font-weight:600;">Parent's Stated Problem / Concern</span><br>
                            <span style="color:#b45309; font-size:13px; font-style:italic;">“${appointment.concern}”</span>
                          </td>
                        </tr>
                        ` : ''}
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Action Button -->
                <div style="text-align:center; padding:10px 0 15px;">
                  <a href="https://drwaqasahmadawan.vercel.app/admin/dashboard" 
                     style="display:inline-block; background:#0284c7; color:#ffffff; font-weight:700; font-size:14px; padding:14px 32px; border-radius:10px; text-decoration:none; box-shadow:0 4px 12px rgba(2,132,199,0.3);">
                    Open Admin Dashboard to Confirm →
                  </a>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f1f5f9; padding:18px 36px; text-align:center; border-top:1px solid #e2e8f0;">
                <p style="margin:0; color:#64748b; font-size:12px;">
                  Automated Clinic Notification · Dr. Waqas Ahmad Awan Website
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  let plainText = `NEW APPOINTMENT BOOKING ALERT\n\n`;
  plainText += `Patient: ${appointment.patientName} (${appointment.age} yrs)\n`;
  plainText += `Guardian: ${appointment.guardianName}\n`;
  plainText += `Phone: ${appointment.phone}\n`;
  plainText += `Email: ${appointment.guardianEmail}\n`;
  plainText += `Date: ${appointment.date} at ${appointment.time}\n`;
  plainText += `Hospital: ${appointment.hospital}\n`;
  plainText += `Service: ${appointment.service}\n`;
  if (appointment.concern) plainText += `Concern: ${appointment.concern}\n`;
  plainText += `\nReview in Admin Portal: https://drwaqasahmadawan.vercel.app/admin/dashboard\n`;

  return dispatchEmail({
    to: adminEmail,
    subject,
    html: htmlBody,
    text: plainText
  });
}

/**
 * Dispatches a 6-digit OTP verification email for patient account password resets.
 */
export async function sendPasswordResetCodeEmail({ to, name, code }) {
  const subject = `🔐 ${code} is your Dr. Waqas Ahmad Awan Clinic verification code`;

  const htmlBody = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0; padding:0; background:#f4f7fb; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#1e293b;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb; padding:30px 10px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="560" style="max-width:560px; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 8px 30px rgba(0,0,0,0.06); border:1px solid #e2e8f0;">
            
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg, #0f766e 0%, #0369a1 100%); padding:28px 32px; text-align:center;">
                <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:700; letter-spacing:-0.5px;">
                  Dr. Waqas Ahmad Awan
                </h1>
                <p style="margin:5px 0 0; color:#99f6e4; font-size:13px; font-weight:500;">
                  Pediatric Surgeon &amp; Child Specialist · Patient Portal
                </p>
              </td>
            </tr>

            <!-- Content Area -->
            <tr>
              <td style="padding:32px 36px;">
                <h2 style="margin:0 0 12px; color:#0f172a; font-size:19px; font-weight:600;">
                  Password Reset Request
                </h2>
                <p style="margin:0 0 18px; color:#475569; font-size:14px; line-height:1.6;">
                  Assalam-o-Alaikum <strong>${name || 'Patient'}</strong>,<br>
                  We received a request to reset your password for your clinic account. Use the verification code below to set a new password:
                </p>

                <!-- OTP Code Display Card -->
                <div style="background:#f0fdfa; border:2px dashed #0d9488; border-radius:12px; padding:22px 20px; text-align:center; margin:24px 0;">
                  <span style="display:block; font-size:11px; font-weight:700; letter-spacing:1.5px; color:#0f766e; text-transform:uppercase; margin-bottom:8px;">
                    Your 6-Digit Verification Code
                  </span>
                  <span style="display:inline-block; font-size:36px; font-weight:800; letter-spacing:8px; color:#0f766e; font-family:monospace;">
                    ${code}
                  </span>
                  <span style="display:block; font-size:12px; color:#64748b; margin-top:8px;">
                    ⏱️ Valid for 15 minutes only
                  </span>
                </div>

                <p style="margin:0 0 12px; color:#64748b; font-size:13px; line-height:1.5;">
                  If you did not initiate this request, you can safely ignore this email. Your current password remains secure and unchanged.
                </p>

                <hr style="border:none; border-top:1px solid #f1f5f9; margin:24px 0;">

                <p style="margin:0; color:#94a3b8; font-size:12px; line-height:1.5;">
                  Need assistance? Contact our clinic reception at <a href="tel:+923098683232" style="color:#0284c7; text-decoration:none;">+92 309 8683232</a> or WhatsApp us directly at <a href="https://wa.me/923318034846" style="color:#16a34a; text-decoration:none;">+92 331 8034846</a>.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f8fafc; padding:16px 36px; text-align:center; border-top:1px solid #e2e8f0;">
                <p style="margin:0; color:#94a3b8; font-size:11px;">
                  © ${new Date().getFullYear()} Dr. Waqas Ahmad Awan Clinic · All Manzoor Hospital Mian Channu
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  const plainText = `Password Reset Verification Code - Dr. Waqas Ahmad Awan Clinic\n\n` +
    `Assalam-o-Alaikum ${name || 'Patient'},\n\n` +
    `Your 6-digit verification code is: ${code}\n\n` +
    `This code will expire in 15 minutes.\n` +
    `If you did not request a password reset, please ignore this email.\n\n` +
    `Clinic Contact: +92 309 8683232 | WhatsApp: +92 331 8034846\n`;

  return dispatchEmail({
    to,
    subject,
    html: htmlBody,
    text: plainText
  });
}
