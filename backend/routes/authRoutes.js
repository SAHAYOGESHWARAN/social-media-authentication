const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');



const router = express.Router();

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);


// Example protected route
router.get('/profile', protect, (req, res) => {
    res.json({ message: 'This is a protected route' });
  });

  
module.exports = router;
