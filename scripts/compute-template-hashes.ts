import { ethers } from "ethers";
import fs from "fs";
import path from "path";

console.log("🔍 Computing request template hashes...\n");

// Read template files
const warehouseTemplate = JSON.parse(fs.readFileSync(path.join(__dirname, "../templates/warehouse-api-request.json"), "utf8"));
const ipfsTemplate = JSON.parse(fs.readFileSync(path.join(__dirname, "../templates/ipfs-mirror-request.json"), "utf8"));

// Function to compute deterministic hash from template
function computeTemplateHash(template: any): string {
    // Create a deterministic string representation
    const templateString = JSON.stringify({
        url: template.url,
        method: template.method,
        headers: template.headers,
        queryParams: template.queryParams,
        responseMapping: template.responseMapping
    }, null, 0); // No formatting for consistency
    
    return ethers.keccak256(ethers.toUtf8Bytes(templateString));
}

// Compute hashes
const warehouseTemplateHash = computeTemplateHash(warehouseTemplate);
const ipfsTemplateHash = computeTemplateHash(ipfsTemplate);

console.log("📋 Template Information:");
console.log("Warehouse API Template:");
console.log("  - Name:", warehouseTemplate.name);
console.log("  - URL:", warehouseTemplate.url);
console.log("  - Method:", warehouseTemplate.method);
console.log("  - Template Hash:", warehouseTemplateHash);
console.log("");

console.log("IPFS Mirror Template:");
console.log("  - Name:", ipfsTemplate.name);
console.log("  - URL:", ipfsTemplate.url);
console.log("  - Method:", ipfsTemplate.method);
console.log("  - Template Hash:", ipfsTemplateHash);
console.log("");

// Save template hashes to file
const templateHashes = {
    warehouseApi: {
        hash: warehouseTemplateHash,
        template: warehouseTemplate
    },
    ipfsMirror: {
        hash: ipfsTemplateHash,
        template: ipfsTemplate
    },
    computedAt: new Date().toISOString()
};

fs.writeFileSync(
    path.join(__dirname, "../templates/template-hashes.json"), 
    JSON.stringify(templateHashes, null, 2)
);

console.log("✅ Template hashes computed and saved to templates/template-hashes.json");
console.log("🔗 These hashes will be used to prevent parameter tampering in FDC requests");
