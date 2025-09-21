import { network } from "hardhat";
import { ethers } from "ethers";

// Contract addresses
const CONTRACT_ADDRESSES = {
  DEAL_REGISTRY: "0x61b824f52988e892E3C6EA8c412f8F2ECa5656B5",
  SECONDARY_MARKET: "0xc5Afa85C42531B96A9f47012bB6787d5BdA06178",
  MOCK_USD: "0x6391bFA09AF4dD6d322b646168B454f4D977384a",
};

async function main() {
  console.log("🌱 Creating fresh demo data...");

  const { ethers: hardhatEthers } = await network.connect({
    network: "coston2",
    chainType: "l1",
  });

  const [deployer] = await hardhatEthers.getSigners();
  console.log("Using account:", deployer.address);

  const dealRegistry = await hardhatEthers.getContractAt("DealRegistry", CONTRACT_ADDRESSES.DEAL_REGISTRY);

  // Create fresh deals with unique IDs
  const timestamp = Date.now();
  const demoDeals = [
    {
      dealId: `DEAL-${timestamp}-001`,
      wrId: `WR-2024-${timestamp}-001`,
      location: "Lagos, Nigeria",
      commodity: "Cocoa Beans",
      amount: ethers.parseUnits("50000", 6),
      requestedFunding: ethers.parseUnits("40000", 6),
      interestRate: 850,
      duration: 90,
      riskScore: 720
    },
    {
      dealId: `DEAL-${timestamp}-002`,
      wrId: `WR-2024-${timestamp}-002`,
      location: "Accra, Ghana",
      commodity: "Coffee Beans",
      amount: ethers.parseUnits("75000", 6),
      requestedFunding: ethers.parseUnits("60000", 6),
      interestRate: 780,
      duration: 120,
      riskScore: 810
    },
    {
      dealId: `DEAL-${timestamp}-003`,
      wrId: `WR-2024-${timestamp}-003`,
      location: "Nairobi, Kenya",
      commodity: "Tea Leaves",
      amount: ethers.parseUnits("30000", 6),
      requestedFunding: ethers.parseUnits("25000", 6),
      interestRate: 920,
      duration: 60,
      riskScore: 680
    },
    {
      dealId: `DEAL-${timestamp}-004`,
      wrId: `WR-2024-${timestamp}-004`,
      location: "Abidjan, Côte d'Ivoire",
      commodity: "Palm Oil",
      amount: ethers.parseUnits("100000", 6),
      requestedFunding: ethers.parseUnits("80000", 6),
      interestRate: 800,
      duration: 150,
      riskScore: 790
    }
  ];

  console.log("📝 Creating fresh demo deals...");

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
      console.error(`❌ Error creating deal ${deal.dealId}:`, error.message);
    }
  }

  // Fund some deals
  console.log("\n💰 Funding some deals...");
  
  const dealsToFund = [`DEAL-${timestamp}-002`, `DEAL-${timestamp}-003`];
  
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
  
  const dealsToVerify = [`DEAL-${timestamp}-002`];
  
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
    const statusText = deal.status === 0 ? 'Listed' : 
                      deal.status === 1 ? 'Funded' : 
                      deal.status === 2 ? 'Verified' : 
                      deal.status === 3 ? 'Released' : 'Cancelled';
    console.log(`- ${dealId}: ${deal.commodity} (${statusText})`);
  }

  console.log("\n🎉 Fresh demo data creation completed successfully!");
}

main().catch((error) => {
  console.error("❌ Demo data creation failed:", error);
  process.exitCode = 1;
});
