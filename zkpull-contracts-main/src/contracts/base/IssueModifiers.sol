// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IssueStorage} from "./IssueStorage.sol";
import {IssueErrors} from "../libraries/IssueErrors.sol";

/**
 * @title IssueModifiers
 * @notice Modifiers for IssuesClaim contract
 */
abstract contract IssueModifiers is IssueStorage {
    // ============================================
    // Modifiers
    // ============================================
    
    modifier onlyValidator() virtual {
        if (msg.sender != validator) revert IssueErrors.OnlyValidator();
        _;
    }

    modifier validIssueId(uint256 _issueId) {
        if (_issueId >= issueCount) revert IssueErrors.InvalidIssueId();
        _;
    }

    modifier validClaimIndex(uint256 _issueId, uint256 _claimIndex) {
        if (_claimIndex >= claimCounts[_issueId]) revert IssueErrors.InvalidClaimIndex();
        _;
    }
}
