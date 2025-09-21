import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "coston2",
  chainType: "l1",
});

console.log("Deploying IssuerRegistry on Coston2 testnet...");

const [deployer] = await ethers.getSigners();
console.log("Deploying with account:", deployer.address);
console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

// Deploy IssuerRegistry
const IssuerRegistry = await ethers.getContractFactory("IssuerRegistry");
const issuerRegistry = await IssuerRegistry.deploy();

await issuerRegistry.waitForDeployment();

const issuerRegistryAddress = await issuerRegistry.getAddress();
console.log("IssuerRegistry deployed to:", issuerRegistryAddress);

// Add the deployer as the first issuer for testing
console.log("Adding deployer as first issuer...");
const addIssuerTx = await issuerRegistry.addIssuer(deployer.address);
await addIssuerTx.wait();
console.log("Deployer added as issuer");

// Verify the issuer was added
const isIssuer = await issuerRegistry.isAuthorizedIssuer(deployer.address);
console.log("Deployer is authorized issuer:", isIssuer);

const issuerCount = await issuerRegistry.getIssuerCount();
console.log("Total issuers:", issuerCount.toString());

console.log("Deployment completed successfully!");
console.log("Save this address for future use:", issuerRegistryAddress);
