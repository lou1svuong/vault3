import Header from "@/components/layouts/header";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site.config";
import { ArrowRight, Shield, Lock, Key } from "lucide-react";
import Link from "next/link";
import Spline from "@splinetool/react-spline";

export default function Hero() {
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
          <h1 className="head-text-md">
            Vault³ - Your Decentralized Password Manager
          </h1>
          <p className="text-muted-foreground max-w-3xl border-l-4 border-foreground pl-2">
            Own your secrets. Not even we can see them.
          </p>
          <div className="flex items-center gap-4 text-muted-foreground max-w-3xl pt-2">
            <div className="flex items-center gap-2">
              <Shield className="size-4" />
              <span>Client-side Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="size-4" />
              <span>Zero Knowledge</span>
            </div>
            <div className="flex items-center gap-2">
              <Key className="size-4" />
              <span>Sui Wallet Authentication</span>
            </div>
          </div>
          <p className="text-muted-foreground max-w-3xl pt-4">
            {siteConfig.description}
          </p>
          <div id="cta" className="flex items-center gap-4 pt-4">
            <Button asChild>
              <Link href="/connect" className="gap-2 group">
                <span>Connect Wallet</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-all duration-150" />
              </Link>
            </Button>
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
