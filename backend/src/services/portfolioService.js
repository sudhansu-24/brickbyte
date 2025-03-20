const User = require('../models/User');
const Property = require('../models/Property');
const marketPrediction = require('./marketPrediction');
const tradingService = require('./tradingService');

class PortfolioService {
  async calculatePortfolioValue(user) {
    try {
      await user.populate('tokensHeld.property');
      let totalValue = 0;
      let rentalIncome = 0;
      const holdings = [];

      for (const token of user.tokensHeld) {
        const prediction = await marketPrediction.getPrediction({
          location: token.property.location,
          historicalPrices: [token.property.tokenPrice],
          transactionVolume: token.property.totalTokens - token.property.tokensAvailable,
          rentalYield: (token.property.rentalIncome * 12) / (token.property.tokenPrice * token.property.totalTokens) * 100,
          marketDemand: 8.5 // Mock demand score
        });

        const tokenValue = token.amount * prediction.predictedPrice;
        const monthlyRental = (token.property.rentalIncome * token.amount) / token.property.totalTokens;

        totalValue += tokenValue;
        rentalIncome += monthlyRental;

        holdings.push({
          property: token.property,
          amount: token.amount,
          value: tokenValue,
          monthlyRental,
          prediction
        });
      }

      return {
        totalValue,
        rentalIncome,
        holdings,
        suggestion: this.generatePortfolioSuggestion(holdings)
      };
    } catch (error) {
      console.error('Portfolio Calculation Error:', error);
      throw error;
    }
  }

  generatePortfolioSuggestion(holdings) {
    const strategy = [];
    
    for (const holding of holdings) {
      const { prediction, property, amount } = holding;
      
      // If ROI drops by 10% or more, suggest selling
      if (prediction.roi < -10) {
        strategy.push({
          property: property.name,
          action: 'SELL',
          amount: Math.ceil(amount * 0.5), // Suggest selling 50%
          reason: 'Low ROI performance'
        });
      }
      
      // If predicted price is significantly higher, suggest buying
      else if (prediction.roi > 20 && prediction.confidence > 0.7) {
        const suggestedAmount = Math.min(
          10, // Don't suggest buying more than 10 tokens at once
          property.tokensAvailable // Can't buy more than available
        );
        
        if (suggestedAmount > 0) {
          strategy.push({
            property: property.name,
            action: 'BUY',
            amount: suggestedAmount,
            reason: 'High growth potential'
          });
        }
      }
      
      // If performance is stable, suggest holding
      else {
        strategy.push({
          property: property.name,
          action: 'HOLD',
          amount: amount,
          reason: 'Stable performance'
        });
      }
    }

    return strategy;
  }

  async rebalancePortfolio(user) {
    try {
      const portfolio = await this.calculatePortfolioValue(user);
      const rebalanceActions = [];

      for (const suggestion of portfolio.suggestion) {
        if (suggestion.action === 'SELL') {
          try {
            await tradingService.executeSale(
              suggestion.property,
              suggestion.amount,
              user
            );
            rebalanceActions.push({
              ...suggestion,
              status: 'success'
            });
          } catch (error) {
            rebalanceActions.push({
              ...suggestion,
              status: 'failed',
              error: error.message
            });
          }
        }
        else if (suggestion.action === 'BUY') {
          try {
            await tradingService.executePurchase(
              suggestion.property,
              suggestion.amount,
              user
            );
            rebalanceActions.push({
              ...suggestion,
              status: 'success'
            });
          } catch (error) {
            rebalanceActions.push({
              ...suggestion,
              status: 'failed',
              error: error.message
            });
          }
        }
      }

      // Recalculate portfolio after rebalancing
      const updatedPortfolio = await this.calculatePortfolioValue(user);
      return {
        ...updatedPortfolio,
        rebalanceActions
      };
    } catch (error) {
      console.error('Portfolio Rebalancing Error:', error);
      throw error;
    }
  }

  async getHistoricalPerformance(user) {
    try {
      await user.populate('tokensHeld.property');
      const performance = [];

      for (const token of user.tokensHeld) {
        const historicalPrices = await marketPrediction.generateMockData(token.property._id);
        
        const propertyPerformance = {
          property: token.property.name,
          purchasePrice: token.purchasePrice,
          currentPrice: token.property.tokenPrice,
          priceHistory: historicalPrices,
          roi: ((token.property.tokenPrice - token.purchasePrice) / token.purchasePrice) * 100
        };

        performance.push(propertyPerformance);
      }

      return performance;
    } catch (error) {
      console.error('Historical Performance Error:', error);
      throw error;
    }
  }
}

module.exports = new PortfolioService();
