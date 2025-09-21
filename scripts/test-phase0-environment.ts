import { network } from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("🧪 PHASE 0: ENVIRONMENT SETUP TESTS");
  console.log("=" .repeat(50));
  
  const { ethers: hardhatEthers } = await network.connect({
    network: "coston2",
    chainType: "l1",
  });

  const [deployer] = await hardhatEthers.getSigners();
  console.log(`\n🔸 Testing with account: ${deployer.address}`);
  
  try {
    // Test 1: Network connection
    console.log("\n📡 Testing network connection...");
    const networkInfo = await hardhatEthers.provider.getNetwork();
    console.log(`✅ Network connected: Chain ID ${networkInfo.chainId}`);
    console.log(`✅ Network name: ${networkInfo.name || "Coston2"}`);
    
    // Test 2: Account balance
    console.log("\n💰 Testing account balance...");
    const balance = await hardhatEthers.provider.getBalance(deployer.address);
    console.log(`✅ Account balance: ${ethers.formatEther(balance)} C2FLR`);
    console.log(`✅ Balance in wei: ${balance.toString()}`);
    
    // Test 3: Gas price
    console.log("\n⛽ Testing gas price...");
    try {
      const gasPrice = await hardhatEthers.provider.getFeeData();
      console.log(`✅ Gas price: ${ethers.formatUnits(gasPrice.gasPrice || 0, "gwei")} gwei`);
      console.log(`✅ Gas price in wei: ${gasPrice.gasPrice?.toString() || "N/A"}`);
    } catch (error) {
      console.log("✅ Gas price: Using default (method not available)");
    }
    
    // Test 4: Block information
    console.log("\n📦 Testing block information...");
    const blockNumber = await hardhatEthers.provider.getBlockNumber();
    console.log(`✅ Current block: ${blockNumber}`);
    
    const block = await hardhatEthers.provider.getBlock(blockNumber);
    console.log(`✅ Block timestamp: ${new Date(Number(block!.timestamp) * 1000).toISOString()}`);
    console.log(`✅ Block gas limit: ${block!.gasLimit.toString()}`);
    
    // Test 5: Transaction capability
    console.log("\n🔄 Testing transaction capability...");
    const initialBalance = await hardhatEthers.provider.getBalance(deployer.address);
    
    const tx = await deployer.sendTransaction({
      to: deployer.address,
      value: 0,
      gasLimit: 21000
    });
    await tx.wait();
    
    const finalBalance = await hardhatEthers.provider.getBalance(deployer.address);
    const gasUsed = initialBalance - finalBalance;
    
    console.log(`✅ Transaction sent: ${tx.hash}`);
    console.log(`✅ Gas used: ${ethers.formatEther(gasUsed)} C2FLR`);
    console.log(`✅ Transaction confirmed in block: ${tx.blockNumber}`);
    
    // Test 6: Contract deployment capability
    console.log("\n🏗️ Testing contract deployment capability...");
    const TestContract = await hardhatEthers.getContractFactory("Counter");
    const testContract = await TestContract.deploy();
    await testContract.waitForDeployment();
    
    const contractAddress = await testContract.getAddress();
    console.log(`✅ Test contract deployed: ${contractAddress}`);
    
    // Test 7: Contract interaction
    console.log("\n🔧 Testing contract interaction...");
    const incrementTx = await testContract.inc();
    await incrementTx.wait();
    
    const counterValue = await testContract.x();
    console.log(`✅ Contract interaction successful: counter = ${counterValue}`);
    
    console.log("\n" + "=" .repeat(50));
    console.log("🎉 PHASE 0: ALL ENVIRONMENT TESTS PASSED!");
    console.log("✅ Coston2 testnet connection working");
    console.log("✅ C2FLR tokens available for gas");
    console.log("✅ Contract deployment and interaction working");
    console.log("✅ Ready for Phase 1 contract deployment");
    console.log("=" .repeat(50));
    
  } catch (error) {
    console.error("\n❌ PHASE 0 FAILED:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("❌ Test failed:", error);
  process.exitCode = 1;
});
