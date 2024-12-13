const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },      // "daily_verse" or "response"
  message: { type: String, required: true },  // Notification content
  status: { type: String, default: "pending" }, // "pending", "sent", "failed"
  sent_at: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
