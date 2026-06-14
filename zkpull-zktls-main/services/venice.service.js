import config from "../config/env.config.js";

/**
 * Venice AI Service
 *
 * Provides AI-powered features using Venice AI's OpenAI-compatible API:
 * - PR review analysis (impact score, code quality, merge confidence)
 * - Bounty description generation from GitHub issues
 * - General chat assistant
 */
class VeniceService {
  constructor() {
    this.apiKey = config.venice.apiKey;
    this.baseUrl = "https://api.venice.ai/api/v1";
    this.defaultModel = "venice-uncensored"; // Uncensored model for analysis
    this.reasoningModel = "zai-org-glm-5-1"; // Reasoning model for complex tasks
  }

  /**
   * Internal method to call the Venice AI chat completions endpoint.
   */
  async _chatCompletion({ messages, model, responseFormat, temperature = 0.7 }) {
    try {
      const payload = {
        model: model || this.defaultModel,
        messages,
        temperature,
        venice_parameters: {
          include_venice_system_prompt: false,
        },
      };

      if (responseFormat) {
        payload.response_format = responseFormat;
      }

      const response = await fetch(
        `${this.baseUrl}/chat/completions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(30000),
        }
      );

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Venice API ${response.status}: ${errBody}`);
      }

      return await response.json();
    } catch (error) {
      console.error(
        "Venice API error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.error?.message || "Venice AI request failed"
      );
    }
  }

  /**
   * Analyze a GitHub pull request and return a validation score.
   *
   * @param {Object} params
   * @param {string} params.prUrl - Full PR URL (e.g., "https://github.com/owner/repo/pull/123")
   * @param {string} params.prTitle - PR title
   * @param {string} params.prDescription - PR body/description
   * @param {boolean} params.isMerged - Whether the PR has been merged
   * @param {string} params.repoName - Repository name (e.g., "owner/repo")
   * @returns {Promise<Object>} { score, reasoning, flags, impact }
   */
  async analyzePR({ prUrl, prTitle, prDescription, isMerged, repoName }) {
    const systemPrompt = `You are a code review analyst for a decentralized bounty platform called zkPull. 
Your job is to evaluate GitHub pull requests to determine if they qualify for bounty payouts.

Evaluate the PR based on:
1. **Impact (0-40)**: How significant is this change? Bug fixes, features, and documentation all score differently.
2. **Code Quality (0-30)**: Is the implementation well-structured? Does it follow best practices?
3. **Merge Confidence (0-30)**: How certain are you that this is a legitimate contribution (not spam)?

Return a JSON object with your assessment. Be strict — only flag truly suspicious activity.`;

    const userPrompt = `Analyze this GitHub PR for bounty payout eligibility:

PR URL: ${prUrl}
Repository: ${repoName || "N/A"}
Title: ${prTitle || "N/A"}
Description: ${prDescription || "N/A"}
Merged: ${isMerged ? "Yes" : "No"}

Provide a score from 0-100 and detailed reasoning.`;

    try {
      const data = await this._chatCompletion({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        model: this.reasoningModel,
        temperature: 0.3,
        responseFormat: {
          type: "json_schema",
          json_schema: {
            type: "object",
            properties: {
              score: { type: "number" },
              reasoning: { type: "string" },
              flags: {
                type: "array",
                items: { type: "string" },
              },
              impact: {
                type: "object",
                properties: {
                  impactScore: { type: "number" },
                  qualityScore: { type: "number" },
                  confidenceScore: { type: "number" },
                },
                required: ["impactScore", "qualityScore", "confidenceScore"],
              },
            },
            required: ["score", "reasoning", "flags", "impact"],
          },
        },
      });

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response from Venice AI");
      }

      // Parse JSON from the response
      const parsed = JSON.parse(content);

      return {
        score: Math.min(100, Math.max(0, parsed.score || 50)),
        reasoning: parsed.reasoning || "No reasoning provided",
        flags: Array.isArray(parsed.flags) ? parsed.flags : [],
        impact: parsed.impact || {
          impactScore: parsed.score || 50,
          qualityScore: parsed.score || 50,
          confidenceScore: parsed.score || 50,
        },
        aiVerified: true,
      };
    } catch (error) {
      console.error("PR analysis failed:", error.message);

      // Fallback: return a neutral score
      return {
        score: 50,
        reasoning: `AI analysis unavailable: ${error.message}. Falling back to neutral score.`,
        flags: ["ai_analysis_unavailable"],
        impact: {
          impactScore: 50,
          qualityScore: 50,
          confidenceScore: 50,
        },
        aiVerified: false,
      };
    }
  }

  /**
   * Generate a detailed bounty description from a GitHub issue URL and title.
   *
   * @param {Object} params
   * @param {string} params.issueTitle - GitHub issue title
   * @param {string} params.issueBody - GitHub issue body/description
   * @param {string} params.repoName - Repository name
   * @returns {Promise<string>} Generated bounty description
   */
  async generateBountyDescription({ issueTitle, issueBody, repoName }) {
    const systemPrompt = `You are a bounty description writer for zkPull, a decentralized GitHub bounty platform.
Your task is to create compelling, clear, and concise bounty descriptions.

The description should:
1. Restate the problem from the issue
2. Suggest expected deliverables
3. List acceptance criteria
4. Note any relevant files or areas of the codebase
5. Keep it professional and actionable

Output the description in markdown format.`;

    const userPrompt = `Generate a bounty description for this GitHub issue:

Repository: ${repoName || "N/A"}
Issue Title: ${issueTitle || "N/A"}
Issue Description: ${issueBody || "No description provided"}

Create a comprehensive bounty description that a developer can understand and act on.`;

    try {
      const data = await this._chatCompletion({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.5,
      });

      return (
        data.choices?.[0]?.message?.content ||
        "Failed to generate description."
      );
    } catch (error) {
      console.error("Description generation failed:", error.message);
      return `Bounty for: ${issueTitle}\n\n${issueBody || "See GitHub issue for details."}`;
    }
  }

  /**
   * Chat with Venice AI for the in-app assistant.
   *
   * @param {Object} params
   * @param {string} params.message - User's message
   * @param {Array<Object>} params.history - Previous messages [{ role, content }]
   * @returns {Promise<string>} AI response
   */
  async chat({ message, history = [] }) {
    const systemPrompt = `You are the zkPull AI Assistant, a helpful guide for the zkPull decentralized bounty platform.

zkPull allows:
- Repo owners to create bounties (in mUSD tokens) for GitHub issues
- Developers to claim rewards when their PRs are merged
- Claims are verified via zkTLS proofs (zero-knowledge proofs of GitHub data)
- An AVS (EigenLayer) operator validates claims automatically
- Smart accounts (MetaMask) for gasless transactions
- Delegations (ERC-7710) for automated claim validation

Answer questions about:
- Creating bounties and setting reward amounts
- Claiming rewards and submitting PR proofs
- How zkTLS proofs work
- How the AVS operator validates claims
- Gasless transactions with smart accounts
- Delegating authority to the AVS operator
- Supported chains (Sepolia testnet)
- The difference between permissions (ERC-7715) and delegations (ERC-7710)

Be concise, friendly, and helpful. If you don't know something, say so.`;

    try {
      const data = await this._chatCompletion({
        messages: [
          { role: "system", content: systemPrompt },
          ...history.slice(-10), // Last 10 messages for context
          { role: "user", content: message },
        ],
        temperature: 0.7,
      });

      return (
        data.choices?.[0]?.message?.content ||
        "I'm sorry, I couldn't process that request."
      );
    } catch (error) {
      console.error("Chat failed:", error.message);
      return `I apologize, but I'm having trouble connecting to my AI backend right now. Please try again later. Error: ${error.message}`;
    }
  }

  /**
   * Get the list of available Venice AI models.
   * @returns {Promise<Array>} List of models
   */
  async listModels() {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data?.data || [];
    } catch (error) {
      console.error("Failed to list models:", error.message);
      return [];
    }
  }
}

export default new VeniceService();
