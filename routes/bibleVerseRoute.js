const express = require('express');
const { addVerse, getVersesByTheme } = require('../controllers/bibleVerseController');
const router = express.Router();

router.post('/', addVerse);
router.get('/theme/:theme', getVersesByTheme);

module.exports = router;
