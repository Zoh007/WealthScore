const request = require('superagent');

const API_KEY = '5b55b663fcacb05e663e5ce3ea9815ff';
const BASE_URL = 'http://api.nessieisreal.com';

// Simple polling example
async function simplePolling() {
  console.log('🔄 Starting simple polling demo...');
  
  let pollCount = 0;
  const maxPolls = 5;
  
  const pollInterval = setInterval(async () => {
    pollCount++;
    console.log(`\n📡 Poll #${pollCount}`);
    
    try {
      const response = await request
        .get(`${BASE_URL}/atms?key=${API_KEY}`)
        .timeout(5000);
      
      const atms = response.body?.data || [];
      console.log(`✅ Success: Got ${atms.length} ATMs`);
      console.log(`📍 First ATM: ${atms[0]?.name || 'N/A'}`);
      console.log(`💰 First ATM amount: $${atms[0]?.amount_left || 'N/A'}`);
      
      if (pollCount >= maxPolls) {
        clearInterval(pollInterval);
        console.log('\n🎉 Polling demo completed!');
      }
      
    } catch (error) {
      console.error(`❌ Poll failed: ${error.message}`);
    }
  }, 3000); // Poll every 3 seconds
}

// Run the demo
simplePolling();
