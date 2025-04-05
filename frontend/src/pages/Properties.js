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

      const response = await fetch('http://localhost:3001/api/properties', {
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
      <div className="container">
        <div className="loading">Loading properties...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <button className="button button-primary" onClick={fetchProperties}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="properties-header">
        <h1>Available Properties</h1>
        <button className="button button-primary" onClick={() => navigate('/create-property')}>
          Create Property
        </button>
      </div>

      {properties.length === 0 ? (
        <div className="no-properties">
          <p>No properties available.</p>
        </div>
      ) : (
        <div className="properties-grid">
          {properties.map((property) => (
            <div key={property.id} className="property-card" onClick={() => navigate(`/properties/${property.id}`)}>
              <img src={property.image_url} alt={property.name} className="property-image" />
              <div className="property-info">
                <div className="property-type">{property.type || 'Commercial'}</div>
                <h3>{property.name}</h3>
                <p className="location">{property.location}</p>
                <div className="property-stats">
                  <div className="stat">
                    <span className="label">Token Price</span>
                    <span className="value">{property.price_per_share} ETH</span>
                  </div>
                  <div className="stat">
                    <span className="label">AI Projected ROI</span>
                    <span className="value roi">
                      {propertyValuations[property.id] ? 
                        `+${propertyValuations[property.id].predicted_roi}%` : 
                        `+${property.rental_yield}%`
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Properties; 