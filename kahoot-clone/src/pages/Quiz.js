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
import { jwtDecode } from 'jwt-decode';
import '../css/Home.css'; // Dùng lại Home.css chung

const socket = io(process.env.REACT_APP_SERVER_URL);

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
  const [showResults, setShowResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');

    const decoded = jwtDecode(token);
    setCurrentUsername(decoded.username || '');
    setCurrentUserId(decoded.id || '');

    socket.emit('join-room', { roomId, token });

    socket.on('room-update', (data) => {
      console.log(`[${roomId}] Received room-update: creatorId=${data.creatorId}`);
      setIsCreator(decoded.id === data.creatorId.toString());
    });

    socket.on('countdown', (data) => {
      console.log(`[${roomId}] Received countdown: ${data.countdown}`);
      setCountdown(data.countdown);
      setQuestion(null);
      setShowScores(null);
      setShowResults(null);
      setSelectedAnswer(null);
      setLoading(false);
    });

    socket.on('next-question', (data) => {
      console.log(`[${roomId}] Received next-question: ${data.questionIndex + 1}, question: ${JSON.stringify(data.question)}`);
      if (!data.question) {
        console.error(`[${roomId}] Invalid question data received`);
        return;
      }
      setQuestion(data.question);
      setQuestionIndex(data.questionIndex);
      setTotalQuestions(data.totalQuestions);
      setTimeLeft(data.question.timeLimit || 30);
      setCountdown(null);
      setSelectedAnswer(null);
      setShowScores(null);
      setShowResults(null);
      setLoading(false);
    });

    socket.on('show-results', (data) => {
      console.log(`[${roomId}] Received show-results: ${data.correctAnswer}`);
      setShowResults(data);
      setQuestion(null);
      setCountdown(null);
      setShowScores(null);
    });

    socket.on('show-scores', (data) => {
      console.log(`[${roomId}] Received show-scores`);
      setShowScores(data.leaderboard);
      setQuestion(null);
      setCountdown(null);
      setShowResults(null);
    });

    socket.on('game-ended', (data) => {
      console.log(`[${roomId}] Received game-ended`);
      setQuestion(null);
      setShowScores(null);
      setShowResults(null);
      setCountdown(null);
      setLeaderboard(data.leaderboard);
      setLoading(false);
    });

    socket.on('room-deleted', () => {
      console.log(`[${roomId}] Received room-deleted`);
      navigate('/home', {
        state: { showToast: true, toastMessage: 'Phòng đã bị xóa!', toastType: 'info' },
      });
    });

    socket.on('error', (data) => {
      console.log(`[${roomId}] Received error: ${data.message}`);
      toast.error(data.message, {
        position: 'top-right',
        autoClose: 3000,
      });
      navigate('/home');
    });

    return () => {
      socket.off('room-update');
      socket.off('countdown');
      socket.off('next-question');
      socket.off('show-results');
      socket.off('show-scores');
      socket.off('game-ended');
      socket.off('room-deleted');
      socket.off('error');
    };
  }, [roomId, navigate]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (timeLeft > 0 && question) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
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

  const handleSkipQuestion = () => {
    socket.emit('time-up', { roomId });
  };

  const handleDeleteRoom = () => {
    socket.emit('delete-room', {
      roomId,
      token: localStorage.getItem('token'),
    });
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  const getOptionStyle = (option) => {
    if (!showResults) return {};
    const isCorrectAnswer = option === showResults.correctAnswer;
    const isUserAnswer = option === selectedAnswer;

    if (isCorrectAnswer) {
      return { backgroundColor: '#28a745', color: 'white' };
    }
    if (isUserAnswer && !isCorrectAnswer) {
      return { backgroundColor: '#dc3545', color: 'white' };
    }
    return {};
  };

  const getOptionIcon = (option) => {
    if (!showResults) return null;
    const isCorrectAnswer = option === showResults.correctAnswer;
    const isUserAnswer = option === selectedAnswer;

    if (isCorrectAnswer) {
      return <span style={{ marginRight: '10px' }}>✓</span>;
    }
    if (isUserAnswer && !isCorrectAnswer) {
      return <span style={{ marginRight: '10px' }}>✗</span>;
    }
    return null;
  };

  const getUserScore = (leaderboardData) => {
    if (!leaderboardData || !currentUserId) return 0;
    const userEntry = leaderboardData.find((entry) => entry.id === currentUserId);
    return userEntry ? userEntry.score : 0;
  };

  return (
    <div className="quiz-page">
      <ToastContainer />
      {countdown !== null ? (
        countdown > 0 ? (
          <Card title="Chuẩn bị" className="card-background">
            <h1 style={{ fontSize: '3rem' }}>Bắt đầu sau: {countdown} giây</h1>
          </Card>
        ) : (
          <Card className="card-background">
            <p>Đang tải câu hỏi...</p>
            <ProgressSpinner />
          </Card>
        )
      ) : question ? (
        <>
          <div className="quiz-container">
            <div className="quiz-content">
              <div className="quiz-text">
                <div className="quiz-question">{question.question}</div>
                <div className="quiz-timer">⏳ Thời gian còn lại: {timeLeft} giây</div>
              </div>
              {question.type === 'image' && question.imageUrl && (
                <div className="quiz-image">
                  <img
                    src={`${process.env.REACT_APP_IMAGE_URL}${question.imageUrl}`}
                    alt="Question"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="quiz-options">
            {question.options.map((option, index) => (
              <button
                key={index}
                className={`quiz-option-button option-${String.fromCharCode(97 + index)}`}
                onClick={() => handleAnswer(option)}
                disabled={!!selectedAnswer}
                style={selectedAnswer === option ? { opacity: 0.6 } : {}}
              >
                {String.fromCharCode(65 + index)}. {option}
              </button>
            ))}
          </div>
          {isCreator && (
            <Button
              label="Bỏ qua câu hỏi"
              icon="pi pi-forward"
              onClick={handleSkipQuestion}
              style={{ marginTop: '2rem' }}
              className="p-button-warning"
            />
          )}
        </>
      ) : showResults ? (
        <>
        <div className="quiz-container">
          <div className="quiz-content">
            <div className="quiz-text">
              <div className="quiz-question">{showResults.question}</div>
            </div>
            {showResults.type === 'image' && showResults.imageUrl && (
            <div className="quiz-image">
              <img
                src={`${process.env.REACT_APP_IMAGE_URL}${showResults.imageUrl}`}
                alt="Question"/>
              </div>
            )}
            </div>
          </div>
          <div className="quiz-options">
            {showResults.options.map((option, index) => (
              <button
                key={index}
                className={`quiz-option-button option-${String.fromCharCode(97 + index)}`}
                disabled
                style={getOptionStyle(option)}
              >
                {getOptionIcon(option)}
                {String.fromCharCode(65 + index)}. {option}
              </button>
            ))}
          </div>
        </>
      ) : showScores ? (
        <Card title="Bảng xếp hạng" className="card-background">
          <h3>Điểm số hiện tại</h3>
          <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            Bạn {currentUsername} đang có {getUserScore(showScores)} điểm!!!
          </div>
          <DataTable value={showScores} className="result-table" tableStyle={{ width: '100%' }}>
            <Column field="rank" header="Hạng" alignHeader="center" />
            <Column field="username" header="Người chơi" alignHeader="center" />
            <Column field="score" header="Điểm" alignHeader="center" />
          </DataTable>
        </Card>
      ) : leaderboard ? (
        <Card title="Kết quả cuối cùng" className="card-background">
          <h3>Chúc mừng!</h3>
          <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            Người chơi {currentUsername} đạt {getUserScore(leaderboard)} điểm!!!
          </div>
          <DataTable value={leaderboard} className="result-table" tableStyle={{ width: '100%' }}>
            <Column field="rank" header="Hạng" alignHeader="center" />
            <Column field="username" header="Người chơi" alignHeader="center" />
            <Column field="score" header="Điểm" alignHeader="center" />
          </DataTable>
          <Button
            label={isCreator ? 'Xóa phòng' : 'Về trang chủ'}
            onClick={isCreator ? handleDeleteRoom : handleBackToHome}
            style={{ marginTop: '2rem' }}
            className={isCreator ? 'p-button-danger' : ''}
          />
        </Card>
      ) : (
        <Card className="card-background">
          <p>Đang chờ bắt đầu...</p>
          <ProgressSpinner />
        </Card>
      )}
    </div>
  );
};

export default Quiz;