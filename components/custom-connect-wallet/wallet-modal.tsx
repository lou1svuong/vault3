"use client";

import { useWallet } from "@suiet/wallet-kit";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletModal({ open, onOpenChange }: WalletModalProps) {
  const { select, configuredWallets, detectedWallets } = useWallet();

  const handleWalletSelect = (walletName: string) => {
    const wallet = [...configuredWallets, ...detectedWallets].find(
      (w) => w.name === walletName
    );
    if (!wallet?.installed) {
      // You can add a toast notification here
      window.open(wallet?.downloadUrl?.browserExtension, "_blank");
      return;
    }
    select(walletName);
    toast.success("Connect Wallet Successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:max-w-4xl border-dashed">
        <div className="flex flex-col md:flex-row h-full">
          {/* Left: Wallet List */}
          <div className="w-full p-6 flex flex-col gap-4">
            <DialogHeader className="mb-2">
              <DialogTitle className="text-lg">Connect Wallet</DialogTitle>
            </DialogHeader>
            <div
              className="flex flex-col gap-2 overflow-y-auto max-h-[350px] pr-2 [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
            >
              {/* Installed Wallets */}
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Installed Wallets
                </h3>
                {[...configuredWallets, ...detectedWallets]
                  .filter((wallet) => wallet.installed)
                  .map((wallet) => (
                    <Button
                      key={wallet.name}
                      variant="outline"
                      className="w-full justify-start gap-2 h-12 border-dashed"
                      onClick={() => handleWalletSelect(wallet.name)}
                    >
                      {wallet.iconUrl && (
                        <img
                          src={wallet.iconUrl}
                          alt={wallet.name}
                          className="w-6 h-6"
                        />
                      )}
                      <span>Connect to {wallet.name}</span>
                    </Button>
                  ))}
              </div>

              {/* Uninstalled Wallets */}
              <div className="flex flex-col gap-2 mt-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Available Wallets
                </h3>
                {[...configuredWallets, ...detectedWallets]
                  .filter((wallet) => !wallet.installed)
                  .map((wallet) => (
                    <Button
                      key={wallet.name}
                      variant="outline"
                      className="w-full justify-start gap-2 h-12 border-dashed opacity-50"
                      onClick={() => handleWalletSelect(wallet.name)}
                    >
                      {wallet.iconUrl && (
                        <img
                          src={wallet.iconUrl}
                          alt={wallet.name}
                          className="w-6 h-6"
                        />
                      )}
                      <span>Install {wallet.name}</span>
                    </Button>
                  ))}
              </div>
            </div>
          </div>
          {/* Right: Onboarding Info */}
          <div className="hidden lg:flex w-full p-6 flex-col items-center justify-center gap-6">
            <div className="w-full flex flex-col gap-6 items-center justify-between">
              <div className="text-xl font-bold mb-4 text-center md:text-left">
                What is a Wallet?
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-3 mb-4">
                  <Image
                    src="/assets/connect-wallet-modal/wallet-1.png"
                    alt="Wallet"
                    width={48}
                    height={48}
                  />
                  <div>
                    <div className="font-semibold">
                      A Home for your Digital Assets
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Wallets are used to send, receive, store, and display
                      digital assets like SUI and NFTs.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 mb-6">
                  <Image
                    src="/assets/connect-wallet-modal/wallet-2.svg"
                    alt="Wallet"
                    width={48}
                    height={48}
                  />
                  <div>
                    <div className="font-semibold">A New Way to Log In</div>
                    <div className="text-sm text-muted-foreground">
                      Instead of creating new accounts and passwords on every
                      website, just connect your wallet.
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Link
                  href="/understanding-web3"
                  className="text-sm text-muted-foreground font-semibold"
                >
                  Learn more
                </Link>
                <Link
                  href="https://x.com/lou1sgudboiz"
                  className="text-xs text-muted-foreground font-semibold underline"
                  target="_blank"
                >
                  By Lou1s
                </Link>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
