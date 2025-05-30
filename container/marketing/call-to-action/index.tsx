import Background from "@/components/background/novatrixbg";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="relative p-4 border-t border-dashed py-12 md:py-20 w-full">
      <div className="absolute -inset-0 -z-10 backdrop-blur-lg size-full overflow-hidden">
        <Background />
      </div>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 text-left">
          <h2 className="text-3xl font-bold text-black">
            Own Your Secrets, Not Even We Can See Them
          </h2>
          <p className="text-gray-800 mt-2">
            Experience the future of password management with Vault³. Secure,
            decentralized, and powered by Sui blockchain.
          </p>

          <div className="mt-4 flex flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              className="bg-black text-white hover:bg-black/90"
            >
              <Link href="/">
                <span>Connect Wallet to Start</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
