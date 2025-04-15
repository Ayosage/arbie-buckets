import { FC } from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import ConnectButton from '../wallet/ConnectButton';

interface HeaderProps {
  toggleDarkMode: () => void;
  isDarkMode: boolean;
}

const Header: FC<HeaderProps> = ({ toggleDarkMode, isDarkMode }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <h1 className="text-lg font-medium text-gray-900 dark:text-white">
          ARBIE BUCKETS
        </h1>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>
          
          <ConnectButton />
        </div>
      </div>
    </header>
  );
};

export default Header;