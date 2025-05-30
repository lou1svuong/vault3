"use client";

import { formatSUI, useAccountBalance, useWallet } from "@suiet/wallet-kit";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "../ui/dropdown-menu";
import { IconCopy, IconCopyCheck, IconCircleCheck } from "@tabler/icons-react";
import { Badge } from "../ui/badge";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Unplug } from "lucide-react";

const NETWORKS = [
  { id: "sui:mainnet", name: "Mainnet" },
  { id: "sui:testnet", name: "Testnet" },
  { id: "sui:devnet", name: "Devnet" },
];

export function AccountMenu({ onClose }: { onClose: () => void }) {
  const wallet = useWallet();
  const [accounts, setAccounts] = useState<Array<any>>([]);
  const { balance } = useAccountBalance();
  const [copy, isCopied] = useCopyToClipboard();

  useEffect(() => {
    if (wallet.connected) {
      const walletAccounts = wallet.getAccounts();
      if (walletAccounts?.length) {
        setAccounts([...walletAccounts]);
      }
    }
  }, [wallet.connected, wallet]);

  async function handleSwitchAccount(address: string) {
    if (!wallet.connected) return;

    try {
      await wallet.switchAccount(address);
    } catch (e) {
      console.error("Failed to switch account:", e);
    }
  }

  const handleCopy = async (address: string) => {
    const success = await copy(address);
    if (success) {
      toast.success("Address copied to clipboard");
    }
  };

  const handleSwitchNetwork = async (networkId: string) => {
    try {
      toast.info("Please switch network in your wallet");
    } catch (e) {
      console.error("Failed to switch network:", e);
      toast.error("Failed to switch network");
    }
  };

  const handleSwitchWallet = async (walletName: string) => {
    try {
      const targetWallet = wallet.allAvailableWallets.find(
        (w) => w.name === walletName
      );
      if (!targetWallet) {
        toast.error("Wallet not found");
        return;
      }

      if (!targetWallet.installed) {
        toast.info("Please install the wallet first");
        return;
      }

      await wallet.select(walletName);
      toast.success(`Switched to ${walletName}`);
    } catch (e) {
      console.error("Failed to switch wallet:", e);
      toast.error("Failed to switch wallet");
    }
  };

  if (!wallet.connected || !accounts.length) {
    return null;
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const currentAccount =
    accounts.find((acc) => acc.address === wallet.address) || accounts[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn("size-14 aspect-square p-2 md:p-3")}
          asChild
        >
          <Avatar>
            <AvatarImage
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${currentAccount.address}`}
              alt={currentAccount.address}
              className="rounded-full bg-muted select-none animate-pulse animate-duration-700 hover:animate-none hover:scale-105 hover:rotate-[10deg]  transition-all duration-300"
            />
            <AvatarFallback className="rounded-full">
              {currentAccount.address?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[340px] p-2 border border-dashed shadow-none"
      >
        <div className="flex items-center gap-3 p-2">
          <Avatar className="size-12 ring-2 ring-primary/10">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${currentAccount.address}`}
              alt={currentAccount.address}
              className="rounded-full bg-muted p-1 hover:scale-105 hover:rotate-[10deg] transition-all duration-300"
            />
            <AvatarFallback className="rounded-full bg-primary/10 text-primary">
              {currentAccount.address?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {truncateAddress(currentAccount.address)}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {wallet.adapter?.name}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy(currentAccount.address);
            }}
          >
            {isCopied ? (
              <IconCopyCheck size={16} className="text-primary" />
            ) : (
              <IconCopy size={16} className="text-muted-foreground" />
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 p-2 mt-2 rounded-lg bg-muted/50 border border-dashed">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Network</p>
            <Badge variant="secondary" className="w-full justify-start">
              {wallet.chain?.name}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Balance</p>
            <Badge variant="secondary" className="w-full justify-start">
              {formatSUI(balance ?? 0, { withAbbr: false })} SUI
            </Badge>
          </div>
        </div>

        <div className="mt-2 space-y-1">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center justify-between">
              <span>Switch Network</span>
              <Badge variant="outline" className="ml-2">
                {wallet.chain?.name}
              </Badge>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-[200px]">
              {NETWORKS.map((network) => (
                <DropdownMenuItem
                  key={network.id}
                  onClick={() => handleSwitchNetwork(network.id)}
                  className={cn(
                    "flex items-center justify-between",
                    wallet.chain?.id === network.id && "bg-accent"
                  )}
                >
                  <span>{network.name}</span>
                  {wallet.chain?.id === network.id && (
                    <IconCircleCheck size={14} className="text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center justify-between">
              <span>Switch Wallet</span>
              <Badge variant="outline" className="ml-2">
                {wallet.adapter?.name}
              </Badge>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-[200px]">
              {wallet.allAvailableWallets.map((w) => (
                <DropdownMenuItem
                  key={w.name}
                  onClick={() => handleSwitchWallet(w.name)}
                  className={cn(
                    "flex items-center justify-between",
                    wallet.adapter?.name === w.name && "bg-accent"
                  )}
                >
                  <span>{w.name}</span>
                  {wallet.adapter?.name === w.name && (
                    <IconCircleCheck size={14} className="text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </div>

        <div className="mt-2">
          <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Accounts
          </p>
          <div className="space-y-1">
            {accounts.map((account) => (
              <div
                key={account.address}
                className={cn(
                  "flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent/50 transition-colors",
                  account.address === wallet.address && "bg-accent"
                )}
                onClick={() => handleSwitchAccount(account.address)}
              >
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-primary/50" />
                  <span className="text-sm">
                    {truncateAddress(account.address)}
                  </span>
                </div>
                {account.address === wallet.address && (
                  <IconCircleCheck size={14} className="text-primary" />
                )}
              </div>
            ))}
          </div>
        </div>

        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem
          onClick={onClose}
          variant="destructive"
          className="flex items-center justify-between "
        >
          <span>Disconnect</span>
          <Unplug size={14} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
