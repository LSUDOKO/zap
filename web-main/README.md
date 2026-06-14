<div align="center">
  <img src="public/images/Logo/zkpull-logo.png" alt="zkPull Logo" width="200"/>

  # zkPull

  **Decentralized Open Source Contribution Rewards System**

  Built on Mantle Network | Powered by zkTLS & AVS EigenLayer

  [Live Demo](#) | [Documentation](#) | [Smart Contracts](#)
</div>

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Application Flow](#application-flow)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Smart Contract Integration](#smart-contract-integration)
- [Setup Instructions](#setup-instructions)
- [Build and Deployment](#build-and-deployment)
- [Testing](#testing)

---

## Overview

zkPull is a decentralized platform that revolutionizes open source contribution rewards through blockchain technology. The platform enables repository owners to create bounties for GitHub issues and allows contributors to claim rewards automatically upon PR merge verification using zkTLS (Zero-Knowledge Transport Layer Security) and AVS (Actively Validated Services) from EigenLayer.

### Key Innovation

Traditional bounty systems require manual verification and trust between parties. zkPull eliminates this through:

- **zkTLS Technology**: Provides cryptographic proof of PR merge status without exposing sensitive data
- **AVS EigenLayer**: Decentralized validation layer ensuring tamper-proof verification
- **Smart Contract Automation**: Instant reward distribution upon successful validation
- **Mantle Network**: Fast, low-cost transactions on L2 blockchain

---

## Problem Statement

Open source contributors face several challenges:

1. **Payment Delays**: Waiting for repository owners to manually release funds
2. **Trust Issues**: Uncertainty whether bounties will be paid after contribution
3. **Manual Verification**: Time-consuming PR merge verification process
4. **Lack of Transparency**: No clear audit trail of contributions and payments
5. **Centralized Control**: Dependency on platform operators for dispute resolution

---

## Solution

zkPull addresses these challenges through:

### 1. Trustless Verification
- zkTLS automatically verifies PR merge status directly from GitHub
- No manual intervention required from repository owners
- Cryptographic proofs ensure authenticity

### 2. Instant Rewards
- Smart contracts hold bounty funds in escrow
- Automatic distribution upon successful validation
- No waiting periods or manual approvals

### 3. Decentralized Validation
- AVS EigenLayer provides additional validation layer
- Multiple validators ensure accuracy
- Byzantine fault tolerance

### 4. Transparent Audit Trail
- All transactions recorded on Mantle blockchain
- Complete history of bounties, claims, and validations
- Immutable proof of contributions

### 5. Maximum Claims Feature
- Support for multiple contributors per issue
- Fair reward distribution
- Flexible bounty splitting

---

## Technology Stack

### Frontend Framework
- **Next.js 15.6.0 (Turbopack)**: React framework with server-side rendering and optimal performance
- **TypeScript 5.5.2**: Type-safe development
- **Tailwind CSS**: Utility-first styling framework

### Blockchain Integration
- **Wagmi 2.14.5**: React hooks for Ethereum
- **Viem 2.22.17**: TypeScript Ethereum library
- **RainbowKit 2.2.4**: Wallet connection interface

### State Management
- **React Hooks**: Built-in state handling

### UI Components
- **Radix UI**: Accessible component primitives
- **Framer Motion 12.0.0**: Animation library
- **Lucide React**: Icon system
- **Sonner**: Toast notifications

### Network Infrastructure
- **Mantle Sepolia Testnet**: L2 blockchain for testing
- **Alchemy RPC**: Private RPC endpoint for reliability

### Development Tools
- **pnpm**: Fast, disk space efficient package manager
- **ESLint**: Code quality and consistency
- **Git Hooks**: Pre-commit validation

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
│  Next.js App Router │ React Components │ Tailwind CSS           │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Blockchain Integration                       │
│  Wagmi │ Viem │ RainbowKit │ Wallet Connectors                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Mantle Network                             │
│  Smart Contracts │ ERC20 Token │ Transaction Processing         │
└──────────────────────┬──────────────────────────────────────────┘
                       │
         ┌─────────────┴──────────────┐
         ▼                            ▼
┌──────────────────┐         ┌──────────────────┐
│  zkTLS Protocol  │         │  AVS EigenLayer  │
│  PR Verification │         │  Validation      │
└──────────────────┘         └──────────────────┘
```

### Component Architecture

```
src/
├── app/                          # Next.js App Router
│   ├── (landing)/               # Landing page route group
│   ├── (main)/                  # Main application routes
│   │   ├── issues/              # Browse bounty issues
│   │   ├── issues/[id]/         # Issue detail page
│   │   ├── create-bounty/       # Create new bounty
│   │   ├── profile/             # User profile
│   │   └── faucet/              # Test token faucet
│   └── globals.css              # Global styles
│
├── components/                   # React components
│   ├── pages/                   # Page-specific components
│   │   ├── (landing)/           # Landing page components
│   │   │   ├── Hero.tsx         # Hero section
│   │   │   ├── Work.tsx         # How it works section
│   │   │   ├── PartnerMarquee.tsx # Partner logos
│   │   │   └── CTA.tsx          # Call to action
│   │   └── (app)/               # Application components
│   │       ├── issues/          # Issue listing components
│   │       ├── issue-detail/    # Issue detail components
│   │       ├── create-bounty/   # Bounty creation form
│   │       ├── profile/         # Profile components
│   │       └── faucet/          # Faucet components
│   └── ui/                      # Reusable UI components
│       ├── button.tsx           # Button component
│       ├── input.tsx            # Input component
│       ├── WalletConnect.tsx    # Wallet connection
│       └── ...                  # Other UI components
│
├── lib/                          # Utilities and hooks
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-create-issue.tsx # Issue creation logic
│   │   ├── use-claim-rewards.tsx # Reward claiming logic
│   │   ├── use-get-all-issue.tsx # Fetch all issues
│   │   ├── use-mint-tokens.tsx  # Token minting
│   │   ├── use-balance.tsx      # Balance checking
│   │   └── use-wallet.tsx       # Wallet management
│   └── utils.ts                 # Utility functions
│
├── config/                       # Configuration files
│   ├── const.ts                 # Smart contract addresses & ABIs
│   └── wagmi.config.ts          # Wagmi configuration
│
└── utils/                        # Type definitions
    └── types.ts                 # TypeScript interfaces
```

---

## Application Flow

### 1. Repository Owner Creates Bounty

```
User Journey:
┌──────────────┐
│ Connect      │
│ Wallet       │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ Fill Bounty Form:                        │
│ - GitHub Project ID                      │
│ - Bounty Amount (mUSD)                   │
│ - Project Name                           │
│ - Description                            │
│ - Repository Link                        │
│ - Deadline                               │
│ - Maximum Claims (number of developers) │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Approve mUSD Token Spending  │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Submit Transaction           │
│ (createIssue function)       │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Bounty Created & Visible     │
│ on /issues page              │
└──────────────────────────────┘

Smart Contract Flow:
1. User approves MANTLE_USD_ADDRESS to spend bountyAmount
2. Contract transfers tokens from user to escrow
3. Issue stored with id, metadata, and maxClaims
4. IssueCreated event emitted
```

### 2. Contributor Claims Reward

```
User Journey:
┌──────────────┐
│ Browse       │
│ Issues       │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Select Issue         │
│ View Details         │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Create & Merge PR on GitHub  │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Connect with GitHub OAuth    │
│ (Access Token stored)        │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Enter PR Link & Submit Claim │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ zkTLS Verifies Merge Status  │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ AVS Validates Claim          │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Reward Distributed           │
│ (Bounty ÷ maxClaims)         │
└──────────────────────────────┘

Smart Contract Flow:
1. User submits claimReward with:
   - issueId
   - prLink
   - isMerged (verified by zkTLS)
   - accessToken (from sessionStorage)
2. Contract validates:
   - Issue is open
   - PR not already used
   - Maximum claims not reached
   - Merge status is true
3. If AVS enabled: Creates validation task
4. Upon validation: Transfer reward to developer
5. RewardClaimed event emitted
```

### 3. Validation Process

```
zkTLS Validation:
┌────────────────────────────┐
│ Contributor submits PR URL │
└─────────┬──────────────────┘
          │
          ▼
┌────────────────────────────────────┐
│ zkTLS creates secure proof of:     │
│ - PR exists on GitHub              │
│ - PR is merged                     │
│ - No sensitive data exposed        │
└─────────┬──────────────────────────┘
          │
          ▼
┌────────────────────────────┐
│ Proof sent to smart        │
│ contract for verification  │
└────────────────────────────┘

AVS Validation:
┌────────────────────────────┐
│ Smart contract creates     │
│ validation task            │
└─────────┬──────────────────┘
          │
          ▼
┌────────────────────────────────────┐
│ Multiple AVS operators validate:   │
│ - zkTLS proof authenticity         │
│ - PR merge correctness             │
│ - Issue-PR relationship            │
└─────────┬──────────────────────────┘
          │
          ▼
┌────────────────────────────┐
│ Consensus reached          │
│ (Byzantine fault tolerant) │
└─────────┬──────────────────┘
          │
          ▼
┌────────────────────────────┐
│ Validation result returned │
│ to smart contract          │
└────────────────────────────┘
```

---

## Key Features

### For Repository Owners

1. **Easy Bounty Creation**
   - Simple form-based interface
   - Support for multiple claim limits
   - Deadline enforcement
   - Automatic fund escrow

2. **Cost Control**
   - Set bounty amount per issue
   - Define maximum number of claimants
   - Withdraw unused funds after deadline

3. **Transparency**
   - View all claims on issue
   - Track validation status
   - Blockchain audit trail

### For Contributors

1. **Fair Rewards**
   - Automatic distribution upon validation
   - Pro-rata sharing for multiple claimants
   - No manual approval needed

2. **Security**
   - Funds guaranteed in smart contract escrow
   - Cryptographic proof of contribution
   - No risk of non-payment

3. **User Experience**
   - GitHub OAuth integration
   - Real-time claim status
   - Wallet balance tracking
   - Test token faucet

### Technical Features

1. **Maximum Claims System**
   - Support multiple developers per bounty
   - Automatic reward calculation: `Bounty Amount ÷ Max Claims`
   - Current claims tracking
   - Prevents over-claiming

2. **Dual Validation**
   - zkTLS: Cryptographic PR verification
   - AVS: Decentralized consensus validation
   - Byzantine fault tolerance
   - High security guarantee

3. **Token Management**
   - ERC20 mUSD token on Mantle
   - Approval flow for security
   - Balance display in wallet
   - Faucet for testing

4. **Responsive Design**
   - Mobile-first approach
   - Desktop optimization
   - Consistent UI across devices

---

## Project Structure

### Page Routes

```
/ (landing)
├── Hero section with zkTLS highlight
├── How it works (3-step process)
├── Partner marquee (Mantle, EigenLayer, etc.)
└── Call to action

/issues
├── Browse all open bounties
├── Filter and search
├── Highest reward badge
└── Issue cards with metadata

/issues/[id]
├── Issue details
├── Bounty information
├── Maximum claims display
├── Reward per claim calculation
├── Claim form
└── Validation status

/create-bounty
├── Bounty creation form
├── Token approval
├── Transaction confirmation
└── Success feedback

/profile
├── Wallet connection status
├── User statistics
├── Contribution history
└── Achievement display

/faucet
├── Test token minting
├── Amount input
├── Network information
└── Balance display
```

### Custom Hooks

All blockchain interactions are abstracted into custom hooks:

- `use-create-issue`: Handle bounty creation
- `use-claim-rewards`: Manage reward claiming process
- `use-get-all-issue`: Fetch and cache issues
- `use-mint-tokens`: Test token minting
- `use-balance`: Real-time balance updates
- `use-wallet`: Wallet connection management

---

## Smart Contract Integration

### Primary Contract: IssuesClaim

**Address**: Configured via environment variable `NEXT_PUBLIC_ISSUE_ADDRESS`

**Key Functions**:

1. **createIssue**
   ```solidity
   function createIssue(
     string _githubProjectId,
     uint256 _bountyAmount,
     string _projectName,
     string _description,
     string _repoLink,
     uint256 _deadline,
     uint256 _maxClaims
   )
   ```
   Creates a new bounty with escrow.

2. **claimReward**
   ```solidity
   function claimReward(
     uint256 _issueId,
     string _prLink,
     bool _isMerged,
     string _accessToken
   )
   ```
   Claims reward after PR merge.

3. **getAllIssues**
   ```solidity
   function getAllIssues() returns (Issue[])
   ```
   Returns all bounty issues.

4. **getIssueDetails**
   ```solidity
   function getIssueDetails(uint256 _issueId) returns (Issue)
   ```
   Fetches specific issue details.

5. **validateClaim**
   ```solidity
   function validateClaim(
     uint256 _issueId,
     uint256 _claimIndex,
     bool _isValid
   )
   ```
   Validator function for AVS.

### Token Contract: MantleUSD

**Address**: Configured via environment variable `NEXT_PUBLIC_MANTLEUSD_ADDRESS`

**Key Functions**:

1. **mint**
   ```solidity
   function mint(address to, uint256 amount)
   ```
   Mints test tokens (faucet).

2. **approve**
   ```solidity
   function approve(address spender, uint256 value)
   ```
   Approves contract to spend tokens.

3. **balanceOf**
   ```solidity
   function balanceOf(address account) returns (uint256)
   ```
   Returns token balance.

### Event Monitoring

The frontend listens to these events:

- `IssueCreated`: New bounty created
- `RewardClaimed`: Claim submitted
- `ClaimValidated`: Validation completed
- `AVSTaskCreated`: AVS validation initiated
- `FundsWithdrawn`: Owner withdrew funds

---

## Setup Instructions

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **pnpm**: v8.0.0 or higher
- **Git**: Latest version
- **Wallet**: MetaMask or compatible Web3 wallet

### Environment Configuration

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd web
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create `.env.local` file:
   ```bash
   # Smart Contract Addresses (Mantle Sepolia)
   NEXT_PUBLIC_ISSUE_ADDRESS=0x...
   NEXT_PUBLIC_MANTLEUSD_ADDRESS=0x...

   # RPC Configuration
   NEXT_PUBLIC_ALCHEMY_RPC=https://mantle-sepolia.g.alchemy.com/v2/YOUR_KEY

   # Application Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Configure wallet:
   - Add Mantle Sepolia network to MetaMask
   - Network Name: Mantle Sepolia Testnet
   - RPC URL: https://rpc.sepolia.mantle.xyz
   - Chain ID: 5003
   - Currency Symbol: MNT
   - Block Explorer: https://sepolia.mantlescan.xyz

### Development Server

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Key Development Commands

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Type checking
pnpm type-check
```

---

## Build and Deployment

### Production Build

1. Build the application:
   ```bash
   pnpm run build
   ```

2. Verify build output:
   - Check for zero errors
   - Check for zero warnings
   - Review bundle size
   - Test critical paths

3. Test production build locally:
   ```bash
   pnpm start
   ```

### Deployment Options

#### Vercel (Recommended)

1. Connect repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

#### Self-Hosted

1. Build application: `pnpm build`
2. Copy `.next`, `public`, `package.json` to server
3. Install production dependencies: `pnpm install --prod`
4. Start server: `pnpm start`

### Environment Variables (Production)

Ensure all environment variables are set in production:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_ISSUE_ADDRESS=
NEXT_PUBLIC_MANTLEUSD_ADDRESS=
NEXT_PUBLIC_GITHUB_CLIENT_ID=
NEXT_PUBLIC_ZK_BACKEND_GENERATE_PROOF=
NEXT_PUBLIC_ZK_BACKEND_GET_ACCESS_TOKEN=
```

---

## Testing

### Manual Testing Checklist

**Wallet Connection**:
- [ ] Connect wallet successfully
- [ ] Display correct address
- [ ] Show MNT balance
- [ ] Show mUSD balance
- [ ] Handle network switching

**Create Bounty Flow**:
- [ ] Fill form with valid data
- [ ] Approve token spending
- [ ] Submit transaction
- [ ] Receive confirmation
- [ ] Bounty appears on /issues

**Claim Reward Flow**:
- [ ] Select issue from list
- [ ] View issue details
- [ ] GitHub OAuth connection
- [ ] Submit claim with PR link
- [ ] Receive validation feedback
- [ ] Receive reward tokens

**Faucet**:
- [ ] Request test tokens
- [ ] Receive tokens in wallet
- [ ] Balance updates correctly

**UI/UX**:
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop
- [ ] Proper error messages
- [ ] Loading states visible
- [ ] Toast notifications work

### Smart Contract Testing

Test scenarios on Mantle Sepolia:

1. Create bounty with different maxClaims values
2. Multiple users claim same bounty
3. Verify reward splitting works correctly
4. Test deadline enforcement
5. Test maximum claims enforcement
6. Verify zkTLS validation
7. Verify AVS validation

---

## Architecture Decisions

### Why Next.js App Router?

- Server-side rendering for SEO
- File-based routing
- Built-in API routes
- Optimal code splitting
- Fast refresh during development

### Why Wagmi + Viem?

- Modern React hooks for Ethereum
- Type-safe contract interactions
- Built-in caching and request deduplication
- Extensive wallet support through RainbowKit
- Better developer experience than ethers.js

### Why Mantle Network?

- Low transaction costs (L2 scaling)
- EVM compatibility (easy smart contract deployment)
- Fast finality (quick confirmations)
- Growing ecosystem
- Good documentation

### Why Tailwind CSS?

- Utility-first approach (rapid development)
- Consistent design system
- Minimal CSS bundle (unused styles purged)
- Responsive design utilities
- Easy customization

---

## Contributing

This project follows strict code quality standards defined in `CLAUDE.md`:

- **SOLID principles** for all code
- **Type safety** required
- **Zero build warnings** policy
- **Component structure** must follow project conventions
- **Import discipline** through index files only
- **Performance** optimizations required

---

## License

This project is part of a hackathon submission and is provided as-is for evaluation purposes.

---

## Support

For technical support or questions:

- Open an issue in the repository
- Contact the development team
- Review documentation in `/docs` directory

---

## Acknowledgments

Built with:
- Mantle Network
- EigenLayer AVS
- zkTLS Protocol
- Reclaim Protocol
- Next.js
- Wagmi
- RainbowKit

---

<div align="center">
  <p>Built for open source, by open source.</p>
  <p>zkPull - Empowering Contributors with Trustless Rewards</p>
</div>
