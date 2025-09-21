// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title SecondaryMarket
 * @dev Manages secondary market trading of funded positions
 * @notice Allows users to trade their funded positions with other investors
 */
contract SecondaryMarket is Ownable {
    
    // Position listing information
    struct PositionListing {
        string id;                    // Listing ID (e.g., "SEC-001")
        string originalDealId;        // Original deal ID
        string wrId;                  // Warehouse Receipt ID
        address originalLender;       // Original lender
        address currentOwner;         // Current owner of the position
        uint256 originalAmount;       // Original invested amount
        uint256 remainingAmount;      // Remaining amount to be traded
        uint256 askingPrice;          // Asking price for the position
        uint256 currentYield;         // Current yield (basis points)
        uint256 daysToMaturity;       // Days remaining to maturity
        uint256 listedDate;           // When the position was listed
        ListingStatus status;         // Current listing status
    }
    
    // Position information
    struct Position {
        string dealId;                // Deal ID
        string wrId;                  // Warehouse Receipt ID
        address owner;                // Current owner
        uint256 investedAmount;       // Amount invested
        uint256 currentValue;         // Current value
        uint256 daysRemaining;        // Days remaining
        PositionStatus status;        // Position status
    }
    
    // Listing status enum
    enum ListingStatus {
        Listed,      // Position is listed for sale
        Sold,        // Position has been sold
        Withdrawn    // Listing has been withdrawn
    }
    
    // Position status enum
    enum PositionStatus {
        Active,      // Position is active
        Matured      // Position has matured
    }
    
    // State variables
    mapping(string => PositionListing) public listings;
    mapping(address => string[]) public userListings;
    mapping(address => Position[]) public userPositions;
    mapping(string => Position) public positions; // dealId => Position
    
    string[] public listingIds;
    uint256 public totalListings;
    uint256 public totalVolume;
    
    // Reference to DealRegistry
    address public dealRegistry;
    
    // Events
    event PositionListed(
        string indexed listingId,
        string indexed dealId,
        address indexed owner,
        uint256 askingPrice,
        uint256 remainingAmount
    );
    
    event PositionSold(
        string indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 salePrice
    );
    
    event ListingWithdrawn(
        string indexed listingId,
        address indexed owner
    );
    
    event PositionTransferred(
        string indexed dealId,
        address indexed from,
        address indexed to,
        uint256 amount
    );
    
    // Modifiers
    modifier onlyDealRegistry() {
        require(msg.sender == dealRegistry, "SecondaryMarket: only deal registry");
        _;
    }
    
    modifier onlyListingOwner(string memory listingId) {
        require(listings[listingId].currentOwner == msg.sender, "SecondaryMarket: only listing owner");
        _;
    }
    
    modifier listingExists(string memory listingId) {
        require(bytes(listings[listingId].id).length > 0, "SecondaryMarket: listing does not exist");
        _;
    }
    
    modifier validListingStatus(string memory listingId, ListingStatus requiredStatus) {
        require(listings[listingId].status == requiredStatus, "SecondaryMarket: invalid listing status");
        _;
    }
    
    constructor(address _dealRegistry) Ownable() {
        dealRegistry = _dealRegistry;
    }
    
    /**
     * @dev Create a position when a deal is funded
     * @param dealId Deal ID
     * @param wrId Warehouse Receipt ID
     * @param lender Lender address
     * @param amount Invested amount
     * @param daysRemaining Days remaining to maturity
     */
    function createPosition(
        string memory dealId,
        string memory wrId,
        address lender,
        uint256 amount,
        uint256 daysRemaining
    ) external onlyDealRegistry {
        require(bytes(positions[dealId].dealId).length == 0, "SecondaryMarket: position already exists");
        
        Position memory newPosition = Position({
            dealId: dealId,
            wrId: wrId,
            owner: lender,
            investedAmount: amount,
            currentValue: amount, // Initially same as invested
            daysRemaining: daysRemaining,
            status: PositionStatus.Active
        });
        
        positions[dealId] = newPosition;
        userPositions[lender].push(newPosition);
    }
    
    /**
     * @dev List a position for sale
     * @param listingId Unique listing ID
     * @param dealId Deal ID of the position
     * @param askingPrice Asking price for the position
     */
    function listPosition(
        string memory listingId,
        string memory dealId,
        uint256 askingPrice
    ) external {
        require(bytes(listingId).length > 0, "SecondaryMarket: listing ID required");
        require(bytes(listings[listingId].id).length == 0, "SecondaryMarket: listing already exists");
        require(bytes(positions[dealId].dealId).length > 0, "SecondaryMarket: position does not exist");
        require(positions[dealId].owner == msg.sender, "SecondaryMarket: not position owner");
        require(positions[dealId].status == PositionStatus.Active, "SecondaryMarket: position not active");
        require(askingPrice > 0, "SecondaryMarket: asking price must be positive");
        
        Position memory position = positions[dealId];
        
        PositionListing memory newListing = PositionListing({
            id: listingId,
            originalDealId: dealId,
            wrId: position.wrId,
            originalLender: position.owner,
            currentOwner: msg.sender,
            originalAmount: position.investedAmount,
            remainingAmount: position.currentValue,
            askingPrice: askingPrice,
            currentYield: 0, // Would be calculated based on current market conditions
            daysToMaturity: position.daysRemaining,
            listedDate: block.timestamp,
            status: ListingStatus.Listed
        });
        
        listings[listingId] = newListing;
        userListings[msg.sender].push(listingId);
        listingIds.push(listingId);
        totalListings++;
        totalVolume += askingPrice;
        
        emit PositionListed(listingId, dealId, msg.sender, askingPrice, position.currentValue);
    }
    
    /**
     * @dev Buy a listed position
     * @param listingId Listing ID
     */
    function buyPosition(string memory listingId) 
        external 
        payable 
        listingExists(listingId)
        validListingStatus(listingId, ListingStatus.Listed)
    {
        PositionListing storage listing = listings[listingId];
        Position storage position = positions[listing.originalDealId];
        
        require(msg.value >= listing.askingPrice, "SecondaryMarket: insufficient payment");
        require(msg.sender != listing.currentOwner, "SecondaryMarket: cannot buy own position");
        
        // Transfer position ownership
        position.owner = msg.sender;
        position.currentValue = listing.remainingAmount;
        
        // Update listing status
        listing.status = ListingStatus.Sold;
        
        // Transfer payment to seller
        payable(listing.currentOwner).transfer(listing.askingPrice);
        
        // Refund excess payment
        if (msg.value > listing.askingPrice) {
            payable(msg.sender).transfer(msg.value - listing.askingPrice);
        }
        
        // Update user positions
        userPositions[listing.currentOwner] = _removePositionFromUser(userPositions[listing.currentOwner], listing.originalDealId);
        userPositions[msg.sender].push(position);
        
        emit PositionSold(listingId, msg.sender, listing.currentOwner, listing.askingPrice);
        emit PositionTransferred(listing.originalDealId, listing.currentOwner, msg.sender, listing.remainingAmount);
    }
    
    /**
     * @dev Withdraw a listing
     * @param listingId Listing ID
     */
    function withdrawListing(string memory listingId) 
        external 
        onlyListingOwner(listingId)
        listingExists(listingId)
        validListingStatus(listingId, ListingStatus.Listed)
    {
        PositionListing storage listing = listings[listingId];
        
        listing.status = ListingStatus.Withdrawn;
        totalVolume -= listing.askingPrice;
        
        emit ListingWithdrawn(listingId, msg.sender);
    }
    
    /**
     * @dev Update position value (called by deal registry when deal status changes)
     * @param dealId Deal ID
     * @param newValue New position value
     */
    function updatePositionValue(string memory dealId, uint256 newValue) 
        external 
        onlyDealRegistry 
    {
        require(bytes(positions[dealId].dealId).length > 0, "SecondaryMarket: position does not exist");
        
        positions[dealId].currentValue = newValue;
    }
    
    /**
     * @dev Mature a position
     * @param dealId Deal ID
     */
    function maturePosition(string memory dealId) 
        external 
        onlyDealRegistry 
    {
        require(bytes(positions[dealId].dealId).length > 0, "SecondaryMarket: position does not exist");
        
        positions[dealId].status = PositionStatus.Matured;
        positions[dealId].daysRemaining = 0;
    }
    
    /**
     * @dev Get listing information
     * @param listingId Listing ID
     * @return PositionListing struct
     */
    function getListing(string memory listingId) external view returns (PositionListing memory) {
        require(bytes(listings[listingId].id).length > 0, "SecondaryMarket: listing does not exist");
        return listings[listingId];
    }
    
    /**
     * @dev Get position information
     * @param dealId Deal ID
     * @return Position struct
     */
    function getPosition(string memory dealId) external view returns (Position memory) {
        require(bytes(positions[dealId].dealId).length > 0, "SecondaryMarket: position does not exist");
        return positions[dealId];
    }
    
    /**
     * @dev Get user's positions
     * @param user User address
     * @return Array of Position structs
     */
    function getUserPositions(address user) external view returns (Position[] memory) {
        return userPositions[user];
    }
    
    /**
     * @dev Get user's listings
     * @param user User address
     * @return Array of listing IDs
     */
    function getUserListings(address user) external view returns (string[] memory) {
        return userListings[user];
    }
    
    /**
     * @dev Get all listing IDs
     * @return Array of listing IDs
     */
    function getAllListingIds() external view returns (string[] memory) {
        return listingIds;
    }
    
    /**
     * @dev Get listings by status
     * @param status Listing status
     * @return Array of listing IDs
     */
    function getListingsByStatus(ListingStatus status) external view returns (string[] memory) {
        string[] memory result = new string[](totalListings);
        uint256 count = 0;
        
        for (uint256 i = 0; i < listingIds.length; i++) {
            if (listings[listingIds[i]].status == status) {
                result[count] = listingIds[i];
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
     * @dev Helper function to remove position from user's positions array
     * @param userPositionsArray User's positions array
     * @param dealId Deal ID to remove
     * @return New array without the specified position
     */
    function _removePositionFromUser(Position[] memory userPositionsArray, string memory dealId) 
        internal 
        pure 
        returns (Position[] memory) 
    {
        uint256 newLength = 0;
        for (uint256 i = 0; i < userPositionsArray.length; i++) {
            if (keccak256(bytes(userPositionsArray[i].dealId)) != keccak256(bytes(dealId))) {
                newLength++;
            }
        }
        
        Position[] memory newArray = new Position[](newLength);
        uint256 index = 0;
        
        for (uint256 i = 0; i < userPositionsArray.length; i++) {
            if (keccak256(bytes(userPositionsArray[i].dealId)) != keccak256(bytes(dealId))) {
                newArray[index] = userPositionsArray[i];
                index++;
            }
        }
        
        return newArray;
    }
}
