'use client';

import { useEffect, useState } from 'react';


interface ConnectionTestData {
  success: boolean;
  message: string;
  contractAddress: string;
  error?: string;
}

const ConnectionTestWidget = () => {
  const [testData, setTestData] = useState<ConnectionTestData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string>('');

  const fetchConnectionTest = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/connection-test/message');
      const data = await response.json();
      setTestData(data);
    } catch (error) {
      console.error('Failed to fetch connection test data:', error);
      setError('Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  const updateMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      setUpdating(true);
      setError('');
      setTxHash('');
      
      const response = await fetch('/api/connection-test/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newMessage }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTxHash(data.txHash);
        setNewMessage('');
        // Fetch the updated message after a short delay
        setTimeout(fetchConnectionTest, 2000);
      } else {
        setError(data.error || 'Failed to update message');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError('Failed to connect to API: ' + err.message);
      } else {
        setError('Failed to connect to API: Unknown error');
      }
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchConnectionTest();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Connection Test
          </h3>
          {testData?.contractAddress && (
            <a 
              href={`https://sepolia.basescan.org/address/${testData.contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View Contract
            </a>
          )}
        </div>
        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
          Test connection with deployed ConnectionTest contract
        </p>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
        <div className="space-y-4">
          {/* Current Message Section */}
          <div>
            <div className="flex justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Message:</h4>
              <button 
                onClick={fetchConnectionTest} 
                disabled={loading}
                className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
              {loading ? (
                <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
              ) : error ? (
                <p className="text-red-500 text-sm">{error}</p>
              ) : (
                <p className="text-gray-700 dark:text-gray-300 text-sm">`{testData?.message}`</p>
              )}
            </div>
          </div>

          {/* Update Message Form */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Update Message:</h4>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Enter new message"
                className="flex-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                disabled={updating}
              />
              <button
                onClick={updateMessage}
                disabled={updating || !newMessage.trim()}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>

          {/* Transaction Information */}
          {txHash && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transaction:</h4>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <div className="flex items-center">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-800 mr-2">
                    <span className="text-xs font-medium leading-none text-green-800 dark:text-green-200">✓</span>
                  </span>
                  <a 
                    href={`https://sepolia.basescan.org/tx/${txHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 truncate"
                  >
                    {txHash}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionTestWidget;
