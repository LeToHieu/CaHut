import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const socket = io('http://localhost:5000');

const Quiz = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [showScores, setShowScores] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');

    socket.emit('join-room', { roomId, token });

    socket.on('countdown', (data) => {
      setCountdown(data.countdown);
      setQuestion(null);
      setShowScores(null);
      setSelectedAnswer(null);
      setLoading(false);
    });

    socket.on('next-question', (data) => {
      setQuestion(data.question);
      setQuestionIndex(data.questionIndex);
      setTotalQuestions(data.totalQuestions);
      setTimeLeft(data.question.timeLimit);
      setCountdown(null);
      setSelectedAnswer(null);
      setShowScores(null);
      setLoading(false);
    });

    socket.on('show-scores', (data) => {
      setShowScores(data.leaderboard);
      setQuestion(null);
      setCountdown(null);
    });

    socket.on('game-ended', (data) => {
      setQuestion(null);
      setShowScores(null);
      setCountdown(null);
      setLeaderboard(data.leaderboard);
      setLoading(false);
    });

    socket.on('room-deleted', () => {
      navigate('/home', {
        state: { showToast: true, toastMessage: 'Phòng đã bị xóa!', toastType: 'info' },
      });
    });

    socket.on('error', (data) => {
      toast.error(data.message, {
        position: 'top-right',
        autoClose: 3000,
      });
      navigate('/home');
    });

    return () => {
      socket.off('countdown');
      socket.off('next-question');
      socket.off('show-scores');
      socket.off('game-ended');
      socket.off('room-deleted');
      socket.off('error');
    };
  }, [roomId, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (timeLeft > 0 && question) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && question) {
      if (!selectedAnswer) {
        socket.emit('submit-answer', {
          roomId,
          answer: '',
          token: localStorage.getItem('token'),
        });
      }
      socket.emit('time-up', { roomId });
    }
  }, [timeLeft, question, selectedAnswer, roomId]);

  const handleAnswer = (answer) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    socket.emit('submit-answer', {
      roomId,
      answer,
      token: localStorage.getItem('token'),
    });
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <ProgressSpinner />
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <ToastContainer />
      {countdown !== null ? (
        <Card title="Chuẩn bị">
          <h3>Bắt đầu sau: {countdown} giây</h3>
        </Card>
      ) : question ? (
        <Card title={`Câu hỏi ${questionIndex + 1}/${totalQuestions}`}>
          <h3>{question.question}</h3>
          <p>Thời gian còn lại: {timeLeft} giây</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {question.options.map((option, index) => (
              <Button
                key={index}
                label={option}
                onClick={() => handleAnswer(option)}
                disabled={!!selectedAnswer}
                className={selectedAnswer === option ? 'p-button-success' : ''}
              />
            ))}
          </div>
        </Card>
      ) : showScores ? (
        <Card title="Điểm số hiện tại">
          <h3>Bảng xếp hạng</h3>
          <DataTable value={showScores}>
            <Column field="rank" header="Hạng" />
            <Column field="username" header="Người chơi" />
            <Column field="score" header="Điểm" />
          </DataTable>
        </Card>
      ) : leaderboard ? (
        <Card title="Kết quả thi">
          <h3>Bảng xếp hạng cuối cùng</h3>
          <DataTable value={leaderboard}>
            <Column field="rank" header="Hạng" />
            <Column field="username" header="Người chơi" />
            <Column field="score" header="Điểm" />
          </DataTable>
          <Button
            label="Về trang chủ"
            icon="pi pi-home"
            onClick={handleBackToHome}
            style={{ marginTop: '20px' }}
          />
        </Card>
      ) : (
        <p>Đang chờ bắt đầu...</p>
      )}
    </div>
  );
};

export default Quiz;