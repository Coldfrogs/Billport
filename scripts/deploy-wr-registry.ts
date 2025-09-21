import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { ethers as ethersLib } from "ethers";
import "dotenv/config";

async function main() {
  const rpc = process.env.COSTON2_RPC_URL;
  const pk = process.env.PRIVATE_KEY;
  if (!rpc || !pk) throw new Error("COSTON2_RPC_URL or PRIVATE_KEY not set in .env");

  const provider = new ethersLib.JsonRpcProvider(rpc);
  const signer = new ethersLib.Wallet(pk, provider);

  console.log("Deploying WRRegistry on Coston2 testnet...");
  console.log("Deploying with account:", await signer.getAddress());
  console.log("Account balance:", ethersLib.formatEther(await provider.getBalance(await signer.getAddress())), "C2FLR");

  // Load artifact
  const artifactPath = join(process.cwd(), "artifacts", "contracts", "WRRegistry.sol", "WRRegistry.json");
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
  const factory = new ethersLib.ContractFactory(artifact.abi, artifact.bytecode, signer);
  const contract = await factory.deploy();
  await contract.waitForDeployment?.();
  const address = contract.target || (contract as any).address;
  console.log("WRRegistry deployed to:", address);

  // Set IssuerRegistry address
  const issuerRegistryAddress = process.env.ISSUER_REGISTRY_ADDRESS || "0x697e71625d0d3DF8A7E944cf6E776DA1C7F4aa24";
  console.log("Setting IssuerRegistry address to:", issuerRegistryAddress);
  const tx = await contract.setIssuerRegistry(issuerRegistryAddress);
  await tx.wait();
  console.log("IssuerRegistry address set successfully");

  // Save address to scripts/addresses.json
  const addrFile = join(process.cwd(), "scripts", "addresses.json");
  let addrs = {};
  try { addrs = JSON.parse(readFileSync(addrFile, "utf8")); } catch { addrs = {}; }
  addrs["WRRegistry"] = address;
  writeFileSync(addrFile, JSON.stringify(addrs, null, 2));
  console.log("Saved address to scripts/addresses.json");
  console.log("Deployment completed successfully!");
}

main().catch((err) => { console.error(err); process.exitCode = 1; });
