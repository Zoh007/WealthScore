const request = require('superagent');

const API_KEY = '5b55b663fcacb05e663e5ce3ea9815ff';
const BASE_URL = 'http://api.nessieisreal.com';

class MultiCustomerDataCreator {
  constructor() {
    this.apiKey = API_KEY;
    this.baseUrl = BASE_URL;
    this.createdData = {
      customers: [],
      accounts: [],
      deposits: [],
      purchases: [],
      bills: [],
      transfers: [],
      withdrawals: []
    };
  }

  // Create multiple customers with different profiles
  async createCustomers() {
    const customerProfiles = [
      {
        first_name: "Sarah",
        last_name: "Johnson",
        address: {
          street_number: "123",
          street_name: "Oak Street",
          city: "San Francisco",
          state: "CA",
          zip: "94102"
        }
      },
      {
        first_name: "Michael",
        last_name: "Chen",
        address: {
          street_number: "456",
          street_name: "Maple Avenue",
          city: "Austin",
          state: "TX",
          zip: "73301"
        }
      },
      {
        first_name: "Emily",
        last_name: "Rodriguez",
        address: {
          street_number: "789",
          street_name: "Pine Drive",
          city: "Miami",
          state: "FL",
          zip: "33101"
        }
      }
    ];

    console.log('👥 Creating 3 customers with different profiles...\n');

    for (let i = 0; i < customerProfiles.length; i++) {
      const profile = customerProfiles[i];
      
      try {
        console.log(`👤 Creating customer ${i + 1}: ${profile.first_name} ${profile.last_name}...`);
        const response = await request
          .post(`${this.baseUrl}/customers?key=${this.apiKey}`)
          .send(profile)
          .timeout(10000);

        const customerId = response.body.objectCreated._id;
        this.createdData.customers.push({
          id: customerId,
          name: `${profile.first_name} ${profile.last_name}`,
          city: profile.address.city,
          state: profile.address.state
        });
        
        console.log(`✅ Customer ${i + 1} created: ${customerId}`);
        console.log(`   Name: ${profile.first_name} ${profile.last_name}`);
        console.log(`   Location: ${profile.address.city}, ${profile.address.state}\n`);
        
      } catch (error) {
        console.error(`❌ Error creating customer ${i + 1}:`, error.message);
        if (error.response) {
          console.error('Response:', error.response.text);
        }
      }
    }

    return this.createdData.customers;
  }

  // Create multiple accounts for each customer
  async createAccountsForCustomer(customerId, customerName, accountTypes) {
    const accounts = [];
    
    for (const accountType of accountTypes) {
      const accountData = {
        type: accountType.type,
        nickname: `${customerName}'s ${accountType.type} Account`,
        rewards: accountType.rewards || 0,
        balance: accountType.balance
      };

      try {
        console.log(`💳 Creating ${accountType.type} account for ${customerName}...`);
        const response = await request
          .post(`${this.baseUrl}/customers/${customerId}/accounts?key=${this.apiKey}`)
          .send(accountData)
          .timeout(10000);

        const accountId = response.body.objectCreated._id;
        accounts.push({
          id: accountId,
          type: accountType.type,
          balance: accountType.balance,
          customerId: customerId
        });
        
        this.createdData.accounts.push({
          id: accountId,
          type: accountType.type,
          balance: accountType.balance,
          customerId: customerId,
          customerName: customerName
        });
        
        console.log(`✅ ${accountType.type} account created: ${accountId}`);
        console.log(`   Balance: $${accountType.balance.toLocaleString()}\n`);
        
      } catch (error) {
        console.error(`❌ Error creating ${accountType.type} account:`, error.message);
        if (error.response) {
          console.error('Response:', error.response.text);
        }
      }
    }
    
    return accounts;
  }

  // Create deposits for accounts
  async createDepositsForAccount(accountId, accountType, customerName, count = 3) {
    const deposits = [];
    
    for (let i = 0; i < count; i++) {
      const depositData = {
        medium: "balance",
        amount: Math.floor(Math.random() * 3000) + 500, // Random amount between $500-$3500
        description: `Deposit ${i + 1} - ${this.getDepositDescription(accountType)}`
      };

      try {
        console.log(`💵 Creating deposit ${i + 1} for ${customerName}'s ${accountType} account...`);
        const response = await request
          .post(`${this.baseUrl}/accounts/${accountId}/deposits?key=${this.apiKey}`)
          .send(depositData)
          .timeout(10000);

        const depositId = response.body.objectCreated._id;
        deposits.push(depositId);
        this.createdData.deposits.push({
          id: depositId,
          accountId: accountId,
          amount: depositData.amount,
          description: depositData.description
        });
        
        console.log(`✅ Deposit ${i + 1} created: ${depositId}`);
        console.log(`   Amount: $${depositData.amount.toLocaleString()}`);
        console.log(`   Description: ${depositData.description}\n`);
        
      } catch (error) {
        console.error(`❌ Error creating deposit ${i + 1}:`, error.message);
        if (error.response) {
          console.error('Response:', error.response.text);
        }
      }
    }
    
    return deposits;
  }

  // Create purchases for accounts
  async createPurchasesForAccount(accountId, accountType, customerName, count = 5) {
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

    const purchases = [];
    
    for (let i = 0; i < count; i++) {
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];
      const purchaseData = {
        merchant_id: merchant.id,
        medium: "balance",
        amount: Math.floor(Math.random() * 300) + 10, // Random amount between $10-$310
        description: `Purchase at ${merchant.name} - ${merchant.category}`
      };

      try {
        console.log(`🛒 Creating purchase ${i + 1} at ${merchant.name} for ${customerName}...`);
        const response = await request
          .post(`${this.baseUrl}/accounts/${accountId}/purchases?key=${this.apiKey}`)
          .send(purchaseData)
          .timeout(10000);

        const purchaseId = response.body.objectCreated._id;
        purchases.push(purchaseId);
        this.createdData.purchases.push({
          id: purchaseId,
          accountId: accountId,
          merchant: merchant.name,
          amount: purchaseData.amount,
          description: purchaseData.description
        });
        
        console.log(`✅ Purchase ${i + 1} created: ${purchaseId}`);
        console.log(`   Amount: $${purchaseData.amount.toLocaleString()}`);
        console.log(`   Merchant: ${merchant.name} (${merchant.category})\n`);
        
      } catch (error) {
        console.error(`❌ Error creating purchase ${i + 1}:`, error.message);
        if (error.response) {
          console.error('Response:', error.response.text);
        }
      }
    }
    
    return purchases;
  }

  // Create bills for accounts
  async createBillsForAccount(accountId, accountType, customerName, count = 3) {
    const billTypes = [
      { payee: 'Electric Company', amount: 120, status: 'pending' },
      { payee: 'Water Department', amount: 85, status: 'paid' },
      { payee: 'Internet Provider', amount: 65, status: 'pending' },
      { payee: 'Phone Company', amount: 95, status: 'paid' },
      { payee: 'Insurance Company', amount: 200, status: 'pending' }
    ];

    const bills = [];
    
    for (let i = 0; i < count; i++) {
      const billType = billTypes[Math.floor(Math.random() * billTypes.length)];
      const billData = {
        status: billType.status,
        payee: billType.payee,
        payment_amount: billType.amount,
        payment_date: new Date().toISOString().split('T')[0]
      };

      try {
        console.log(`📋 Creating bill ${i + 1} for ${customerName}'s ${accountType} account...`);
        const response = await request
          .post(`${this.baseUrl}/accounts/${accountId}/bills?key=${this.apiKey}`)
          .send(billData)
          .timeout(10000);

        const billId = response.body.objectCreated._id;
        bills.push(billId);
        this.createdData.bills.push({
          id: billId,
          accountId: accountId,
          payee: billType.payee,
          amount: billType.amount,
          status: billType.status
        });
        
        console.log(`✅ Bill ${i + 1} created: ${billId}`);
        console.log(`   Payee: ${billType.payee}`);
        console.log(`   Amount: $${billType.amount.toLocaleString()}`);
        console.log(`   Status: ${billType.status}\n`);
        
      } catch (error) {
        console.error(`❌ Error creating bill ${i + 1}:`, error.message);
        if (error.response) {
          console.error('Response:', error.response.text);
        }
      }
    }
    
    return bills;
  }

  // Helper function to get deposit descriptions
  getDepositDescription(accountType) {
    const descriptions = {
      'Checking': ['Salary Deposit', 'Freelance Payment', 'Tax Refund'],
      'Savings': ['Emergency Fund', 'Investment Transfer', 'Bonus Deposit'],
      'Credit Card': ['Payment Received', 'Refund Processed', 'Reward Credit']
    };
    
    const options = descriptions[accountType] || ['Deposit', 'Transfer', 'Credit'];
    return options[Math.floor(Math.random() * options.length)];
  }

  // Create comprehensive data for all customers
  async createAllData() {
    console.log('🚀 Creating comprehensive financial data for 3 customers...\n');
    
    try {
      // 1. Create customers
      const customers = await this.createCustomers();
      
      // 2. Create accounts and transactions for each customer
      for (let i = 0; i < customers.length; i++) {
        const customer = customers[i];
        console.log(`\n🏦 Setting up accounts for ${customer.name}...`);
        
        // Different account profiles for each customer
        const accountProfiles = [
          [
            { type: 'Checking', balance: 5000, rewards: 0 },
            { type: 'Savings', balance: 15000, rewards: 0 }
          ],
          [
            { type: 'Checking', balance: 8000, rewards: 0 },
            { type: 'Savings', balance: 25000, rewards: 0 },
            { type: 'Credit Card', balance: -2000, rewards: 100 }
          ],
          [
            { type: 'Checking', balance: 3000, rewards: 0 },
            { type: 'Savings', balance: 12000, rewards: 0 }
          ]
        ];
        
        const accounts = await this.createAccountsForCustomer(
          customer.id, 
          customer.name, 
          accountProfiles[i]
        );
        
        // 3. Create deposits, purchases, and bills for each account
        for (const account of accounts) {
          console.log(`\n📊 Creating transactions for ${customer.name}'s ${account.type} account...`);
          
          await Promise.all([
            this.createDepositsForAccount(account.id, account.type, customer.name, 3),
            this.createPurchasesForAccount(account.id, account.type, customer.name, 4),
            this.createBillsForAccount(account.id, account.type, customer.name, 2)
          ]);
        }
      }
      
      // Summary
      console.log('\n📊 COMPREHENSIVE DATA SUMMARY:');
      console.log('=' .repeat(60));
      console.log(`👥 Customers: ${this.createdData.customers.length}`);
      console.log(`💳 Accounts: ${this.createdData.accounts.length}`);
      console.log(`💵 Deposits: ${this.createdData.deposits.length}`);
      console.log(`🛒 Purchases: ${this.createdData.purchases.length}`);
      console.log(`📋 Bills: ${this.createdData.bills.length}`);
      
      console.log('\n👥 CUSTOMER DETAILS:');
      this.createdData.customers.forEach((customer, index) => {
        const customerAccounts = this.createdData.accounts.filter(acc => acc.customerId === customer.id);
        const totalBalance = customerAccounts.reduce((sum, acc) => sum + acc.balance, 0);
        console.log(`${index + 1}. ${customer.name} (${customer.city}, ${customer.state})`);
        console.log(`   Accounts: ${customerAccounts.length} | Total Balance: $${totalBalance.toLocaleString()}`);
        customerAccounts.forEach(acc => {
          console.log(`   - ${acc.type}: $${acc.balance.toLocaleString()}`);
        });
      });
      
      console.log('\n✅ All comprehensive data created successfully!');
      
      return this.createdData;
      
    } catch (error) {
      console.error('❌ Error creating comprehensive data:', error.message);
      throw error;
    }
  }

  // Get summary of created data
  getCreatedDataSummary() {
    return {
      customers: this.createdData.customers,
      accounts: this.createdData.accounts,
      deposits: this.createdData.deposits,
      purchases: this.createdData.purchases,
      bills: this.createdData.bills,
      totalCustomers: this.createdData.customers.length,
      totalAccounts: this.createdData.accounts.length,
      totalDeposits: this.createdData.deposits.length,
      totalPurchases: this.createdData.purchases.length,
      totalBills: this.createdData.bills.length
    };
  }
}

// Demo usage
async function createComprehensiveDataDemo() {
  const creator = new MultiCustomerDataCreator();
  
  try {
    const createdData = await creator.createAllData();
    
    console.log('\n🎯 Ready for multi-customer polling! You can now use these customer IDs:');
    createdData.customers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.name}: ${customer.id}`);
    });
    
    return createdData;
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }
}

// Run the demo
if (require.main === module) {
  createComprehensiveDataDemo();
}

module.exports = { MultiCustomerDataCreator };
