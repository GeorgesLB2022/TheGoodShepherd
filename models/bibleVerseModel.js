const mongoose = require('mongoose');

const BibleVerseSchema = new mongoose.Schema({
  verse: { type: String, required: true },       // The Bible verse
  reference: { type: String, required: true },  // e.g., John 3:16
  theme: { type: String, required: true },      // Theme or category
  language: { type: String, required: true },   // "en" or "ar"
  description: { type: String }                 // Short description or context
}, { timestamps: true });

module.exports = mongoose.model('BibleVerse', BibleVerseSchema);