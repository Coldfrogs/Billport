import { network } from "hardhat";
import { ethers } from "ethers";

const CONTRACT_ADDRESSES = {
  DEAL_REGISTRY: "0x61b824f52988e892E3C6EA8c412f8F2ECa5656B5",
};

async function main() {
  console.log("🔍 Debugging deal status...");

  const { ethers: hardhatEthers } = await network.connect({
    network: "coston2",
    chainType: "l1",
  });

  const [deployer] = await hardhatEthers.getSigners();
  console.log("Using account:", deployer.address);

  const dealRegistry = await hardhatEthers.getContractAt("DealRegistry", CONTRACT_ADDRESSES.DEAL_REGISTRY);

  // Get all deals
  const allDealIds = await dealRegistry.getAllDealIds();
  console.log(`\n📋 Found ${allDealIds.length} deals:`);

  for (const dealId of allDealIds) {
    const deal = await dealRegistry.getDeal(dealId);
    console.log(`\nDeal: ${dealId}`);
    console.log(`  Status: ${deal.status} (0=Listed, 1=Funded, 2=Verified, 3=Released, 4=Cancelled)`);
    console.log(`  Commodity: ${deal.commodity}`);
    console.log(`  Issuer: ${deal.issuer}`);
    console.log(`  Amount: ${ethers.formatUnits(deal.amount, 6)} mUSD`);
    console.log(`  Requested Funding: ${ethers.formatUnits(deal.requestedFunding, 6)} mUSD`);
    console.log(`  Interest Rate: ${deal.interestRate} basis points`);
    console.log(`  Duration: ${deal.duration} days`);
    console.log(`  Risk Score: ${deal.riskScore}`);
    console.log(`  Listed Date: ${new Date(Number(deal.listedDate) * 1000).toISOString()}`);
  }

  // Try to create a simple deal
  console.log("\n🧪 Creating a test deal...");
  const testDealId = `TEST-DEAL-${Date.now()}`;
  
  try {
    const tx = await dealRegistry.listDeal(
      testDealId,
      "TEST-WR-001",
      "Test Location",
      "Test Commodity",
      ethers.parseUnits("1000", 6),
      ethers.parseUnits("800", 6),
      500, // 5%
      30,  // 30 days
      500  // 5/10 risk
    );
    
    await tx.wait();
    console.log(`✅ Test deal ${testDealId} created successfully`);
    
    // Check its status
    const testDeal = await dealRegistry.getDeal(testDealId);
    console.log(`Test deal status: ${testDeal.status}`);
    
  } catch (error: any) {
    console.error(`❌ Error creating test deal:`, error.message);
  }
}

main().catch((error) => {
  console.error("❌ Debug failed:", error);
  process.exitCode = 1;
});
