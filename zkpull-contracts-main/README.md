# zkPull Contracts

> **Decentralized GitHub Bounty Platform with Automated Validation**

A revolutionary bounty management system that connects project owners with developers through blockchain technology. Create bounties for GitHub issues, and let our automated validation system handle the rest.

---

## 🎯 What is zkPull?

zkPull transforms how open-source contributions are rewarded. Instead of manual payment processes and trust issues, zkPull uses smart contracts and automated validation to ensure developers get paid instantly when their pull requests are merged.

### The Problem We Solve

- ❌ Manual bounty payments are slow and unreliable
- ❌ Trust issues between project owners and contributors
- ❌ No transparent proof of contribution
- ❌ Complex payment processes across borders

### Our Solution

- ✅ **Instant Payments**: Rewards sent automatically when PR is merged
- ✅ **Zero Trust Required**: Smart contracts handle everything
- ✅ **Transparent**: All transactions on-chain and verifiable
- ✅ **Global**: Anyone, anywhere can participate

---

## 🌟 Key Features

### For Project Owners

- 🎯 **Create Bounties in Seconds**: Set reward amount, deadline, and max contributors
- 💰 **Pay with mUSD Tokens**: Stable, predictable payments
- 🔒 **Funds are Safe**: Locked in smart contract until conditions are met
- 📊 **Full Transparency**: Track all claims and validations on-chain
- 💸 **Refund Unclaimed Funds**: Get your money back after deadline

### For Developers

- 🚀 **Claim Rewards Instantly**: Submit your merged PR and get paid
- ⚡ **Automated Validation**: No waiting for manual approval (with AVS)
- 🌍 **Work from Anywhere**: Global access, no KYC required
- 💎 **Fair Distribution**: Multiple developers can share bounties
- 🔐 **Secure Payments**: Guaranteed by smart contracts

### For Everyone

- 🤖 **AVS Automation**: Actively Validated Service handles verification automatically
- 🔍 **zkTLS Verification**: Cryptographic proof of PR merge status
- ⛓️ **Decentralized**: No single point of failure
- 📱 **Easy Integration**: Simple API for frontend developers

---

## 🏗️ System Architecture

### Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        zkPull System                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐ │
│  │   Frontend   │─────▶│  Smart       │◀─────│   AVS    │ │
│  │   (Users)    │      │  Contracts   │      │ Operators│ │
│  └──────────────┘      └──────────────┘      └──────────┘ │
│         │                      │                     │      │
│         │                      │                     │      │
│         ▼                      ▼                     ▼      │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              Mantle Sepolia Blockchain               │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Smart Contracts

```
┌─────────────────────────────────────────────────────────────┐
│                     Contract Structure                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  MantleUSD (mUSD)                                           │
│  └─ ERC20 token for bounties and staking                   │
│                                                              │
│  IssuesClaimWithAVS                                         │
│  ├─ Create bounties                                         │
│  ├─ Submit claims                                           │
│  ├─ Validate claims                                         │
│  └─ Withdraw funds                                          │
│                                                              │
│  ZKPullAVS                                                  │
│  ├─ Operator registration                                   │
│  ├─ Task management                                         │
│  ├─ Automated validation                                    │
│  └─ Reward distribution                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤖 What is AVS?

**AVS (Actively Validated Service)** is our automated validation system that eliminates manual approval processes.

### How It Works

```
1. Developer submits claim
         ↓
2. AVS creates validation task
         ↓
3. Operator picks up task
         ↓
4. Operator verifies PR with zkTLS
         ↓
5. Operator submits validation
         ↓
6. Smart contract sends reward
         ↓
7. Developer receives payment ✅
```

### Benefits

- ⚡ **Fast**: Validation in 30-60 seconds
- 🔒 **Secure**: Cryptographic proof required
- 🌐 **Decentralized**: Multiple operators can participate
- 💰 **Economic Security**: Operators stake tokens to participate
- 🎯 **Accurate**: zkTLS ensures PR is actually merged

### Who Runs AVS?

- **Platform Owners**: Run operators to automate their platform
- **Third-Party Operators**: Earn fees by validating claims
- **Community Members**: Contribute to decentralization

**Note**: Users (project owners and developers) don't need to run anything!

---

## 📁 Project Structure

```
zkPull-contracts/
├── src/
│   ├── avs/                              # AVS System
│   │   ├── MantleUSD.sol                # mUSD token contract
│   │   ├── IssuesClaimWithAVS.sol       # Main bounty contract with AVS
│   │   ├── ZKPullAVS.sol                # AVS management contract
│   │   └── ZKTLSOperator.sol            # Operator interface
│   │
│   ├── contracts/                        # Core Contracts
│   │   ├── interfaces/
│   │   │   └── IIssuesClaim.sol         # Contract interfaces
│   │   ├── base/
│   │   │   ├── IssueStorage.sol         # Storage layout
│   │   │   └── IssueModifiers.sol       # Access control
│   │   ├── libraries/
│   │   │   ├── IssueErrors.sol          # Custom errors
│   │   │   ├── IssueValidator.sol       # Validation logic
│   │   │   └── IssueCalculator.sol      # Calculation logic
│   │   └── core/
│   │       ├── IssueManager.sol         # Issue management
│   │       ├── ClaimManager.sol         # Claim management
│   │       └── FundsManager.sol         # Fund management
│   │
│   └── IssuesClaim.sol                  # Legacy contract (non-AVS)
│
├── operator/                             # AVS Operator Bot
│   ├── bot.js                           # Main bot logic
│   ├── register.js                      # Registration script
│   └── package.json                     # Dependencies
│
├── test/                                # Test Suite
│   ├── avs/                            # AVS tests
│   ├── unit/                           # Unit tests
│   └── integration/                    # Integration tests
│
├── script/                              # Deployment Scripts
│   ├── Deploy.s.sol                    # Legacy deployment
│   └── DeployAVS.s.sol                 # AVS deployment
│
└── docs/                                # Documentation
    ├── FLOW.md                         # Frontend integration guide
    ├── AVS_OPERATOR_GUIDE.md           # Operator setup guide
    ├── WHY_AVS.md                      # AVS explanation
    └── ALUR_NEW_UPDATES.md             # System flow (Indonesian)
```

---

## 🚀 Quick Start

### For Users (Project Owners & Developers)

You only need a wallet and some tokens. No technical setup required!

1. **Get a Wallet**: Install MetaMask or similar
2. **Get Test Tokens**: 
   - MNT for gas fees
   - mUSD for bounties
3. **Connect to Platform**: Use the zkPull web interface
4. **Start Creating/Claiming**: That's it!

### For Platform Owners (Running AVS Operator)

If you're building a platform on zkPull, you'll want to run an operator for automated validation.

#### Prerequisites

- Node.js v16+
- 1000 mUSD for staking
- MNT for gas fees
- Basic command line knowledge

#### Quick Setup

```bash
# 1. Clone repository
git clone https://github.com/your-org/zkPull-contracts.git
cd zkPull-contracts

# 2. Install dependencies
cd operator
npm install

# 3. Configure environment
cp .env.example .env
nano .env  # Add your private key and addresses

# 4. Register as operator
npm run register

# 5. Start bot
npm start
```

That's it! Your operator is now validating claims automatically.

---

## 📖 How to Use

### 1. Creating a Bounty (Project Owner)

```javascript
// Frontend example
import { ethers } from 'ethers';

// Connect wallet
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

// Contract instances
const mUSD = new ethers.Contract(MUSD_ADDRESS, MUSD_ABI, signer);
const issuesClaim = new ethers.Contract(ISSUES_CLAIM_ADDRESS, ABI, signer);

// Step 1: Approve mUSD spending
await mUSD.approve(
  ISSUES_CLAIM_ADDRESS,
  ethers.utils.parseEther("100") // 100 mUSD
);

// Step 2: Create bounty
await issuesClaim.createIssue(
  "zkPull/repo#123",                    // GitHub issue ID
  ethers.utils.parseEther("100"),       // 100 mUSD bounty
  "zkPull Protocol",                    // Project name
  "Add dark mode support",              // Description
  "https://github.com/zkPull/repo",     // Repo link
  Math.floor(Date.now() / 1000) + 2592000, // 30 days deadline
  3                                     // Max 3 developers can claim
);
```

### 2. Claiming a Reward (Developer)

```javascript
// After your PR is merged
await issuesClaim.claimReward(
  0,                                    // Issue ID
  "https://github.com/zkPull/repo/pull/456", // Your merged PR
  true                                  // Is merged
);

// AVS will automatically validate and send reward!
```

### 3. Checking Status

```javascript
// Get issue details
const issue = await issuesClaim.getIssueDetails(0);
console.log(`Bounty: ${ethers.utils.formatEther(issue.bountyAmount)} mUSD`);
console.log(`Claims: ${issue.currentClaims}/${issue.maxClaims}`);

// Get claim status
const claim = await issuesClaim.getClaimResponse(0, 0);
console.log(`Status: ${claim.isValidated ? 'Validated' : 'Pending'}`);

// Check if AVS is active
const operatorCount = await avs.getActiveOperatorsCount();
console.log(`Active operators: ${operatorCount}`);
```

---

## 🛠️ Development

### Installation

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Clone and setup
git clone https://github.com/your-org/zkPull-contracts.git
cd zkPull-contracts
forge install
```

### Build & Test

```bash
# Build contracts
forge build

# Run tests
forge test

# Run with verbosity
forge test -vvv

# Gas report
forge test --gas-report

# Coverage
forge coverage
```

### Deploy

```bash
# Setup environment
cp .env.example .env
nano .env  # Add your configuration

# Deploy to testnet
./DEPLOY_AVS.sh

# Or manually
forge script script/DeployAVS.s.sol \
  --rpc-url $MANTLE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### Verify Contracts

```bash
# Flatten contracts
./FLATTEN.sh

# Generate constructor arguments
./generate_constructor_args.sh MantleUSD
./generate_constructor_args.sh IssuesClaimWithAVS
./generate_constructor_args.sh ZKPullAVS

# Verify manually on explorer
# https://explorer.sepolia.mantle.xyz/
```

---

## 📚 Documentation

### For Different Audiences

- **Users**: [FLOW.md](./FLOW.md) - How to use the platform
- **Developers**: [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) - API integration
- **Operators**: [AVS_OPERATOR_GUIDE.md](./AVS_OPERATOR_GUIDE.md) - Setup guide
- **Curious**: [WHY_AVS.md](./WHY_AVS.md) - Why we built AVS

### Quick References

- [COMMANDS.md](./COMMANDS.md) - All CLI commands
- [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - Deployment guide
- [DEBUG_AVS_BOT.md](./DEBUG_AVS_BOT.md) - Troubleshooting

---

## 🔐 Security

### Smart Contract Security

- ✅ **Access Control**: Role-based permissions
- ✅ **Reentrancy Protection**: Safe transfer patterns
- ✅ **Input Validation**: Comprehensive checks
- ✅ **Custom Errors**: Gas-efficient error handling
- ✅ **Deadline Enforcement**: Time-based controls
- ✅ **Duplicate Prevention**: One PR, one claim

### AVS Security

- ✅ **Economic Security**: Operators stake 100 mUSD
- ✅ **Slashing Mechanism**: Penalties for misbehavior
- ✅ **zkTLS Proofs**: Cryptographic verification
- ✅ **Decentralized**: Multiple operators
- ✅ **Transparent**: All actions on-chain

### Audit Status

⚠️ **Not Audited**: This is testnet software. Do not use in production without proper security audit.

---

## 🌐 Deployed Contracts

### Mantle Sepolia Testnet

```
MantleUSD (mUSD):        0x5ab8ddE10e31d503C5db1D734ca64dD2e0066d72
IssuesClaimWithAVS:      0x836112Af92dCA17D5a45d3b4Fc7E490eC6b4B36e
ZKPullAVS:               0x9d507b8c972ee303773Bd409cd56Ed1b37D67a10

Network:                 Mantle Sepolia
Chain ID:                5003
RPC URL:                 https://rpc.sepolia.mantle.xyz
Explorer:                https://explorer.sepolia.mantle.xyz
```

### Get Test Tokens

1. **MNT (Gas)**: [Mantle Faucet](https://faucet.sepolia.mantle.xyz/)
2. **mUSD (Bounties)**: Contact platform owner or mint if you deployed

---

## 💡 Use Cases

### Open Source Projects

- Incentivize bug fixes
- Reward feature implementations
- Encourage documentation improvements
- Fund security audits

### DAOs

- Bounties for governance proposals
- Rewards for community contributions
- Automated treasury management
- Transparent fund allocation

### Companies

- Outsource development tasks
- Pay global contractors instantly
- Reduce payment processing overhead
- Transparent expense tracking

### Hackathons

- Automated prize distribution
- Fair judging with proof
- Instant winner payments
- Transparent results

---

## 🎓 How It Works (Technical)

### 1. Bounty Creation Flow

```
User                    Contract                 Blockchain
  │                        │                         │
  ├─ Approve mUSD ────────▶│                         │
  │                        ├─ Check allowance ──────▶│
  │                        │◀─ Confirmed ────────────┤
  │                        │                         │
  ├─ Create Issue ────────▶│                         │
  │                        ├─ Transfer mUSD ────────▶│
  │                        ├─ Store issue data ─────▶│
  │                        ├─ Emit IssueCreated ────▶│
  │◀─ Issue ID ────────────┤                         │
```

### 2. Claim & Validation Flow (with AVS)

```
Developer              Contract              AVS Operator
    │                     │                       │
    ├─ Claim Reward ─────▶│                       │
    │                     ├─ Store claim          │
    │                     ├─ Create AVS task ────▶│
    │                     │                       │
    │                     │                  ┌────┴────┐
    │                     │                  │ Verify  │
    │                     │                  │ PR with │
    │                     │                  │ zkTLS   │
    │                     │                  └────┬────┘
    │                     │                       │
    │                     │◀─ Submit validation ──┤
    │                     ├─ Validate claim       │
    │                     ├─ Transfer reward      │
    │◀─ Reward received ──┤                       │
```

### 3. AVS Operator Flow

```
Operator Bot          AVS Contract         IssuesClaim
     │                      │                    │
     ├─ Listen events ─────▶│                    │
     │                      │                    │
     │◀─ TaskCreated ───────┤                    │
     │                      │                    │
     ├─ Pick task ─────────▶│                    │
     │                      ├─ Assign to me      │
     │                      │                    │
     ├─ Verify PR           │                    │
     │  (zkTLS/GitHub API)  │                    │
     │                      │                    │
     ├─ Submit validation ─▶│                    │
     │                      ├─ Call validate ───▶│
     │                      │                    ├─ Send reward
     │                      │◀─ Success ─────────┤
     │◀─ Task completed ────┤                    │
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

### For Code Contributors

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`forge test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### For Documentation

- Fix typos or unclear explanations
- Add examples or tutorials
- Translate documentation
- Improve diagrams

### For Bug Reports

- Use GitHub Issues
- Include reproduction steps
- Provide error messages
- Specify environment details

---

## 📊 Roadmap

### Phase 1: Foundation ✅
- [x] Core smart contracts
- [x] Basic bounty system
- [x] Manual validation

### Phase 2: Automation ✅
- [x] AVS implementation
- [x] Operator bot
- [x] zkTLS integration
- [x] Automated validation

### Phase 3: Enhancement (Current)
- [ ] Multi-chain support
- [ ] Advanced zkTLS features
- [ ] Operator marketplace
- [ ] Governance system

### Phase 4: Scale
- [ ] Mainnet deployment
- [ ] Security audit
- [ ] Mobile app
- [ ] Enterprise features

---

## 🆘 Support

### Get Help

- 📖 **Documentation**: Check our guides first
- 💬 **Discord**: Join our community
- 🐛 **Issues**: Report bugs on GitHub
- 📧 **Email**: support@zkpull.io

### Common Issues

**Q: My transaction failed**
- Check you have enough MNT for gas
- Ensure mUSD is approved
- Verify contract addresses

**Q: AVS not validating**
- Check if operators are active
- Verify AVS is enabled
- See [DEBUG_AVS_BOT.md](./DEBUG_AVS_BOT.md)

**Q: Can't claim reward**
- Ensure PR is actually merged
- Check PR link hasn't been used
- Verify issue is still open

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

**Important**: This is experimental software running on testnet.

- ❌ Not audited - do not use in production
- ❌ No warranty - use at your own risk
- ❌ Testnet only - not for real money
- ✅ Educational purposes
- ✅ Community testing
- ✅ Feedback welcome

Always conduct thorough security audits before deploying to mainnet.

---

## 🙏 Acknowledgments

- **Mantle Network**: For the amazing L2 infrastructure
- **Foundry**: For the best smart contract development toolkit
- **zkTLS**: For cryptographic verification technology
- **OpenZeppelin**: For secure contract libraries
- **Community**: For feedback and contributions

---

## 📞 Contact

- **Website**: https://zkpull.io
- **Twitter**: [@zkPull](https://twitter.com/zkPull)
- **Discord**: [Join our server](https://discord.gg/zkpull)
- **GitHub**: [zkPull Organization](https://github.com/zkPull)
- **Email**: hello@zkpull.io

---

<div align="center">

**Built with ❤️ by the zkPull Team**

[Website](https://zkpull.io) • [Docs](./FLOW.md) • [Twitter](https://twitter.com/zkPull) • [Discord](https://discord.gg/zkpull)

</div>
