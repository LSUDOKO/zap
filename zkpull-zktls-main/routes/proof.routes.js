import express from "express";
import proofController from "../controllers/proof.controller.js";

const router = express.Router();

/**
 * @route   GET /generate-proof
 * @desc    Generate zero-knowledge proof for GitHub PR and user
 * @access  Private (requires Authorization header)
 */
router.get("/generate-proof", proofController.generateProof);

export default router;
