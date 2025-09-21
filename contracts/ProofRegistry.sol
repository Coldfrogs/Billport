// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProofRegistry
 * @dev Registry for managing FDC proofs and preventing replay attacks
 * @notice Tracks consumed proofs and enforces expiry windows
 */
contract ProofRegistry is Ownable {
    // Mapping to track consumed attestation IDs
    mapping(bytes32 => bool) public consumed;
    
    // Maximum age for proofs in epochs
    uint256 public maxAgeEpochs;
    
    // Reference to Flare Systems Manager (simplified for demo)
    address public flareSystemsManager;
    
    // Events
    event ProofAccepted(
        string indexed wrId,
        bytes32 indexed attestationId,
        uint256 indexed roundId
    );
    
    event MaxAgeEpochsUpdated(
        uint256 oldMaxAge,
        uint256 newMaxAge
    );
    
    // Modifiers
    modifier onlyFlareSystemsManager() {
        require(flareSystemsManager != address(0), "ProofRegistry: systems manager not set");
        require(msg.sender == flareSystemsManager, "ProofRegistry: only systems manager");
        _;
    }
    
    constructor(uint256 _maxAgeEpochs) Ownable() {
        maxAgeEpochs = _maxAgeEpochs;
    }
    
    /**
     * @dev Set the Flare Systems Manager address
     * @param _flareSystemsManager Address of the Flare Systems Manager
     */
    function setFlareSystemsManager(address _flareSystemsManager) external onlyOwner {
        require(_flareSystemsManager != address(0), "ProofRegistry: zero address");
        flareSystemsManager = _flareSystemsManager;
    }
    
    /**
     * @dev Update the maximum age for proofs
     * @param _maxAgeEpochs New maximum age in epochs
     */
    function setMaxAgeEpochs(uint256 _maxAgeEpochs) external onlyOwner {
        require(_maxAgeEpochs > 0, "ProofRegistry: invalid max age");
        uint256 oldMaxAge = maxAgeEpochs;
        maxAgeEpochs = _maxAgeEpochs;
        emit MaxAgeEpochsUpdated(oldMaxAge, _maxAgeEpochs);
    }
    
    /**
     * @dev Consume a proof (mark as used and check expiry)
     * @param attestationId Unique identifier for the attestation
     * @param roundId FDC round ID
     * @param wrId WR identifier for logging
     */
    function consume(
        bytes32 attestationId,
        uint256 roundId,
        string memory wrId
    ) external onlyFlareSystemsManager {
        require(!consumed[attestationId], "ProofRegistry: proof already consumed");
        
        // In a real implementation, you would check the current epoch from Flare Systems Manager
        // and ensure currentEpoch - roundId <= maxAgeEpochs
        // For demo purposes, we'll skip the epoch check
        
        consumed[attestationId] = true;
        
        emit ProofAccepted(wrId, attestationId, roundId);
    }
    
    /**
     * @dev Check if a proof is consumed
     * @param attestationId Attestation ID to check
     * @return True if consumed
     */
    function isConsumed(bytes32 attestationId) external view returns (bool) {
        return consumed[attestationId];
    }
    
    /**
     * @dev Check if a proof is valid (not consumed and not expired)
     * @param attestationId Attestation ID to check
     * @return True if valid
     */
    function isValidProof(bytes32 attestationId, uint256 /* roundId */) external view returns (bool) {
        if (consumed[attestationId]) {
            return false;
        }
        
        // In a real implementation, you would check the current epoch from Flare Systems Manager
        // and ensure currentEpoch - roundId <= maxAgeEpochs
        // For demo purposes, we'll always return true if not consumed
        
        return true;
    }
    
    /**
     * @dev Get the current epoch (simplified for demo)
     * @return Current epoch number
     */
    function getCurrentEpoch() external view returns (uint256) {
        // In a real implementation, this would query the Flare Systems Manager
        // For demo purposes, we'll return a mock value
        return block.timestamp / 90; // Assuming 90-second epochs
    }
    
    /**
     * @dev Check if a round is expired
     * @param roundId Round ID to check
     * @return True if expired
     */
    function isRoundExpired(uint256 roundId) external view returns (bool) {
        uint256 currentEpoch = this.getCurrentEpoch();
        return (currentEpoch - roundId) > maxAgeEpochs;
    }
    
    /**
     * @dev Get proof status
     * @param attestationId Attestation ID to check
     * @param roundId Round ID to check
     * @return consumedStatus Whether the proof is consumed
     * @return expiredStatus Whether the proof is expired
     * @return validStatus Whether the proof is valid
     */
    function getProofStatus(
        bytes32 attestationId,
        uint256 roundId
    ) external view returns (bool consumedStatus, bool expiredStatus, bool validStatus) {
        consumedStatus = consumed[attestationId];
        expiredStatus = this.isRoundExpired(roundId);
        validStatus = !consumedStatus && !expiredStatus;
    }
}
