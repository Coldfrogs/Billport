import { readFileSync } from "fs";
import { join } from "path";
import { ethers as ethersLib } from "ethers";
import "dotenv/config";

async function main() {
  const rpc = process.env.COSTON2_RPC_URL;
  const pk = process.env.PRIVATE_KEY;
  if (!rpc || !pk) throw new Error("COSTON2_RPC_URL or PRIVATE_KEY not set in .env");

  console.log("Deploying ProofRegistry using direct ethers client...");
  const provider = new ethersLib.JsonRpcProvider(rpc);
  const signer = new ethersLib.Wallet(pk, provider);
  console.log("Deployer:", await signer.getAddress());
  console.log("Balance:", ethersLib.formatEther(await provider.getBalance(await signer.getAddress())));

  const maxAgeEpochs = 8;

  // Load compiled artifact
  const artifactPath = join(process.cwd(), "artifacts", "contracts", "ProofRegistry.sol", "ProofRegistry.json");
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
  const factory = new ethersLib.ContractFactory(artifact.abi, artifact.bytecode, signer);

  console.log("Deploying ProofRegistry contract...");
  const contract = await factory.deploy(maxAgeEpochs);
  await contract.waitForDeployment?.();

  const address = contract.target || contract.address || (contract as any).getAddress?.();
  console.log("ProofRegistry deployed to:", address);

  console.log("Setting deployer as Flare Systems Manager...");
  const tx = await contract.setFlareSystemsManager(await signer.getAddress());
  await tx.wait();
  console.log("Flare Systems Manager set successfully");

  const currentMaxAge = await contract.maxAgeEpochs();
  console.log("Max age epochs:", currentMaxAge.toString());
  const currentEpoch = await contract.getCurrentEpoch();
  console.log("Current epoch:", currentEpoch.toString());

  console.log("Deployment completed successfully!");
  console.log("Save this address for future use:", address);
}

main().catch((err) => { console.error(err); process.exitCode = 1; });
