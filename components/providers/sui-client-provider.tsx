"use client";

import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";

// Config options for the networks you want to connect to
const { networkConfig } = createNetworkConfig({
  localnet: { url: getFullnodeUrl("localnet") },
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});

export function SuiClientProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
      {children}
    </SuiClientProvider>
  );
}
