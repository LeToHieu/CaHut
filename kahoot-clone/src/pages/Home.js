import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Chào mừng bạn đến với trang chính!</h2>
      <button onClick={() => {
        localStorage.removeItem('token');
        navigate('/login');
      }}>Đăng Xuất</button>
    </div>
  );
};

export default Home;