import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await response.json();
    if (response.status === 201) {
      navigate('/login');
    } else {
      alert(data.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Đăng Ký</h2>
      <div className="p-field">
        <InputText placeholder="Tên đăng nhập" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div className="p-field">
        <InputText placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="p-field">
        <InputText placeholder="Mật khẩu" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <Button label="Đăng Ký" onClick={handleRegister} />
      <p>Đã có tài khoản? <a href="/login">Đăng nhập</a></p>
    </div>
  );
};

export default Register;