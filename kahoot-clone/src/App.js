import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import EditExam from './pages/EditExam';
import Room from './pages/Room';
import Quiz from './pages/Quiz';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const App = () =>{
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={<Home />} />
                <Route path="/edit-exam/:examName/:examId" element={<EditExam />} />
                <Route path="/quiz/:roomId" element={<Quiz />} />
                <Route path="/room/:roomId" element={<Room />} />
            </Routes>
        </Router>
    );
}

export default App;
