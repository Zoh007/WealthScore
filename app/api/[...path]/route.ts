import { NextRequest, NextResponse } from 'next/server';

const NESSIE_API_KEY = '5b55b663fcacb05e663e5ce3ea9815ff';
const NESSIE_BASE_URL = 'http://api.nessieisreal.com';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Await params before using
    const resolvedParams = await params;
    
    // Reconstruct the API path
    const path = resolvedParams.path.join('/');
    const searchParams = request.nextUrl.searchParams;
    
    // Build the Nessie API URL
    const apiUrl = `${NESSIE_BASE_URL}/${path}?key=${NESSIE_API_KEY}${searchParams.toString() ? `&${searchParams.toString()}` : ''}`;
    
    console.log('🔄 Proxying request to:', apiUrl);
    
    // Make the request to Nessie API
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ Nessie API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch data from Nessie API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Successfully fetched data from Nessie API');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('🚨 API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods if needed
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const searchParams = request.nextUrl.searchParams;
    const body = await request.json();
    
      const apiUrl = `${NESSIE_BASE_URL}/${path}?key=${NESSIE_API_KEY}${searchParams.toString() ? `&${searchParams.toString()}` : ''}`;
    
    console.log('🔄 Proxying POST request to:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('❌ Nessie API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to post data to Nessie API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Successfully posted data to Nessie API');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('🚨 API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
