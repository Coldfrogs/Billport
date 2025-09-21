import { network } from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("🚀 Deploying DealRegistry contract...");

  const { ethers: hardhatEthers } = await network.connect({
    network: "coston2",
    chainType: "l1",
  });

  const [deployer] = await hardhatEthers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hardhatEthers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "C2FLR");

  // Deploy DealRegistry
  const DealRegistry = await hardhatEthers.getContractFactory("DealRegistry");
  const dealRegistry = await DealRegistry.deploy();
  await dealRegistry.waitForDeployment();

  const dealRegistryAddress = await dealRegistry.getAddress();
  console.log("✅ DealRegistry deployed to:", dealRegistryAddress);

  // Verify deployment
  const totalDeals = await dealRegistry.totalDeals();
  console.log("✅ Initial total deals:", totalDeals.toString());

  console.log("\n📋 Contract Information:");
  console.log("DealRegistry Address:", dealRegistryAddress);
  console.log("Deployer:", deployer.address);
  console.log("Network:", "Coston2 Testnet");

  console.log("\n🎉 DealRegistry deployment completed successfully!");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
