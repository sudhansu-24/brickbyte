import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, TrendingUp, DollarSign } from "lucide-react";

interface PropertyCardProps {
  property: {
    _id: string;
    name: string;
    location: string;
    description: string;
    images: string[];
    propertyType: "commercial" | "residential";
    tokenPrice: number;
    totalTokens: number;
    tokensAvailable: number;
    rentalIncome: number;
    projectedRoi: number;
  };
  compact?: boolean;
}

export default function PropertyCard({ property, compact = false }: PropertyCardProps) {
  const router = useRouter();

  const handleViewProperty = () => {
    router.push(`/properties/${property._id}`);
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className={compact ? "aspect-[16/9]" : "aspect-[16/10]"} style={{ position: "relative" }}>
        {property.images && property.images.length > 0 ? (
          <Image
            src={property.images[0]}
            alt={property.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Building className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <Badge 
          className="absolute top-2 right-2 bg-primary text-primary-foreground"
          variant="outline"
        >
          {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
        </Badge>
      </div>

      <CardHeader className={compact ? "p-4" : "p-6"}>
        <CardTitle className={`line-clamp-1 ${compact ? "text-lg" : "text-xl"}`}>
          {property.name}
        </CardTitle>
        <CardDescription className="flex items-center mt-1">
          <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
          {property.location}
        </CardDescription>
      </CardHeader>

      {!compact && (
        <CardContent className="p-6 pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {property.description}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Token Price</p>
              <p className="font-medium flex items-center">
                <DollarSign className="h-3.5 w-3.5 mr-0.5" />
                {property.tokenPrice.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Available</p>
              <p className="font-medium">
                {property.tokensAvailable.toLocaleString()} / {property.totalTokens.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Monthly Income</p>
              <p className="font-medium">
                ${property.rentalIncome.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Projected ROI</p>
              <p className="font-medium flex items-center text-green-600">
                <TrendingUp className="h-3.5 w-3.5 mr-0.5" />
                {property.projectedRoi.toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
      )}

      {compact && (
        <CardContent className="p-4 pt-0">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground">Token Price</p>
              <p className="font-medium">${property.tokenPrice.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">ROI</p>
              <p className="font-medium text-green-600">{property.projectedRoi.toFixed(2)}%</p>
            </div>
          </div>
        </CardContent>
      )}

      <CardFooter className={`mt-auto ${compact ? "p-4 pt-0" : "p-6 pt-0"}`}>
        <Button 
          onClick={handleViewProperty} 
          className="w-full"
          variant={compact ? "outline" : "default"}
        >
          View Property
        </Button>
      </CardFooter>
    </Card>
  );
}
