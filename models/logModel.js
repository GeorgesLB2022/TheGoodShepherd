const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  type: { type: String, required: true },         // "info", "warning", "error"
  message: { type: String, required: true },      // Log description
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Optional
}, { timestamps: true });

module.exports = mongoose.model('Log', LogSchema);
