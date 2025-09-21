import "dotenv/config";
import { ethers } from "ethers";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { FDCClient, createWarehouseReceiptRequest, createIPFSMirrorRequest } from "../src/fdc-client.js";

console.log("🚀 SUBMITTING REAL FDC REQUESTS");
console.log("================================\n");

async function main() {
    const rpc = process.env.COSTON2_RPC_URL;
    const pk = process.env.PRIVATE_KEY;
    if (!rpc || !pk) throw new Error("COSTON2_RPC_URL or PRIVATE_KEY not set in .env");

    const provider = new ethers.JsonRpcProvider(rpc);
    const signer = new ethers.Wallet(pk, provider);

    console.log("Submitting with account:", await signer.getAddress());
    console.log("Account balance:", ethers.formatEther(await provider.getBalance(await signer.getAddress())), "C2FLR\n");

    // Initialize FDC client
    const fdcClient = new FDCClient(provider, signer);

    // WR data for the demo
    const wrId = "WR-REAL-FDC-001";
    const wrHash = ethers.keccak256(ethers.toUtf8Bytes("real-fdc-warehouse-receipt-content"));
    const fileCid = "QmRealFDCCid123456789";
    const issuerId = "ISSUER-REAL-FDC-001";

    console.log("📋 FDC Request Parameters:");
    console.log("WR ID:", wrId);
    console.log("WR Hash:", wrHash);
    console.log("File CID:", fileCid);
    console.log("Issuer ID:", issuerId);
    console.log("");

    try {
        // Create warehouse receipt request
        console.log("🔸 Creating warehouse receipt request...");
        const warehouseRequest = createWarehouseReceiptRequest(wrId, wrHash, fileCid, issuerId);
        console.log("Warehouse request:", JSON.stringify(warehouseRequest, null, 2));
        console.log("");

        // Submit warehouse receipt request to FDC
        console.log("📝 Submitting warehouse receipt request to FDC...");
        const warehouseRequestId = await fdcClient.submitJsonApiRequest(
            warehouseRequest.url,
            warehouseRequest.method,
            warehouseRequest.headers,
            warehouseRequest.body,
            warehouseRequest.responsePath
        );
        console.log("✅ Warehouse receipt request submitted!");
        console.log("Request ID:", warehouseRequestId.toString());
        console.log("");

        // Create IPFS mirror request
        console.log("🔸 Creating IPFS mirror request...");
        const ipfsRequest = createIPFSMirrorRequest(fileCid);
        console.log("IPFS request:", JSON.stringify(ipfsRequest, null, 2));
        console.log("");

        // Submit IPFS mirror request to FDC
        console.log("📝 Submitting IPFS mirror request to FDC...");
        const ipfsRequestId = await fdcClient.submitJsonApiRequest(
            ipfsRequest.url,
            ipfsRequest.method,
            ipfsRequest.headers,
            ipfsRequest.body,
            ipfsRequest.responsePath
        );
        console.log("✅ IPFS mirror request submitted!");
        console.log("Request ID:", ipfsRequestId.toString());
        console.log("");

        // Wait for attestations to be ready
        console.log("⏳ Waiting for attestations to be ready...");
        console.log("This may take several minutes as FDC processes the requests...");
        
        const warehouseReady = await fdcClient.waitForAttestation(warehouseRequestId, 600000); // 10 minutes max
        const ipfsReady = await fdcClient.waitForAttestation(ipfsRequestId, 600000); // 10 minutes max

        if (!warehouseReady) {
            console.log("❌ Warehouse attestation timeout");
            process.exit(1);
        }

        if (!ipfsReady) {
            console.log("❌ IPFS attestation timeout");
            process.exit(1);
        }

        console.log("✅ Both attestations are ready!");
        console.log("");

        // Retrieve attestations
        console.log("🔸 Retrieving attestations from FDC...");
        
        const warehouseAttestation = await fdcClient.getAttestation(warehouseRequestId);
        console.log("✅ Warehouse attestation retrieved");
        console.log("Round ID:", warehouseAttestation.roundId.toString());
        console.log("Data length:", warehouseAttestation.data.length);
        console.log("Merkle root:", warehouseAttestation.merkleRoot);
        console.log("");

        const ipfsAttestation = await fdcClient.getAttestation(ipfsRequestId);
        console.log("✅ IPFS attestation retrieved");
        console.log("Round ID:", ipfsAttestation.roundId.toString());
        console.log("Data length:", ipfsAttestation.data.length);
        console.log("Merkle root:", ipfsAttestation.merkleRoot);
        console.log("");

        // Save attestation data for verification phase
        const attestationData = {
            wrId: wrId,
            wrHash: wrHash,
            fileCid: fileCid,
            issuerId: issuerId,
            warehouseRequestId: warehouseRequestId.toString(),
            ipfsRequestId: ipfsRequestId.toString(),
            warehouseAttestation: {
                roundId: warehouseAttestation.roundId.toString(),
                data: warehouseAttestation.data,
                merkleRoot: warehouseAttestation.merkleRoot,
                merkleProof: warehouseAttestation.merkleProof
            },
            ipfsAttestation: {
                roundId: ipfsAttestation.roundId.toString(),
                data: ipfsAttestation.data,
                merkleRoot: ipfsAttestation.merkleRoot,
                merkleProof: ipfsAttestation.merkleProof
            },
            submittedAt: new Date().toISOString()
        };

        writeFileSync('real-fdc-attestations.json', JSON.stringify(attestationData, null, 2));
        console.log("💾 Attestation data saved to real-fdc-attestations.json");
        console.log("");

        console.log("🎉 REAL FDC REQUESTS COMPLETED SUCCESSFULLY!");
        console.log("=============================================");
        console.log("✅ Warehouse receipt request submitted and attested");
        console.log("✅ IPFS mirror request submitted and attested");
        console.log("✅ Both attestations retrieved from FDC");
        console.log("✅ Data saved for verification phase");
        console.log("");
        console.log("💰 C2FLR tokens were used for FDC fees");
        console.log("📊 Final account balance:", ethers.formatEther(await provider.getBalance(await signer.getAddress())), "C2FLR");
        console.log("");
        console.log("🔗 Next steps:");
        console.log("1. Run verify-real-fdc-proofs.ts to verify the attestations");
        console.log("2. Mark WR_ISSUED milestone as attested");
        console.log("3. Release escrow funds");

    } catch (error: any) {
        console.error("❌ Error submitting FDC requests:", error.message);
        console.error("Stack trace:", error.stack);
        process.exit(1);
    }
}

main().catch((err) => {
    console.error("❌ Fatal error:", err);
    process.exitCode = 1;
});
