"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { PropertySkeleton } from "@/components/property-skeleton"
import Cookies from "js-cookie"

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
  confidence_score: number;
  predicted_roi: number;
  market_trend: 'rising' | 'stable' | 'cooling';
  analysis: {
    location_score: number;
    market_demand: number;
    growth_potential: number;
  };
}

export function FeaturedProperties() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [propertyValuations, setPropertyValuations] = useState<Record<string, Valuation>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      
      const data = await response.json();
      setProperties(data);
      
      // Fetch valuations for all properties
      const valuations: Record<string, Valuation> = {};
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
      <section id="properties" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Featured Properties</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Loading featured properties...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <PropertySkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="properties" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Featured Properties</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Get the first 4 properties as featured
  const featuredProperties = properties?.slice(0, 4) || [];

  return (
    <section id="properties" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Featured Properties</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our top-performing properties with high ROI potential, curated by our AI-powered analytics engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProperties.map((property) => (
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

        <div className="mt-12 text-center">
          <Link href="/properties">
            <Button className="group">
              View All Properties
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}