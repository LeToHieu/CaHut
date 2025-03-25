import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      navigate('/home');
    } else {
      alert(data.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Đăng Nhập</h2>
      <div className="p-field">
        <InputText placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="p-field">
        <InputText placeholder="Mật khẩu" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <Button label="Đăng Nhập" onClick={handleLogin} />
      <p>Chưa có tài khoản? <a href="/register">Đăng ký</a></p>
    </div>
  );
};

export default Login;