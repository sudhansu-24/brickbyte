import api from './api';

export interface Property {
  id: string;
  name: string;
  location: string;
  description: string;
  image_url: string;
  price_per_share: number;
  total_shares: number;
  available_shares: number;
  rental_yield: number;
  type: 'Commercial' | 'Residential';
  owner_id: string;
  contract_address: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    email: string;
    wallet_address: string;
  };
}

export const getProperties = async (): Promise<Property[]> => {
  const response = await api.get('/api/properties');
  return response.data;
};

export const getPropertyById = async (id: string): Promise<Property> => {
  const response = await api.get(`/api/properties/${id}`);
  return response.data;
};

export const createProperty = async (property: Omit<Property, 'id' | 'created_at' | 'updated_at' | 'profiles'>): Promise<Property> => {
  const response = await api.post('/api/properties', property);
  return response.data;
}; 