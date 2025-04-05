import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/portfolio.css';
import { getPropertyValuation } from '../services/valuationService';

const Portfolio = () => {
  const [activeTab, setActiveTab] = useState('properties');
  const [userShares, setUserShares] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [propertyValuations, setPropertyValuations] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserShares();
    fetchTransactions();
  }, []);

  const fetchUserShares = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/user/shares`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      console.log('Raw user shares response:', data);
      if (data && data.length > 0) {
        console.log('First share data:', {
          shares: data[0].shares,
          propertyDetails: data[0].properties,
          imageUrl: data[0].properties?.image_url,
          fullProperties: JSON.stringify(data[0].properties, null, 2)
        });
      }
      
      setUserShares(data);

      // Fetch valuations for all properties
      const valuations = {};
      for (const share of data) {
        if (share.properties) {
          const valuation = await fetchPropertyValuation(share.properties);
          if (valuation) {
            valuations[share.properties.id] = valuation;
          }
        }
      }
      setPropertyValuations(valuations);
    } catch (err) {
      setError('Failed to fetch portfolio data');
      console.error('Error fetching user shares:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      console.log('Fetching transactions...');
      const response = await fetch(`http://localhost:3001/api/transactions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transactions');
      }
      
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transactions');
    }
  };

  const fetchPropertyValuation = async (property) => {
    try {
      const propertyData = {
        sqft: parseInt(property.size || property.square_feet || 1500),
        property_type: (property.type || 'residential').toLowerCase(),
        location_grade: determineLocationGrade(property.price_per_share),
        address: property.location || ''
      };
      const valuationData = await getPropertyValuation(propertyData);
      return valuationData;
    } catch (error) {
      console.error('Error fetching valuation for property:', property.id, error);
      return null;
    }
  };

  const determineLocationGrade = (pricePerShare) => {
    if (!pricePerShare) return 'good';
    const price = parseFloat(pricePerShare);
    if (price >= 1.0) return 'prime';
    if (price >= 0.5) return 'good';
    if (price >= 0.2) return 'average';
    return 'developing';
  };

  const handleSell = (propertyId) => {
    navigate(`/properties/${propertyId}`);
  };

  const handleStake = (propertyId) => {
    // To be implemented later
    console.log('Staking functionality coming soon');
  };

  const calculateTotalValue = () => {
    return userShares.reduce((total, share) => 
      total + (share.shares * share.properties.price_per_share), 0
    );
  };

  const calculateMonthlyIncome = () => {
    return userShares.reduce((total, share) => 
      total + (share.shares * share.properties.rental_income / share.properties.total_shares), 0
    );
  };

  const PropertiesTab = () => {
    console.log('Rendering PropertiesTab with userShares:', userShares);
    return (
      <div className="properties-grid">
        {userShares.map((share) => {
          console.log('Property data for card:', share.properties);
          const imageUrl = share.properties?.image_url || 'https://placehold.co/400x300';
          return (
            <div key={share.properties.id} className="property-card">
              <div className="property-image">
                <img 
                  src={imageUrl}
                  alt={share.properties.name}
                  onError={(e) => {
                    console.error('Image failed to load:', e.target.src);
                    e.target.src = 'https://placehold.co/400x300';
                    e.target.onerror = null; // Prevent infinite loop if placeholder also fails
                  }}
                />
              </div>
              <div className="property-details">
                <h3>{share.properties.name}</h3>
                <p className="property-id">Property ID: #{share.properties.id}</p>
                
                <div className="property-stats">
                  <div className="stat">
                    <span className="label">Token Value</span>
                    <span className="value">$ {(share.shares * share.properties.price_per_share).toFixed(2)}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Monthly Income</span>
                    <span className="value">$ {(share.shares * share.properties.rental_income / share.properties.total_shares).toFixed(2)}</span>
                  </div>
                </div>

                <div className="ai-prediction">
                  <span className="label">AI Predicted ROI</span>
                  <span className="value roi">
                    {propertyValuations[share.properties.id] ? 
                      `+${propertyValuations[share.properties.id].predicted_roi}%` : 
                      `+${share.properties.rental_yield}%`
                    }
                  </span>
                </div>

                <div className="property-actions">
                  <button className="btn-sell" onClick={() => handleSell(share.properties.id)}>Sell Now</button>
                  <button className="btn-stake" onClick={() => handleStake(share.properties.id)}>Stake</button>
                </div>
              </div>
            </div>
          );
        })}
        {userShares.length === 0 && (
          <div className="no-properties">
            <p>You don't own any property shares yet.</p>
            <button onClick={() => navigate('/properties')} className="btn-primary">Browse Properties</button>
          </div>
        )}
      </div>
    );
  };

  const PerformanceTab = () => (
    <div className="performance-section">
      <h2>Portfolio Performance</h2>
      <p className="subtitle">Track your overall investment performance</p>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Value</h3>
          <div className="value">$ {calculateTotalValue().toFixed(2)}</div>
          <div className="change">+0% from initial investment</div>
        </div>
        
        <div className="metric-card">
          <h3>Monthly Income</h3>
          <div className="value">$ {calculateMonthlyIncome().toFixed(2)}</div>
          <div className="subtitle">Passive rental income</div>
        </div>
        
        <div className="metric-card">
          <h3>Staking Rewards</h3>
          <div className="value">$ 0.00</div>
          <div className="subtitle">From staked property tokens</div>
        </div>
      </div>
    </div>
  );

  const TransactionsTab = () => (
    <div className="transactions-section">
      <h2>Recent Transactions</h2>
      <p className="subtitle">Your recent property investment activities</p>
      
      <div className="transactions-list">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="transaction-item">
            <div className="transaction-icon">
              {transaction.type === 'BUY' ? '🔵' : '🔴'}
            </div>
            <div className="transaction-details">
              <div className="transaction-title">
                {transaction.type === 'BUY' ? 'Purchased' : 'Sold'} Tokens
              </div>
              <div className="transaction-property">{transaction.properties.name}</div>
            </div>
            <div className="transaction-amount">
              {transaction.shares} shares @ {transaction.price_per_share} ETH
            </div>
            <div className="transaction-date">
              {new Date(transaction.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <div className="no-transactions">
            <p>No transactions yet.</p>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return <div className="loading">Loading portfolio...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="portfolio-container">
      <div className="portfolio-header">
        <h1>Your Portfolio</h1>
        <p className="subtitle">Manage your property investments and track your returns in real-time.</p>
      </div>

      <div className="portfolio-tabs">
        <button 
          className={`tab ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          Properties
        </button>
        <button 
          className={`tab ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          Performance
        </button>
        <button 
          className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'properties' && <PropertiesTab />}
        {activeTab === 'performance' && <PerformanceTab />}
        {activeTab === 'transactions' && <TransactionsTab />}
      </div>
    </div>
  );
};

export default Portfolio; 