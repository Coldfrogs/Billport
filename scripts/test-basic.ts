import "dotenv/config";
import { ethers as ethersLib } from "ethers";
import { readFileSync } from "fs";
import { join } from "path";

async function main() {
  console.log("🧪 Basic contract testing on Coston2...\n");

  const rpc = process.env.COSTON2_RPC_URL;
  const pk = process.env.PRIVATE_KEY;
  if (!rpc || !pk) throw new Error("COSTON2_RPC_URL or PRIVATE_KEY not set in .env");

  const provider = new ethersLib.JsonRpcProvider(rpc);
  const signer = new ethersLib.Wallet(pk, provider);

  console.log("Testing with account:", await signer.getAddress());
  console.log("Account balance:", ethersLib.formatEther(await provider.getBalance(await signer.getAddress())), "C2FLR\n");

// Test 1: Check account balance and network
console.log("🔸 Testing account and network...");
const balance = await provider.getBalance(await signer.getAddress());
const networkInfo = await provider.getNetwork();
console.log("✅ Account balance:", ethersLib.formatEther(balance), "C2FLR");
console.log("✅ Network name:", networkInfo.name);
console.log("✅ Chain ID:", networkInfo.chainId.toString());
console.log("");

// Test 2: Test basic transaction (this uses C2FLR for gas)
console.log("🔸 Testing basic transaction (using C2FLR for gas)...");
const balanceBefore = await provider.getBalance(await signer.getAddress());
console.log("Balance before transaction:", ethersLib.formatEther(balanceBefore), "C2FLR");

// Send a small amount to ourselves to test transaction
const tx = await signer.sendTransaction({
  to: await signer.getAddress(),
  value: ethersLib.parseEther("0.001"), // 0.001 C2FLR
  gasLimit: 21000
});

console.log("📝 Transaction sent:", tx.hash);
await tx.wait();
console.log("✅ Transaction confirmed!");

const balanceAfter = await provider.getBalance(await signer.getAddress());
console.log("Balance after transaction:", ethersLib.formatEther(balanceAfter), "C2FLR");
console.log("Gas used:", ethersLib.formatEther(balanceBefore - balanceAfter), "C2FLR");
console.log("");

// Test 3: Test contract deployment (this will use C2FLR for gas)
console.log("🔸 Testing contract deployment (using C2FLR for gas)...");
const balanceBeforeDeploy = await provider.getBalance(await signer.getAddress());
console.log("Balance before deployment:", ethersLib.formatEther(balanceBeforeDeploy), "C2FLR");

// Deploy a simple test contract
// Deploy a simple test contract (Counter)
const artifactPath = join(process.cwd(), "artifacts", "contracts", "Counter.sol", "Counter.json");
const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
const factory = new ethersLib.ContractFactory(artifact.abi, artifact.bytecode, signer);
const testContract = await factory.deploy();
await testContract.waitForDeployment?.();
const testContractAddress = testContract.target || (testContract as any).address;
console.log("✅ Test contract deployed to:", testContractAddress);

const balanceAfterDeploy = await provider.getBalance(await signer.getAddress());
console.log("Balance after deployment:", ethersLib.formatEther(balanceAfterDeploy), "C2FLR");
console.log("Deployment cost:", ethersLib.formatEther(balanceBeforeDeploy - balanceAfterDeploy), "C2FLR");
console.log("");

// Test 4: Test contract interaction (this will use C2FLR for gas)
console.log("🔸 Testing contract interaction (using C2FLR for gas)...");
const balanceBeforeInteraction = await provider.getBalance(await signer.getAddress());
console.log("Balance before interaction:", ethersLib.formatEther(balanceBeforeInteraction), "C2FLR");

// Call the increment function
const incTx = await testContract.inc();
await incTx.wait();
console.log("✅ Increment function called successfully!");

// Get the current value
const currentValue = await testContract.x();
console.log("✅ Current counter value:", currentValue.toString());

const balanceAfterInteraction = await provider.getBalance(await signer.getAddress());
console.log("Balance after interaction:", ethersLib.formatEther(balanceAfterInteraction), "C2FLR");
console.log("Interaction cost:", ethersLib.formatEther(balanceBeforeInteraction - balanceAfterInteraction), "C2FLR");
console.log("");

// Test 5: Test multiple transactions to show C2FLR usage
console.log("🔸 Testing multiple transactions (showing C2FLR usage)...");
const balanceBeforeMultiple = await provider.getBalance(await signer.getAddress());
console.log("Balance before multiple transactions:", ethersLib.formatEther(balanceBeforeMultiple), "C2FLR");

// Perform multiple operations
for (let i = 0; i < 3; i++) {
    const tx = await testContract.incBy(1);
    await tx.wait();
    console.log(`✅ Transaction ${i + 1} completed`);
}

const balanceAfterMultiple = await provider.getBalance(await signer.getAddress());
console.log("Balance after multiple transactions:", ethersLib.formatEther(balanceAfterMultiple), "C2FLR");
console.log("Total cost for multiple transactions:", ethersLib.formatEther(balanceBeforeMultiple - balanceAfterMultiple), "C2FLR");

const finalValue = await testContract.x();
console.log("✅ Final counter value:", finalValue.toString());
console.log("");

console.log("🎉 Basic testing completed successfully!");
console.log("💰 C2FLR tokens were used for all gas fees throughout the testing process");
console.log("📊 Final account balance:", ethersLib.formatEther(await provider.getBalance(await signer.getAddress())), "C2FLR");
console.log("🔗 Test contract address:", testContractAddress);

}

main().catch((err) => { console.error(err); process.exitCode = 1; });
