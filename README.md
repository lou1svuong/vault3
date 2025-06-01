# Vault³ - Decentralized Password Manager

Vault³ is a next-generation decentralized password manager built on the Sui blockchain. It combines the security of blockchain technology with the convenience of modern password management, offering a unique approach to securing your digital life.

## Key Features

- **Two-Layer Security**
  - Sui wallet authentication for secure access
  - Master key encryption for data protection
  - Client-side encryption using Tusky SDK

- **Multi-Vault Support**
  - Create and manage multiple vaults
  - Share vaults with other users
  - Role-based access control

- **Decentralized Storage**
  - IPFS-based storage for global availability
  - Censorship-resistant architecture

- **Zero Knowledge**
  - All encryption/decryption happens client-side
  - No backend servers
  - Your data never leaves your device

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- Sui wallet (Suiet Wallet or etc..)
- pnpm package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/lou1svuong/vault3.git
cd vault3
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

## Security Architecture

Vault³ implements a robust security architecture:

1. **Authentication Layer**
   - Sui wallet-based authentication
   - Personal message signing for verification
   - Hardware wallet support

2. **Encryption Layer**
   - Client-side encryption using Tusky SDK
   - Master key for data protection
   - Keystore-based encryption

3. **Storage Layer**
   - IPFS decentralized storage
   - On-chain metadata anchoring
   - Censorship resistance

## Technology Stack

- **Frontend**
  - Next.js 14 with App Router
  - React 19
  - TailwindCSS 4
  - Radix UI Components

- **Blockchain**
  - Sui Network
  - @mysten/dapp-kit
  - @mysten/sui

- **Storage & Encryption**
  - Tusky SDK
  - IPFS/Walrus
  - Client-side encryption
