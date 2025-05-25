import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (email.trim() === '' || password.trim() === '') {
      toast.error('Vui lòng nhập email hoặc mật khẩu', { autoClose: 3000 });
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
      toast.success('Đăng nhập thành công!', { autoClose: 3000 });
      navigate('/home');
    } else {
      toast.error(data.message || 'Đăng nhập thất bại', { autoClose: 3000 });
    }
  };

  return (
    <div className="auth-page">
      <ToastContainer position="top-right" />
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
              top: '60%',
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
          <br />
          <span className="auth-link" onClick={() => navigate('/reset-password')}>
            Quên mật khẩu?
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;