import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { getPropertyValuation } from '../services/valuationService';

const Properties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [propertyValuations, setPropertyValuations] = useState({});

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

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/properties`, {
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
        throw new Error('Failed to fetch properties');
      }

      const data = await response.json();
      setProperties(data);

      // Fetch valuations for all properties
      const valuations = {};
      for (const property of data) {
        const valuation = await fetchPropertyValuation(property);
        if (valuation) {
          valuations[property.id] = valuation;
        }
      }
      setPropertyValuations(valuations);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading properties...</p>
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
          <div className="mt-4 text-center">
            <button
              onClick={fetchProperties}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Properties</h1>
          <button
            onClick={() => navigate('/create-property')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Property
          </button>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No properties available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <div
                key={property.id}
                onClick={() => navigate(`/properties/${property.id}`)}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              >
                <img
                  src={property.image_url}
                  alt={property.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 mb-2">
                    {property.type || 'Commercial'}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{property.name}</h3>
                  <p className="text-gray-500 mb-4">{property.location}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Token Price</p>
                      <p className="text-lg font-semibold text-gray-900">{property.price_per_share} ETH</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">AI Projected ROI</p>
                      <p className="text-lg font-semibold text-green-600">
                        {propertyValuations[property.id] ? 
                          `+${propertyValuations[property.id].predicted_roi}%` : 
                          `+${property.rental_yield}%`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties; 