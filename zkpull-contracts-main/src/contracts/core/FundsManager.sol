// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ClaimManager} from "./ClaimManager.sol";
import {IIssuesClaim} from "../interfaces/IIssuesClaim.sol";
import {IssueValidator} from "../libraries/IssueValidator.sol";
import {IssueCalculator} from "../libraries/IssueCalculator.sol";

/**
 * @title FundsManager
 * @notice Manages fund withdrawals
 */
abstract contract FundsManager is ClaimManager {
    // ============================================
    // Funds Management Functions
    // ============================================
    
    /**
     * @notice Withdraws remaining funds after issue closure or deadline
     */
    function withdrawRemainingFunds(uint256 _issueId) external validIssueId(_issueId) {
        IIssuesClaim.Issue storage issue = issues[_issueId];

        IssueValidator.validateWithdrawal(issue, msg.sender);

        uint256 remainingFunds = IssueCalculator.calculateRemainingFunds(issue);

        issue.isOpen = false;

        if (remainingFunds > 0) {
            _transferReward(issue.owner, remainingFunds);
            emit FundsWithdrawn(_issueId, issue.owner, remainingFunds);
        }
    }
}
