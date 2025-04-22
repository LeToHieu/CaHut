const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: true },
  timeLimit: { type: Number, required: true, default: 30 }, // Thời gian giới hạn (giây)
});

module.exports = mongoose.model('Question', questionSchema);