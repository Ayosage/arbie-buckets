'use client';

import { useEffect, useState } from 'react';

interface BackendStatusProps {
  className?: string;
}

interface StatusData {
  status: string;
  frontend: string;
  backend: string;
  timestamp: string;
  env?: string;
}

const BackendStatus = ({ className }: BackendStatusProps) => {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/ping');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setStatus(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch backend status:', err);
        setError('Failed to connect to backend service');
        setStatus({
          status: 'error',
          frontend: 'healthy',
          backend: 'unreachable',
          timestamp: new Date().toISOString()
        });
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
        <span className="text-sm text-gray-500 dark:text-gray-400">Checking backend status...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div 
        className={`h-3 w-3 rounded-full ${
          status?.backend === 'healthy' ? 'bg-green-500' : 
          status?.backend === 'unhealthy' ? 'bg-yellow-500' : 'bg-red-500'
        } mr-2`}
        title={status?.backend || 'Unknown'}
      ></div>
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {status?.backend === 'healthy' 
          ? 'Backend: Connected' 
          : status?.backend === 'unhealthy'
          ? 'Backend: Unhealthy'
          : 'Backend: Disconnected'}
      </span>
    </div>
  );
};

export default BackendStatus;