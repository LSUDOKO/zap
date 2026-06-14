import express from "express";
import authRoutes from "./auth.routes.js";
import proofRoutes from "./proof.routes.js";

const router = express.Router();

// Health check endpoint
router.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Server is running",
    version: "1.0.0",
    endpoints: {
      auth: "GET /getAccessToken",
      proof: "GET /generate-proof"
    }
  });
});

router.use("/", authRoutes);
router.use("/", proofRoutes);

export default router;
