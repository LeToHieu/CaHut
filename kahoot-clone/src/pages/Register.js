import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/Login.css'; // dùng lại CSS từ Login

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (email.trim() === '' || password.trim() === '' || username.trim() === '') {
      toast.error('Vui lòng nhập đầy đủ thông tin', { autoClose: 3000 });
      return;
    }

    const response = await fetch(process.env.REACT_APP_REGISTER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await response.json();

    if (response.status === 201) {
      toast.success('Đăng ký thành công!', { autoClose: 3000 });
      navigate('/login');
    } else {
      toast.error(data.message || 'Đăng ký thất bại', { autoClose: 3000 });
    }
  };

  return (
    <div className="auth-page">
      <ToastContainer position="top-right" />
      <div className="auth-box">
        <h2 style={{ textAlign: 'center' }}>Tạo tài khoản</h2>

        <label className="auth-label">Tên đăng nhập</label>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Nhập tên đăng nhập"
          className="auth-input"
        />

        <label className="auth-label">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Nhập email"
          className="auth-input"
        />

        <label className="auth-label">Mật khẩu</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
            className="auth-input"
            style={{ paddingRight: '40px' }}
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

        <button className="auth-btn" onClick={handleRegister}>
          Đăng ký
        </button>

        <p className="auth-footer">
          Đã có tài khoản?{' '}
          <span className="auth-link" onClick={() => navigate('/login')}>
            Đăng nhập
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;