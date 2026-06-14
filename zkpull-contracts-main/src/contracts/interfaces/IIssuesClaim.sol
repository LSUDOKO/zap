// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IIssuesClaim
 * @notice Interface for the IssuesClaim contract
 */
interface IIssuesClaim {
    // ============================================
    // Structs
    // ============================================
    
    struct Issue {
        uint256 id;
        string githubProjectId;
        uint256 bountyAmount;
        string projectName;
        string description;
        string repoLink;
        uint256 deadline;
        bool isOpen;
        address owner;
        uint256 maxClaims;
        uint256 currentClaims;
    }

    struct ProofData {
        string prLink;
        bool isMerged;
        address developer;
        bool isValidated;
        uint256 timestamp;
        string accessToken;  // zkTLS access token
    }

    struct Response {
        uint256 issueId;
        string prLink;
        uint256 bountyAmount;
        address developer;
        bool isApproved;
        bool isValidated;
        uint256 timestamp;
    }

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
    // Functions
    // ============================================
    
    function createIssue(
        string memory _githubProjectId,
        uint256 _bountyAmount,
        string memory _projectName,
        string memory _description,
        string memory _repoLink,
        uint256 _deadline,
        uint256 _maxClaims
    ) external payable;

    function claimReward(
        uint256 _issueId,
        string memory _prLink,
        bool _isMerged,
        string memory _accessToken
    ) external;

    function validateClaim(
        uint256 _issueId,
        uint256 _claimIndex,
        bool _isValid
    ) external;

    function withdrawRemainingFunds(uint256 _issueId) external;

    function getIssueDetails(uint256 _issueId) external view returns (Issue memory);

    function getClaimResponse(uint256 _issueId, uint256 _claimIndex) external view returns (Response memory);

    function verifyMergeStatus(string memory _prLink) external view returns (bool);

    function getAllIssues() external view returns (Issue[] memory);
}
