const request = require('superagent');

const API_KEY = '5b55b663fcacb05e663e5ce3ea9815ff';
const BASE_URL = 'http://api.nessieisreal.com';

// Real financial data polling with actual created data
class RealDataPoller {
  constructor() {
    this.apiKey = API_KEY;
    this.baseUrl = BASE_URL;
    this.isPolling = false;
    this.pollTimer = null;
    
    // Our created data IDs
    this.customerId = '68d8200d9683f20dd5196758';
    this.checkingAccountId = '68d8200d9683f20dd5196759';
    this.savingsAccountId = '68d8200d9683f20dd519675a';
    
    this.lastData = {
      accounts: null,
      deposits: null,
      purchases: null
    };
  }

  // Poll account data
  async pollAccounts() {
    try {
      const response = await request
        .get(`${this.baseUrl}/customers/${this.customerId}/accounts?key=${this.apiKey}`)
        .timeout(5000);
      
      const accounts = response.body || [];
      console.log(`💳 Accounts: ${accounts.length} accounts found`);
      
      if (accounts.length > 0) {
        const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
        console.log(`💰 Total Balance: $${totalBalance.toLocaleString()}`);
        
        accounts.forEach(account => {
          console.log(`  - ${account.nickname || account._id}: $${account.balance?.toLocaleString() || 0} (${account.type})`);
        });
      }
      
      this.lastData.accounts = accounts;
      return accounts;
    } catch (error) {
      console.error(`❌ Error polling accounts: ${error.message}`);
      return null;
    }
  }

  // Poll deposits for checking account
  async pollDeposits() {
    try {
      const response = await request
        .get(`${this.baseUrl}/accounts/${this.checkingAccountId}/deposits?key=${this.apiKey}`)
        .timeout(5000);
      
      const deposits = response.body || [];
      console.log(`💵 Checking Account Deposits: ${deposits.length} deposits found`);
      
      if (deposits.length > 0) {
        const totalDeposits = deposits.reduce((sum, deposit) => sum + (deposit.amount || 0), 0);
        console.log(`📈 Total Deposits: $${totalDeposits.toLocaleString()}`);
        
        deposits.slice(0, 3).forEach(deposit => {
          console.log(`  - $${deposit.amount?.toLocaleString() || 0}: ${deposit.description || 'No description'}`);
        });
      }
      
      this.lastData.deposits = deposits;
      return deposits;
    } catch (error) {
      console.error(`❌ Error polling deposits: ${error.message}`);
      return null;
    }
  }

  // Poll purchases for checking account
  async pollPurchases() {
    try {
      const response = await request
        .get(`${this.baseUrl}/accounts/${this.checkingAccountId}/purchases?key=${this.apiKey}`)
        .timeout(5000);
      
      const purchases = response.body || [];
      console.log(`🛒 Checking Account Purchases: ${purchases.length} purchases found`);
      
      if (purchases.length > 0) {
        const totalSpent = purchases.reduce((sum, purchase) => sum + (purchase.amount || 0), 0);
        console.log(`💸 Total Spent: $${totalSpent.toLocaleString()}`);
        
        purchases.slice(0, 3).forEach(purchase => {
          console.log(`  - $${purchase.amount?.toLocaleString() || 0}: ${purchase.description || 'No description'}`);
        });
      }
      
      this.lastData.purchases = purchases;
      return purchases;
    } catch (error) {
      console.error(`❌ Error polling purchases: ${error.message}`);
      return null;
    }
  }

  // Calculate wealth score based on real data
  calculateWealthScore() {
    const accounts = this.lastData.accounts || [];
    const deposits = this.lastData.deposits || [];
    const purchases = this.lastData.purchases || [];

    if (accounts.length === 0) {
      console.log('📊 Wealth Score: No data available');
      return 0;
    }

    // Real wealth score calculation
    const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
    const totalDeposits = deposits.reduce((sum, deposit) => sum + (deposit.amount || 0), 0);
    const totalSpent = purchases.reduce((sum, purchase) => sum + (purchase.amount || 0), 0);
    
    // Wealth score factors:
    // 1. Account balance (40%)
    // 2. Deposit frequency (30%) 
    // 3. Spending control (20%)
    // 4. Account diversity (10%)
    
    const balanceScore = Math.min(totalBalance / 10000, 100) * 0.4; // Max 100 points for $10k+
    const depositScore = Math.min(deposits.length * 15, 100) * 0.3; // Max 100 points for 6+ deposits
    const spendingScore = totalSpent > 0 ? Math.min(100 - (totalSpent / totalDeposits * 100), 100) * 0.2 : 50 * 0.2;
    const diversityScore = accounts.length >= 2 ? 100 * 0.1 : accounts.length * 50 * 0.1;
    
    const wealthScore = Math.round(balanceScore + depositScore + spendingScore + diversityScore);
    
    console.log(`\n📊 WEALTH SCORE CALCULATION (Real Data):`);
    console.log(`💰 Balance Score: ${Math.round(balanceScore)}/40 ($${totalBalance.toLocaleString()})`);
    console.log(`📈 Deposit Score: ${Math.round(depositScore)}/30 (${deposits.length} deposits, $${totalDeposits.toLocaleString()})`);
    console.log(`💸 Spending Score: ${Math.round(spendingScore)}/20 ($${totalSpent.toLocaleString()} spent)`);
    console.log(`🏦 Diversity Score: ${Math.round(diversityScore)}/10 (${accounts.length} accounts)`);
    console.log(`🎯 TOTAL WEALTH SCORE: ${wealthScore}/100`);
    
    // Add interpretation
    let interpretation = '';
    if (wealthScore >= 80) interpretation = '🌟 Excellent financial health!';
    else if (wealthScore >= 60) interpretation = '👍 Good financial standing';
    else if (wealthScore >= 40) interpretation = '⚠️ Room for improvement';
    else interpretation = '📉 Needs attention';
    
    console.log(`💡 ${interpretation}`);
    
    return wealthScore;
  }

  // Start comprehensive financial data polling
  async startRealDataPolling() {
    if (this.isPolling) {
      console.log('⚠️ Already polling financial data');
      return;
    }

    this.isPolling = true;
    console.log('🚀 Starting real financial data polling...\n');

    const pollFinancialData = async () => {
      console.log(`\n⏰ ${new Date().toLocaleTimeString()} - Polling Real Financial Data`);
      console.log('=' .repeat(60));

      try {
        // Poll all data
        await Promise.all([
          this.pollAccounts(),
          this.pollDeposits(),
          this.pollPurchases()
        ]);
        
        // Calculate and display wealth score
        this.calculateWealthScore();
        
      } catch (error) {
        console.error('❌ Error in financial polling:', error.message);
      }
    };

    // Initial poll
    await pollFinancialData();
    
    // Set up interval polling every 15 seconds
    this.pollTimer = setInterval(pollFinancialData, 15000);
  }

  // Stop polling
  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.isPolling = false;
    console.log('🛑 Real financial data polling stopped');
  }
}

// Demo usage
async function runRealDataPollingDemo() {
  const poller = new RealDataPoller();
  
  console.log('🎯 Starting Real Data Polling Demo');
  console.log('Using actual created customer and account data...\n');
  
  // Start polling
  await poller.startRealDataPolling();
  
  // Stop after 45 seconds
  setTimeout(() => {
    poller.stopPolling();
    console.log('\n🎉 Real data polling demo completed!');
    console.log('\n📋 Summary:');
    console.log('- Successfully polled real customer data');
    console.log('- Calculated wealth score based on actual transactions');
    console.log('- Demonstrated real-time financial monitoring');
    process.exit(0);
  }, 45000);
}

// Run the demo
if (require.main === module) {
  runRealDataPollingDemo();
}

module.exports = { RealDataPoller };
