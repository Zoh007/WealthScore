# 🏦 WealthScore Showcase

A real-time financial monitoring dashboard that demonstrates polling functionality with the Nessie API.

## 🚀 Features

- **Real-time Polling**: Automatically fetches updated financial data every 5 seconds
- **Live Wealth Score**: Calculates and displays a comprehensive wealth score (0-100)
- **Account Monitoring**: Shows checking and savings account balances
- **Transaction History**: Displays recent deposits and purchases
- **Modern UI**: Beautiful, responsive design with glassmorphism effects
- **Interactive Controls**: Start/stop polling with visual status indicators

## 📊 Data Overview

The showcase uses real financial data created via Nessie API:

- **Customer**: John Doe
- **Accounts**: 
  - Checking Account: $9,901 balance
  - Savings Account: $18,493 balance
- **Transactions**: 5 deposits ($5,340 total) + 8 purchases at real merchants
- **Merchants**: Walmart, Starbucks, Netflix, Kroger, DoorDash, AMC, Jersey Mike's, Lyft

## 🛠️ Setup & Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Server**:
   ```bash
   npm start
   ```

3. **Open in Browser**:
   Navigate to `http://localhost:3000`

## 🎯 How It Works

### Polling Implementation
- **Interval**: 5-second polling cycle
- **Endpoints**: Customer accounts, deposits, and purchases
- **Error Handling**: Graceful fallback for API failures
- **Status Indicators**: Visual feedback for polling state

### Wealth Score Calculation
The wealth score (0-100) is calculated using:

- **Balance Score (40%)**: Based on total account balance
- **Deposit Score (30%)**: Based on deposit frequency and amount
- **Spending Score (20%)**: Based on spending control vs. deposits
- **Diversity Score (10%)**: Based on account type diversity

### Score Interpretations
- **80-100**: 🌟 Excellent financial health!
- **60-79**: 👍 Good financial standing
- **40-59**: ⚠️ Room for improvement
- **0-39**: 📉 Needs attention

## 🔧 Technical Details

### API Integration
- **Nessie API**: Capital One's hackathon API
- **CORS Proxy**: Local server handles cross-origin requests
- **Real-time Data**: Live polling without Server-Sent Events

### Frontend Technologies
- **HTML5**: Semantic structure
- **CSS3**: Modern styling with gradients and animations
- **Vanilla JavaScript**: No frameworks, pure JS for API calls
- **Responsive Design**: Mobile-friendly layout

### Backend Technologies
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **CORS**: Cross-origin resource sharing
- **node-fetch**: HTTP client for API proxy

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes

## 🎨 UI Features

- **Glassmorphism Design**: Modern frosted glass effects
- **Gradient Backgrounds**: Beautiful color transitions
- **Smooth Animations**: Hover effects and transitions
- **Status Indicators**: Real-time polling status
- **Interactive Cards**: Hover animations and shadows

## 🔄 Polling States

- **Stopped**: Red dot, polling inactive
- **Active**: Blue pulsing dot, data updating
- **Error**: Red dot, API issues detected

## 📈 Real-time Updates

The dashboard automatically updates:
- Account balances
- Transaction counts
- Wealth score
- Recent transactions
- Last updated timestamp

## 🚀 Getting Started

1. Clone or download the project
2. Run `npm install` to install dependencies
3. Run `npm start` to start the server
4. Open `http://localhost:3000` in your browser
5. Click "Start Polling" to begin real-time monitoring

## 📝 Notes

- The API key is embedded for demo purposes
- Real financial data is used (created via POST requests)
- Polling can be started/stopped at any time
- All data is fetched from the live Nessie API

## 🎉 Demo

Visit the live showcase to see:
- Real-time financial data polling
- Dynamic wealth score calculation
- Beautiful, modern UI design
- Responsive mobile experience

---

**Built with ❤️ for the WealthScore project**
