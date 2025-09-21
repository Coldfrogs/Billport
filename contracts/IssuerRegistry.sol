// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IssuerRegistry
 * @dev Registry for managing authorized WR (Warehouse Receipt) issuers
 * @notice Only authorized issuers can register WRs in the system
 */
contract IssuerRegistry is Ownable {
    // Mapping to track authorized issuers
    mapping(address => bool) public isIssuer;
    
    // Array to keep track of all issuers for enumeration
    address[] public issuers;
    
    // Mapping to track if an address is in the issuers array (for efficient removal)
    mapping(address => bool) public isInIssuersArray;
    
    // Events
    event IssuerAdded(address indexed issuer, address indexed addedBy);
    event IssuerRemoved(address indexed issuer, address indexed removedBy);
    
    constructor() Ownable() {}
    
    /**
     * @dev Add a new authorized issuer (owner only)
     * @param issuer Address of the issuer to add
     */
    function addIssuer(address issuer) external onlyOwner {
        require(issuer != address(0), "IssuerRegistry: zero address");
        require(!isIssuer[issuer], "IssuerRegistry: already an issuer");
        
        isIssuer[issuer] = true;
        
        // Add to issuers array if not already present
        if (!isInIssuersArray[issuer]) {
            issuers.push(issuer);
            isInIssuersArray[issuer] = true;
        }
        
        emit IssuerAdded(issuer, msg.sender);
    }
    
    /**
     * @dev Remove an authorized issuer (owner only)
     * @param issuer Address of the issuer to remove
     */
    function removeIssuer(address issuer) external onlyOwner {
        require(isIssuer[issuer], "IssuerRegistry: not an issuer");
        
        isIssuer[issuer] = false;
        
        emit IssuerRemoved(issuer, msg.sender);
    }
    
    /**
     * @dev Check if an address is an authorized issuer
     * @param issuer Address to check
     * @return True if the address is an authorized issuer
     */
    function isAuthorizedIssuer(address issuer) external view returns (bool) {
        return isIssuer[issuer];
    }
    
    /**
     * @dev Get the total number of issuers
     * @return Number of issuers in the registry
     */
    function getIssuerCount() external view returns (uint256) {
        return issuers.length;
    }
    
    /**
     * @dev Get all issuer addresses
     * @return Array of all issuer addresses
     */
    function getAllIssuers() external view returns (address[] memory) {
        return issuers;
    }
    
    /**
     * @dev Get issuers with pagination
     * @param offset Starting index
     * @param limit Maximum number of issuers to return
     * @return Array of issuer addresses
     */
    function getIssuers(uint256 offset, uint256 limit) external view returns (address[] memory) {
        uint256 totalIssuers = issuers.length;
        require(offset < totalIssuers, "IssuerRegistry: offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > totalIssuers) {
            end = totalIssuers;
        }
        
        address[] memory result = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = issuers[i];
        }
        
        return result;
    }
}
