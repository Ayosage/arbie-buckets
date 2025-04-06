import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if backend is available
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    
    let backendStatus = "unreachable";
    try {
      const backendResponse = await fetch(`${backendUrl}/ping`, { 
        signal: AbortSignal.timeout(2000) // 2 second timeout
      });
      backendStatus = backendResponse.ok ? "healthy" : "unhealthy";
    } catch (err) {
      console.error("Backend healthcheck failed:", err);
    }
    
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