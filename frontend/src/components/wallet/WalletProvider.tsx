import {WagmiAdapter} from '@reown/appkit-adapter-wagmi';
import { createAppKit } from '@reown/appkit/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC, ReactNode } from 'react';
import { mainnet, base } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi';

// Create a QueryClient for TanStack Query
const queryClient = new QueryClient();

// Your project ID from Reown (previously WalletConnect)
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

// Define metadata for your dApp
const metadata = {
  name: 'Crypto Trading Dashboard',
  description: 'Crypto wallet dashboard for arbitrage trading on Base Network',
  url: 'https://tradingbase.io',
  icons: ['https://tradingbase.io/icon.png']
};

// Create wagmi config - using mainnet and Base network
const networks = [mainnet, base];
const wagmiConfig = new WagmiAdapter({ 
  networks, 
  projectId, 
  ssr: true,
});

// Create web3modal instance
createAppKit({
  adapters: [wagmiConfig],
  networks: [mainnet, base],
  projectId: projectId,
  metadata
});

interface WalletProviderProps {
  children: ReactNode;
}

const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  return (
    <WagmiProvider config={wagmiConfig.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default WalletProvider;