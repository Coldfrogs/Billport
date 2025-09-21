import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "coston2",
  chainType: "l1",
});

console.log("Deploying MockUSD on Coston2 testnet...");

const [deployer] = await ethers.getSigners();
console.log("Deploying with account:", deployer.address);
console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

// Deploy MockUSD
const MockUSD = await ethers.getContractFactory("MockUSD");
const mockUSD = await MockUSD.deploy();

await mockUSD.waitForDeployment();

const mockUSDAddress = await mockUSD.getAddress();
console.log("MockUSD deployed to:", mockUSDAddress);

// Check the total supply
const totalSupply = await mockUSD.totalSupply();
console.log("Total supply:", ethers.formatUnits(totalSupply, 6), "mUSD");

// Check deployer's balance
const deployerBalance = await mockUSD.balanceOf(deployer.address);
console.log("Deployer balance:", ethers.formatUnits(deployerBalance, 6), "mUSD");

console.log("Deployment completed successfully!");
console.log("Save this address for future use:", mockUSDAddress);
