import reclaimService from "../services/reclaim.service.js";
import githubService from "../services/github.service.js";
import { extractGitHubPRInfo } from "../utils/extractGitHubPRInfo.js";

class ProofController {
  /**
   * Generate proof for GitHub pull request and user
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async generateProof(req, res) {
    try {
      const urlPullRequest = req.query.url;
      const { owner, repo, pull_number } = extractGitHubPRInfo(urlPullRequest);

      const publicOptions = githubService.getPublicOptions();

      const authHeader = req.get("Authorization");
      const token = authHeader?.replace("Bearer ", "");

      const privateOptions = githubService.getPrivateOptions(token);

      const { userUrl, prUrl } = githubService.buildApiUrls(
        owner,
        repo,
        pull_number
      );

      // Generate proofs in parallel
      const [prProof, userProof] = await Promise.all([
        reclaimService
          .generatePRProof(prUrl, publicOptions, privateOptions)
          .catch((error) => {
            console.log("Error generating PR proof:", error.message);
            return null;
          }),
        reclaimService
          .generateUserProof(userUrl, publicOptions, privateOptions)
          .catch((error) => {
            console.log("Error generating User proof:", error.message);
            return null;
          }),
      ]);

      if (!prProof || !userProof) {
        return res.status(500).json({ message: "Failed to generate proof" });
      }

      // Verify proofs
      const isPrProofVerified = await reclaimService.verifyProof(prProof);
      const isUserProofVerified = await reclaimService.verifyProof(userProof);

      if (!isPrProofVerified || !isUserProofVerified) {
        return res
          .status(500)
          .json({ message: "Failed to verify pull request or user proof" });
      }

      // Transform proofs for on-chain use
      const prProofData = reclaimService.transformForOnchain(prProof);
      const userProofData = reclaimService.transformForOnchain(userProof);

      res.status(200).json({ prProofData, userProofData });
    } catch (error) {
      console.error("Error in generateProof:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new ProofController();
