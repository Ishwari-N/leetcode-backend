const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const Question = require('../models/Question');
const { authMiddleware } = require('../../middleware/auth');

// GET user progress (authenticated - uses token instead of URL param)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    
    let progress = await Progress.findOne({ userId: userId })
      .populate('completedQuestions');
    
    if (!progress) {
      progress = new Progress({ 
        userId: userId,
        completedQuestions: [],
        totalCompleted: 0,
        lastUpdated: new Date()
      });
      await progress.save();
    }
    
    res.json({
      success: true,
      progress: progress
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching progress' 
    });
  }
});

// UPDATE progress (mark question as completed/incomplete)
router.put('/:questionId', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { questionId } = req.params;
    const { isCompleted } = req.body;
    
    let progress = await Progress.findOne({ userId: userId });
    
    if (!progress) {
      progress = new Progress({ 
        userId: userId,
        completedQuestions: [],
        totalCompleted: 0,
        lastUpdated: new Date()
      });
    }
    
    // Update question completion status in Question model
    const question = await Question.findById(questionId);
    if (question) {
      question.isCompleted = isCompleted;
      if (isCompleted) {
        question.solvedAt = new Date();
      }
      await question.save();
    }
    
    // Update progress
    const questionObjectId = questionId; // mongoose will convert string to ObjectId
    
    if (isCompleted) {
      if (!progress.completedQuestions.includes(questionObjectId)) {
        progress.completedQuestions.push(questionObjectId);
      }
    } else {
      progress.completedQuestions = progress.completedQuestions.filter(
        id => id.toString() !== questionId
      );
    }
    
    progress.totalCompleted = progress.completedQuestions.length;
    progress.lastUpdated = new Date();
    
    await progress.save();
    
    res.json({
      success: true,
      progress: progress
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET progress stats (for dashboard)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    
    const progress = await Progress.findOne({ userId: userId })
      .populate('completedQuestions');
    
    if (!progress) {
      return res.json({
        success: true,
        stats: {
          totalCompleted: 0,
          easy: 0,
          medium: 0,
          hard: 0,
          lastActive: null
        }
      });
    }
    
    // Calculate difficulty breakdown
    const stats = {
      totalCompleted: progress.totalCompleted,
      easy: progress.completedQuestions.filter(q => q.difficulty === 'Easy').length,
      medium: progress.completedQuestions.filter(q => q.difficulty === 'Medium').length,
      hard: progress.completedQuestions.filter(q => q.difficulty === 'Hard').length,
      lastActive: progress.lastUpdated
    };
    
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching progress stats'
    });
  }
});

module.exports = router;