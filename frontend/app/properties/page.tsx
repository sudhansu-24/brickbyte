'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PropertySkeleton } from '@/components/property-skeleton';
import { CreatePropertyModal } from '@/components/create-property-modal';
import { useProperties } from '@/hooks/use-properties';
import Cookies from 'js-cookie';

interface Property {
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
  blockchain_property_id: string;
}

interface Valuation {
  predicted_value: number;
  predicted_roi: number;
  market_trend: string;
  confidence_score: number;
  location_score: number;
  market_demand: string;
  growth_potential: string;
  last_updated: string;
}

export default function PropertiesPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [propertyValuations, setPropertyValuations] = useState<Record<string, Valuation>>({});
  const { data: properties, isLoading, error, mutate } = useProperties();

  const determineLocationGrade = (pricePerShare: number) => {
    if (pricePerShare >= 1.0) return 'prime';
    if (pricePerShare >= 0.5) return 'good';
    if (pricePerShare >= 0.2) return 'average';
    return 'developing';
  };

  const fetchPropertyValuation = async (property: Property) => {
    try {
      const propertyData = {
        sqft: 1500, // Default value
        property_type: property.type.toLowerCase(),
        location_grade: determineLocationGrade(property.price_per_share),
        address: property.location
      };
      
      console.log('Sending valuation request for property:', property.id, propertyData);
      
      const response = await fetch('http://localhost:8000/api/valuation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch valuation');
      }
      
      const valuation = await response.json();
      console.log('Received valuation for property:', property.id, valuation);
      return valuation;
    } catch (error) {
      console.error('Error fetching valuation for property:', property.id, error);
      return null;
    }
  };

  useEffect(() => {
    const fetchValuations = async () => {
      if (properties) {
        const valuations: Record<string, Valuation> = {};
        for (const property of properties) {
          const valuation = await fetchPropertyValuation(property);
          if (valuation) {
            valuations[property.id] = valuation;
          }
        }
        setPropertyValuations(valuations);
      }
    };

    fetchValuations();
  }, [properties]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Available Properties</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <PropertySkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">Failed to load properties. Please try again.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Properties</h1>
        <div className="flex justify-end">
          <CreatePropertyModal onPropertyCreated={mutate} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {properties?.map((property) => (
          <Card
            key={property.id}
            className={cn(
              "overflow-hidden transition-all duration-300 cursor-pointer",
              hoveredCard === property.id ? "transform scale-[1.02] shadow-lg" : "",
            )}
            onMouseEnter={() => setHoveredCard(property.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={property.image_url || "/placeholder.svg"}
                alt={property.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
              <Badge
                className="absolute top-3 right-3"
                variant={property.type === "Commercial" ? "default" : "secondary"}
              >
                {property.type}
              </Badge>
            </div>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-2">{property.name}</h3>
              <div className="flex items-center text-muted-foreground mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{property.location}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Token Price</p>
                  <p className="font-semibold">${property.price_per_share}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">AI Projected ROI</p>
                  <p className="font-semibold text-green-600 dark:text-green-400 flex items-center">
                    {propertyValuations[property.id] ? 
                      `+${propertyValuations[property.id].predicted_roi}%` : 
                      `+${property.rental_yield}%`
                    }
                    <TrendingUp className="h-4 w-4 ml-1" />
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/properties/${property.id}`} className="w-full">
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 