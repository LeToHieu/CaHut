import React, { useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const BASE_URL = 'https://cahut-be.onrender.com';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

const BotController = () => {
  const [botCount, setBotCount] = useState(10);
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const createSingleBot = async (i) => {
    try {
      const email = `bot${Date.now()}_${i}@bot.com`;
      const username = `Bot_${Math.floor(Math.random() * 10000)}`;
      const password = '123456';

      // 1. Đăng ký
      await axios.post(`${BASE_URL}/api/auth/register`, { username, email, password });

      // 2. Đăng nhập
      const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, { email, password });
      const token = loginRes.data.token;

      // 3. Tham gia phòng
      await axios.post(`${BASE_URL}/api/room/join`, { roomId }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 4. Kết nối socket
        const socket = io(BASE_URL.replace('/api', ''), {
        transports: ['websocket'],
        });

        socket.on('connect', () => {
        socket.emit('join-room', { roomId, token });

        socket.on('next-question', (data) => {
            const question = data.question;
            if (!question || !question.options) return;

            const randomOptionIndex = Math.floor(Math.random() * question.options.length);
            const answer = question.options[randomOptionIndex];

            const delayMs = 1000 + Math.random() * 1500;
            setTimeout(() => {
            socket.emit('submit-answer', {
                roomId,
                answer,
                score: 1000,
                token,
            });
            }, delayMs);
        });
        });

    } catch (err) {
      console.error(`Bot ${i} failed:`, err?.response?.data || err.message);
    }
  };

  const createBots = async () => {
    if (!roomId) {
      alert("Vui lòng nhập Room ID.");
      return;
    }

    setIsLoading(true);

    const batchSize = 20; // Tối đa mỗi đợt
    for (let i = 0; i < botCount; i += batchSize) {
      const batch = [];
      for (let j = 0; j < batchSize && i + j < botCount; j++) {
        batch.push(createSingleBot(i + j));
      }

      await Promise.all(batch);
      await delay(1000); // nghỉ giữa các đợt để tránh overload
    }

    setIsLoading(false);
  };

  return (
    <div className="p-6 max-w-md mx-auto border rounded shadow bg-white">
      <h1 className="text-xl font-bold mb-4">Tạo Bot Hỏi Đáp</h1>

      <label className="block mb-2">Số lượng bot:</label>
      <input
        type="number"
        value={botCount}
        onChange={(e) => setBotCount(parseInt(e.target.value))}
        className="w-full mb-4 px-3 py-2 border rounded"
      />

      <label className="block mb-2">Room ID (6 chữ số):</label>
      <input
        type="text"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="w-full mb-4 px-3 py-2 border rounded"
      />

      <button
        onClick={createBots}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {isLoading ? 'Đang tạo bot...' : 'Tạo bot và tham gia phòng'}
      </button>
    </div>
  );
};

export default BotController;
