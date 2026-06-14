#!/usr/bin/env node

/**
 * zkTLS Operator Bot
 * Entry point - delegates to modular implementation
 */

const { ZKTLSOperatorBot } = require("./operator/operator.controller");

async function main() {
  const bot = new ZKTLSOperatorBot();

  process.on("SIGINT", async () => {
    console.log("\n\n🛑 Received SIGINT, shutting down...");
    await bot.stop();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("\n\n🛑 Received SIGTERM, shutting down...");
    await bot.stop();
    process.exit(0);
  });

  await bot.start();
}

if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { ZKTLSOperatorBot };
