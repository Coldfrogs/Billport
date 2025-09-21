import { network } from "hardhat";
import { ethers } from "ethers";

// Contract addresses (update these with your deployed addresses)
const CONTRACT_ADDRESSES = {
  DEAL_REGISTRY: "0x61b824f52988e892E3C6EA8c412f8F2ECa5656B5", // Deployed DealRegistry address
};

async function main() {
  console.log("🚀 Deploying SecondaryMarket contract...");

  const { ethers: hardhatEthers } = await network.connect({
    network: "coston2",
    chainType: "l1",
  });

  const [deployer] = await hardhatEthers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hardhatEthers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "C2FLR");

  // Check if DealRegistry address is set
  if (CONTRACT_ADDRESSES.DEAL_REGISTRY === "0x0000000000000000000000000000000000000000") {
    console.error("❌ Please update DEAL_REGISTRY address in the script before deploying");
    process.exit(1);
  }

  // Deploy SecondaryMarket
  const SecondaryMarket = await hardhatEthers.getContractFactory("SecondaryMarket");
  const secondaryMarket = await SecondaryMarket.deploy(CONTRACT_ADDRESSES.DEAL_REGISTRY);
  await secondaryMarket.waitForDeployment();

  const secondaryMarketAddress = await secondaryMarket.getAddress();
  console.log("✅ SecondaryMarket deployed to:", secondaryMarketAddress);

  // Verify deployment
  const dealRegistry = await secondaryMarket.dealRegistry();
  console.log("✅ DealRegistry address set to:", dealRegistry);

  const totalListings = await secondaryMarket.totalListings();
  console.log("✅ Initial total listings:", totalListings.toString());

  console.log("\n📋 Contract Information:");
  console.log("SecondaryMarket Address:", secondaryMarketAddress);
  console.log("DealRegistry Address:", dealRegistry);
  console.log("Deployer:", deployer.address);
  console.log("Network:", "Coston2 Testnet");

  console.log("\n🎉 SecondaryMarket deployment completed successfully!");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
