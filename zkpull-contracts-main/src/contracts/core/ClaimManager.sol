// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IssueManager} from "./IssueManager.sol";
import {IIssuesClaim} from "../interfaces/IIssuesClaim.sol";
import {IssueValidator} from "../libraries/IssueValidator.sol";
import {IssueCalculator} from "../libraries/IssueCalculator.sol";
import {IssueErrors} from "../libraries/IssueErrors.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
}

/**
 * @title ClaimManager
 * @notice Manages claim submission and validation
 */
abstract contract ClaimManager is IssueManager {
    // ============================================
    // Claim Management Functions
    // ============================================
    
    /**
     * @notice Claims a reward for a merged PR
     */
    function claimReward(
        uint256 _issueId,
        string memory _prLink,
        bool _isMerged,
        string memory _accessToken
    ) external virtual validIssueId(_issueId) {
        IIssuesClaim.Issue storage issue = issues[_issueId];
        
        IssueValidator.validateClaimSubmission(
            issue,
            _prLink,
            _isMerged,
            usedPRLinks[_prLink]
        );

        uint256 claimIndex = claimCounts[_issueId];

        claims[_issueId][claimIndex] = IIssuesClaim.ProofData({
            prLink: _prLink,
            isMerged: _isMerged,
            developer: msg.sender,
            isValidated: false,
            timestamp: block.timestamp,
            accessToken: _accessToken
        });

        claimCounts[_issueId]++;
        usedPRLinks[_prLink] = true;

        emit RewardClaimed(
            _issueId,
            msg.sender,
            _prLink,
            issue.bountyAmount,
            block.timestamp
        );
    }

    /**
     * @notice Validates a claim and distributes reward if valid
     */
    function validateClaim(
        uint256 _issueId,
        uint256 _claimIndex,
        bool _isValid
    ) 
        external 
        onlyValidator 
        validIssueId(_issueId)
        validClaimIndex(_issueId, _claimIndex)
    {
        IIssuesClaim.ProofData storage proof = claims[_issueId][_claimIndex];
        IIssuesClaim.Issue storage issue = issues[_issueId];

        IssueValidator.validateClaimValidation(proof, issue);

        if (_isValid) {
            proof.isValidated = true;
            issue.currentClaims++;

            uint256 rewardPerClaim = IssueCalculator.calculateRewardPerClaim(issue);
            _transferReward(proof.developer, rewardPerClaim);

            emit ClaimValidated(_issueId, _claimIndex, proof.developer, rewardPerClaim);
        }
    }

    /**
     * @notice Gets claim response details
     */
    function getClaimResponse(uint256 _issueId, uint256 _claimIndex)
        external
        view
        validIssueId(_issueId)
        validClaimIndex(_issueId, _claimIndex)
        returns (IIssuesClaim.Response memory)
    {
        IIssuesClaim.ProofData memory proof = claims[_issueId][_claimIndex];
        IIssuesClaim.Issue memory issue = issues[_issueId];

        return IIssuesClaim.Response({
            issueId: _issueId,
            prLink: proof.prLink,
            bountyAmount: issue.bountyAmount,
            developer: proof.developer,
            isApproved: proof.isMerged,
            isValidated: proof.isValidated,
            timestamp: proof.timestamp
        });
    }

    // ============================================
    // Internal Helper Functions
    // ============================================
    
    /**
     * @dev Transfers reward to recipient (using mUSD tokens)
     */
    function _transferReward(address _recipient, uint256 _amount) internal {
        require(
            IERC20(bountyToken).transfer(_recipient, _amount),
            "Token transfer failed"
        );
    }
}
