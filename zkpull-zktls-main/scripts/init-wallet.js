#!/usr/bin/env node

/**
 * 1Shot Server Wallet Initialization Script
 *
 * Creates or retrieves the zkPull platform fee wallet on Ethereum Sepolia.
 * Run this once during initial setup or after deploying new contracts.
 *
 * Usage:
 *   node scripts/init-wallet.js
 *
 * Environment Variables Required:
 *   ONESHOT_API_KEY, ONESHOT_API_SECRET, ONESHOT_BUSINESS_ID
 *
 * The wallet is used for:
 *   - Collecting platform fees from bounty creation
 *   - Delegating reward execution to the AVS operator
 *   - Managing contract method imports in 1Shot API
 */

import oneshotService from "../services/1shot.service.js";

async function main() {
  console.log("🚀 Initializing 1Shot Server Wallet...\n");

  // 1. Verify 1Shot API connection by listing supported chains
  console.log("📡 Checking 1Shot API connection...");
  try {
    const chains = await oneshotService.listSupportedChains();
    const sepolia = chains.find((c) => c.chainId === 11155111);
    if (sepolia) {
      console.log(`   ✅ Connected. Ethereum Sepolia supported: ${sepolia.name}`);
    } else {
      console.log(`   ⚠️  Connected, but Sepolia not found in chain list.`);
    }
  } catch (error) {
    console.error(`   ❌ Failed to connect: ${error.message}`);
    process.exit(1);
  }

  // 2. Get or create the platform fee wallet
  console.log("\n💼 Setting up platform fee wallet...");
  try {
    const wallet = await oneshotService.getOrCreatePlatformWallet();
    console.log(`   ✅ Wallet ready:`);
    console.log(`      ID:      ${wallet.id}`);
    console.log(`      Address: ${wallet.address}`);
    console.log(`      Chain:   ${wallet.chainId} (Ethereum Sepolia)`);
    console.log(`      Name:    ${wallet.name}`);
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
    console.log(`   ℹ️  To create a server wallet, ensure your 1Shot API account has an active subscription.`);
    console.log(`      Visit https://dashboard.1shotapi.com to check your plan.`);
    console.log(`      The routes and controller are ready — it will work once the plan is active.`);
    // Don't exit — other setup steps may still succeed
  }

  // 3. List all wallets for reference
  console.log("\n📋 All server wallets:");
  try {
    const allWallets = await oneshotService.listServerWallets();
    if (allWallets.length === 0) {
      console.log("   (no wallets found)");
    } else {
      for (const w of allWallets) {
        const addr = w.address || "(address pending)";
        console.log(`   - ${w.name} (${addr}) [chain: ${w.chainId}]`);
      }
    }
  } catch (error) {
    console.log(`   ⚠️  Could not list wallets: ${error.message}`);
  }

  console.log("\n✅ Initialization complete!");
  console.log("\n📝 Next steps:");
  console.log("   1. Ensure your 1Shot API account has an active subscription");
  console.log("   2. Run `node scripts/init-wallet.js` again to create the Sepolia wallet");
  console.log("   3. Start the backend: `npm start`");
}

main().catch(console.error);
