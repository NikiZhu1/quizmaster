import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Catalog from './pages/Catalog';
import Login from './pages/Login';
import Register from './pages/Register';
import QuizAttempt from './pages/QuizAttempt';
import QuizResult from './pages/QuizResult';
import HeaderComponent from './components/HeaderComponent';

const { Content } = Layout;

export default function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<Catalog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/quiz/:quizId" element={<QuizAttempt />} />
            <Route path="/quiz-result/:attemptId" element={<QuizResult />} />
            {/* Остальные роуты пока закомментированы */}
          </Routes>
      </Layout>
    </Router>
  );
}