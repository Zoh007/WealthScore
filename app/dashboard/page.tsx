"use client";

import { Container } from "@/components/Container";
import Link from "next/link";
import Image from "next/image";
import { FinancialScoreDisplay } from "@/components/FinancialScoreDisplay";
import {
  Card,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { useFinancialData } from "@/hooks/use-financial-data";
import { useEffect } from "react";


export default function Dashboard() {
  const { data, isLoading, error, isPolling, startPolling, stopPolling, refreshData } = useFinancialData();

  // Start polling when component mounts
  useEffect(() => {
    startPolling();
    
    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, []); // Empty dependency array to run only once

  // Calculate financial metrics from real data
  const totalBalance = data.accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
  const totalDeposits = data.deposits.reduce((sum, deposit) => sum + (deposit.amount || 0), 0);
  const totalSpent = data.purchases.reduce((sum, purchase) => sum + (purchase.amount || 0), 0);
  const totalBills = data.bills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
  const netSavings = totalDeposits - totalSpent - totalBills;

  // Generate dynamic action items based on real data
  const actionItems = [];
  
  if (data.accounts.length >= 2) {
    actionItems.push("Great job! You have multiple accounts for better financial organization.");
  } else {
    actionItems.push("Consider opening a savings account to diversify your financial portfolio.");
  }

  if (totalSpent > 0 && totalDeposits > 0) {
    const spendingRatio = (totalSpent / totalDeposits) * 100;
    if (spendingRatio > 80) {
      actionItems.push(`Your spending is ${spendingRatio.toFixed(0)}% of your deposits. Consider reducing expenses.`);
    } else {
      actionItems.push("Your spending ratio looks healthy. Keep up the good work!");
    }
  }

  if (data.bills.length > 0) {
    const upcomingBill = data.bills[0];
    actionItems.push(`Next bill: ${upcomingBill.description || 'Bill'} ($${upcomingBill.amount})`);
  } else {
    actionItems.push("No upcoming bills detected. Your financial calendar looks clear!");
  }

  // Determine score status and trend
  const getScoreStatus = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Attention";
  };

  const getScoreTrend = (score: number) => {
    // Simple trend calculation - in a real app, this would compare with historical data
    if (score >= 70) return 5;
    if (score >= 50) return 2;
    return -2;
  };

  if (isLoading && data.accounts.length === 0) {
    return (
      <Container className="flex flex-wrap flex-col w-full p-12">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading your financial data...</div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="flex flex-wrap flex-col w-full p-12">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Error loading data: {error}</div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="flex flex-wrap flex-col w-full p-12">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-semibold text-indigo-600">
              Welcome back, <span className="text-gray-800">Customer</span>
            </h1>
            <p className="mt-2 text-gray-600">Here's your financial wellness at a glance.</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              {isPolling ? "🟢 Live data" : "⏸️ Paused"}
            </div>
            <div className="text-xs text-gray-400">
              Last updated: {data.lastUpdated ? data.lastUpdated.toLocaleTimeString() : 'Never'}
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex items-center justify-around w-full">
        <Card className="w-1/5">
          <CardTitle>Cash Flow</CardTitle>
          <CardContent className="text-gray-600">Total Account Balance:</CardContent>
          <CardContent className="flex text-2xl font-bold text-green-600 justify-center">
            ${totalBalance.toLocaleString()}
          </CardContent>
          <CardContent className="text-gray-600">Total Deposits:</CardContent>
          <CardContent className="flex text-2xl font-bold text-blue-500 justify-center">
            ${totalDeposits.toLocaleString()}
          </CardContent>
          <CardContent className="text-gray-600">Total Spent:</CardContent>
          <CardContent className="flex text-2xl font-bold text-red-400 justify-center">
            ${totalSpent.toLocaleString()}
          </CardContent>
          <CardContent className="text-gray-600">Net Savings:</CardContent>
          <CardContent className={`flex text-2xl font-bold justify-center ${
            netSavings >= 0 ? 'text-green-600' : 'text-red-400'
          }`}>
            ${netSavings.toLocaleString()}
          </CardContent>
        </Card>
        
        <FinancialScoreDisplay 
          score={data.wealthScore} 
          trend={getScoreTrend(data.wealthScore)} 
          status={getScoreStatus(data.wealthScore)} 
        />
        
        <Card className="w-1/5">
          <CardTitle>Action Items</CardTitle>
          {actionItems.map((item, index) => {
            const bgColor = index === 0 ? 'bg-green-50 text-green-700' : 
                           index === 1 ? 'bg-yellow-50 text-yellow-700' : 
                           'bg-blue-50 text-blue-700';
            return (
              <CardContent key={index} className={`${bgColor} p-3 rounded-lg text-sm mx-3`}>
                {item}
              </CardContent>
            );
          })}
        </Card>
      </main>
      
      {/* Debug info - remove in production */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-sm font-semibold mb-2">Debug Info (Real Data):</h3>
        <div className="text-xs text-gray-600">
          <p>Accounts: {data.accounts.length}</p>
          <p>Deposits: {data.deposits.length}</p>
          <p>Purchases: {data.purchases.length}</p>
          <p>Bills: {data.bills.length}</p>
          <p>Wealth Score: {data.wealthScore}</p>
          
          {/* Accounts Data */}
          <div className="mt-4">
            <h4 className="font-semibold text-sm mb-2">🏦 Accounts ({data.accounts.length}):</h4>
            {data.accounts.map((account, index) => (
              <div key={account._id} className="ml-4 mb-2 p-2 bg-white rounded border">
                <p><strong>Account {index + 1}:</strong> {account.nickname}</p>
                <p><strong>Type:</strong> {account.type}</p>
                <p><strong>Balance:</strong> ${account.balance?.toLocaleString()}</p>
                <p><strong>ID:</strong> {account._id}</p>
              </div>
            ))}
          </div>

          {/* Deposits Data */}
          <div className="mt-4">
            <h4 className="font-semibold text-sm mb-2">💰 Deposits ({data.deposits.length}):</h4>
            {data.deposits.map((deposit, index) => (
              <div key={deposit._id} className="ml-4 mb-2 p-2 bg-white rounded border">
                <p><strong>Deposit {index + 1}:</strong> {deposit.description}</p>
                <p><strong>Amount:</strong> ${deposit.amount?.toLocaleString()}</p>
                <p><strong>Status:</strong> {deposit.status}</p>
                <p><strong>Medium:</strong> {deposit.medium}</p>
                <p><strong>ID:</strong> {deposit._id}</p>
              </div>
            ))}
          </div>

          {/* Purchases Data */}
          <div className="mt-4">
            <h4 className="font-semibold text-sm mb-2">🛒 Purchases ({data.purchases.length}):</h4>
            {data.purchases.map((purchase, index) => (
              <div key={purchase._id} className="ml-4 mb-2 p-2 bg-white rounded border">
                <p><strong>Purchase {index + 1}:</strong> {purchase.description}</p>
                <p><strong>Amount:</strong> ${purchase.amount?.toLocaleString()}</p>
                <p><strong>Status:</strong> {purchase.status}</p>
                <p><strong>Type:</strong> {purchase.type}</p>
                <p><strong>Merchant ID:</strong> {purchase.merchant_id}</p>
                <p><strong>ID:</strong> {purchase._id}</p>
              </div>
            ))}
          </div>

          {/* Bills Data */}
          <div className="mt-4">
            <h4 className="font-semibold text-sm mb-2">📋 Bills ({data.bills.length}):</h4>
            {data.bills.length === 0 ? (
              <p className="ml-4 text-gray-500">No bills found</p>
            ) : (
              data.bills.map((bill, index) => (
                <div key={bill._id} className="ml-4 mb-2 p-2 bg-white rounded border">
                  <p><strong>Bill {index + 1}:</strong> {bill.description}</p>
                  <p><strong>Amount:</strong> ${bill.amount?.toLocaleString()}</p>
                  <p><strong>Status:</strong> {bill.status}</p>
                  <p><strong>ID:</strong> {bill._id}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}