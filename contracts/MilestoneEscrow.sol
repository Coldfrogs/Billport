// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MilestoneEscrow
 * @dev Escrow contract for holding lender funds and releasing on verified milestones
 * @notice Manages funding, release, and refund operations for WR-backed loans
 */
contract MilestoneEscrow is Ownable {
    
    // Escrow state
    enum EscrowState {
        Created,    // Escrow created but not funded
        Funded,     // Escrow funded by lender
        Released,   // Funds released to borrower
        Refunded    // Funds refunded to lender
    }
    
    // Escrow information
    struct EscrowInfo {
        string wrId;                // WR identifier
        address lender;             // Lender address
        address borrower;           // Borrower (SME) address
        IERC20 token;               // Token contract (MockUSD)
        uint256 amount;             // Escrow amount
        uint256 deadline;           // Refund deadline
        EscrowState state;          // Current state
        uint256 createdAt;          // Creation timestamp
        uint256 fundedAt;           // Funding timestamp
        uint256 releasedAt;         // Release timestamp
        uint256 refundedAt;         // Refund timestamp
    }
    
    // Escrow information
    EscrowInfo public escrowInfo;
    
    // Reference to WRRegistry for milestone verification
    address public wrRegistry;
    
    // Events
    event EscrowCreated(
        string indexed wrId,
        address indexed lender,
        address indexed borrower,
        address token,
        uint256 amount,
        uint256 deadline
    );
    
    event EscrowFunded(
        string indexed wrId,
        address indexed lender,
        uint256 amount
    );
    
    event EscrowReleased(
        string indexed wrId,
        address indexed borrower,
        uint256 amount
    );
    
    event EscrowRefunded(
        string indexed wrId,
        address indexed lender,
        uint256 amount
    );
    
    // Modifiers
    modifier onlyLender() {
        require(msg.sender == escrowInfo.lender, "MilestoneEscrow: only lender");
        _;
    }
    
    modifier onlyInState(EscrowState expectedState) {
        require(escrowInfo.state == expectedState, "MilestoneEscrow: invalid state");
        _;
    }
    
    modifier onlyAfterDeadline() {
        require(block.timestamp >= escrowInfo.deadline, "MilestoneEscrow: deadline not reached");
        _;
    }
    
    constructor(
        string memory _wrId,
        address _lender,
        address _borrower,
        address _token,
        uint256 _amount,
        uint256 _deadline,
        address _wrRegistry
    ) Ownable() {
        require(_lender != address(0), "MilestoneEscrow: zero lender address");
        require(_borrower != address(0), "MilestoneEscrow: zero borrower address");
        require(_token != address(0), "MilestoneEscrow: zero token address");
        require(_amount > 0, "MilestoneEscrow: zero amount");
        require(_deadline > block.timestamp, "MilestoneEscrow: invalid deadline");
        require(_wrRegistry != address(0), "MilestoneEscrow: zero WR registry address");
        
        escrowInfo = EscrowInfo({
            wrId: _wrId,
            lender: _lender,
            borrower: _borrower,
            token: IERC20(_token),
            amount: _amount,
            deadline: _deadline,
            state: EscrowState.Created,
            createdAt: block.timestamp,
            fundedAt: 0,
            releasedAt: 0,
            refundedAt: 0
        });
        
        wrRegistry = _wrRegistry;
        
        emit EscrowCreated(_wrId, _lender, _borrower, _token, _amount, _deadline);
    }
    
    /**
     * @dev Fund the escrow (lender only)
     */
    function fund() external onlyLender onlyInState(EscrowState.Created) {
        // Transfer tokens from lender to escrow
        require(escrowInfo.token.transferFrom(msg.sender, address(this), escrowInfo.amount), "Transfer failed");
        
        escrowInfo.state = EscrowState.Funded;
        escrowInfo.fundedAt = block.timestamp;
        
        emit EscrowFunded(escrowInfo.wrId, msg.sender, escrowInfo.amount);
    }
    
    /**
     * @dev Release funds to borrower (only if WR_ISSUED milestone is attested)
     */
    function release() external onlyOwner onlyInState(EscrowState.Funded) {
        // In a real implementation, you would call WRRegistry.isAttested_WR_ISSUED(escrowInfo.wrId)
        // For demo purposes, we'll assume the milestone is attested
        // require(WRRegistry(wrRegistry).isAttested_WR_ISSUED(escrowInfo.wrId), "MilestoneEscrow: WR_ISSUED not attested");
        
        // Transfer tokens to borrower
        require(escrowInfo.token.transfer(escrowInfo.borrower, escrowInfo.amount), "Transfer failed");
        
        escrowInfo.state = EscrowState.Released;
        escrowInfo.releasedAt = block.timestamp;
        
        emit EscrowReleased(escrowInfo.wrId, escrowInfo.borrower, escrowInfo.amount);
    }
    
    /**
     * @dev Refund funds to lender (after deadline and not released)
     */
    function refund() external onlyLender onlyInState(EscrowState.Funded) onlyAfterDeadline {
        // Transfer tokens back to lender
        require(escrowInfo.token.transfer(escrowInfo.lender, escrowInfo.amount), "Transfer failed");
        
        escrowInfo.state = EscrowState.Refunded;
        escrowInfo.refundedAt = block.timestamp;
        
        emit EscrowRefunded(escrowInfo.wrId, msg.sender, escrowInfo.amount);
    }
    
    /**
     * @dev Get escrow information
     * @return EscrowInfo struct
     */
    function getEscrowInfo() external view returns (EscrowInfo memory) {
        return escrowInfo;
    }
    
    /**
     * @dev Check if escrow is funded
     * @return True if funded
     */
    function isFunded() external view returns (bool) {
        return escrowInfo.state == EscrowState.Funded;
    }
    
    /**
     * @dev Check if escrow is released
     * @return True if released
     */
    function isReleased() external view returns (bool) {
        return escrowInfo.state == EscrowState.Released;
    }
    
    /**
     * @dev Check if escrow is refunded
     * @return True if refunded
     */
    function isRefunded() external view returns (bool) {
        return escrowInfo.state == EscrowState.Refunded;
    }
    
    /**
     * @dev Check if deadline has passed
     * @return True if deadline has passed
     */
    function isDeadlinePassed() external view returns (bool) {
        return block.timestamp >= escrowInfo.deadline;
    }
    
    /**
     * @dev Get time until deadline
     * @return Seconds until deadline (0 if passed)
     */
    function getTimeUntilDeadline() external view returns (uint256) {
        if (block.timestamp >= escrowInfo.deadline) {
            return 0;
        }
        return escrowInfo.deadline - block.timestamp;
    }
}
