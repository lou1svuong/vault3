"use client";

import { useWallet } from "@suiet/wallet-kit";
import { useState } from "react";
import { Button } from "../ui/button";
import { AccountMenu } from "./account-menu";
import { WalletModal } from "./wallet-modal";
import { PlugZap } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ConnectButton({ className }: { className?: string }) {
  const { connected, disconnect } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDisconnect = () => {
    disconnect();
    toast.success("Disconnect Wallet Successfully");
  };

  return (
    <>
      <WalletModal open={isModalOpen} onOpenChange={setIsModalOpen} />

      {connected ? (
        <AccountMenu onClose={handleDisconnect} />
      ) : (
        <Button
          onClick={() => setIsModalOpen(true)}
          className={cn(className, "h-full border-dashed cursor-pointer")}
          size="lg"
          variant="ghost"
          asChild
        >
          <div className="flex items-center gap-2 group/nav">
            <span>Connect Wallet</span>
            <div className="relative z-10 size-4 overflow-hidden flex items-center justify-center">
              <PlugZap className="-z-10 absolute opacity-100 scale-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group-hover/nav:-translate-y-5 group-hover/nav:translate-x-5 group-hover/nav:opacity-0 group-hover/nav:scale-0 transition-all duration-200" />
              <PlugZap className="absolute -z-10 -bottom-4 -left-4 opacity-0 scale-0 group-hover/nav:-translate-y-[15px] group-hover/nav:translate-x-4 group-hover/nav:opacity-100 group-hover/nav:scale-100 transition-all duration-200" />
            </div>
          </div>
        </Button>
      )}
    </>
  );
}
