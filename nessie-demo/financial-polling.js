const request = require('superagent');

const API_KEY = '5b55b663fcacb05e663e5ce3ea9815ff';
const BASE_URL = 'http://api.nessieisreal.com';

// Real financial data polling for WealthScore application
class FinancialDataPoller {
  constructor() {
    this.apiKey = API_KEY;
    this.baseUrl = BASE_URL;
    this.isPolling = false;
    this.pollTimer = null;
    this.lastData = {
      accounts: null,
      transactions: null,
      bills: null,
      deposits: null
    };
  }

  // Poll account data
  async pollAccounts() {
    try {
      const response = await request
        .get(`${this.baseUrl}/accounts?key=${this.apiKey}`)
        .timeout(5000);
      
      const accounts = response.body?.data || [];
      console.log(`💳 Accounts: ${accounts.length} accounts found`);
      
      if (accounts.length > 0) {
        const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
        console.log(`💰 Total Balance: $${totalBalance.toLocaleString()}`);
        
        accounts.forEach(account => {
          console.log(`  - ${account.nickname || account._id}: $${account.balance?.toLocaleString() || 0}`);
        });
      }
      
      this.lastData.accounts = accounts;
      return accounts;
    } catch (error) {
      console.error(`❌ Error polling accounts: ${error.message}`);
      return null;
    }
  }

  // Poll transaction data
  async pollTransactions(accountId) {
    try {
      const response = await request
        .get(`${this.baseUrl}/accounts/${accountId}/transactions?key=${this.apiKey}`)
        .timeout(5000);
      
      const transactions = response.body?.data || [];
      console.log(`📊 Transactions: ${transactions.length} transactions found`);
      
      if (transactions.length > 0) {
        const recentTransactions = transactions.slice(0, 3);
        console.log(`🔄 Recent transactions:`);
        recentTransactions.forEach(transaction => {
          const amount = transaction.amount || 0;
          const type = amount > 0 ? '💰 Deposit' : '💸 Withdrawal';
          console.log(`  ${type}: $${Math.abs(amount).toLocaleString()} - ${transaction.description || 'No description'}`);
        });
      }
      
      this.lastData.transactions = transactions;
      return transactions;
    } catch (error) {
      console.error(`❌ Error polling transactions: ${error.message}`);
      return null;
    }
  }

  // Poll bills data
  async pollBills(accountId) {
    try {
      const response = await request
        .get(`${this.baseUrl}/accounts/${accountId}/bills?key=${this.apiKey}`)
        .timeout(5000);
      
      const bills = response.body?.data || [];
      console.log(`📋 Bills: ${bills.length} bills found`);
      
      if (bills.length > 0) {
        const totalBills = bills.reduce((sum, bill) => sum + (bill.payment_amount || 0), 0);
        console.log(`💸 Total Bills: $${totalBills.toLocaleString()}`);
        
        bills.forEach(bill => {
          const status = bill.status || 'Unknown';
          const amount = bill.payment_amount || 0;
          console.log(`  - ${bill.payee || 'Unknown'}: $${amount.toLocaleString()} (${status})`);
        });
      }
      
      this.lastData.bills = bills;
      return bills;
    } catch (error) {
      console.error(`❌ Error polling bills: ${error.message}`);
      return null;
    }
  }

  // Poll deposits data
  async pollDeposits(accountId) {
    try {
      const response = await request
        .get(`${this.baseUrl}/accounts/${accountId}/deposits?key=${this.apiKey}`)
        .timeout(5000);
      
      const deposits = response.body?.data || [];
      console.log(`💵 Deposits: ${deposits.length} deposits found`);
      
      if (deposits.length > 0) {
        const totalDeposits = deposits.reduce((sum, deposit) => sum + (deposit.amount || 0), 0);
        console.log(`📈 Total Deposits: $${totalDeposits.toLocaleString()}`);
        
        deposits.slice(0, 3).forEach(deposit => {
          console.log(`  - $${deposit.amount?.toLocaleString() || 0} - ${deposit.description || 'No description'}`);
        });
      }
      
      this.lastData.deposits = deposits;
      return deposits;
    } catch (error) {
      console.error(`❌ Error polling deposits: ${error.message}`);
      return null;
    }
  }

  // Calculate wealth score based on current data
  calculateWealthScore() {
    const accounts = this.lastData.accounts || [];
    const transactions = this.lastData.transactions || [];
    const bills = this.lastData.bills || [];
    const deposits = this.lastData.deposits || [];

    if (accounts.length === 0) {
      console.log('📊 Wealth Score: No data available');
      return 0;
    }

    // Simple wealth score calculation
    const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
    const totalBills = bills.reduce((sum, bill) => sum + (bill.payment_amount || 0), 0);
    const totalDeposits = deposits.reduce((sum, deposit) => sum + (deposit.amount || 0), 0);
    
    // Wealth score factors:
    // 1. Account balance (40%)
    // 2. Deposit frequency (30%) 
    // 3. Bill management (20%)
    // 4. Transaction activity (10%)
    
    const balanceScore = Math.min(totalBalance / 10000, 100) * 0.4; // Max 100 points for $10k+
    const depositScore = Math.min(deposits.length * 10, 100) * 0.3; // Max 100 points for 10+ deposits
    const billScore = bills.length > 0 ? Math.min(100 - (totalBills / totalBalance * 100), 100) * 0.2 : 50 * 0.2;
    const transactionScore = Math.min(transactions.length * 2, 100) * 0.1; // Max 100 points for 50+ transactions
    
    const wealthScore = Math.round(balanceScore + depositScore + billScore + transactionScore);
    
    console.log(`\n📊 WEALTH SCORE CALCULATION:`);
    console.log(`💰 Balance Score: ${Math.round(balanceScore)}/40 ($${totalBalance.toLocaleString()})`);
    console.log(`📈 Deposit Score: ${Math.round(depositScore)}/30 (${deposits.length} deposits)`);
    console.log(`💸 Bill Score: ${Math.round(billScore)}/20 ($${totalBills.toLocaleString()} bills)`);
    console.log(`🔄 Transaction Score: ${Math.round(transactionScore)}/10 (${transactions.length} transactions)`);
    console.log(`🎯 TOTAL WEALTH SCORE: ${wealthScore}/100`);
    
    return wealthScore;
  }

  // Start comprehensive financial data polling
  async startFinancialPolling() {
    if (this.isPolling) {
      console.log('⚠️ Already polling financial data');
      return;
    }

    this.isPolling = true;
    console.log('🚀 Starting financial data polling...\n');

    const pollFinancialData = async () => {
      console.log(`\n⏰ ${new Date().toLocaleTimeString()} - Polling Financial Data`);
      console.log('=' .repeat(50));

      try {
        // Poll accounts first
        const accounts = await this.pollAccounts();
        
        if (accounts && accounts.length > 0) {
          const firstAccountId = accounts[0]._id;
          
          // Poll related data for the first account
          await Promise.all([
            this.pollTransactions(firstAccountId),
            this.pollBills(firstAccountId),
            this.pollDeposits(firstAccountId)
          ]);
          
          // Calculate and display wealth score
          this.calculateWealthScore();
        }
        
      } catch (error) {
        console.error('❌ Error in financial polling:', error.message);
      }
    };

    // Initial poll
    await pollFinancialData();
    
    // Set up interval polling every 10 seconds
    this.pollTimer = setInterval(pollFinancialData, 10000);
  }

  // Stop polling
  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.isPolling = false;
    console.log('🛑 Financial data polling stopped');
  }
}

// Demo usage
async function runFinancialPollingDemo() {
  const poller = new FinancialDataPoller();
  
  // Start polling
  await poller.startFinancialPolling();
  
  // Stop after 30 seconds
  setTimeout(() => {
    poller.stopPolling();
    console.log('\n🎉 Financial polling demo completed!');
    process.exit(0);
  }, 30000);
}

// Run the demo
if (require.main === module) {
  runFinancialPollingDemo();
}

module.exports = { FinancialDataPoller };
