import { network } from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("🔧 Setting up WRRegistry with IssuerRegistry address...");
  
  const { ethers: hardhatEthers } = await network.connect({
    network: "coston2",
    chainType: "l1",
  });

  const [deployer] = await hardhatEthers.getSigners();
  console.log(`Using account: ${deployer.address}`);
  
  // Contract addresses
  const WR_REGISTRY = "0x3b3fc290d50058e85953aAC0243ce80A35FC200a";
  const ISSUER_REGISTRY = "0x16B717120d41910313A0ca28AF8746a17e732462";
  
  // Get WRRegistry contract
  const wrRegistry = await hardhatEthers.getContractAt("WRRegistry", WR_REGISTRY);
  
  // Set IssuerRegistry address
  const setTx = await wrRegistry.setIssuerRegistry(ISSUER_REGISTRY);
  await setTx.wait();
  console.log(`✅ IssuerRegistry address set to: ${ISSUER_REGISTRY}`);
  
  // Verify the address was set
  const setAddress = await wrRegistry.issuerRegistry();
  console.log(`✅ Verified IssuerRegistry address: ${setAddress}`);
  
  console.log("✅ WRRegistry setup completed!");
}

main().catch((error) => {
  console.error("❌ Setup failed:", error);
  process.exitCode = 1;
});
