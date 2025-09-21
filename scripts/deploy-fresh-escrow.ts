import "dotenv/config";
import { ethers } from "ethers";
import { writeFileSync } from "fs";
import { join } from "path";

console.log("🚀 DEPLOYING FRESH MILESTONE ESCROW");
console.log("===================================\n");

async function main() {
    const rpc = process.env.COSTON2_RPC_URL;
    const pk = process.env.PRIVATE_KEY;
    if (!rpc || !pk) throw new Error("COSTON2_RPC_URL or PRIVATE_KEY not set in .env");

    const provider = new ethers.JsonRpcProvider(rpc);
    const signer = new ethers.Wallet(pk, provider);

    console.log("Deploying with account:", await signer.getAddress());
    console.log("Account balance:", ethers.formatEther(await provider.getBalance(await signer.getAddress())), "C2FLR\n");

    // Contract addresses
    const mockUSDAddress = "0x10eA6e0A4433B511e568E3c5b14865e009ad45F3";
    const wrRegistryAddress = "0xFF1DcE5cCAe784f7938f542FD5D9FbaD8706D937";

    // Deploy fresh MilestoneEscrow
    console.log("📝 Deploying fresh MilestoneEscrow contract...");
    
    const wrId = "WR-FRESH-ESCROW-001";
    const lender = await signer.getAddress();
    const borrower = await signer.getAddress();
    const token = mockUSDAddress;
    const amount = ethers.parseUnits("1000", 6); // 1000 mUSD
    const deadline = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days from now
    const wrRegistry = wrRegistryAddress;

    console.log("Escrow Parameters:");
    console.log("WR ID:", wrId);
    console.log("Lender:", lender);
    console.log("Borrower:", borrower);
    console.log("Token:", token);
    console.log("Amount:", ethers.formatUnits(amount, 6), "mUSD");
    console.log("Deadline:", new Date(deadline * 1000).toISOString());
    console.log("WR Registry:", wrRegistry);
    console.log("");

    // Deploy the contract
    const MilestoneEscrowFactory = await ethers.getContractFactory("MilestoneEscrow");
    const milestoneEscrow = await MilestoneEscrowFactory.deploy(
        wrId,
        lender,
        borrower,
        token,
        amount,
        deadline,
        wrRegistry
    );

    await milestoneEscrow.waitForDeployment();
    const milestoneEscrowAddress = await milestoneEscrow.getAddress();

    console.log("✅ MilestoneEscrow deployed successfully!");
    console.log("Address:", milestoneEscrowAddress);
    console.log("");

    // Update addresses.json with new escrow address
    let addresses: any = {};
    try {
        addresses = JSON.parse(require('fs').readFileSync(join(process.cwd(), "scripts", "addresses.json"), "utf8"));
    } catch (error) {
        // File doesn't exist, create new one
    }

    addresses.MilestoneEscrow = milestoneEscrowAddress;
    addresses.MilestoneEscrowDeployedAt = new Date().toISOString();
    addresses.MilestoneEscrowWRId = wrId;

    writeFileSync(join(process.cwd(), "scripts", "addresses.json"), JSON.stringify(addresses, null, 2));
    console.log("💾 Updated addresses.json with new escrow address");
    console.log("");

    // Verify the deployment
    console.log("🔍 Verifying deployment...");
    const escrowInfo = await milestoneEscrow.getEscrowInfo();
    console.log("WR ID:", escrowInfo.wrId);
    console.log("State:", escrowInfo.state, "(0 = Created)");
    console.log("Amount:", ethers.formatUnits(escrowInfo.amount, 6), "mUSD");
    console.log("Deadline:", new Date(Number(escrowInfo.deadline) * 1000).toISOString());
    console.log("");

    console.log("🎉 Fresh MilestoneEscrow ready for use!");
    console.log("Use this address in your demo scripts:", milestoneEscrowAddress);
    console.log("");
    console.log("💰 C2FLR used for deployment:", ethers.formatEther(await provider.getBalance(await signer.getAddress())), "C2FLR");
}

main().catch((err) => {
    console.error("❌ Fatal error:", err);
    process.exitCode = 1;
});
