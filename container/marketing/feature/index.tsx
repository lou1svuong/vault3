import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Lock,
  Globe,
  FileText,
  Wallet,
  RefreshCw,
  Code,
  Zap,
  Plus,
} from "lucide-react";

export default function Feature() {
  return (
    <div className="w-full border-t border-dashed">
      <div className="p-4 border-b border-dashed ">
        <h2 className="text-3xl font-semibold font-heading tracking-tight">
          Key Features
        </h2>
        <p className="text-muted-foreground">
          Discover what makes our platform special
        </p>
      </div>
      <div id="grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {featureConfig.map((feature, index) => (
          <a
            key={index}
            href={feature.link}
            className={cn(
              "relative w-full p-4 hover:bg-muted/50 transition-all duration-150 group/item border-dashed",
              {
                "border-b": index < featureConfig.length - 1,
                "md:border-b-0": index >= featureConfig.length - 2,
                "md:border-b": index < featureConfig.length - 2,
                "lg:border-b-0": index >= featureConfig.length - 3,
                "lg:border-b": index < featureConfig.length - 3,
              },
              {
                "md:border-r":
                  index % 2 === 0 && index !== featureConfig.length - 1,
                "lg:border-r":
                  index % 3 !== 2 && index !== featureConfig.length - 1,
              }
            )}
          >
            {(index === 0 || index === featureConfig.length - 1) && (
              <Plus
                className={cn(
                  "absolute w-4 h-4 z-10 fill-current hidden md:block",
                  {
                    "-bottom-2 -right-2": index === 0,
                    "-top-2 -left-2": index === featureConfig.length - 1,
                  }
                )}
              />
            )}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="group-hover/item:animate-pulse">
                  {feature.icon}
                </span>
                <h3 className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold">
                  {feature.category}
                </h3>
              </div>
              <ArrowRight className="size-4 opacity-0 scale-0 -translate-x-4 group-hover/item:opacity-100 group-hover/item:-translate-x-0 group-hover/item:scale-100 transition-all duration-150" />
            </div>
            <h1 className="text-sm font-semibold font-heading tracking-tight mb-2">
              {feature.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {feature.description}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}

const featureConfig = [
  {
    icon: <Lock className="size-4" />,
    category: "Security",
    name: "Client-side Encryption",
    description:
      "All encryption and decryption happen in your browser using military-grade Seal SDK. Your vault's plaintext never leaves your device.",
    link: "#",
  },
  {
    icon: <Globe className="size-4" />,
    category: "Storage",
    name: "Decentralized Storage",
    description:
      "Vaults are uploaded to Walrus/IPFS, ensuring global, censorship-resistant availability.",
    link: "#",
  },
  {
    icon: <FileText className="size-4" />,
    category: "Blockchain",
    name: "On-Chain Metadata",
    description:
      "Vault CID can be stored on Sui blockchain, enabling seamless cross-device recovery without traditional passwords.",
    link: "#",
  },
  {
    icon: <Wallet className="size-4" />,
    category: "Authentication",
    name: "Wallet-Based Login",
    description:
      "Sui wallet for authentication with master key for data decryption. Secure and convenient access to your vault.",
    link: "#",
  },
  {
    icon: <RefreshCw className="size-4" />,
    category: "Security",
    name: "Re-encryption Support",
    description:
      "Update and re-encrypt your vault on password changes or wallet upgrades.",
    link: "#",
  },
  {
    icon: <Code className="size-4" />,
    category: "Transparency",
    name: "Open Source & Trustless",
    description:
      "Fully auditable frontend; no backend servers. Zero knowledge about your secrets.",
    link: "#",
  },
];
