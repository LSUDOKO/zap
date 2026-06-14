import express from "express";
import authRoutes from "./auth.routes.js";
import proofRoutes from "./proof.routes.js";
import walletRoutes from "./wallet.routes.js";
import veniceRoutes from "./venice.routes.js";

const router = express.Router();

// Health check endpoint
router.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Server is running",
    version: "1.0.0",
    endpoints: {
      auth: "GET /getAccessToken",
      proof: "GET /generate-proof",
      wallet: {
        platform: "GET /api/wallet/platform",
        list: "GET /api/wallet/list",
        create: "GET /api/wallet/create",
      },
      chains: "GET /api/chains",
      venice: {
        analyzePR: "POST /api/venice/analyze-pr",
        describeBounty: "POST /api/venice/describe-bounty",
        chat: "POST /api/venice/chat",
        models: "GET /api/venice/models",
      },
    }
  });
});

router.use("/", authRoutes);
router.use("/", proofRoutes);
router.use("/api", walletRoutes);
router.use("/", veniceRoutes);

export default router;
