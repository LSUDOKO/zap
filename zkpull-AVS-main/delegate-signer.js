#!/usr/bin/env node

/**
 * ERC-7710 Delegation Signer & Redeemer
 *
 * This script reads a delegation JSON file created by the frontend,
 * signs it using the operator's private key (EIP-712 typed data),
 * and submits it on-chain via the delegation contract.
 *
 * Usage:
 *   node delegate-signer.js <delegation-file.json>
 *
 * The delegation JSON file is exported from the frontend's
 * DelegateToAVSSection component ("Copy Delegation Data" button).
 */

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// ─── Configuration ───────────────────────────────────

const CONFIG = {
  rpcUrl: process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia.publicnode.com",
  privateKey: process.env.OPERATOR_PRIVATE_KEY,
  delegationManager: process.env.DELEGATION_MANAGER_ADDRESS,
  chainId: parseInt(process.env.CHAIN_ID) || 11155111, // Sepolia
};

const DELEGATION_MANAGER_ABI = [
  "function redeemDelegations(((address delegate,address delegator,bytes32 salt,tuple(uint8 type_,bytes data)[] scope,(uint8 type_,uint8 flag,bytes data)[] caveats)[] delegations,bytes[] signatures) memory delegationPayload) returns (bytes32[])",
  "function disableDelegation(bytes32 delegationHash) external",
  "function getDelegation(bytes32 delegationHash) external view returns (tuple(uint8 status, address delegate, address delegator, bytes32 salt))",
];

// ─── EIP-712 Domain ──────────────────────────────────

function getDomain(chainId, delegationManager) {
  return {
    name: "DelegationManager",
    version: "1",
    chainId,
    verifyingContract: delegationManager,
  };
}

const DELEGATION_TYPE = {
  Delegation: [
    { name: "delegate", type: "address" },
    { name: "delegator", type: "address" },
    { name: "salt", type: "bytes32" },
    { name: "scope", type: "DelegationScope[]" },
    { name: "caveats", type: "Caveat[]" },
  ],
  DelegationScope: [
    { name: "type_", type: "uint8" },
    { name: "data", type: "bytes" },
  ],
  Caveat: [
    { name: "type_", type: "uint8" },
    { name: "flag", type: "uint8" },
    { name: "data", type: "bytes" },
  ],
};

// ─── Helpers ─────────────────────────────────────────

/**
 * Parse a delegation JSON file exported from the frontend.
 * The frontend serializes bigints as strings — convert them back.
 */
function parseDelegationFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const delegation = JSON.parse(raw);

  // Normalize field names (frontend uses delegate/delegator, but sometimes to/from)
  return {
    delegate: delegation.delegate || delegation.to,
    delegator: delegation.delegator || delegation.from,
    salt: delegation.salt,
    scope: delegation.scope || [],
    caveats: delegation.caveats || [],
    // Keep original SDK fields if present
    ...delegation,
  };
}

/**
 * Encode a delegation scope for on-chain use.
 */
function encodeScope(scope) {
  if (Array.isArray(scope)) return scope;
  // Single scope object -> wrap in array
  return [scope];
}

/**
 * Encode caveats for on-chain use.
 */
function encodeCaveats(caveats) {
  if (!caveats) return [];
  if (Array.isArray(caveats)) return caveats;
  return [caveats];
}

// ─── Main ────────────────────────────────────────────

async function main() {
  console.log("\n🔐 ERC-7710 Delegation Signer & Redeemer");
  console.log("═══════════════════════════════════════\n");

  // Validate args
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("❌ Usage: node delegate-signer.js <delegation-file.json>");
    console.error("   Get the delegation JSON from the frontend's 'Copy Delegation Data' button.");
    process.exit(1);
  }

  // Validate config
  if (!CONFIG.privateKey) {
    console.error("❌ OPERATOR_PRIVATE_KEY not set in .env");
    process.exit(1);
  }
  if (!CONFIG.delegationManager) {
    console.error("❌ DELEGATION_MANAGER_ADDRESS not set in .env");
    process.exit(1);
  }

  // Resolve file path
  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ File not found: ${resolvedPath}`);
    process.exit(1);
  }

  // Parse delegation
  console.log(`📄 Reading delegation from: ${resolvedPath}`);
  const delegation = parseDelegationFile(resolvedPath);
  console.log(`   Delegate:  ${delegation.delegate}`);
  console.log(`   Delegator: ${delegation.delegator}`);
  console.log(`   Salt:      ${delegation.salt || "(auto)"}`);

  // Connect to provider
  console.log(`\n🔗 Connecting to: ${CONFIG.rpcUrl}`);
  const provider = new ethers.providers.JsonRpcProvider(CONFIG.rpcUrl);
  const wallet = new ethers.Wallet(CONFIG.privateKey, provider);
  console.log(`   Operator:  ${wallet.address}`);

  // Check balance
  const balance = await provider.getBalance(wallet.address);
  const ethBalance = ethers.utils.formatEther(balance);
  console.log(`   Balance:   ${ethBalance} ETH`);

  if (balance.lt(ethers.utils.parseEther("0.01"))) {
    console.error("❌ Insufficient balance for gas. Need at least 0.01 ETH.");
    process.exit(1);
  }

  // Step 1: Sign the delegation using EIP-712
  console.log(`\n✍️  Signing delegation (EIP-712)...`);
  console.log(`   Chain ID:  ${CONFIG.chainId}`);
  console.log(`   Manager:   ${CONFIG.delegationManager}`);

  const domain = getDomain(CONFIG.chainId, CONFIG.delegationManager);

  const scopeArray = encodeScope(delegation.scope);
  const caveatsArray = encodeCaveats(delegation.caveats);

  // Format for EIP-712 signing
  const typedData = {
    domain,
    types: DELEGATION_TYPE,
    primaryType: "Delegation",
    message: {
      delegate: delegation.delegate,
      delegator: delegation.delegator,
      salt: delegation.salt || ethers.constants.HashZero,
      scope: scopeArray.map((s) => ({
        type_: s.type || s.type_ || 0,
        data: s.data || "0x",
      })),
      caveats: caveatsArray.map((c) => ({
        type_: c.type || c.type_ || 0,
        flag: c.flag || 0,
        data: c.data || "0x",
      })),
    },
  };

  const signature = await wallet._signTypedData(
    typedData.domain,
    typedData.types,
    typedData.message
  );

  console.log(`   Signature: ${signature}`);

  // Step 2: Prepare the delegation payload for redeemDelegations
  const delegationStruct = {
    delegate: delegation.delegate,
    delegator: delegation.delegator,
    salt: delegation.salt || ethers.constants.HashZero,
    scope: scopeArray.map((s) => ({
      type_: s.type || s.type_ || 0,
      data: s.data || "0x",
    })),
    caveats: caveatsArray.map((c) => ({
      type_: c.type || c.type_ || 0,
      flag: c.flag || 0,
      data: c.data || "0x",
    })),
  };

  const delegationManager = new ethers.Contract(
    CONFIG.delegationManager,
    DELEGATION_MANAGER_ABI,
    wallet
  );

  // Step 3: Submit the signed delegation on-chain
  console.log(`\n📤 Submitting signed delegation on-chain...`);

  const delegationPayload = {
    delegations: [delegationStruct],
    signatures: [signature],
  };

  try {
    const tx = await delegationManager.redeemDelegations(delegationPayload, {
      gasLimit: 500000,
    });
    console.log(`   Transaction: ${tx.hash}`);
    console.log(`   ⏳ Waiting for confirmation...`);

    const receipt = await tx.wait();
    console.log(`\n✅ Delegation redeemed successfully!`);
    console.log(`   Block:       ${receipt.blockNumber}`);
    console.log(`   Gas used:    ${receipt.gasUsed.toString()}`);
    console.log(`   Tx Hash:     ${receipt.transactionHash}`);

    // Try to get the delegation hash from events
    const delegationHash = receipt.logs?.[0]?.topics?.[1];
    if (delegationHash) {
      console.log(`   Delegation Hash: ${delegationHash}`);
    }

    console.log(`\n📋 Summary:`);
    console.log(`   Operator:   ${wallet.address}`);
    console.log(`   Delegate:   ${delegation.delegate}`);
    console.log(`   Delegator:  ${delegation.delegator}`);
    console.log(`   Status:     ✅ Active on-chain`);

  } catch (error) {
    console.error(`\n❌ Failed to redeem delegation:`, error.message);

    if (error.message.includes("already redeemed") || error.message.includes("DELEGATION_ALREADY_EXISTS")) {
      console.error("   This delegation has already been redeemed on-chain.");
    } else if (error.message.includes("insufficient funds")) {
      console.error("   Operator wallet has insufficient ETH for gas.");
    } else {
      console.error(`   Raw error: ${error}`);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
