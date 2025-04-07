import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get the backend URL from environment variable or use a default
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    
    // Fetch blockchain status from the backend with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    try {
      const response = await fetch(`${backendUrl}/api/status`, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate', // Prevent caching
        },
        signal: controller.signal,
        next: { revalidate: 30 }, // Revalidate every 30 seconds
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Backend responded with status: ${response.status}`);
      }
  
      const data = await response.json();
      
      // Return the data from our API route
      console.log('Fetched blockchain status:', data);
      return NextResponse.json(data);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Fetch error:', fetchError);
      throw fetchError; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error('Error fetching blockchain status:', error);
    
    // Check for specific connection errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isConnectionRefused = 
      errorMessage.includes('ECONNREFUSED') || 
      errorMessage.includes('AbortError') ||
      errorMessage.includes('fetch failed');
    
    // Return error response with explicit error flags
    return NextResponse.json(
      { 
        connected: false, 
        network: 'Unknown', 
        chainId: '0', 
        timestamp: new Date().toISOString(),
        error: true,
        errorMessage: isConnectionRefused 
          ? 'Connection refused - backend service unavailable' 
          : error instanceof Error ? error.message : 'Failed to connect to blockchain service'
      },
      { status: 500 }
    );
  }
}