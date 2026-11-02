import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UploadDataset from './pages/UploadDataset';
import DatasetHistory from './pages/DatasetHistory';
import Insights from './pages/Insights';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Help from './pages/Help';
import NotFound from './pages/NotFound';
import Visualize3D from './pages/Visualize3D';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected Authenticated Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/upload" element={<UploadDataset />} />
                            <Route path="/datasets" element={<DatasetHistory />} />
                            <Route path="/insights" element={<Insights />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/help" element={<Help />} />
                        </Route>
                        {/* Full-viewport 3D experience (no sidebar/navbar) */}
                        <Route path="/visualize" element={<Visualize3D />} />
                    </Route>

                    {/* 404 Catch-All */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
