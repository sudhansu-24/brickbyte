import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
  valuation_date: string;
}

interface AIAnalysisModalProps {
  propertyId: string;
  propertyData: {
    name: string;
    location: string;
    type: string;
    price_per_share: number;
  };
}

export function AIAnalysisModal({ propertyId, propertyData }: AIAnalysisModalProps) {
  const [valuation, setValuation] = useState<Valuation | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising':
        return 'text-green-600';
      case 'stable':
        return 'text-blue-600';
      case 'cooling':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const determineLocationGrade = (pricePerShare: number) => {
    if (pricePerShare >= 1.0) return 'prime';
    if (pricePerShare >= 0.5) return 'good';
    if (pricePerShare >= 0.2) return 'average';
    return 'developing';
  };

  const fetchValuation = async () => {
    setLoading(true);
    try {
      const valuationRequest = {
        sqft: 1500, // Default value
        property_type: propertyData.type.toLowerCase(),
        location_grade: determineLocationGrade(propertyData.price_per_share),
        address: propertyData.location
      };
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_ML_API_URL}/api/valuation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(valuationRequest)
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch valuation data');
      }
      
      const data = await response.json();
      setValuation(data);
      
      toast({
        title: "AI Analysis Generated",
        description: "Valuation data has been successfully generated.",
      });
    } catch (error) {
      console.error('Error fetching valuation:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Brain className="mr-2 h-4 w-4" />
          AI Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI Valuation Analysis</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : valuation ? (
          <div className="space-y-6">
            {/* Main Valuation */}
            <Card className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">
                ${valuation.predicted_value.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Confidence Score: {(valuation.confidence_score * 100).toFixed(1)}%
              </div>
            </Card>

            {/* ROI Prediction */}
            <Card className="p-6">
              <h4 className="text-lg font-semibold mb-2">Expected ROI</h4>
              <div className="text-2xl font-bold text-green-600">
                {valuation.predicted_roi}%
              </div>
            </Card>

            {/* Market Analysis */}
            <Card className="p-6">
              <h4 className="text-lg font-semibold mb-2">Market Analysis</h4>
              <div className={`text-lg font-medium ${getTrendColor(valuation.market_trend)}`}>
                Market Trend: {valuation.market_trend.charAt(0).toUpperCase() + valuation.market_trend.slice(1)}
              </div>
            </Card>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <div className="text-sm text-muted-foreground">Location Score</div>
                <div className="text-lg font-semibold">
                  {(valuation.analysis.location_score * 100).toFixed(0)}%
                </div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-sm text-muted-foreground">Market Demand</div>
                <div className="text-lg font-semibold">
                  {(valuation.analysis.market_demand * 100).toFixed(0)}%
                </div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-sm text-muted-foreground">Growth Potential</div>
                <div className="text-lg font-semibold">
                  {(valuation.analysis.growth_potential * 100).toFixed(0)}%
                </div>
              </Card>
            </div>

            <div className="text-xs text-muted-foreground text-right">
              Last updated: {new Date(valuation.valuation_date).toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Button onClick={fetchValuation}>Generate AI Analysis</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 