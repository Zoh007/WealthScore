const request = require('superagent');

const API_KEY = '5b55b663fcacb05e663e5ce3ea9815ff';
const BASE_URL = 'http://api.nessieisreal.com';

// Add purchases using existing merchant IDs
async function addPurchasesAndDeposits() {
  // Use the account IDs from the previous creation
  const checkingAccountId = '68d8200d9683f20dd5196759';
  const savingsAccountId = '68d8200d9683f20dd519675a';
  
  // Real merchant IDs from the API
  const merchants = [
    { id: '68d757c89683f20dd5195f51', name: 'Walmart', category: 'Retail' },
    { id: '68d757c99683f20dd5195f53', name: 'Starbucks', category: 'Food' },
    { id: '68d757c99683f20dd5195f54', name: 'Netflix', category: 'Entertainment' },
    { id: '68d757c99683f20dd5195f55', name: 'Kroger', category: 'Retail' },
    { id: '68d757c99683f20dd5195f56', name: 'DoorDash', category: 'Travel' },
    { id: '68d757c99683f20dd5195f57', name: 'AMC Theatres', category: 'Entertainment' },
    { id: '68d757c99683f20dd5195f58', name: "Jersey Mike's", category: 'Food' },
    { id: '68d757c99683f20dd5195f59', name: 'Lyft', category: 'Travel' },
    { id: '68d757c99683f20dd5195f5a', name: 'Uber', category: 'Travel' },
    { id: '68d757c99683f20dd5195f5b', name: 'Best Buy', category: 'Retail' }
  ];

  // Add purchases to checking account
  console.log('Adding purchases to checking account...');
  for (let i = 0; i < 5; i++) {
    const purchaseDate = new Date();
    const daysToSubtract = Math.floor(Math.random() * 30);
    purchaseDate.setDate(purchaseDate.getDate() - daysToSubtract);
    const formattedDate = purchaseDate.toISOString().slice(0, 10);

    const merchant = merchants[i];
    const purchaseData = {
      merchant_id: merchant.id,
      medium: "balance",
      amount: Math.floor(Math.random() * 200) + 10, // Random amount between $10-$210
      description: `Purchase at ${merchant.name} - ${merchant.category}`,
      purchase_date: formattedDate // Use the newly formatted date string
    };

    try {
      console.log(`🛒 Creating purchase ${i + 1} at ${merchant.name}...`);
      const response = await request
        .post(`${BASE_URL}/accounts/${checkingAccountId}/purchases?key=${API_KEY}`)
        .send(purchaseData)
        .timeout(10000);

      const purchaseId = response.body.objectCreated?._id || response.body._id;
      console.log(`✅ Purchase ${i + 1} created: ${purchaseId}`);
      console.log(`   Amount: $${purchaseData.amount}`);
      console.log(`   Merchant: ${merchant.name} (${merchant.category})`);
      console.log(`   Date: ${purchaseData.purchase_date}`);
      
    } catch (error) {
      console.error(`❌ Error creating purchase ${i + 1}:`, error.message || error);
      if (error.response) {
        console.error('Response:', error.response.text || error.response.body);
      }
    }
  }

  console.log('\nAdding purchases to savings account...');
  // Add purchases to savings account
  for (let i = 5; i < 8; i++) {
    const purchaseDate = new Date();
    const daysToSubtract = Math.floor(Math.random() * 30);
    purchaseDate.setDate(purchaseDate.getDate() - daysToSubtract);
    const formattedDate = purchaseDate.toISOString().slice(0, 10);

    const merchant = merchants[i];
    const purchaseData = {
      merchant_id: merchant.id,
      medium: "balance",
      amount: Math.floor(Math.random() * 200) + 10, // Random amount between $10-$210
      description: `Purchase at ${merchant.name} - ${merchant.category}`,
      purchase_date: formattedDate // Use the newly formatted date string
    };

    try {
      console.log(`🛒 Creating purchase ${i - 4} at ${merchant.name}...`);
      const response = await request
        .post(`${BASE_URL}/accounts/${savingsAccountId}/purchases?key=${API_KEY}`)
        .send(purchaseData)
        .timeout(10000);

      const purchaseId = response.body.objectCreated?._id || response.body._id;
      console.log(`✅ Purchase ${i - 4} created: ${purchaseId}`);
      console.log(`   Amount: $${purchaseData.amount}`);
      console.log(`   Merchant: ${merchant.name} (${merchant.category})`);
      console.log(`   Date: ${purchaseData.purchase_date}`);
      
    } catch (error) {
      console.error(`❌ Error creating purchase ${i - 4}:`, error.message || error);
      if (error.response) {
        console.error('Response:', error.response.text || error.response.body);
      }
    }
  }

  console.log('\nAdding deposits to checking account...');
  // add deposits to checking account
  for (let i = 0; i < 4; i++) {
    const depositDate = new Date();
    depositDate.setDate(depositDate.getDate() - (7 * i));
    const formattedDate = depositDate.toISOString().slice(0, 10);

    const depositData = {
      medium: "balance",
      amount: Math.floor(Math.random() * 200) + 100, // Random amount between $100-$310
      description: `Weekly Wage`,
      transaction_date: formattedDate // Use the newly formatted date string
    };

    try {
      const response = await request
        .post(`${BASE_URL}/accounts/${checkingAccountId}/deposits?key=${API_KEY}`)
        .send(depositData)
        .timeout(10000);

      const depositId = response.body.objectCreated?._id || response.body._id;
      console.log(`✅ Deposit ${i + 1} created: ${depositId}`);
      console.log(`   Amount: $${depositData.amount}`);
      console.log(`   Date: ${depositData.transaction_date}`);
      
    } catch (error) {
      console.error(`❌ Error creating deposit ${i + 1}:`, error.message || error);
      if (error.response) {
        console.error('Response:', error.response.text || error.response.body);
      }
    }
  }
}

// Run the script
addPurchasesAndDeposits();
