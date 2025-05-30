"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import Link from "next/link";

type FAQItem = {
  id: string;
  icon: IconName;
  question: string;
  answer: string;
};

export default function FAQs() {
  const faqItems: FAQItem[] = [
    {
      id: "item-1",
      icon: "wallet",
      question: "How does Vault³ authentication work?",
      answer:
        "Vault³ uses your Sui wallet as the sole method of authentication. There's no need for master passwords or email addresses. Simply connect your Sui wallet (like Sui Wallet or Surf) to access your vault securely.",
    },
    {
      id: "item-2",
      icon: "shield",
      question: "How secure is my data?",
      answer:
        "Your data is extremely secure. All encryption and decryption happen client-side using military-grade Seal SDK. Your vault's plaintext never leaves your device. The encrypted vault is stored on Walrus/IPFS, and the vault's content identifier (CID) can be anchored on-chain via Sui smart contract.",
    },
    {
      id: "item-3",
      icon: "cloud",
      question: "Where is my vault stored?",
      answer:
        "Your encrypted vault is stored on Walrus/IPFS, ensuring global, censorship-resistant availability. The vault's content identifier (CID) can optionally be stored on the Sui blockchain, enabling seamless cross-device recovery without traditional passwords.",
    },
    {
      id: "item-4",
      icon: "refresh-cw",
      question: "Can I update my vault?",
      answer:
        "Yes, Vault³ supports re-encryption. You can update and re-encrypt your vault when changing passwords or upgrading your wallet. The process is seamless and maintains the security of your data.",
    },
    {
      id: "item-5",
      icon: "key",
      question: "What happens if I lose my wallet?",
      answer:
        "Since Vault³ uses your Sui wallet for authentication, it's crucial to keep your wallet keys secure. We recommend using hardware wallets with Sui for enhanced key security. In the future, we plan to add social recovery integration for wallet keys.",
    },
  ];

  return (
    <section className="bg-background border-t border-dashed">
      <div className="flex flex-col gap-10 md:gap-0 md:flex-row p-4">
        <div className="md:w-1/3">
          <div className="sticky top-20">
            <h2 className="text-3xl font-bold max-w-2/3">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Can't find what you're looking for? Contact our{" "}
              <Link
                href="#"
                className="text-primary font-medium hover:underline"
              >
                customer support team
              </Link>
            </p>
          </div>
        </div>
        <div className="md:w-2/3">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqItems.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="bg-background border px-4 last:border-b"
              >
                <AccordionTrigger className="cursor-pointer items-center py-5 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="flex size-6">
                      <DynamicIcon name={item.icon} className="m-auto size-4" />
                    </div>
                    <span className="text-sm">{item.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-5">
                  <div className="px-9">
                    <p className="text-sm text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
