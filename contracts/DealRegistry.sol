// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DealRegistry
 * @dev Manages trade finance deals and their lifecycle
 * @notice Handles deal creation, funding, and status tracking
 */
contract DealRegistry is Ownable {
    
    // Deal information
    struct Deal {
        string id;                    // Deal ID (e.g., "DEAL-001")
        string wrId;                  // Warehouse Receipt ID
        address issuer;               // Deal issuer
        string location;              // Physical location
        string commodity;             // Commodity type
        uint256 amount;               // Total collateral value
        uint256 requestedFunding;     // Amount of funding requested
        uint256 interestRate;         // Interest rate (basis points, e.g., 850 = 8.5%)
        uint256 duration;             // Duration in days
        address lender;               // Lender address (if funded)
        uint256 fundedAmount;         // Amount actually funded
        DealStatus status;            // Current deal status
        uint256 riskScore;            // Risk score (1-10, scaled by 100)
        uint256 listedDate;           // Timestamp when listed
        uint256 fundedDate;           // Timestamp when funded
        uint256 verifiedDate;         // Timestamp when verified
        uint256 releasedDate;         // Timestamp when released
    }
    
    // Deal status enum
    enum DealStatus {
        Listed,      // Deal is listed and available for funding
        Funded,      // Deal has been funded
        Verified,    // Deal has been verified (WR attested)
        Released,    // Funds have been released to SME
        Cancelled    // Deal has been cancelled
    }
    
    // State variables
    mapping(string => Deal) public deals;
    mapping(address => string[]) public userDeals;
    mapping(address => uint256) public userTotalFunded;
    mapping(address => uint256) public userTotalRequested;
    
    string[] public dealIds;
    uint256 public totalDeals;
    uint256 public totalVolume;
    uint256 public totalFunded;
    
    // Events
    event DealListed(
        string indexed dealId,
        string indexed wrId,
        address indexed issuer,
        uint256 amount,
        uint256 requestedFunding,
        uint256 interestRate
    );
    
    event DealFunded(
        string indexed dealId,
        address indexed lender,
        uint256 fundedAmount
    );
    
    event DealVerified(
        string indexed dealId,
        uint256 verifiedDate
    );
    
    event DealReleased(
        string indexed dealId,
        uint256 releasedAmount
    );
    
    event DealCancelled(
        string indexed dealId,
        address indexed issuer
    );
    
    // Modifiers
    modifier onlyDealIssuer(string memory dealId) {
        require(deals[dealId].issuer == msg.sender, "DealRegistry: only deal issuer");
        _;
    }
    
    modifier dealExists(string memory dealId) {
        require(bytes(deals[dealId].id).length > 0, "DealRegistry: deal does not exist");
        _;
    }
    
    modifier validDealStatus(string memory dealId, DealStatus requiredStatus) {
        require(deals[dealId].status == requiredStatus, "DealRegistry: invalid deal status");
        _;
    }
    
    constructor() Ownable() {}
    
    /**
     * @dev List a new deal
     * @param dealId Unique deal identifier
     * @param wrId Warehouse Receipt ID
     * @param location Physical location
     * @param commodity Commodity type
     * @param amount Total collateral value
     * @param requestedFunding Amount of funding requested
     * @param interestRate Interest rate in basis points
     * @param duration Duration in days
     * @param riskScore Risk score (1-10, scaled by 100)
     */
    function listDeal(
        string memory dealId,
        string memory wrId,
        string memory location,
        string memory commodity,
        uint256 amount,
        uint256 requestedFunding,
        uint256 interestRate,
        uint256 duration,
        uint256 riskScore
    ) external {
        require(bytes(dealId).length > 0, "DealRegistry: deal ID required");
        require(bytes(deals[dealId].id).length == 0, "DealRegistry: deal already exists");
        require(amount > 0, "DealRegistry: amount must be positive");
        require(requestedFunding > 0, "DealRegistry: requested funding must be positive");
        require(requestedFunding <= amount, "DealRegistry: requested funding cannot exceed amount");
        require(interestRate > 0 && interestRate <= 5000, "DealRegistry: invalid interest rate"); // Max 50%
        require(duration > 0, "DealRegistry: duration must be positive");
        require(riskScore >= 100 && riskScore <= 1000, "DealRegistry: risk score must be 1-10"); // Scaled by 100
        
        Deal memory newDeal = Deal({
            id: dealId,
            wrId: wrId,
            issuer: msg.sender,
            location: location,
            commodity: commodity,
            amount: amount,
            requestedFunding: requestedFunding,
            interestRate: interestRate,
            duration: duration,
            lender: address(0),
            fundedAmount: 0,
            status: DealStatus.Listed,
            riskScore: riskScore,
            listedDate: block.timestamp,
            fundedDate: 0,
            verifiedDate: 0,
            releasedDate: 0
        });
        
        deals[dealId] = newDeal;
        userDeals[msg.sender].push(dealId);
        dealIds.push(dealId);
        totalDeals++;
        totalVolume += amount;
        userTotalRequested[msg.sender] += requestedFunding;
        
        emit DealListed(dealId, wrId, msg.sender, amount, requestedFunding, interestRate);
    }
    
    /**
     * @dev Fund a deal
     * @param dealId Deal identifier
     */
    function fundDeal(string memory dealId) 
        external 
        dealExists(dealId)
        validDealStatus(dealId, DealStatus.Listed)
    {
        Deal storage deal = deals[dealId];
        
        deal.lender = msg.sender;
        deal.fundedAmount = deal.requestedFunding;
        deal.status = DealStatus.Funded;
        deal.fundedDate = block.timestamp;
        
        userTotalFunded[msg.sender] += deal.fundedAmount;
        totalFunded += deal.fundedAmount;
        
        emit DealFunded(dealId, msg.sender, deal.fundedAmount);
    }
    
    /**
     * @dev Mark deal as verified
     * @param dealId Deal identifier
     */
    function verifyDeal(string memory dealId) 
        external 
        onlyOwner
        dealExists(dealId)
        validDealStatus(dealId, DealStatus.Funded)
    {
        Deal storage deal = deals[dealId];
        
        deal.status = DealStatus.Verified;
        deal.verifiedDate = block.timestamp;
        
        emit DealVerified(dealId, block.timestamp);
    }
    
    /**
     * @dev Release funds for a deal
     * @param dealId Deal identifier
     */
    function releaseDeal(string memory dealId) 
        external 
        onlyOwner
        dealExists(dealId)
        validDealStatus(dealId, DealStatus.Verified)
    {
        Deal storage deal = deals[dealId];
        
        deal.status = DealStatus.Released;
        deal.releasedDate = block.timestamp;
        
        emit DealReleased(dealId, deal.fundedAmount);
    }
    
    /**
     * @dev Cancel a deal
     * @param dealId Deal identifier
     */
    function cancelDeal(string memory dealId) 
        external 
        onlyDealIssuer(dealId)
        dealExists(dealId)
        validDealStatus(dealId, DealStatus.Listed)
    {
        Deal storage deal = deals[dealId];
        
        deal.status = DealStatus.Cancelled;
        
        // Update totals
        totalVolume -= deal.amount;
        userTotalRequested[deal.issuer] -= deal.requestedFunding;
        
        emit DealCancelled(dealId, msg.sender);
    }
    
    /**
     * @dev Get deal information
     * @param dealId Deal identifier
     * @return Deal struct
     */
    function getDeal(string memory dealId) external view returns (Deal memory) {
        require(bytes(deals[dealId].id).length > 0, "DealRegistry: deal does not exist");
        return deals[dealId];
    }
    
    /**
     * @dev Get all deal IDs
     * @return Array of deal IDs
     */
    function getAllDealIds() external view returns (string[] memory) {
        return dealIds;
    }
    
    /**
     * @dev Get user's deals
     * @param user User address
     * @return Array of deal IDs
     */
    function getUserDeals(address user) external view returns (string[] memory) {
        return userDeals[user];
    }
    
    /**
     * @dev Get deals by status
     * @param status Deal status
     * @return Array of deal IDs
     */
    function getDealsByStatus(DealStatus status) external view returns (string[] memory) {
        string[] memory result = new string[](totalDeals);
        uint256 count = 0;
        
        for (uint256 i = 0; i < dealIds.length; i++) {
            if (deals[dealIds[i]].status == status) {
                result[count] = dealIds[i];
                count++;
            }
        }
        
        // Resize array to actual count
        string[] memory finalResult = new string[](count);
        for (uint256 i = 0; i < count; i++) {
            finalResult[i] = result[i];
        }
        
        return finalResult;
    }
    
    /**
     * @dev Get marketplace statistics
     * @return totalDeals_ Total number of deals
     * @return totalVolume_ Total volume across all deals
     * @return totalFunded_ Total amount funded
     * @return averageInterestRate Average interest rate
     * @return averageRiskScore Average risk score
     */
    function getMarketplaceStats() external view returns (
        uint256 totalDeals_,
        uint256 totalVolume_,
        uint256 totalFunded_,
        uint256 averageInterestRate,
        uint256 averageRiskScore
    ) {
        totalDeals_ = totalDeals;
        totalVolume_ = totalVolume;
        totalFunded_ = totalFunded;
        
        if (totalDeals > 0) {
            uint256 totalInterest = 0;
            uint256 totalRisk = 0;
            
            for (uint256 i = 0; i < dealIds.length; i++) {
                Deal memory deal = deals[dealIds[i]];
                totalInterest += deal.interestRate;
                totalRisk += deal.riskScore;
            }
            
            averageInterestRate = totalInterest / totalDeals;
            averageRiskScore = totalRisk / totalDeals;
        }
    }
}
