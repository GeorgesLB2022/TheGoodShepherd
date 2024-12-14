const BibleVerse = require('../models/bibleVerseModel');
const asyncHandler = require('express-async-handler')
const fs = require("fs");

// Add a new Bible verse
const addVerse = asyncHandler(async (req, res) => {
  try {
    const { book, chapter, verse, reference, theme, language, description } = req.body;
    const newVerse = await BibleVerse.create({ book, chapter, verse, reference, theme, language, description });
    res.status(201).json({ success: true, newVerse });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get verses by theme
const getVersesByTheme = asyncHandler(async (req, res) => {
  try {
    const verses = await BibleVerse.find({ theme: req.params.theme });
    res.status(200).json({ success: true, verses });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});



module.exports = { addVerse, getVersesByTheme };
