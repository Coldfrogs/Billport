import { network } from "hardhat";
import fs from 'fs';

const { ethers } = await network.connect({
  network: "coston2",
  chainType: "l1",
});

console.log("🚀 Submitting FDC requests using C2FLR tokens...\n");

const [deployer] = await ethers.getSigners();
console.log("Submitting with account:", deployer.address);
console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "C2FLR\n");

// Contract addresses
const wrRegistryAddress = "0xFF1DcE5cCAe784f7938f542FD5D9FbaD8706D937";
const proofRegistryAddress = "0xC938B384282f6eA2f6b99aFe178CaCd141D10241";

// Template hashes (from previous computation)
const warehouseTemplateHash = "0x91635a6ba4ec4b95ce21f41c73f72c06a0e3517d0b67f75b22a28e7cfcbec275";
const ipfsTemplateHash = "0xea6a45717f22fcaf9ba05d823ce344f3d3ed221b0055a716428287f9c73d7d25";

// WR data for the demo
const wrId = "WR-001-DEMO";
const wrHash = ethers.keccak256(ethers.toUtf8Bytes("demo-warehouse-receipt-content"));
const fileCid = "QmDemoCid123456789";
const issuerId = "ISSUER-001";

console.log("📋 FDC Request Parameters:");
console.log("WR ID:", wrId);
console.log("WR Hash:", wrHash);
console.log("File CID:", fileCid);
console.log("Issuer ID:", issuerId);
console.log("Warehouse Template Hash:", warehouseTemplateHash);
console.log("IPFS Template Hash:", ipfsTemplateHash);
console.log("");

// Mock FDC contract addresses (these would be real FDC contracts on Coston2)
const FDC_HUB_ADDRESS = "0x0000000000000000000000000000000000000000"; // Placeholder
const FDC_REQUEST_FEE_CONFIG_ADDRESS = "0x0000000000000000000000000000000000000000"; // Placeholder

console.log("⚠️  Note: This is a demo simulation of FDC integration");
console.log("In a real implementation, you would:");
console.log("1. Query FdcRequestFeeConfigurations for fee amount");
console.log("2. Submit requests to FdcHub with C2FLR payment");
console.log("3. Wait for validation rounds to finalize");
console.log("4. Retrieve proofs from DA layer");
console.log("");

// Simulate FDC request submission
console.log("🔸 Simulating FDC request submission...");

// Create request data
const warehouseRequestData = {
    wrId: wrId,
    wrHash: wrHash,
    fileCid: fileCid,
    issuerId: issuerId,
    issuedAt: new Date().toISOString(),
    status: "WR_ISSUED",
    pledgeState: "PLEDGED"
};

const ipfsRequestData = {
    wrId: wrId,
    wrHash: wrHash,
    fileCid: fileCid,
    issuerId: issuerId,
    issuedAt: new Date().toISOString(),
    status: "WR_ISSUED",
    pledgeState: "PLEDGED"
};

console.log("📝 Warehouse API Request Data:");
console.log(JSON.stringify(warehouseRequestData, null, 2));
console.log("");

console.log("📝 IPFS Mirror Request Data:");
console.log(JSON.stringify(ipfsRequestData, null, 2));
console.log("");

// Simulate request encoding
const warehouseRequestBytes = ethers.toUtf8Bytes(JSON.stringify(warehouseRequestData));
const ipfsRequestBytes = ethers.toUtf8Bytes(JSON.stringify(ipfsRequestData));

console.log("🔸 Encoding requests...");
console.log("Warehouse request bytes length:", warehouseRequestBytes.length);
console.log("IPFS request bytes length:", ipfsRequestBytes.length);
console.log("");

// Simulate fee calculation (in a real implementation, this would query FDC contracts)
const estimatedFeePerRequest = ethers.parseEther("0.1"); // 0.1 C2FLR per request
const totalFee = estimatedFeePerRequest * 2n; // 2 requests

console.log("💰 FDC Fee Calculation:");
console.log("Estimated fee per request:", ethers.formatEther(estimatedFeePerRequest), "C2FLR");
console.log("Total fee for 2 requests:", ethers.formatEther(totalFee), "C2FLR");
console.log("");

// Check if we have enough C2FLR
const currentBalance = await ethers.provider.getBalance(deployer.address);
console.log("Current balance:", ethers.formatEther(currentBalance), "C2FLR");

if (currentBalance < totalFee) {
    console.log("❌ Insufficient C2FLR balance for FDC fees");
    process.exit(1);
}

console.log("✅ Sufficient C2FLR balance for FDC fees");
console.log("");

// Simulate submitting requests (in a real implementation, this would call FDC contracts)
console.log("🔸 Simulating FDC request submission...");

// Mock transaction to simulate C2FLR usage
const mockTx = await deployer.sendTransaction({
    to: deployer.address,
    value: 0,
    gasLimit: 100000,
    data: "0x" // Empty data to simulate FDC interaction
});

console.log("📝 Mock FDC interaction transaction:", mockTx.hash);
await mockTx.wait();
console.log("✅ Mock FDC interaction completed");

// Simulate getting round IDs (in a real implementation, this would come from FDC events)
const currentBlock = await ethers.provider.getBlockNumber();
const roundIdA = currentBlock + 1; // Simulate round ID
const roundIdB = currentBlock + 2; // Simulate round ID

console.log("🔸 Simulating round ID generation...");
console.log("Current block:", currentBlock);
console.log("Simulated Round ID A:", roundIdA);
console.log("Simulated Round ID B:", roundIdB);
console.log("");

// Simulate waiting for rounds to finalize
console.log("🔸 Simulating round finalization wait...");
console.log("⏳ Waiting for validation rounds to finalize...");
console.log("(In a real implementation, this would take ~90 seconds per epoch)");

// Simulate some time passing
await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second simulation

console.log("✅ Rounds finalized!");
console.log("");

// Simulate proof generation
const attestationIdA = ethers.keccak256(ethers.concat([
    ethers.toUtf8Bytes(wrHash),
    ethers.toUtf8Bytes(roundIdA.toString()),
    ethers.toUtf8Bytes(warehouseTemplateHash)
]));

const attestationIdB = ethers.keccak256(ethers.concat([
    ethers.toUtf8Bytes(wrHash),
    ethers.toUtf8Bytes(roundIdB.toString()),
    ethers.toUtf8Bytes(ipfsTemplateHash)
]));

console.log("🔸 Simulating proof generation...");
console.log("Attestation ID A:", attestationIdA);
console.log("Attestation ID B:", attestationIdB);
console.log("");

// Save proof data for next phase
const proofData = {
    wrId: wrId,
    wrHash: wrHash,
    roundIdA: roundIdA,
    roundIdB: roundIdB,
    attestationIdA: attestationIdA,
    attestationIdB: attestationIdB,
    warehouseTemplateHash: warehouseTemplateHash,
    ipfsTemplateHash: ipfsTemplateHash,
    requestDataA: warehouseRequestData,
    requestDataB: ipfsRequestData,
    submittedAt: new Date().toISOString()
};

// Save to file for next phase
fs.writeFileSync(
    'proof-data.json',
    JSON.stringify(proofData, null, 2)
);

console.log("✅ Proof data saved to proof-data.json");
console.log("");

console.log("🎉 FDC request simulation completed!");
console.log("💰 C2FLR tokens were used for gas fees during the process");
console.log("📊 Final account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "C2FLR");
console.log("");
console.log("🔗 Next steps:");
console.log("1. Retrieve proofs from DA layer");
console.log("2. Verify proofs cryptographically");
console.log("3. Mark WR_ISSUED milestone as attested");
console.log("4. Release escrow funds");
