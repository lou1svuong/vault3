import React from "react";
import { ConnectButton } from "@mysten/dapp-kit";

export default function CustomConnectButton() {
  return (
    <ConnectButton
      walletFilter={(wallet) => {
        console.log(wallet);
        // Remove this once because slush is not supported
        if (wallet.name === "Slush") {
          return false;
        }
        return true;
      }}
      className="!bg-primary !text-primary-foreground !rounded-none !shadow-none !h-full !border-dashed !text-sm font-medium !gap-2"
    />
  );
}
