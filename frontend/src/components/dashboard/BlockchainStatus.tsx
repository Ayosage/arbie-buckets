'use client';

import { useEffect, useState } from 'react';

interface BlockchainStatusProps {
  className?: string;
}

interface StatusData {
  connected: boolean;
  network: string;
  chainId: string;
  walletAddress?: string;
  timestamp: string;
  error?: boolean;
  errorMessage?: string;
}

const BlockchainStatus = ({ className }: BlockchainStatusProps) => {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        
        // Add a timeout to the fetch to handle unresponsive servers
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
          const response = await fetch('/api/status', { 
            signal: controller.signal 
          });
          
          clearTimeout(timeoutId);
          
          // Even if we get a response, check if it has error status
          if (!response.ok) {
            try {
              const errorData = await response.json();
              setError(errorData.errorMessage || `Error: ${response.status}`);
              setStatus({
                ...errorData,
                error: true,
              });
            } catch (jsonError) {
              console.log('Failed to parse JSON from error response:', jsonError);
              setError(`HTTP Error: ${response.status}`);
              setStatus({
                connected: false,
                network: 'Unknown',
                chainId: '0',
                timestamp: new Date().toISOString(),
                error: true,
                errorMessage: `HTTP Error: ${response.status}`
              });
            }
            return;
          }
          
          const data = await response.json();
          
          // Check if the response contains an error flag
          if (data.error) {
            setError(data.errorMessage || 'Connection error');
            setStatus(data);
          } else {
            setStatus(data);
            setError(null);
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          throw fetchError; // Re-throw for the outer catch block
        }
      } catch (err) {
        console.error('Failed to fetch blockchain status:', err);
        
        // Look for connection refused errors
        const errorMessage = err instanceof Error ? err.message : String(err);
        const isConnectionError = 
          errorMessage.includes('ECONNREFUSED') || 
          errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('NetworkError') ||
          errorMessage.includes('AbortError');
        
        setError(isConnectionError ? 'Connection refused - backend unavailable' : 'Failed to connect to blockchain service');
        setStatus({ 
          connected: false, 
          network: 'Unknown', 
          chainId: '0', 
          timestamp: new Date().toISOString(),
          error: true,
          errorMessage: isConnectionError ? 'Backend service unavailable' : 'Unknown error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (error) {
        console.log('Blockchain Status Error:', error);
    }
    
    fetchStatus();
    console.log('Fetching blockchain status...');
    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse mr-2"></div>
        <span className="text-sm text-gray-500 dark:text-gray-400">Connecting...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div 
        className={`h-3 w-3 rounded-full ${
          status?.error ? 'bg-red-500' : 
          status?.connected ? 'bg-green-500' : 'bg-red-500'
        } mr-2`}
        title={
          status?.error ? 'Connection Error' : 
          status?.connected ? 'Connected' : 'Disconnected'
        }
      ></div>
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {status?.error 
          ? `Error: ${error || 'Unable to connect'}` 
          : status?.connected 
            ? `Connected to ${status.network}` 
            : 'Disconnected from blockchain'}
      </span>
    </div>
  );
};

export default BlockchainStatus;