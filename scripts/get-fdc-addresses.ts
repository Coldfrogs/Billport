import "dotenv/config";
import { ethers } from "ethers";
import { getFdcAddresses } from "../src/contract-registry.js";
import { writeFileSync } from "fs";

console.log("🔍 GETTING REAL FDC CONTRACT ADDRESSES");
console.log("=====================================\n");

async function main() {
    const rpc = process.env.COSTON2_RPC_URL;
    if (!rpc) throw new Error("COSTON2_RPC_URL not set in .env");

    const provider = new ethers.JsonRpcProvider(rpc);

    console.log("Network:", "Coston2 Testnet");
    console.log("RPC URL:", rpc);
    console.log("");

    try {
        // Get FDC addresses
        const addresses = await getFdcAddresses(provider, "coston2");

        console.log("📋 FDC Contract Addresses Retrieved:");
        console.log("===================================");
        console.log("FdcHub:", addresses.fdcHub);
        console.log("FdcRequestFeeConfig:", addresses.fdcRequestFeeConfig);
        console.log("FlareSystemsManager:", addresses.flareSystemsManager);
        console.log("Relay:", addresses.relay);
        console.log("");

        // Validate addresses
        const zeroAddress = "0x0000000000000000000000000000000000000000";
        const validAddresses = Object.entries(addresses).filter(([_, address]) => address !== zeroAddress);
        const invalidAddresses = Object.entries(addresses).filter(([_, address]) => address === zeroAddress);

        if (validAddresses.length > 0) {
            console.log("✅ Valid addresses found:");
            validAddresses.forEach(([name, address]) => {
                console.log(`  ${name}: ${address}`);
            });
            console.log("");
        }

        if (invalidAddresses.length > 0) {
            console.log("⚠️  Invalid addresses (zero addresses):");
            invalidAddresses.forEach(([name, address]) => {
                console.log(`  ${name}: ${address} (needs real address)`);
            });
            console.log("");
        }

        // Save addresses to configuration file
        const config = {
            networks: {
                coston2: {
                    fdcHub: addresses.fdcHub,
                    fdcRequestFeeConfig: addresses.fdcRequestFeeConfig,
                    flareSystemsManager: addresses.flareSystemsManager,
                    relay: addresses.relay,
                    fdcAttestationTypes: {
                        AddressValidity: 0,
                        EVMTransaction: 1,
                        Payment: 2,
                        JsonApi: 3
                    }
                }
            },
            endpoints: {
                warehouseApi: "https://warehouse-api-demo.flare.network/api/wr",
                ipfsGateway: "https://ipfs.io/ipfs",
                xrplTestnet: "https://s.altnet.rippletest.net:51233",
                xrplTestnetWebSocket: "wss://s.altnet.rippletest.net:51233"
            },
            timeouts: {
                attestationWait: 600000,
                pollInterval: 10000,
                maxRetries: 3
            },
            fees: {
                defaultJsonApi: "0.1",
                defaultEVMTransaction: "0.05",
                defaultPayment: "0.05"
            }
        };

        writeFileSync('config/fdc-config.json', JSON.stringify(config, null, 2));
        console.log("💾 Configuration saved to config/fdc-config.json");
        console.log("");

        // Provide next steps
        console.log("🚀 NEXT STEPS:");
        console.log("==============");
        
        if (invalidAddresses.length > 0) {
            console.log("1. ⚠️  Some addresses are still zero addresses");
            console.log("   You need to get the real addresses from:");
            console.log("   - Flare Developer Hub: https://dev.flare.network/fdc/");
            console.log("   - Coston2 Explorer: https://coston2-explorer.flare.network/");
            console.log("   - Systems Explorer: https://coston2-systems-explorer.flare.rocks/");
            console.log("");
            console.log("2. Update the addresses in config/fdc-config.json");
            console.log("");
        }

        console.log("3. Test the FDC integration:");
        console.log("   npm run demo:real-fdc");
        console.log("");
        console.log("4. Or run individual FDC steps:");
        console.log("   npm run fdc:submit");
        console.log("   npm run fdc:verify");
        console.log("");

        // Check if we can connect to the contracts
        console.log("🔧 TESTING CONTRACT CONNECTIONS:");
        console.log("================================");

        for (const [name, address] of Object.entries(addresses)) {
            if (address !== zeroAddress) {
                try {
                    // Try to get code at the address
                    const code = await provider.getCode(address);
                    if (code === "0x") {
                        console.log(`❌ ${name}: No contract found at address ${address}`);
                    } else {
                        console.log(`✅ ${name}: Contract found at address ${address}`);
                    }
                } catch (error) {
                    console.log(`❌ ${name}: Error checking contract at ${address}:`, error);
                }
            } else {
                console.log(`⚠️  ${name}: Skipping zero address`);
            }
        }

    } catch (error: any) {
        console.error("❌ Error getting FDC addresses:", error.message);
        console.error("Stack trace:", error.stack);
        process.exit(1);
    }
}

main().catch((err) => {
    console.error("❌ Fatal error:", err);
    process.exitCode = 1;
});
