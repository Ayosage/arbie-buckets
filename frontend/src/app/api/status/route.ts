import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get the backend URL from environment variable or use a default
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    
    // Fetch blockchain status from the backend
    const response = await fetch(`${backendUrl}/api/status`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 30 }, // Revalidate every 30 seconds
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Return the data from our API route
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching blockchain status:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        connected: false, 
        network: 'Unknown', 
        chainId: '0', 
        timestamp: new Date().toISOString() 
      },
      { status: 500 }
    );
  }
}