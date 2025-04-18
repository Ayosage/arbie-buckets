import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/connection-test/message`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching connection test message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch message from backend' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_BASE_URL}/api/connection-test/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error setting connection test message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update message on backend' },
      { status: 500 }
    );
  }
}
