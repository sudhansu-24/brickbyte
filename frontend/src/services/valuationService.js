const ML_API_URL = process.env.REACT_APP_ML_API_URL || 'http://localhost:8000';

export const getPropertyValuation = async (propertyData) => {
    try {
        const response = await fetch(`${ML_API_URL}/api/valuation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(propertyData),
        });

        if (!response.ok) {
            throw new Error('Valuation request failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Error getting property valuation:', error);
        throw error;
    }
};

// Utility function to format currency
export const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}; 