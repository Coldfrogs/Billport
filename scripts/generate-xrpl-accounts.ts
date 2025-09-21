import { XRPLClient } from "../src/xrpl-client.js";
import { writeFileSync } from "fs";

console.log("🔑 GENERATING XRPL TESTNET ACCOUNTS");
console.log("===================================\n");

async function main() {
    try {
        // Generate new XRPL testnet accounts
        const accounts = XRPLClient.generateTestAccounts();

        // Save accounts to file
        const accountData = {
            accounts: accounts,
            network: "testnet",
            generatedAt: new Date().toISOString(),
            instructions: {
                funding: "Use the XRPL testnet faucet to fund these accounts:",
                faucetUrls: [
                    "https://xrpl.org/xrp-testnet-faucet.html",
                    "https://testnet.xrpl.org/"
                ],
                explorer: "https://testnet.xrpl.org/",
                webSocket: "wss://s.altnet.rippletest.net:51233"
            }
        };

        writeFileSync('xrpl-accounts.json', JSON.stringify(accountData, null, 2));
        console.log("💾 Account data saved to xrpl-accounts.json");
        console.log("");

        console.log("🚀 NEXT STEPS:");
        console.log("==============");
        console.log("1. Fund the accounts using the XRPL testnet faucet");
        console.log("2. Update your scripts to use these account seeds");
        console.log("3. Run the complete demo: npm run demo:complete");
        console.log("");

        console.log("🔗 Useful Links:");
        console.log("- XRPL Testnet Faucet: https://xrpl.org/xrp-testnet-faucet.html");
        console.log("- XRPL Testnet Explorer: https://testnet.xrpl.org/");
        console.log("- XRPL Documentation: https://xrpl.org/");

    } catch (error: any) {
        console.error("❌ Error generating XRPL accounts:", error.message);
        process.exit(1);
    }
}

main().catch((err) => {
    console.error("❌ Fatal error:", err);
    process.exitCode = 1;
});
