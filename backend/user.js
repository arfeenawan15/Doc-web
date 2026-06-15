import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  hospitalKey: String,
  hospital: String,
  patientName: String,
  guardianName: String,
  phone: String,
  guardianEmail: String,
  age: Number,
  date: String,
  time: String,
  service: String,
  concern: String
}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);