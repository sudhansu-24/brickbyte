import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import RealEstateToken from '../contracts/RealEstateToken.json';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
const SEPOLIA_RPC_URL = process.env.REACT_APP_SEPOLIA_RPC_URL;

const CreateProperty = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    imageUri: '',
    totalShares: '',
    pricePerShare: '',
    rentalYield: '',
    type: 'Commercial'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTransactionPending, setIsTransactionPending] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const createPropertyInDatabase = async (propertyData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(propertyData)
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to create property');
    }

    return response.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setIsTransactionPending(true);

      // Validate form data
      if (!formData.name || !formData.location || !formData.description || 
          !formData.imageUri || !formData.totalShares || !formData.pricePerShare || 
          !formData.rentalYield) {
        throw new Error('Please fill in all fields');
      }

      // Convert values to appropriate types
      const totalShares = parseInt(formData.totalShares);
      const pricePerShare = ethers.parseEther(formData.pricePerShare);
      const rentalYield = parseInt(formData.rentalYield);

      // Validate numeric values
      if (isNaN(totalShares) || totalShares <= 0) {
        throw new Error('Total shares must be a positive number');
      }
      if (isNaN(rentalYield) || rentalYield < 0 || rentalYield > 100) {
        throw new Error('Rental yield must be between 0 and 100');
      }

      if (!window.ethereum) {
        throw new Error('Please install MetaMask!');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      if (!CONTRACT_ADDRESS) {
        throw new Error('Smart contract address not configured');
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        RealEstateToken.abi,
        signer
      );

      // Create property on blockchain
      const tx = await contract.listProperty(
        formData.name,
        formData.location,
        formData.description,
        formData.imageUri,
        totalShares,
        pricePerShare,
        rentalYield
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      // Get the property ID from the transaction logs
      const propertyId = receipt.logs[0].topics[1]; // The property ID is in the first topic of the event log

      // Create property in database
      await createPropertyInDatabase({
        name: formData.name,
        location: formData.location,
        description: formData.description,
        image_url: formData.imageUri,
        total_shares: Number(totalShares),
        available_shares: Number(totalShares), // Initially all shares are available
        price_per_share: Number(ethers.formatEther(pricePerShare)),
        rental_yield: Number(rentalYield),
        contract_address: CONTRACT_ADDRESS,
        blockchain_property_id: propertyId, // Store the blockchain property ID
        owner_id: JSON.parse(localStorage.getItem('user')).id,
        type: formData.type
      });

      navigate('/properties');
    } catch (err) {
      console.error('Error creating property:', err);
      if (err.message.includes('user rejected transaction')) {
        setError('Transaction was rejected by user');
      } else if (err.message.includes('insufficient funds')) {
        setError('Insufficient funds to complete the transaction');
      } else {
        setError(err.message || 'Failed to create property');
      }
    } finally {
      setLoading(false);
      setIsTransactionPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">List a New Property</h1>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
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
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Property Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Property Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="Commercial">Commercial</option>
                    <option value="Residential">Residential</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="imageUri" className="block text-sm font-medium text-gray-700">
                    Image URL
                  </label>
                  <input
                    type="url"
                    id="imageUri"
                    name="imageUri"
                    value={formData.imageUri}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label htmlFor="totalShares" className="block text-sm font-medium text-gray-700">
                    Total Shares
                  </label>
                  <input
                    type="number"
                    id="totalShares"
                    name="totalShares"
                    value={formData.totalShares}
                    onChange={handleChange}
                    min="1"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="pricePerShare" className="block text-sm font-medium text-gray-700">
                    Price per Share (ETH)
                  </label>
                  <input
                    type="number"
                    id="pricePerShare"
                    name="pricePerShare"
                    value={formData.pricePerShare}
                    onChange={handleChange}
                    step="0.0001"
                    min="0.0001"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="rentalYield" className="block text-sm font-medium text-gray-700">
                    Rental Yield (%)
                  </label>
                  <input
                    type="number"
                    id="rentalYield"
                    name="rentalYield"
                    value={formData.rentalYield}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || isTransactionPending}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading || isTransactionPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isTransactionPending ? 'Processing Transaction...' : 'Creating Property...'}
                    </>
                  ) : (
                    'List Property'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProperty; 