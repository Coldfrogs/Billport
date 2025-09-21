import { network } from "hardhat";
import { ethers } from "ethers";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Contract addresses (will be updated as contracts are deployed)
const CONTRACT_ADDRESSES = {
  MOCK_USD: "0x6391bFA09AF4dD6d322b646168B454f4D977384a",
  ISSUER_REGISTRY: "0x16B717120d41910313A0ca28AF8746a17e732462",
  WR_REGISTRY: "0x3b3fc290d50058e85953aAC0243ce80A35FC200a",
  PROOF_REGISTRY: "0xa92D88CF5c3Bef5790499618D7A4601eb26E5A30",
  DEAL_REGISTRY: "",
  SECONDARY_MARKET: ""
};

async function main() {
  console.log("🚀 SETTING UP FULL-STACK PROOF-OF-TRADE APPLICATION");
  console.log("=" .repeat(60));

  const { ethers: hardhatEthers } = await network.connect({
    network: "coston2",
    chainType: "l1",
  });

  const [deployer] = await hardhatEthers.getSigners();
  console.log("🔸 Using account:", deployer.address);

  const balance = await hardhatEthers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "C2FLR");

  // Step 1: Deploy DealRegistry
  console.log("\n📋 STEP 1: Deploying DealRegistry Contract");
  console.log("-" .repeat(40));
  
  try {
    const DealRegistry = await hardhatEthers.getContractFactory("DealRegistry");
    const dealRegistry = await DealRegistry.deploy();
    await dealRegistry.waitForDeployment();
    
    const dealRegistryAddress = await dealRegistry.getAddress();
    CONTRACT_ADDRESSES.DEAL_REGISTRY = dealRegistryAddress;
    console.log("✅ DealRegistry deployed to:", dealRegistryAddress);
  } catch (error) {
    console.error("❌ Failed to deploy DealRegistry:", error);
    process.exit(1);
  }

  // Step 2: Deploy SecondaryMarket
  console.log("\n📋 STEP 2: Deploying SecondaryMarket Contract");
  console.log("-" .repeat(40));
  
  try {
    const SecondaryMarket = await hardhatEthers.getContractFactory("SecondaryMarket");
    const secondaryMarket = await SecondaryMarket.deploy(CONTRACT_ADDRESSES.DEAL_REGISTRY);
    await secondaryMarket.waitForDeployment();
    
    const secondaryMarketAddress = await secondaryMarket.getAddress();
    CONTRACT_ADDRESSES.SECONDARY_MARKET = secondaryMarketAddress;
    console.log("✅ SecondaryMarket deployed to:", secondaryMarketAddress);
  } catch (error) {
    console.error("❌ Failed to deploy SecondaryMarket:", error);
    process.exit(1);
  }

  // Step 3: Populate with demo data
  console.log("\n📋 STEP 3: Populating Contracts with Demo Data");
  console.log("-" .repeat(40));
  
  try {
    const dealRegistry = await hardhatEthers.getContractAt("DealRegistry", CONTRACT_ADDRESSES.DEAL_REGISTRY);
    
    // Demo deals data
    const demoDeals = [
      {
        dealId: "DEAL-001",
        wrId: "WR-2024-001",
        location: "Lagos, Nigeria",
        commodity: "Cocoa Beans",
        amount: ethers.parseUnits("50000", 6),
        requestedFunding: ethers.parseUnits("40000", 6),
        interestRate: 850,
        duration: 90,
        riskScore: 720
      },
      {
        dealId: "DEAL-002",
        wrId: "WR-2024-002",
        location: "Accra, Ghana",
        commodity: "Coffee Beans",
        amount: ethers.parseUnits("75000", 6),
        requestedFunding: ethers.parseUnits("60000", 6),
        interestRate: 780,
        duration: 120,
        riskScore: 810
      },
      {
        dealId: "DEAL-003",
        wrId: "WR-2024-003",
        location: "Nairobi, Kenya",
        commodity: "Tea Leaves",
        amount: ethers.parseUnits("30000", 6),
        requestedFunding: ethers.parseUnits("25000", 6),
        interestRate: 920,
        duration: 60,
        riskScore: 680
      },
      {
        dealId: "DEAL-004",
        wrId: "WR-2024-004",
        location: "Abidjan, Côte d'Ivoire",
        commodity: "Palm Oil",
        amount: ethers.parseUnits("100000", 6),
        requestedFunding: ethers.parseUnits("80000", 6),
        interestRate: 800,
        duration: 150,
        riskScore: 790
      }
    ];

    for (const deal of demoDeals) {
      try {
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
        console.log(`✅ Created deal: ${deal.dealId} - ${deal.commodity}`);
      } catch (error: any) {
        if (error.message.includes("deal already exists")) {
          console.log(`⚠️ Deal ${deal.dealId} already exists, skipping...`);
        } else {
          console.error(`❌ Error creating deal ${deal.dealId}:`, error.message);
        }
      }
    }

    // Fund some deals
    const dealsToFund = ["DEAL-002", "DEAL-003"];
    for (const dealId of dealsToFund) {
      try {
        const tx = await dealRegistry.fundDeal(dealId);
        await tx.wait();
        console.log(`✅ Funded deal: ${dealId}`);
      } catch (error: any) {
        console.error(`❌ Error funding deal ${dealId}:`, error.message);
      }
    }

    // Verify some deals
    const dealsToVerify = ["DEAL-002"];
    for (const dealId of dealsToVerify) {
      try {
        const tx = await dealRegistry.verifyDeal(dealId);
        await tx.wait();
        console.log(`✅ Verified deal: ${dealId}`);
      } catch (error: any) {
        console.error(`❌ Error verifying deal ${dealId}:`, error.message);
      }
    }

  } catch (error) {
    console.error("❌ Failed to populate demo data:", error);
  }

  // Step 4: Update backend configuration
  console.log("\n📋 STEP 4: Updating Backend Configuration");
  console.log("-" .repeat(40));
  
  try {
    const backendConfig = `
const CONTRACT_ADDRESSES = {
  MOCK_USD: "${CONTRACT_ADDRESSES.MOCK_USD}",
  ISSUER_REGISTRY: "${CONTRACT_ADDRESSES.ISSUER_REGISTRY}",
  WR_REGISTRY: "${CONTRACT_ADDRESSES.WR_REGISTRY}",
  PROOF_REGISTRY: "${CONTRACT_ADDRESSES.PROOF_REGISTRY}",
  DEAL_REGISTRY: "${CONTRACT_ADDRESSES.DEAL_REGISTRY}",
  SECONDARY_MARKET: "${CONTRACT_ADDRESSES.SECONDARY_MARKET}"
};
`;
    
    // Write contract addresses to a file for the backend
    const fs = require('fs');
    fs.writeFileSync('./backend/contract-addresses.js', backendConfig);
    console.log("✅ Backend configuration updated");
  } catch (error) {
    console.error("❌ Failed to update backend configuration:", error);
  }

  // Step 5: Install backend dependencies
  console.log("\n📋 STEP 5: Installing Backend Dependencies");
  console.log("-" .repeat(40));
  
  try {
    console.log("Installing backend dependencies...");
    await execAsync('cd backend && npm install');
    console.log("✅ Backend dependencies installed");
  } catch (error) {
    console.error("❌ Failed to install backend dependencies:", error);
  }

  // Step 6: Install frontend dependencies
  console.log("\n📋 STEP 6: Installing Frontend Dependencies");
  console.log("-" .repeat(40));
  
  try {
    console.log("Installing frontend dependencies...");
    await execAsync('cd frontend_trade/trade-proof-gateway-main && npm install');
    console.log("✅ Frontend dependencies installed");
  } catch (error) {
    console.error("❌ Failed to install frontend dependencies:", error);
  }

  // Step 7: Build frontend
  console.log("\n📋 STEP 7: Building Frontend");
  console.log("-" .repeat(40));
  
  try {
    console.log("Building frontend...");
    await execAsync('cd frontend_trade/trade-proof-gateway-main && npm run build');
    console.log("✅ Frontend built successfully");
  } catch (error) {
    console.error("❌ Failed to build frontend:", error);
  }

  // Final summary
  console.log("\n" + "=" .repeat(60));
  console.log("🎉 FULL-STACK SETUP COMPLETED SUCCESSFULLY!");
  console.log("=" .repeat(60));
  
  console.log("\n📋 Contract Addresses:");
  console.log("MockUSD:", CONTRACT_ADDRESSES.MOCK_USD);
  console.log("IssuerRegistry:", CONTRACT_ADDRESSES.ISSUER_REGISTRY);
  console.log("WRRegistry:", CONTRACT_ADDRESSES.WR_REGISTRY);
  console.log("ProofRegistry:", CONTRACT_ADDRESSES.PROOF_REGISTRY);
  console.log("DealRegistry:", CONTRACT_ADDRESSES.DEAL_REGISTRY);
  console.log("SecondaryMarket:", CONTRACT_ADDRESSES.SECONDARY_MARKET);
  
  console.log("\n🚀 To start the application:");
  console.log("1. Start backend: cd backend && npm start");
  console.log("2. Open browser: http://localhost:3001");
  
  console.log("\n📊 Demo data includes:");
  console.log("- 4 sample deals with different commodities");
  console.log("- 2 funded deals");
  console.log("- 1 verified deal");
  console.log("- Marketplace statistics");
  
  console.log("\n✅ Ready for demonstration!");
}

main().catch((error) => {
  console.error("❌ Setup failed:", error);
  process.exitCode = 1;
});
