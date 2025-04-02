'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function Home() {
  // Mock data - would be fetched from your API
  const [metrics] = useState({
    totalBalance: '12,435.45',
    currency: 'USD',
    priceChange: '+5.23%',
    opportunities: 3,
    activeTrading: true
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                Total Balance
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                ${metrics.totalBalance}
              </dd>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                24h Change
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">
                {metrics.priceChange}
              </dd>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                Arbitrage Opportunities
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                {metrics.opportunities}
              </dd>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                Trading Status
              </dt>
              <dd className="mt-1 flex items-center">
                <span className="text-xl font-semibold text-gray-900 dark:text-white mr-2">
                  {metrics.activeTrading ? 'Active' : 'Paused'}
                </span>
                <span className={`h-3 w-3 rounded-full ${metrics.activeTrading ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </dd>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Recent Activity
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              <p>Connect your wallet to view your recent activity</p>
              <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
