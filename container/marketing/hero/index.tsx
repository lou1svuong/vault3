"use client";

import Header from "@/components/layouts/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Spline from "@splinetool/react-spline";
import { useCurrentAccount } from "@mysten/dapp-kit";
import CustomConnectButton from "@/components/custom-connect-wallet/custom-connect-button";
import { HyperText } from "@/components/ui/hyper-text";

export default function Hero() {
  const account = useCurrentAccount();

  return (
    <section className="w-full flex divide-x">
      <div className="flex-1 flex flex-col relative">
        <Header />
        <div
          id="hero"
          className="relative flex lg:min-h-[60vh] flex-col py-12 p-4 backdrop-blur-lg overflow-hidden"
        >
          <div className="absolute top-0 bottom-0 left-100 hidden lg:block -z-10 w-6/7 h-[110%] -ratote-15">
            <Spline scene="https://prod.spline.design/tYqLLCrJ14AFx6MC/scene.splinecode" />
            <div className="absolute inset-0 opacity-20 mix-blend-multiply z-0"></div>
          </div>
          <HyperText className="head-text-md max-w-3xl">
            Vault³ - Your Decentralized Password Manager
          </HyperText>
          <p className="text-muted-foreground max-w-3xl border-l-4 border-foreground pl-2">
            Own your secrets. Not even we can see them.
          </p>
          <div id="cta" className="flex items-center gap-4 pt-8">
            {!account ? (
              <CustomConnectButton />
            ) : (
              <Button asChild>
                <Link href="/vault" className="gap-2">
                  <span>Access Your Vault</span>
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/docs" className="gap-2">
                <span>Learn More</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
