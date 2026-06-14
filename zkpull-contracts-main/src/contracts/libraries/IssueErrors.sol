// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IssueErrors
 * @notice Custom errors for the IssuesClaim contract
 */
library IssueErrors {
    error InvalidBountyAmount();
    error InvalidDeadline();
    error InvalidMaxClaims();
    error IncorrectETHAmount();
    error InvalidIssueId();
    error InvalidClaimIndex();
    error PRAlreadyUsed();
    error IssueClosed();
    error DeadlinePassed();
    error PRNotMerged();
    error MaximumClaimsReached();
    error ClaimAlreadyValidated();
    error TransferFailed();
    error OnlyOwner();
    error OnlyValidator();
    error IssueStillActive();
}
