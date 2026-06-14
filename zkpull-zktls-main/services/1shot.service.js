import { OneShotClient } from "@1shotapi/client-sdk";
import config from "../config/env.config.js";

/**
 * 1Shot API Service
 *
 * Provides server wallet management, smart contract interactions,
 * delegation execution, and transaction execution via the 1Shot API.
 *
 * ## Environment Variables Required
 * - ONESHOT_API_KEY — 1Shot API key
 * - ONESHOT_API_SECRET — 1Shot API secret
 * - ONESHOT_BUSINESS_ID — 1Shot business UUID
 * - ONESHOT_WEBHOOK_PUBLIC_KEY — (optional) for webhook verification
 *
 * ## Usage
 * ```js
 * import oneshotService from "./services/1shot.service.js";
 *
 * // Create a server wallet
 * const wallet = await oneshotService.createServerWallet({
 *   name: "Platform Fees",
 *   description: "Collects platform fees from bounties",
 * });
 * console.log("Wallet:", wallet.address);
 *
 * // List wallets
 * const wallets = await oneshotService.listServerWallets();
 * ```
 */
class OneShotService {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  /**
   * Initialize or get the 1Shot API client.
   * Lazily creates the client on first use.
   *
   * @returns {import("@1shotapi/client-sdk").OneShotClient}
   * @throws {Error} If 1Shot API credentials are not configured
   */
  getClient() {
    if (this.client) return this.client;

    if (!config.oneshot.apiKey || !config.oneshot.apiSecret) {
      throw new Error(
        "1Shot API credentials not configured. " +
        "Set ONESHOT_API_KEY and ONESHOT_API_SECRET in your environment."
      );
    }

    this.client = new OneShotClient({
      apiKey: config.oneshot.apiKey,
      apiSecret: config.oneshot.apiSecret,
    });

    this.initialized = true;
    return this.client;
  }

  /**
   * Get the business ID from config.
   *
   * @returns {string}
   * @throws {Error} If business ID is not configured
   */
  getBusinessId() {
    if (!config.oneshot.businessId) {
      throw new Error(
        "1Shot business ID not configured. " +
        "Set ONESHOT_BUSINESS_ID in your environment."
      );
    }
    return config.oneshot.businessId;
  }

  // ──────────────────────────────────────────────
  //  Server Wallets
  // ──────────────────────────────────────────────

  /**
   * Create a new server wallet on Ethereum Sepolia.
   *
   * @param {Object} options
   * @param {string} options.name - Human-readable name for the wallet
   * @param {string} [options.description] - Optional description
   * @returns {Promise<{id: string, address: string, chainId: number, name: string}>}
   */
  async createServerWallet({ name, description = "" }) {
    const client = this.getClient();
    const businessId = this.getBusinessId();

    const wallet = await client.wallets.create(businessId, {
      chainId: 11155111, // Ethereum Sepolia
      name,
      description,
    });

    console.log(`✅ 1Shot server wallet created: ${wallet.address}`);
    return wallet;
  }

  /**
   * List all server wallets, optionally filtered by chain.
   *
   * @param {Object} [options]
   * @param {number} [options.chainId] - Filter by chain ID
   * @returns {Promise<Array>}
   */
  async listServerWallets({ chainId } = {}) {
    const client = this.getClient();
    const businessId = this.getBusinessId();

    const params = { page: 1, pageSize: 50 };
    if (chainId) params.chainId = chainId;

    const { response } = await client.wallets.list(businessId, params);
    return response;
  }

  /**
   * Update a server wallet's metadata.
   *
   * @param {string} walletId - The wallet UUID
   * @param {Object} updates
   * @param {string} [updates.name]
   * @param {string} [updates.description]
   * @returns {Promise<Object>}
   */
  async updateWallet(walletId, { name, description }) {
    const client = this.getClient();

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    return client.wallets.update(walletId, updates);
  }

  /**
   * Find the first server wallet matching the given name, or null.
   *
   * @param {string} name - Wallet name to search for
   * @returns {Promise<Object|null>}
   */
  async findWalletByName(name) {
    const wallets = await this.listServerWallets();
    return wallets.find((w) => w.name === name) || null;
  }

  /**
   * Get or create a platform fee wallet.
   * Reuses an existing wallet named "Platform Fees" if it exists.
   *
   * @returns {Promise<{id: string, address: string, chainId: number}>}
   */
  async getOrCreatePlatformWallet() {
    const existing = await this.findWalletByName("Platform Fees");
    if (existing) {
      console.log(`ℹ️  Reusing existing platform wallet: ${existing.address}`);
      return existing;
    }

    return this.createServerWallet({
      name: "Platform Fees",
      description:
        "Collects platform fees from bounty creation and claim processing on zkPull",
    });
  }

  // ──────────────────────────────────────────────
  //  Supported Chains
  // ──────────────────────────────────────────────

  /**
   * List all EVM chains supported by 1Shot API.
   *
   * @returns {Promise<Array<{chainId: number, name: string, type: string, nativeCurrency: {symbol: string}}>>}
   */
  async listSupportedChains() {
    const client = this.getClient();
    const { response } = await client.chains.list({ page: 1, pageSize: 50 });
    return response;
  }

  /**
   * Get current gas fees for a specific chain.
   *
   * @param {number} chainId - EVM chain ID (default: 11155111 for Sepolia)
   * @returns {Promise<{gasPrice: string|null, maxFeePerGas: string|null, maxPriorityFeePerGas: string|null}>}
   */
  async getGasFees(chainId = 11155111) {
    const client = this.getClient();
    return client.chains.getFees(chainId);
  }

  // ──────────────────────────────────────────────
  //  Smart Contract Methods
  // ──────────────────────────────────────────────

  /**
   * Search the contract methods library for relevant prompts.
   *
   * @param {string} query - Natural language search query
   * @param {number} [chainId=11155111] - Chain ID to search on
   * @returns {Promise<Array>}
   */
  async searchContractMethods(query, chainId = 11155111) {
    const client = this.getClient();
    return client.contractMethods.search(query, { chainId });
  }

  /**
   * Assure (import) contract methods from a prompt for a given contract.
   *
   * @param {string} contractAddress - The contract address
   * @param {string} promptId - The prompt ID from searchContractMethods
   * @param {string} walletId - Server wallet to associate with the methods
   * @param {number} [chainId=11155111] - Chain ID
   * @returns {Promise<Object>}
   */
  async assureContractMethods(contractAddress, promptId, walletId, chainId = 11155111) {
    const client = this.getClient();
    const businessId = this.getBusinessId();

    return client.contractMethods.assureContractMethodsFromPrompt(businessId, {
      chainId,
      contractAddress,
      walletId,
      promptId,
    });
  }

  /**
   * List imported contract methods.
   *
   * @param {Object} [filters]
   * @param {string} [filters.contractAddress]
   * @param {number} [filters.chainId=11155111]
   * @returns {Promise<Array>}
   */
  async listContractMethods({ contractAddress, chainId = 11155111 } = {}) {
    const client = this.getClient();
    const businessId = this.getBusinessId();

    const params = { chainId, page: 1, pageSize: 50 };
    if (contractAddress) params.contractAddress = contractAddress;

    const { response } = await client.contractMethods.list(businessId, params);
    return response;
  }

  /**
   * Read from a smart contract view function via 1Shot API.
   *
   * @param {string} methodId - The contract method ID
   * @param {Object} args - Input arguments matching the method's inputs
   * @returns {Promise<Object>}
   */
  async readContractMethod(methodId, args = {}) {
    const client = this.getClient();
    return client.contractMethods.read(methodId, args);
  }

  /**
   * Simulate a write function to check if it would succeed.
   *
   * @param {string} methodId - The contract method ID
   * @param {Object} args - Input arguments
   * @param {Object} [options]
   * @param {string} [options.value] - ETH value to send (wei)
   * @returns {Promise<{success: boolean, data?: any}>}
   */
  async simulateContractMethod(methodId, args = {}, { value = "0" } = {}) {
    const client = this.getClient();
    return client.contractMethods.test(methodId, args, { value });
  }

  // ──────────────────────────────────────────────
  //  Delegations
  // ──────────────────────────────────────────────

  /**
   * Store a delegation in 1Shot API.
   *
   * @param {string} walletId - Server wallet ID
   * @param {Object} options
   * @param {string} options.delegationData - JSON-serialized delegation
   * @param {number} options.startTime - Unix timestamp
   * @param {number} options.endTime - Unix timestamp
   * @param {string[]} [options.contractAddresses] - Relevant contract addresses
   * @param {string[]} [options.methods] - Allowed method signatures
   * @returns {Promise<Object>}
   */
  async createDelegation(walletId, { delegationData, startTime, endTime, contractAddresses = [], methods = [] }) {
    const client = this.getClient();

    return client.wallets.createDelegation(walletId, {
      delegationData,
      startTime,
      endTime,
      contractAddresses,
      methods,
    });
  }

  /**
   * List stored delegations for a wallet.
   *
   * @param {string} walletId - Server wallet ID
   * @returns {Promise<Array>}
   */
  async listDelegations(walletId) {
    const client = this.getClient();

    const { response } = await client.wallets.listDelegations(walletId, {
      page: 1,
      pageSize: 50,
    });

    return response;
  }
}

// Export singleton instance
const oneshotService = new OneShotService();
export default oneshotService;
