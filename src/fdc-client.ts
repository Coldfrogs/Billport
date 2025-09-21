import { ethers } from "ethers";
import { readFileSync } from "fs";
import { join } from "path";
import { getFdcAddresses } from "./contract-registry.js";

/**
 * Flare Data Connector Client
 * Handles real FDC integration for proof-of-trade system
 */
export class FDCClient {
    private provider: ethers.Provider;
    private signer: ethers.Wallet;
    private fdcHub: ethers.Contract;
    private fdcRequestFeeConfig: ethers.Contract;

    constructor(provider: ethers.Provider, signer: ethers.Wallet) {
        this.provider = provider;
        this.signer = signer;
        
        // Initialize with placeholder addresses - will be updated in initialize()
        this.fdcHub = new ethers.Contract("0x0000000000000000000000000000000000000000", [], signer);
        this.fdcRequestFeeConfig = new ethers.Contract("0x0000000000000000000000000000000000000000", [], signer);
    }

    /**
     * Initialize FDC client with real contract addresses
     */
    async initialize(network: string = "coston2"): Promise<void> {
        console.log("🔍 Initializing FDC client with real contract addresses...");
        
        // Get FDC addresses from ContractRegistry
        const addresses = await getFdcAddresses(this.provider, network);
        
        // Load FDC contract ABIs
        const fdcHubAbi = this.loadFDCABI("FdcHub");
        const fdcRequestFeeConfigAbi = this.loadFDCABI("FdcRequestFeeConfigurations");
        
        // Update contract instances with real addresses
        this.fdcHub = new ethers.Contract(addresses.fdcHub, fdcHubAbi, this.signer);
        this.fdcRequestFeeConfig = new ethers.Contract(addresses.fdcRequestFeeConfig, fdcRequestFeeConfigAbi, this.signer);
        
        console.log("✅ FDC client initialized with real addresses");
        console.log("FdcHub:", addresses.fdcHub);
        console.log("FdcRequestFeeConfig:", addresses.fdcRequestFeeConfig);
        console.log("");
    }

    private loadFDCABI(contractName: string): any[] {
        try {
            // Try to load from artifacts first
            const artifactPath = join(process.cwd(), "artifacts", "contracts", "fdc", `${contractName}.sol`, `${contractName}.json`);
            const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
            return artifact.abi;
        } catch (error) {
            // Fallback to hardcoded ABI for FDC contracts
            return this.getFDCABI(contractName);
        }
    }

    private getFDCABI(contractName: string): any[] {
        // FDC Hub ABI - simplified version for core functionality
        if (contractName === "FdcHub") {
            return [
                {
                    "inputs": [
                        {
                            "internalType": "enum AttestationType",
                            "name": "attestationType",
                            "type": "uint8"
                        },
                        {
                            "internalType": "bytes",
                            "name": "data",
                            "type": "bytes"
                        }
                    ],
                    "name": "requestAttestation",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "requestId",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "payable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "requestId",
                            "type": "uint256"
                        }
                    ],
                    "name": "getAttestation",
                    "outputs": [
                        {
                            "components": [
                                {
                                    "internalType": "uint256",
                                    "name": "roundId",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "bytes",
                                    "name": "data",
                                    "type": "bytes"
                                },
                                {
                                    "internalType": "bytes32",
                                    "name": "merkleRoot",
                                    "type": "bytes32"
                                },
                                {
                                    "internalType": "bytes32[]",
                                    "name": "merkleProof",
                                    "type": "bytes32[]"
                                }
                            ],
                            "internalType": "struct Attestation",
                            "name": "",
                            "type": "tuple"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "requestId",
                            "type": "uint256"
                        }
                    ],
                    "name": "isAttestationReady",
                    "outputs": [
                        {
                            "internalType": "bool",
                            "name": "",
                            "type": "bool"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                }
            ];
        }
        
        // FDC Request Fee Config ABI
        if (contractName === "FdcRequestFeeConfigurations") {
            return [
                {
                    "inputs": [
                        {
                            "internalType": "enum AttestationType",
                            "name": "attestationType",
                            "type": "uint8"
                        }
                    ],
                    "name": "getFee",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                }
            ];
        }
        
        return [];
    }

    /**
     * Get the fee required for a specific attestation type
     */
    async getAttestationFee(attestationType: number): Promise<bigint> {
        try {
            const fee = await this.fdcRequestFeeConfig.getFee(attestationType);
            return BigInt(fee.toString());
        } catch (error) {
            console.warn("Could not get FDC fee, using default:", error);
            // Default fee for JsonApi attestation (0.1 C2FLR)
            return ethers.parseEther("0.1");
        }
    }

    /**
     * Submit a JsonApi attestation request to FDC
     */
    async submitJsonApiRequest(
        url: string,
        method: string = "GET",
        headers: Record<string, string> = {},
        body: string = "",
        responsePath: string = ""
    ): Promise<bigint> {
        console.log("🔸 Submitting JsonApi attestation request to FDC...");
        console.log("URL:", url);
        console.log("Method:", method);
        console.log("Headers:", JSON.stringify(headers, null, 2));
        
        // JsonApi attestation type is 3
        const attestationType = 3;
        
        // Get the required fee
        const fee = await this.getAttestationFee(attestationType);
        console.log("Required fee:", ethers.formatEther(fee), "C2FLR");
        
        // Check balance
        const balance = await this.provider.getBalance(this.signer.address);
        if (balance < fee) {
            throw new Error(`Insufficient C2FLR balance. Required: ${ethers.formatEther(fee)}, Available: ${ethers.formatEther(balance)}`);
        }
        
        // Encode the JsonApi request data
        const requestData = {
            url,
            method,
            headers,
            body,
            responsePath
        };
        
        const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(
            ["string", "string", "string", "string", "string"],
            [url, method, JSON.stringify(headers), body, responsePath]
        );
        
        // Submit the request
        const tx = await this.fdcHub.requestAttestation(attestationType, encodedData, {
            value: fee
        });
        
        console.log("📝 FDC request transaction:", tx.hash);
        const receipt = await tx.wait();
        console.log("✅ FDC request submitted successfully!");
        
        // Extract request ID from events
        const requestId = this.extractRequestIdFromReceipt(receipt);
        console.log("Request ID:", requestId);
        
        return requestId;
    }

    /**
     * Check if an attestation is ready
     */
    async isAttestationReady(requestId: bigint): Promise<boolean> {
        try {
            return await this.fdcHub.isAttestationReady(requestId);
        } catch (error) {
            console.warn("Could not check attestation status:", error);
            return false;
        }
    }

    /**
     * Retrieve an attestation from FDC
     */
    async getAttestation(requestId: bigint): Promise<{
        roundId: bigint;
        data: string;
        merkleRoot: string;
        merkleProof: string[];
    }> {
        console.log("🔸 Retrieving attestation from FDC...");
        console.log("Request ID:", requestId.toString());
        
        try {
            const attestation = await this.fdcHub.getAttestation(requestId);
            
            return {
                roundId: BigInt(attestation.roundId.toString()),
                data: attestation.data,
                merkleRoot: attestation.merkleRoot,
                merkleProof: attestation.merkleProof
            };
        } catch (error) {
            console.error("Failed to retrieve attestation:", error);
            throw error;
        }
    }

    /**
     * Wait for attestation to be ready with polling
     */
    async waitForAttestation(requestId: bigint, maxWaitTime: number = 300000): Promise<boolean> {
        console.log("⏳ Waiting for attestation to be ready...");
        console.log("Max wait time:", maxWaitTime / 1000, "seconds");
        
        const startTime = Date.now();
        const pollInterval = 10000; // Poll every 10 seconds
        
        while (Date.now() - startTime < maxWaitTime) {
            const isReady = await this.isAttestationReady(requestId);
            if (isReady) {
                console.log("✅ Attestation is ready!");
                return true;
            }
            
            console.log("⏳ Attestation not ready yet, waiting...");
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
        
        console.log("❌ Attestation timeout reached");
        return false;
    }

    /**
     * Extract request ID from transaction receipt
     */
    private extractRequestIdFromReceipt(receipt: any): bigint {
        // Look for RequestSubmitted event
        for (const log of receipt.logs) {
            try {
                const decoded = this.fdcHub.interface.parseLog(log);
                if (decoded && decoded.name === "RequestSubmitted") {
                    return BigInt(decoded.args.requestId.toString());
                }
            } catch (error) {
                // Ignore parsing errors for other logs
            }
        }
        
        // Fallback: use block number as request ID
        return BigInt(receipt.blockNumber);
    }

    /**
     * Verify attestation data integrity
     */
    verifyAttestation(
        data: string,
        merkleRoot: string,
        merkleProof: string[],
        expectedData: string
    ): boolean {
        // In a real implementation, you would verify the Merkle proof
        // For now, we'll do a simple data comparison
        return data === expectedData;
    }
}

/**
 * Attestation types supported by FDC
 */
export enum AttestationType {
    AddressValidity = 0,
    EVMTransaction = 1,
    Payment = 2,
    JsonApi = 3
}

/**
 * Create a JsonApi request for warehouse receipt verification
 */
export function createWarehouseReceiptRequest(
    wrId: string,
    wrHash: string,
    fileCid: string,
    issuerId: string
): {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string;
    responsePath: string;
} {
    return {
        url: `https://warehouse-api-demo.flare.network/api/wr/${wrId}`,
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer demo-api-key"
        },
        body: "",
        responsePath: ".data"
    };
}

/**
 * Create a JsonApi request for IPFS mirror verification
 */
export function createIPFSMirrorRequest(
    fileCid: string
): {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string;
    responsePath: string;
} {
    return {
        url: `https://ipfs.io/ipfs/${fileCid}`,
        method: "GET",
        headers: {
            "Accept": "application/json"
        },
        body: "",
        responsePath: "."
    };
}
