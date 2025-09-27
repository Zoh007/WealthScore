const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 8003;

// Enable CORS for all routes
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname)));

// API proxy to handle CORS issues
app.get('/api/*', async (req, res) => {
  try {
    const apiUrl = `http://api.nessieisreal.com${req.path.replace('/api', '')}${req.url.includes('?') ? '&' : '?'}key=5b55b663fcacb05e663e5ce3ea9815ff`;
    
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'multi-customer-dashboard.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 WealthScore Multi-Customer Dashboard running at http://localhost:${PORT}`);
  console.log(`📊 Real-time financial monitoring with Nessie API`);
  console.log(`👥 Customers: Sarah Johnson, Michael Chen, Emily Rodriguez`);
  console.log(`💳 Total Accounts: 6 (2 per customer)`);
  console.log(`🔄 Auto-polling every 5 seconds`);
});
