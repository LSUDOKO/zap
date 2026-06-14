# zkPull — MetaMask Hackathon Conversion

## Overview

zkPull is a **decentralized GitHub bounty platform** where repository owners create bounties (in mUSD tokens) for GitHub issues, and developers claim rewards automatically when their PR is merged — verified through **zkTLS** proofs and **AVS (EigenLayer)** validation.

This document tracks the changes made to prepare zkPull for the **MetaMask Hackathon**.

---

## Project Structure

```
zap/                              # Root (monorepo)
├── web-main/                     # Frontend — Next.js 15 + RainbowKit + MetaMask Smart Accounts
├── zkpull-zktls-main/            # Backend — Express.js API for zkTLS proof generation
├── zkpull-contracts-main/        # Smart Contracts — Solidity/Foundry on Mantle Sepolia
└── zkpull-AVS-main/              # AVS Operator Bot — Automated claim validation
```

---

## Changes Made

### 1. 🆕 MetaMask Smart Accounts Integration (`web-main/`)

**Package installed:**
- `@metamask/smart-accounts-kit@^1.6.0` — Core SDK for creating and managing MetaMask Smart Accounts

**New files:**
- `src/lib/MetaMaskSmartAccountProvider.tsx` — Context provider that creates a **MetaMask Smart Account** (Hybrid implementation) automatically when a user connects their wallet via RainbowKit
- Smart Account features: gasless transactions via paymaster support, programmable account logic

**Modified files:**
- `src/app/layout.tsx` — Wrapped the app with `<MetaMaskSmartAccountProvider>` (inside WagmiProvider) so every connected user gets a smart account
- `src/lib/WagmiProviderWrapper.tsx` — Added `metaMaskWallet` to the RainbowKit wallet list; moved hardcoded Alchemy API key and WalletConnect project ID to environment variables
- `src/config/wagmi.config.ts` — Updated to use env vars with fallbacks instead of hardcoded API keys

### 2. 🔧 Bug Fix: Claim Rewards Hook (`web-main/`)

**File:** `src/lib/hooks/use-claim-rewards.tsx`

**Problem:** The hook was calling `approve()` on the mUSD token contract before calling `claimReward()`. This approval step is **incorrect** because:
- `claimReward()` sends tokens **from the contract (escrow) to the developer** — the developer doesn't need to approve spending
- The approval step would cause a failed/unnecessary transaction, wasting gas

**Fix:** Removed the entire approval flow. Now `handleClaimRewards()` directly calls `claimReward()` on the IssuesClaim contract with the issue ID, PR link, merge status, and access token. Also added proper loading toasts and error handling.

### 3. 🔐 Environment Configuration (All Sub-Projects)

**`web-main/`:**
- Created `.env.local` with all configured values (contract addresses, RPC URLs, API keys)
- Created `.env.example` for developers to reference
- Fixed `src/env.ts` to validate all required env vars: added `NEXT_PUBLIC_ALCHEMY_API_KEY`, `NEXT_PUBLIC_ZK_BACKEND_GENERATE_PROOF`, `NEXT_PUBLIC_ZK_BACKEND_GET_ACCESS_TOKEN`, `NEXT_PUBLIC_GITHUB_CLIENT_ID`, `NEXT_PUBLIC_MANTLE_RPC_URL`, `NEXT_PUBLIC_APP_URL`

**`zkpull-zktls-main/`:**
- Has `.env.example` with GitHub OAuth + Reclaim Protocol + server config

**`zkpull-contracts-main/`:**
- Has `.env.example` with deployment config (RPC URLs, private key placeholders, AVS config)

**`zkpull-AVS-main/`:**
- Has `.env.example` with operator config (RPC URL, private key, contract addresses)

### 4. 🗑️ Hardcoded API Keys Removed

**`WagmiProviderWrapper.tsx`** and **`wagmi.config.ts`** previously had hardcoded:
- Alchemy API key (`jsv8qLwrBKaShfeL_NJzfHbWoj5h-hnM`)
- WalletConnect Project ID (`fe575b36234dc9b54e34a40e332d7f92`)

These are now read from environment variables via the validated `env` config, with fallbacks for development.

### 5. 🐙 Git Repository Initialized

- Root `.gitignore` created (node_modules, .env, .next, build outputs, IDE files)
- Git initialized at project root
- Ready for hackathon submission

---

## MetaMask Hackathon Value

### What MetaMask Tools Are Used

1. **MetaMask Smart Accounts Kit** (`@metamask/smart-accounts-kit`)
   - `toMetaMaskSmartAccount` — Creates programmable smart accounts for connected users
   - `Implementation.Hybrid` — Hybrid implementation supporting both EOA and smart account features
   - Enables **gasless transactions** (via paymaster) for creating bounties and claiming rewards
   - Users interact via **MetaMask wallet** (or any RainbowKit-supported wallet)

2. **RainbowKit + MetaMask Wallet** — MetaMask is explicitly listed in the wallet selection UI

3. **ERC-7710 Delegations** (available via `@metamask/smart-accounts-kit`) — Ready for delegation-based permission systems

### Why This Matters for the Hackathon

| Criterion | How zkPull Addresses It |
|-----------|------------------------|
| **Innovation** | Combines zkTLS proofs + AVS validation + smart accounts for trustless bounty payouts |
| **Technical Impl.** | Uses MetaMask Smart Accounts Kit, Foundry smart contracts, Next.js, RainbowKit |
| **User Experience** | One-click wallet connect, auto smart account creation, gasless transactions |
| **Documentation** | This conversion.md, READMEs for all sub-projects, `.env.example` for each |
| **Ecosystem Value** | Decentralizes open-source funding on Mantle L2 with MetaMask infrastructure |

---

## Next Steps / Future Enhancements

- [ ] **Deploy paymaster** for fully gasless user operations
- [ ] **Add delegation-based permissions** (ERC-7710) — project owners can delegate reward distribution
- [ ] **Multi-chain support** — deploy to Linea (MetaMask's L2) for tighter MetaMask ecosystem integration
- [ ] **Smart Account recovery** — add social recovery for smart accounts via Web3Auth/Embedded Wallets
