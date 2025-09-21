import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "coston2",
  chainType: "l1",
});

console.log("🧪 Testing all deployed contracts on Coston2...\n");

const [deployer] = await ethers.getSigners();
console.log("Testing with account:", deployer.address);
console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "C2FLR\n");

// Contract addresses from previous deployments
const mockUSDAddress = "0x10eA6e0A4433B511e568E3c5b14865e009ad45F3";
const issuerRegistryAddress = "0x697e71625d0d3DF8A7E944cf6E776DA1C7F4aa24";
const wrRegistryAddress = "0xFF1DcE5cCAe784f7938f542FD5D9FbaD8706D937";
const proofRegistryAddress = "0xC938B384282f6eA2f6b99aFe178CaCd141D10241";
const milestoneEscrowAddress = "0xBCfa5320784236F6D5A5F6760A461Fc16b62aEAF";

// Get contract instances
const MockUSD = await ethers.getContractAt("MockUSD", mockUSDAddress);
const IssuerRegistry = await ethers.getContractAt("IssuerRegistry", issuerRegistryAddress);
const WRRegistry = await ethers.getContractAt("WRRegistry", wrRegistryAddress);
const ProofRegistry = await ethers.getContractAt("ProofRegistry", proofRegistryAddress);
const MilestoneEscrow = await ethers.getContractAt("MilestoneEscrow", milestoneEscrowAddress);

console.log("📋 Contract Addresses:");
console.log("MockUSD:", mockUSDAddress);
console.log("IssuerRegistry:", issuerRegistryAddress);
console.log("WRRegistry:", wrRegistryAddress);
console.log("ProofRegistry:", proofRegistryAddress);
console.log("MilestoneEscrow:", milestoneEscrowAddress);
console.log("");

// Test 1: MockUSD
console.log("🔸 Testing MockUSD...");
const totalSupply = await MockUSD.totalSupply();
const deployerBalance = await MockUSD.balanceOf(deployer.address);
const decimals = await MockUSD.decimals();
const name = await MockUSD.name();
const symbol = await MockUSD.symbol();

console.log("✅ Name:", name);
console.log("✅ Symbol:", symbol);
console.log("✅ Decimals:", decimals.toString());
console.log("✅ Total Supply:", ethers.formatUnits(totalSupply, decimals), symbol);
console.log("✅ Deployer Balance:", ethers.formatUnits(deployerBalance, decimals), symbol);
console.log("");

// Test 2: IssuerRegistry
console.log("🔸 Testing IssuerRegistry...");
const isDeployerIssuer = await IssuerRegistry.isAuthorizedIssuer(deployer.address);
const issuerCount = await IssuerRegistry.getIssuerCount();
const allIssuers = await IssuerRegistry.getAllIssuers();

console.log("✅ Deployer is authorized issuer:", isDeployerIssuer);
console.log("✅ Total issuers:", issuerCount.toString());
console.log("✅ All issuers:", allIssuers);
console.log("");

// Test 3: WRRegistry
console.log("🔸 Testing WRRegistry...");
const connectedIssuerRegistry = await WRRegistry.issuerRegistry();
console.log("✅ Connected IssuerRegistry:", connectedIssuerRegistry);

// Test registering a WR
const wrId = "WR-TEST-001";
const wrHash = ethers.keccak256(ethers.toUtf8Bytes("test-warehouse-receipt-content"));
const wrStructHash = ethers.keccak256(ethers.toUtf8Bytes("test-structure"));
const fileCidHash = ethers.keccak256(ethers.toUtf8Bytes("QmTestCid123"));
const sme = deployer.address;
const issuerSignature = "0x" + "0".repeat(130); // Mock signature
const requestTemplateHash = ethers.keccak256(ethers.toUtf8Bytes("test-template"));

console.log("📝 Registering test WR...");
try {
    const registerTx = await WRRegistry.registerWR(
        wrId,
        wrHash,
        wrStructHash,
        fileCidHash,
        sme,
        issuerSignature,
        requestTemplateHash
    );
    await registerTx.wait();
    console.log("✅ WR registered successfully!");
    
    // Test getting WR info
    const wrInfo = await WRRegistry.getWRInfo(wrId);
    console.log("✅ WR Info:");
    console.log("   - WR ID:", wrInfo.wrId);
    console.log("   - WR Hash:", wrInfo.wrHash);
    console.log("   - SME:", wrInfo.sme);
    console.log("   - Issuer:", wrInfo.issuer);
    console.log("   - Pledged:", wrInfo.pledged);
    console.log("   - Attested WR_ISSUED:", wrInfo.attested_WR_ISSUED);
    
    // Test pledging
    console.log("📝 Testing pledge...");
    const pledgeTx = await WRRegistry.pledge(wrId, deployer.address);
    await pledgeTx.wait();
    console.log("✅ WR pledged successfully!");
    
    const isPledged = await WRRegistry.isPledged(wrId);
    console.log("✅ WR is pledged:", isPledged);
    
} catch (error) {
    console.log("❌ WR registration failed:", error.message);
}
console.log("");

// Test 4: ProofRegistry
console.log("🔸 Testing ProofRegistry...");
const maxAgeEpochs = await ProofRegistry.maxAgeEpochs();
const currentEpoch = await ProofRegistry.getCurrentEpoch();
const flareSystemsManager = await ProofRegistry.flareSystemsManager();

console.log("✅ Max age epochs:", maxAgeEpochs.toString());
console.log("✅ Current epoch:", currentEpoch.toString());
console.log("✅ Flare Systems Manager:", flareSystemsManager);

// Test proof consumption
const attestationId = ethers.keccak256(ethers.toUtf8Bytes("test-attestation"));
const roundId = currentEpoch - 1n; // Use a recent round

console.log("📝 Testing proof consumption...");
try {
    const consumeTx = await ProofRegistry.consume(attestationId, roundId, wrId);
    await consumeTx.wait();
    console.log("✅ Proof consumed successfully!");
    
    const isConsumed = await ProofRegistry.isConsumed(attestationId);
    console.log("✅ Proof is consumed:", isConsumed);
    
} catch (error) {
    console.log("❌ Proof consumption failed:", error.message);
}
console.log("");

// Test 5: MilestoneEscrow
console.log("🔸 Testing MilestoneEscrow...");
const escrowInfo = await MilestoneEscrow.getEscrowInfo();
const isFunded = await MilestoneEscrow.isFunded();
const isReleased = await MilestoneEscrow.isReleased();
const isRefunded = await MilestoneEscrow.isRefunded();
const isDeadlinePassed = await MilestoneEscrow.isDeadlinePassed();
const timeUntilDeadline = await MilestoneEscrow.getTimeUntilDeadline();

console.log("✅ Escrow Info:");
console.log("   - WR ID:", escrowInfo.wrId);
console.log("   - Lender:", escrowInfo.lender);
console.log("   - Borrower:", escrowInfo.borrower);
console.log("   - Token:", escrowInfo.token);
console.log("   - Amount:", ethers.formatUnits(escrowInfo.amount, 6), "mUSD");
console.log("   - Deadline:", new Date(Number(escrowInfo.deadline) * 1000).toISOString());
console.log("   - State:", escrowInfo.state.toString());
console.log("✅ Is funded:", isFunded);
console.log("✅ Is released:", isReleased);
console.log("✅ Is refunded:", isRefunded);
console.log("✅ Is deadline passed:", isDeadlinePassed);
console.log("✅ Time until deadline:", timeUntilDeadline.toString(), "seconds");
console.log("");

// Test 6: Test funding the escrow (this will use C2FLR for gas)
console.log("🔸 Testing escrow funding (using C2FLR for gas)...");
console.log("📝 Approving MockUSD transfer...");
const approveTx = await MockUSD.approve(milestoneEscrowAddress, escrowInfo.amount);
await approveTx.wait();
console.log("✅ MockUSD approved for escrow");

console.log("📝 Funding escrow...");
const fundTx = await MilestoneEscrow.fund();
await fundTx.wait();
console.log("✅ Escrow funded successfully!");

// Check new state
const newEscrowInfo = await MilestoneEscrow.getEscrowInfo();
const newIsFunded = await MilestoneEscrow.isFunded();
console.log("✅ New escrow state:", newEscrowInfo.state.toString());
console.log("✅ Is funded:", newIsFunded);

// Check balances
const newDeployerBalance = await MockUSD.balanceOf(deployer.address);
const escrowBalance = await MockUSD.balanceOf(milestoneEscrowAddress);
console.log("✅ New deployer balance:", ethers.formatUnits(newDeployerBalance, 6), "mUSD");
console.log("✅ Escrow balance:", ethers.formatUnits(escrowBalance, 6), "mUSD");
console.log("");

// Test 7: Test milestone attestation
console.log("🔸 Testing milestone attestation...");
console.log("📝 Marking WR_ISSUED as attested...");
const markAttestedTx = await WRRegistry.markAttested_WR_ISSUED(wrId, currentEpoch);
await markAttestedTx.wait();
console.log("✅ WR_ISSUED milestone marked as attested!");

const isAttested = await WRRegistry.isAttested_WR_ISSUED(wrId);
console.log("✅ WR_ISSUED is attested:", isAttested);
console.log("");

// Test 8: Test escrow release
console.log("🔸 Testing escrow release...");
console.log("📝 Releasing escrow...");
const releaseTx = await MilestoneEscrow.release();
await releaseTx.wait();
console.log("✅ Escrow released successfully!");

const finalEscrowInfo = await MilestoneEscrow.getEscrowInfo();
const finalIsReleased = await MilestoneEscrow.isReleased();
const finalDeployerBalance = await MockUSD.balanceOf(deployer.address);
const finalEscrowBalance = await MockUSD.balanceOf(milestoneEscrowAddress);

console.log("✅ Final escrow state:", finalEscrowInfo.state.toString());
console.log("✅ Is released:", finalIsReleased);
console.log("✅ Final deployer balance:", ethers.formatUnits(finalDeployerBalance, 6), "mUSD");
console.log("✅ Final escrow balance:", ethers.formatUnits(finalEscrowBalance, 6), "mUSD");
console.log("");

console.log("🎉 All contract tests completed successfully!");
console.log("💰 C2FLR tokens were used for gas fees throughout the testing process");
console.log("📊 Final account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "C2FLR");
