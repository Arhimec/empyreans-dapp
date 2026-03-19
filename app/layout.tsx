'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { DappProvider } from "@multiversx/sdk-dapp/wrappers/DappProvider";
import { SignTransactionsModals } from "@multiversx/sdk-dapp/UI/SignTransactionsModals";
import { TransactionsToastList } from "@multiversx/sdk-dapp/UI/TransactionsToastList";

const inter = Inter({ subsets:["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Empyreans | Owner Dashboard</title>
        {/* FontAwesome for Icons */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${inter.className} bg-mvxdark text-gray-200 min-h-screen selection:bg-mvxteal selection:text-black`}>
        
        {/* MultiversX Dapp Provider wrapped around the app */}
        <DappProvider 
          environment="mainnet"
          customNetworkConfig={{
            name: 'customConfig',
            walletConnectV2ProjectId: '4fbcf6734aaf8c92da6058646a968cd7'
          }}
        >
          <TransactionsToastList />
          <SignTransactionsModals />
          {children}
        </DappProvider>

      </body>
    </html>
  );
}
