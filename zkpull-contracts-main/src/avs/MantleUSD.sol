// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MantleUSD
 * @notice Stablecoin token for zkPull AVS staking
 * @dev ERC20 token with minting capability
 */
contract MantleUSD is ERC20, Ownable {
    uint8 private _decimals;
    
    constructor() ERC20("Mantle USD", "mUSD") Ownable(msg.sender) {
        _decimals = 18;
        // Mint initial supply to deployer (1 million mUSD)
        _mint(msg.sender, 1_000_000 * 10**18);
    }
    
    /**
     * @notice Mint new tokens
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @notice Burn tokens
     * @param amount Amount to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    /**
     * @notice Get token decimals
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}
