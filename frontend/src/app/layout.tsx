import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import ClientLayout from './client-layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Crypto Trading Dashboard",
  description: "Crypto wallet dashboard for arbitrage trading on Base Network",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
