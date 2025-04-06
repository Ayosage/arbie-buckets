import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    
    const response = await fetch(`${backendUrl}/api/arbitrage/opportunities`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 30 }, // Revalidate every 30 seconds for more up-to-date opportunities
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching arbitrage opportunities:', error);
    
    return NextResponse.json(
      { opportunities: [] },
      { status: 500 }
    );
  }
}