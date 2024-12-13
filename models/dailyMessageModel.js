const mongoose = require('mongoose');

const DailyMessageSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  verse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BibleVerse', required: true },
  scheduled_time: { type: String, required: true }, // Format: HH:mm
  delivered_at: { type: Date },
  status: { type: String, default: "pending" } // "pending", "delivered", "failed"
}, { timestamps: true });

module.exports = mongoose.model('DailyMessage', DailyMessageSchema);
