const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../../middleware/auth');

// Test route (no auth required)
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'LeetCode API routes are working!',
    timestamp: new Date().toISOString()
  });
});
// ========== END TEST ROUTE ==========


// Helper function to fetch from LeetCode API
const fetchLeetCodeStats = async (username) => {
  try {
    // Using a public LeetCode stats API
    const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch LeetCode data');
    }
    
    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Invalid LeetCode username');
    }
    
    return {
      easySolved: data.easySolved || 0,
      mediumSolved: data.mediumSolved || 0,
      hardSolved: data.hardSolved || 0,
      totalSolved: data.totalSolved || 0,
      acceptanceRate: data.acceptanceRate || 0,
      ranking: data.ranking || 0,
      totalQuestions: data.totalQuestions || 0
    };
  } catch (error) {
    console.error('LeetCode API error:', error);
    throw error;
  }
};

// @route   POST /api/leetcode/set-username
// @desc    Set LeetCode username for user
// @access  Private
router.post('/set-username', authMiddleware, async (req, res) => {
  try {
    const { leetcodeUsername } = req.body;
    
    if (!leetcodeUsername || leetcodeUsername.trim() === '') {
      return res.status(400).json({ error: 'LeetCode username is required' });
    }
    
    // Update user's LeetCode username
    const user = await User.findById(req.userId);
    user.leetcodeUsername = leetcodeUsername.trim();
    await user.save();
    
    res.json({ 
      message: 'LeetCode username updated successfully',
      leetcodeUsername: user.leetcodeUsername
    });
  } catch (error) {
    console.error('Set username error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/leetcode/sync
// @desc    Sync user's LeetCode progress
// @access  Private
router.post('/sync', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user.leetcodeUsername) {
      return res.status(400).json({ error: 'Please set your LeetCode username first' });
    }
    
    // Fetch LeetCode stats
    const leetcodeStats = await fetchLeetCodeStats(user.leetcodeUsername);
    
    // Update user's stats
    user.leetcodeStats = leetcodeStats;
    user.lastLeetcodeSync = new Date();
    
    await user.save();
    
    res.json({
      message: 'LeetCode data synced successfully',
      stats: user.leetcodeStats,
      lastSync: user.lastLeetcodeSync
    });
  } catch (error) {
    console.error('Sync error:', error);
    
    if (error.message.includes('Invalid') || error.message.includes('Failed')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to sync with LeetCode' });
  }
});

// @route   GET /api/leetcode/stats
// @desc    Get user's LeetCode stats
// @access  Private
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('leetcodeUsername leetcodeStats lastLeetcodeSync solvedProblemIds');
    
    res.json({
      leetcodeUsername: user.leetcodeUsername,
      stats: user.leetcodeStats,
      lastSync: user.lastLeetcodeSync,
      solvedCount: user.solvedProblemIds.length,
      hasLeetCodeLinked: !!user.leetcodeUsername
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/leetcode/check-problem/:problemId
// @desc    Check if user has solved a specific problem
// @access  Private
router.get('/check-problem/:problemId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const hasSolved = user.hasSolvedProblem(req.params.problemId);
    
    res.json({
      solved: hasSolved,
      problemId: req.params.problemId
    });
  } catch (error) {
    console.error('Check problem error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;