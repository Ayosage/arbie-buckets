'use client';

import Link from 'next/link';
import Image from 'next/image';
import BlockchainStatus from '@/components/dashboard/BlockchainStatus';
import BackendStatus from '@/components/dashboard/BackendStatus';
import NetworkStats from '@/components/dashboard/NetworkStats';
import ConnectionTestWidget from '@/components/dashboard/ConnectionTestWidget';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function Home() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* System Status */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                System Status
              </h3>
              <div className="flex items-center space-x-6">
                <BackendStatus />
                <BlockchainStatus />
              </div>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Status of the backend services and blockchain connection
            </p>
          </div>
        </div>

        {/* Network Stats */}
        <NetworkStats />
        
        {/* Connection Test Widget */}
        <ConnectionTestWidget />
        
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Welcome to Base Network Trading
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Your dashboard for arbitrage trading on Base Network
            </p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/arbitrage" className="block p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Image src="/globe.svg" alt="Arbitrage" width={30} height={30} />
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-gray-900 dark:text-white">Arbitrage</h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Find and execute profitable trades</p>
                  </div>
                </div>
              </Link>
              
              <Link href="/wallet" className="block p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Image src="/window.svg" alt="Wallet" width={30} height={30} />
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-gray-900 dark:text-white">Wallet</h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your crypto assets</p>
                  </div>
                </div>
              </Link>
              
              <div className="block p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Image src="/file.svg" alt="Analytics" width={30} height={30} />
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-gray-900 dark:text-white">Analytics</h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">View your trading performance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
