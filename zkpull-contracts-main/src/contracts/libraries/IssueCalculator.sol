// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IIssuesClaim} from "../interfaces/IIssuesClaim.sol";

/**
 * @title IssueCalculator
 * @notice Library for calculation logic
 */
library IssueCalculator {
    /**
     * @dev Calculates reward per claim
     */
    function calculateRewardPerClaim(IIssuesClaim.Issue storage _issue) 
        internal 
        view 
        returns (uint256) 
    {
        return _issue.bountyAmount / _issue.maxClaims;
    }

    /**
     * @dev Calculates remaining funds
     */
    function calculateRemainingFunds(IIssuesClaim.Issue storage _issue) 
        internal 
        view 
        returns (uint256) 
    {
        uint256 remainingClaims = _issue.maxClaims - _issue.currentClaims;
        return (_issue.bountyAmount / _issue.maxClaims) * remainingClaims;
    }
}
