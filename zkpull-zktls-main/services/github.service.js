import config from "../config/env.config.js";

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

class GitHubService {
  /**
   * Exchange authorization code for access token
   * @param {string} code - Authorization code from GitHub OAuth
   * @returns {Promise<Object>} Access token data
   */
  async getAccessToken(code) {
    const params = `?client_id=${config.github.clientId}&client_secret=${config.github.clientSecret}&code=${code}`;

    const response = await fetch(
      "https://github.com/login/oauth/access_token" + params,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      }
    );

    return response.json();
  }

  /**
   * Get public options for GitHub API requests
   * @returns {Object} Request options
   */
  getPublicOptions() {
    return {
      method: "GET",
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
    };
  }

  /**
   * Get private options for authenticated GitHub API requests
   * @param {string} token - GitHub access token
   * @returns {Object} Request options with authentication
   */
  getPrivateOptions(token) {
    return {
      headers: {
        Authorization: `token ${token}`,
      },
    };
  }

  /**
   * Build GitHub API URLs
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} pull_number - Pull request number
   * @returns {Object} API URLs
   */
  buildApiUrls(owner, repo, pull_number) {
    return {
      userUrl: "https://api.github.com/user",
      prUrl: `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}`,
    };
  }
}

export default new GitHubService();
