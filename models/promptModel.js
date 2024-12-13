const mongoose = require('mongoose');

const PromptSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prompt: { type: String, required: true },
  response: {
    text: { type: String, required: true },
    audio_url: { type: String, required: true } // URL for TTS audio
  }
}, { timestamps: true });

module.exports = mongoose.model('Prompt', PromptSchema);
