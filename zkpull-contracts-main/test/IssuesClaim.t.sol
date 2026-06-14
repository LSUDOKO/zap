// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console2} from "forge-std/Test.sol";
import {IssuesClaim} from "../src/IssuesClaim.sol";
import {IIssuesClaim} from "../src/contracts/interfaces/IIssuesClaim.sol";
import {IssueErrors} from "../src/contracts/libraries/IssueErrors.sol";

/**
 * @title IssuesClaimTest
 * @notice Comprehensive test suite for IssuesClaim contract
 */
contract IssuesClaimTest is Test {
    IssuesClaim public issuesClaim;
    
    address public validator = address(0x1);
    address public issueOwner = address(0x2);
    address public developer1 = address(0x3);
    address public developer2 = address(0x4);
    address public developer3 = address(0x5);
    
    uint256 constant BOUNTY_AMOUNT = 1 ether;
    uint256 constant MAX_CLAIMS = 3;
    uint256 constant DEADLINE = 30 days;
    
    string constant GITHUB_PROJECT_ID = "project-123";
    string constant PROJECT_NAME = "Test Project";
    string constant DESCRIPTION = "Fix bug in authentication";
    string constant REPO_LINK = "https://github.com/test/repo";
    string constant PR_LINK_1 = "https://github.com/test/repo/pull/1";
    string constant PR_LINK_2 = "https://github.com/test/repo/pull/2";
    string constant PR_LINK_3 = "https://github.com/test/repo/pull/3";

    // Events for testing
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

    function setUp() public {
        issuesClaim = new IssuesClaim(validator);
        
        // Fund test accounts
        vm.deal(issueOwner, 10 ether);
        vm.deal(developer1, 1 ether);
        vm.deal(developer2, 1 ether);
        vm.deal(developer3, 1 ether);
    }

    // ============================================
    // Constructor Tests
    // ============================================

    function test_Constructor() public view {
        assertEq(issuesClaim.validator(), validator);
        assertEq(issuesClaim.issueCount(), 0);
    }

    // ============================================
    // Create Issue Tests
    // ============================================

    function test_CreateIssue_Success() public {
        vm.startPrank(issueOwner);
        
        uint256 deadline = block.timestamp + DEADLINE;
        
        vm.expectEmit(true, true, false, true);
        emit IssueCreated(0, issueOwner, BOUNTY_AMOUNT, MAX_CLAIMS);
        
        issuesClaim.createIssue{value: BOUNTY_AMOUNT}(
            GITHUB_PROJECT_ID,
            BOUNTY_AMOUNT,
            PROJECT_NAME,
            DESCRIPTION,
            REPO_LINK,
            deadline,
            MAX_CLAIMS
        );
        
        vm.stopPrank();
        
        assertEq(issuesClaim.issueCount(), 1);
        
        IIssuesClaim.Issue memory issue = issuesClaim.getIssueDetails(0);
        assertEq(issue.id, 0);
        assertEq(issue.githubProjectId, GITHUB_PROJECT_ID);
        assertEq(issue.bountyAmount, BOUNTY_AMOUNT);
        assertEq(issue.projectName, PROJECT_NAME);
        assertEq(issue.description, DESCRIPTION);
        assertEq(issue.repoLink, REPO_LINK);
        assertEq(issue.deadline, deadline);
        assertTrue(issue.isOpen);
        assertEq(issue.owner, issueOwner);
        assertEq(issue.maxClaims, MAX_CLAIMS);
        assertEq(issue.currentClaims, 0);
    }

    function test_CreateIssue_RevertWhen_InvalidBountyAmount() public {
        vm.startPrank(issueOwner);
        
        vm.expectRevert(IssueErrors.InvalidBountyAmount.selector);
        issuesClaim.createIssue{value: 0}(
            GITHUB_PROJECT_ID,
            0,
            PROJECT_NAME,
            DESCRIPTION,
            REPO_LINK,
            block.timestamp + DEADLINE,
            MAX_CLAIMS
        );
        
        vm.stopPrank();
    }

    function test_CreateIssue_RevertWhen_InvalidDeadline() public {
        vm.startPrank(issueOwner);
        
        vm.expectRevert(IssueErrors.InvalidDeadline.selector);
        issuesClaim.createIssue{value: BOUNTY_AMOUNT}(
            GITHUB_PROJECT_ID,
            BOUNTY_AMOUNT,
            PROJECT_NAME,
            DESCRIPTION,
            REPO_LINK,
            block.timestamp - 1,
            MAX_CLAIMS
        );
        
        vm.stopPrank();
    }

    function test_CreateIssue_RevertWhen_InvalidMaxClaims() public {
        vm.startPrank(issueOwner);
        
        vm.expectRevert(IssueErrors.InvalidMaxClaims.selector);
        issuesClaim.createIssue{value: BOUNTY_AMOUNT}(
            GITHUB_PROJECT_ID,
            BOUNTY_AMOUNT,
            PROJECT_NAME,
            DESCRIPTION,
            REPO_LINK,
            block.timestamp + DEADLINE,
            0
        );
        
        vm.stopPrank();
    }

    function test_CreateIssue_RevertWhen_IncorrectETHAmount() public {
        vm.startPrank(issueOwner);
        
        vm.expectRevert(IssueErrors.IncorrectETHAmount.selector);
        issuesClaim.createIssue{value: 0.5 ether}(
            GITHUB_PROJECT_ID,
            BOUNTY_AMOUNT,
            PROJECT_NAME,
            DESCRIPTION,
            REPO_LINK,
            block.timestamp + DEADLINE,
            MAX_CLAIMS
        );
        
        vm.stopPrank();
    }

    function test_CreateMultipleIssues() public {
        vm.startPrank(issueOwner);
        
        for (uint256 i = 0; i < 3; i++) {
            issuesClaim.createIssue{value: BOUNTY_AMOUNT}(
                GITHUB_PROJECT_ID,
                BOUNTY_AMOUNT,
                PROJECT_NAME,
                DESCRIPTION,
                REPO_LINK,
                block.timestamp + DEADLINE,
                MAX_CLAIMS
            );
        }
        
        vm.stopPrank();
        
        assertEq(issuesClaim.issueCount(), 3);
    }

    // ============================================
    // Claim Reward Tests
    // ============================================

    function test_ClaimReward_Success() public {
        _createTestIssue();
        
        vm.startPrank(developer1);
        
        vm.expectEmit(true, true, false, false);
        emit RewardClaimed(0, developer1, PR_LINK_1, BOUNTY_AMOUNT, block.timestamp);
        
        issuesClaim.claimReward(0, PR_LINK_1, true);
        
        vm.stopPrank();
        
        assertEq(issuesClaim.claimCounts(0), 1);
        assertTrue(issuesClaim.verifyMergeStatus(PR_LINK_1));
    }

    function test_ClaimReward_MultipleClaims() public {
        _createTestIssue();
        
        // Developer 1 claims
        vm.prank(developer1);
        issuesClaim.claimReward(0, PR_LINK_1, true);
        
        // Developer 2 claims
        vm.prank(developer2);
        issuesClaim.claimReward(0, PR_LINK_2, true);
        
        // Developer 3 claims
        vm.prank(developer3);
        issuesClaim.claimReward(0, PR_LINK_3, true);
        
        assertEq(issuesClaim.claimCounts(0), 3);
    }

    function test_ClaimReward_RevertWhen_PRAlreadyUsed() public {
        _createTestIssue();
        
        vm.prank(developer1);
        issuesClaim.claimReward(0, PR_LINK_1, true);
        
        vm.prank(developer2);
        vm.expectRevert(IssueErrors.PRAlreadyUsed.selector);
        issuesClaim.claimReward(0, PR_LINK_1, true);
    }

    function test_ClaimReward_RevertWhen_PRNotMerged() public {
        _createTestIssue();
        
        vm.prank(developer1);
        vm.expectRevert(IssueErrors.PRNotMerged.selector);
        issuesClaim.claimReward(0, PR_LINK_1, false);
    }

    function test_ClaimReward_RevertWhen_DeadlinePassed() public {
        _createTestIssue();
        
        vm.warp(block.timestamp + DEADLINE + 1);
        
        vm.prank(developer1);
        vm.expectRevert(IssueErrors.DeadlinePassed.selector);
        issuesClaim.claimReward(0, PR_LINK_1, true);
    }

    function test_ClaimReward_RevertWhen_InvalidIssueId() public {
        vm.prank(developer1);
        vm.expectRevert(IssueErrors.InvalidIssueId.selector);
        issuesClaim.claimReward(999, PR_LINK_1, true);
    }

    // ============================================
    // Validate Claim Tests
    // ============================================

    function test_ValidateClaim_Success() public {
        _createTestIssue();
        
        vm.prank(developer1);
        issuesClaim.claimReward(0, PR_LINK_1, true);
        
        uint256 developerBalanceBefore = developer1.balance;
        uint256 expectedReward = BOUNTY_AMOUNT / MAX_CLAIMS;
        
        vm.startPrank(validator);
        
        vm.expectEmit(true, false, true, true);
        emit ClaimValidated(0, 0, developer1, expectedReward);
        
        issuesClaim.validateClaim(0, 0, true);
        
        vm.stopPrank();
        
        assertEq(developer1.balance, developerBalanceBefore + expectedReward);
        
        IIssuesClaim.Issue memory issue = issuesClaim.getIssueDetails(0);
        assertEq(issue.currentClaims, 1);
    }

    function test_ValidateClaim_MultipleValidations() public {
        _createTestIssue();
        
        // Submit 3 claims
        vm.prank(developer1);
        issuesClaim.claimReward(0, PR_LINK_1, true);
        
        vm.prank(developer2);
        issuesClaim.claimReward(0, PR_LINK_2, true);
        
        vm.prank(developer3);
        issuesClaim.claimReward(0, PR_LINK_3, true);
        
        uint256 expectedReward = BOUNTY_AMOUNT / MAX_CLAIMS;
        
        // Validate all claims
        vm.startPrank(validator);
        
        issuesClaim.validateClaim(0, 0, true);
        assertEq(developer1.balance, 1 ether + expectedReward);
        
        issuesClaim.validateClaim(0, 1, true);
        assertEq(developer2.balance, 1 ether + expectedReward);
        
        issuesClaim.validateClaim(0, 2, true);
        assertEq(developer3.balance, 1 ether + expectedReward);
        
        vm.stopPrank();
        
        IIssuesClaim.Issue memory issue = issuesClaim.getIssueDetails(0);
        assertEq(issue.currentClaims, 3);
    }

    function test_ValidateClaim_RejectInvalidClaim() public {
        _createTestIssue();
        
        vm.prank(developer1);
        issuesClaim.claimReward(0, PR_LINK_1, true);
        
        uint256 developerBalanceBefore = developer1.balance;
        
        vm.prank(validator);
        issuesClaim.validateClaim(0, 0, false);
        
        // Balance should not change
        assertEq(developer1.balance, developerBalanceBefore);
        
        IIssuesClaim.Issue memory issue = issuesClaim.getIssueDetails(0);
        assertEq(issue.currentClaims, 0);
    }

    function test_ValidateClaim_RevertWhen_NotValidator() public {
        _createTestIssue();
        
        vm.prank(developer1);
        issuesClaim.claimReward(0, PR_LINK_1, true);
        
        vm.prank(issueOwner);
        vm.expectRevert(IssueErrors.OnlyValidator.selector);
        issuesClaim.validateClaim(0, 0, true);
    }

    function test_ValidateClaim_RevertWhen_ClaimAlreadyValidated() public {
        _createTestIssue();
        
        vm.prank(developer1);
        issuesClaim.claimReward(0, PR_LINK_1, true);
        
        vm.startPrank(validator);
        issuesClaim.validateClaim(0, 0, true);
        
        vm.expectRevert(IssueErrors.ClaimAlreadyValidated.selector);
        issuesClaim.validateClaim(0, 0, true);
        
        vm.stopPrank();
    }

    function test_ValidateClaim_RevertWhen_InvalidClaimIndex() public {
        _createTestIssue();
        
        vm.prank(validator);
        vm.expectRevert(IssueErrors.InvalidClaimIndex.selector);
        issuesClaim.validateClaim(0, 999, true);
    }

    function test_ValidateClaim_RevertWhen_MaximumClaimsReached() public {
        _createTestIssue();
        
        // Submit and validate max claims
        vm.prank(developer1);
        issuesClaim.claimReward(0, PR_LINK_1, true);
        
        vm.prank(developer2);
        issuesClaim.claimReward(0, PR_LINK_2, true);
        
        vm.prank(developer3);
        issuesClaim.claimReward(0, PR_LINK_3, true);
        
        vm.startPrank(validator);
        issuesClaim.validateClaim(0, 0, true);
        issuesClaim.validateClaim(0, 1, true);
        issuesClaim.validateClaim(0, 2, true);
        vm.stopPrank();
        
        // Try to submit another claim
        vm.prank(developer1);
        vm.expectRevert(IssueErrors.MaximumClaimsReached.selector);
        issuesClaim.claimReward(0, "https://github.com/test/repo/pull/4", true);
    }

    // ============================================
    // Withdraw Funds Tests
    // ============================================

    function test_WithdrawRemainingFunds_Success() public {
        _createTestIssue();
        
        // Submit and validate only 1 claim
        vm.prank(developer1);
        issuesClaim.claimReward(0, PR_LINK_1, true);
        
        vm.prank(validator);
        issuesClaim.validateClaim(0, 0, true);
        
        // Move past deadline
        vm.warp(block.timestamp + DEADLINE + 1);
        
        uint256 ownerBalanceBefore = issueOwner.balance;
        uint256 expectedRefund = (BOUNTY_AMOUNT / MAX_CLAIMS) * 2; // 2 unclaimed rewards
        
        vm.startPrank(issueOwner);
        
        vm.expectEmit(true, true, false, true);
        emit FundsWithdrawn(0, issueOwner, expectedRefund);
        
        issuesClaim.withdrawRemainingFunds(0);
        
        vm.stopPrank();
        
        assertEq(issueOwner.balance, ownerBalanceBefore + expectedRefund);
        
        IIssuesClaim.Issue memory issue = issuesClaim.getIssueDetails(0);
        assertFalse(issue.isOpen);
    }

    function test_WithdrawRemainingFunds_AllClaimsValidated() public {
        _createTestIssue();
        
        // Submit and validate all claims
        vm.prank(developer1);
        issuesClaim.claimReward(0, PR_LINK_1, true);
        
        vm.prank(developer2);
        issuesClaim.claimReward(0, PR_LINK_2, true);
        
        vm.prank(developer3);
        issuesClaim.claimReward(0, PR_LINK_3, true);
        
        vm.startPrank(validator);
        issuesClaim.validateClaim(0, 0, true);
        issuesClaim.validateClaim(0, 1, true);
        issuesClaim.validateClaim(0, 2, true);
        vm.stopPrank();
        
        vm.warp(block.timestamp + DEADLINE + 1);
        
        uint256 ownerBalanceBefore = issueOwner.balance;
        
        vm.prank(issueOwner);
        issuesClaim.withdrawRemainingFunds(0);
        
        // No refund since all claims were validated
        assertEq(issueOwner.balance, ownerBalanceBefore);
    }

    function test_WithdrawRemainingFunds_RevertWhen_NotOwner() public {
        _createTestIssue();
        
        vm.warp(block.timestamp + DEADLINE + 1);
        
        vm.prank(developer1);
        vm.expectRevert(IssueErrors.OnlyOwner.selector);
        issuesClaim.withdrawRemainingFunds(0);
    }

    function test_WithdrawRemainingFunds_RevertWhen_IssueStillActive() public {
        _createTestIssue();
        
        vm.prank(issueOwner);
        vm.expectRevert(IssueErrors.IssueStillActive.selector);
        issuesClaim.withdrawRemainingFunds(0);
    }

    // ============================================
    // View Functions Tests
    // ============================================

    function test_GetIssueDetails() public {
        _createTestIssue();
        
        IIssuesClaim.Issue memory issue = issuesClaim.getIssueDetails(0);
        
        assertEq(issue.id, 0);
        assertEq(issue.bountyAmount, BOUNTY_AMOUNT);
        assertEq(issue.owner, issueOwner);
    }

    function test_GetClaimResponse() public {
        _createTestIssue();
        
        vm.prank(developer1);
        issuesClaim.claimReward(0, PR_LINK_1, true);
        
        IIssuesClaim.Response memory response = issuesClaim.getClaimResponse(0, 0);
        
        assertEq(response.issueId, 0);
        assertEq(response.prLink, PR_LINK_1);
        assertEq(response.bountyAmount, BOUNTY_AMOUNT);
        assertEq(response.developer, developer1);
        assertTrue(response.isApproved);
        assertFalse(response.isValidated);
    }

    function test_VerifyMergeStatus() public {
        _createTestIssue();
        
        assertFalse(issuesClaim.verifyMergeStatus(PR_LINK_1));
        
        vm.prank(developer1);
        issuesClaim.claimReward(0, PR_LINK_1, true);
        
        assertTrue(issuesClaim.verifyMergeStatus(PR_LINK_1));
    }

    // ============================================
    // Helper Functions
    // ============================================

    function _createTestIssue() internal {
        vm.prank(issueOwner);
        issuesClaim.createIssue{value: BOUNTY_AMOUNT}(
            GITHUB_PROJECT_ID,
            BOUNTY_AMOUNT,
            PROJECT_NAME,
            DESCRIPTION,
            REPO_LINK,
            block.timestamp + DEADLINE,
            MAX_CLAIMS
        );
    }
}
