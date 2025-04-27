const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const jwt = require('jsonwebtoken');


// Middleware xác thực token
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Không có token' });
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret'); // Thay 'your_jwt_secret' bằng secret key của bạn
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

// API lấy danh sách câu hỏi
router.get('/get/:examId', authMiddleware, async (req, res) => {
    const { examId } = req.params;
    try {
      const exam = await Exam.findById(examId);
      if (!exam) return res.status(404).json({ message: 'Đề thi không tồn tại' });
      if (exam.userId.toString() !== req.userId) {
        return res.status(403).json({ message: 'Bạn không có quyền xem câu hỏi của đề thi này' });
      }
      const questions = await Question.find({ examId });
      res.json(questions);
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

// API thêm câu hỏi vào đề thi
router.post('/create', authMiddleware, async (req, res) => {
    const { examId, question, options, correctAnswer, timeLimit } = req.body;
    try {
      const exam = await Exam.findById(examId);
      if (!exam) return res.status(404).json({ message: 'Đề thi không tồn tại' });
      if (exam.userId.toString() !== req.userId) {
        return res.status(403).json({ message: 'Bạn không có quyền thêm câu hỏi vào đề thi này' });
      }
      const newQuestion = new Question({ 
        examId, 
        question, 
        options, 
        correctAnswer, 
        timeLimit: timeLimit || 30 // Mặc định 30 giây nếu không cung cấp
      });
      await newQuestion.save();
      res.status(201).json({ message: 'Câu hỏi đã được thêm', questionId: newQuestion._id });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

router.put('/edit/:questionId', authMiddleware, async (req, res) => {
    const { questionId } = req.params;
    const { examId, question, options, correctAnswer, timeLimit } = req.body;
    try {
      const exam = await Exam.findById(examId);
      if (!exam) return res.status(404).json({ message: 'Đề thi không tồn tại' });
      if (exam.userId.toString() !== req.userId) {
        return res.status(403).json({ message: 'Bạn không có quyền sửa câu hỏi này' });
      }
      const updatedQuestion = await Question.findByIdAndUpdate(
        questionId,
        { question, options, correctAnswer, timeLimit },
        { new: true }
      );
      if (!updatedQuestion) return res.status(404).json({ message: 'Câu hỏi không tồn tại' });
      res.status(201).json({ message: 'Câu hỏi đã được cập nhật', questionId: updatedQuestion._id });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

// API xóa câu hỏi
router.delete('/delete/:questionId', authMiddleware, async (req, res) => {
    const { questionId } = req.params;
    try {
      const question = await Question.findById(questionId);
      if (!question) return res.status(404).json({ message: 'Câu hỏi không tồn tại' });
      const exam = await Exam.findById(question.examId);
      if (exam.userId.toString() !== req.userId) {
        return res.status(403).json({ message: 'Bạn không có quyền xóa câu hỏi này' });
      }
      await Question.deleteOne({ _id: questionId });
      res.json({ message: 'Câu hỏi đã được xóa' });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

module.exports = router;
