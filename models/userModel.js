const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  preferences: {
    theme: { type: String, default: "default" },
    language: { type: String, default: "en" },
    dailyMessageTime: { type: String, default: "08:00" } // Format: HH:mm
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
