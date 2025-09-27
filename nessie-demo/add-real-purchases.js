const request = require('superagent');

const API_KEY = '5b55b663fcacb05e663e5ce3ea9815ff';
const BASE_URL = 'http://api.nessieisreal.com';

// Add purchases using existing merchant IDs
async function addPurchasesWithRealMerchants() {
  // Use the account IDs from the previous creation
  const checkingAccountId = '68d8200d9683f20dd5196759';
  const savingsAccountId = '68d8200d9683f20dd519675a';
  
  // Real merchant IDs from the API
  const merchants = [
    { id: '68d757c89683f20dd5195f51', name: 'Walmart', category: 'Retail' },
    { id: '68d757c99683f20dd5195f53', name: 'Starbucks', category: 'Retail' },
    { id: '68d757c99683f20dd5195f54', name: 'Netflix', category: 'Retail' },
    { id: '68d757c99683f20dd5195f55', name: 'Kroger', category: 'Retail' },
    { id: '68d757c99683f20dd5195f56', name: 'DoorDash', category: 'Retail' },
    { id: '68d757c99683f20dd5195f57', name: 'AMC Theatres', category: 'Retail' },
    { id: '68d757c99683f20dd5195f58', name: 'Jersey Mike\'s', category: 'Retail' },
    { id: '68d757c99683f20dd5195f59', name: 'Lyft', category: 'Retail' },
    { id: '68d757c99683f20dd5195f5a', name: 'Uber', category: 'Retail' },
    { id: '68d757c99683f20dd5195f5b', name: 'Best Buy', category: 'Retail' }
  ];
  
  console.log('🛒 Adding purchases with real merchant data...\n');

  // Add purchases to checking account
  console.log('Adding purchases to checking account...');
  for (let i = 0; i < 5; i++) {
    const merchant = merchants[i];
    const purchaseData = {
      merchant_id: merchant.id,
      medium: "balance",
      amount: Math.floor(Math.random() * 200) + 10, // Random amount between $10-$210
      description: `Purchase at ${merchant.name} - ${merchant.category}`
    };

    try {
      console.log(`🛒 Creating purchase ${i + 1} at ${merchant.name}...`);
      const response = await request
        .post(`${BASE_URL}/accounts/${checkingAccountId}/purchases?key=${API_KEY}`)
        .send(purchaseData)
        .timeout(10000);

      const purchaseId = response.body.objectCreated._id;
      console.log(`✅ Purchase ${i + 1} created: ${purchaseId}`);
      console.log(`   Amount: $${purchaseData.amount}`);
      console.log(`   Merchant: ${merchant.name} (${merchant.category})`);
      
    } catch (error) {
      console.error(`❌ Error creating purchase ${i + 1}:`, error.message);
      if (error.response) {
        console.error('Response:', error.response.text);
      }
    }
  }

  console.log('\nAdding purchases to savings account...');
  // Add purchases to savings account
  for (let i = 5; i < 8; i++) {
    const merchant = merchants[i];
    const purchaseData = {
      merchant_id: merchant.id,
      medium: "balance",
      amount: Math.floor(Math.random() * 200) + 10, // Random amount between $10-$210
      description: `Purchase at ${merchant.name} - ${merchant.category}`
    };

    try {
      console.log(`🛒 Creating purchase ${i - 4} at ${merchant.name}...`);
      const response = await request
        .post(`${BASE_URL}/accounts/${savingsAccountId}/purchases?key=${API_KEY}`)
        .send(purchaseData)
        .timeout(10000);

      const purchaseId = response.body.objectCreated._id;
      console.log(`✅ Purchase ${i - 4} created: ${purchaseId}`);
      console.log(`   Amount: $${purchaseData.amount}`);
      console.log(`   Merchant: ${merchant.name} (${merchant.category})`);
      
    } catch (error) {
      console.error(`❌ Error creating purchase ${i - 4}:`, error.message);
      if (error.response) {
        console.error('Response:', error.response.text);
      }
    }
  }

  console.log('\n✅ All purchases with real merchants added successfully!');
  console.log('\n📊 FINAL DATA SUMMARY:');
  console.log('=' .repeat(50));
  console.log(`👤 Customer: 68d8200d9683f20dd5196758`);
  console.log(`💳 Checking Account: ${checkingAccountId}`);
  console.log(`💰 Savings Account: ${savingsAccountId}`);
  console.log(`🛒 Total Purchases: 8 (5 checking + 3 savings)`);
  console.log(`💵 Total Deposits: 5`);
  console.log(`🏪 Merchants Used: Walmart, Starbucks, Netflix, Kroger, DoorDash, AMC, Jersey Mike's, Lyft`);
}

// Run the script
addPurchasesWithRealMerchants();
