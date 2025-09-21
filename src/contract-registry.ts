import { ethers } from "ethers";

/**
 * Contract Registry Helper
 * Dynamically retrieves FDC contract addresses from Flare's ContractRegistry
 */
export class ContractRegistryHelper {
    private provider: ethers.Provider;
    private contractRegistry: ethers.Contract;

    // ContractRegistry address on Coston2 testnet
    private readonly CONTRACT_REGISTRY_ADDRESS = "0x0000000000000000000000000000000000000000"; // TODO: Get real address

    // ContractRegistry ABI (simplified)
    private readonly CONTRACT_REGISTRY_ABI = [
        {
            "inputs": [],
            "name": "getFdcHub",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getFdcRequestFeeConfigurations",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getFlareSystemsManager",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getRelay",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    constructor(provider: ethers.Provider) {
        this.provider = provider;
        this.contractRegistry = new ethers.Contract(
            this.CONTRACT_REGISTRY_ADDRESS,
            this.CONTRACT_REGISTRY_ABI,
            provider
        );
    }

    /**
     * Get FDC Hub contract address
     */
    async getFdcHub(): Promise<string> {
        try {
            const address = await this.contractRegistry.getFdcHub();
            return address;
        } catch (error) {
            console.warn("Could not get FdcHub from ContractRegistry:", error);
            // Fallback to hardcoded address
            return this.getFallbackAddress("fdcHub");
        }
    }

    /**
     * Get FDC Request Fee Configurations contract address
     */
    async getFdcRequestFeeConfigurations(): Promise<string> {
        try {
            const address = await this.contractRegistry.getFdcRequestFeeConfigurations();
            return address;
        } catch (error) {
            console.warn("Could not get FdcRequestFeeConfigurations from ContractRegistry:", error);
            // Fallback to hardcoded address
            return this.getFallbackAddress("fdcRequestFeeConfig");
        }
    }

    /**
     * Get Flare Systems Manager contract address
     */
    async getFlareSystemsManager(): Promise<string> {
        try {
            const address = await this.contractRegistry.getFlareSystemsManager();
            return address;
        } catch (error) {
            console.warn("Could not get FlareSystemsManager from ContractRegistry:", error);
            // Fallback to hardcoded address
            return this.getFallbackAddress("flareSystemsManager");
        }
    }

    /**
     * Get Relay contract address
     */
    async getRelay(): Promise<string> {
        try {
            const address = await this.contractRegistry.getRelay();
            return address;
        } catch (error) {
            console.warn("Could not get Relay from ContractRegistry:", error);
            // Fallback to hardcoded address
            return this.getFallbackAddress("relay");
        }
    }

    /**
     * Get all FDC contract addresses
     */
    async getAllFdcAddresses(): Promise<{
        fdcHub: string;
        fdcRequestFeeConfig: string;
        flareSystemsManager: string;
        relay: string;
    }> {
        console.log("🔍 Retrieving FDC contract addresses from ContractRegistry...");
        
        const [fdcHub, fdcRequestFeeConfig, flareSystemsManager, relay] = await Promise.all([
            this.getFdcHub(),
            this.getFdcRequestFeeConfigurations(),
            this.getFlareSystemsManager(),
            this.getRelay()
        ]);

        const addresses = {
            fdcHub,
            fdcRequestFeeConfig,
            flareSystemsManager,
            relay
        };

        console.log("✅ FDC Contract Addresses Retrieved:");
        console.log("FdcHub:", fdcHub);
        console.log("FdcRequestFeeConfig:", fdcRequestFeeConfig);
        console.log("FlareSystemsManager:", flareSystemsManager);
        console.log("Relay:", relay);
        console.log("");

        return addresses;
    }

    /**
     * Fallback addresses when ContractRegistry is not available
     * These should be updated with actual addresses from Flare documentation
     */
    private getFallbackAddress(contractType: string): string {
        const fallbackAddresses: Record<string, string> = {
            fdcHub: "0x0000000000000000000000000000000000000000", // TODO: Get from Flare docs
            fdcRequestFeeConfig: "0x0000000000000000000000000000000000000000", // TODO: Get from Flare docs
            flareSystemsManager: "0x0000000000000000000000000000000000000000", // TODO: Get from Flare docs
            relay: "0x0000000000000000000000000000000000000000" // TODO: Get from Flare docs
        };

        return fallbackAddresses[contractType] || "0x0000000000000000000000000000000000000000";
    }

    /**
     * Validate that an address is not the zero address
     */
    validateAddress(address: string, contractName: string): boolean {
        if (address === "0x0000000000000000000000000000000000000000") {
            console.warn(`⚠️ ${contractName} address is zero address - this may indicate the contract is not deployed or the address is not found`);
            return false;
        }
        return true;
    }

    /**
     * Get ContractRegistry address for the current network
     */
    getContractRegistryAddress(): string {
        return this.CONTRACT_REGISTRY_ADDRESS;
    }
}

/**
 * Known FDC contract addresses from Flare documentation
 * These are the official addresses that should be used as fallbacks
 */
export const KNOWN_FDC_ADDRESSES = {
    coston2: {
        // These addresses need to be updated with actual values from Flare docs
        contractRegistry: "0x0000000000000000000000000000000000000000",
        fdcHub: "0x0000000000000000000000000000000000000000",
        fdcRequestFeeConfig: "0x0000000000000000000000000000000000000000",
        flareSystemsManager: "0x0000000000000000000000000000000000000000",
        relay: "0x0000000000000000000000000000000000000000"
    },
    mainnet: {
        contractRegistry: "0x0000000000000000000000000000000000000000",
        fdcHub: "0x0000000000000000000000000000000000000000",
        fdcRequestFeeConfig: "0x0000000000000000000000000000000000000000",
        flareSystemsManager: "0x0000000000000000000000000000000000000000",
        relay: "0x0000000000000000000000000000000000000000"
    }
};

/**
 * Helper function to get FDC addresses with fallback
 */
export async function getFdcAddresses(provider: ethers.Provider, network: string = "coston2"): Promise<{
    fdcHub: string;
    fdcRequestFeeConfig: string;
    flareSystemsManager: string;
    relay: string;
}> {
    const registryHelper = new ContractRegistryHelper(provider);
    
    try {
        // Try to get addresses from ContractRegistry
        const addresses = await registryHelper.getAllFdcAddresses();
        
        // Validate addresses
        registryHelper.validateAddress(addresses.fdcHub, "FdcHub");
        registryHelper.validateAddress(addresses.fdcRequestFeeConfig, "FdcRequestFeeConfig");
        registryHelper.validateAddress(addresses.flareSystemsManager, "FlareSystemsManager");
        registryHelper.validateAddress(addresses.relay, "Relay");
        
        return addresses;
    } catch (error) {
        console.warn("Failed to get addresses from ContractRegistry, using fallback:", error);
        
        // Use known addresses as fallback
        const knownAddresses = KNOWN_FDC_ADDRESSES[network as keyof typeof KNOWN_FDC_ADDRESSES] || KNOWN_FDC_ADDRESSES.coston2;
        
        return {
            fdcHub: knownAddresses.fdcHub,
            fdcRequestFeeConfig: knownAddresses.fdcRequestFeeConfig,
            flareSystemsManager: knownAddresses.flareSystemsManager,
            relay: knownAddresses.relay
        };
    }
}
