import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Fractional Real Estate Investment Made Easy</h1>
            <p className="hero-text">
              Invest in premium real estate properties with as little as $100. 
              Buy, sell, and trade property shares instantly on the blockchain.
            </p>
            <div className="hero-buttons">
              <Link to="/properties" className="button button-primary">
                Browse Properties
              </Link>
              <Link to="/create-property" className="button button-secondary">
                List Your Property
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="text-center">Why Choose BRICKBYTE?</h2>
          <div className="grid grid-3">
            <div className="feature-card card">
              <h3>Fractional Ownership</h3>
              <p>Own a piece of premium real estate without the full investment.</p>
            </div>
            <div className="feature-card card">
              <h3>AI-Powered Valuation</h3>
              <p>Get accurate property valuations using advanced AI technology.</p>
            </div>
            <div className="feature-card card">
              <h3>Instant Trading</h3>
              <p>Buy and sell property shares instantly on the blockchain.</p>
            </div>
            <div className="feature-card card">
              <h3>Automated Rentals</h3>
              <p>Receive rental income automatically through smart contracts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="text-center">How It Works</h2>
          <div className="grid grid-4">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Connect Wallet</h3>
              <p>Connect your Web3 wallet to get started.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Browse Properties</h3>
              <p>Explore available properties and their details.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Purchase Shares</h3>
              <p>Buy property shares using cryptocurrency.</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Earn Returns</h3>
              <p>Receive rental income and trade shares.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home; 