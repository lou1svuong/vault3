# Vault³ – Decentralized Password Manager

> 🔐 Own your secrets. Not even we can see them.
> Powered by **Sui Wallet**, **Seal Encryption**, and **Walrus/IPFS**
> Built with **Next.js App Router + Tailwind CSS**

---

## Table of Contents

* [Introduction](#introduction)
* [Features](#features)
* [How It Works](#how-it-works)
* [Architecture](#architecture)
* [Getting Started](#getting-started)
* [Usage](#usage)
* [Security](#security)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [License](#license)

---

## Introduction

Vault³ is a **web3-native**, fully decentralized password manager that puts **security and privacy** in your hands.
Using **Sui wallet keys** as the sole method of authentication and **Seal SDK** for client-side encryption, Vault³ eliminates the need for master passwords or centralized servers.
Your encrypted vault is stored on **Walrus/IPFS**, with the vault’s content identifier (CID) optionally anchored on-chain via a Sui smart contract — making your data both accessible and tamper-proof without sacrificing privacy.

---

## Features

* 🔐 **Client-side Encryption:** All encryption and decryption happen in your browser using military-grade Seal SDK. Your vault’s plaintext never leaves your device.
* 🌐 **Decentralized Storage:** Vaults are uploaded to Walrus/IPFS, ensuring global, censorship-resistant availability.
* 🧾 **On-Chain Metadata:** Vault CID can be stored on Sui blockchain, enabling seamless cross-device recovery without traditional passwords.
* 🧠 **Wallet-Based Login:** No master password or email required. Your Sui wallet is your key.
* 🔁 **Re-encryption Support:** Update and re-encrypt your vault on password changes or wallet upgrades.
* 🌍 **Open Source & Trustless:** Fully auditable frontend; no backend servers. Zero knowledge about your secrets.
* ⚡ **Fast & Intuitive:** Instant vault load/unlock with smooth UI powered by Next.js and Tailwind CSS.

---

## How It Works

1. **Connect Wallet:** User connects via Sui wallet (e.g., Sui Wallet, Surf).
2. **Derive Encryption Key:** A symmetric key is derived client-side from wallet keys.
3. **Encrypt Passwords:** Passwords are encrypted with Seal SDK using the derived key.
4. **Upload to IPFS:** Encrypted vault is uploaded to Walrus, returning a unique CID.
5. **Store CID on Chain:** CID is saved on a Sui smart contract linked to user wallet (optional).
6. **Retrieve & Decrypt:** On login, fetch CID → download vault → decrypt using derived key.

---

## Architecture

```
[User Wallet] <--> [Next.js Frontend]
                         |          \
                         |           --> [Seal SDK: Client Encryption]
                         |           --> [Walrus/IPFS: Store Vault]
                         |           --> [Sui Smart Contract: CID Storage]
```

---

## Getting Started

### Prerequisites

* Node.js v18+
* Yarn or npm
* Sui wallet extension installed (e.g., Sui Wallet, Surf)

### Installation

```bash
git clone https://github.com/yourusername/vault3.git
cd vault3
yarn install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_WALRUS_API_URL=https://api.walrus.io
NEXT_PUBLIC_SUI_RPC=https://fullnode.mainnet.sui.io:443
```

Adjust according to your deployment or testnet.

### Run Locally

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Usage

* Click **Connect Wallet**
* Add password entries (site, username, password)
* Click **Save Vault** → encrypted vault uploads to IPFS
* CID is saved on-chain (or localStorage for MVP)
* Refresh or open on another device → Connect wallet → Vault loads instantly

---

## Security

* All encryption/decryption is client-side only — no plaintext passwords leave your device.
* Vault CID stored on-chain does **not** reveal your passwords.
* Symmetric keys are derived from wallet keys, never transmitted.
* Open source code allows full transparency and audits.
* Use hardware wallets with Sui for enhanced key security.

---

## Roadmap

* [ ] Multi-wallet support (MetaMask, Phantom)
* [ ] Biometric re-encryption (FaceID, fingerprint)
* [ ] Social recovery integration for wallet keys
* [ ] Vault sharing & team vaults
* [ ] AI-driven password health assistant
* [ ] Mobile app with offline vault access

---

## Contributing

Contributions welcome! Please open issues or submit pull requests.
For major changes, please open an issue first to discuss what you would like to change.

---

## License

MIT License © 2025 Vault³ Team

---

## Contact

For questions or feedback: [vault3-support@yourdomain.com](mailto:vault3-support@yourdomain.com)

---

Nếu cần tao làm sẵn template code repo, hoặc thêm API docs, chỉ bảo nhé.
