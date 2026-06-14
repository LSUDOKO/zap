// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IIssuesClaim} from "../interfaces/IIssuesClaim.sol";

/**
 * @title IssueStorage
 * @notice Storage layout for IssuesClaim contract
 */
abstract contract IssueStorage {
    // ============================================
    // State Variables
    // ============================================
    
    uint256 public issueCount;
    address public validator;
    address public bountyToken; // mUSD token address

    // ============================================
    // Storage Mappings
    // ============================================
    
    mapping(uint256 => IIssuesClaim.Issue) public issues;
    mapping(uint256 => mapping(uint256 => IIssuesClaim.ProofData)) public claims;
    mapping(uint256 => uint256) public claimCounts;
    mapping(string => bool) public usedPRLinks;

    // ============================================
    // Events
    // ============================================
    
    event IssueCreated(
        uint256 indexed issueId,
        address indexed owner,
        uint256 bountyAmount,
        uint256 maxClaims
    );
    
    event RewardClaimed(
        uint256 indexed issueId,
        address indexed developer,
        string prLink,
        uint256 bountyAmount,
        uint256 timestamp
    );
    
    event ClaimValidated(
        uint256 indexed issueId,
        uint256 claimIndex,
        address indexed developer,
        uint256 rewardAmount
    );
    
    event FundsWithdrawn(
        uint256 indexed issueId,
        address indexed owner,
        uint256 amount
    );

    // ============================================
    // Gap for future storage variables
    // ============================================
    
    uint256[49] private __gap; // Reduced by 1 for bountyToken
}
