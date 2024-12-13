const express = require('express');
const { registerUser, loginUser, getUserDetails, updateUserPreferences } = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/:id',authenticateToken, getUserDetails);
router.put('/:id/preferences',authenticateToken, updateUserPreferences);

module.exports = router;
