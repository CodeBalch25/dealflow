const express = require('express');
const router = express.Router();
const { allAsync, runAsync } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Submit feedback (optional auth - can be anonymous)
router.post('/submit', async (req, res) => {
  try {
    const { painPoint, almostQuitReason, rating } = req.body;

    // Get user ID if authenticated, otherwise null
    const userId = req.user ? req.user.id : null;

    const result = await runAsync(
      'INSERT INTO feedback (user_id, pain_point, almost_quit_reason, rating) VALUES (?, ?, ?, ?)',
      [userId, painPoint, almostQuitReason, rating]
    );

    res.json({
      success: true,
      message: 'Thank you for your feedback!',
      feedbackId: result.lastID,
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Error submitting feedback' });
  }
});

// Get all feedback (admin only - for now just protected)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const feedback = await allAsync(
      'SELECT * FROM feedback ORDER BY created_at DESC LIMIT 100'
    );

    res.json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Error fetching feedback' });
  }
});

module.exports = router;
