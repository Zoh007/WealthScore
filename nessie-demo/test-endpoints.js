const request = require('superagent');

const API_KEY = '5b55b663fcacb05e663e5ce3ea9815ff';
const BASE_URL = 'http://api.nessieisreal.com';

// Test different endpoints to see what data is available
async function testEndpoints() {
  const endpoints = [
    '/customers',
    '/merchants', 
    '/branches',
    '/atms',
    '/accounts',
    '/transactions',
    '/bills',
    '/deposits',
    '/withdrawals',
    '/purchases',
    '/transfers',
    '/loans',
    '/credit-cards'
  ];

  console.log('🔍 Testing Nessie API endpoints for available data...\n');

  for (const endpoint of endpoints) {
    try {
      const response = await request
        .get(`${BASE_URL}${endpoint}?key=${API_KEY}`)
        .timeout(5000);
      
      const data = response.body?.data || response.body || [];
      const count = Array.isArray(data) ? data.length : (data ? 1 : 0);
      
      console.log(`✅ ${endpoint}: ${count} items`);
      
      if (count > 0 && Array.isArray(data)) {
        // Show sample data structure
        const sample = data[0];
        const keys = Object.keys(sample).slice(0, 5); // First 5 keys
        console.log(`   Sample fields: ${keys.join(', ')}`);
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
}

testEndpoints();
