import Github from "@/components/icons/github";
import Telegram from "@/components/icons/telegram";
import X from "@/components/icons/x";
import { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  name: "Vault³",
  title: "Vault³ - Decentralized Password Manager",
  description:
    "A web3-native, fully decentralized password manager that puts security and privacy in your hands. Using Sui wallet keys for authentication and Seal SDK for client-side encryption, Vault³ eliminates the need for master passwords or centralized servers. Your encrypted vault is stored on Walrus/IPFS, with optional on-chain CID anchoring via Sui smart contract.",
  origin: "https://vault3.xyz",
  keywords: [
    "Vault³",
    "Decentralized Password Manager",
    "Web3 Password Manager",
    "Sui Wallet",
    "Seal Encryption",
    "Walrus IPFS",
    "Blockchain Security",
    "Decentralized Storage",
    "Client-side Encryption",
    "Web3 Security",
    "Sui Blockchain",
    "Password Management",
    "Zero Knowledge",
    "Trustless Security",
    "Decentralized Vault",
    "Crypto Security",
    "Web3 Privacy",
  ],
  og: "https://vault3.xyz/og.png",
  creator: {
    name: "Vault³ Team",
    url: "https://vault3.xyz",
  },
  socials: {
    // email: {
    //   href: "mailto:lou1svuong.dev@gmail.com",
    //   icon: Mail,
    // },
    // linkedin: {
    //   href: "https://www.linkedin.com/in/xuanvuong/",
    //   icon: Linkedin,
    // },
    github: {
      href: "https://github.com/vault3",
      icon: Github,
    },
    x: {
      href: "https://x.com/vault3",
      icon: X,
    },
    telegram: {
      href: "https://t.me/vault3",
      icon: Telegram,
    },
  },
};
