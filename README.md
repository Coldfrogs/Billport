# Billport
Billport aims to democratize growth for SMEs, lots of SMEs want to scale and have willing customers/markets but due to liquity issues, in fact there is an estimated 2.5 trillion dollar annual trade finance gap. The kicker, lots of recipt and verifcation data is collected but not used, we aim to change that using data to create new oppertunties. 

Our MVP has three layer to visualize how we verify and enable transactions using warehouse recipt registry to enable and legitmize the 2.5 trillion dollar oppertunity that awaits us. 

🛠 Layer 1: WRRegistry (Warehouse Receipt Registry)
Purpose
 Anchors warehouse receipts (WRs) on-chain by storing their cryptographic hashes. Ensures that no single WR can be pledged more than once.
Key Functions
registerWR(bytes32 hashedWR, string memory uri)
 Records a new warehouse receipt hash with its reference metadata (e.g., IPFS).


isRegistered(bytes32 hashedWR)
 Checks if a given receipt has already been onboarded.


isUsed(bytes32 hashedWR)
 Prevents the same receipt from being pledged twice.


Security
Only hashed receipts are stored—never raw PDFs.


Double-pledging prevented at the registry level.


Scalability
New receipts can be added anytime without redeploying the contract.


🛠 Layer 2: ProofRegistry (Fresh Proof Manager)
Purpose
 Validates proofs delivered by Flare’s Data Connector (FDC), ensuring only one-time, unexpired proofs are accepted.
Key Functions
submitProof(bytes32 proofHash, bytes32 wrHash)
 Links a proof to a WR.


isValidProof(bytes32 proofHash)
 Confirms that the proof originated from verified external sources and hasn’t been replayed.


Security
Prevents replay attacks by disallowing reuse of old proofs.


Relies on Flare’s decentralized validator set to guarantee proof authenticity.


🛠 Layer 3: MilestoneEscrow (Funds Release Logic)
Purpose
 Manages lenders’ stablecoin deposits (demo: MockUSD). Holds funds until a valid proof is delivered or refunds on timeout.
Key Functions
deposit(address lender, uint256 amount)
 Lender locks stablecoin into escrow.


release(address exporter, bytes32 wrHash)
 Sends funds to the exporter once the matching WR + proof are validated.


refund(address lender, bytes32 wrHash)
 Returns funds if no valid proof arrives before the deadline.


Security
Escrow is automated—funds can only move once proof + WR conditions are satisfied.


Deadline system avoids indefinite lockups.


🔗 Cross-Chain Mirror: XRPL Testnet
WR-NFT: Minted when a WR is registered, acting as a portable badge of collateral.


INV-IOU Token: Issued to lenders to represent their financing claim, burned automatically when repayment is settled.


Provides real-time visibility and asset rails on XRPL.


🔒 Data Connector Integration
Flare Data Connector (FDC) acts like the system’s “sensor array”:
Queries external sources (warehouse APIs, IPFS receipts).


Multiple validators cross-check before producing a proof.


Delivers signed cryptographic proofs to ProofRegistry and WRRegistry.


This ensures real-world events → cryptographic evidence → on-chain finance.
✅ System Interaction Flow
Exporter uploads WR; WRRegistry records hash + metadata.


Lender funds MilestoneEscrow with MockUSD.


FDC queries the warehouse; validators produce a fresh proof.


ProofRegistry verifies authenticity, WRRegistry confirms match.


MilestoneEscrow releases funds to exporter (or refunds lender if proof expires).


XRPL mirrors: WR-NFT minted, INV-IOU token issued and later burned on repayment.


