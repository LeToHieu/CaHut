import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { toast, ToastContainer } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import io from 'socket.io-client';
import 'react-toastify/dist/ReactToastify.css';
import '../css/Home.css'; // Dùng lại Home.css chung

const socket = io('http://localhost:5000');

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isCreator, setIsCreator] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    socket.emit('join-room', { roomId, token });

    socket.on('room-update', (data) => {
      setUsers(data.users || []);
      const decoded = jwtDecode(token);
      setIsCreator(decoded.id === data.creatorId);
    });

    socket.on('game-started', () => {
      setGameStarted(true);
      navigate(`/quiz/${roomId}`);
      toast.success('Trò chơi đã bắt đầu!', { position: 'top-right', autoClose: 3000 });
    });

    socket.on('room-deleted', () => {
      navigate('/home', { state: { showToast: true, toastMessage: 'Phòng đã bị xóa!', toastType: 'info' } });
    });

    socket.on('error', (data) => {
      toast.error(data.message, { position: 'top-right', autoClose: 3000 });
      navigate('/home');
    });

    return () => {
      socket.off('room-update');
      socket.off('game-started');
      socket.off('room-deleted');
      socket.off('error');
    };
  }, [roomId, navigate]);

  const handleStartGame = () => {
    const token = localStorage.getItem('token');
    socket.emit('start-game', { roomId, token });
  };

  const handleDeleteRoom = () => {
    const token = localStorage.getItem('token');
    socket.emit('delete-room', { roomId, token });
    navigate('/home', { state: { showToast: true, toastMessage: 'Phòng đã bị xóa!', toastType: 'info' } });
  };

  const handleLeaveRoom = () => {
    const token = localStorage.getItem('token');
    socket.emit('leave-room', { roomId, token });
    navigate('/home', { state: { showToast: true, toastMessage: 'Bạn đã rời phòng!', toastType: 'info' } });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ backgroundColor: '#19444a', padding: '2rem', borderRadius: '24px', width: '90%', maxWidth: '400px', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '2rem', color: '#fffae6', marginBottom: '0.5rem' }}>Bạn đã tham gia với mã PIN:</h1>
        <h2 style={{ fontSize: '3rem', color: '#98ff90', margin: '1rem 0' }}>{roomId}</h2>

        <p style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>{users.length} người chơi</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          {users.map((user, idx) => (
            <div key={idx} style={{ backgroundColor: '#00b074', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold' }}>
              {user.username}
            </div>
          ))}
        </div>

        {isCreator && !gameStarted ? (
          <>
            <Button
              label="Bắt đầu"
              className="quiz-button"
              style={{ width: '100%', marginBottom: '1rem', backgroundColor: '#00b074', borderColor: 'black', borderRadius: '20px' }}
              onClick={handleStartGame}
            />
            <Button
              label="Xóa phòng"
              className="quiz-button"
              style={{ width: '100%', backgroundColor: '#f87171', borderColor: 'black', borderRadius: '20px' }}
              onClick={handleDeleteRoom}
            />
          </>
        ) : (
          <Button
            label="Thoát phòng"
            className="quiz-button"
            style={{ width: '100%', backgroundColor: '#f59e0b', borderColor: 'black', borderRadius: '20px' }}
            onClick={handleLeaveRoom}
          />
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default Room;
