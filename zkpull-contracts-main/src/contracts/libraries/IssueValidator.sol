// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IssueErrors} from "./IssueErrors.sol";
import {IIssuesClaim} from "../interfaces/IIssuesClaim.sol";

/**
 * @title IssueValidator
 * @notice Library for validation logic
 */
library IssueValidator {
    /**
     * @dev Validates issue creation parameters
     */
    function validateIssueCreation(
        uint256 _bountyAmount,
        uint256 _deadline,
        uint256 _maxClaims
    ) internal view {
        if (_bountyAmount == 0) revert IssueErrors.InvalidBountyAmount();
        if (_deadline <= block.timestamp) revert IssueErrors.InvalidDeadline();
        if (_maxClaims == 0) revert IssueErrors.InvalidMaxClaims();
    }

    /**
     * @dev Validates claim submission
     */
    function validateClaimSubmission(
        IIssuesClaim.Issue storage _issue,
        string memory _prLink,
        bool _isMerged,
        bool _isPRUsed
    ) internal view {
        if (_isPRUsed) revert IssueErrors.PRAlreadyUsed();
        if (!_issue.isOpen) revert IssueErrors.IssueClosed();
        if (block.timestamp > _issue.deadline) revert IssueErrors.DeadlinePassed();
        if (!_isMerged) revert IssueErrors.PRNotMerged();
        if (_issue.currentClaims >= _issue.maxClaims) revert IssueErrors.MaximumClaimsReached();
    }

    /**
     * @dev Validates claim validation process
     */
    function validateClaimValidation(
        IIssuesClaim.ProofData storage _proof,
        IIssuesClaim.Issue storage _issue
    ) internal view {
        if (_proof.isValidated) revert IssueErrors.ClaimAlreadyValidated();
        if (!_issue.isOpen) revert IssueErrors.IssueClosed();
        if (_issue.currentClaims >= _issue.maxClaims) revert IssueErrors.MaximumClaimsReached();
    }

    /**
     * @dev Validates withdrawal conditions
     */
    function validateWithdrawal(
        IIssuesClaim.Issue storage _issue,
        address _caller
    ) internal view {
        if (_caller != _issue.owner) revert IssueErrors.OnlyOwner();
        if (_issue.isOpen && block.timestamp <= _issue.deadline) revert IssueErrors.IssueStillActive();
    }
}
