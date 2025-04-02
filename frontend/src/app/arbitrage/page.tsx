'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ArbitragePage() {
  // Mock arbitrage data and settings
  const [isActive, setIsActive] = useState(true);
  const [settings, setSettings] = useState({
    gasThreshold: 15,
    minimumProfitPercentage: 0.5,
    tradingAmount: 1000,
    tradingInterval: 60,
    exchanges: ['Uniswap', 'Sushiswap', 'Aerodrome']
  });
  
  const [opportunities] = useState([
    { 
      id: 'opp1',
      token: 'ETH',
      sourceExchange: 'Uniswap',
      targetExchange: 'Sushiswap',
      buyPrice: 2230.45,
      sellPrice: 2245.78,
      potentialProfit: 15.33,
      profitPercentage: 0.68,
      timestamp: '2025-03-27T15:32:10'
    },
    { 
      id: 'opp2',
      token: 'USDC',
      sourceExchange: 'Aerodrome',
      targetExchange: 'Uniswap',
      buyPrice: 0.995,
      sellPrice: 1.005,
      potentialProfit: 10.00,
      profitPercentage: 1.01,
      timestamp: '2025-03-27T15:30:22'
    }
  ]);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: name === 'exchanges' ? value.split(',') : Number(value)
    });
  };

  const toggleActive = () => {
    setIsActive(!isActive);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Arbitrage Trading</h1>
          <div className="flex items-center">
            <span className="mr-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              {isActive ? 'Active' : 'Paused'}
            </span>
            <button
              onClick={toggleActive}
              type="button"
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isActive ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Trading Settings */}
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Trading Configuration
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Configure your arbitrage trading parameters
              </p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="gasThreshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Gas Price Threshold (Gwei)
                  </label>
                  <input
                    type="number"
                    name="gasThreshold"
                    id="gasThreshold"
                    value={settings.gasThreshold}
                    onChange={handleSettingsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="minimumProfitPercentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Minimum Profit Percentage (%)
                  </label>
                  <input
                    type="number"
                    name="minimumProfitPercentage"
                    id="minimumProfitPercentage"
                    step="0.1"
                    value={settings.minimumProfitPercentage}
                    onChange={handleSettingsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="tradingAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trading Amount (USD)
                  </label>
                  <input
                    type="number"
                    name="tradingAmount"
                    id="tradingAmount"
                    value={settings.tradingAmount}
                    onChange={handleSettingsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="tradingInterval" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Scan Interval (seconds)
                  </label>
                  <input
                    type="number"
                    name="tradingInterval"
                    id="tradingInterval"
                    value={settings.tradingInterval}
                    onChange={handleSettingsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Current Opportunities */}
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Arbitrage Opportunities
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Current price differences between exchanges
              </p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Token
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Route
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Profit
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        %
                      </th>
                      <th scope="col" className="relative px-4 py-3">
                        <span className="sr-only">Execute</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {opportunities.map((opportunity) => (
                      <tr key={opportunity.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {opportunity.token}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {opportunity.sourceExchange} → {opportunity.targetExchange}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${opportunity.potentialProfit.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {opportunity.profitPercentage.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                            Execute
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        {/* Trading History */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Trading History
            </h3>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              <p>No trading history to display</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}