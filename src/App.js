import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Catalog from './pages/Catalog.jsx';

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Catalog />} />
                {/* <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Navigate to="/dashboard/activities" replace />} />
                <Route path="/dashboard/:activeTab?" element={<Dashboard />} />
                <Route path="/dashboard/projects/:projectId" element={<Dashboard />} />   */}
            </Routes>
        </Router>
    );
};