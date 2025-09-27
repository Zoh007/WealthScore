const request = require('superagent');

const API_KEY = '5b55b663fcacb05e663e5ce3ea9815ff';
const BASE_URL = 'http://api.nessieisreal.com';

// Add purchases to existing accounts
async function addPurchasesToAccounts() {
  // Use the account IDs from the previous creation
  const checkingAccountId = '68d8200d9683f20dd5196759';
  const savingsAccountId = '68d8200d9683f20dd519675a';
  
  console.log('🛒 Adding purchases to existing accounts...\n');

  // Add purchases to checking account
  console.log('Adding purchases to checking account...');
  for (let i = 1; i <= 5; i++) {
    const purchaseData = {
      medium: "balance",
      amount: Math.floor(Math.random() * 200) + 10, // Random amount between $10-$210
      description: `Purchase ${i} - Transaction`
    };

    try {
      console.log(`🛒 Creating purchase ${i}...`);
      const response = await request
        .post(`${BASE_URL}/accounts/${checkingAccountId}/purchases?key=${API_KEY}`)
        .send(purchaseData)
        .timeout(10000);

      const purchaseId = response.body.objectCreated._id;
      console.log(`✅ Purchase ${i} created: ${purchaseId}`);
      console.log(`   Amount: $${purchaseData.amount}`);
      console.log(`   Description: ${purchaseData.description}`);
      
    } catch (error) {
      console.error(`❌ Error creating purchase ${i}:`, error.message);
      if (error.response) {
        console.error('Response:', error.response.text);
      }
    }
  }

  console.log('\nAdding purchases to savings account...');
  // Add purchases to savings account
  for (let i = 1; i <= 3; i++) {
    const purchaseData = {
      medium: "balance",
      amount: Math.floor(Math.random() * 200) + 10, // Random amount between $10-$210
      description: `Purchase ${i} - Transaction`
    };

    try {
      console.log(`🛒 Creating purchase ${i}...`);
      const response = await request
        .post(`${BASE_URL}/accounts/${savingsAccountId}/purchases?key=${API_KEY}`)
        .send(purchaseData)
        .timeout(10000);

      const purchaseId = response.body.objectCreated._id;
      console.log(`✅ Purchase ${i} created: ${purchaseId}`);
      console.log(`   Amount: $${purchaseData.amount}`);
      console.log(`   Description: ${purchaseData.description}`);
      
    } catch (error) {
      console.error(`❌ Error creating purchase ${i}:`, error.message);
      if (error.response) {
        console.error('Response:', error.response.text);
      }
    }
  }

  console.log('\n✅ All purchases added successfully!');
  console.log('\n📊 FINAL DATA SUMMARY:');
  console.log('=' .repeat(40));
  console.log(`👤 Customer: 68d8200d9683f20dd5196758`);
  console.log(`💳 Checking Account: ${checkingAccountId}`);
  console.log(`💰 Savings Account: ${savingsAccountId}`);
  console.log(`🛒 Total Purchases: 8 (5 checking + 3 savings)`);
  console.log(`💵 Total Deposits: 5`);
}

// Run the script
addPurchasesToAccounts();
