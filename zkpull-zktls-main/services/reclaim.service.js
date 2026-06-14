import { ReclaimClient } from "@reclaimprotocol/zk-fetch";
import { transformForOnchain, verifyProof } from "@reclaimprotocol/js-sdk";
import config from "../config/env.config.js";

class ReclaimService {
  constructor() {
    this.client = new ReclaimClient(
      config.reclaim.id,
      config.reclaim.secret,
      true
    );
  }

  /**
   * Generate proof for pull request data
   * @param {string} prUrl - Pull request API URL
   * @param {Object} publicOptions - Public request options
   * @param {Object} privateOptions - Private request options with auth
   * @returns {Promise<Object>} PR proof data
   */
  async generatePRProof(prUrl, publicOptions, privateOptions) {
    try {
      const proof = await this.client.zkFetch(
        prUrl,
        { ...publicOptions },
        {
          ...privateOptions,
          responseMatches: [
            {
              type: "regex",
              value: 'merged":(?<merged>true|false)',
            },
            {
              type: "regex",
              value:
                '"user":\\s*{\\s*"login":\\s*"(?<login>[^"]+)",\\s*"id":\\s*(?<id>\\d+),\\s*"node_id":\\s*"(?<node_id>[^"]+)"',
            },
          ],
        }
      );

      return proof;
    } catch (error) {
      console.log(prUrl);
      console.log("Error fetching PR data", error.message);
      throw error;
    }
  }

  /**
   * Generate proof for user data
   * @param {string} userUrl - User API URL
   * @param {Object} publicOptions - Public request options
   * @param {Object} privateOptions - Private request options with auth
   * @returns {Promise<Object>} User proof data
   */
  async generateUserProof(userUrl, publicOptions, privateOptions) {
    try {
      const proof = await this.client.zkFetch(
        userUrl,
        { ...publicOptions },
        {
          ...privateOptions,
          responseMatches: [
            {
              type: "regex",
              value:
                '"login":\\s*"(?<login>[^"]+)",\\s*"id":\\s*(?<id>\\d+),\\s*"node_id":\\s*"(?<node_id>[^"]+)"',
            },
          ],
        }
      );

      return proof;
    } catch (error) {
      console.log(userUrl);
      console.log("Error fetching User data", error.message);
      throw error;
    }
  }

  /**
   * Verify a proof
   * @param {Object} proof - Proof to verify
   * @returns {Promise<boolean>} Verification result
   */
  async verifyProof(proof) {
    return verifyProof(proof);
  }

  /**
   * Transform proof for on-chain use
   * @param {Object} proof - Proof to transform
   * @returns {Object} Transformed proof data
   */
  transformForOnchain(proof) {
    return transformForOnchain(proof);
  }
}

export default new ReclaimService();
