// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script, console2} from "forge-std/Script.sol";
import {IssuesClaim} from "../src/IssuesClaim.sol";
import {MantleUSD} from "../src/avs/MantleUSD.sol";

/**
 * @title DeployScript
 * @notice Deployment script for IssuesClaim contract with mUSD token
 * @dev Run with: forge script script/Deploy.s.sol --rpc-url <RPC_URL> --broadcast
 */
contract DeployScript is Script {
    function run() external returns (IssuesClaim) {
        // Get validator address from environment or use default
        address validator = vm.envOr("VALIDATOR_ADDRESS", address(0x1));
        
        console2.log("Deploying contracts...");
        console2.log("Validator address:", validator);
        
        vm.startBroadcast();
        
        // Deploy mUSD token first
        console2.log("\n1. Deploying MantleUSD token...");
        MantleUSD mUSD = new MantleUSD();
        console2.log("   MantleUSD deployed at:", address(mUSD));
        
        // Deploy IssuesClaim with mUSD
        console2.log("\n2. Deploying IssuesClaim...");
        IssuesClaim issuesClaim = new IssuesClaim(validator, address(mUSD));
        console2.log("   IssuesClaim deployed at:", address(issuesClaim));
        
        vm.stopBroadcast();
        
        console2.log("\nDeployment successful!");
        console2.log("MantleUSD:", address(mUSD));
        console2.log("IssuesClaim:", address(issuesClaim));
        
        return issuesClaim;
    }
}
