Hand-off Notes — Proof-of-Trade
================================

Purpose
- Provide quick reproduction steps and notes for the Proof-of-Trade deployment and demo on Flare Coston2.

Environment variables
- `PRIVATE_KEY` — private key used for deploying and running scripts.
- `COSTON2_RPC_URL` — JSON-RPC endpoint for Flare Coston2.

Recommended commands
- Install dependencies:

  npm install

- Compile:

  npx hardhat compile

- Run end-to-end demo (uses addresses in `scripts/addresses.json` when present):

  PRIVATE_KEY=<key> COSTON2_RPC_URL=<rpc> npx hardhat run scripts/end-to-end-demo.ts --network coston2

- Create FDC proof data (simulation):

  PRIVATE_KEY=<key> COSTON2_RPC_URL=<rpc> npx hardhat run scripts/complete-fdc-flow.ts --network coston2

- (Optional) Run the negative tests we prepared:

  PRIVATE_KEY=<key> COSTON2_RPC_URL=<rpc> npx hardhat run scripts/negative-tests.ts --network coston2

Important implementation notes
- Hardhat config sets `evmVersion: "paris"` for `solc 0.8.24` to avoid Cancún MCOPY opcode incompatibilities on Coston2.
- Scripts use explicit provider + signer (ethers v6) to avoid issues with Hardhat remote runtime patterns.

Files to hand off
- `DEPLOYMENTS.md` — quick reference addresses + commands
- `HANDOFF.md` — short reproduction & environment steps
- `fdc-proof-data.json` — simulated proof payload from demo run
- `scripts/*.ts` — all run scripts (deploy, demo, test)

Next steps you might want me to do
- Run the negative tests against Coston2 and iterate fixes
- Produce a more formal `DEPLOYMENTS.md` with transaction hashes and gas used
- Add small npm scripts (package.json) for convenience runs
