Proof-of-Trade — Deployments & Quick Reference
=============================================

Deployed contracts (this session / known addresses):

- WRRegistry: `0x7cCf014EcE3d9F016112e621634AD1D3305C3755`
- ProofRegistry: `0x0c16BE418bAd3b51Db3b405268980e745bbb3A83`
- MockUSD (example): `0x10eA6e0A4433B511e568E3c5b14865e009ad45F3`
- MilestoneEscrow (example): `0xBCfa5320784236F6D5A5F6760A461Fc16b62aEAF`

Files with runtime artifacts:

- `fdc-proof-data.json` — sample FDC proof payload produced by `scripts/complete-fdc-flow.ts`.
- `scripts/addresses.json` — local override file used by scripts (contains at least `WRRegistry` address).

Important notes
- Hardhat / Solidity: the project compiles with `solc 0.8.24` and `evmVersion: "paris"` — this avoids Cancún-only opcodes (MCOPY) that are not available on Flare Coston2.
- Scripts are ESM (`package.json` contains `"type": "module"`) — keep `import` syntax and avoid `require()`.
- Scripts use ethers v6 patterns: `new ethers.JsonRpcProvider(rpc)` and `new ethers.Wallet(pk, provider)`.

Quick commands
- Compile contracts locally:

  npx hardhat compile

- Deploy ProofRegistry (example):

  PRIVATE_KEY=<your_key> COSTON2_RPC_URL=<rpc> npx hardhat run scripts/deploy-proof-registry.ts --network coston2

- Run end-to-end demo (requires env + addresses.json):

  PRIVATE_KEY=<your_key> COSTON2_RPC_URL=<rpc> npx hardhat run scripts/end-to-end-demo.ts --network coston2

- Run FDC simulation (creates `fdc-proof-data.json`):

  PRIVATE_KEY=<your_key> COSTON2_RPC_URL=<rpc> npx hardhat run scripts/complete-fdc-flow.ts --network coston2

- Run negative tests (replay, expired, double-pledge, unauthorized):

  PRIVATE_KEY=<your_key> COSTON2_RPC_URL=<rpc> npx hardhat run scripts/negative-tests.ts --network coston2

Where to look for artifacts
- ABI + compiled artifacts are under `artifacts/contracts/<Contract>.sol/<Contract>.json`.
- Typechain types are in `types/ethers-contracts`.

If something fails
- Confirm `PRIVATE_KEY` has funds on Coston2 and `COSTON2_RPC_URL` is reachable.
- For transform / compile errors: ensure scripts are ESM (no `require`) because `package.json` is ESM.
