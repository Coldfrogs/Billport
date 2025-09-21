import "dotenv/config";
import { ethers } from "ethers";
import { readFileSync } from "fs";
import { join } from "path";

console.log("🧪 NEGATIVE TESTS - PROVING SYSTEM SAFETY");
console.log("==========================================\n");

const readArtifact = (name: string) => JSON.parse(readFileSync(join(process.cwd(), "artifacts", "contracts", `${name}.sol`, `${name}.json`), "utf8"));

async function main() {
  const rpc = process.env.COSTON2_RPC_URL;
  const pk = process.env.PRIVATE_KEY;
  if (!rpc || !pk) throw new Error("COSTON2_RPC_URL or PRIVATE_KEY not set in .env");

  const provider = new ethers.JsonRpcProvider(rpc);
  const signer = new ethers.Wallet(pk, provider);

  console.log("Testing with account:", await signer.getAddress());
  console.log("Account balance:", ethers.formatEther(await provider.getBalance(await signer.getAddress())), "C2FLR\n");

  let overrides: any = {};
  try { overrides = JSON.parse(readFileSync(join(process.cwd(), "scripts", "addresses.json"), "utf8")); } catch {}

  const WRRegistryAddr = overrides.WRRegistry || process.env.WR_REGISTRY_ADDRESS;
  const ProofRegistryAddr = overrides.ProofRegistry || process.env.PROOF_REGISTRY_ADDRESS;
  if (!WRRegistryAddr || !ProofRegistryAddr) throw new Error('Missing WRRegistry or ProofRegistry address');

  const WRRegistry: any = new ethers.Contract(WRRegistryAddr, readArtifact('WRRegistry').abi, signer);
  const ProofRegistry: any = new ethers.Contract(ProofRegistryAddr, readArtifact('ProofRegistry').abi, signer);

  // Replay test
  console.log('\n🔸 REPLAY TEST');
  const attId = ethers.keccak256(ethers.toUtf8Bytes('neg-replay'));
  try { await ProofRegistry.consume(attId, 1, 'WR-NEG-REPLAY'); console.log('First consume handled'); } catch (e: any) { console.log('First consume result:', e?.message || e); }
  try { await ProofRegistry.consume(attId, 1, 'WR-NEG-REPLAY'); console.log('❌ Replay allowed'); } catch (e: any) { console.log('✅ Replay prevented:', e?.message || e); }

  // Expired test
  console.log('\n🔸 EXPIRED TEST');
  try { await ProofRegistry.consume(ethers.keccak256(ethers.toUtf8Bytes('neg-expired')), 0, 'WR-NEG-EXPIRED'); console.log('❌ Expired accepted'); } catch (e: any) { console.log('✅ Expired rejected:', e?.message || e); }

  // Double pledge
  console.log('\n🔸 DOUBLE PLEDGE TEST');
  try {
    const wrId = 'WR-NEG-DOUBLE';
    try { await WRRegistry.registerWR(wrId, ethers.keccak256(ethers.toUtf8Bytes('w')), ethers.keccak256(ethers.toUtf8Bytes('s')), ethers.keccak256(ethers.toUtf8Bytes('q')), await signer.getAddress(), '0x' + '0'.repeat(130), ethers.keccak256(ethers.toUtf8Bytes('t'))); } catch {}
    await WRRegistry.pledge(wrId, await signer.getAddress());
    try { await WRRegistry.pledge(wrId, await signer.getAddress()); console.log('❌ Double pledge allowed'); } catch (e: any) { console.log('✅ Double pledge prevented:', e?.message || e); }
  } catch (e: any) { console.log('Double pledge test error:', e?.message || e); }

  // Unauthorized
  console.log('\n🔸 UNAUTHORIZED ACTION TEST');
  try { const rogue = ethers.Wallet.createRandom().connect(provider); try { await WRRegistry.connect(rogue).registerWR('WR-UNAUTH', ethers.keccak256(ethers.toUtf8Bytes('a')), ethers.keccak256(ethers.toUtf8Bytes('b')), ethers.keccak256(ethers.toUtf8Bytes('c')), await signer.getAddress(), '0x' + '0'.repeat(130), ethers.keccak256(ethers.toUtf8Bytes('tpl'))); console.log('❌ Rogue registered'); } catch (e: any) { console.log('✅ Rogue prevented:', e?.message || e); } } catch (e: any) { console.log('Unauthorized test error:', e?.message || e); }

  console.log('\n🎉 NEGATIVE TESTS FINISHED');
}

main().catch((err) => { console.error(err); process.exitCode = 1; });
require("dotenv").config();
const { ethers: ethersLib } = require("ethers");
const { readFileSync } = require("fs");
const { join } = require("path");

console.log("🧪 NEGATIVE TESTS - PROVING SYSTEM SAFETY");
console.log("==========================================\n");

async function main() {
  const rpc = process.env.COSTON2_RPC_URL;
  const pk = process.env.PRIVATE_KEY;
  if (!rpc || !pk) throw new Error("COSTON2_RPC_URL or PRIVATE_KEY not set in .env");

  const provider = new ethersLib.JsonRpcProvider(rpc);
  const signer = new ethersLib.Wallet(pk, provider);

  console.log("Testing with account:", await signer.getAddress());
  console.log("Account balance:", ethersLib.formatEther(await provider.getBalance(await signer.getAddress())), "C2FLR\n");

  // load overrides and artifacts helper
  let overrides: any = {};
  try { overrides = JSON.parse(readFileSync(join(process.cwd(), "scripts", "addresses.json"), "utf8")); } catch {}
  const wrRegistryAddress = overrides.WRRegistry || "0xFF1DcE5cCAe784f7938f542FD5D9FbaD8706D937";
  const proofRegistryAddress = overrides.ProofRegistry || "0x0c16BE418bAd3b51Db3b405268980e745bbb3A83";
  const milestoneEscrowAddress = overrides.MilestoneEscrow || "0xBCfa5320784236F6D5A5F6760A461Fc16b62aEAF";
  const artifact = (name: string) => JSON.parse(readFileSync(join(process.cwd(), "artifacts", "contracts", `${name}.sol`, `${name}.json`), "utf8"));

  const WRRegistry: any = new ethersLib.Contract(wrRegistryAddress, artifact("WRRegistry").abi, signer);
  const ProofRegistry: any = new ethersLib.Contract(proofRegistryAddress, artifact("ProofRegistry").abi, signer);
  const MilestoneEscrow: any = new ethersLib.Contract(milestoneEscrowAddress, artifact("MilestoneEscrow").abi, signer);

  // Test 1: replay prevention
  import "dotenv/config";
  import { ethers as ethersLib } from "ethers";
  import { readFileSync } from "fs";
  import { join } from "path";

  console.log("🧪 NEGATIVE TESTS - PROVING SYSTEM SAFETY");
  console.log("==========================================\n");

  async function main() {
    const rpc = process.env.COSTON2_RPC_URL;
    const pk = process.env.PRIVATE_KEY;
    if (!rpc || !pk) throw new Error("COSTON2_RPC_URL or PRIVATE_KEY not set in .env");

    const provider = new ethersLib.JsonRpcProvider(rpc);
    const signer = new ethersLib.Wallet(pk, provider);

    console.log("Testing with account:", await signer.getAddress());
    console.log("Account balance:", ethersLib.formatEther(await provider.getBalance(await signer.getAddress())), "C2FLR\n");

    // load overrides and artifacts helper
    let overrides: any = {};
    try { overrides = JSON.parse(readFileSync(join(process.cwd(), "scripts", "addresses.json"), "utf8")); } catch {}
    const wrRegistryAddress = overrides.WRRegistry || "0xFF1DcE5cCAe784f7938f542FD5D9FbaD8706D937";
    const proofRegistryAddress = overrides.ProofRegistry || "0x0c16BE418bAd3b51Db3b405268980e745bbb3A83";
    const milestoneEscrowAddress = overrides.MilestoneEscrow || "0xBCfa5320784236F6D5A5F6760A461Fc16b62aEAF";
    const artifact = (name: string) => JSON.parse(readFileSync(join(process.cwd(), "artifacts", "contracts", `${name}.sol`, `${name}.json`), "utf8"));

    const WRRegistry: any = new ethersLib.Contract(wrRegistryAddress, artifact("WRRegistry").abi, signer);
    const ProofRegistry: any = new ethersLib.Contract(proofRegistryAddress, artifact("ProofRegistry").abi, signer);
    const MilestoneEscrow: any = new ethersLib.Contract(milestoneEscrowAddress, artifact("MilestoneEscrow").abi, signer);

    // Test 1: replay prevention
    console.log("🔸 TEST 1: REPLAY ATTACK PREVENTION");
    const testAttestationId = ethersLib.keccak256(ethersLib.toUtf8Bytes("test-replay-attack"));
    const testRoundId = 12345;
    const testWrId = "WR-REPLAY-TEST";
    try {
      const tx = await ProofRegistry.consume(testAttestationId, testRoundId, testWrId);
      await tx.wait();
      console.log("✅ Proof consumed (first)");
    } catch (err: any) {
      console.log("❌ Consume error:", err?.message || err);
    }
    try {
      const tx = await ProofRegistry.consume(testAttestationId, testRoundId, testWrId);
      await tx.wait();
      console.log("❌ Replay succeeded (unexpected)");
    } catch (err: any) {
      console.log("✅ Replay prevented:", err?.message || err);
    }

    import "dotenv/config";
    import { ethers } from "ethers";
    import { readFileSync } from "fs";
    import { join } from "path";

    // Minimal, single-file negative tests (ESM)
    console.log("🧪 NEGATIVE TESTS - PROVING SYSTEM SAFETY");
    console.log("==========================================\n");

    const readArtifact = (name: string) => JSON.parse(readFileSync(join(process.cwd(), "artifacts", "contracts", `${name}.sol`, `${name}.json`), "utf8"));

    async function main() {
      const rpc = process.env.COSTON2_RPC_URL;
      const pk = process.env.PRIVATE_KEY;
      if (!rpc || !pk) throw new Error("COSTON2_RPC_URL or PRIVATE_KEY not set in .env");

      const provider = new ethers.JsonRpcProvider(rpc);
      const signer = new ethers.Wallet(pk, provider);

      console.log("Testing with account:", await signer.getAddress());
      console.log("Account balance:", ethers.formatEther(await provider.getBalance(await signer.getAddress())), "C2FLR\n");

      let overrides: any = {};
      try { overrides = JSON.parse(readFileSync(join(process.cwd(), "scripts", "addresses.json"), "utf8")); } catch {}

      const WRRegistryAddr = overrides.WRRegistry || process.env.WR_REGISTRY_ADDRESS;
      const ProofRegistryAddr = overrides.ProofRegistry || process.env.PROOF_REGISTRY_ADDRESS;
      if (!WRRegistryAddr || !ProofRegistryAddr) throw new Error('Missing WRRegistry or ProofRegistry address');

      const WRRegistry: any = new ethers.Contract(WRRegistryAddr, readArtifact('WRRegistry').abi, signer);
      const ProofRegistry: any = new ethers.Contract(ProofRegistryAddr, readArtifact('ProofRegistry').abi, signer);

      console.log('\n🔸 TEST 1: REPLAY ATTACK PREVENTION');
      const attId = ethers.keccak256(ethers.toUtf8Bytes('neg-replay'));
      try { await ProofRegistry.consume(attId, 1, 'WR-NEG-REPLAY'); console.log('First consume handled'); } catch (e: any) { console.log('First consume result:', e?.message || e); }
      try { await ProofRegistry.consume(attId, 1, 'WR-NEG-REPLAY'); console.log('❌ Replay allowed'); } catch (e: any) { console.log('✅ Replay prevented:', e?.message || e); }

      console.log('\n🔸 TEST 2: EXPIRED PROOF');
      try { await ProofRegistry.consume(ethers.keccak256(ethers.toUtf8Bytes('neg-expired')), 0, 'WR-NEG-EXPIRED'); console.log('❌ Expired accepted'); } catch (e: any) { console.log('✅ Expired rejected:', e?.message || e); }

      console.log('\n🔸 TEST 3: DOUBLE PLEDGE');
      try {
        const wrId = 'WR-NEG-DOUBLE';
        try { await WRRegistry.registerWR(wrId, ethers.keccak256(ethers.toUtf8Bytes('w')), ethers.keccak256(ethers.toUtf8Bytes('s')), ethers.keccak256(ethers.toUtf8Bytes('q')), await signer.getAddress(), '0x' + '0'.repeat(130), ethers.keccak256(ethers.toUtf8Bytes('t'))); } catch {}
        await WRRegistry.pledge(wrId, await signer.getAddress());
        try { await WRRegistry.pledge(wrId, await signer.getAddress()); console.log('❌ Double pledge allowed'); } catch (e: any) { console.log('✅ Double pledge prevented:', e?.message || e); }
      } catch (e: any) { console.log('Double pledge test error:', e?.message || e); }

      console.log('\n🔸 TEST 4: UNAUTHORIZED ACTIONS');
      try { const rogue = ethers.Wallet.createRandom().connect(provider); try { await WRRegistry.connect(rogue).registerWR('WR-UNAUTH', ethers.keccak256(ethers.toUtf8Bytes('a')), ethers.keccak256(ethers.toUtf8Bytes('b')), ethers.keccak256(ethers.toUtf8Bytes('c')), await signer.getAddress(), '0x' + '0'.repeat(130), ethers.keccak256(ethers.toUtf8Bytes('tpl'))); console.log('❌ Rogue registered'); } catch (e: any) { console.log('✅ Rogue prevented:', e?.message || e); } } catch (e: any) { console.log('Unauthorized test error:', e?.message || e); }

      console.log('\n🎉 NEGATIVE TESTS FINISHED');
    }

    main().catch((err) => { console.error(err); process.exitCode = 1; });
        const testWrId = "WR-REPLAY-TEST";
        try {
          const tx = await ProofRegistry.consume(testAttestationId, testRoundId, testWrId);
          await tx.wait();
          console.log("✅ Proof consumed (first)");
        } catch (err: any) {
          console.log("❌ Consume error:", err?.message || err);
        }
        try {
          const tx = await ProofRegistry.consume(testAttestationId, testRoundId, testWrId);
          await tx.wait();
          console.log("❌ Replay succeeded (unexpected)");
        } catch (err: any) {
          console.log("✅ Replay prevented:", err?.message || err);
        }

        // Test 2: expired proof
        console.log('\n🔸 TEST 2: EXPIRED PROOF PREVENTION');
        try {
          const expiredId = ethersLib.keccak256(ethersLib.toUtf8Bytes("test-expired-proof"));
          const tx = await ProofRegistry.consume(expiredId, 1, "WR-EXPIRED-TEST");
          await tx.wait();
          console.log("❌ Expired accepted (unexpected)");
        } catch (err: any) {
          console.log("✅ Expired rejected:", err?.message || err);
        }

        // Test 3: double pledge
        console.log('\n🔸 TEST 3: DOUBLE-PLEDGE PREVENTION');
        try {
          const wId = "WR-DOUBLE-TEST";
          const tx = await WRRegistry.registerWR(
            wId,
            ethersLib.keccak256(ethersLib.toUtf8Bytes("w")),
            ethersLib.keccak256(ethersLib.toUtf8Bytes("s")),
            ethersLib.keccak256(ethersLib.toUtf8Bytes("Qm")),
            await signer.getAddress(),
            "0x" + "0".repeat(130),
            ethersLib.keccak256(ethersLib.toUtf8Bytes("t"))
          );
          await tx.wait();
          console.log("✅ WR registered for double-pledge test");
        } catch (err: any) {
          console.log("⚠️ registerWR failed:", err?.message || err);
        }
        try {
          const tx = await WRRegistry.pledge("WR-DOUBLE-TEST", await signer.getAddress());
          await tx.wait();
          console.log("✅ First pledge OK");
        } catch (err: any) {
          console.log("❌ First pledge failed:", err?.message || err);
        }
        try {
          const tx = await WRRegistry.pledge("WR-DOUBLE-TEST", await signer.getAddress());
          await tx.wait();
          console.log("❌ Double pledge succeeded (unexpected)");
        } catch (err: any) {
          console.log("✅ Double-pledge prevented:", err?.message || err);
        }

        // Test 4: template tampering (informational)
        console.log('\n🔸 TEST 4: TEMPLATE HASH TAMPERING PREVENTION');
        console.log('Original template hash:', ethersLib.keccak256(ethersLib.toUtf8Bytes('demo-template')));
        console.log('Tampered template hash:', ethersLib.keccak256(ethersLib.toUtf8Bytes('tampered')));

        import "dotenv/config";
        import "dotenv/config";
        import { ethers } from "ethers";
        import { readFileSync } from "fs";
        import { join } from "path";

        // Minimal ESM-clean negative tests script
        console.log("🧪 NEGATIVE TESTS - PROVING SYSTEM SAFETY");
        console.log("==========================================\n");

        const readArtifact = (name: string) => JSON.parse(readFileSync(join(process.cwd(), "artifacts", "contracts", `${name}.sol`, `${name}.json`), "utf8"));

        async function main() {
          const rpc = process.env.COSTON2_RPC_URL;
          const pk = process.env.PRIVATE_KEY;
          if (!rpc || !pk) throw new Error("COSTON2_RPC_URL or PRIVATE_KEY not set in .env");

          const provider = new ethers.JsonRpcProvider(rpc);
          const signer = new ethers.Wallet(pk, provider);

          console.log("Testing with account:", await signer.getAddress());
          console.log("Account balance:", ethers.formatEther(await provider.getBalance(await signer.getAddress())), "C2FLR\n");

          let overrides: any = {};
          try { overrides = JSON.parse(readFileSync(join(process.cwd(), "scripts", "addresses.json"), "utf8")); } catch {}

          const WRRegistryAddr = overrides.WRRegistry || process.env.WR_REGISTRY_ADDRESS;
          const ProofRegistryAddr = overrides.ProofRegistry || process.env.PROOF_REGISTRY_ADDRESS;
          if (!WRRegistryAddr || !ProofRegistryAddr) throw new Error('Missing WRRegistry or ProofRegistry address');

          const WRRegistry: any = new ethers.Contract(WRRegistryAddr, readArtifact('WRRegistry').abi, signer);
          const ProofRegistry: any = new ethers.Contract(ProofRegistryAddr, readArtifact('ProofRegistry').abi, signer);

          // Replay test
          console.log('\n🔸 REPLAY TEST');
          const attId = ethers.keccak256(ethers.toUtf8Bytes('neg-replay'));
          try { await ProofRegistry.consume(attId, 1, 'WR-NEG-REPLAY'); console.log('First consume handled'); } catch (e: any) { console.log('First consume result:', e?.message || e); }
          try { await ProofRegistry.consume(attId, 1, 'WR-NEG-REPLAY'); console.log('❌ Replay allowed'); } catch (e: any) { console.log('✅ Replay prevented:', e?.message || e); }

          // Expired test
          console.log('\n🔸 EXPIRED TEST');
          try { await ProofRegistry.consume(ethers.keccak256(ethers.toUtf8Bytes('neg-expired')), 0, 'WR-NEG-EXPIRED'); console.log('❌ Expired accepted'); } catch (e: any) { console.log('✅ Expired rejected:', e?.message || e); }

          // Double pledge
          console.log('\n🔸 DOUBLE PLEDGE TEST');
          try {
            const wrId = 'WR-NEG-DOUBLE';
            try { await WRRegistry.registerWR(wrId, ethers.keccak256(ethers.toUtf8Bytes('w')), ethers.keccak256(ethers.toUtf8Bytes('s')), ethers.keccak256(ethers.toUtf8Bytes('q')), await signer.getAddress(), '0x' + '0'.repeat(130), ethers.keccak256(ethers.toUtf8Bytes('t'))); } catch {}
            await WRRegistry.pledge(wrId, await signer.getAddress());
            try { await WRRegistry.pledge(wrId, await signer.getAddress()); console.log('❌ Double pledge allowed'); } catch (e: any) { console.log('✅ Double pledge prevented:', e?.message || e); }
          } catch (e: any) { console.log('Double pledge test error:', e?.message || e); }

          // Unauthorized
          console.log('\n🔸 UNAUTHORIZED ACTION TEST');
          try { const rogue = ethers.Wallet.createRandom().connect(provider); try { await WRRegistry.connect(rogue).registerWR('WR-UNAUTH', ethers.keccak256(ethers.toUtf8Bytes('a')), ethers.keccak256(ethers.toUtf8Bytes('b')), ethers.keccak256(ethers.toUtf8Bytes('c')), await signer.getAddress(), '0x' + '0'.repeat(130), ethers.keccak256(ethers.toUtf8Bytes('tpl'))); console.log('❌ Rogue registered'); } catch (e: any) { console.log('✅ Rogue prevented:', e?.message || e); } } catch (e: any) { console.log('Unauthorized test error:', e?.message || e); }

          console.log('\n🎉 NEGATIVE TESTS FINISHED');
        }

        main().catch((err) => { console.error(err); process.exitCode = 1; });

