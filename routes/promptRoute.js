const express = require('express');
const { addPrompt, getUserPrompts } = require('../controllers/promptController');
const router = express.Router();

router.post('/', addPrompt);
router.get('/:user_id', getUserPrompts);

module.exports = router;
