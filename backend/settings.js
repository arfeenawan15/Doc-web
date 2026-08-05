import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  doctorAvailable: {
    type: Boolean,
    default: true,
  },
  availabilityMessage: {
    type: String,
    default: "Doctor is currently unavailable.",
  },
  services: [
    {
      id: { type: String },
      icon: { type: String },
      title: { type: String },
      desc: { type: String },
      image: { type: String },
      details: { type: String },
    }
  ],
  hospitals: [
    {
      key: { type: String },
      name: { type: String },
      address: { type: String },
      badge: { type: String },
      number: { type: String },
      days: { type: String },
      hours: { type: String },
      allowedDays: [{ type: Number }],
      dayNames: [{ type: String }],
      slots: [{ type: String }],
      hintDays: { type: String },
      hintTime: { type: String },
      phones: [{ type: String }],
      mapSrc: { type: String },
      mapsLink: { type: String },
      schedule: [
        {
          day: { type: String },
          timing: { type: String },
          open: { type: Boolean },
        }
      ]
    }
  ]
}, { timestamps: true });

export default mongoose.model('Settings', SettingsSchema);
