import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, financialData } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Create system prompt with context about WealthScore and user's financial data
    let systemPrompt = `You are a helpful AI assistant for WealthScore, a financial wealth management platform. You help users understand their financial data, provide insights about their wealth, and answer questions about financial planning, investments, savings, and budgeting.

Key capabilities you can help with:
- Explaining financial metrics and scores
- Interpreting transaction data and spending patterns
- Providing insights on savings goals and progress
- Offering financial planning advice
- Explaining dashboard features and data visualizations
- Helping with budgeting and expense management

Always be professional, accurate, and helpful. Use the user's actual financial data when available to provide specific insights. Keep responses concise but informative.`;

    // Add user's financial data to the system prompt if available
    if (financialData) {
      const totalBalance = financialData.accounts?.reduce((sum: number, account: any) => sum + (account.balance || 0), 0) || 0;
      const totalDeposits = financialData.deposits?.reduce((sum: number, deposit: any) => sum + (deposit.amount || 0), 0) || 0;
      const totalSpent = financialData.purchases?.reduce((sum: number, purchase: any) => sum + (purchase.amount || 0), 0) || 0;
      
      systemPrompt += `\n\nUSER'S CURRENT FINANCIAL DATA:
- WealthScore: ${financialData.wealthScore}/100
- Total Account Balance: $${totalBalance.toLocaleString()}
- Total Deposits: $${totalDeposits.toLocaleString()} (${financialData.deposits?.length || 0} transactions)
- Total Spent: $${totalSpent.toLocaleString()} (${financialData.purchases?.length || 0} purchases)
- Accounts: ${financialData.accounts?.length || 0} accounts
- Last Updated: ${financialData.lastUpdated ? new Date(financialData.lastUpdated).toLocaleString() : 'Unknown'}

Use this data to provide specific, personalized insights about the user's financial situation.`;
    }

    // Format conversation history for OpenAI
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg: Message) => {
        messages.push({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text
        });
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';

    return NextResponse.json({ response });

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured properly' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to process your request. Please try again.' },
      { status: 500 }
    );
  }
}
