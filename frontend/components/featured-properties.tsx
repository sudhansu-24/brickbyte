"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, TrendingUp, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data for featured properties
const featuredProperties = [
  {
    id: 1,
    name: "Skyline Towers",
    image: "/placeholder.svg?height=400&width=600",
    location: "New York, NY",
    tokenPrice: 125.5,
    projectedROI: 12.3,
    type: "Commercial",
  },
  {
    id: 2,
    name: "Oceanview Residences",
    image: "/placeholder.svg?height=400&width=600",
    location: "Miami, FL",
    tokenPrice: 87.25,
    projectedROI: 9.8,
    type: "Residential",
  },
  {
    id: 3,
    name: "Tech Hub Office Park",
    image: "/placeholder.svg?height=400&width=600",
    location: "San Francisco, CA",
    tokenPrice: 210.75,
    projectedROI: 15.2,
    type: "Commercial",
  },
  {
    id: 4,
    name: "Mountain View Apartments",
    image: "/placeholder.svg?height=400&width=600",
    location: "Denver, CO",
    tokenPrice: 65.3,
    projectedROI: 8.5,
    type: "Residential",
  },
]

export default function FeaturedProperties() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

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
                  src={property.image || "/placeholder.svg"}
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
                    <p className="font-semibold">${property.tokenPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">AI Projected ROI</p>
                    <p className="font-semibold text-green-600 dark:text-green-400 flex items-center">
                      {property.projectedROI}%
                      <TrendingUp className="h-4 w-4 ml-1" />
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" className="group">
            View All Properties
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  )
}

