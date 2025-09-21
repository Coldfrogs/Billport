import { Client, Wallet, xrpToDrops, dropsToXrp, convertStringToHex, convertHexToString } from "xrpl";
import { ethers } from "ethers";

/**
 * XRPL Client for Cross-Chain Operations
 * Handles WR-NFT creation and INV-IOU issuance on XRPL
 */
export class XRPLClient {
    private client: Client;
    private isConnected: boolean = false;
    private accounts: {
        sme: Wallet;
        protocol: Wallet;
        lender: Wallet;
    };

    constructor() {
        this.client = new Client("wss://s.altnet.rippletest.net:51233");
        this.accounts = {
            sme: {} as Wallet,
            protocol: {} as Wallet,
            lender: {} as Wallet
        };
    }

    /**
     * Connect to XRPL testnet
     */
    async connect(): Promise<void> {
        try {
            await this.client.connect();
            this.isConnected = true;
            console.log("✅ Connected to XRPL testnet");
        } catch (error) {
            console.error("❌ Failed to connect to XRPL:", error);
            throw error;
        }
    }

    /**
     * Disconnect from XRPL
     */
    async disconnect(): Promise<void> {
        if (this.isConnected) {
            await this.client.disconnect();
            this.isConnected = false;
            console.log("✅ Disconnected from XRPL");
        }
    }

    /**
     * Initialize accounts with seed phrases or addresses
     */
    async initializeAccounts(seeds: {
        sme: string;
        protocol: string;
        lender: string;
    }): Promise<void> {
        console.log("🔑 Initializing XRPL accounts...");

        try {
            // Create wallets from seed phrases
            this.accounts.sme = Wallet.fromSeed(seeds.sme);
            this.accounts.protocol = Wallet.fromSeed(seeds.protocol);
            this.accounts.lender = Wallet.fromSeed(seeds.lender);

            console.log("✅ XRPL Accounts Initialized:");
            console.log("SME Account:", this.accounts.sme.address);
            console.log("Protocol Account:", this.accounts.protocol.address);
            console.log("Lender Account:", this.accounts.lender.address);
            console.log("");

            // Check account balances
            await this.checkAccountBalances();
        } catch (error) {
            console.error("❌ Failed to initialize accounts:", error);
            throw error;
        }
    }

    /**
     * Check account balances
     */
    async checkAccountBalances(): Promise<void> {
        if (!this.isConnected) {
            throw new Error("Not connected to XRPL");
        }

        console.log("💰 Checking XRPL account balances...");

        for (const [role, wallet] of Object.entries(this.accounts)) {
            try {
                const accountInfo = await this.client.request({
                    command: "account_info",
                    account: wallet.address
                });

                const balance = accountInfo.result.account_data.Balance;
                console.log(`${role} balance:`, dropsToXrp(balance), "XRP");
            } catch (error) {
                console.log(`${role} balance: Not found or insufficient funds`);
            }
        }
        console.log("");
    }

    /**
     * Fund accounts with test XRP (for testing purposes)
     */
    async fundAccounts(): Promise<void> {
        console.log("💰 Funding XRPL accounts with test XRP...");
        console.log("⚠️  Note: In production, accounts should be funded from external sources");
        console.log("For testing, use the XRPL testnet faucet: https://xrpl.org/xrp-testnet-faucet.html");
        console.log("");

        const faucetUrls = [
            "https://xrpl.org/xrp-testnet-faucet.html",
            "https://testnet.xrpl.org/"
        ];

        console.log("🔗 XRPL Testnet Faucets:");
        faucetUrls.forEach(url => console.log(`- ${url}`));
        console.log("");

        console.log("📋 Account addresses to fund:");
        console.log("SME Account:", this.accounts.sme.address);
        console.log("Protocol Account:", this.accounts.protocol.address);
        console.log("Lender Account:", this.accounts.lender.address);
        console.log("");
    }

    /**
     * Create WR-NFT (Warehouse Receipt NFT) on XRPL
     */
    async createWRNFT(wrData: {
        wrId: string;
        wrHash: string;
        fileCid: string;
        issuerId: string;
        status: string;
        pledgeState: string;
    }): Promise<string> {
        if (!this.isConnected) {
            throw new Error("Not connected to XRPL");
        }

        console.log("🎨 Creating WR-NFT on XRPL...");
        console.log("WR ID:", wrData.wrId);
        console.log("WR Hash:", wrData.wrHash);

        try {
            // Prepare NFT metadata
            const nftMetadata = {
                name: "Warehouse Receipt NFT",
                description: "NFT representing a Warehouse Receipt as collateral",
                image: `https://ipfs.io/ipfs/${wrData.fileCid}`,
                external_url: "https://proof-of-trade.flare.network",
                attributes: [
                    { trait_type: "WR ID", value: wrData.wrId },
                    { trait_type: "WR Hash", value: wrData.wrHash },
                    { trait_type: "File CID", value: wrData.fileCid },
                    { trait_type: "Issuer ID", value: wrData.issuerId },
                    { trait_type: "Status", value: wrData.status },
                    { trait_type: "Pledge State", value: wrData.pledgeState },
                    { trait_type: "Created At", value: new Date().toISOString() }
                ]
            };

            // Convert metadata to hex
            const metadataHex = convertStringToHex(JSON.stringify(nftMetadata));

            // Create NFT mint transaction
            const mintTransaction = {
                TransactionType: "NFTokenMint",
                Account: this.accounts.sme.address,
                NFTokenTaxon: 0, // Taxon for WR NFTs
                URI: metadataHex,
                Flags: 8, // Transferable flag
                TransferFee: 0, // No transfer fee
                Issuer: this.accounts.sme.address
            };

            // Submit transaction
            const response = await this.client.submit(mintTransaction, {
                wallet: this.accounts.sme
            });

            if (response.result.validated) {
                console.log("✅ WR-NFT created successfully!");
                console.log("Transaction hash:", response.result.tx_json.hash);
                console.log("NFT ID:", response.result.tx_json.NFTokenID);
                console.log("");

                return response.result.tx_json.NFTokenID;
            } else {
                throw new Error(`Transaction failed: ${response.result.engine_result_message}`);
            }
        } catch (error) {
            console.error("❌ Failed to create WR-NFT:", error);
            throw error;
        }
    }

    /**
     * Create trust line for INV-IOU
     */
    async createTrustLine(currency: string, amount: string): Promise<void> {
        if (!this.isConnected) {
            throw new Error("Not connected to XRPL");
        }

        console.log("🔗 Creating trust line for INV-IOU...");
        console.log("Currency:", currency);
        console.log("Amount:", amount);

        try {
            const trustLineTransaction = {
                TransactionType: "TrustSet",
                Account: this.accounts.lender.address,
                LimitAmount: {
                    currency: currency,
                    issuer: this.accounts.protocol.address,
                    value: amount
                }
            };

            const response = await this.client.submit(trustLineTransaction, {
                wallet: this.accounts.lender
            });

            if (response.result.validated) {
                console.log("✅ Trust line created successfully!");
                console.log("Transaction hash:", response.result.tx_json.hash);
            } else {
                throw new Error(`Trust line creation failed: ${response.result.engine_result_message}`);
            }
        } catch (error) {
            console.error("❌ Failed to create trust line:", error);
            throw error;
        }
    }

    /**
     * Issue INV-IOU (Investment IOU) to lender
     */
    async issueINVIOU(amount: string, currency: string = "INV"): Promise<string> {
        if (!this.isConnected) {
            throw new Error("Not connected to XRPL");
        }

        console.log("💸 Issuing INV-IOU to lender...");
        console.log("Amount:", amount);
        console.log("Currency:", currency);

        try {
            const paymentTransaction = {
                TransactionType: "Payment",
                Account: this.accounts.protocol.address,
                Destination: this.accounts.lender.address,
                Amount: {
                    currency: currency,
                    issuer: this.accounts.protocol.address,
                    value: amount
                },
                Memos: [
                    {
                        Memo: {
                            MemoData: convertStringToHex("WR-backed loan investment")
                        }
                    }
                ]
            };

            const response = await this.client.submit(paymentTransaction, {
                wallet: this.accounts.protocol
            });

            if (response.result.validated) {
                console.log("✅ INV-IOU issued successfully!");
                console.log("Transaction hash:", response.result.tx_json.hash);
                console.log("");

                return response.result.tx_json.hash;
            } else {
                throw new Error(`INV-IOU issuance failed: ${response.result.engine_result_message}`);
            }
        } catch (error) {
            console.error("❌ Failed to issue INV-IOU:", error);
            throw error;
        }
    }

    /**
     * Burn WR-NFT (when loan is repaid)
     */
    async burnWRNFT(nftId: string): Promise<string> {
        if (!this.isConnected) {
            throw new Error("Not connected to XRPL");
        }

        console.log("🔥 Burning WR-NFT...");
        console.log("NFT ID:", nftId);

        try {
            const burnTransaction = {
                TransactionType: "NFTokenBurn",
                Account: this.accounts.sme.address,
                NFTokenID: nftId
            };

            const response = await this.client.submit(burnTransaction, {
                wallet: this.accounts.sme
            });

            if (response.result.validated) {
                console.log("✅ WR-NFT burned successfully!");
                console.log("Transaction hash:", response.result.tx_json.hash);
                console.log("");

                return response.result.tx_json.hash;
            } else {
                throw new Error(`WR-NFT burn failed: ${response.result.engine_result_message}`);
            }
        } catch (error) {
            console.error("❌ Failed to burn WR-NFT:", error);
            throw error;
        }
    }

    /**
     * Redeem INV-IOU (when loan is repaid)
     */
    async redeemINVIOU(amount: string, currency: string = "INV"): Promise<string> {
        if (!this.isConnected) {
            throw new Error("Not connected to XRPL");
        }

        console.log("💱 Redeeming INV-IOU...");
        console.log("Amount:", amount);
        console.log("Currency:", currency);

        try {
            const paymentTransaction = {
                TransactionType: "Payment",
                Account: this.accounts.lender.address,
                Destination: this.accounts.protocol.address,
                Amount: {
                    currency: currency,
                    issuer: this.accounts.protocol.address,
                    value: amount
                },
                Memos: [
                    {
                        Memo: {
                            MemoData: convertStringToHex("WR-backed loan repayment")
                        }
                    }
                ]
            };

            const response = await this.client.submit(paymentTransaction, {
                wallet: this.accounts.lender
            });

            if (response.result.validated) {
                console.log("✅ INV-IOU redeemed successfully!");
                console.log("Transaction hash:", response.result.tx_json.hash);
                console.log("");

                return response.result.tx_json.hash;
            } else {
                throw new Error(`INV-IOU redemption failed: ${response.result.engine_result_message}`);
            }
        } catch (error) {
            console.error("❌ Failed to redeem INV-IOU:", error);
            throw error;
        }
    }

    /**
     * Get account NFTs
     */
    async getAccountNFTs(account: string): Promise<any[]> {
        if (!this.isConnected) {
            throw new Error("Not connected to XRPL");
        }

        try {
            const response = await this.client.request({
                command: "account_nfts",
                account: account
            });

            return response.result.account_nfts || [];
        } catch (error) {
            console.error("❌ Failed to get account NFTs:", error);
            return [];
        }
    }

    /**
     * Get account balances
     */
    async getAccountBalances(account: string): Promise<any[]> {
        if (!this.isConnected) {
            throw new Error("Not connected to XRPL");
        }

        try {
            const response = await this.client.request({
                command: "account_lines",
                account: account
            });

            return response.result.lines || [];
        } catch (error) {
            console.error("❌ Failed to get account balances:", error);
            return [];
        }
    }

    /**
     * Generate new XRPL testnet accounts
     */
    static generateTestAccounts(): { sme: string; protocol: string; lender: string } {
        console.log("🔑 Generating new XRPL testnet accounts...");

        const sme = Wallet.generate();
        const protocol = Wallet.generate();
        const lender = Wallet.generate();

        console.log("✅ New XRPL accounts generated:");
        console.log("SME Account:", sme.address);
        console.log("SME Seed:", sme.seed);
        console.log("Protocol Account:", protocol.address);
        console.log("Protocol Seed:", protocol.seed);
        console.log("Lender Account:", lender.address);
        console.log("Lender Seed:", lender.seed);
        console.log("");

        return {
            sme: sme.seed!,
            protocol: protocol.seed!,
            lender: lender.seed!
        };
    }
}

/**
 * XRPL configuration for proof-of-trade system
 */
export const XRPL_CONFIG = {
    testnet: {
        server: "wss://s.altnet.rippletest.net:51233",
        explorer: "https://testnet.xrpl.org/",
        faucet: "https://xrpl.org/xrp-testnet-faucet.html"
    },
    mainnet: {
        server: "wss://xrplcluster.com/",
        explorer: "https://xrpscan.com/",
        faucet: null
    }
};

/**
 * WR-NFT metadata template
 */
export function createWRNFTMetadata(wrData: {
    wrId: string;
    wrHash: string;
    fileCid: string;
    issuerId: string;
    status: string;
    pledgeState: string;
}): any {
    return {
        name: "Warehouse Receipt NFT",
        description: "NFT representing a Warehouse Receipt as collateral",
        image: `https://ipfs.io/ipfs/${wrData.fileCid}`,
        external_url: "https://proof-of-trade.flare.network",
        attributes: [
            { trait_type: "WR ID", value: wrData.wrId },
            { trait_type: "WR Hash", value: wrData.wrHash },
            { trait_type: "File CID", value: wrData.fileCid },
            { trait_type: "Issuer ID", value: wrData.issuerId },
            { trait_type: "Status", value: wrData.status },
            { trait_type: "Pledge State", value: wrData.pledgeState },
            { trait_type: "Created At", value: new Date().toISOString() }
        ]
    };
}
