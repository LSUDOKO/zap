#!/usr/bin/env node

/**
 * Register as zkTLS Operator
 * Entry point - delegates to modular implementation
 */

const { RegisterController } = require("./register/register.controller");

async function main() {
  const controller = new RegisterController();
  await controller.execute();
}

if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { RegisterController };
