// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {ZKPullAVS} from "../../src/avs/ZKPullAVS.sol";
import {IssuesClaim} from "../../src/IssuesClaim.sol";

/**
 * @title ZKPullAVSTest
 * @notice Comprehensive test suite for ZKPullAVS contract
 */
contract ZKPullAVSTest is Test {
    ZKPullAVS public avs;
    IssuesClaim public issuesClaim;
    
    address public owner = address(0x1);
    address public validator = address(0x2);
    address public operator1 = address(0x3);
    address public operator2 = address(0x4);
    address public operator3 = address(0x5);
    address public developer = address(0x6);
    
    uint256 constant MINIMUM_STAKE = 0.1 ether;
    uint256 constant BOUNTY_AMOUNT = 1 ether;
    
    // Events
    event OperatorRegistered(address indexed operator, string endpoint, uint256 stake);
    event OperatorDeregistered(address indexed operator);
    event TaskCreated(uint256 indexed taskId, uint256 issueId, uint256 claimIndex);
    event TaskAssigned(uint256 indexed taskId, address indexed operator);
    event TaskValidated(uint256 indexed taskId, bool isValid, bytes zkProof);
    event TaskCompleted(uint256 indexed taskId, address indexed operator);

    function setUp() public {
        vm.startPrank(owner);
        
        // Deploy IssuesClaim
        issuesClaim = new IssuesClaim(validator);
        
        // Deploy AVS
        avs = new ZKPullAVS(address(issuesClaim), MINIMUM_STAKE);
        
        vm.stopPrank();
        
        // Fund accounts
        vm.deal(operator1, 10 ether);
        vm.deal(operator2, 10 ether);
        vm.deal(operator3, 10 ether);
        vm.deal(developer, 10 ether);
    }

    // ============================================
    // Constructor Tests
    // ============================================

    function test_Constructor() public view {
        assertEq(avs.owner(), owner);
        assertEq(avs.issuesClaimContract(), address(issuesClaim));
        assertEq(avs.minimumStake(), MINIMUM_STAKE);
        assertEq(avs.operatorCount(), 0);
        assertEq(avs.taskCounter(), 0);
    }

    // ============================================
    // Operator Registration Tests
    // ============================================

    function test_RegisterOperator_Success() public {
        vm.startPrank(operator1);
        
        vm.expectEmit(true, false, false, true);
        emit OperatorRegistered(operator1, "https://operator1.com", MINIMUM_STAKE);
        
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator1.com");
        
        vm.stopPrank();
        
        ZKPullAVS.Operator memory op = avs.getOperator(operator1);
        assertEq(op.operatorAddress, operator1);
        assertEq(op.endpoint, "https://operator1.com");
        assertEq(op.stake, MINIMUM_STAKE);
        assertTrue(op.isActive);
        assertEq(op.tasksCompleted, 0);
        assertEq(op.tasksRejected, 0);
        assertEq(avs.operatorCount(), 1);
    }

    function test_RegisterOperator_RevertWhen_InsufficientStake() public {
        vm.startPrank(operator1);
        
        vm.expectRevert(ZKPullAVS.InsufficientStake.selector);
        avs.registerOperator{value: MINIMUM_STAKE - 1}("https://operator1.com");
        
        vm.stopPrank();
    }

    function test_RegisterOperator_RevertWhen_AlreadyRegistered() public {
        vm.startPrank(operator1);
        
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator1.com");
        
        vm.expectRevert(ZKPullAVS.OperatorAlreadyRegistered.selector);
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator1.com");
        
        vm.stopPrank();
    }

    function test_RegisterMultipleOperators() public {
        // Register operator 1
        vm.prank(operator1);
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator1.com");
        
        // Register operator 2
        vm.prank(operator2);
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator2.com");
        
        // Register operator 3
        vm.prank(operator3);
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator3.com");
        
        assertEq(avs.operatorCount(), 3);
        
        address[] memory activeOps = avs.getActiveOperators();
        assertEq(activeOps.length, 3);
    }

    // ============================================
    // Operator Deregistration Tests
    // ============================================

    function test_DeregisterOperator_Success() public {
        // Register first
        vm.startPrank(operator1);
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator1.com");
        
        uint256 balanceBefore = operator1.balance;
        
        vm.expectEmit(true, false, false, false);
        emit OperatorDeregistered(operator1);
        
        avs.deregisterOperator();
        
        vm.stopPrank();
        
        assertEq(operator1.balance, balanceBefore + MINIMUM_STAKE);
        assertEq(avs.operatorCount(), 0);
        
        ZKPullAVS.Operator memory op = avs.getOperator(operator1);
        assertFalse(op.isActive);
        assertEq(op.stake, 0);
    }

    function test_DeregisterOperator_RevertWhen_NotOperator() public {
        vm.prank(operator1);
        vm.expectRevert(ZKPullAVS.OnlyOperator.selector);
        avs.deregisterOperator();
    }

    // ============================================
    // Stake Management Tests
    // ============================================

    function test_AddStake_Success() public {
        vm.startPrank(operator1);
        
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator1.com");
        
        avs.addStake{value: 0.5 ether}();
        
        vm.stopPrank();
        
        ZKPullAVS.Operator memory op = avs.getOperator(operator1);
        assertEq(op.stake, MINIMUM_STAKE + 0.5 ether);
    }

    function test_UpdateEndpoint_Success() public {
        vm.startPrank(operator1);
        
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator1.com");
        
        avs.updateEndpoint("https://new-operator1.com");
        
        vm.stopPrank();
        
        ZKPullAVS.Operator memory op = avs.getOperator(operator1);
        assertEq(op.endpoint, "https://new-operator1.com");
    }

    // ============================================
    // Task Creation Tests
    // ============================================

    function test_CreateTask_Success() public {
        // Register operator first
        vm.prank(operator1);
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator1.com");
        
        // Create task (only IssuesClaim contract can call)
        vm.startPrank(address(issuesClaim));
        
        vm.expectEmit(true, false, false, true);
        emit TaskCreated(0, 1, 0);
        
        uint256 taskId = avs.createTask(
            1,
            0,
            "https://github.com/user/repo/pull/123",
            developer
        );
        
        vm.stopPrank();
        
        assertEq(taskId, 0);
        assertEq(avs.taskCounter(), 1);
        
        ZKPullAVS.ValidationTask memory task = avs.getTask(0);
        assertEq(task.taskId, 0);
        assertEq(task.issueId, 1);
        assertEq(task.claimIndex, 0);
        assertEq(task.prLink, "https://github.com/user/repo/pull/123");
        assertEq(task.developer, developer);
        assertEq(uint8(task.status), uint8(ZKPullAVS.TaskStatus.Assigned)); // Auto-assigned
        assertEq(task.assignedOperator, operator1);
    }

    function test_CreateTask_RevertWhen_NotIssuesContract() public {
        vm.prank(operator1);
        vm.expectRevert(ZKPullAVS.OnlyIssuesContract.selector);
        avs.createTask(1, 0, "pr-link", developer);
    }

    function test_CreateTask_AutoAssignment() public {
        // Register 3 operators
        vm.prank(operator1);
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator1.com");
        
        vm.prank(operator2);
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator2.com");
        
        vm.prank(operator3);
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator3.com");
        
        // Create 3 tasks - should be distributed round-robin
        vm.startPrank(address(issuesClaim));
        
        uint256 task1 = avs.createTask(1, 0, "pr1", developer);
        uint256 task2 = avs.createTask(1, 1, "pr2", developer);
        uint256 task3 = avs.createTask(1, 2, "pr3", developer);
        
        vm.stopPrank();
        
        // Check assignments
        assertEq(avs.getTask(task1).assignedOperator, operator1);
        assertEq(avs.getTask(task2).assignedOperator, operator2);
        assertEq(avs.getTask(task3).assignedOperator, operator3);
    }

    // ============================================
    // Task Pickup Tests
    // ============================================

    function test_PickTask_Success() public {
        // Register operator
        vm.prank(operator1);
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator1.com");
        
        // Deregister to test manual pickup
        vm.prank(operator1);
        avs.deregisterOperator();
        
        // Re-register
        vm.prank(operator1);
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator1.com");
        
        // Create task without auto-assignment
        vm.prank(address(issuesClaim));
        uint256 taskId = avs.createTask(1, 0, "pr-link", developer);
        
        // Manually pick task
        vm.startPrank(operator1);
        
        vm.expectEmit(true, true, false, false);
        emit TaskAssigned(taskId, operator1);
        
        avs.pickTask(taskId);
        
        vm.stopPrank();
        
        ZKPullAVS.ValidationTask memory task = avs.getTask(taskId);
        assertEq(uint8(task.status), uint8(ZKPullAVS.TaskStatus.Assigned));
        assertEq(task.assignedOperator, operator1);
    }

    // ============================================
    // Validation Submission Tests
    // ============================================

    function test_SubmitValidation_Success_Valid() public {
        // Setup: Register operator and create task
        vm.prank(operator1);
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator1.com");
        
        vm.prank(address(issuesClaim));
        uint256 taskId = avs.createTask(1, 0, "pr-link", developer);
        
        // Submit validation
        bytes memory zkProof = hex"1234567890abcdef";
        
        vm.startPrank(operator1);
        
        vm.expectEmit(true, false, false, true);
        emit TaskValidated(taskId, true, zkProof);
        
        avs.submitValidation(taskId, true, zkProof);
        
        vm.stopPrank();
        
        ZKPullAVS.ValidationTask memory task = avs.getTask(taskId);
        assertEq(uint8(task.status), uint8(ZKPullAVS.TaskStatus.Completed));
        assertEq(task.zkProof, zkProof);
        
        ZKPullAVS.Operator memory op = avs.getOperator(operator1);
        assertEq(op.tasksCompleted, 1);
        assertEq(op.tasksRejected, 0);
    }

    function test_SubmitValidation_Success_Invalid() public {
        // Setup
        vm.prank(operator1);
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator1.com");
        
        vm.prank(address(issuesClaim));
        uint256 taskId = avs.createTask(1, 0, "pr-link", developer);
        
        // Submit rejection
        bytes memory zkProof = hex"deadbeef";
        
        vm.prank(operator1);
        avs.submitValidation(taskId, false, zkProof);
        
        ZKPullAVS.Operator memory op = avs.getOperator(operator1);
        assertEq(op.tasksCompleted, 0);
        assertEq(op.tasksRejected, 1);
    }

    function test_SubmitValidation_RevertWhen_NotAssignedOperator() public {
        // Setup
        vm.prank(operator1);
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator1.com");
        
        vm.prank(operator2);
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator2.com");
        
        vm.prank(address(issuesClaim));
        uint256 taskId = avs.createTask(1, 0, "pr-link", developer);
        
        // Task assigned to operator1, operator2 tries to submit
        vm.prank(operator2);
        vm.expectRevert(ZKPullAVS.TaskNotAssigned.selector);
        avs.submitValidation(taskId, true, hex"12345678");
    }

    // ============================================
    // View Functions Tests
    // ============================================

    function test_GetOperatorTasks() public {
        // Register operator
        vm.prank(operator1);
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator1.com");
        
        // Create multiple tasks
        vm.startPrank(address(issuesClaim));
        avs.createTask(1, 0, "pr1", developer);
        avs.createTask(1, 1, "pr2", developer);
        avs.createTask(1, 2, "pr3", developer);
        vm.stopPrank();
        
        uint256[] memory tasks = avs.getOperatorTasks(operator1);
        assertEq(tasks.length, 3);
        assertEq(tasks[0], 0);
        assertEq(tasks[1], 1);
        assertEq(tasks[2], 2);
    }

    function test_GetTaskForClaim() public {
        vm.prank(operator1);
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator1.com");
        
        vm.prank(address(issuesClaim));
        uint256 taskId = avs.createTask(5, 3, "pr-link", developer);
        
        uint256 retrievedTaskId = avs.getTaskForClaim(5, 3);
        assertEq(retrievedTaskId, taskId);
    }

    function test_GetActiveOperators() public {
        // Register 3 operators
        vm.prank(operator1);
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator1.com");
        
        vm.prank(operator2);
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator2.com");
        
        vm.prank(operator3);
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator3.com");
        
        address[] memory activeOps = avs.getActiveOperators();
        assertEq(activeOps.length, 3);
        
        // Deregister one
        vm.prank(operator2);
        avs.deregisterOperator();
        
        activeOps = avs.getActiveOperators();
        assertEq(activeOps.length, 2);
    }

    // ============================================
    // Admin Functions Tests
    // ============================================

    function test_UpdateMinimumStake() public {
        vm.prank(owner);
        avs.updateMinimumStake(0.5 ether);
        
        assertEq(avs.minimumStake(), 0.5 ether);
    }

    function test_UpdateMinimumStake_RevertWhen_NotOwner() public {
        vm.prank(operator1);
        vm.expectRevert(ZKPullAVS.OnlyOwner.selector);
        avs.updateMinimumStake(0.5 ether);
    }

    function test_UpdateIssuesClaimContract() public {
        address newContract = address(0x999);
        
        vm.prank(owner);
        avs.updateIssuesClaimContract(newContract);
        
        assertEq(avs.issuesClaimContract(), newContract);
    }

    function test_SlashOperator() public {
        // Register operator
        vm.prank(operator1);
        avs.registerOperator{value: 1 ether}("https://operator1.com");
        
        uint256 ownerBalanceBefore = owner.balance;
        uint256 slashAmount = 0.5 ether;
        
        // Slash operator
        vm.prank(owner);
        avs.slashOperator(operator1, slashAmount);
        
        assertEq(owner.balance, ownerBalanceBefore + slashAmount);
        
        ZKPullAVS.Operator memory op = avs.getOperator(operator1);
        assertEq(op.stake, 1 ether - slashAmount);
    }

    function test_SlashOperator_FullStake() public {
        vm.prank(operator1);
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator1.com");
        
        // Try to slash more than stake
        vm.prank(owner);
        avs.slashOperator(operator1, MINIMUM_STAKE + 1 ether);
        
        // Should only slash available stake
        ZKPullAVS.Operator memory op = avs.getOperator(operator1);
        assertEq(op.stake, 0);
    }

    // ============================================
    // Integration Tests
    // ============================================

    function test_CompleteWorkflow() public {
        // 1. Register operator
        vm.prank(operator1);
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator1.com");
        
        // 2. Create task
        vm.prank(address(issuesClaim));
        uint256 taskId = avs.createTask(1, 0, "https://github.com/user/repo/pull/123", developer);
        
        // 3. Verify task is assigned
        ZKPullAVS.ValidationTask memory task = avs.getTask(taskId);
        assertEq(uint8(task.status), uint8(ZKPullAVS.TaskStatus.Assigned));
        assertEq(task.assignedOperator, operator1);
        
        // 4. Submit validation
        bytes memory zkProof = hex"70726f6f66313233"; // "proof123" in hex
        vm.prank(operator1);
        avs.submitValidation(taskId, true, zkProof);
        
        // 5. Verify completion
        task = avs.getTask(taskId);
        assertEq(uint8(task.status), uint8(ZKPullAVS.TaskStatus.Completed));
        
        ZKPullAVS.Operator memory op = avs.getOperator(operator1);
        assertEq(op.tasksCompleted, 1);
    }

    function test_MultipleOperatorsWorkflow() public {
        // Register 3 operators
        vm.prank(operator1);
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator1.com");
        
        vm.prank(operator2);
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator2.com");
        
        vm.prank(operator3);
        avs.registerOperator{value: MINIMUM_STAKE}("https://operator3.com");
        
        // Create 6 tasks - should distribute evenly
        vm.startPrank(address(issuesClaim));
        for (uint256 i = 0; i < 6; i++) {
            avs.createTask(1, i, string(abi.encodePacked("pr", i)), developer);
        }
        vm.stopPrank();
        
        // Each operator should have 2 tasks
        assertEq(avs.getOperatorTasks(operator1).length, 2);
        assertEq(avs.getOperatorTasks(operator2).length, 2);
        assertEq(avs.getOperatorTasks(operator3).length, 2);
        
        // Submit validations
        vm.prank(operator1);
        avs.submitValidation(0, true, hex"70726f6f6631"); // "proof1"
        
        vm.prank(operator2);
        avs.submitValidation(1, true, hex"70726f6f6632"); // "proof2"
        
        vm.prank(operator3);
        avs.submitValidation(2, false, hex"70726f6f6633"); // "proof3"
        
        // Check stats
        assertEq(avs.getOperator(operator1).tasksCompleted, 1);
        assertEq(avs.getOperator(operator2).tasksCompleted, 1);
        assertEq(avs.getOperator(operator3).tasksRejected, 1);
    }
}
