const Prompt = require('../models/promptModel');

// Add a new prompt and generate a response
const addPrompt = async (req, res) => {
  try {
    const { user_id, prompt, response } = req.body;
    const newPrompt = await Prompt.create({ user_id, prompt, response });
    res.status(201).json({ success: true, newPrompt });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all prompts for a user
const getUserPrompts = async (req, res) => {
  try {
    const prompts = await Prompt.find({ user_id: req.params.user_id });
    res.status(200).json({ success: true, prompts });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = { addPrompt, getUserPrompts };
