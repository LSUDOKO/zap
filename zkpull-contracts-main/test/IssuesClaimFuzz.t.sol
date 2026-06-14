// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test} from "forge-std/Test.sol";
import {IssuesClaim} from "../src/IssuesClaim.sol";
import {IIssuesClaim} from "../src/contracts/interfaces/IIssuesClaim.sol";

/**
 * @title IssuesClaimFuzzTest
 * @notice Fuzz testing for IssuesClaim contract
 */
contract IssuesClaimFuzzTest is Test {
    IssuesClaim public issuesClaim;
    
    address public validator = address(0x1);
    address public issueOwner = address(0x2);

    function setUp() public {
        issuesClaim = new IssuesClaim(validator);
        vm.deal(issueOwner, 100 ether);
    }

    function testFuzz_CreateIssue(
        uint256 bountyAmount,
        uint256 maxClaims,
        uint256 deadlineOffset
    ) public {
        // Bound inputs to valid ranges
        bountyAmount = bound(bountyAmount, 0.01 ether, 10 ether);
        maxClaims = bound(maxClaims, 1, 100);
        deadlineOffset = bound(deadlineOffset, 1 days, 365 days);
        
        vm.prank(issueOwner);
        issuesClaim.createIssue{value: bountyAmount}(
            "project-id",
            bountyAmount,
            "Project",
            "Description",
            "https://github.com/test/repo",
            block.timestamp + deadlineOffset,
            maxClaims
        );
        
        IIssuesClaim.Issue memory issue = issuesClaim.getIssueDetails(0);
        assertEq(issue.bountyAmount, bountyAmount);
        assertEq(issue.maxClaims, maxClaims);
    }

    function testFuzz_RewardDistribution(uint8 maxClaims) public {
        maxClaims = uint8(bound(maxClaims, 1, 10));
        
        uint256 bountyAmount = 1 ether;
        
        vm.prank(issueOwner);
        issuesClaim.createIssue{value: bountyAmount}(
            "project-id",
            bountyAmount,
            "Project",
            "Description",
            "https://github.com/test/repo",
            block.timestamp + 30 days,
            maxClaims
        );
        
        uint256 expectedRewardPerClaim = bountyAmount / maxClaims;
        
        // Submit and validate claims
        for (uint256 i = 0; i < maxClaims; i++) {
            address dev = address(uint160(1000 + i));
            vm.deal(dev, 1 ether);
            
            string memory prLink = string(abi.encodePacked("https://github.com/test/repo/pull/", vm.toString(i)));
            
            vm.prank(dev);
            issuesClaim.claimReward(0, prLink, true);
            
            uint256 balanceBefore = dev.balance;
            
            vm.prank(validator);
            issuesClaim.validateClaim(0, i, true);
            
            assertEq(dev.balance, balanceBefore + expectedRewardPerClaim);
        }
    }
}
