const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const examRoutes = require('./routes/exam');
const questionRoutes = require('./routes/question');
const roomRoutes = require('./routes/room'); 
const http = require('http');
const { Server } = require('socket.io');
const Room = require('./models/Room');
const Question = require('./models/Question');
const jwt = require('jsonwebtoken');
require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Cho phép frontend kết nối
    methods: ['GET', 'POST'],
  },
});

app.use(cors());


app.use(express.json());

app.use('/api/auth', authRoutes);

// Sử dụng route
app.use('/api/exam', examRoutes);

app.use('/api/question', questionRoutes);

//room route
app.use('/api/room', roomRoutes);

const gameState = {};


io.on('connection', (socket) => {

  socket.on('join-room', async ({ roomId, token }) => {
    console.log('Client connected:', socket.id);
    
    try {
      const decoded = jwt.verify(token, 'your_jwt_secret');
      const room = await Room.findOne({ roomId }).populate('users', 'username');
      if (!room) {
        socket.emit('error', { message: 'Phòng không tồn tại' });
        return;
      }
      socket.join(roomId);
      
      io.to(roomId).emit('room-update', {
        roomId: room.roomId,
        creatorId: room.creatorId._id,
        users: room.users, 
      });

    } catch (err) {
      socket.emit('error', { message: 'Lỗi khi tham gia phòng' });
    }
  });

  socket.on('leave-room', async ({ roomId, token }) => {
    try {
      const decoded = jwt.verify(token, 'your_jwt_secret');
      const room = await Room.findOne({ roomId });
      console.log(room.users);
      if (room) {
        room.users = room.users.filter(userId => userId.toString() !== decoded.id);
        await room.save();
         const updatedRoom = await Room.findOne({ roomId }).populate('users', 'username');
        socket.leave(roomId);
        io.to(roomId).emit('room-update', {
          roomId: updatedRoom.roomId,
          creatorId: updatedRoom.creatorId._id,
          users: updatedRoom.users,
        });
      }
    } catch (err) {
      socket.emit('error', { message: 'Lỗi khi rời phòng' });
    }
  });

  // socket.on('delete-room', async ({ roomId, token }) => {
  //   try {
  //     const decoded = jwt.verify(token, 'your_jwt_secret');
  //     const room = await Room.findOne({ roomId });
  //     if (!room) return;
  //     if (room.creatorId.toString() === decoded.id) {
  //       await Room.deleteOne({ roomId });
  //       io.to(roomId).emit('room-deleted', { message: 'Phòng đã bị xóa' });
  //     }
  //   } catch (err) {
  //     socket.emit('error', { message: 'Lỗi khi xóa phòng' });
  //   }
  // });

  // Bắt đầu trò chơi
  // socket.on('start-game', ({ roomId, token }) => {
  //   const decoded = jwt.verify(token, 'your_jwt_secret');
  //   Room.findOne({ roomId }).then(room => {
  //     if (room && room.creatorId.toString() === decoded.id) {
  //       io.to(roomId).emit('game-started', { message: 'Trò chơi đã bắt đầu!' });
  //     }
  //   });
  // });

  socket.on('delete-room', async ({ roomId, token }) => {
    try {
      const decoded = jwt.verify(token, 'your_jwt_secret');
      const room = await Room.findOne({ roomId });
      if (!room) return;
      if (room.creatorId.toString() === decoded.id) {
        await Room.deleteOne({ roomId });
        delete gameState[roomId]; // Xóa trạng thái trò chơi
        io.to(roomId).emit('room-deleted', { message: 'Phòng đã bị xóa' });
      }
    } catch (err) {
      socket.emit('error', { message: 'Lỗi khi xóa phòng' });
    }
  });
  
  
  socket.on('start-game', async ({ roomId, token }) => {
    try {
      const decoded = jwt.verify(token, 'your_jwt_secret');
      const room = await Room.findOne({ roomId });
      if (!room || room.creatorId.toString() !== decoded.id) return;

      const questions = await Question.find({ examId: room.examId });
      if (!questions.length) {
        socket.emit('error', { message: 'Không có câu hỏi nào trong đề thi này' });
        return;
      }

      gameState[roomId] = {
        questions,
        currentQuestionIndex: -1, // Bắt đầu từ -1 để đếm ngược 3s
        scores: {},
        answers: {},
        answeredUsers: {}, // Lưu người đã trả lời cho mỗi câu
      };

      io.to(roomId).emit('game-started', { roomId });
      // Bắt đầu đếm ngược 3s cho câu đầu tiên
      // io.to(roomId).emit('countdown', { countdown: 3 });
      // setTimeout(() => sendNextQuestion(roomId), 3000);
      setTimeout(() => {
        io.to(roomId).emit('countdown', { countdown: 3 });
        setTimeout(() => sendNextQuestion(roomId), 3000);
      }, 1000);

    } catch (err) {
      socket.emit('error', { message: 'Lỗi khi bắt đầu trò chơi' });
    }
  });

  socket.on('submit-answer', async ({ roomId, answer, token }) => {
    try {
      const decoded = jwt.verify(token, 'your_jwt_secret');
      const state = gameState[roomId];
      if (!state || state.currentQuestionIndex >= state.questions.length) return;

      const currentQuestion = state.questions[state.currentQuestionIndex];
      const isCorrect = answer === currentQuestion.correctAnswer;

      // Lưu câu trả lời
      if (!state.answers[decoded.id]) state.answers[decoded.id] = [];
      state.answers[decoded.id][state.currentQuestionIndex] = answer;

      // Lưu người đã trả lời
      if (!state.answeredUsers[state.currentQuestionIndex]) {
        state.answeredUsers[state.currentQuestionIndex] = new Set();
      }
      state.answeredUsers[state.currentQuestionIndex].add(decoded.id);

      // Cập nhật điểm
      if (!state.scores[decoded.id]) state.scores[decoded.id] = 0;
      if (isCorrect) state.scores[decoded.id] += 10;
    } catch (err) {
      socket.emit('error', { message: 'Lỗi khi gửi câu trả lời' });
    }
  });

  socket.on('time-up', async ({ roomId }) => {
    const state = gameState[roomId];
    if (!state) return;

    // Gửi điểm số và thứ hạng
    const room = await Room.findOne({ roomId }).populate('users', 'username');
    const leaderboard = room.users.map(user => ({
      username: user.username,
      score: state.scores[user._id] || 0,
    })).sort((a, b) => b.score - a.score).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    io.to(roomId).emit('show-scores', { leaderboard });

    // Chờ 3s trước khi gửi câu hỏi tiếp theo
    setTimeout(() => {
      io.to(roomId).emit('countdown', { countdown: 3 });
      setTimeout(() => sendNextQuestion(roomId), 3000);
    }, 3000);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  async function sendNextQuestion(roomId) {
    const state = gameState[roomId];
    if (!state) return;

    state.currentQuestionIndex++;
    if (state.currentQuestionIndex < state.questions.length) {
      // Gửi câu hỏi tiếp theo
      io.to(roomId).emit('next-question', {
        question: state.questions[state.currentQuestionIndex],
        questionIndex: state.currentQuestionIndex,
        totalQuestions: state.questions.length,
      });
    } else {
      // Gửi kết quả cuối
      const room = await Room.findOne({ roomId }).populate('users', 'username');
      const leaderboard = room.users.map(user => ({
        username: user.username,
        score: state.scores[user._id] || 0,
      })).sort((a, b) => b.score - a.score).map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

      io.to(roomId).emit('game-ended', { leaderboard });
      delete gameState[roomId];
    }
  }

});

const PORT = 5000;
server.listen(PORT, () => console.log('Server running on port 5000'));