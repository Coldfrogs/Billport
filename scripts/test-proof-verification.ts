import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "coston2",
  chainType: "l1",
});

console.log("🔍 Testing proof verification...\n");

const [deployer] = await ethers.getSigners();
console.log("Testing with account:", deployer.address);
console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "C2FLR\n");

// Contract addresses
const wrRegistryAddress = "0xFF1DcE5cCAe784f7938f542FD5D9FbaD8706D937";
const proofRegistryAddress = "0xC938B384282f6eA2f6b99aFe178CaCd141D10241";

// Get contract instances
const WRRegistry = await ethers.getContractAt("WRRegistry", wrRegistryAddress);
const ProofRegistry = await ethers.getContractAt("ProofRegistry", proofRegistryAddress);

console.log("🔸 Testing ProofRegistry...");

// Test proof consumption
const testAttestationId = ethers.keccak256(ethers.toUtf8Bytes("test-attestation-verification"));
const testRoundId = 12345;
const testWrId = "WR-TEST-VERIFICATION";

console.log("📝 Testing proof consumption...");
console.log("Attestation ID:", testAttestationId);
console.log("Round ID:", testRoundId);
console.log("WR ID:", testWrId);

try {
    const consumeTx = await ProofRegistry.consume(testAttestationId, testRoundId, testWrId);
    await consumeTx.wait();
    console.log("✅ Proof consumed successfully!");
    
    // Check if consumed
    const isConsumed = await ProofRegistry.isConsumed(testAttestationId);
    console.log("✅ Proof is consumed:", isConsumed);
    
} catch (error) {
    console.log("❌ Error consuming proof:", error.message);
}

console.log("");

console.log("🔸 Testing WRRegistry...");

// Test WR registration and milestone marking
const testWrId2 = "WR-TEST-MILESTONE";
const testWrHash = ethers.keccak256(ethers.toUtf8Bytes("test-wr-content"));
const testWrStructHash = ethers.keccak256(ethers.toUtf8Bytes("test-structure"));
const testFileCidHash = ethers.keccak256(ethers.toUtf8Bytes("QmTestCid"));
const testSme = deployer.address;
const testIssuerSignature = "0x" + "0".repeat(130);
const testRequestTemplateHash = ethers.keccak256(ethers.toUtf8Bytes("test-template"));

console.log("📝 Testing WR registration...");
try {
    const registerTx = await WRRegistry.registerWR(
        testWrId2,
        testWrHash,
        testWrStructHash,
        testFileCidHash,
        testSme,
        testIssuerSignature,
        testRequestTemplateHash
    );
    await registerTx.wait();
    console.log("✅ WR registered successfully!");
    
    // Test milestone marking
    console.log("📝 Testing milestone marking...");
    const markTx = await WRRegistry.markAttested_WR_ISSUED(testWrId2, testRoundId);
    await markTx.wait();
    console.log("✅ Milestone marked as attested!");
    
    // Check if attested
    const isAttested = await WRRegistry.isAttested_WR_ISSUED(testWrId2);
    console.log("✅ WR_ISSUED is attested:", isAttested);
    
} catch (error) {
    console.log("❌ Error with WR operations:", error.message);
}

console.log("");

console.log("🎉 Proof verification test completed!");
console.log("💰 C2FLR tokens were used for gas fees");
console.log("📊 Final account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "C2FLR");
