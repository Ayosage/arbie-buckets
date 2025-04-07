import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if backend is available
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    
    let backendStatus = "unreachable";
    let connectionError = null;
    
    try {
      const cacheBuster = new Date().getTime();
      const backendResponse = await fetch(`${backendUrl}/ping?_=${cacheBuster}`, { 
        signal: AbortSignal.timeout(2000), // 2 second timeout
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      backendStatus = backendResponse.ok ? "healthy" : "unhealthy";
      console.log('Backend ping status:', backendStatus);
    } catch (err) {
      connectionError = err;
      console.error("Backend healthcheck failed:", err);
    }
    
    // If backend is unreachable and we have a connection error, return a 503 Service Unavailable
    if (backendStatus === "unreachable" && connectionError) {
      const errorMessage = connectionError instanceof Error ? 
        connectionError.message : 'Unknown connection error';
        
      // Check if this is a connection refused error
      const isConnectionRefused = errorMessage.includes('ECONNREFUSED') || 
        errorMessage.includes('Failed to fetch');
        
      return NextResponse.json(
        {
          status: "error",
          frontend: "healthy",
          backend: "unreachable",
          error: isConnectionRefused ? "ECONNREFUSED" : errorMessage,
          timestamp: new Date().toISOString(),
          env: process.env.NODE_ENV || 'development'
        },
        { status: 503 } // Service Unavailable
      );
    }
    
    // Normal response when backend might be available or unhealthy but responding
    return NextResponse.json({
      status: "ok",
      frontend: "healthy",
      backend: backendStatus,
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Error in ping healthcheck:', error);
    return NextResponse.json(
      { 
        status: "error",
        frontend: "error",
        message: "Internal server error"
      },
      { status: 500 }
    );
  }
}