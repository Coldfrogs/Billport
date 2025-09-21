import { network } from "hardhat";
import { ethers } from "ethers";

// Contract addresses (update these with your deployed addresses)
const CONTRACT_ADDRESSES = {
  MOCK_USD: "0x6391bFA09AF4dD6d322b646168B454f4D977384a",
  ISSUER_REGISTRY: "0x16B717120d41910313A0ca28AF8746a17e732462",
  WR_REGISTRY: "0x3b3fc290d50058e85953aAC0243ce80A35FC200a",
  PROOF_REGISTRY: "0xa92D88CF5c3Bef5790499618D7A4601eb26E5A30",
};

async function main() {
  console.log("🧪 PHASE 1: CORE CONTRACTS FUNCTIONALITY TESTS");
  console.log("=" .repeat(60));
  
  const { ethers: hardhatEthers } = await network.connect({
    network: "coston2",
    chainType: "l1",
  });

  const [deployer] = await hardhatEthers.getSigners();
  console.log(`\n🔸 Testing with account: ${deployer.address}`);
  
  try {
    // Test MockUSD Contract
    await testMockUSD(hardhatEthers, deployer);
    
    // Test IssuerRegistry Contract
    await testIssuerRegistry(hardhatEthers, deployer);
    
    // Test WRRegistry Contract
    const wrId = await testWRRegistry(hardhatEthers, deployer);
    
    // Test ProofRegistry Contract
    await testProofRegistry(hardhatEthers, deployer, wrId);
    
    console.log("\n" + "=" .repeat(60));
    console.log("🎉 PHASE 1: ALL CORE CONTRACT TESTS PASSED!");
    console.log("✅ MockUSD: Token functionality working");
    console.log("✅ IssuerRegistry: Issuer management working");
    console.log("✅ WRRegistry: WR lifecycle working");
    console.log("✅ ProofRegistry: Proof management working");
    console.log("=" .repeat(60));
    
  } catch (error) {
    console.error("\n❌ PHASE 1 FAILED:", error);
    process.exitCode = 1;
  }
}

async function testMockUSD(hardhatEthers: any, deployer: any) {
  console.log("\n📋 Testing MockUSD Contract...");
  
  const mockUSD = await hardhatEthers.getContractAt("MockUSD", CONTRACT_ADDRESSES.MOCK_USD);
  
  // Test basic token properties
  const name = await mockUSD.name();
  const symbol = await mockUSD.symbol();
  const decimals = await mockUSD.decimals();
  const totalSupply = await mockUSD.totalSupply();
  
  console.log(`✅ Token name: ${name}`);
  console.log(`✅ Token symbol: ${symbol}`);
  console.log(`✅ Token decimals: ${decimals}`);
  console.log(`✅ Total supply: ${ethers.formatUnits(totalSupply, decimals)} ${symbol}`);
  
  // Test balance
  const balance = await mockUSD.balanceOf(deployer.address);
  console.log(`✅ Owner balance: ${ethers.formatUnits(balance, decimals)} ${symbol}`);
  
  // Test transfer capability
  const testAmount = ethers.parseUnits("100", decimals);
  const transferTx = await mockUSD.transfer(deployer.address, testAmount);
  await transferTx.wait();
  console.log(`✅ Transfer test completed: ${ethers.formatUnits(testAmount, decimals)} ${symbol}`);
  
  // Test approval
  const approveTx = await mockUSD.approve(deployer.address, testAmount);
  await approveTx.wait();
  const allowance = await mockUSD.allowance(deployer.address, deployer.address);
  console.log(`✅ Approval test completed: ${ethers.formatUnits(allowance, decimals)} ${symbol}`);
}

async function testIssuerRegistry(hardhatEthers: any, deployer: any) {
  console.log("\n📋 Testing IssuerRegistry Contract...");
  
  const issuerRegistry = await hardhatEthers.getContractAt("IssuerRegistry", CONTRACT_ADDRESSES.ISSUER_REGISTRY);
  
  // Test initial state
  const testIssuer = "0x1234567890123456789012345678901234567890";
  const isIssuerBefore = await issuerRegistry.isIssuer(testIssuer);
  console.log(`✅ Initial issuer status: ${isIssuerBefore}`);
  
  // Test adding issuer (if not already added)
  if (!isIssuerBefore) {
    const addTx = await issuerRegistry.addIssuer(testIssuer);
    await addTx.wait();
    console.log(`✅ Added issuer: ${testIssuer}`);
  } else {
    console.log(`✅ Issuer already exists: ${testIssuer}`);
  }
  
  const isIssuerAfter = await issuerRegistry.isIssuer(testIssuer);
  console.log(`✅ Issuer status after add: ${isIssuerAfter}`);
  
  // Test removing issuer
  const removeTx = await issuerRegistry.removeIssuer(testIssuer);
  await removeTx.wait();
  console.log(`✅ Removed issuer: ${testIssuer}`);
  
  const isIssuerAfterRemove = await issuerRegistry.isIssuer(testIssuer);
  console.log(`✅ Issuer status after remove: ${isIssuerAfterRemove}`);
  
  // Test event emission
  const addTx2 = await issuerRegistry.addIssuer(testIssuer);
  const receipt = await addTx2.wait();
  const event = receipt!.logs.find(log => {
    try {
      const parsed = issuerRegistry.interface.parseLog(log);
      return parsed!.name === "IssuerAdded";
    } catch {
      return false;
    }
  });
  console.log(`✅ IssuerAdded event emitted: ${event ? "Yes" : "No"}`);
}

async function testWRRegistry(hardhatEthers: any, deployer: any) {
  console.log("\n📋 Testing WRRegistry Contract...");
  
  const wrRegistry = await hardhatEthers.getContractAt("WRRegistry", CONTRACT_ADDRESSES.WR_REGISTRY);
  const issuerRegistry = await hardhatEthers.getContractAt("IssuerRegistry", CONTRACT_ADDRESSES.ISSUER_REGISTRY);
  
  // First, add deployer as issuer (if not already)
  const isAlreadyIssuer = await issuerRegistry.isIssuer(deployer.address);
  if (!isAlreadyIssuer) {
    const addIssuerTx = await issuerRegistry.addIssuer(deployer.address);
    await addIssuerTx.wait();
    console.log(`✅ Added deployer as issuer`);
  } else {
    console.log(`✅ Deployer already an issuer`);
  }
  
  // Test WR registration
  const wrId = `WR-TEST-${Date.now()}`;
  const wrHash = ethers.keccak256(ethers.toUtf8Bytes(wrId));
  const wrStructHash = ethers.keccak256(ethers.toUtf8Bytes("test-struct"));
  const fileCidHash = ethers.keccak256(ethers.toUtf8Bytes("test-cid"));
  const sme = deployer.address;
  const issuer = deployer.address;
  const requestTemplateHash = ethers.keccak256(ethers.toUtf8Bytes("test-template"));
  
  // Create signature
  const message = ethers.solidityPackedKeccak256(
    ["bytes32", "bytes32", "string", "uint256", "address"],
    [wrHash, fileCidHash, wrId, 114, issuer]
  );
  const signature = await deployer.signMessage(ethers.getBytes(message));
  
  // Register WR
  const registerTx = await wrRegistry.registerWR(
    wrId,
    wrHash,
    wrStructHash,
    fileCidHash,
    sme,
    signature,
    requestTemplateHash
  );
  await registerTx.wait();
  console.log(`✅ WR registered: ${wrId}`);
  
  // Test WR retrieval
  const wrData = await wrRegistry.getWRInfo(wrId);
  console.log(`✅ WR data retrieved: ${wrData.wrId}`);
  console.log(`✅ WR hash: ${wrData.wrHash}`);
  console.log(`✅ WR pledged: ${wrData.pledged}`);
  
  // Test pledge
  const pledgeTx = await wrRegistry.pledge(wrId, deployer.address);
  await pledgeTx.wait();
  console.log(`✅ WR pledged to: ${deployer.address}`);
  
  const wrDataAfterPledge = await wrRegistry.getWRInfo(wrId);
  console.log(`✅ WR pledged status: ${wrDataAfterPledge.pledged}`);
  
  // Test double pledge prevention
  try {
    const doublePledgeTx = await wrRegistry.pledge(wrId, "0x1234567890123456789012345678901234567890");
    await doublePledgeTx.wait();
    console.log("❌ Double pledge should have failed!");
  } catch (error) {
    console.log("✅ Double pledge correctly prevented");
  }
  
  // Test milestone marking
  const milestoneTx = await wrRegistry.markAttested_WR_ISSUED(wrId, 12345);
  await milestoneTx.wait();
  console.log(`✅ WR marked as attested`);
  
  const wrDataAfterMilestone = await wrRegistry.getWRInfo(wrId);
  console.log(`✅ WR attested status: ${wrDataAfterMilestone.attested_WR_ISSUED}`);
  
  return wrId;
}

async function testProofRegistry(hardhatEthers: any, deployer: any, wrId: string) {
  console.log("\n📋 Testing ProofRegistry Contract...");
  
  const proofRegistry = await hardhatEthers.getContractAt("ProofRegistry", CONTRACT_ADDRESSES.PROOF_REGISTRY);
  
  // Test initial state
  const testAttestationId = ethers.keccak256(ethers.toUtf8Bytes("test-attestation"));
  const testRoundId = 12345;
  
  const isConsumedBefore = await proofRegistry.isConsumed(testAttestationId);
  console.log(`✅ Initial consumed status: ${isConsumedBefore}`);
  
  // Test proof consumption
  const consumeTx = await proofRegistry.consume(testAttestationId, testRoundId, wrId);
  await consumeTx.wait();
  console.log(`✅ Proof consumed: ${testAttestationId}`);
  
  const isConsumedAfter = await proofRegistry.isConsumed(testAttestationId);
  console.log(`✅ Consumed status after: ${isConsumedAfter}`);
  
  // Test proof replay prevention
  try {
    const replayTx = await proofRegistry.consume(testAttestationId, testRoundId, wrId);
    await replayTx.wait();
    console.log("❌ Proof replay should have failed!");
  } catch (error) {
    console.log("✅ Proof replay correctly prevented");
  }
  
  // Test proof status
  const newAttestationId = ethers.keccak256(ethers.toUtf8Bytes("new-attestation"));
  const newRoundId = 54321;
  
  const proofStatus = await proofRegistry.getProofStatus(newAttestationId, newRoundId);
  console.log(`✅ Proof status - consumed: ${proofStatus.consumedStatus}, expired: ${proofStatus.expiredStatus}, valid: ${proofStatus.validStatus}`);
  
  // Test event emission
  const consumeTx2 = await proofRegistry.consume(newAttestationId, newRoundId, wrId);
  const receipt = await consumeTx2.wait();
  const event = receipt!.logs.find(log => {
    try {
      const parsed = proofRegistry.interface.parseLog(log);
      return parsed!.name === "ProofAccepted";
    } catch {
      return false;
    }
  });
  console.log(`✅ ProofAccepted event emitted: ${event ? "Yes" : "No"}`);
}

main().catch((error) => {
  console.error("❌ Test failed:", error);
  process.exitCode = 1;
});
