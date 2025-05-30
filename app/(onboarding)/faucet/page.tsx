"use client";

import { useState } from "react";
import { getFaucetHost, requestSuiFromFaucetV2 } from "@mysten/sui/faucet";
import { useWallet } from "@suiet/wallet-kit";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Terminal, Coins } from "lucide-react";

export default function FaucetPage() {
  const { address, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestSui = async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      await requestSuiFromFaucetV2({
        host: getFaucetHost("testnet"),
        recipient: address,
      });
      toast.success("Successfully requested SUI tokens!");
    } catch (error) {
      console.error("Error requesting SUI:", error);
      toast.error("Failed to request SUI tokens. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-8">
      <div className="w-full max-w-4xl mx-auto border border-dashed rounded-none bg-background p-8 flex flex-col gap-6">
        <Card className="border-dashed">
          <CardHeader className="border-b border-dashed pb-4">
            <div className="flex items-center space-x-2">
              <Terminal className="h-5 w-5" />
              <span className="text-sm font-mono">faucet.sh</span>
            </div>
            <CardTitle className="text-2xl font-bold mt-4">
              Sui Faucet
            </CardTitle>
            <CardDescription>
              Request test SUI tokens for development and testing on the Sui
              testnet
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">$</span>
                <span>status</span>
              </div>
              <div className="space-y-1 pl-6">
                <p className="text-muted-foreground">
                  {connected ? "Wallet Connected" : "Wallet Not Connected"}
                </p>
                {address && (
                  <p className="text-sm font-mono text-muted-foreground truncate">
                    {address}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-6 border-t border-dashed mt-6">
            <Button
              onClick={handleRequestSui}
              disabled={!connected || isLoading}
              className="w-full rounded-none border-dashed"
              size="lg"
            >
              {isLoading ? (
                "Requesting..."
              ) : (
                <>
                  <Coins className="mr-2 h-4 w-4" />
                  Request Test SUI
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
