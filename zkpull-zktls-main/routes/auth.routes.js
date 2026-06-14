import express from "express";
import authController from "../controllers/auth.controller.js";

const router = express.Router();

/**
 * @route   GET /getAccessToken
 * @desc    Exchange GitHub authorization code for access token
 * @access  Public
 */
router.get("/getAccessToken", authController.getAccessToken);

export default router;
