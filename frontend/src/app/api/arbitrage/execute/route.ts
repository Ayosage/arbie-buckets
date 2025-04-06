import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const body = await request.json();
    
    const response = await fetch(`${backendUrl}/api/arbitrage/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error executing arbitrage trade:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to execute arbitrage trade' },
      { status: 500 }
    );
  }
}