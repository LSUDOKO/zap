import githubService from "../services/github.service.js";

class AuthController {
  /**
   * Get GitHub access token from authorization code
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async getAccessToken(req, res) {
    try {
      console.log(req.query.code);

      const data = await githubService.getAccessToken(req.query.code);

      console.log("/getAccessToken", data);
      res.status(200).json(data);
    } catch (error) {
      console.error("Error in getAccessToken:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new AuthController();
