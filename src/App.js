import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Catalog from './pages/Catalog';
import HeaderComponent from './components/HeaderComponent';

const { Content } = Layout;

export default function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <HeaderComponent />
        <Content style={{ padding: '24px 50px' }}>
          <Routes>
            <Route path="/" element={<Catalog />} />
            {/* Остальные роуты пока закомментированы */}
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}