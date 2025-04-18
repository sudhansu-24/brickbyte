import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/lib/properties';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, TrendingUp } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={property.image_url}
          alt={property.name}
          fill
          className="object-cover transition-transform duration-500 hover:scale-110"
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
            <p className="text-sm text-muted-foreground">Rental Yield</p>
            <p className="font-semibold text-green-600 dark:text-green-400 flex items-center">
              {property.rental_yield}%
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
  );
} 