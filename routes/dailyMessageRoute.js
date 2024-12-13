const express = require('express');
const { scheduleDailyMessage, getUserMessages } = require('../controllers/dailyMessageConroller');
const router = express.Router();

router.post('/', scheduleDailyMessage);
router.get('/:user_id', getUserMessages);

module.exports = router;
