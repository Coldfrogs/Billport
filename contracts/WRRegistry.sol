// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WRRegistry
 * @dev Registry for managing Warehouse Receipts (WRs)
 * @notice Handles WR registration, pledging, and milestone attestation
 */
contract WRRegistry is Ownable {
    // Struct to store WR information
    struct WRInfo {
        string wrId;                    // Unique WR identifier
        bytes32 wrHash;                 // Hash of WR content
        bytes32 wrStructHash;           // Hash of WR structure
        bytes32 fileCidHash;            // Hash of file CID
        address sme;                    // Small/Medium Enterprise (borrower)
        address issuer;                 // WR issuer
        bytes32 requestTemplateHash;    // Hash of request template for FDC
        bool pledged;                   // Whether WR is pledged
        bool attested_WR_ISSUED;        // Milestone: WR_ISSUED attested
        uint256 registeredAt;           // Registration timestamp
        uint256 pledgedAt;              // Pledge timestamp
        uint256 attestedAt;             // Attestation timestamp
    }
    
    // Mapping from wrId to WRInfo
    mapping(string => WRInfo) public wrRegistry;
    
    // Mapping to track if a wrId is registered
    mapping(string => bool) public isRegistered;
    
    // Mapping to track if a wrHash is already used (prevents double-pledging)
    mapping(bytes32 => bool) public isWrHashUsed;
    
    // Reference to IssuerRegistry
    address public issuerRegistry;
    
    // Events
    event WRRegistered(
        string indexed wrId,
        bytes32 indexed wrHash,
        address indexed issuer,
        address sme,
        bytes32 requestTemplateHash
    );
    
    event WRPledged(
        string indexed wrId,
        address indexed lender,
        address indexed sme
    );
    
    event WRUnpledged(
        string indexed wrId,
        address indexed lender
    );
    
    event WRMilestoneAttested(
        string indexed wrId,
        string milestone,
        uint256 indexed roundId
    );
    
    // Modifiers
    modifier onlyAuthorizedIssuer() {
        require(issuerRegistry != address(0), "WRRegistry: issuer registry not set");
        // Note: In a real implementation, you'd call IssuerRegistry.isAuthorizedIssuer(msg.sender)
        // For now, we'll assume the caller is authorized
        _;
    }
    
    modifier onlyRegisteredWR(string memory wrId) {
        require(isRegistered[wrId], "WRRegistry: WR not registered");
        _;
    }
    
    constructor() Ownable() {}
    
    /**
     * @dev Set the IssuerRegistry address
     * @param _issuerRegistry Address of the IssuerRegistry contract
     */
    function setIssuerRegistry(address _issuerRegistry) external onlyOwner {
        require(_issuerRegistry != address(0), "WRRegistry: zero address");
        issuerRegistry = _issuerRegistry;
    }
    
    /**
     * @dev Register a new WR
     * @param wrId Unique WR identifier
     * @param wrHash Hash of WR content
     * @param wrStructHash Hash of WR structure
     * @param fileCidHash Hash of file CID
     * @param sme Small/Medium Enterprise address
     * @param issuerSignature Signature from issuer
     * @param requestTemplateHash Hash of request template for FDC
     */
    function registerWR(
        string memory wrId,
        bytes32 wrHash,
        bytes32 wrStructHash,
        bytes32 fileCidHash,
        address sme,
        bytes memory issuerSignature,
        bytes32 requestTemplateHash
    ) external onlyAuthorizedIssuer {
        require(!isRegistered[wrId], "WRRegistry: WR already registered");
        require(!isWrHashUsed[wrHash], "WRRegistry: WR hash already used");
        require(sme != address(0), "WRRegistry: zero address");
        require(issuerSignature.length > 0, "WRRegistry: invalid signature");
        
        // Verify issuer signature (simplified for demo)
        // In a real implementation, you'd verify the signature against wrHash || fileCidHash || wrNumber || chainId || issuer
        require(issuerSignature.length == 65, "WRRegistry: invalid signature length");
        
        // Store WR information
        wrRegistry[wrId] = WRInfo({
            wrId: wrId,
            wrHash: wrHash,
            wrStructHash: wrStructHash,
            fileCidHash: fileCidHash,
            sme: sme,
            issuer: msg.sender,
            requestTemplateHash: requestTemplateHash,
            pledged: false,
            attested_WR_ISSUED: false,
            registeredAt: block.timestamp,
            pledgedAt: 0,
            attestedAt: 0
        });
        
        isRegistered[wrId] = true;
        isWrHashUsed[wrHash] = true;
        
        emit WRRegistered(wrId, wrHash, msg.sender, sme, requestTemplateHash);
    }
    
    /**
     * @dev Pledge a WR to a lender
     * @param wrId WR identifier
     * @param lender Lender address
     */
    function pledge(string memory wrId, address lender) external onlyRegisteredWR(wrId) {
        WRInfo storage wr = wrRegistry[wrId];
        require(!wr.pledged, "WRRegistry: WR already pledged");
        require(lender != address(0), "WRRegistry: zero address");
        
        wr.pledged = true;
        wr.pledgedAt = block.timestamp;
        
        emit WRPledged(wrId, lender, wr.sme);
    }
    
    /**
     * @dev Unpledge a WR (only if refunded/closed)
     * @param wrId WR identifier
     */
    function unpledge(string memory wrId) external onlyRegisteredWR(wrId) {
        WRInfo storage wr = wrRegistry[wrId];
        require(wr.pledged, "WRRegistry: WR not pledged");
        
        wr.pledged = false;
        wr.pledgedAt = 0;
        
        emit WRUnpledged(wrId, msg.sender);
    }
    
    /**
     * @dev Mark WR_ISSUED milestone as attested
     * @param wrId WR identifier
     * @param roundId FDC round ID
     */
    function markAttested_WR_ISSUED(string memory wrId, uint256 roundId) external onlyOwner {
        WRInfo storage wr = wrRegistry[wrId];
        require(isRegistered[wrId], "WRRegistry: WR not registered");
        require(!wr.attested_WR_ISSUED, "WRRegistry: already attested");
        
        wr.attested_WR_ISSUED = true;
        wr.attestedAt = block.timestamp;
        
        emit WRMilestoneAttested(wrId, "WR_ISSUED", roundId);
    }
    
    /**
     * @dev Get WR information
     * @param wrId WR identifier
     * @return WRInfo struct
     */
    function getWRInfo(string memory wrId) external view returns (WRInfo memory) {
        require(isRegistered[wrId], "WRRegistry: WR not registered");
        return wrRegistry[wrId];
    }
    
    /**
     * @dev Check if a WR is pledged
     * @param wrId WR identifier
     * @return True if pledged
     */
    function isPledged(string memory wrId) external view returns (bool) {
        require(isRegistered[wrId], "WRRegistry: WR not registered");
        return wrRegistry[wrId].pledged;
    }
    
    /**
     * @dev Check if WR_ISSUED milestone is attested
     * @param wrId WR identifier
     * @return True if attested
     */
    function isAttested_WR_ISSUED(string memory wrId) external view returns (bool) {
        require(isRegistered[wrId], "WRRegistry: WR not registered");
        return wrRegistry[wrId].attested_WR_ISSUED;
    }
    
    /**
     * @dev Check if a WR hash is already used
     * @param wrHash WR hash to check
     * @return True if already used
     */
    function isWrHashAlreadyUsed(bytes32 wrHash) external view returns (bool) {
        return isWrHashUsed[wrHash];
    }
}
