import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Pricing from './pages/Pricing';
import HowItWorks from './pages/HowItWorks';
import Dashboard from './pages/Dashboard';
import Scores from './pages/Scores';
import Charities from './pages/Charities';
import { DrawsList, DrawDetail } from './pages/Draws';
import Admin from './pages/Admin';

import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111916',
              color: '#e8f0eb',
              border: '1px solid #1e2e24',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#3ddc84', secondary: '#0a0f0d' } },
            error: { iconTheme: { primary: '#ff5c5c', secondary: '#0a0f0d' } },
          }}
        />

        {/* Navbar is hidden on admin routes */}
        <Routes>
          <Route path="/admin/*" element={null} />
          <Route path="*" element={<Navbar />} />
        </Routes>

        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/charities" element={<Charities />} />
          <Route path="/draws" element={<DrawsList />} />
          <Route path="/draws/:id" element={<DrawDetail />} />

          {/* Subscriber protected */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/scores" element={<ProtectedRoute><Scores /></ProtectedRoute>} />

          {/* Admin protected */}
          <Route path="/admin/*" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
