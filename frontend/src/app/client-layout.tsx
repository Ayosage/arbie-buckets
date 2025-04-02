'use client';

import { ReactNode } from 'react';
import WalletProvider from '@/components/wallet/WalletProvider';

export default function ClientLayout({ children }: { children: ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
}