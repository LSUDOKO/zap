import express from "express";
import veniceController from "../controllers/venice.controller.js";

const router = express.Router();

/**
 * @route   POST /api/venice/analyze-pr
 * @desc    Analyze a GitHub PR for bounty eligibility
 * @access  Public
 * @body    { prUrl, prTitle?, prDescription?, isMerged?, repoName? }
 * @returns { score, reasoning, flags, impact, aiVerified }
 */
router.post("/api/venice/analyze-pr", veniceController.analyzePR);

/**
 * @route   POST /api/venice/describe-bounty
 * @desc    Generate a bounty description from a GitHub issue
 * @access  Public
 * @body    { issueTitle, issueBody?, repoName? }
 * @returns { description }
 */
router.post("/api/venice/describe-bounty", veniceController.generateBountyDescription);

/**
 * @route   POST /api/venice/chat
 * @desc    Chat with the Venice AI assistant
 * @access  Public
 * @body    { message, history? }
 * @returns { response }
 */
router.post("/api/venice/chat", veniceController.chat);

/**
 * @route   POST /api/venice/generate-image
 * @desc    Generate a preview image for a bounty using Venice AI
 * @access  Public
 * @body    { projectName, description?, repoLink? }
 * @returns { imageBase64, format, seed, generatedAt }
 */
router.post("/api/venice/generate-image", veniceController.generateBountyImage);

/**
 * @route   GET /api/venice/models
 * @desc    List available Venice AI models
 * @access  Public
 * @returns { models }
 */
router.get("/api/venice/models", veniceController.listModels);

export default router;
