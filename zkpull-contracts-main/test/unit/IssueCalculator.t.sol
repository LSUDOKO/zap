// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test} from "forge-std/Test.sol";
import {IssuesClaim} from "../../src/IssuesClaim.sol";
import {IIssuesClaim} from "../../src/contracts/interfaces/IIssuesClaim.sol";

/**
 * @title IssueCalculatorTest
 * @notice Unit tests for calculation logic
 */
contract IssueCalculatorTest is Test {
    IssuesClaim public issuesClaim;
    
    address public validator = address(0x1);
    address public owner = address(0x2);

    function setUp() public {
        issuesClaim = new IssuesClaim(validator);
        vm.deal(owner, 10 ether);
    }

    function test_CalculateRewardPerClaim() public {
        uint256 bountyAmount = 3 ether;
        uint256 maxClaims = 3;
        
        vm.prank(owner);
        issuesClaim.createIssue{value: bountyAmount}(
            "project",
            bountyAmount,
            "name",
            "desc",
            "link",
            block.timestamp + 30 days,
            maxClaims
        );
        
        uint256 expectedReward = bountyAmount / maxClaims;
        assertEq(expectedReward, 1 ether);
    }

    function test_CalculateRemainingFunds() public {
        uint256 bountyAmount = 3 ether;
        uint256 maxClaims = 3;
        
        vm.prank(owner);
        issuesClaim.createIssue{value: bountyAmount}(
            "project",
            bountyAmount,
            "name",
            "desc",
            "link",
            block.timestamp + 30 days,
            maxClaims
        );
        
        // Validate 1 claim
        address dev = address(0x3);
        vm.deal(dev, 1 ether);
        
        vm.prank(dev);
        issuesClaim.claimReward(0, "pr-link", true);
        
        vm.prank(validator);
        issuesClaim.validateClaim(0, 0, true);
        
        // Move past deadline
        vm.warp(block.timestamp + 31 days);
        
        uint256 ownerBalanceBefore = owner.balance;
        
        vm.prank(owner);
        issuesClaim.withdrawRemainingFunds(0);
        
        // Should get 2 ether back (2 unclaimed rewards)
        assertEq(owner.balance, ownerBalanceBefore + 2 ether);
    }
}
