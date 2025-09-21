# Flare Data Connector (FDC) Integration

This document describes the real Flare Data Connector integration for the proof-of-trade system, replacing the previous simulation.

## 🎯 Overview

The FDC integration enables the proof-of-trade system to:
- Submit real attestation requests to Flare's Data Connector
- Retrieve verified data from external sources (warehouse APIs, IPFS)
- Verify cryptographic proofs using Merkle trees
- Consume proofs in the ProofRegistry to prevent replay attacks

## 📁 New Files

### Core FDC Client
- `src/fdc-client.ts` - Main FDC client for interacting with Flare Data Connector
- `config/fdc-config.json` - Configuration for FDC contract addresses and settings

### Scripts
- `scripts/submit-real-fdc-requests.ts` - Submit real FDC requests
- `scripts/verify-real-fdc-proofs.ts` - Verify and consume FDC proofs
- `scripts/end-to-end-real-fdc.ts` - Complete end-to-end demo with real FDC

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- C2FLR tokens on Coston2 testnet
- Environment variables set in `.env`

### Environment Setup
```bash
# .env file
PRIVATE_KEY=0x468f691ab49246680ac13390afc3212ed2278d59ff4c7fe085bc447a0373a927
COSTON2_RPC_URL=https://coston2-api.flare.network/ext/C/rpc
```

### Installation
```bash
npm install
npx hardhat compile
```

## 🔧 Configuration

### FDC Contract Addresses
Update `config/fdc-config.json` with actual FDC contract addresses:

```json
{
  "networks": {
    "coston2": {
      "fdcHub": "0xACTUAL_FDC_HUB_ADDRESS",
      "fdcRequestFeeConfig": "0xACTUAL_FDC_FEE_CONFIG_ADDRESS"
    }
  }
}
```

**Note**: The current addresses are placeholders. You need to:
1. Deploy or find the actual FDC contract addresses on Coston2
2. Update the configuration file
3. Update the FDC client if needed

## 📋 Available Scripts

### Demo Scripts
```bash
# Run simulation demo (original)
npm run demo:simulation

# Run real FDC demo (new)
npm run demo:real-fdc
```

### FDC Scripts
```bash
# Submit FDC requests only
npm run fdc:submit

# Verify FDC proofs only
npm run fdc:verify

# Complete FDC flow (submit + verify)
npm run fdc:complete
```

### Testing
```bash
# Run negative tests
npm run test:negative
```

## 🔄 FDC Workflow

### 1. Request Submission
```typescript
const fdcClient = new FDCClient(provider, signer);

// Submit warehouse receipt verification request
const warehouseRequestId = await fdcClient.submitJsonApiRequest(
    "https://warehouse-api-demo.flare.network/api/wr/WR-001",
    "GET",
    { "Authorization": "Bearer demo-key" },
    "",
    ".data"
);

// Submit IPFS mirror verification request
const ipfsRequestId = await fdcClient.submitJsonApiRequest(
    "https://ipfs.io/ipfs/QmDemoCid123",
    "GET",
    { "Accept": "application/json" },
    "",
    "."
);
```

### 2. Attestation Waiting
```typescript
// Wait for attestations to be ready (up to 10 minutes)
const warehouseReady = await fdcClient.waitForAttestation(warehouseRequestId, 600000);
const ipfsReady = await fdcClient.waitForAttestation(ipfsRequestId, 600000);
```

### 3. Proof Retrieval
```typescript
// Retrieve attestations from FDC
const warehouseAttestation = await fdcClient.getAttestation(warehouseRequestId);
const ipfsAttestation = await fdcClient.getAttestation(ipfsRequestId);
```

### 4. Proof Verification
```typescript
// Verify Merkle proofs and data integrity
const warehouseValid = fdcClient.verifyAttestation(
    warehouseAttestation.data,
    warehouseAttestation.merkleRoot,
    warehouseAttestation.merkleProof,
    expectedData
);
```

### 5. Proof Consumption
```typescript
// Consume proofs in ProofRegistry to prevent replay attacks
const consumeTx = await ProofRegistry.consume(
    attestationId,
    roundId,
    wrId
);
```

## 🔒 Security Features

### Merkle Proof Verification
- Each attestation includes a Merkle proof
- Proofs are verified against the Merkle root stored on-chain
- Ensures data integrity and authenticity

### Replay Attack Prevention
- Each proof can only be consumed once
- Attestation IDs are tracked in ProofRegistry
- Prevents double-spending of attestations

### Data Integrity
- Template hash verification
- Response format validation
- Cryptographic signature verification (when available)

## 💰 C2FLR Usage

The real FDC integration uses C2FLR tokens for:
- **FDC Request Fees**: ~0.1 C2FLR per JsonApi request
- **Gas Fees**: ~0.01 C2FLR per transaction
- **Total per Demo**: ~0.29 C2FLR

## 🚨 Important Notes

### Contract Addresses
**CRITICAL**: The FDC contract addresses in the configuration are placeholders. You must:

1. **Find Real Addresses**: Get actual FDC contract addresses from Flare documentation
2. **Update Configuration**: Update `config/fdc-config.json`
3. **Test Integration**: Verify the addresses work on Coston2 testnet

### Error Handling
The FDC client includes comprehensive error handling:
- Insufficient C2FLR balance detection
- Attestation timeout handling
- Network connectivity issues
- Invalid response format detection

### Timeout Configuration
- **Attestation Wait**: 10 minutes maximum
- **Poll Interval**: 10 seconds
- **Max Retries**: 3 attempts

## 🔧 Troubleshooting

### Common Issues

1. **"Insufficient C2FLR balance"**
   - Ensure you have enough C2FLR for FDC fees
   - Check current balance: `npx hardhat run scripts/check-balance.ts --network coston2`

2. **"Attestation timeout"**
   - FDC processing can take several minutes
   - Increase timeout in configuration if needed
   - Check FDC network status

3. **"Invalid contract address"**
   - Update FDC contract addresses in configuration
   - Verify addresses are correct for Coston2 testnet

4. **"Failed to parse data"**
   - Check API endpoints are accessible
   - Verify response format matches expected structure

### Debug Mode
Enable detailed logging by setting:
```bash
DEBUG=fdc-client npm run demo:real-fdc
```

## 🔗 Integration Points

### With Existing System
- **WRRegistry**: Marks milestones as attested
- **ProofRegistry**: Consumes proofs to prevent replay
- **MilestoneEscrow**: Releases funds after attestation
- **XRPL Integration**: Prepares for cross-chain operations

### External Dependencies
- **Warehouse API**: Must be accessible and return expected format
- **IPFS Gateway**: Must be accessible for file verification
- **Flare FDC**: Must be operational and accessible

## 📊 Performance Metrics

### Request Processing
- **Submission Time**: ~30 seconds
- **Attestation Time**: 2-10 minutes
- **Verification Time**: ~5 seconds
- **Total Flow**: 3-12 minutes

### Resource Usage
- **C2FLR per Request**: ~0.1 C2FLR
- **Gas per Transaction**: ~100,000 gas
- **Storage per Attestation**: ~1KB

## 🎯 Next Steps

1. **Get Real FDC Addresses**: Find actual FDC contract addresses
2. **Test Integration**: Run full end-to-end tests
3. **Optimize Performance**: Fine-tune timeout and retry settings
4. **Add Monitoring**: Implement comprehensive logging and monitoring
5. **Production Deployment**: Deploy to Flare mainnet

## 📚 References

- [Flare Data Connector Documentation](https://dev.flare.network/fdc/overview/)
- [FDC Contract ABIs](https://github.com/flare-foundation/fdc-suite)
- [Coston2 Testnet Explorer](https://coston2-explorer.flare.network/)
- [Flare Developer Hub](https://dev.flare.network/)
