import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getDemoPortfolio } from '@/lib/demo-helper';
import { useToast } from './use-toast';

// Demo property data
const demoProperties = [
  {
    _id: '1',
    name: 'Ocean View Condo',
    location: 'Miami, FL',
    description: 'Luxury beachfront condo with panoramic ocean views.',
    images: [
      '/oceanView.avif'
    ],
    propertyType: 'residential',
    tokenPrice: 100,
    tokensAvailable: 8500,
    rentalIncome: 5.2,
    projectedRoi: 8.7,
    yearBuilt: 2018,
    squareFootage: 5200,
    lotSize: '0.25 acres',
    bedrooms: 3,
    bathrooms: 2
  },
  {
    _id: '2',
    name: 'Harbor View Office Complex',
    location: 'San Francisco, CA',
    description: 'Modern office complex with panoramic views of the San Francisco Bay and Golden Gate Bridge.',
    images: [
      '/techHub.avif'
    ],
    propertyType: 'commercial',
    tokenPrice: 150,
    tokensAvailable: 5000,
    rentalIncome: 7.2,
    projectedRoi: 10.3,
    yearBuilt: 2021,
    squareFootage: 4800,
    lotSize: '0.4 acres',
    bedrooms: 0,
    bathrooms: 8
  },
  {
    _id: '3',
    name: 'Mountain Retreat Cabin',
    location: 'Aspen, CO',
    description: 'Cozy mountain cabin with stunning views and modern amenities.',
    images: [
      '/mountain.avif'
    ],
    propertyType: 'residential',
    tokenPrice: 80,
    tokensAvailable: 10000,
    rentalIncome: 4.5,
    projectedRoi: 7.8,
    yearBuilt: 2015,
    squareFootage: 2200,
    lotSize: '1.2 acres',
    bedrooms: 4,
    bathrooms: 3
  }
];

// Demo AI suggestions
const demoSuggestions = [
  {
    action: 'BUY',
    property: 'Mountain Retreat Cabin',
    reason: 'Seasonal rental demand is expected to increase by 15% in the next quarter due to upcoming ski season.',
    amount: 10
  },
  {
    action: 'HOLD',
    property: 'Ocean View Condo',
    reason: 'Property value is stable with consistent rental income. Recommend maintaining current position.',
    amount: 0
  },
  {
    action: 'SELL',
    property: 'Harbor View Office Complex',
    reason: 'Commercial real estate in this area is showing signs of market correction. Consider reducing exposure.',
    amount: 5
  }
];

// Demo performance history
const demoHistory = [
  { 
    property: 'Ocean View Condo', 
    roi: 8.5, 
    purchasePrice: 15000, 
    currentPrice: 16275,
    date: '2025-03-01'
  },
  { 
    property: 'Harbor View Office Complex', 
    roi: -2.3, 
    purchasePrice: 7500, 
    currentPrice: 7327,
    date: '2025-02-15'
  },
  { 
    property: 'Mountain Retreat Cabin', 
    roi: 12.7, 
    purchasePrice: 4000, 
    currentPrice: 4508,
    date: '2025-01-20'
  }
];

export function useDemoPortfolio() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadDemoPortfolio() {
      if (!user?.walletAddress) return;

      try {
        setIsLoading(true);
        
        // Get demo portfolio data
        const portfolioItems = await getDemoPortfolio(user.walletAddress);
        
        // Build portfolio data
        const holdings = portfolioItems.map(item => {
          const property = demoProperties.find(p => p._id === item.propertyId);
          if (!property) return null;
          
          return {
            property,
            amount: item.tokenAmount,
            value: item.tokenAmount * property.tokenPrice,
            monthlyRental: (item.tokenAmount * property.tokenPrice * property.rentalIncome) / 100,
            prediction: {
              roi: property.projectedRoi,
              confidence: 0.85
            }
          };
        }).filter((item): item is NonNullable<typeof item> => item !== null);
        
        // Calculate totals
        const totalValue = holdings.reduce((sum, item) => sum + item.value, 0);
        const rentalIncome = holdings.reduce((sum, item) => sum + item.monthlyRental, 0);
        
        setPortfolio({
          totalValue,
          rentalIncome,
          holdings,
          suggestion: demoSuggestions,
          history: demoHistory
        });
      } catch (error) {
        console.error('Error loading demo portfolio:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadDemoPortfolio();
  }, [user?.walletAddress]);

  const mutate = async () => {
    setIsLoading(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Portfolio Refreshed',
        description: 'Your portfolio data has been updated.',
      });
    }, 1000);
  };

  const rebalance = async () => {
    setIsLoading(true);
    // Simulate rebalancing
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setIsLoading(false);
        resolve();
      }, 2000);
    });
  };

  return { portfolio, isLoading, mutate, rebalance };
}

export function useDemoPortfolioHistory() {
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<any>(null);

  useEffect(() => {
    // Simulate loading history data
    setTimeout(() => {
      setHistory(demoHistory);
      setIsLoading(false);
    }, 800);
  }, []);

  return { history, isLoading };
}
