import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { ethers } from "ethers";

function readArtifact(contractName: string) {
  const p = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    `${contractName}.sol`,
    `${contractName}.json`
  );
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}

async function compare(name: string, address: string, provider: ethers.Provider) {
  console.log(`\n== ${name} @ ${address}`);
  const artifact = readArtifact(name);
  const local = artifact.deployedBytecode as string;
  const onchain = await provider.getCode(address);
  if (!onchain || onchain === "0x") {
    console.log("No code at address (empty)");
    return;
  }
  console.log(`Local deployedBytecode length: ${local.length} bytes`);
  console.log(`On-chain bytecode length:      ${onchain.length} bytes`);
  if (local === onchain) {
    console.log("✅ Bytecode matches exactly.");
    return;
  }
  console.log("❌ Bytecode differs. Showing first differing byte index:");
  const a = local.replace(/^0x/, "");
  const b = onchain.replace(/^0x/, "");
  // locate metadata marker (start of swarm/ipfs metadata) so we can inspect executable code portion
  const metaMarker = "a26469706673"; // common pattern in solidity metadata
  const metaIdxA = a.indexOf(metaMarker);
  const metaIdxB = b.indexOf(metaMarker);
  const codeA = metaIdxA === -1 ? a : a.slice(0, metaIdxA);
  const codeB = metaIdxB === -1 ? b : b.slice(0, metaIdxB);
  const findByte = (hexStr: string, byteHex: string) => {
    const idx = hexStr.indexOf(byteHex);
    if (idx === -1) return -1;
    return idx / 2;
  };
  const byteToFind = "5e";
  const first5eLocal = findByte(codeA, byteToFind);
  const first5eOnchain = findByte(codeB, byteToFind);
  if (first5eOnchain !== -1) {
    console.log(`On-chain bytecode contains 0x5e at byte index ${first5eOnchain}`);
  } else {
    console.log("On-chain bytecode does not contain 0x5e in pre-metadata code portion");
  }
  if (first5eLocal !== -1) {
    console.log(`Local bytecode contains 0x5e at byte index ${first5eLocal}`);
  } else {
    console.log("Local bytecode does not contain 0x5e in pre-metadata code portion");
  }
  const min = Math.min(a.length, b.length);
  let idx = -1;
  for (let i = 0; i < min; i += 2) {
    if (a.slice(i, i + 2) !== b.slice(i, i + 2)) {
      idx = i / 2;
      break;
    }
  }
  if (idx === -1) {
    console.log("Bytecode differs only by length or metadata.");
    console.log(`Local (truncated): 0x${a.slice(0, 200)}`);
    console.log(`Onchain (truncated): 0x${b.slice(0, 200)}`);
  } else {
    console.log(`First different byte index: ${idx}`);
    console.log(`Local byte:  0x${a.slice(idx * 2, idx * 2 + 2)}`);
    console.log(`Onchain byte: 0x${b.slice(idx * 2, idx * 2 + 2)}`);
    console.log(`Context (local):  0x${a.slice(Math.max(0, idx * 2 - 20), idx * 2 + 20)}`);
    console.log(`Context (onchain): 0x${b.slice(Math.max(0, idx * 2 - 20), idx * 2 + 20)}`);
  }
}

async function main() {
  const providerUrl = process.env.COSTON2_RPC_URL;
  if (!providerUrl) {
    console.error("COSTON2_RPC_URL not set in environment");
    process.exit(1);
  }
  const provider = new ethers.JsonRpcProvider(providerUrl);

  const addressesPath = path.join(__dirname, "addresses.json");
  let addresses: Record<string, string> = {};
  if (fs.existsSync(addressesPath)) {
    addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
  } else {
    try {
      addresses = JSON.parse(
        fs.readFileSync(path.join(__dirname, "..", "scripts", "addresses.json"), "utf8")
      );
    } catch (e) {
      // try repo root
      try {
        addresses = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "addresses.json"), "utf8"));
      } catch (e2) {
        console.error("Cannot find addresses.json in scripts or root; please provide addresses.");
        process.exit(1);
      }
    }
  }

  const targets = [
    { name: "ProofRegistry", key: "ProofRegistry" },
    { name: "WRRegistry", key: "WRRegistry" },
  ];

  for (const t of targets) {
    const addr = (addresses as any)[t.key];
    if (!addr) {
      console.log(`Skipping ${t.name}: no address entry for key ${t.key}`);
      continue;
    }
    await compare(t.name, addr, provider);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
