// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {IssuesClaimWithAVS} from "../../src/avs/IssuesClaimWithAVS.sol";
import {ZKPullAVS} from "../../src/avs/ZKPullAVS.sol";

/**
 * @title IssuesClaimWithAVSTest
 * @notice Test IssuesClaim integration with AVS
 */
contract IssuesClaimWithAVSTest is Test {
    IssuesClaimWithAVS public issuesClaim;
    ZKPullAVS public avs;
    
    address public validator = address(0x1);
    address public owner = address(0x2);
    address public operator = address(0x3);
    address public developer = address(0x4);
    
    uint256 constant BOUNTY_AMOUNT = 1 ether;
    uint256 constant MINIMUM_STAKE = 0.1 ether;

    function setUp() public {
        // Deploy contracts
        issuesClaim = new IssuesClaimWithAVS(validator, address(0));
        avs = new ZKPullAVS(address(issuesClaim), MINIMUM_STAKE);
        
        // Update AVS address in IssuesClaim
        vm.prank(validator);
        issuesClaim.updateAVSContract(address(avs));
        
        // Fund accounts
        vm.deal(owner, 10 ether);
        vm.deal(operator, 10 ether);
        vm.deal(developer, 10 ether);
        
        // Register operator
        vm.prank(operator);
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator.com");
    }

    function test_ClaimReward_CreatesAVSTask() public {
        // Create issue
        vm.prank(owner);
        issuesClaim.createIssue{value: BOUNTY_AMOUNT}(
            "project-1",
            BOUNTY_AMOUNT,
            "Test Project",
            "Fix bug",
            "https://github.com/test/repo",
            block.timestamp + 30 days,
            1
        );
        
        // Claim reward - should create AVS task
        vm.prank(developer);
        issuesClaim.claimReward(0, "https://github.com/test/repo/pull/1", true);
        
        // Verify task was created
        uint256 taskId = avs.getTaskForClaim(0, 0);
        ZKPullAVS.ValidationTask memory task = avs.getTask(taskId);
        
        assertEq(task.issueId, 0);
        assertEq(task.claimIndex, 0);
        assertEq(task.prLink, "https://github.com/test/repo/pull/1");
        assertEq(task.developer, developer);
        assertEq(uint8(task.status), uint8(ZKPullAVS.TaskStatus.Assigned));
    }

    function test_CompleteWorkflow_WithAVS() public {
        // 1. Create issue
        vm.prank(owner);
        issuesClaim.createIssue{value: BOUNTY_AMOUNT}(
            "project-1",
            BOUNTY_AMOUNT,
            "Test Project",
            "Fix bug",
            "https://github.com/test/repo",
            block.timestamp + 30 days,
            1
        );
        
        // 2. Developer claims
        vm.prank(developer);
        issuesClaim.claimReward(0, "https://github.com/test/repo/pull/1", true);
        
        // 3. Operator validates via AVS
        uint256 taskId = avs.getTaskForClaim(0, 0);
        
        uint256 developerBalanceBefore = developer.balance;
        
        vm.prank(operator);
        avs.submitValidation(taskId, true, hex"7a6b70726f6f66"); // "zkproof" in hex
        
        // 4. Verify developer received reward
        assertEq(developer.balance, developerBalanceBefore + BOUNTY_AMOUNT);
    }

    function test_AVSEnabled_Toggle() public {
        // Disable AVS
        vm.prank(validator);
        issuesClaim.setAVSEnabled(false);
        
        assertFalse(issuesClaim.avsEnabled());
        
        // Enable AVS
        vm.prank(validator);
        issuesClaim.setAVSEnabled(true);
        
        assertTrue(issuesClaim.avsEnabled());
    }

    function test_ClaimReward_WithAVSDisabled() public {
        // Disable AVS
        vm.prank(validator);
        issuesClaim.setAVSEnabled(false);
        
        // Create issue
        vm.prank(owner);
        issuesClaim.createIssue{value: BOUNTY_AMOUNT}(
            "project-1",
            BOUNTY_AMOUNT,
            "Test Project",
            "Fix bug",
            "https://github.com/test/repo",
            block.timestamp + 30 days,
            1
        );
        
        // Claim reward - should NOT create AVS task
        vm.prank(developer);
        issuesClaim.claimReward(0, "https://github.com/test/repo/pull/1", true);
        
        // Manual validation by validator
        vm.prank(validator);
        issuesClaim.validateClaim(0, 0, true);
        
        // Verify developer received reward
        assertGt(developer.balance, 9 ether);
    }
}
