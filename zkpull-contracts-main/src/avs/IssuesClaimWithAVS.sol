// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {FundsManager} from "../contracts/core/FundsManager.sol";
import {IIssuesClaim} from "../contracts/interfaces/IIssuesClaim.sol";
import {IssueValidator} from "../contracts/libraries/IssueValidator.sol";

interface IZKPullAVS {
    function createTask(
        uint256 _issueId,
        uint256 _claimIndex,
        string memory _prLink,
        address _developer
    ) external returns (uint256);
}

/**
 * @title IssuesClaimWithAVS
 * @notice IssuesClaim contract integrated with AVS for automated validation
 */
contract IssuesClaimWithAVS is FundsManager {
    // ============================================
    // State Variables
    // ============================================
    
    address public avsContract;
    bool public avsEnabled;
    
    // ============================================
    // Events
    // ============================================
    
    event AVSTaskCreated(uint256 indexed issueId, uint256 claimIndex, uint256 taskId);
    event AVSEnabled(bool enabled);
    
    // ============================================
    // Constructor
    // ============================================
    
    constructor(address _validator, address _bountyToken, address _avsContract) {
        validator = _validator;
        bountyToken = _bountyToken;
        avsContract = _avsContract;
        avsEnabled = true;
    }
    
    // ============================================
    // Modifiers Override
    // ============================================
    
    /**
     * @notice Override onlyValidator to allow AVS contract
     */
    modifier onlyValidator() override {
        require(
            msg.sender == validator || msg.sender == avsContract,
            "Only validator or AVS"
        );
        _;
    }
    
    // ============================================
    // Override claimReward to integrate with AVS
    // ============================================
    
    /**
     * @notice Claims a reward for a merged PR (with AVS integration)
     */
    function claimReward(
        uint256 _issueId,
        string memory _prLink,
        bool _isMerged,
        string memory _accessToken
    ) external override validIssueId(_issueId) {
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
        
        // Create AVS task for automatic validation
        if (avsEnabled && avsContract != address(0)) {
            uint256 taskId = IZKPullAVS(avsContract).createTask(
                _issueId,
                claimIndex,
                _prLink,
                msg.sender
            );
            
            emit AVSTaskCreated(_issueId, claimIndex, taskId);
        }
    }
    
    // ============================================
    // Admin Functions
    // ============================================
    
    /**
     * @notice Enable/disable AVS integration
     */
    function setAVSEnabled(bool _enabled) external {
        require(msg.sender == validator, "Only validator");
        avsEnabled = _enabled;
        emit AVSEnabled(_enabled);
    }
    
    /**
     * @notice Update AVS contract address
     */
    function updateAVSContract(address _newAVS) external {
        require(msg.sender == validator, "Only validator");
        avsContract = _newAVS;
    }
}
