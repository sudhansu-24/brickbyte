import React from 'react';
import { formatCurrency } from '../services/valuationService';

const ValuationCard = ({ valuation }) => {
    if (!valuation) return null;

    const getTrendColor = (trend) => {
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

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-2xl font-bold mb-4">AI Valuation Analysis</h3>
            
            {/* Main Valuation */}
            <div className="mb-6">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                    {formatCurrency(valuation.predicted_value)}
                </div>
                <div className="text-sm text-gray-600">
                    Confidence Score: {(valuation.confidence_score * 100).toFixed(1)}%
                </div>
            </div>

            {/* ROI Prediction */}
            <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2">Expected ROI</h4>
                <div className="text-2xl font-bold text-green-600">
                    {valuation.predicted_roi}%
                </div>
            </div>

            {/* Market Analysis */}
            <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2">Market Analysis</h4>
                <div className={`text-lg font-medium ${getTrendColor(valuation.market_trend)}`}>
                    Market Trend: {valuation.market_trend.charAt(0).toUpperCase() + valuation.market_trend.slice(1)}
                </div>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                    <div className="text-sm text-gray-600">Location Score</div>
                    <div className="text-lg font-semibold">
                        {(valuation.analysis.location_score * 100).toFixed(0)}%
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-600">Market Demand</div>
                    <div className="text-lg font-semibold">
                        {(valuation.analysis.market_demand * 100).toFixed(0)}%
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-600">Growth Potential</div>
                    <div className="text-lg font-semibold">
                        {(valuation.analysis.growth_potential * 100).toFixed(0)}%
                    </div>
                </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 text-right">
                Last updated: {new Date(valuation.valuation_date).toLocaleString()}
            </div>
        </div>
    );
};

export default ValuationCard; 