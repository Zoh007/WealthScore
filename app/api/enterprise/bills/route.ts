import { NextRequest, NextResponse } from 'next/server';

const NESSIE_API_KEY = '5b55b663fcacb05e663e5ce3ea9815ff';
const NESSIE_BASE_URL = 'http://api.nessieisreal.com';

export async function GET(request: NextRequest) {
  try {
    // Build the Nessie API URL for enterprise bills
    const apiUrl = `${NESSIE_BASE_URL}/enterprise/bills?key=${NESSIE_API_KEY}`;
    
    console.log('🔄 Proxying request to enterprise bills API:', apiUrl);
    
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
    
    // Log the shape of the data for debugging
    console.log('✅ Successfully fetched enterprise bills from Nessie API');
    console.log('Data type:', typeof data);
    console.log('Is Array:', Array.isArray(data));
    console.log('Data sample:', JSON.stringify(data).slice(0, 200));
    
    // Ensure we always return an array
    let billsArray;
    if (Array.isArray(data)) {
      billsArray = data;
    } else if (data && typeof data === 'object') {
      // If it's a single object
      billsArray = [data];
    } else {
      // If it's neither an array nor an object, create a sample bill
      billsArray = [{
        _id: 'sample-enterprise-bill',
        payment_amount: 145.99,
        nickname: 'Sample Enterprise Bill',
        upcoming_payment_date: new Date().toISOString().slice(0, 10),
        payee: 'Sample Service Provider',
        status: 'pending',
        recurring_date: 15
      }];
    }
    
    console.log(`Returning ${billsArray.length} bill(s) from enterprise API`);
    
    return NextResponse.json(billsArray);
  } catch (error) {
    console.error('🚨 Enterprise Bills API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}