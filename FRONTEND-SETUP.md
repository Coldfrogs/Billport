# Frontend Integration Setup

## Overview
The proof-of-trade system now includes a React frontend that matches the backend functionality. The frontend expects a marketplace with deals, secondary market trading, and portfolio tracking.

## What's Been Created

### New Smart Contracts
1. **DealRegistry** (`0x61b824f52988e892E3C6EA8c412f8F2ECa5656B5`)
   - Manages trade finance deals
   - Handles deal listing, funding, verification, and release
   - Tracks marketplace statistics

2. **SecondaryMarket** (`0xc5Afa85C42531B96A9f47012bB6787d5BdA06178`)
   - Manages secondary market trading of funded positions
   - Handles position listing and trading

### Backend API
- Express.js server that serves the frontend and provides API endpoints
- Connects to deployed smart contracts
- Serves mock data for demonstration

### Frontend
- React + TypeScript + Vite application
- Modern UI with Tailwind CSS and shadcn/ui components
- Multiple pages: Dashboard, Marketplace, Secondary Market, CopperFlow visualization

## How to Run the Application

### Option 1: Quick Start (Recommended)
1. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend_trade/trade-proof-gateway-main
   npm install
   ```

3. **Build Frontend:**
   ```bash
   npm run build
   ```

4. **Start Backend Server:**
   ```bash
   cd ../../backend
   npm start
   ```

5. **Open Browser:**
   - Go to `http://localhost:3001`
   - The frontend will be served by the backend

### Option 2: Development Mode
1. **Start Backend (Terminal 1):**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Start Frontend Dev Server (Terminal 2):**
   ```bash
   cd frontend_trade/trade-proof-gateway-main
   npm install
   npm run dev
   ```

3. **Open Browser:**
   - Frontend: `http://localhost:8080`
   - Backend API: `http://localhost:3001/api`

## What You'll See

### Dashboard
- Portfolio overview with balances
- Funding and verification progress
- Recent activity feed
- Statistics and metrics

### Marketplace
- List of available trade finance deals
- Filter and search functionality
- Deal details with risk scores and terms
- Fund deals (demo mode)

### Secondary Market
- Your invested positions
- Available listings from other investors
- Trade positions with other users
- Portfolio management

### CopperFlow
- Visual representation of trade finance flows
- Process step tracking
- Capital flow visualization
- Real-time metrics

## Demo Data
The system comes pre-populated with:
- 8 sample deals (Cocoa Beans, Coffee Beans, Tea Leaves, Palm Oil)
- Various deal statuses (Listed, Funded, Verified)
- Risk scores and interest rates
- Geographic locations (Nigeria, Ghana, Kenya, Côte d'Ivoire)

## Contract Addresses (Coston2 Testnet)
- **MockUSD**: `0x6391bFA09AF4dD6d322b646168B454f4D977384a`
- **IssuerRegistry**: `0x16B717120d41910313A0ca28AF8746a17e732462`
- **WRRegistry**: `0x3b3fc290d50058e85953aAC0243ce80A35FC200a`
- **ProofRegistry**: `0xa92D88CF5c3Bef5790499618D7A4601eb26E5A30`
- **DealRegistry**: `0x61b824f52988e892E3C6EA8c412f8F2ECa5656B5`
- **SecondaryMarket**: `0xc5Afa85C42531B96A9f47012bB6787d5BdA06178`

## Features Demonstrated
- ✅ Smart contract integration
- ✅ Deal management and lifecycle
- ✅ Secondary market trading
- ✅ Portfolio tracking
- ✅ Risk assessment
- ✅ Process visualization
- ✅ Modern UI/UX

## Next Steps
1. Run the application using the instructions above
2. Explore the different pages and features
3. Test the deal funding and trading functionality
4. View the CopperFlow visualization
5. Check the portfolio dashboard

The application is now ready for demonstration and further development!
