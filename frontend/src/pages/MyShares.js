import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MyShares = () => {
  const navigate = useNavigate();
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserShares = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/shares`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch shares');
      }

      const data = await response.json();
      setShares(data);
    } catch (error) {
      console.error('Error fetching shares:', error);
      setError('Failed to load your shares. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserShares();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading your shares...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <button className="button button-primary" onClick={fetchUserShares}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="my-shares-header">
        <h1>My Property Shares</h1>
      </div>

      {shares.length === 0 ? (
        <div className="no-shares">
          <p>You don't own any property shares yet.</p>
          <button className="button button-primary" onClick={() => navigate('/properties')}>
            Browse Properties
          </button>
        </div>
      ) : (
        <div className="shares-grid">
          {shares.map((share) => (
            <div key={share.properties.id} className="share-card">
              <div className="share-info">
                <h3>{share.properties.name}</h3>
                <p className="location">{share.properties.location}</p>
                <div className="share-stats">
                  <div className="stat">
                    <span className="label">Your Shares</span>
                    <span className="value">{share.shares}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Price per Share</span>
                    <span className="value">{share.properties.price_per_share} ETH</span>
                  </div>
                  <div className="stat">
                    <span className="label">Rental Yield</span>
                    <span className="value">{share.properties.rental_yield}%</span>
                  </div>
                </div>
                <div className="share-value">
                  <span className="label">Total Value</span>
                  <span className="value">
                    {(share.shares * share.properties.price_per_share).toFixed(4)} ETH
                  </span>
                </div>
              </div>
              <button 
                className="button button-primary"
                onClick={() => navigate(`/properties/${share.properties.id}`)}
              >
                View Property
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyShares; 