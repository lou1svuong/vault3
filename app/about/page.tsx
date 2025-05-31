import Link from "next/link";
import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Card className="w-full max-w-md border-dashed border-2 rounded-none shadow-none">
        <CardHeader className="border-b border-dashed pb-4">
          <div className="flex items-center space-x-2">
            <Terminal className="h-5 w-5" />
            <span className="text-sm font-mono">about.sh</span>
          </div>
        </CardHeader>
        <CardContent className="pt-6 pb-0 font-mono">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">$</span>
              <span>status</span>
            </div>
            <div className="space-y-1 pl-6">
              <p className="text-3xl font-bold">About</p>
              <p className="text-muted-foreground">
                A web3-native, fully decentralized password manager that puts
                security and privacy in your hands. Using Sui wallet keys for
                authentication and Seal SDK for client-side encryption, Vault³
                eliminates the need for master passwords or centralized servers.
                Your encrypted vault is stored on Walrus/IPFS, with optional
                on-chain CID anchoring via Sui smart contract.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-6 border-t border-dashed mt-6">
          <Button
            variant="outline"
            className="w-full rounded-none border-dashed"
            asChild
          >
            <Link href="/">$ cd /home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
