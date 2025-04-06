# 🏠 BRICKBYTE - AI-Based Micro Real Estate Marketplace

BRICKBYTE is a decentralized platform that enables fractional ownership of real estate properties through NFTs, powered by AI valuation and automated rental distribution.

## 🌟 Features

- **Web3 Integration**: Connect with MetaMask and other Web3 wallets
- **Fractional Property Ownership**: Buy and sell micro real estate shares as NFTs
- **AI-Powered Valuation**: Dynamic property price predictions and ROI calculations
- **Automated Rental Distribution**: Smart contract-based rental income distribution
- **Real-time Trading**: Instant buy/sell of property shares
- **Transparent Ownership**: On-chain ownership records and transaction history
- **Portfolio Management**: Track your investments and AI-predicted returns

## 🛠 Tech Stack

### Frontend
- React 18
- Web3.js
- Ethers.js
- React Router
- TailwindCSS
- TypeScript
- Vercel (Deployment)

### Backend
- Node.js
- Express.js
- TypeScript
- Supabase (PostgreSQL)
- Render (Deployment)

### Smart Contracts
- Solidity
- Hardhat
- OpenZeppelin
- Chainlink Automation

### AI/ML
- Scikit-learn/TensorFlow (Local ML Model)
- Render (Deployment)

### Blockchain
- Ethereum (Sepolia Testnet for Development)

## 📁 Project Structure

```
brickbyte/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API and Web3 services
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript type definitions
│   └── public/             # Static assets
│
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Data models
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions
│   └── tests/              # Backend tests
│
├── contracts/              # Smart contracts
│   ├── contracts/         # Solidity contracts
│   ├── scripts/          # Deployment scripts
│   └── test/             # Contract tests
│
└── ml-model/             # AI/ML model
    ├── data/            # Training data
    ├── models/          # Trained models
    └── scripts/         # Training scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MetaMask or other Web3 wallet
- Git
- Python 3.8+ (for ML model)
- Hardhat (for smart contract development)
- Vercel account (for frontend deployment)
- Render account (for backend and ML service deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/brickbyte.git
cd brickbyte
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Install smart contract dependencies
cd ../contracts
npm install

# Install ML model dependencies
cd ../ml-model
pip install -r requirements.txt
```

### Environment Setup

1. Create `.env` files in each directory:

Frontend (.env):
```env
REACT_APP_BACKEND_URL=https://brickbyte-backend.onrender.com
REACT_APP_ML_API_URL=https://brickbyte-ml.onrender.com
REACT_APP_CONTRACT_ADDRESS=your_contract_address
```

Backend (.env):
```env
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://brickbyte1.vercel.app
```

ML Service (.env):
```env
PORT=8000
```

Contracts (.env):
```env
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC_URL=your_sepolia_rpc_url
```

### Deployment

1. **Frontend Deployment (Vercel)**
   - Push your code to GitHub
   - Connect your repository to Vercel
   - Set environment variables in Vercel dashboard
   - Deploy

2. **Backend Deployment (Render)**
   - Push your code to GitHub
   - Create a new Web Service on Render
   - Connect your repository
   - Set environment variables
   - Deploy

3. **ML Service Deployment (Render)**
   - Push your code to GitHub
   - Create a new Web Service on Render
   - Set Python as the runtime
   - Set environment variables
   - Deploy

4. **Smart Contract Deployment**
```bash
cd contracts
npx hardhat run scripts/deploy.js --network sepolia
```

### Running Locally

1. Start the ML model server:
```bash
cd ml-model
python scripts/valuation.py
```

2. Start the backend server:
```bash
cd backend
npm start
```

3. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available locally at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- ML Model: http://localhost:8000

## 📝 Usage Guide

1. **User Registration**
   - Navigate to https://brickbyte.vercel.app/register
   - Fill in your details and create an account
   - Connect your MetaMask wallet

2. **Property Listing**
   - Log in to your account
   - Navigate to "Create Property"
   - Fill in property details and upload images
   - Set initial share price and total shares

3. **Trading**
   - Browse available properties
   - View AI-predicted ROI and property details
   - Buy/sell shares using MetaMask

4. **Portfolio Management**
   - View your owned shares
   - Track rental income
   - Monitor AI-predicted property valuations

## 🔧 Troubleshooting

Common issues and solutions:

1. **CORS Issues**
   - Ensure backend CORS configuration includes your frontend domain
   - Check environment variables are set correctly
   - Verify all services are properly deployed

2. **MetaMask Connection Issues**
   - Ensure MetaMask is installed and unlocked
   - Check if you're connected to Sepolia testnet
   - Verify your account has sufficient test ETH

3. **Backend Connection Errors**
   - Check if backend server is running
   - Verify environment variables are set correctly
   - Check database connection
   - Ensure CORS is properly configured

4. **ML Service Issues**
   - Verify ML service is running
   - Check environment variables
   - Ensure proper CORS configuration

5. **Smart Contract Deployment**
   - Ensure you have sufficient test ETH
   - Verify network configuration in hardhat.config.js
   - Check contract compilation for errors

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Security

For security concerns, please email security@brickbyte.com or create a security advisory on GitHub.

## 🙏 Acknowledgments

- OpenZeppelin for smart contract templates
- Chainlink for oracle services
- Supabase for database infrastructure
- Vercel and Render for deployment infrastructure
- The Ethereum community for development tools and resources 