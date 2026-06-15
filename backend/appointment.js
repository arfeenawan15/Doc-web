import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  hospitalKey:   { type: String, required: true },
  hospital:      { type: String, required: true },
  patientName:   { type: String, required: true },
  guardianName:  { type: String, required: true },
  phone:         { type: String, required: true },
  guardianEmail: { type: String, required: true },
  age:           { type: Number, required: true, min: 0, max: 18 },
  date:          { type: String, required: true },
  time:          { type: String, required: true },
  service:       { type: String, required: true },
  concern:       { type: String, default: '' },
  doctorNotes:   { type: String, default: '' },
  status:        { type: String, default: 'pending', enum: ['pending', 'confirmed', 'cancelled'] },
  emailStatus:   { type: String, default: 'none', enum: ['none', 'sent', 'failed'] },
  lastEmailError:{ type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);
