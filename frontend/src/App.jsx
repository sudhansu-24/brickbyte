import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Properties from './pages/Properties';
import CreateProperty from './pages/CreateProperty';
import PropertyDetail from './pages/PropertyDetail';
import Portfolio from './pages/Portfolio';
import './App.css';
import './styles/index.css';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">
            <Link to="/">BrickByte</Link>
          </div>
          <div className="nav-links">
            {isAuthenticated ? (
              <>
                <Link to="/properties">Properties</Link>
                <Link to="/portfolio">Portfolio</Link>
                <Link to="/create-property">Create Property</Link>
                <button 
                  className="button button-secondary"
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </nav>

        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/properties" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/properties" />} />
          <Route path="/properties" element={isAuthenticated ? <Properties /> : <Navigate to="/login" />} />
          <Route path="/portfolio" element={isAuthenticated ? <Portfolio /> : <Navigate to="/login" />} />
          <Route path="/create-property" element={isAuthenticated ? <CreateProperty /> : <Navigate to="/login" />} />
          <Route path="/properties/:id" element={isAuthenticated ? <PropertyDetail /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to="/properties" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 