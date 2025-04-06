import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Properties from './pages/Properties';
import CreateProperty from './pages/CreateProperty';
import PropertyDetail from './pages/PropertyDetail';
import Portfolio from './pages/Portfolio';
import './App.css';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');
  console.log('App render - isAuthenticated:', isAuthenticated);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="text-xl font-bold text-indigo-600">
                  <img
                    src="/assets/logo1.png" 
                    alt="BrickByte Logo" 
                    width={140} 
                    height={40} 
                    style={{
                      width: 140,
                      height: 40,
                    }}
                    priority
                    className="invert dark:invert-100 transition-all duration-300"
                  />
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <>
                    <a
  href="https://bb-v1.vercel.app/#insights"
  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
  target="_blank"  // optional: remove if you don't want a new tab
  rel="noopener noreferrer" // for security if opening in new tab
>
  Market-Insights
</a>
                    <Link to="/properties" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                      Properties
                    </Link>
                    <Link to="/portfolio" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                      Portfolio
                    </Link>
                    <Link to="/create-property" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                      Create Property
                    </Link>
                    <button
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                      }}
                      className="text-gray-700 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium bg-red-600 text-white"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                      Login
                    </Link>
                    <Link to="/register" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route 
              path="/login" 
              element={
                !isAuthenticated ? (
                  <Login />
                ) : (
                  <Navigate to="/properties" replace />
                )
              } 
            />
            <Route 
              path="/register" 
              element={
                !isAuthenticated ? (
                  <Register />
                ) : (
                  <Navigate to="/properties" replace />
                )
              } 
            />
            <Route 
              path="/properties" 
              element={
                isAuthenticated ? (
                  <Properties />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/portfolio" 
              element={
                isAuthenticated ? (
                  <Portfolio />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/create-property" 
              element={
                isAuthenticated ? (
                  <CreateProperty />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/properties/:id" 
              element={
                isAuthenticated ? (
                  <PropertyDetail />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route path="/" element={<Navigate to="/properties" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;