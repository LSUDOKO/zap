# 🗺️ zkPull — Complete MetaMask Hackathon Implementation Roadmap

## 🎯 Project Overview

zkPull is a **decentralized GitHub bounty platform**:
- **Repo owners** create bounties (mUSD tokens) for GitHub issues
- **Developers** claim rewards when their PR is merged — verified via **zkTLS proofs**
- **AVS (EigenLayer)** provides decentralized validation
- Currently deployed on **Mantle Sepolia** testnet

---

## 1️⃣ MetaMask Smart Accounts (20% DONE — Partial Implementation)

### What It Is
MetaMask Smart Accounts (via `@metamask/smart-accounts-kit`) are **programmable smart contract wallets** that support:
- **Hybrid accounts** — works as both EOA and smart account (EIP-7702)
- **Gasless transactions** — via paymaster/bundler
- **User Operations** — instead of regular txns
- **Multisig** — threshold-based signing

### Current Status
✅ `@metamask/smart-accounts-kit@^1.6.0` installed
✅ `MetaMaskSmartAccountProvider.tsx` created — auto-creates Hybrid smart accounts on wallet connect
✅ Wrapped in `layout.tsx`
✅ `useSmartAccount()` hook available

### Remaining Tasks

| # | Task | Files | Impact |
|---|------|-------|--------|
| 1.1 | **Deploy a bundler client** for sending UserOperations instead of regular transactions | `src/lib/MetaMaskSmartAccountProvider.tsx` | Enables smart account txns |
| 1.2 | **Create `use-smart-account-operation.ts`** hook for sending UserOps via bundler | `src/lib/hooks/` | Replaces raw `useWriteContract` |
| 1.3 | **Update `use-create-issue.tsx`** to send UserOperations via smart account | `src/lib/hooks/use-create-issue.tsx` | Gas abstraction for bounties |
| 1.4 | **Update `use-claim-rewards.tsx`** to send UserOperations via smart account | `src/lib/hooks/use-claim-rewards.tsx` | Gas abstraction for claims |
| 1.5 | **Add paymaster support** for sponsored gas (gasless create-bounty & claim) | `src/lib/hooks/use-smart-account-operation.ts` | Zero gas for users |
| 1.6 | **Show smart account status in UI** — deployed/undeployed, smart account address | `src/components/ui/WalletConnect.tsx` | User visibility |
| 1.7 | **Deploy button** for undeployed smart accounts | `src/components/ui/WalletConnect.tsx` | One-click deploy |

### Concrete Use in zkPull
- When a dev connects their MetaMask wallet, a **smart account is auto-created**
- Creating a bounty: instead of `writeContract.createIssue`, send a `UserOperation` via bundler — **gas can be sponsored** by the platform
- Claiming a reward: send UserOp, potentially **gasless** with a paymaster
- The smart account address becomes the user's **on-chain identity** for the platform

---

## 2️⃣ Advanced Permissions (ERC-7715) — 0% Done

### What It Is
ERC-7715 allows **MetaMask users to grant fine-grained execution permissions** to dapps. The user signs permissions like:
- "This dapp can spend 10 mUSD/day on my behalf"
- "This dapp can call `claimReward()` on the IssuesClaim contract"

### How It Maps to zkPull

| # | Task | Description | Priority |
|---|------|-------------|----------|
| 2.1 | **Create `use-advanced-permissions.ts`** hook wrapping `requestExecutionPermissions` | `src/lib/hooks/` | High |
| 2.2 | **Bounty Owner Permission Flow**: When creating a bounty, request permission to auto-distribute rewards (ERC-20 periodic: X mUSD/day) | `src/components/pages/(app)/create-bounty/CreateBounty.tsx` | High |
| 2.3 | **Developer Permission Flow**: When claiming a reward, request permission for the dapp to call `claimReward()` on the contract | `src/components/pages/(app)/issue-detail/IssueDetail.tsx` | High |
| 2.4 | **Check supported permissions UI** — show what permissions the wallet supports | New component `src/components/ui/PermissionsInfo.tsx` | Medium |
| 2.5 | **Permission revocation UI** — allow users to revoke granted permissions | New component | Medium |
| 2.6 | **Auto-validation agent**: AVS operator receives a permission context to auto-validate claims on the user's behalf | `zkpull-AVS-main/operator/` | Advanced |

### Concrete Use in zkPull
- **Scenario**: Alice creates a bounty of 100 mUSD. Instead of transferring to escrow now, she grants the dapp a **one-time permission** to transfer 100 mUSD from her wallet when conditions are met
- **Scenario**: Bob claims a reward. The dapp has a **periodic permission** (5 mUSD/day) to auto-distribute rewards without Bob signing each time
- **Redelegation chain**: AVS operator gets narrowed permission from the dapp to validate claims (e.g., can only call `validateClaim()`)

### Implementation Pattern
```ts
// Bounty owner grants permission for the dapp to spend mUSD
const grantedPermissions = await walletClient.requestExecutionPermissions([{
  chainId: mantleSepoliaTestnet.id,
  expiry: currentTime + 604800, // 1 week
  to: sessionAccount.address,
  permission: {
    type: 'erc20-token-allowance',
    data: {
      tokenAddress: MANTLE_USD_ADDRESS,
      allowanceAmount: parseEther('100'), // 100 mUSD
      startTime: currentTime,
      justification: 'Bounty escrow for GitHub issue #42',
    },
    isAdjustmentAllowed: false,
  },
}])

// Use the permission context to execute the transfer
await sessionAccount.executePermissionContext({
  environment,
  permissionContext: grantedPermissions[0].context,
  calls: [{
    to: ISSUE_ADDRESS,
    value: 0n,
    data: encodeFunctionData({
      abi: ISSUE_ABI,
      functionName: 'createIssue',
      args: [githubProjectId, bountyAmount, ...],
    }),
  }],
})
```

---

## 3️⃣ Delegations (ERC-7710) — 0% Done

### What It Is
ERC-7710 allows **smart accounts to delegate execution authority** to other accounts with constraints (caveats). Unlike ERC-7715 (user→dapp), ERC-7710 is **smart account→other account** delegation.

### How It Maps to zkPull

| # | Task | Description | Priority |
|---|------|-------------|----------|
| 3.1 | **Create `use-delegations.ts`** hook wrapping `createDelegation`, `getDelegations`, `executeDelegation` | `src/lib/hooks/` | High |
| 3.2 | **Delegate reward distribution to AVS**: Bounty owner's smart account delegates the ability to call `validateClaim()` to the AVS operator | `src/lib/hooks/use-delegations.ts` | High |
| 3.3 | **Delegation scopes UI**: Show active delegations, their scopes (mUSD amount, function calls, expiry) | New component | Medium |
| 3.4 | **Disable delegation UI**: Allow users to revoke delegations | New component | Medium |
| 3.5 | **Redelegation for sub-agents**: AVS operator redelegates narrowed authority to specific validator agents (e.g., zkTLS verifier gets only `verifyMergeStatus` permission) | `zkpull-AVS-main/operator/` | Advanced |

### Concrete Use in zkPull
- **Scenario**: Alice's smart account creates a delegation allowing the **zkPull AVS operator** to call `validateClaim()` on the IssuesClaim contract, but **only** for issues Alice created, and **only** up to 100 mUSD total
- **Caveat**: `ScopeType.FunctionCall` restricted to `validateClaim(uint256,uint256,bool)` on the IssuesClaim contract
- **Redelegation**: The AVS operator redelegates to a sub-validator with `CaveatType.Erc20TransferAmount` — can only validate claims up to 10 mUSD each

### Implementation Pattern
```ts
// Alice's smart account delegates claim validation to the AVS operator
const delegation = createDelegation({
  to: avsOperatorAddress,
  from: aliceSmartAccount.address,
  environment,
  salt: '0x' + crypto.randomBytes(32).toString('hex'),
  scope: {
    type: ScopeType.FunctionCall,
    targets: [ISSUE_ADDRESS],
    selectors: ['validateClaim(uint256,uint256,bool)'],
  },
  caveats: [{
    type: CaveatType.Timestamp,
    afterThreshold: currentTime,
    beforeThreshold: currentTime + 604800, // 7 days
  }],
})

// AVS operator executes the delegated call
await avsOperator.executeDelegation({
  environment,
  delegation,
  calls: [{
    to: ISSUE_ADDRESS,
    value: 0n,
    data: encodeFunctionData({
      abi: ISSUE_ABI,
      functionName: 'validateClaim',
      args: [issueId, claimIndex, true],
    }),
  }],
})
```

---

## 4️⃣ 1Shot API — 0% Done

### What It Is
1Shot API is a **server wallet & transaction execution platform** that provides:
- **Server wallets** — create/manage server-side EVM wallets
- **Contract methods** — import, read, simulate, execute smart contract functions
- **Transaction execution** — single, batch, delegated
- **x402 facilitator** — run a pay-per-request middleware
- **Webhooks** — real-time notifications on transaction status

### How It Maps to zkPull

| # | Task | Description | Priority |
|---|------|-------------|----------|
| 4.1 | **Create 1Shot API client** — `OneShotClient` setup with env vars | `zkpull-zktls-main/services/1shot.service.js` | High |
| 4.2 | **Server wallet for platform fees**: Create a 1Shot server wallet on Mantle Sepolia to collect platform fees | `zkpull-zktls-main/services/1shot.service.js` | High |
| 4.3 | **Import IssuesClaim contract methods** into 1Shot API for programmatic execution | 1Shot Dashboard / SDK | High |
| 4.4 | **Replace manual contract calls with 1Shot API** in the Express backend: `createIssue`, `claimReward`, `validateClaim` | `zkpull-zktls-main/controllers/` | High |
| 4.5 | **Batch execution for reward distribution**: When multiple devs claim the same bounty, 1Shot API can batch all reward transfers in one transaction | `zkpull-zktls-main/services/1shot.service.js` | Medium |
| 4.6 | **x402 facilitator for zkTLS proof generation**: Pay-per-proof with x402 — devs pay $0.01 in USDC to generate a proof | `zkpull-zktls-main/services/1shot.service.js` | Advanced |
| 4.7 | **Webhooks for claim status**: When a claim is validated on-chain, 1Shot webhook notifies the backend → updates frontend in real-time | `zkpull-zktls-main/services/1shot.service.js` | Medium |
| 4.8 | **1ShotPay integration for bounty payments**: Devs can pay for premium features (priority validation, analytics) via 1ShotPay | `web-main/src/lib/hooks/use-1shotpay.tsx` | Advanced |

### Concrete Use in zkPull
- **Server wallet**: The zkPull platform maintains a server wallet on Mantle Sepolia for gas payments, platform fee collection
- **Automated validation**: When the AVS operator validates a claim, it uses 1Shot API's `executeAsDelegator` to call `validateClaim()` — delegating from the bounty owner's stored delegation
- **Batch payouts**: If 3 devs claim the same bounty, 1Shot API can batch all 3 reward transfers in a single transaction using `executeBatch`
- **x402 proofs**: Devs pay $0.001 per zkTLS proof generation via x402 — the backend runs an x402 facilitator endpoint

---

## 5️⃣ Venice AI Integration — 0% Done

### What It Is
Venice AI is an **OpenAI-compatible inference platform** with:
- **Chat completions** — text generation, web search, reasoning models
- **Image generation** — text-to-image, style presets
- **Audio** — TTS, STT, music generation
- **x402 payment** — pay-as-you-go with USDC wallet (no API key needed)

### How It Maps to zkPull

| # | Task | Description | Priority |
|---|------|-------------|----------|
| 5.1 | **AI-powered issue description generation**: Use Venice chat to auto-generate bounty descriptions from GitHub issue titles | `zkpull-zktls-main/services/venice.service.js` | High |
| 5.2 | **PR review analysis**: After a dev submits a claim, Venice AI analyzes the PR diff and provides a validation score | `zkpull-zktls-main/services/venice.service.js` | High |
| 5.3 | **Venice-powered chat assistant in the dapp**: Users can ask questions about how to create bounties, claim rewards, etc. | `web-main/src/lib/hooks/use-venice-chat.tsx` | High |
| 5.4 | **x402 wallet payment for Venice AI**: Pay for AI features via x402 (USDC on Base) — no API key needed | `web-main/src/lib/hooks/use-venice-x402.tsx` | Medium |
| 5.5 | **Generate bounty preview images**: Use Venice image generation to create visual cards for each bounty | `web-main/src/lib/hooks/use-venice-image.tsx` | Medium |
| 5.6 | **AI agent for bounty suggestions**: Venice suggests relevant bounties to developers based on their GitHub profile and merged PRs | `zkpull-zktls-main/services/venice.service.js` | Medium |
| 5.7 | **Multi-language support**: Auto-translate bounty descriptions using Venice's multilingual models | `zkpull-zktls-main/services/venice.service.js` | Low |
| 5.8 | **Spam detection**: Venice analyzes claim submissions to detect spam/fraudulent PR links before validation | `zkpull-zktls-main/services/venice.service.js` | Low |

### Concrete Use in zkPull
- **AI description generator**: When creating a bounty, auto-generate a detailed description from just the GitHub issue URL
- **PR analysis**: After a dev submits `https://github.com/owner/repo/pull/123`, Venice analyzes the PR diff and gives:
  - Impact score (0-100)
  - Code quality assessment
  - Merge confidence
  - This feeds into the AVS validation as additional data
- **Chat assistant**: Users can click "Ask Venice" on any page to get help with:
  - "How do I create a bounty?"
  - "What happens after I submit a claim?"
  - "Show me all bounties related to Solidity"
- **x402 payments**: Users pay for premium AI features via their USDC wallet — no account needed
- **Bounty preview images**: Each bounty gets an AI-generated preview image based on the project name and description

### Implementation Pattern
```ts
// Backend: PR analysis via Venice
const veniceResponse = await fetch('https://api.venice.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.VENICE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'zai-org-glm-5-1',
    messages: [{
      role: 'user',
      content: `Analyze this GitHub PR for bounty payout eligibility:
PR URL: ${prUrl}
PR Title: ${prTitle}
PR Description: ${prDescription}
Merged: ${isMerged}

Rate the contribution on a scale of 0-100 and explain why.`,
    }],
    response_format: {
      type: 'json_schema',
      json_schema: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          reasoning: { type: 'string' },
          flags: { type: 'array', items: { type: 'string' } },
        },
        required: ['score', 'reasoning'],
      },
    },
  }),
})
```

---

## 📋 Complete Implementation Order (Priority-Based)

### Phase 1: Foundation (Week 1)
```
☐ 1.1  Deploy bundler client for UserOperations
☐ 1.2  Create use-smart-account-operation.ts hook
☐ 1.3  Update use-create-issue.tsx → UserOperations
☐ 1.4  Update use-claim-rewards.tsx → UserOperations
☐ 4.1  Create 1Shot API client setup
☐ 4.2  Create 1Shot server wallet for platform fees
```

### Phase 2: MetaMask Deep Integration (Week 2)
```
☐ 1.5  Add paymaster support (gasless txns)
☐ 1.6  Show smart account status in WalletConnect UI
☐ 1.7  Deploy button for undeployed accounts
☐ 2.1  Create use-advanced-permissions.ts hook
☐ 2.2  Bounty owner permission flow (ERC-7715)
☐ 2.3  Developer permission flow (ERC-7715)
```

### Phase 3: Delegation & Automation (Week 3)
```
☐ 3.1  Create use-delegations.ts hook
☐ 3.2  Delegate reward distribution to AVS operator
☐ 3.3  Delegation scopes UI
☐ 3.4  Disable delegation UI
☐ 4.3  Import IssuesClaim contract methods into 1Shot
☐ 4.4  Replace manual contract calls with 1Shot API
```

### Phase 4: AI Integration (Week 4)
```
☐ 5.1  Venice AI bounty description generation
☐ 5.2  PR review analysis with Venice
☐ 5.3  Venice chat assistant in UI
☐ 5.5  Bounty preview image generation
```

### Phase 5: Advanced Features (Week 5+)
```
☐ 2.4  Permission info UI component
☐ 2.5  Permission revocation UI
☐ 3.5  Redelegation for sub-validators
☐ 4.5  Batch execution for multi-claim payouts
☐ 4.6  x402 facilitator for zkTLS proof generation
☐ 4.7  Webhooks for real-time claim status
☐ 4.8  1ShotPay for premium features
☐ 5.4  x402 wallet payment for Venice AI
☐ 5.6  AI bounty suggestion engine
☐ 5.8  Spam detection with Venice
```

---

## 🔗 Technology Interconnections

```
                    ┌─────────────────────┐
                    │   User's MetaMask    │
                    │     Wallet (EOA)     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Smart Account Kit   │  ← ERC-7702 upgrade
                    │  (EIP-7702 Hybrid)   │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ ERC-7715        │  │ ERC-7710        │  │ UserOperations  │
│ Advanced Perms  │  │ Delegations     │  │ (gasless via    │
│ (User → Dapp)   │  │ (SC → Operator) │  │  paymaster)     │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                   │                    │
         └───────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  1Shot API      │
                    │  (Execution)    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Venice AI      │
                    │  (Analysis +    │
                    │   Generation)   │
                    └─────────────────┘
```

**Flow:**
1. User connects MetaMask → Smart Account auto-created (1️⃣)
2. Creating bounty → ERC-7715 permission for escrow (2️⃣) + UserOp via 1Shot (4️⃣)
3. Claiming reward → Venice AI analyzes PR (5️⃣) → Delegation validates claim (3️⃣) → 1Shot executes payout (4️⃣)
4. AVS operator uses ERC-7710 delegation to auto-validate (3️⃣)
5. All AI features powered by Venice with x402 payments (5️⃣)
