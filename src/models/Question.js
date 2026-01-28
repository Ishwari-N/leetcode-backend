const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  leetcodeId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard'],
    index: true
  },
  topics: [{
    type: String,
    trim: true
  }],
  companies: [{
    type: String,
    trim: true,
    index: true
  }],
  leetcodeUrl: {
    type: String,
    required: true
  },
  solved: {
    type: Boolean,
    default: false,
    index: true
  },
  order: {
    type: Number,
    default: 0
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
questionSchema.index({ difficulty: 1, companies: 1 });
questionSchema.index({ topics: 1, companies: 1 });

module.exports = mongoose.model('Question', questionSchema);