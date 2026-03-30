'use client';

import React, { useEffect, useState } from 'react';
import { DappProvider } from "@multiversx/sdk-dapp/wrappers/DappProvider";
import { SignTransactionsModals } from "@multiversx/sdk-dapp/UI/SignTransactionsModals";
import { TransactionsToastList } from "@multiversx/sdk-dapp/UI/TransactionsToastList";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
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
  );
}
