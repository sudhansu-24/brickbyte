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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {showSuccess && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{property.name}</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {property.type || 'Commercial'}
              </span>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{property.location}</p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{property.description}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Price per Share</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{property.price_per_share} ETH</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Available Shares</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{property.available_shares}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Your Shares</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{userShares}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Trade Shares</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={() => setIsBuying(true)}
                  className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isBuying ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setIsBuying(false)}
                  className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    !isBuying ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  Sell
                </button>
              </div>
              <div className="mt-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Number of Shares
                </label>
                <input
                  type="number"
                  id="amount"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  min="1"
                  max={isBuying ? property.available_shares : userShares}
                />
              </div>
              <div className="mt-4">
                <button
                  onClick={isBuying ? handleBuy : handleSell}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isBuying ? 'Buy Shares' : 'Sell Shares'}
                </button>
              </div>
            </div>
          </div>

          {valuationLoading ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading valuation...</p>
                </div>
              </div>
            </div>
          ) : (
            <ValuationCard valuation={valuation} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail; 