const request = require('superagent');

const API_KEY = '5b55b663fcacb05e663e5ce3ea9815ff';
const BASE_URL = 'http://api.nessieisreal.com';

class NessiePoller {
  constructor(options = {}) {
    this.apiKey = options.apiKey || API_KEY;
    this.baseUrl = options.baseUrl || BASE_URL;
    this.pollInterval = options.pollInterval || 5000; // 5 seconds default
    this.maxRetries = options.maxRetries || 3;
    this.isPolling = false;
    this.pollTimer = null;
    this.callbacks = {
      onData: options.onData || (() => {}),
      onError: options.onError || (() => {}),
      onStart: options.onStart || (() => {}),
      onStop: options.onStop || (() => {})
    };
  }

  // Basic polling method
  async poll(endpoint, params = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const queryParams = { key: this.apiKey, ...params };
      
      console.log(`🔄 Polling ${endpoint}...`);
      
      const response = await request
        .get(url)
        .query(queryParams)
        .timeout(10000); // 10 second timeout

      console.log(`✅ Success: ${response.status} - ${response.body.length || 0} items`);
      this.callbacks.onData(response.body, endpoint);
      return response.body;
      
    } catch (error) {
      console.error(`❌ Polling error for ${endpoint}:`, error.message);
      this.callbacks.onError(error, endpoint);
      throw error;
    }
  }

  // Start continuous polling
  startPolling(endpoint, params = {}) {
    if (this.isPolling) {
      console.log('⚠️ Already polling, stopping previous poll...');
      this.stopPolling();
    }

    this.isPolling = true;
    this.callbacks.onStart(endpoint);
    
    console.log(`🚀 Starting polling for ${endpoint} every ${this.pollInterval}ms`);
    
    // Initial poll
    this.poll(endpoint, params);
    
    // Set up interval
    this.pollTimer = setInterval(() => {
      this.poll(endpoint, params);
    }, this.pollInterval);
  }

  // Stop polling
  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.isPolling = false;
    this.callbacks.onStop();
    console.log('🛑 Polling stopped');
  }

  // Smart polling with exponential backoff on errors
  async smartPoll(endpoint, params = {}) {
    let retryCount = 0;
    const baseInterval = this.pollInterval;
    
    const pollWithBackoff = async () => {
      try {
        await this.poll(endpoint, params);
        retryCount = 0; // Reset retry count on success
        return this.pollInterval; // Use normal interval
      } catch (error) {
        retryCount++;
        if (retryCount >= this.maxRetries) {
          console.error(`❌ Max retries (${this.maxRetries}) reached for ${endpoint}`);
          return null; // Stop polling
        }
        
        // Exponential backoff: 2^retryCount * baseInterval
        const backoffInterval = Math.min(baseInterval * Math.pow(2, retryCount), 60000); // Max 1 minute
        console.log(`⏳ Retrying in ${backoffInterval}ms (attempt ${retryCount}/${this.maxRetries})`);
        return backoffInterval;
      }
    };

    const pollLoop = async () => {
      const nextInterval = await pollWithBackoff();
      if (nextInterval !== null) {
        setTimeout(pollLoop, nextInterval);
      }
    };

    pollLoop();
  }

  // Poll multiple endpoints
  async pollMultiple(endpoints) {
    const promises = endpoints.map(({ endpoint, params = {} }) => 
      this.poll(endpoint, params)
    );
    
    try {
      const results = await Promise.allSettled(promises);
      return results.map((result, index) => ({
        endpoint: endpoints[index].endpoint,
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null
      }));
    } catch (error) {
      console.error('❌ Error in multi-poll:', error);
      throw error;
    }
  }
}

// Demo functions
async function demoBasicPolling() {
  console.log('\n🔍 Demo 1: Basic Polling');
  console.log('=' .repeat(40));
  
  const poller = new NessiePoller({
    pollInterval: 3000, // 3 seconds
    onData: (data, endpoint) => {
      console.log(`📊 Received ${data.length} ATMs from ${endpoint}`);
    },
    onError: (error, endpoint) => {
      console.log(`❌ Error polling ${endpoint}: ${error.message}`);
    }
  });

  // Start polling ATMs
  poller.startPolling('/atms');
  
  // Stop after 15 seconds
  setTimeout(() => {
    poller.stopPolling();
    console.log('✅ Basic polling demo completed\n');
  }, 15000);
}

async function demoSmartPolling() {
  console.log('\n🧠 Demo 2: Smart Polling with Error Handling');
  console.log('=' .repeat(50));
  
  const poller = new NessiePoller({
    pollInterval: 2000,
    maxRetries: 3,
    onData: (data, endpoint) => {
      console.log(`📈 Smart poll: ${data.length} accounts from ${endpoint}`);
    },
    onError: (error, endpoint) => {
      console.log(`⚠️ Smart poll error: ${error.message}`);
    }
  });

  // Start smart polling
  poller.smartPoll('/accounts');
  
  // Stop after 20 seconds
  setTimeout(() => {
    console.log('✅ Smart polling demo completed\n');
  }, 20000);
}

async function demoMultiPolling() {
  console.log('\n🔄 Demo 3: Multi-Endpoint Polling');
  console.log('=' .repeat(40));
  
  const poller = new NessiePoller();
  
  const endpoints = [
    { endpoint: '/atms' },
    { endpoint: '/accounts' },
    { endpoint: '/customers' },
    { endpoint: '/merchants' }
  ];

  try {
    const results = await poller.pollMultiple(endpoints);
    
    results.forEach(result => {
      if (result.success) {
        console.log(`✅ ${result.endpoint}: ${result.data.length} items`);
      } else {
        console.log(`❌ ${result.endpoint}: ${result.error.message}`);
      }
    });
  } catch (error) {
    console.error('❌ Multi-polling failed:', error);
  }
  
  console.log('✅ Multi-polling demo completed\n');
}

async function demoConditionalPolling() {
  console.log('\n🎯 Demo 4: Conditional Polling (Stop when condition met)');
  console.log('=' .repeat(55));
  
  const poller = new NessiePoller({
    pollInterval: 2000,
    onData: (data, endpoint) => {
      console.log(`🔍 Checking ${data.length} ATMs...`);
      
      // Example condition: Stop when we find an ATM in a specific city
      const targetCity = 'Alexandria';
      const foundATM = data.find(atm => 
        atm.address && atm.address.city === targetCity
      );
      
      if (foundATM) {
        console.log(`🎉 Found ATM in ${targetCity}: ${foundATM.name}`);
        console.log('📍 Address:', foundATM.address);
        poller.stopPolling();
        console.log('✅ Conditional polling demo completed\n');
      }
    }
  });

  poller.startPolling('/atms');
  
  // Safety timeout
  setTimeout(() => {
    if (poller.isPolling) {
      console.log('⏰ Timeout reached, stopping conditional polling');
      poller.stopPolling();
    }
  }, 30000);
}

// Main execution
async function runAllDemos() {
  console.log('🚀 Starting Nessie API Polling Demos');
  console.log('=' .repeat(50));
  
  try {
    // Run demos sequentially
    await demoBasicPolling();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait between demos
    
    await demoSmartPolling();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await demoMultiPolling();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await demoConditionalPolling();
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
  
  console.log('🎉 All polling demos completed!');
}

// Export for use in other files
module.exports = { NessiePoller };

// Run demos if this file is executed directly
if (require.main === module) {
  runAllDemos();
}
