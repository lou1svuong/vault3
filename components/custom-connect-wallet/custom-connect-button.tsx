import React from "react";
import { ConnectButton } from "@mysten/dapp-kit";

export default function CustomConnectButton() {
  return (
    <ConnectButton className="!bg-primary !text-primary-foreground !rounded-none !shadow-none !h-full !border-dashed !text-sm font-medium !gap-2" />
  );
}
