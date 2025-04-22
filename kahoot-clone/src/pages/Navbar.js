import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left" onClick={() => navigate('/home')}>
        🎮 Quiz Game
      </div>
      <div className="navbar-right">
        <button className="nav-btn" onClick={handleLogout}>Đăng xuất</button>
      </div>
    </nav>
  );
};

export default Navbar;