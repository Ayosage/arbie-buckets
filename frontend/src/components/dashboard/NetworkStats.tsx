'use client';

import { useState, useEffect } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface NetworkStatsProps {
  className?: string;
}

interface NetworkData {
  connected: boolean;
  latency_ms: number;
  latency: string;
  block_number: number;
  chain_id: string;
  gas_price_wei: string;
  gas_price_gwei: number;
  timestamp: string;
  error?: string;
}

const NetworkStats = ({ className }: NetworkStatsProps) => {
  const [stats, setStats] = useState<NetworkData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchNetworkStats = async () => {
    try {
      // Keep displaying previous data while loading
      if (stats) {
        setLoading(false);
      } else {
        setLoading(true);
      }
      
      // Add a timeout to the fetch to handle unresponsive servers
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      console.log('Fetching network stats...');
      try {
        // Use a dedicated endpoint with a unique timestamp to prevent caching
        const cacheBuster = new Date().getTime();
        const response = await fetch(`/api/network?_=${cacheBuster}`, { 
          signal: controller.signal,
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.log('Response not ok:', response.status);
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Network stats data received:', data);
        
        if (data.error) {
          console.log('Error in network data:', data.error);
          setError(data.error);
          // If we have an error but still have network data, keep it
          if (data.connected === true) {
            setStats(data);
            // Store this successful data
            localStorage.setItem('networkStats', JSON.stringify(data));
          }
        } else if (data.connected === true) {
          console.log('Setting network stats:', data);
          setStats(data);
          setError(null);
          // Store this successful data
          localStorage.setItem('networkStats', JSON.stringify(data));
          localStorage.setItem('networkStatsTimestamp', new Date().toISOString());
        }
        
        setLastUpdated(new Date());
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (err) {
      console.error('Failed to fetch network stats:', err);
      setError(err instanceof Error ? err.message : String(err));
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Try to load previously saved network stats from localStorage on initial mount
    const savedStats = localStorage.getItem('networkStats');
    const savedTimestamp = localStorage.getItem('networkStatsTimestamp');
    
    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats);
        console.log('Loaded saved network stats:', parsedStats);
        setStats(parsedStats);
        
        if (savedTimestamp) {
          setLastUpdated(new Date(savedTimestamp));
        }
      } catch (e) {
        console.error('Failed to parse saved network stats:', e);
      }
    }
    
    // Fetch fresh network stats
    fetchNetworkStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchNetworkStats, 30000);
    
    return () => clearInterval(interval);
  }, []);  // We're intentionally not including fetchNetworkStats as a dependency
           // to avoid re-creating the interval on each render

  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    fetchNetworkStats();
  };

  // Format the last updated time
  const getLastUpdatedText = () => {
    if (!lastUpdated) return 'Never updated';
    
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    
    if (diffSeconds < 60) return `Updated ${diffSeconds} seconds ago`;
    if (diffSeconds < 3600) return `Updated ${Math.floor(diffSeconds / 60)} minutes ago`;
    return `Updated ${Math.floor(diffSeconds / 3600)} hours ago`;
  };

  if (loading && !stats) {
    return (
      <div className={`rounded-lg bg-white dark:bg-gray-800 shadow p-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg bg-white dark:bg-gray-800 shadow ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Network Status
          </h3>
          <button 
            onClick={handleRefresh} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Refresh network stats"
          >
            <ArrowPathIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        
        {error && !stats?.connected && (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div>
                <p className="text-sm text-red-700 dark:text-red-400">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Connection Status */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Connection Status
            </div>
            <div className="flex items-center">
              <div className={`h-3 w-3 rounded-full mr-2 ${stats?.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats?.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {stats?.connected && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Chain ID: {stats.chain_id}
              </div>
            )}
          </div>
          
          {/* Latency */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Network Latency
            </div>
            <div className="flex items-center">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats?.latency_ms ? `${stats.latency_ms} ms` : 'N/A'}
              </span>
            </div>
            {stats?.latency && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stats.latency}
              </div>
            )}
          </div>
          
          {/* Block Number */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Current Block
            </div>
            <div className="flex items-center">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats?.block_number ? stats.block_number.toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>
          
          {/* Gas Price */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Gas Price
            </div>
            <div className="flex items-center">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats?.gas_price_gwei ? `${stats.gas_price_gwei.toFixed(2)} Gwei` : 'N/A'}
              </span>
            </div>
            {stats?.gas_price_wei && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stats.gas_price_wei} Wei
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
          <span>{getLastUpdatedText()}</span>
          {stats?.timestamp && (
            <span>Last ping: {new Date(stats.timestamp).toLocaleTimeString()}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkStats;
