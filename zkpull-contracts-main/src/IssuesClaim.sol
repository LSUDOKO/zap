// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {FundsManager} from "./contracts/core/FundsManager.sol";
import {IIssuesClaim} from "./contracts/interfaces/IIssuesClaim.sol";

/**
 * @title IssuesClaim
 * @notice Main contract for managing bounty issues and claims with zkTLS validation
 * @dev Inherits from FundsManager which provides the complete functionality chain
 */
contract IssuesClaim is FundsManager {
    /**
     * @notice Initializes the contract with validator and bounty token addresses
     * @param _validator Address of the zkTLS validator
     * @param _bountyToken Address of the mUSD token for bounties
     */
    constructor(address _validator, address _bountyToken) {
        validator = _validator;
        bountyToken = _bountyToken;
    }
}
