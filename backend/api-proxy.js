const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// API proxy to handle CORS issues with Nessie API
app.use('/api', async (req, res) => {
  try {
    const path = req.path.replace('/api', '');
    const apiUrl = `http://api.nessieisreal.com${path}${req.url.includes('?') ? '&' : '?'}key=5b55b663fcacb05e663e5ce3ea9815ff`;
    
    console.log('Proxying request to:', apiUrl);
    
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API Proxy Server running at http://localhost:${PORT}`);
  console.log(`📊 Proxying requests to Nessie API`);
});
