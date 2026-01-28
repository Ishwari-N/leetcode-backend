const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  completedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  totalCompleted: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Progress', progressSchema);