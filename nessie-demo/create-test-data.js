const request = require('superagent');

const API_KEY = '5b55b663fcacb05e663e5ce3ea9815ff';
const BASE_URL = 'http://api.nessieisreal.com';

class NessieDataCreator {
  constructor() {
    this.apiKey = API_KEY;
    this.baseUrl = BASE_URL;
    this.createdData = {
      customerId: null,
      accountIds: [],
      depositIds: [],
      purchaseIds: []
    };
  }

  // Create a customer
  async createCustomer() {
    const customerData = {
      first_name: "John",
      last_name: "Doe",
      address: {
        street_number: "123",
        street_name: "Main Street",
        city: "Springfield",
        state: "IL",
        zip: "62701"
      }
    };

    try {
      console.log('👤 Creating customer...');
      const response = await request
        .post(`${this.baseUrl}/customers?key=${this.apiKey}`)
        .send(customerData)
        .timeout(10000);

      this.createdData.customerId = response.body.objectCreated._id;
      console.log(`✅ Customer created: ${this.createdData.customerId}`);
      console.log(`   Name: ${customerData.first_name} ${customerData.last_name}`);
      console.log(`   Address: ${customerData.address.street_number} ${customerData.address.street_name}, ${customerData.address.city}, ${customerData.address.state}`);
      
      return this.createdData.customerId;
    } catch (error) {
      console.error('❌ Error creating customer:', error.message);
      if (error.response) {
        console.error('Response:', error.response.text);
      }
      throw error;
    }
  }

  // Create checking account
  async createCheckingAccount(customerId) {
    const accountData = {
      type: "Checking",
      nickname: "My Checking Account",
      rewards: 0,
      balance: 5000
    };

    try {
      console.log('💳 Creating checking account...');
      const response = await request
        .post(`${this.baseUrl}/customers/${customerId}/accounts?key=${this.apiKey}`)
        .send(accountData)
        .timeout(10000);

      const accountId = response.body.objectCreated._id;
      this.createdData.accountIds.push(accountId);
      console.log(`✅ Checking account created: ${accountId}`);
      console.log(`   Balance: $${accountData.balance}`);
      console.log(`   Type: ${accountData.type}`);
      
      return accountId;
    } catch (error) {
      console.error('❌ Error creating checking account:', error.message);
      if (error.response) {
        console.error('Response:', error.response.text);
      }
      throw error;
    }
  }

  // Create savings account
  async createSavingsAccount(customerId) {
    const accountData = {
      type: "Savings",
      nickname: "My Savings Account",
      rewards: 0,
      balance: 15000
    };

    try {
      console.log('💰 Creating savings account...');
      const response = await request
        .post(`${this.baseUrl}/customers/${customerId}/accounts?key=${this.apiKey}`)
        .send(accountData)
        .timeout(10000);

      const accountId = response.body.objectCreated._id;
      this.createdData.accountIds.push(accountId);
      console.log(`✅ Savings account created: ${accountId}`);
      console.log(`   Balance: $${accountData.balance}`);
      console.log(`   Type: ${accountData.type}`);
      
      return accountId;
    } catch (error) {
      console.error('❌ Error creating savings account:', error.message);
      if (error.response) {
        console.error('Response:', error.response.text);
      }
      throw error;
    }
  }

  // Create deposits for an account
  async createDeposits(accountId, count = 8) {
    const deposits = [];
    let currentDate = new Date();
    for (let i = 0; i < count; i++) {
      const depositData = {
        medium: "balance",
        transaction_date: currentDate.setDate(currentDate.getDate() - 14),
        amount: Math.floor(Math.random() * 2000) + 500, // Random amount between $500-$2500
        description: `Bi-Weekly Salary`
      };

      try {
        console.log(`💵 Creating deposit ${i + 1}...`);
        const response = await request
          .post(`${this.baseUrl}/accounts/${accountId}/deposits?key=${this.apiKey}`)
          .send(depositData)
          .timeout(10000);

        const depositId = response.body.objectCreated._id;
        this.createdData.depositIds.push(depositId);
        deposits.push(depositId);
        
        console.log(`✅ Deposit ${i + 1} created: ${depositId}`);
        console.log(`   Amount: $${depositData.amount}`);
        console.log(`   Description: ${depositData.description}`);
        
      } catch (error) {
        console.error(`❌ Error creating deposit ${i + 1}:`, error.message);
        if (error.response) {
          console.error('Response:', error.response.text);
        }
      }
    }
    
    return deposits;
  }

  // Create purchases for an account
  async createPurchases(accountId, count = 23) {
    const purchases = [];
    
    for (let i = 0; i < count; i++) {
      let currentDate = new Date();
      const purchaseData = {
        medium: "balance",
        amount: Math.floor(Math.random() * 200) + 10, // Random amount between $10-$210
        description: `Purchase ${i + 1} - Transaction`,
        purchase_date: currentDate.setDate(currentDate.getDate() - Math.floor(Math.random() * 3))
      };

      try {
        console.log(`🛒 Creating purchase ${i + 1}...`);
        const response = await request
          .post(`${this.baseUrl}/accounts/${accountId}/purchases?key=${this.apiKey}`)
          .send(purchaseData)
          .timeout(10000);

        const purchaseId = response.body.objectCreated._id;
        this.createdData.purchaseIds.push(purchaseId);
        purchases.push(purchaseId);
        
        console.log(`✅ Purchase ${i + 1} created: ${purchaseId}`);
        console.log(`   Amount: $${purchaseData.amount}`);
        console.log(`   Description: ${purchaseData.description}`);
        
      } catch (error) {
        console.error(`❌ Error creating purchase ${i + 1}:`, error.message);
        if (error.response) {
          console.error('Response:', error.response.text);
        }
      }
    }
    
    return purchases;
  }

  // Create all test data
  async createAllTestData() {
    console.log('🚀 Creating comprehensive test data for WealthScore...\n');
    
    try {
      // 1. Create customer
      const customerId = await this.createCustomer();
      console.log('');
      
      // 2. Create accounts
      const checkingAccountId = await this.createCheckingAccount(customerId);
      console.log('');
      const savingsAccountId = await this.createSavingsAccount(customerId);
      console.log('');
      
      // 3. Create deposits for checking account
      console.log('Creating deposits for checking account...');
      await this.createDeposits(checkingAccountId, 3);
      console.log('');
      
      // 4. Create deposits for savings account
      console.log('Creating deposits for savings account...');
      await this.createDeposits(savingsAccountId, 2);
      console.log('');
      
      // 5. Create purchases for checking account
      console.log('Creating purchases for checking account...');
      await this.createPurchases(checkingAccountId, 5);
      console.log('');
      
      // 6. Create purchases for savings account (fewer)
      console.log('Creating purchases for savings account...');
      await this.createPurchases(savingsAccountId, 2);
      console.log('');
      
      // Summary
      console.log('📊 CREATED DATA SUMMARY:');
      console.log('=' .repeat(40));
      console.log(`👤 Customer: ${this.createdData.customerId}`);
      console.log(`💳 Accounts: ${this.createdData.accountIds.length}`);
      console.log(`💵 Deposits: ${this.createdData.depositIds.length}`);
      console.log(`🛒 Purchases: ${this.createdData.purchaseIds.length}`);
      console.log('');
      console.log('✅ All test data created successfully!');
      
      return this.createdData;
      
    } catch (error) {
      console.error('❌ Error creating test data:', error.message);
      throw error;
    }
  }

  // Get summary of created data
  getCreatedDataSummary() {
    return {
      customerId: this.createdData.customerId,
      accountIds: this.createdData.accountIds,
      depositIds: this.createdData.depositIds,
      purchaseIds: this.createdData.purchaseIds,
      totalAccounts: this.createdData.accountIds.length,
      totalDeposits: this.createdData.depositIds.length,
      totalPurchases: this.createdData.purchaseIds.length
    };
  }
}

// Demo usage
async function createTestDataDemo() {
  const creator = new NessieDataCreator();
  
  try {
    const createdData = await creator.createAllTestData();
    
    console.log('\n🎯 Ready for polling! You can now use these IDs:');
    console.log(`Customer ID: ${createdData.customerId}`);
    console.log(`Account IDs: ${createdData.accountIds.join(', ')}`);
    
    return createdData;
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }
}

// Run the demo
if (require.main === module) {
  createTestDataDemo();
}

module.exports = { NessieDataCreator };
