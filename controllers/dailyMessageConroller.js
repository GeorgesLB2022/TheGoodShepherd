const DailyMessage = require('../models/dailyMessageModel');
const asyncHandler = require('express-async-handler')

// Schedule a daily message
const scheduleDailyMessage = asyncHandler(async (req, res) => {
  try {
    const { user_id, verse_id, scheduled_time } = req.body;
    const newMessage = await DailyMessage.create({ user_id, verse_id, scheduled_time });
    res.status(201).json({ success: true, newMessage });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all daily messages for a user
const getUserMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await DailyMessage.find({ user_id: req.params.user_id }).populate('verse_id');
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = { scheduleDailyMessage, getUserMessages };
