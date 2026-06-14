// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console2} from "forge-std/Test.sol";
import {IssuesClaim} from "../../src/IssuesClaim.sol";
import {IIssuesClaim} from "../../src/contracts/interfaces/IIssuesClaim.sol";

/**
 * @title FullWorkflowTest
 * @notice Integration tests for complete workflows
 */
contract FullWorkflowTest is Test {
    IssuesClaim public issuesClaim;
    
    address public validator = address(0x1);
    address public projectOwner = address(0x2);
    address[] public developers;

    function setUp() public {
        issuesClaim = new IssuesClaim(validator);
        
        vm.deal(projectOwner, 100 ether);
        
        // Create 5 developers
        for (uint256 i = 0; i < 5; i++) {
            address dev = address(uint160(100 + i));
            developers.push(dev);
            vm.deal(dev, 1 ether);
        }
    }

    function test_CompleteWorkflow_AllClaimsValidated() public {
        // 1. Create issue
        uint256 bountyAmount = 5 ether;
        uint256 maxClaims = 5;
        
        vm.prank(projectOwner);
        issuesClaim.createIssue{value: bountyAmount}(
            "zkpull-123",
            bountyAmount,
            "zkPull",
            "Implement zkTLS verification",
            "https://github.com/zkpull/contracts",
            block.timestamp + 30 days,
            maxClaims
        );
        
        // 2. Developers submit claims
        for (uint256 i = 0; i < developers.length; i++) {
            string memory prLink = string(
                abi.encodePacked("https://github.com/zkpull/contracts/pull/", vm.toString(i + 1))
            );
            
            vm.prank(developers[i]);
            issuesClaim.claimReward(0, prLink, true);
        }
        
        assertEq(issuesClaim.claimCounts(0), 5);
        
        // 3. Validator validates all claims
        uint256 expectedReward = bountyAmount / maxClaims;
        
        vm.startPrank(validator);
        for (uint256 i = 0; i < developers.length; i++) {
            uint256 balanceBefore = developers[i].balance;
            
            issuesClaim.validateClaim(0, i, true);
            
            assertEq(developers[i].balance, balanceBefore + expectedReward);
        }
        vm.stopPrank();
        
        // 4. Verify issue state
        IIssuesClaim.Issue memory issue = issuesClaim.getIssueDetails(0);
        assertEq(issue.currentClaims, 5);
        
        // 5. Try to withdraw (should get 0 since all claims validated)
        vm.warp(block.timestamp + 31 days);
        
        uint256 ownerBalanceBefore = projectOwner.balance;
        
        vm.prank(projectOwner);
        issuesClaim.withdrawRemainingFunds(0);
        
        assertEq(projectOwner.balance, ownerBalanceBefore);
    }

    function test_CompleteWorkflow_PartialClaims() public {
        // 1. Create issue with max 5 claims
        uint256 bountyAmount = 5 ether;
        uint256 maxClaims = 5;
        
        vm.prank(projectOwner);
        issuesClaim.createIssue{value: bountyAmount}(
            "zkpull-456",
            bountyAmount,
            "zkPull",
            "Add multi-sig support",
            "https://github.com/zkpull/contracts",
            block.timestamp + 30 days,
            maxClaims
        );
        
        // 2. Only 2 developers submit claims
        for (uint256 i = 0; i < 2; i++) {
            string memory prLink = string(
                abi.encodePacked("https://github.com/zkpull/contracts/pull/", vm.toString(i + 10))
            );
            
            vm.prank(developers[i]);
            issuesClaim.claimReward(0, prLink, true);
        }
        
        // 3. Validator validates both claims
        uint256 expectedReward = bountyAmount / maxClaims;
        
        vm.startPrank(validator);
        issuesClaim.validateClaim(0, 0, true);
        issuesClaim.validateClaim(0, 1, true);
        vm.stopPrank();
        
        // 4. Move past deadline
        vm.warp(block.timestamp + 31 days);
        
        // 5. Owner withdraws remaining funds
        uint256 ownerBalanceBefore = projectOwner.balance;
        uint256 expectedRefund = (bountyAmount / maxClaims) * 3; // 3 unclaimed
        
        vm.prank(projectOwner);
        issuesClaim.withdrawRemainingFunds(0);
        
        assertEq(projectOwner.balance, ownerBalanceBefore + expectedRefund);
        
        IIssuesClaim.Issue memory issue = issuesClaim.getIssueDetails(0);
        assertFalse(issue.isOpen);
    }

    function test_CompleteWorkflow_SomeClaimsRejected() public {
        // 1. Create issue
        vm.prank(projectOwner);
        issuesClaim.createIssue{value: 3 ether}(
            "zkpull-789",
            3 ether,
            "zkPull",
            "Fix security vulnerability",
            "https://github.com/zkpull/contracts",
            block.timestamp + 30 days,
            3
        );
        
        // 2. Three developers submit claims
        for (uint256 i = 0; i < 3; i++) {
            string memory prLink = string(
                abi.encodePacked("https://github.com/zkpull/contracts/pull/", vm.toString(i + 20))
            );
            
            vm.prank(developers[i]);
            issuesClaim.claimReward(0, prLink, true);
        }
        
        // 3. Validator approves 2, rejects 1
        vm.startPrank(validator);
        issuesClaim.validateClaim(0, 0, true); // Approve
        issuesClaim.validateClaim(0, 1, false); // Reject
        issuesClaim.validateClaim(0, 2, true); // Approve
        vm.stopPrank();
        
        // 4. Check balances
        assertEq(developers[0].balance, 1 ether + 1 ether); // Got reward
        assertEq(developers[1].balance, 1 ether); // No reward
        assertEq(developers[2].balance, 1 ether + 1 ether); // Got reward
        
        // 5. Issue should still have 1 unclaimed slot
        IIssuesClaim.Issue memory issue = issuesClaim.getIssueDetails(0);
        assertEq(issue.currentClaims, 2);
        
        // 6. Another developer can claim
        string memory newPrLink = "https://github.com/zkpull/contracts/pull/99";
        
        vm.prank(developers[3]);
        issuesClaim.claimReward(0, newPrLink, true);
        
        vm.prank(validator);
        issuesClaim.validateClaim(0, 3, true);
        
        assertEq(developers[3].balance, 1 ether + 1 ether);
    }
}
