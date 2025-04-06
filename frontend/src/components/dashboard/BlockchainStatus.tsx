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
}

const BlockchainStatus = ({ className }: BlockchainStatusProps) => {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/status');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setStatus(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch blockchain status:', err);
        setError('Failed to connect to blockchain service');
        setStatus({ connected: false, network: 'Unknown', chainId: '0', timestamp: new Date().toISOString() });
      } finally {
        setLoading(false);
      }
    };
    
    if (error) {
        console.log(error)
    }
    fetchStatus();
    
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
        className={`h-3 w-3 rounded-full ${status?.connected ? 'bg-green-500' : 'bg-red-500'} mr-2`}
        title={status?.connected ? 'Connected' : 'Disconnected'}
      ></div>
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {status?.connected 
          ? `Connected to ${status.network}` 
          : 'Disconnected from blockchain'}
      </span>
    </div>
  );
};

export default BlockchainStatus;