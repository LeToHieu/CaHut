import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/Login.css';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async () => {
    if (!email) {
      toast.error('Vui lòng nhập email', { autoClose: 3000 });
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Mã đã được gửi qua email!', { autoClose: 3000 });
      } else {
        toast.error(data.message || 'Không thể gửi mã', { autoClose: 3000 });
      }
    } catch (err) {
      toast.error('Lỗi khi gửi mã: ' + err.message, { autoClose: 3000 });
    }
  };

  const handleResetPassword = async () => {
    if (!code || !newPassword || !confirmPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin', { autoClose: 3000 });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp', { autoClose: 3000 });
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Đặt lại mật khẩu thành công!', { autoClose: 3000 });
        setTimeout(() => navigate('/login'), 1000);
      } else {
        toast.error(data.message || 'Đặt lại mật khẩu thất bại', { autoClose: 3000 });
      }
    } catch (err) {
      toast.error('Lỗi khi đặt lại mật khẩu: ' + err.message, { autoClose: 3000 });
    }
  };

  return (
    <div className="auth-page">
      <ToastContainer position="top-right" />
      <div className="auth-box">
        <h2 style={{ textAlign: 'center' }}>Đặt lại mật khẩu</h2>
        <label className="auth-label">Nhập Email của bạn</label>
        <div style={{ position: 'relative' }}>
          <input
            type="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập Email"
            style={{ paddingRight: '40px' }}
          />
          <button
            type="button"
            onClick={handleSendCode}
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
            {'Gửi mã'}
          </button>
        </div>

        <label className="auth-label">Mã xác nhận</label>
        <input
          type="text"
          className="auth-input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Nhập mã xác nhận"
        />

        <label className="auth-label">Mật khẩu mới</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showNewPassword ? 'text' : 'password'}
            className="auth-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nhập mật khẩu mới"
            style={{ paddingRight: '40px' }}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
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
            {showNewPassword ? 'Ẩn' : 'Hiện'}
          </button>
        </div>

        <label className="auth-label">Xác nhận mật khẩu mới</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            className="auth-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Xác nhận mật khẩu mới"
            style={{ paddingRight: '40px' }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
            {showConfirmPassword ? 'Ẩn' : 'Hiện'}
          </button>
        </div>

        <button className="auth-btn" onClick={handleResetPassword}>
          Xác nhận
        </button>

        <p className="auth-footer">
          <span className="auth-link" onClick={() => navigate('/login')}>
            Quay lại đăng nhập
          </span>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;