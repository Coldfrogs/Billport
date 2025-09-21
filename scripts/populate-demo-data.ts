import { network } from "hardhat";
import { ethers } from "ethers";

// Contract addresses (update these with your deployed addresses)
const CONTRACT_ADDRESSES = {
  DEAL_REGISTRY: "0x61b824f52988e892E3C6EA8c412f8F2ECa5656B5", // Deployed address
  SECONDARY_MARKET: "0xc5Afa85C42531B96A9f47012bB6787d5BdA06178", // Deployed address
  MOCK_USD: "0x6391bFA09AF4dD6d322b646168B454f4D977384a",
};

async function main() {
  console.log("🌱 Populating contracts with demo data...");

  const { ethers: hardhatEthers } = await network.connect({
    network: "coston2",
    chainType: "l1",
  });

  const [deployer] = await hardhatEthers.getSigners();
  console.log("Using account:", deployer.address);

  // Check if contract addresses are set
  if (CONTRACT_ADDRESSES.DEAL_REGISTRY === "0x0000000000000000000000000000000000000000") {
    console.error("❌ Please update DEAL_REGISTRY address before running this script");
    process.exit(1);
  }

  const dealRegistry = await hardhatEthers.getContractAt("DealRegistry", CONTRACT_ADDRESSES.DEAL_REGISTRY);

  // Demo deals data
  const demoDeals = [
    {
      dealId: "DEAL-001",
      wrId: "WR-2024-001",
      location: "Lagos, Nigeria",
      commodity: "Cocoa Beans",
      amount: ethers.parseUnits("50000", 6), // 50,000 mUSD
      requestedFunding: ethers.parseUnits("40000", 6), // 40,000 mUSD
      interestRate: 850, // 8.5%
      duration: 90, // 90 days
      riskScore: 720 // 7.2/10 scaled by 100
    },
    {
      dealId: "DEAL-002",
      wrId: "WR-2024-002",
      location: "Accra, Ghana",
      commodity: "Coffee Beans",
      amount: ethers.parseUnits("75000", 6), // 75,000 mUSD
      requestedFunding: ethers.parseUnits("60000", 6), // 60,000 mUSD
      interestRate: 780, // 7.8%
      duration: 120, // 120 days
      riskScore: 810 // 8.1/10 scaled by 100
    },
    {
      dealId: "DEAL-003",
      wrId: "WR-2024-003",
      location: "Nairobi, Kenya",
      commodity: "Tea Leaves",
      amount: ethers.parseUnits("30000", 6), // 30,000 mUSD
      requestedFunding: ethers.parseUnits("25000", 6), // 25,000 mUSD
      interestRate: 920, // 9.2%
      duration: 60, // 60 days
      riskScore: 680 // 6.8/10 scaled by 100
    },
    {
      dealId: "DEAL-004",
      wrId: "WR-2024-004",
      location: "Abidjan, Côte d'Ivoire",
      commodity: "Palm Oil",
      amount: ethers.parseUnits("100000", 6), // 100,000 mUSD
      requestedFunding: ethers.parseUnits("80000", 6), // 80,000 mUSD
      interestRate: 800, // 8.0%
      duration: 150, // 150 days
      riskScore: 790 // 7.9/10 scaled by 100
    }
  ];

  console.log("📝 Creating demo deals...");

  for (const deal of demoDeals) {
    try {
      console.log(`Creating deal: ${deal.dealId} - ${deal.commodity}`);
      
      const tx = await dealRegistry.listDeal(
        deal.dealId,
        deal.wrId,
        deal.location,
        deal.commodity,
        deal.amount,
        deal.requestedFunding,
        deal.interestRate,
        deal.duration,
        deal.riskScore
      );
      
      await tx.wait();
      console.log(`✅ Deal ${deal.dealId} created successfully`);
    } catch (error: any) {
      if (error.message.includes("deal already exists")) {
        console.log(`⚠️ Deal ${deal.dealId} already exists, skipping...`);
      } else {
        console.error(`❌ Error creating deal ${deal.dealId}:`, error.message);
      }
    }
  }

  // Fund some deals
  console.log("\n💰 Funding some deals...");
  
  const dealsToFund = ["DEAL-002", "DEAL-003"];
  
  for (const dealId of dealsToFund) {
    try {
      console.log(`Funding deal: ${dealId}`);
      
      const tx = await dealRegistry.fundDeal(dealId);
      await tx.wait();
      console.log(`✅ Deal ${dealId} funded successfully`);
    } catch (error: any) {
      console.error(`❌ Error funding deal ${dealId}:`, error.message);
    }
  }

  // Verify some deals
  console.log("\n🔍 Verifying some deals...");
  
  const dealsToVerify = ["DEAL-002"];
  
  for (const dealId of dealsToVerify) {
    try {
      console.log(`Verifying deal: ${dealId}`);
      
      const tx = await dealRegistry.verifyDeal(dealId);
      await tx.wait();
      console.log(`✅ Deal ${dealId} verified successfully`);
    } catch (error: any) {
      console.error(`❌ Error verifying deal ${dealId}:`, error.message);
    }
  }

  // Get marketplace stats
  console.log("\n📊 Marketplace Statistics:");
  const stats = await dealRegistry.getMarketplaceStats();
  console.log(`Total Deals: ${stats[0]}`);
  console.log(`Total Volume: ${ethers.formatUnits(stats[1], 6)} mUSD`);
  console.log(`Total Funded: ${ethers.formatUnits(stats[2], 6)} mUSD`);
  console.log(`Average Interest Rate: ${Number(stats[3]) / 100}%`);
  console.log(`Average Risk Score: ${Number(stats[4]) / 100}/10`);

  // Get all deals
  console.log("\n📋 All Deals:");
  const allDealIds = await dealRegistry.getAllDealIds();
  for (const dealId of allDealIds) {
    const deal = await dealRegistry.getDeal(dealId);
    console.log(`- ${dealId}: ${deal.commodity} (${deal.status === 0 ? 'Listed' : deal.status === 1 ? 'Funded' : deal.status === 2 ? 'Verified' : deal.status === 3 ? 'Released' : 'Cancelled'})`);
  }

  console.log("\n🎉 Demo data population completed successfully!");
}

main().catch((error) => {
  console.error("❌ Demo data population failed:", error);
  process.exitCode = 1;
});
