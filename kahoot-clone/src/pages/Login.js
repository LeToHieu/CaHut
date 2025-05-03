import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const toastRef = useRef(null);
  const navigate = useNavigate();

  const showToast = (message) => {
    if (toastRef.current) {
      toastRef.current.innerText = message;
      toastRef.current.classList.add('show');
      setTimeout(() => {
        toastRef.current.classList.remove('show');
      }, 3000);
    }
  };

  const handleLogin = async () => {
    if (email.trim() === '' || password.trim() === '') {
      showToast('Vui lòng nhập email hoặc mật khẩu');
      return;
    }

    const response = await fetch(process.env.REACT_APP_LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      navigate('/home');
    } else {
      showToast(data.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="auth-page">
      <div ref={toastRef} className="custom-toast"></div>

      <div className="auth-box">
        <h2 style={{ textAlign: 'center' }}>Welcome back</h2>

        <label className="auth-label">Email</label>
        <input
          type="email"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email"
        />

        <label className="auth-label">Mật khẩu</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
            style={{ paddingRight: '80px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '10px',
              top: '55%',
              transform: 'translateY(-50%)',
              border: 'none',
              background: 'none',
              color: '#10b981',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            {showPassword ? 'Ẩn' : 'Hiện'}
          </button>
        </div>

        <button className="auth-btn" onClick={handleLogin}>
          Đăng nhập
        </button>

        <p className="auth-footer">
          Chưa có tài khoản?{' '}
          <span className="auth-link" onClick={() => navigate('/register')}>
            Tạo ngay
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
