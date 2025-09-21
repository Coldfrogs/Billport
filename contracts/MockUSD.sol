// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSD
 * @dev A simple ERC20 token for demo purposes representing USD stablecoin
 * @notice This is a mock token for the proof-of-trade system demo
 */
contract MockUSD is ERC20, Ownable {
    uint8 private constant DECIMALS = 6; // 6 decimals like USDC
    
    constructor() ERC20("Mock USD", "mUSD") Ownable() {
        // Mint 1,000,000 tokens to the owner for demo purposes
        _mint(owner(), 1_000_000 * 10**DECIMALS);
    }
    
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }
    
    /**
     * @dev Mint new tokens (owner only)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens (owner only)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}
