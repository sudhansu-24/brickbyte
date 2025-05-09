import numpy as np
from typing import Dict, Any
import json
import random
from datetime import datetime

class PropertyValuationModel:
    def __init__(self):
        # Fake model parameters
        self.location_multipliers = {
            'prime': (1.2, 1.4),
            'good': (1.0, 1.2),
            'average': (0.8, 1.0),
            'developing': (0.6, 0.8)
        }
        
        self.base_price_per_sqft = {
            'residential': (200, 400),
            'commercial': (300, 600),
            'industrial': (150, 300)
        }
        
        # Market sentiment factors
        self.market_trends = ['rising', 'stable', 'cooling']
        self.trend_weights = [0.5, 0.3, 0.2]  # More likely to show positive trends

    def _calculate_base_value(self, sqft: float, property_type: str) -> float:
        min_price, max_price = self.base_price_per_sqft[property_type]
        base_price_per_sqft = random.uniform(min_price, max_price)
        return sqft * base_price_per_sqft

    def _apply_location_factor(self, value: float, location_grade: str) -> float:
        min_mult, max_mult = self.location_multipliers[location_grade]
        location_multiplier = random.uniform(min_mult, max_mult)
        return value * location_multiplier

    def _calculate_roi(self, property_type: str, location_grade: str) -> float:
        # Generate realistic ROI based on property type and location
        base_roi = {
            'residential': (4, 8),
            'commercial': (6, 12),
            'industrial': (5, 10)
        }[property_type]
        
        location_bonus = {
            'prime': 2,
            'good': 1,
            'average': 0,
            'developing': -1
        }[location_grade]
        
        return round(random.uniform(base_roi[0], base_roi[1]) + location_bonus, 2)

    def predict(self, property_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a realistic-looking property valuation."""
        sqft = property_data['sqft']
        property_type = property_data['property_type']
        location_grade = property_data['location_grade']

        # Calculate base value
        base_value = self._calculate_base_value(sqft, property_type)
        
        # Apply location factor
        adjusted_value = self._apply_location_factor(base_value, location_grade)
        
        # Add some random "market noise" (+/- 5%)
        final_value = adjusted_value * random.uniform(0.95, 1.05)
        
        # Calculate ROI
        predicted_roi = self._calculate_roi(property_type, location_grade)
        
        # Generate market trend analysis
        market_trend = np.random.choice(self.market_trends, p=self.trend_weights)
        
        # Confidence score (always high for demo purposes)
        confidence_score = random.uniform(0.85, 0.98)

        return {
            'predicted_value': round(final_value, 2),
            'predicted_roi': predicted_roi,
            'market_trend': market_trend,
            'confidence_score': round(confidence_score, 4),
            'valuation_date': datetime.now().isoformat(),
            'analysis': {
                'location_score': round(random.uniform(0.6, 0.95), 2),
                'market_demand': round(random.uniform(0.7, 0.9), 2),
                'growth_potential': round(random.uniform(0.65, 0.95), 2)
            }
        }

# Example usage
if __name__ == "__main__":
    model = PropertyValuationModel()
    
    # Test property
    test_property = {
        'sqft': 1500,
        'property_type': 'residential',
        'location_grade': 'good'
    }
    
    result = model.predict(test_property)
    print(json.dumps(result, indent=2)) 