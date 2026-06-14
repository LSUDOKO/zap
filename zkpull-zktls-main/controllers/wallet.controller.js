import oneshotService from "../services/1shot.service.js";

/**
 * Wallet Controller
 *
 * Handles 1Shot API server wallet operations:
 * - Create/get platform fee wallet
 * - List all server wallets
 * - Get wallet details
 * - List supported chains
 * - Get gas fees for Sepolia
 */

/**
 * @route   GET /api/wallet/platform
 * @desc    Get or create the platform fee wallet
 * @access  Public (for internal use)
 */
export async function getPlatformWallet(req, res) {
  try {
    const wallet = await oneshotService.getOrCreatePlatformWallet();
    res.json({
      success: true,
      data: {
        id: wallet.id,
        address: wallet.address,
        chainId: wallet.chainId,
        name: wallet.name,
      },
    });
  } catch (error) {
    console.error("❌ Error getting platform wallet:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * @route   GET /api/wallet/list
 * @desc    List all server wallets
 * @access  Public (for internal use)
 */
export async function listWallets(req, res) {
  try {
    const chainId = req.query.chainId ? parseInt(req.query.chainId) : undefined;
    const wallets = await oneshotService.listServerWallets({ chainId });
    res.json({
      success: true,
      data: wallets.map((w) => ({
        id: w.id,
        address: w.address,
        chainId: w.chainId,
        name: w.name,
        description: w.description,
      })),
    });
  } catch (error) {
    console.error("❌ Error listing wallets:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * @route   GET /api/chains
 * @desc    List supported EVM chains
 * @access  Public
 */
export async function listChains(req, res) {
  try {
    const chains = await oneshotService.listSupportedChains();
    res.json({ success: true, data: chains });
  } catch (error) {
    console.error("❌ Error listing chains:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * @route   POST /api/wallet/create
 * @desc    Create a new server wallet
 * @body    { name: string, description?: string }
 * @access  Internal (requires X-API-Key header)
 */
export async function createWallet(req, res) {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: name",
      });
    }

    const wallet = await oneshotService.createServerWallet({
      name,
      description: description || "",
    });

    res.json({
      success: true,
      data: {
        id: wallet.id,
        address: wallet.address,
        chainId: wallet.chainId,
        name: wallet.name,
      },
    });
  } catch (error) {
    console.error("❌ Error creating wallet:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
