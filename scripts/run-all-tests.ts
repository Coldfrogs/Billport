import { network } from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("🚀 PROOF-OF-TRADE COMPREHENSIVE TEST RUNNER");
  console.log("=" .repeat(80));
  console.log("This script will run all test phases except Phase 2 (FDC integration)");
  console.log("=" .repeat(80));
  
  const { ethers: hardhatEthers } = await network.connect({
    network: "coston2",
    chainType: "l1",
  });

  const [deployer] = await hardhatEthers.getSigners();
  console.log(`\n🔸 Running tests with account: ${deployer.address}`);
  
  const initialBalance = await hardhatEthers.provider.getBalance(deployer.address);
  console.log(`💰 Initial balance: ${ethers.formatEther(initialBalance)} C2FLR\n`);
  
  const testResults = {
    phase0: { status: "pending", duration: 0, gasUsed: 0 },
    phase1: { status: "pending", duration: 0, gasUsed: 0 },
    phase3: { status: "pending", duration: 0, gasUsed: 0 },
    phase4: { status: "pending", duration: 0, gasUsed: 0 },
    phase5: { status: "pending", duration: 0, gasUsed: 0 },
  };
  
  try {
    // Phase 0: Environment Setup
    console.log("🧪 RUNNING PHASE 0: ENVIRONMENT SETUP TESTS");
    console.log("=" .repeat(60));
    const phase0Start = Date.now();
    const phase0Balance = await hardhatEthers.provider.getBalance(deployer.address);
    
    await runPhase0Tests();
    
    const phase0End = Date.now();
    const phase0FinalBalance = await hardhatEthers.provider.getBalance(deployer.address);
    testResults.phase0 = {
      status: "passed",
      duration: phase0End - phase0Start,
      gasUsed: phase0Balance - phase0FinalBalance
    };
    
    console.log(`✅ Phase 0 completed in ${phase0End - phase0Start}ms`);
    console.log(`💰 Gas used: ${ethers.formatEther(phase0Balance - phase0FinalBalance)} C2FLR\n`);
    
    // Phase 1: Core Contracts
    console.log("🧪 RUNNING PHASE 1: CORE CONTRACTS TESTS");
    console.log("=" .repeat(60));
    const phase1Start = Date.now();
    const phase1Balance = await hardhatEthers.provider.getBalance(deployer.address);
    
    await runPhase1Tests();
    
    const phase1End = Date.now();
    const phase1FinalBalance = await hardhatEthers.provider.getBalance(deployer.address);
    testResults.phase1 = {
      status: "passed",
      duration: phase1End - phase1Start,
      gasUsed: phase1Balance - phase1FinalBalance
    };
    
    console.log(`✅ Phase 1 completed in ${phase1End - phase1Start}ms`);
    console.log(`💰 Gas used: ${ethers.formatEther(phase1Balance - phase1FinalBalance)} C2FLR\n`);
    
    // Phase 3: XRPL Integration
    console.log("🧪 RUNNING PHASE 3: XRPL INTEGRATION TESTS");
    console.log("=" .repeat(60));
    const phase3Start = Date.now();
    const phase3Balance = await hardhatEthers.provider.getBalance(deployer.address);
    
    await runPhase3Tests();
    
    const phase3End = Date.now();
    const phase3FinalBalance = await hardhatEthers.provider.getBalance(deployer.address);
    testResults.phase3 = {
      status: "passed",
      duration: phase3End - phase3Start,
      gasUsed: phase3Balance - phase3FinalBalance
    };
    
    console.log(`✅ Phase 3 completed in ${phase3End - phase3Start}ms`);
    console.log(`💰 Gas used: ${ethers.formatEther(phase3Balance - phase3FinalBalance)} C2FLR\n`);
    
    // Phase 4: End-to-End Flow
    console.log("🧪 RUNNING PHASE 4: END-TO-END FLOW TESTS");
    console.log("=" .repeat(60));
    const phase4Start = Date.now();
    const phase4Balance = await hardhatEthers.provider.getBalance(deployer.address);
    
    await runPhase4Tests();
    
    const phase4End = Date.now();
    const phase4FinalBalance = await hardhatEthers.provider.getBalance(deployer.address);
    testResults.phase4 = {
      status: "passed",
      duration: phase4End - phase4Start,
      gasUsed: phase4Balance - phase4FinalBalance
    };
    
    console.log(`✅ Phase 4 completed in ${phase4End - phase4Start}ms`);
    console.log(`💰 Gas used: ${ethers.formatEther(phase4Balance - phase4FinalBalance)} C2FLR\n`);
    
    // Phase 5: Negative Tests
    console.log("🧪 RUNNING PHASE 5: NEGATIVE TESTS");
    console.log("=" .repeat(60));
    const phase5Start = Date.now();
    const phase5Balance = await hardhatEthers.provider.getBalance(deployer.address);
    
    await runPhase5Tests();
    
    const phase5End = Date.now();
    const phase5FinalBalance = await hardhatEthers.provider.getBalance(deployer.address);
    testResults.phase5 = {
      status: "passed",
      duration: phase5End - phase5Start,
      gasUsed: phase5Balance - phase5FinalBalance
    };
    
    console.log(`✅ Phase 5 completed in ${phase5End - phase5Start}ms`);
    console.log(`💰 Gas used: ${ethers.formatEther(phase5Balance - phase5FinalBalance)} C2FLR\n`);
    
    // Final Results
    const finalBalance = await hardhatEthers.provider.getBalance(deployer.address);
    const totalGasUsed = initialBalance - finalBalance;
    const totalDuration = Date.now() - (phase0Start);
    
    console.log("🎉 ALL TESTS COMPLETED SUCCESSFULLY!");
    console.log("=" .repeat(80));
    console.log("📊 TEST RESULTS SUMMARY:");
    console.log("=" .repeat(80));
    
    Object.entries(testResults).forEach(([phase, result]) => {
      const status = result.status === "passed" ? "✅ PASSED" : "❌ FAILED";
      const duration = `${result.duration}ms`;
      const gasUsed = `${ethers.formatEther(result.gasUsed)} C2FLR`;
      console.log(`${phase.toUpperCase()}: ${status} | Duration: ${duration} | Gas: ${gasUsed}`);
    });
    
    console.log("=" .repeat(80));
    console.log(`📈 TOTAL DURATION: ${totalDuration}ms`);
    console.log(`💰 TOTAL GAS USED: ${ethers.formatEther(totalGasUsed)} C2FLR`);
    console.log(`💰 FINAL BALANCE: ${ethers.formatEther(finalBalance)} C2FLR`);
    console.log("=" .repeat(80));
    console.log("🎯 PROOF-OF-TRADE SYSTEM IS FULLY FUNCTIONAL!");
    console.log("✅ All core features working correctly");
    console.log("✅ Security measures properly implemented");
    console.log("✅ C2FLR token usage demonstrated");
    console.log("✅ Ready for hackathon submission");
    console.log("=" .repeat(80));
    
  } catch (error) {
    console.error("\n❌ TEST SUITE FAILED:", error);
    console.log("\n📊 PARTIAL RESULTS:");
    Object.entries(testResults).forEach(([phase, result]) => {
      const status = result.status === "passed" ? "✅ PASSED" : "❌ FAILED";
      console.log(`${phase.toUpperCase()}: ${status}`);
    });
    process.exitCode = 1;
  }
}

async function runPhase0Tests() {
  // Import and run Phase 0 tests
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec.exec);
  
  try {
    const { stdout, stderr } = await execAsync('npx hardhat run scripts/test-phase0-environment.ts --network coston2');
    console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    throw new Error(`Phase 0 tests failed: ${error.message}`);
  }
}

async function runPhase1Tests() {
  // Import and run Phase 1 tests
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec.default);
  
  try {
    const { stdout, stderr } = await execAsync('npx hardhat run scripts/test-phase1-contracts.ts --network coston2');
    console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    throw new Error(`Phase 1 tests failed: ${error.message}`);
  }
}

async function runPhase3Tests() {
  // Import and run Phase 3 tests
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec.default);
  
  try {
    const { stdout, stderr } = await execAsync('npx hardhat run scripts/test-phase3-xrpl.ts --network coston2');
    console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    throw new Error(`Phase 3 tests failed: ${error.message}`);
  }
}

async function runPhase4Tests() {
  // Import and run Phase 4 tests
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec.default);
  
  try {
    const { stdout, stderr } = await execAsync('npx hardhat run scripts/test-phase4-end-to-end.ts --network coston2');
    console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    throw new Error(`Phase 4 tests failed: ${error.message}`);
  }
}

async function runPhase5Tests() {
  // Import and run Phase 5 tests
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec.default);
  
  try {
    const { stdout, stderr } = await execAsync('npx hardhat run scripts/test-phase5-negative.ts --network coston2');
    console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    throw new Error(`Phase 5 tests failed: ${error.message}`);
  }
}

main().catch((error) => {
  console.error("❌ Test runner failed:", error);
  process.exitCode = 1;
});
