import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    
    const response = await fetch(`${backendUrl}/api/ping`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      next: { revalidate: 10 }, // Revalidate every 10 seconds
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched network stats:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching network stats:', error);
    
    return NextResponse.json(
      { 
        connected: false,
        error: error instanceof Error ? error.message : 'Failed to connect to blockchain network',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
