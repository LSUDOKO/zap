import express from "express";
import authRoutes from "./auth.routes.js";
import proofRoutes from "./proof.routes.js";
import walletRoutes from "./wallet.routes.js";

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
    }
  });
});

router.use("/", authRoutes);
router.use("/", proofRoutes);
router.use("/api", walletRoutes);

export default router;
