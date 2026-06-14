// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test} from "forge-std/Test.sol";
import {IssuesClaim} from "../../src/IssuesClaim.sol";
import {IssueErrors} from "../../src/contracts/libraries/IssueErrors.sol";

/**
 * @title IssueValidatorTest
 * @notice Unit tests for validation logic
 */
contract IssueValidatorTest is Test {
    IssuesClaim public issuesClaim;
    
    address public validator = address(0x1);
    address public owner = address(0x2);
    address public dev = address(0x3);

    function setUp() public {
        issuesClaim = new IssuesClaim(validator);
        vm.deal(owner, 10 ether);
        vm.deal(dev, 1 ether);
    }

    function test_ValidateIssueCreation_ZeroBounty() public {
        vm.prank(owner);
        vm.expectRevert(IssueErrors.InvalidBountyAmount.selector);
        issuesClaim.createIssue{value: 0}(
            "project",
            0,
            "name",
            "desc",
            "link",
            block.timestamp + 1 days,
            1
        );
    }

    function test_ValidateIssueCreation_PastDeadline() public {
        vm.prank(owner);
        vm.expectRevert(IssueErrors.InvalidDeadline.selector);
        issuesClaim.createIssue{value: 1 ether}(
            "project",
            1 ether,
            "name",
            "desc",
            "link",
            block.timestamp - 1,
            1
        );
    }

    function test_ValidateIssueCreation_ZeroMaxClaims() public {
        vm.prank(owner);
        vm.expectRevert(IssueErrors.InvalidMaxClaims.selector);
        issuesClaim.createIssue{value: 1 ether}(
            "project",
            1 ether,
            "name",
            "desc",
            "link",
            block.timestamp + 1 days,
            0
        );
    }

    function test_ValidateIssueCreation_IncorrectValue() public {
        vm.prank(owner);
        vm.expectRevert(IssueErrors.IncorrectETHAmount.selector);
        issuesClaim.createIssue{value: 0.5 ether}(
            "project",
            1 ether,
            "name",
            "desc",
            "link",
            block.timestamp + 1 days,
            1
        );
    }
}
