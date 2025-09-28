import { NextRequest, NextResponse } from 'next/server';

const NESSIE_API_KEY = '5b55b663fcacb05e663e5ce3ea9815ff';
const NESSIE_BASE_URL = 'http://api.nessieisreal.com';

export async function GET(request: NextRequest) {
  try {
    // Build the Nessie API URL for enterprise bills
    const apiUrl = `${NESSIE_BASE_URL}/enterprise/bills?key=${NESSIE_API_KEY}`;
    
    console.log('🔄 Debug: Fetching raw enterprise bills API data:', apiUrl);
    
    // Make the request to Nessie API
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ Nessie Enterprise Bills API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch bills from Nessie API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Log the raw data
    console.log('Raw enterprise bills data:', JSON.stringify(data, null, 2));
    
    // Create a set of sample bills with dates specifically for today and surrounding days
    const today = new Date();
    const sampleBills = [
      {
        _id: 'sample-bill-today',
        payment_amount: 1120.50,
        upcoming_payment_date: today.toISOString().slice(0, 10),
        nickname: 'Roof Repairs',
        recurring_date: today.getDate(),
        status: 'pending',
        payee: 'Sample Service Today'
      },
      {
        _id: 'sample-bill-tomorrow',
        payment_amount: 75.25,
        upcoming_payment_date: new Date(today.getTime() + 86400000).toISOString().slice(0, 10),
        nickname: 'Tomorrow\'s Bill',
        recurring_date: (today.getDate() + 1) % 30 || 30,
        status: 'pending',
        payee: 'Sample Service Tomorrow'
      },
      {
        _id: 'sample-bill-yesterday',
        payment_amount: 2245.99,
        upcoming_payment_date: new Date(today.getTime() - 86400000).toISOString().slice(0, 10),
        nickname: 'Monthly Rent',
        recurring_date: (today.getDate() - 1) || 30,
        status: 'executed',
        payee: 'Sample Service Yesterday'
      }
    ];
    
    // Combine real API data with our samples
    const combinedData = Array.isArray(data) 
      ? [...data, ...sampleBills]
      : [data, ...sampleBills].filter(bill => bill !== null && bill !== undefined);
    
    return NextResponse.json(combinedData);
  } catch (error) {
    console.error('🚨 Debug bills API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}