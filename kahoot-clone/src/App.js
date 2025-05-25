import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import EditExam from './pages/EditExam';
import Room from './pages/Room';
import Quiz from './pages/Quiz';
import EditProfile from './pages/EditProfile';
import ResetPassword from './pages/ResetPassword';
import BotController from './pages/BotController';

import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './css/Login.css';

const App = () =>{
    return (
    <div className="float-background" style={{width: '100%'}}>
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/bot-controller" element={<BotController />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/home" element={<Home />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/edit-exam/:examName/:examId" element={<EditExam />} />
                <Route path="/quiz/:roomId" element={<Quiz />} />
                <Route path="/room/:roomId" element={<Room />} />
            </Routes>
        </Router>
    </div>
    );
}

export default App;
