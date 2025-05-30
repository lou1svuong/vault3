"use client";

import * as React from "react";

import "@suiet/wallet-kit/style.css";
import {
  Chain,
  SuiDevnetChain,
  SuiMainnetChain,
  SuiTestnetChain,
  WalletProvider,
} from "@suiet/wallet-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig, SuiClientProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function WalletProviders({ children }: { children: any }) {
  const SupportedChains: Chain[] = [
    SuiDevnetChain,
    SuiTestnetChain,
    SuiMainnetChain,
  ];

  const { networkConfig } = createNetworkConfig({
    testnet: { url: getFullnodeUrl("testnet") },
    localnet: { url: getFullnodeUrl("localnet") },
    mainnet: { url: getFullnodeUrl("mainnet") },
  });

  // const [mounted, setMounted] = React.useState(false);

  // React.useEffect(() => {
  //   setMounted(true);
  // }, []);
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider>
          <WalletProvider autoConnect chains={SupportedChains}>
            {children}
          </WalletProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
