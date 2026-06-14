import express from "express";
import config from "../config/env.config.js";
import {
  getPlatformWallet,
  listWallets,
  createWallet,
  listChains,
} from "../controllers/wallet.controller.js";

const router = express.Router();

/**
 * Simple internal API key check for wallet management endpoints.
 * Protects against unauthorized access to server wallet operations.
 * Uses the ONESHOT_API_SECRET as the shared secret.
 * Send header: X-API-Key: <ONESHOT_API_SECRET>
 */
function internalAuth(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  const expectedKey = config.oneshot.apiSecret;

  // Skip auth if no secret is configured (development mode)
  if (!expectedKey) {
    return next();
  }

  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized. Provide X-API-Key header with your 1Shot API secret.",
    });
  }

  next();
}

/**
 * @route   GET /api/wallet/platform
 * @desc    Get or create the platform fee wallet (Ethereum Sepolia)
 * @access  Internal (requires X-API-Key header)
 */
router.get("/wallet/platform", internalAuth, getPlatformWallet);

/**
 * @route   GET /api/wallet/list
 * @desc    List all server wallets
 * @query   chainId — optional filter by chain ID
 * @access  Internal (requires X-API-Key header)
 */
router.get("/wallet/list", internalAuth, listWallets);

/**
 * @route   POST /api/wallet/create
 * @desc    Create a new server wallet
 * @body    { name: string, description?: string }
 * @access  Internal (requires X-API-Key header)
 */
router.post("/wallet/create", internalAuth, createWallet);

/**
 * @route   GET /api/chains
 * @desc    List supported EVM chains by 1Shot API
 * @access  Public
 */
router.get("/chains", listChains);

export default router;
