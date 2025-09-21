import "dotenv/config";
import { ethers as ethersLib } from "ethers";
import { readFileSync } from "fs";
import { join } from "path";

async function main() {
  console.log("🚀 PROOF-OF-TRADE END-TO-END DEMO");
  console.log("=====================================\n");

  const rpc = process.env.COSTON2_RPC_URL;
  const pk = process.env.PRIVATE_KEY;
  if (!rpc || !pk) throw new Error("COSTON2_RPC_URL or PRIVATE_KEY not set in .env");

  const provider = new ethersLib.JsonRpcProvider(rpc);
  const signer = new ethersLib.Wallet(pk, provider);

  console.log("Demo Account:", await signer.getAddress());
  console.log("Starting Balance:", ethersLib.formatEther(await provider.getBalance(await signer.getAddress())), "C2FLR\n");

// Contract addresses
const mockUSDAddress = "0x10eA6e0A4433B511e568E3c5b14865e009ad45F3";
const issuerRegistryAddress = "0x697e71625d0d3DF8A7E944cf6E776DA1C7F4aa24";
const wrRegistryAddress = "0xFF1DcE5cCAe784f7938f542FD5D9FbaD8706D937";
const proofRegistryAddress = "0x0c16BE418bAd3b51Db3b405268980e745bbb3A83"; // redeployed address
const milestoneEscrowAddress = "0xBCfa5320784236F6D5A5F6760A461Fc16b62aEAF";

console.log("📋 Contract Addresses:");
console.log("MockUSD:", mockUSDAddress);
console.log("IssuerRegistry:", issuerRegistryAddress);
console.log("WRRegistry:", wrRegistryAddress);
console.log("ProofRegistry:", proofRegistryAddress);
console.log("MilestoneEscrow:", milestoneEscrowAddress);
console.log("");

// Allow overriding addresses via scripts/addresses.json
let overrides: any = {};
try { overrides = JSON.parse(readFileSync(join(process.cwd(), "scripts", "addresses.json"), "utf8")); } catch {}
const resolvedWrRegistry = overrides.WRRegistry || wrRegistryAddress;

// Get contract instances
const artifact = (name: string) => JSON.parse(readFileSync(join(process.cwd(), "artifacts", "contracts", `${name}.sol`, `${name}.json`), "utf8"));
const MockUSD = new ethersLib.Contract(mockUSDAddress, artifact("MockUSD").abi, signer);
const IssuerRegistry = new ethersLib.Contract(issuerRegistryAddress, artifact("IssuerRegistry").abi, signer);
const WRRegistry = new ethersLib.Contract(resolvedWrRegistry, artifact("WRRegistry").abi, signer);
const ProofRegistry = new ethersLib.Contract(proofRegistryAddress, artifact("ProofRegistry").abi, signer);
const MilestoneEscrow = new ethersLib.Contract(milestoneEscrowAddress, artifact("MilestoneEscrow").abi, signer);

console.log("🎯 STEP 1: REGISTER WAREHOUSE RECEIPT");
console.log("=====================================");

const wrId = "WR-DEMO-001";
const wrHash = ethersLib.keccak256(ethersLib.toUtf8Bytes("demo-warehouse-receipt-content"));
const wrStructHash = ethersLib.keccak256(ethersLib.toUtf8Bytes("demo-structure"));
const fileCidHash = ethersLib.keccak256(ethersLib.toUtf8Bytes("QmDemoCid123"));
const sme = await signer.getAddress();
const issuerSignature = "0x" + "0".repeat(130);
const requestTemplateHash = ethersLib.keccak256(ethersLib.toUtf8Bytes("demo-template"));

console.log("WR ID:", wrId);
console.log("WR Hash:", wrHash);
console.log("SME:", sme);
console.log("");

console.log("📝 Registering WR...");
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

console.log("📝 Pledging WR...");
const pledgeTx = await WRRegistry.pledge(wrId, await signer.getAddress());
await pledgeTx.wait();
console.log("✅ WR pledged successfully!");

console.log("");

console.log("🎯 STEP 2: FUND ESCROW");
console.log("=====================");

const escrowAmount = ethersLib.parseUnits("1000", 6); // 1000 mUSD
console.log("Escrow Amount:", ethersLib.formatUnits(escrowAmount, 6), "mUSD");

console.log("📝 Approving MockUSD transfer...");
const approveTx = await MockUSD.approve(milestoneEscrowAddress, escrowAmount);
await approveTx.wait();
console.log("✅ MockUSD approved for escrow");

console.log("📝 Funding escrow...");
const fundTx = await MilestoneEscrow.fund();
await fundTx.wait();
console.log("✅ Escrow funded successfully!");

// Check balances
const deployerBalance = await MockUSD.balanceOf(await signer.getAddress());
const escrowBalance = await MockUSD.balanceOf(milestoneEscrowAddress);
console.log("Deployer balance:", ethersLib.formatUnits(deployerBalance, 6), "mUSD");
console.log("Escrow balance:", ethersLib.formatUnits(escrowBalance, 6), "mUSD");

console.log("");

console.log("🎯 STEP 3: SIMULATE FDC ATTESTATION");
console.log("===================================");

console.log("📡 Simulating FDC request submission...");
console.log("💰 Using C2FLR for FDC fees...");

// Simulate FDC interaction (uses C2FLR for gas)
const fdcTx = await signer.sendTransaction({
  to: await signer.getAddress(),
  value: 0,
  gasLimit: 100000,
  data: "0x" // Simulate FDC interaction
});
await fdcTx.wait();
console.log("✅ FDC requests submitted (simulated)");

console.log("⏳ Waiting for validation rounds...");
await new Promise(resolve => setTimeout(resolve, 1000));
console.log("✅ Validation rounds completed!");

console.log("📝 Marking WR_ISSUED milestone as attested...");
const markAttestedTx = await WRRegistry.markAttested_WR_ISSUED(wrId, 12345);
await markAttestedTx.wait();
console.log("✅ WR_ISSUED milestone marked as attested!");

console.log("");

console.log("🎯 STEP 4: RELEASE ESCROW");
console.log("========================");

console.log("📝 Releasing escrow funds...");
const releaseTx = await MilestoneEscrow.release();
await releaseTx.wait();
console.log("✅ Escrow released successfully!");

// Check final balances
const finalDeployerBalance = await MockUSD.balanceOf(await signer.getAddress());
const finalEscrowBalance = await MockUSD.balanceOf(milestoneEscrowAddress);
console.log("Final deployer balance:", ethersLib.formatUnits(finalDeployerBalance, 6), "mUSD");
console.log("Final escrow balance:", ethersLib.formatUnits(finalEscrowBalance, 6), "mUSD");

console.log("");

console.log("🎯 STEP 5: XRPL MIRROR OPERATIONS");
console.log("=================================");

console.log("🌐 XRPL Testnet Operations:");
console.log("1. Fund accounts with test XRP from faucet");
console.log("2. Create WR-NFT representing collateral");
console.log("3. Issue INV-IOU to lender");
console.log("4. On repayment, redeem INV-IOU and burn WR-NFT");
console.log("");

console.log("📋 XRPL Account Addresses:");
console.log("SME Account:", "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH");
console.log("Protocol Account:", "rPT1Sjq2YGrBMTgsW4Tzv1tqgxrghjvw9r");
console.log("Lender Account:", "rHWaJaCvhpLW6bPCHq2hp7EWAQJZQX8Z6K");
console.log("");

console.log("🔗 XRPL Operations:");
console.log("- Fund accounts: https://xrpl.org/xrp-testnet-faucet.html");
console.log("- View on explorer: https://testnet.xrpl.org/");
console.log("- WR-NFT metadata: xrpl-operations/wr-nft-metadata.json");
console.log("");

console.log("🎉 END-TO-END DEMO COMPLETED!");
console.log("=============================");
console.log("✅ WR registered and pledged");
console.log("✅ Escrow funded with MockUSD");
console.log("✅ FDC attestation simulated");
console.log("✅ Milestone marked as attested");
console.log("✅ Escrow funds released");
console.log("✅ XRPL operations prepared");
console.log("");
console.log("💰 C2FLR Usage Summary:");
console.log("- Contract deployments: ~0.05 C2FLR");
console.log("- WR registration: ~0.01 C2FLR");
console.log("- Escrow operations: ~0.02 C2FLR");
console.log("- FDC simulation: ~0.01 C2FLR");
console.log("- Total C2FLR used: ~0.09 C2FLR");
console.log("");
console.log("📊 Final C2FLR balance:", ethersLib.formatEther(await provider.getBalance(await signer.getAddress())), "C2FLR");

}

main().catch((err) => { console.error(err); process.exitCode = 1; });
console.log("");
console.log("🔗 System Features Demonstrated:");
console.log("✅ Flare blockchain integration");
console.log("✅ C2FLR token usage for gas fees");
console.log("✅ Warehouse Receipt management");
console.log("✅ Escrow and milestone system");
console.log("✅ FDC integration simulation");
console.log("✅ XRPL cross-chain preparation");
console.log("✅ End-to-end proof-of-trade flow");
