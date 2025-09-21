import "dotenv/config";
import { ethers } from "ethers";
import { readFileSync } from "fs";
import { join } from "path";

console.log("🔍 CHECKING ESCROW STATE");
console.log("========================\n");

async function main() {
    const rpc = process.env.COSTON2_RPC_URL;
    const pk = process.env.PRIVATE_KEY;
    if (!rpc || !pk) throw new Error("COSTON2_RPC_URL or PRIVATE_KEY not set in .env");

    const provider = new ethers.JsonRpcProvider(rpc);
    const signer = new ethers.Wallet(pk, provider);

    console.log("Checking with account:", await signer.getAddress());
    console.log("");

    // Contract addresses
    const milestoneEscrowAddress = "0xBCfa5320784236F6D5A5F6760A461Fc16b62aEAF";

    // Get contract instance
    const artifact = (name: string) => JSON.parse(readFileSync(join(process.cwd(), "artifacts", "contracts", `${name}.sol`, `${name}.json`), "utf8"));
    const MilestoneEscrow = new ethers.Contract(milestoneEscrowAddress, artifact("MilestoneEscrow").abi, signer);

    try {
        // Get escrow info
        const escrowInfo = await MilestoneEscrow.getEscrowInfo();
        
        console.log("📋 Escrow Information:");
        console.log("WR ID:", escrowInfo.wrId);
        console.log("Lender:", escrowInfo.lender);
        console.log("Borrower:", escrowInfo.borrower);
        console.log("Token:", escrowInfo.token);
        console.log("Amount:", ethers.formatUnits(escrowInfo.amount, 6), "mUSD");
        console.log("Deadline:", new Date(Number(escrowInfo.deadline) * 1000).toISOString());
        console.log("State:", escrowInfo.state);
        console.log("Created At:", new Date(Number(escrowInfo.createdAt) * 1000).toISOString());
        console.log("Funded At:", escrowInfo.fundedAt > 0 ? new Date(Number(escrowInfo.fundedAt) * 1000).toISOString() : "Not funded");
        console.log("Released At:", escrowInfo.releasedAt > 0 ? new Date(Number(escrowInfo.releasedAt) * 1000).toISOString() : "Not released");
        console.log("Refunded At:", escrowInfo.refundedAt > 0 ? new Date(Number(escrowInfo.refundedAt) * 1000).toISOString() : "Not refunded");
        console.log("");

        // Check individual state flags
        const isFunded = await MilestoneEscrow.isFunded();
        const isReleased = await MilestoneEscrow.isReleased();
        const isRefunded = await MilestoneEscrow.isRefunded();
        const isDeadlinePassed = await MilestoneEscrow.isDeadlinePassed();
        const timeUntilDeadline = await MilestoneEscrow.getTimeUntilDeadline();

        console.log("📊 State Flags:");
        console.log("Is Funded:", isFunded);
        console.log("Is Released:", isReleased);
        console.log("Is Refunded:", isRefunded);
        console.log("Is Deadline Passed:", isDeadlinePassed);
        console.log("Time Until Deadline:", timeUntilDeadline.toString(), "seconds");
        console.log("");

        // Determine what can be done
        console.log("🔧 Available Actions:");
        if (escrowInfo.state === 0) { // Created
            console.log("✅ Can fund escrow");
        } else if (escrowInfo.state === 1) { // Funded
            console.log("✅ Can release escrow (if milestone attested)");
            console.log("✅ Can refund escrow (if deadline passed)");
        } else if (escrowInfo.state === 2) { // Released
            console.log("❌ Escrow already released - no actions available");
        } else if (escrowInfo.state === 3) { // Refunded
            console.log("❌ Escrow already refunded - no actions available");
        }

        // Check if we're the lender
        const isLender = escrowInfo.lender.toLowerCase() === (await signer.getAddress()).toLowerCase();
        console.log("Is Current Account the Lender:", isLender);
        console.log("");

        // Check token balance
        const MockUSD = new ethers.Contract(escrowInfo.token, artifact("MockUSD").abi, signer);
        const lenderBalance = await MockUSD.balanceOf(await signer.getAddress());
        const escrowBalance = await MockUSD.balanceOf(milestoneEscrowAddress);
        
        console.log("💰 Token Balances:");
        console.log("Lender Balance:", ethers.formatUnits(lenderBalance, 6), "mUSD");
        console.log("Escrow Balance:", ethers.formatUnits(escrowBalance, 6), "mUSD");
        console.log("Required Amount:", ethers.formatUnits(escrowInfo.amount, 6), "mUSD");
        console.log("");

        if (escrowInfo.state !== 0) {
            console.log("⚠️  Escrow is not in Created state - cannot fund");
            console.log("Current state:", escrowInfo.state);
            console.log("Expected state: 0 (Created)");
            console.log("");
            console.log("💡 Solutions:");
            console.log("1. Deploy a new MilestoneEscrow contract");
            console.log("2. Use a different escrow address");
            console.log("3. Check if this escrow was already used");
        }

    } catch (error: any) {
        console.error("❌ Error checking escrow state:", error.message);
    }
}

main().catch((err) => {
    console.error("❌ Fatal error:", err);
    process.exitCode = 1;
});
