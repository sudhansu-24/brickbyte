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

    const response = await fetch('http://localhost:3001/api/properties', {
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
    <div className="create-property">
      <h1>List a New Property</h1>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="property-form">
        <div className="form-group">
          <label htmlFor="name">Property Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">Property Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="Commercial">Commercial</option>
            <option value="Residential">Residential</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="imageUri">Image URL</label>
          <input
            type="url"
            id="imageUri"
            name="imageUri"
            value={formData.imageUri}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="totalShares">Total Shares</label>
          <input
            type="number"
            id="totalShares"
            name="totalShares"
            value={formData.totalShares}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="pricePerShare">Price per Share (ETH)</label>
          <input
            type="number"
            id="pricePerShare"
            name="pricePerShare"
            value={formData.pricePerShare}
            onChange={handleChange}
            step="0.000000000000000001"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="rentalYield">Rental Yield (%)</label>
          <input
            type="number"
            id="rentalYield"
            name="rentalYield"
            value={formData.rentalYield}
            onChange={handleChange}
            min="0"
            max="100"
            required
          />
        </div>

        <button 
          type="submit" 
          className="button button-primary"
          disabled={loading || isTransactionPending}
        >
          {loading || isTransactionPending ? 'Creating...' : 'Create Property'}
        </button>
      </form>
    </div>
  );
};

export default CreateProperty; 