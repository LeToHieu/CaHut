import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import {jwtDecode} from 'jwt-decode';
import { toast, ToastContainer } from 'react-toastify'; // Thêm Toastify
import 'react-toastify/dist/ReactToastify.css'; // CSS của Toastify

const socket = io('http://localhost:5000');

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState(roomId);
  const [users, setUsers] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [isCreator, setIsCreator] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');

    socket.emit('join-room', { roomId, token });

    socket.on('room-update', (data) => {
      console.log('Room update:', data);
      setUsers(data.users || []);
      setUserCount(data.users ? data.users.length : 0);
      const decoded = jwtDecode(token);
      setIsCreator(decoded.id === data.creatorId);
    });

    socket.on('game-started', () => {
      setGameStarted(true);
      navigate(`/quiz/${roomId}`);
      toast.success('Trò chơi đã bắt đầu!', {
        position: 'top-right',
        autoClose: 3000,
      });
    });

    socket.on('room-deleted', () => {
      navigate('/home', { state: { showToast: true, toastMessage: 'Phòng đã bị xóa!', toastType: 'info' } });
    });

    socket.on('error', (data) => {
      toast.error(data.message, {
        position: 'top-right',
        autoClose: 3000,
      });
      navigate('/home');
    });

    return () => {
      socket.off('room-update');
      socket.off('game-started');
      socket.off('room-deleted');
      socket.off('error');
    };
  }, [roomId, navigate]);

  const handleLeaveRoom = () => {
    const token = localStorage.getItem('token');
    socket.emit('leave-room', { roomId, token });
    navigate('/home', { state: { showToast: true, toastMessage: 'Bạn đã rời phòng!', toastType: 'info' } });
  };

  const handleDeleteRoom = () => {
    const token = localStorage.getItem('token');
    socket.emit('delete-room', { roomId, token });
    navigate('/home', { state: { showToast: true, toastMessage: 'Phòng đã bị xóa!', toastType: 'info' } });
  };

  const handleStartGame = () => {
    const token = localStorage.getItem('token');
    socket.emit('start-game', { roomId, token });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Sảnh chờ</h2>
      <p>Mã phòng: <strong>{roomCode}</strong></p>
      <p>Số người trong phòng: <strong>{userCount}</strong></p>

      <h3>Danh sách người dùng trong phòng:</h3>
      <DataTable value={users} tableStyle={{ minWidth: '30rem' }}>
        <Column field="username" header="Tên người dùng" />
      </DataTable>

      {isCreator && !gameStarted && (
        <>
          <Button
            label="Start Game"
            icon="pi pi-play"
            onClick={handleStartGame}
            style={{ marginTop: '20px', marginRight: '10px' }}
          />
          <Button
            label="Xóa phòng"
            icon="pi pi-trash"
            className="p-button-danger"
            onClick={handleDeleteRoom}
            style={{ marginTop: '20px', marginRight: '10px' }}
          />
        </>
      )}

      {!isCreator && (
        <Button
          label="Thoát phòng"
          icon="pi pi-sign-out"
          onClick={handleLeaveRoom}
          style={{ marginTop: '20px' }}
        />
      )}

      <ToastContainer /> {/* Thêm ToastContainer để hiển thị toast */}
    </div>
  );
};

export default Room;