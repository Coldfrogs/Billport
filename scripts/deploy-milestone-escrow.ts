import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "coston2",
  chainType: "l1",
});

console.log("Deploying MilestoneEscrow on Coston2 testnet...");

const [deployer] = await ethers.getSigners();
console.log("Deploying with account:", deployer.address);
console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

// Contract addresses from previous deployments
const mockUSDAddress = "0x10eA6e0A4433B511e568E3c5b14865e009ad45F3"; // MockUSD
const wrRegistryAddress = "0xFF1DcE5cCAe784f7938f542FD5D9FbaD8706D937"; // WRRegistry

// Escrow parameters
const wrId = "WR-001-DEMO";
const lender = deployer.address; // Using deployer as lender for demo
const borrower = deployer.address; // Using deployer as borrower for demo
const amount = ethers.parseUnits("1000", 6); // 1000 mUSD (6 decimals)
const deadline = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days from now

console.log("Escrow parameters:");
console.log("WR ID:", wrId);
console.log("Lender:", lender);
console.log("Borrower:", borrower);
console.log("Token:", mockUSDAddress);
console.log("Amount:", ethers.formatUnits(amount, 6), "mUSD");
console.log("Deadline:", new Date(deadline * 1000).toISOString());

// Deploy MilestoneEscrow
const MilestoneEscrow = await ethers.getContractFactory("MilestoneEscrow");
const milestoneEscrow = await MilestoneEscrow.deploy(
    wrId,
    lender,
    borrower,
    mockUSDAddress,
    amount,
    deadline,
    wrRegistryAddress
);

await milestoneEscrow.waitForDeployment();

const milestoneEscrowAddress = await milestoneEscrow.getAddress();
console.log("MilestoneEscrow deployed to:", milestoneEscrowAddress);

// Get escrow info
const escrowInfo = await milestoneEscrow.getEscrowInfo();
console.log("Escrow state:", escrowInfo.state.toString());
console.log("Created at:", new Date(Number(escrowInfo.createdAt) * 1000).toISOString());

console.log("Deployment completed successfully!");
console.log("Save this address for future use:", milestoneEscrowAddress);
