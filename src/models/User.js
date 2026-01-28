const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  // LeetCode Integration Fields
  leetcodeUsername: {
    type: String,
    default: '',
    trim: true
  },
  lastLeetcodeSync: {
    type: Date,
    default: null
  },
  leetcodeStats: {
    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },
    totalSolved: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 0 },
    ranking: { type: Number, default: 0 }
  },
  // Store solved problem IDs only (for quick lookup)
  solvedProblemIds: [{
    type: String,
    unique: true
  }],
  // Detailed solved problems (optional - for history)
  solvedProblems: [{
    problemId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true
    },
    topics: [String],
    solvedAt: {
      type: Date,
      default: Date.now
    },
    solution: String,
    notes: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password with salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update updatedAt timestamp on save
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to compare password for login
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Check if user has solved a specific problem
UserSchema.methods.hasSolvedProblem = function(problemId) {
  return this.solvedProblemIds.includes(problemId);
};

// Add a solved problem
UserSchema.methods.addSolvedProblem = function(problemData) {
  if (!this.hasSolvedProblem(problemData.problemId)) {
    this.solvedProblemIds.push(problemData.problemId);
    this.solvedProblems.push(problemData);
    
    // Update stats based on difficulty
    if (problemData.difficulty === 'Easy') {
      this.leetcodeStats.easySolved += 1;
    } else if (problemData.difficulty === 'Medium') {
      this.leetcodeStats.mediumSolved += 1;
    } else if (problemData.difficulty === 'Hard') {
      this.leetcodeStats.hardSolved += 1;
    }
    
    this.leetcodeStats.totalSolved += 1;
  }
};

// Remove password from JSON output
UserSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;