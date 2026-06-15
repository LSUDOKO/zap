import veniceService from "../services/venice.service.js";

/**
 * Venice AI Controller
 *
 * Handles AI-powered requests:
 * - POST /api/venice/analyze-pr  → PR review analysis
 * - POST /api/venice/describe-bounty → Generate bounty description
 * - POST /api/venice/chat → Chat with AI assistant
 * - GET  /api/venice/models → List available models
 */
class VeniceController {
  /**
   * Analyze a GitHub pull request using Venice AI.
   * Returns an impact score, reasoning, and any flags.
   */
  async analyzePR(req, res) {
    try {
      const { prUrl, prTitle, prDescription, isMerged, repoName } = req.body;

      if (!prUrl) {
        return res.status(400).json({ error: "prUrl is required" });
      }

      const result = await veniceService.analyzePR({
        prUrl,
        prTitle: prTitle || "",
        prDescription: prDescription || "",
        isMerged: isMerged || false,
        repoName: repoName || "",
      });

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in analyzePR:", error);
      return res.status(500).json({
        error: error.message,
        score: 50,
        reasoning: "AI analysis failed",
        flags: ["analysis_error"],
      });
    }
  }

  /**
   * Generate a bounty description from GitHub issue details.
   */
  async generateBountyDescription(req, res) {
    try {
      const { issueTitle, issueBody, repoName } = req.body;

      if (!issueTitle) {
        return res.status(400).json({ error: "issueTitle is required" });
      }

      const description = await veniceService.generateBountyDescription({
        issueTitle,
        issueBody: issueBody || "",
        repoName: repoName || "",
      });

      return res.status(200).json({ description });
    } catch (error) {
      console.error("Error in generateBountyDescription:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Chat with the Venice AI assistant.
   */
  async chat(req, res) {
    try {
      const { message, history } = req.body;

      if (!message) {
        return res.status(400).json({ error: "message is required" });
      }

      const response = await veniceService.chat({
        message,
        history: history || [],
      });

      return res.status(200).json({ response });
    } catch (error) {
      console.error("Error in chat:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Generate a preview image for a bounty using Venice AI.
   */
  async generateBountyImage(req, res) {
    try {
      const { projectName, description, repoLink } = req.body;

      if (!projectName) {
        return res.status(400).json({ error: "projectName is required" });
      }

      const result = await veniceService.generateBountyImage({
        projectName,
        description: description || "",
        repoLink: repoLink || "",
      });

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in generateBountyImage:", error);
      return res.status(500).json({
        error: error.message,
        imageBase64: null,
      });
    }
  }

  /**
   * List available Venice AI models.
   */
  async listModels(req, res) {
    try {
      const models = await veniceService.listModels();
      return res.status(200).json({ models });
    } catch (error) {
      console.error("Error listing models:", error);
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new VeniceController();
