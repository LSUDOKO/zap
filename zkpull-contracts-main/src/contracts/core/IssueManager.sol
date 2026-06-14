// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IssueModifiers} from "../base/IssueModifiers.sol";
import {IIssuesClaim} from "../interfaces/IIssuesClaim.sol";
import {IssueValidator} from "../libraries/IssueValidator.sol";
import {IssueErrors} from "../libraries/IssueErrors.sol";

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

/**
 * @title IssueManager
 * @notice Manages issue creation and retrieval
 */
abstract contract IssueManager is IssueModifiers {
    // ============================================
    // Issue Management Functions
    // ============================================
    
    /**
     * @notice Creates a new bounty issue (using mUSD tokens)
     */
    function createIssue(
        string memory _githubProjectId,
        uint256 _bountyAmount,
        string memory _projectName,
        string memory _description,
        string memory _repoLink,
        uint256 _deadline,
        uint256 _maxClaims
    ) external {
        IssueValidator.validateIssueCreation(_bountyAmount, _deadline, _maxClaims);

        // Transfer mUSD tokens from owner to contract
        require(
            IERC20(bountyToken).transferFrom(msg.sender, address(this), _bountyAmount),
            "Token transfer failed"
        );

        uint256 newIssueId = issueCount;
        
        issues[newIssueId] = IIssuesClaim.Issue({
            id: newIssueId,
            githubProjectId: _githubProjectId,
            bountyAmount: _bountyAmount,
            projectName: _projectName,
            description: _description,
            repoLink: _repoLink,
            deadline: _deadline,
            isOpen: true,
            owner: msg.sender,
            maxClaims: _maxClaims,
            currentClaims: 0
        });

        issueCount++;

        emit IssueCreated(newIssueId, msg.sender, _bountyAmount, _maxClaims);
    }

    /**
     * @notice Gets issue details
     */
    function getIssueDetails(uint256 _issueId) 
        public 
        view 
        validIssueId(_issueId)
        returns (IIssuesClaim.Issue memory) 
    {
        return issues[_issueId];
    }

    /**
     * @notice Verifies if a PR link has been used
     */
    function verifyMergeStatus(string memory _prLink) external view returns (bool) {
        return usedPRLinks[_prLink];
    }

    /**
     * @notice Gets all issues
     * @return Array of all issues
     */
    function getAllIssues() external view returns (IIssuesClaim.Issue[] memory) {
        IIssuesClaim.Issue[] memory allIssues = new IIssuesClaim.Issue[](issueCount);
        
        for (uint256 i = 0; i < issueCount; i++) {
            allIssues[i] = issues[i];
        }
        
        return allIssues;
    }
}
