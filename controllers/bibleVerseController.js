const BibleVerse = require('../models/bibleVerseModel');

// Add a new Bible verse
const addVerse = async (req, res) => {
  try {
    const { verse, reference, theme, language, description } = req.body;
    const newVerse = await BibleVerse.create({ verse, reference, theme, language, description });
    res.status(201).json({ success: true, newVerse });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get verses by theme
const getVersesByTheme = async (req, res) => {
  try {
    const verses = await BibleVerse.find({ theme: req.params.theme });
    res.status(200).json({ success: true, verses });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = { addVerse, getVersesByTheme };
