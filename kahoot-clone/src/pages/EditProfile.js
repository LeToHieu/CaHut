import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { toast, ToastContainer } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import '../css/Login.css'; // Sử dụng style từ Register.js

const EditProfile = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [userImage, setUserImage] = useState(1);
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const carouselRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const decoded = jwtDecode(token);
    setUsername(decoded.username);
    setUserImage(decoded.userImage || 1);
  }, [navigate]);

  const handleSaveProfile = async () => {
    if (!currentPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại để xác nhận!', { position: 'top-right', autoClose: 3000 });
      return;
    }
    if (!username) {
      toast.error('Vui lòng nhập tên người dùng!', { position: 'top-right', autoClose: 3000 });
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username, userImage, newPassword, currentPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        toast.success('Cập nhật profile thành công!', { position: 'top-right', autoClose: 3000 });
        navigate('/home');
      } else {
        toast.error(`Lỗi: ${data.message}`, { position: 'top-right', autoClose: 3000 });
      }
    } catch (err) {
      toast.error(`Lỗi khi cập nhật profile: ${err}`, { position: 'top-right', autoClose: 3000 });
    }
  };

  const scrollCarousel = (direction) => {
    const carousel = carouselRef.current;
    if (carousel) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="auth-page">
      <ToastContainer />
      <div className="auth-box">
        <h2 style={{ textAlign: 'center' }}>Chỉnh sửa Profile</h2>

        <label className="auth-label">Tên người dùng</label>
        <InputText
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nhập tên người dùng"
          className="auth-input"
        />

        <label className="auth-label">Hình ảnh</label>
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <button
            onClick={() => scrollCarousel('left')}
            style={{
              position: 'absolute',
              left: '0',
              top: '50%',
              transform: 'translateY(-50%)',
              border: 'none',
              background: 'none',
              fontSize: '24px',
              cursor: 'pointer',
            }}
          >
            &lt;
          </button>
          <div
            ref={carouselRef}
            style={{
              display: 'flex',
              overflowX: 'hidden',
              scrollBehavior: 'smooth',
              width: '100%',
              gap: '10px',
            }}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((imgNum) => (
              <div
                key={imgNum}
                style={{
                  minWidth: '100px',
                  height: '100px',
                  border: userImage === imgNum ? '3px solid #10b981' : '1px solid #ccc',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => setUserImage(imgNum)}
              >
                <img
                  src={require(`../res/${imgNum}.png`)}
                  alt={`User ${imgNum}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => scrollCarousel('right')}
            style={{
              position: 'absolute',
              right: '0',
              top: '50%',
              transform: 'translateY(-50%)',
              border: 'none',
              background: 'none',
              fontSize: '24px',
              cursor: 'pointer',
            }}
          >
            &gt;
          </button>
        </div>
        <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '20px' }}>
          Đang dùng: Hình {userImage}
        </div>

        <label className="auth-label">Mật khẩu mới (tùy chọn)</label>
        <div style={{ position: 'relative' }}>
          <InputText
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nhập mật khẩu mới"
            className="auth-input"
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

        <label className="auth-label">Mật khẩu hiện tại (bắt buộc)</label>
        <div style={{ position: 'relative' }}>
          <InputText
            type={showCurrentPassword ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Nhập mật khẩu hiện tại"
            className="auth-input"
            style={{ paddingRight: '40px' }}
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
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
            {showCurrentPassword ? 'Ẩn' : 'Hiện'}
          </button>
        </div>

        <button className="auth-btn" onClick={handleSaveProfile}>
          Lưu
        </button>

        <p className="auth-footer">
          <span className="auth-link" onClick={() => navigate('/home')}>
            Hủy
          </span>
        </p>
      </div>
    </div>
  );
};

export default EditProfile;