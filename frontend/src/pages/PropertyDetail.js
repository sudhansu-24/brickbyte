import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import RealEstateToken from '../contracts/RealEstateToken.json';
import ValuationCard from '../components/ValuationCard';
import { getPropertyValuation } from '../services/valuationService';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [userShares, setUserShares] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactionAmount, setTransactionAmount] = useState('');
  const [isBuying, setIsBuying] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [valuation, setValuation] = useState(null);
  const [valuationLoading, setValuationLoading] = useState(true);

  useEffect(() => {
    fetchPropertyDetails();
    fetchUserShares();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/properties/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      console.log('Property Data Received:', data); // Debug log
      setProperty(data);
      
      // Fetch valuation after getting property details
      try {
        setValuationLoading(true);
        // Map the property data to the format expected by the valuation API
        const propertyData = {
          sqft: parseInt(data.size || data.square_feet || 1500), // Convert to number and provide fallback
          property_type: (data.type || 'residential').toLowerCase(), // Use type field and provide fallback
          location_grade: determineLocationGrade(data.price_per_share), // Determine grade based on price
          address: data.location || ''
        };
        
        console.log('Sending valuation request with:', propertyData); // Debug log
        const valuationData = await getPropertyValuation(propertyData);
        console.log('Received valuation data:', valuationData); // Debug log
        setValuation(valuationData);
      } catch (valError) {
        console.error('Error fetching valuation:', valError);
      } finally {
        setValuationLoading(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine location grade based on price per share
  const determineLocationGrade = (pricePerShare) => {
    if (!pricePerShare) return 'good';
    const price = parseFloat(pricePerShare);
    if (price >= 1.0) return 'prime';
    if (price >= 0.5) return 'good';
    if (price >= 0.2) return 'average';
    return 'developing';
  };

  const fetchUserShares = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/user/shares`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      console.log('Fetched user shares data:', data);
      console.log('Current property ID:', id);
      
      const propertyShares = data.find(share => share.properties.id === id);
      console.log('Found property shares:', propertyShares);
      
      const shares = propertyShares ? propertyShares.shares : 0;
      console.log('Setting user shares to:', shares);
      setUserShares(shares);
    } catch (err) {
      console.error('Error fetching user shares:', err);
    }
  };

  const handleBuy = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask to buy shares');
        return;
      }

      const amount = parseInt(transactionAmount);
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid number of shares');
        return;
      }

      if (amount > property.available_shares) {
        alert('Not enough shares available');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        process.env.REACT_APP_CONTRACT_ADDRESS,
        RealEstateToken.abi,
        signer
      );

      const totalCost = ethers.parseEther((property.price_per_share * amount).toString());
      const tx = await contract.purchaseShares(property.blockchain_property_id, amount, { value: totalCost });
      await tx.wait();

      // Record transaction in backend
      const response = await fetch(`http://localhost:3001/api/properties/${id}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ shares: amount })
      });

      if (!response.ok) {
        throw new Error('Failed to record transaction');
      }

      setSuccessMessage(`Successfully purchased ${amount} shares!`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      
      // Refresh data
      fetchPropertyDetails();
      fetchUserShares();
      setTransactionAmount('');
    } catch (error) {
      console.error('Error buying shares:', error);
      alert('Failed to buy shares. Please try again.');
    }
  };

  const handleSell = async () => {
    try {
      console.log('Starting sell process...');
      
      if (!window.ethereum) {
        alert('Please install MetaMask to sell shares');
        return;
      }

      const amount = parseInt(transactionAmount);
      console.log('Amount to sell:', amount);
      console.log('User shares:', userShares);
      console.log('Property:', property);
      console.log('Amount type:', typeof amount);
      console.log('User shares type:', typeof userShares);
      console.log('Comparison:', amount > userShares);

      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid number of shares');
        return;
      }

      if (amount > userShares) {
        console.log('Share comparison failed:', {
          amount,
          userShares,
          comparison: amount > userShares
        });
        alert('Not enough shares to sell');
        return;
      }

      if (!property.blockchain_property_id) {
        console.error('No blockchain property ID found');
        alert('Property not properly configured for blockchain transactions');
        return;
      }

      console.log('Connecting to MetaMask...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        process.env.REACT_APP_CONTRACT_ADDRESS,
        RealEstateToken.abi,
        signer
      );

      console.log('Calling sellShares on contract...');
      console.log('Contract address:', process.env.REACT_APP_CONTRACT_ADDRESS);
      console.log('Property ID:', property.blockchain_property_id);
      
      // Convert the blockchain_property_id to a BigInt using ethers
      const propertyId = ethers.getBigInt(property.blockchain_property_id);
      
      const tx = await contract.sellShares(propertyId, amount);
      console.log('Transaction sent:', tx.hash);
      
      await tx.wait();
      console.log('Transaction confirmed');

      console.log('Recording transaction in backend...');
      const response = await fetch(`http://localhost:3001/api/properties/${id}/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ shares: amount })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error:', errorData);
        throw new Error(errorData.error || 'Failed to record transaction');
      }

      setSuccessMessage(`Successfully sold ${amount} shares!`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      
      // Refresh data
      fetchPropertyDetails();
      fetchUserShares();
      setTransactionAmount('');
    } catch (error) {
      console.error('Error selling shares:', error);
      alert(`Failed to sell shares: ${error.message}`);
    }
  };

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container">Error: {error}</div>;
  if (!property) return <div className="container">Property not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="property-detail">
        <div className="property-header">
          <h1 className="text-3xl font-bold mb-2">{property.name}</h1>
          <p className="text-gray-600">{property.location}</p>
        </div>

        <div className="property-image mb-8">
          <img 
            src={property.image_url} 
            alt={property.name}
            className="w-full h-[400px] object-cover rounded-lg shadow-lg" 
          />
        </div>

        {/* AI Valuation Section */}
        <div className="mb-8">
          {valuationLoading ? (
            <div className="loading-valuation">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ValuationCard valuation={valuation} />
          )}
        </div>

        <div className="property-description mb-8">
          <h2 className="text-2xl font-semibold mb-4">About this Property</h2>
          <p className="text-gray-700">{property.description}</p>
        </div>

        <div className="property-stats">
          <div className="stat">
            <span className="label">Price per Share</span>
            <span className="value">{property.price_per_share} ETH</span>
          </div>
          <div className="stat">
            <span className="label">Total Shares</span>
            <span className="value">{property.total_shares}</span>
          </div>
          <div className="stat">
            <span className="label">Available Shares</span>
            <span className="value">{property.available_shares}</span>
          </div>
          <div className="stat">
            <span className="label">Your Shares</span>
            <span className="value">{userShares}</span>
          </div>
          <div className="stat">
            <span className="label">Rental Yield</span>
            <span className="value">{property.rental_yield}%</span>
          </div>
        </div>

        {showSuccess && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        <div className="transaction-form">
          <h2>{isBuying ? 'Buy' : 'Sell'} Shares</h2>
          <div className="form-group">
            <label>Number of Shares:</label>
            <input
              type="number"
              value={transactionAmount}
              onChange={(e) => setTransactionAmount(e.target.value)}
              min="1"
              max={isBuying ? property.available_shares : userShares}
            />
          </div>
          {isBuying && (
            <div className="form-group">
              <label>Total Cost:</label>
              <span>
                {transactionAmount ? (property.price_per_share * parseInt(transactionAmount)).toFixed(4) : '0'} ETH
              </span>
            </div>
          )}
          <div className="button-group">
            <button
              className={`toggle-button ${isBuying ? 'active' : ''}`}
              onClick={() => setIsBuying(true)}
            >
              Buy
            </button>
            <button
              className={`toggle-button ${!isBuying ? 'active' : ''}`}
              onClick={() => setIsBuying(false)}
            >
              Sell
            </button>
            <button
              className="action-button"
              onClick={isBuying ? handleBuy : handleSell}
              disabled={!transactionAmount || parseInt(transactionAmount) <= 0}
            >
              {isBuying ? 'Buy Shares' : 'Sell Shares'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail; 