import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "coston2",
  chainType: "l1",
});

console.log("Checking balance on Coston2 testnet");

const [sender] = await ethers.getSigners();

console.log("Account address:", sender.address);

// Get the balance
const balance = await ethers.provider.getBalance(sender.address);
console.log("Balance:", ethers.formatEther(balance), "ETH");

// Get the balance in wei for more precision
console.log("Balance (wei):", balance.toString());

// Get network info
const networkInfo = await ethers.provider.getNetwork();
console.log("Network:", networkInfo.name, "Chain ID:", networkInfo.chainId);
