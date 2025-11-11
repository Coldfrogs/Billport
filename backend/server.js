const express = require('express');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto');
const { ethers } = require('ethers');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend_trade/trade-proof-gateway-main/dist')));

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// WR Attachment storage (in-memory for demo)
const wrAttachments = new Map();

// Contract addresses (deployed on Coston2 testnet)
const CONTRACT_ADDRESSES = {
  MOCK_USD: "0x6391bFA09AF4dD6d322b646168B454f4D977384a",
  ISSUER_REGISTRY: "0x16B717120d41910313A0ca28AF8746a17e732462",
  WR_REGISTRY: "0x3b3fc290d50058e85953aAC0243ce80A35FC200a",
  PROOF_REGISTRY: "0xa92D88CF5c3Bef5790499618D7A4601eb26E5A30",
  DEAL_REGISTRY: "0x61b824f52988e892E3C6EA8c412f8F2ECa5656B5",
  SECONDARY_MARKET: "0xc5Afa85C42531B96A9f47012bB6787d5BdA06178"
};

// RPC URL for Coston2
const RPC_URL = process.env.COSTON2_RPC_URL || "https://coston2-api.flare.network/ext/C/rpc";

// Initialize provider
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Contract ABIs (simplified for demo)
const MOCK_USD_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

const DEAL_REGISTRY_ABI = [
  "function getDeal(string memory dealId) view returns (tuple(string id, string wrId, address issuer, string location, string commodity, uint256 amount, uint256 requestedFunding, uint256 interestRate, uint256 duration, address lender, uint256 fundedAmount, uint8 status, uint256 riskScore, uint256 listedDate, uint256 fundedDate, uint256 verifiedDate, uint256 releasedDate))",
  "function getAllDealIds() view returns (string[])",
  "function getUserDeals(address user) view returns (string[])",
  "function getDealsByStatus(uint8 status) view returns (string[])",
  "function getMarketplaceStats() view returns (uint256, uint256, uint256, uint256, uint256)",
  "function listDeal(string memory dealId, string memory wrId, string memory location, string memory commodity, uint256 amount, uint256 requestedFunding, uint256 interestRate, uint256 duration, uint256 riskScore)",
  "function fundDeal(string memory dealId)"
];

// API Routes

// Get user balance
app.get('/api/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Get C2FLR balance (native token)
    const c2flrBalance = await provider.getBalance(address);
    
    // Get MockUSD balance
    const mockUSDContract = new ethers.Contract(CONTRACT_ADDRESSES.MOCK_USD, MOCK_USD_ABI, provider);
    const mockUSDBalance = await mockUSDContract.balanceOf(address);
    const decimals = await mockUSDContract.decimals();
    
    res.json({
      c2flr: ethers.formatEther(c2flrBalance),
      mockUSD: ethers.formatUnits(mockUSDBalance, decimals),
      address: address,
      network: "Coston2 Testnet"
    });
  } catch (error) {
    console.error('Error getting balance:', error);
    res.status(500).json({ error: 'Failed to get balance' });
  }
});

// Demo invoice data with realistic WR
const demoInvoices = [
  {
    id: "INV-2024-001",
    invoiceNumber: "INV-2024-001",
    supplier: "Lagos Cocoa Co.",
    buyer: "Global Chocolate Ltd.",
    amount: 50000,
    currency: "USD",
    dueDate: "2024-12-15",
    status: "pending_verification",
    commodity: "Cocoa Beans",
    quantity: "1000 MT",
    location: "Lagos, Nigeria",
    warehouse: "Lagos Port Warehouse",
    wrId: "WR-2024-001",
    createdAt: "2024-09-21",
    wrDocument: {
      id: "WR-2024-001",
      warehouseName: "Lagos Port Warehouse",
      warehouseAddress: "Apapa Port, Lagos, Nigeria",
      warehouseLicense: "NIG-WH-2024-001",
      commodity: "Premium Cocoa Beans",
      grade: "Grade A",
      quantity: "1000 Metric Tons",
      unit: "MT",
      batchNumber: "COCOA-2024-0915-001",
      harvestDate: "2024-09-15",
      storageDate: "2024-09-20",
      expiryDate: "2025-09-20",
      storageConditions: "Temperature: 18-22°C, Humidity: 60-65%",
      qualityCert: "ISO 22000:2018",
      inspector: "Dr. Adebayo Ogunlesi",
      inspectorLicense: "NIG-INS-2024-045",
      digitalSignature: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
      blockchainHash: "0x9f8e7d6c5b4a3928171605040302010f0e0d0c0b0a0908070605040302010f0e",
      verificationStatus: "pending",
      contractAddress: CONTRACT_ADDRESSES.WR_REGISTRY,
      transactionHash: null
    },
    documents: [
      { name: "Commercial Invoice", type: "pdf", verified: true, hash: "0x1234..." },
      { name: "Bill of Lading", type: "pdf", verified: true, hash: "0x5678..." },
      { name: "Warehouse Receipt", type: "pdf", verified: false, hash: "0x9abc..." },
      { name: "Quality Certificate", type: "pdf", verified: false, hash: "0xdef0..." }
    ],
    milestones: [
      { name: "Invoice Created", status: "completed", date: "2024-09-21" },
      { name: "Documents Uploaded", status: "completed", date: "2024-09-21" },
      { name: "Warehouse Receipt Issued", status: "completed", date: "2024-09-21" },
      { name: "WR Blockchain Registration", status: "pending", date: null },
      { name: "WR Verification", status: "pending", date: null },
      { name: "Credit Assessment", status: "in_progress", date: null },
      { name: "Escrow Contract Creation", status: "pending", date: null },
      { name: "Funding Approved", status: "pending", date: null },
      { name: "Funds Released", status: "pending", date: null }
    ]
  }
];

// Get demo invoices
app.get('/api/invoices', async (req, res) => {
  try {
    res.json(demoInvoices);
  } catch (error) {
    console.error('Error getting invoices:', error);
    res.status(500).json({ error: 'Failed to get invoices' });
  }
});

// Get specific invoice
app.get('/api/invoices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = demoInvoices.find(inv => inv.id === id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    console.error('Error getting invoice:', error);
    res.status(500).json({ error: 'Failed to get invoice' });
  }
});

// Update invoice milestone (demo mode)
app.post('/api/invoices/:id/milestone', async (req, res) => {
  try {
    const { id } = req.params;
    const { milestoneName, status } = req.body;
    
    const invoice = demoInvoices.find(inv => inv.id === id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    const milestone = invoice.milestones.find(m => m.name === milestoneName);
    if (milestone) {
      milestone.status = status;
      if (status === 'completed') {
        milestone.date = new Date().toISOString().split('T')[0];
      }
    }
    
    res.json({ success: true, invoice });
  } catch (error) {
    console.error('Error updating milestone:', error);
    res.status(500).json({ error: 'Failed to update milestone' });
  }
});

// Register WR on blockchain (demo mode)
app.post('/api/invoices/:id/register-wr', async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = demoInvoices.find(inv => inv.id === id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Simulate blockchain transaction
    const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    const blockNumber = Math.floor(Math.random() * 1000000) + 5000000;
    
    // Update WR document
    invoice.wrDocument.transactionHash = transactionHash;
    invoice.wrDocument.verificationStatus = 'registered';
    
    // Update milestone
    const milestone = invoice.milestones.find(m => m.name === 'WR Blockchain Registration');
    if (milestone) {
      milestone.status = 'completed';
      milestone.date = new Date().toISOString().split('T')[0];
    }
    
    res.json({ 
      success: true, 
      invoice,
      transaction: {
        hash: transactionHash,
        blockNumber: blockNumber,
        gasUsed: '125,000',
        status: 'success'
      }
    });
  } catch (error) {
    console.error('Error registering WR:', error);
    res.status(500).json({ error: 'Failed to register WR' });
  }
});

// Verify WR through smart contract
app.post('/api/invoices/:id/verify-wr', async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = demoInvoices.find(inv => inv.id === id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Simulate smart contract verification
    const verificationTx = `0x${Math.random().toString(16).substr(2, 64)}`;
    const verificationBlock = Math.floor(Math.random() * 1000000) + 5000001;
    
    // Update WR document
    invoice.wrDocument.verificationStatus = 'verified';
    
    // Update milestone
    const milestone = invoice.milestones.find(m => m.name === 'WR Verification');
    if (milestone) {
      milestone.status = 'completed';
      milestone.date = new Date().toISOString().split('T')[0];
    }
    
    res.json({ 
      success: true, 
      invoice,
      verification: {
        transactionHash: verificationTx,
        blockNumber: verificationBlock,
        contractAddress: CONTRACT_ADDRESSES.WR_REGISTRY,
        verificationResult: 'PASSED',
        digitalSignatureValid: true,
        doublePledgeCheck: 'PASSED',
        issuerWhitelisted: true
      }
    });
  } catch (error) {
    console.error('Error verifying WR:', error);
    res.status(500).json({ error: 'Failed to verify WR' });
  }
});

// Create escrow contract
app.post('/api/invoices/:id/create-escrow', async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = demoInvoices.find(inv => inv.id === id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Simulate escrow contract creation
    const escrowTx = `0x${Math.random().toString(16).substr(2, 64)}`;
    const escrowBlock = Math.floor(Math.random() * 1000000) + 5000002;
    const escrowAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
    
    // Update milestone
    const milestone = invoice.milestones.find(m => m.name === 'Escrow Contract Creation');
    if (milestone) {
      milestone.status = 'completed';
      milestone.date = new Date().toISOString().split('T')[0];
    }
    
    res.json({ 
      success: true, 
      invoice,
      escrow: {
        contractAddress: escrowAddress,
        transactionHash: escrowTx,
        blockNumber: escrowBlock,
        amount: invoice.amount,
        token: 'MockUSD',
        status: 'ACTIVE',
        milestones: ['WR_ISSUED', 'FUNDING_COMPLETE', 'VERIFICATION_COMPLETE']
      }
    });
  } catch (error) {
    console.error('Error creating escrow:', error);
    res.status(500).json({ error: 'Failed to create escrow' });
  }
});

// Simulate FDC (Flare Data Connector) proof generation
app.post('/api/invoices/:id/simulate-fdc', async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = demoInvoices.find(inv => inv.id === id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Simulate FDC fetching data and producing proof
    const fdcTx = `0x${Math.random().toString(16).substr(2, 64)}`;
    const fdcBlock = Math.floor(Math.random() * 1000000) + 5000003;
    const proofHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    // Update milestone
    const milestone = invoice.milestones.find(m => m.name === 'Credit Assessment');
    if (milestone) {
      milestone.status = 'completed';
      milestone.date = new Date().toISOString().split('T')[0];
    }
    
    res.json({ 
      success: true, 
      invoice,
      fdc: {
        transactionHash: fdcTx,
        blockNumber: fdcBlock,
        proofHash: proofHash,
        dataSource: 'Mock Warehouse API',
        validators: 5,
        consensus: 'ACHIEVED',
        proofType: 'WR_ISSUED',
        confidence: 0.95
      }
    });
  } catch (error) {
    console.error('Error simulating FDC:', error);
    res.status(500).json({ error: 'Failed to simulate FDC' });
  }
});

// Create XRPL assets (WR-NFT and INV-IOU)
app.post('/api/invoices/:id/create-xrpl-assets', async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = demoInvoices.find(inv => inv.id === id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Simulate XRPL asset creation
    const wrNftTx = `0x${Math.random().toString(16).substr(2, 64)}`;
    const invIouTx = `0x${Math.random().toString(16).substr(2, 64)}`;
    const wrNftId = `WR-NFT-${Date.now()}`;
    const invIouId = `INV-IOU-${Date.now()}`;
    
    // Update milestone
    const milestone = invoice.milestones.find(m => m.name === 'Funding Approved');
    if (milestone) {
      milestone.status = 'completed';
      milestone.date = new Date().toISOString().split('T')[0];
    }
    
    res.json({ 
      success: true, 
      invoice,
      xrplAssets: {
        wrNft: {
          id: wrNftId,
          transactionHash: wrNftTx,
          owner: invoice.supplier,
          metadata: {
            commodity: invoice.commodity,
            quantity: invoice.quantity,
            warehouse: invoice.warehouse,
            wrId: invoice.wrId
          },
          status: 'MINTED'
        },
        invIou: {
          id: invIouId,
          transactionHash: invIouTx,
          owner: 'Lender Address',
          amount: invoice.amount,
          currency: invoice.currency,
          status: 'ISSUED'
        }
      }
    });
  } catch (error) {
    console.error('Error creating XRPL assets:', error);
    res.status(500).json({ error: 'Failed to create XRPL assets' });
  }
});

// Get XRPL assets for an invoice
app.get('/api/invoices/:id/xrpl-assets', async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = demoInvoices.find(inv => inv.id === id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Return mock XRPL assets
    res.json({
      wrNft: {
        id: `WR-NFT-${invoice.id}`,
        owner: invoice.supplier,
        metadata: {
          commodity: invoice.commodity,
          quantity: invoice.quantity,
          warehouse: invoice.warehouse,
          wrId: invoice.wrId
        },
        status: 'MINTED',
        xrplNetwork: 'Testnet'
      },
      invIou: {
        id: `INV-IOU-${invoice.id}`,
        owner: 'Lender Address',
        amount: invoice.amount,
        currency: invoice.currency,
        status: 'ISSUED',
        xrplNetwork: 'Testnet'
      }
    });
  } catch (error) {
    console.error('Error getting XRPL assets:', error);
    res.status(500).json({ error: 'Failed to get XRPL assets' });
  }
});

// Get marketplace deals
app.get('/api/deals', async (req, res) => {
  try {
    // For demo purposes, return mock data
    // In production, this would fetch from DealRegistry contract
    const mockDeals = [
      {
        id: "DEAL-001",
        wrId: "WR-2024-001",
        issuer: "AgriCorp Ltd",
        location: "Lagos, Nigeria",
        commodity: "Cocoa Beans",
        amount: 50000,
        requestedFunding: 40000,
        interestRate: 8.5,
        duration: 90,
        status: "listed",
        collateralType: "Warehouse Receipt",
        riskScore: 7.2,
        listedDate: "2024-01-15"
      },
      {
        id: "DEAL-002",
        wrId: "WR-2024-002",
        issuer: "Global Commodities",
        location: "Accra, Ghana",
        commodity: "Coffee Beans",
        amount: 75000,
        requestedFunding: 60000,
        interestRate: 7.8,
        duration: 120,
        status: "funded",
        collateralType: "Warehouse Receipt",
        riskScore: 8.1,
        listedDate: "2024-01-12"
      },
      {
        id: "DEAL-003",
        wrId: "WR-2024-003",
        issuer: "East African Traders",
        location: "Nairobi, Kenya",
        commodity: "Tea Leaves",
        amount: 30000,
        requestedFunding: 25000,
        interestRate: 9.2,
        duration: 60,
        status: "verified",
        collateralType: "Warehouse Receipt",
        riskScore: 6.8,
        listedDate: "2024-01-10"
      },
      {
        id: "DEAL-004",
        wrId: "WR-2024-004",
        issuer: "Sahel Agriculture",
        location: "Abidjan, Côte d'Ivoire",
        commodity: "Palm Oil",
        amount: 100000,
        requestedFunding: 80000,
        interestRate: 8.0,
        duration: 150,
        status: "listed",
        collateralType: "Warehouse Receipt",
        riskScore: 7.9,
        listedDate: "2024-01-08"
      }
    ];
    
    res.json(mockDeals);
  } catch (error) {
    console.error('Error getting deals:', error);
    res.status(500).json({ error: 'Failed to get deals' });
  }
});

// Fund a deal
app.post('/api/deals/:id/fund', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    // Simulate funding
    console.log(`Funding deal ${id} with amount ${amount}`);

    // In a real implementation, this would:
    // 1. Check if deal exists and is available for funding
    // 2. Verify lender has sufficient balance
    // 3. Transfer funds to escrow
    // 4. Update deal status
    // 5. Create transaction record

    res.json({
      success: true,
      message: `Successfully funded deal ${id}`,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      amount: amount
    });
  } catch (error) {
    console.error('Error funding deal:', error);
    res.status(500).json({ error: 'Failed to fund deal' });
  }
});

// Get user's positions
app.get('/api/positions/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Mock data for demo
    const mockPositions = [
      {
        dealId: "DEAL-002",
        wrId: "WR-2024-002",
        issuer: "Global Commodities",
        commodity: "Coffee Beans",
        investedAmount: 25000,
        currentValue: 26500,
        daysRemaining: 45,
        status: "active"
      },
      {
        dealId: "DEAL-004",
        wrId: "WR-2024-004",
        issuer: "Tropical Exports",
        commodity: "Palm Oil",
        investedAmount: 15000,
        currentValue: 15750,
        daysRemaining: 62,
        status: "active"
      }
    ];
    
    res.json(mockPositions);
  } catch (error) {
    console.error('Error getting positions:', error);
    res.status(500).json({ error: 'Failed to get positions' });
  }
});

// Get secondary market listings
app.get('/api/secondary-market', async (req, res) => {
  try {
    // Mock data for demo
    const mockListings = [
      {
        id: "SEC-001",
        originalDealId: "DEAL-003",
        wrId: "WR-2024-003",
        issuer: "Timber Co Ltd",
        commodity: "Hardwood Lumber",
        originalAmount: 30000,
        remainingAmount: 30000,
        askingPrice: 28500,
        currentYield: 9.2,
        daysToMaturity: 55,
        listedBy: "0x742d...89f3",
        listedDate: "2024-01-18",
        status: "listed"
      }
    ];
    
    res.json(mockListings);
  } catch (error) {
    console.error('Error getting secondary market listings:', error);
    res.status(500).json({ error: 'Failed to get secondary market listings' });
  }
});

// Get marketplace statistics
app.get('/api/stats', async (req, res) => {
  try {
    // Mock data for demo
    const stats = {
      totalDeals: 4,
      totalVolume: 255000,
      totalFunded: 85000,
      averageInterestRate: 8.4,
      averageRiskScore: 7.5
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Get recent activity
app.get('/api/activity/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Mock data for demo
    const mockActivity = [
      {
        id: "DEAL-001",
        action: "Deal Listed",
        amount: "$50,000",
        status: "listed",
        time: "2 hours ago"
      },
      {
        id: "DEAL-002",
        action: "Deal Funded",
        amount: "$60,000",
        status: "funded",
        time: "1 day ago"
      }
    ];
    
    res.json(mockActivity);
  } catch (error) {
    console.error('Error getting activity:', error);
    res.status(500).json({ error: 'Failed to get activity' });
  }
});

// Fund a deal
app.post('/api/deals/:dealId/fund', async (req, res) => {
  try {
    const { dealId } = req.params;
    const { userAddress, privateKey } = req.body;
    
    // In production, this would interact with the smart contract
    console.log(`Funding deal ${dealId} for user ${userAddress}`);
    
    // Mock response
    res.json({
      success: true,
      transactionHash: "0x" + Math.random().toString(16).substr(2, 64),
      message: "Deal funded successfully"
    });
  } catch (error) {
    console.error('Error funding deal:', error);
    res.status(500).json({ error: 'Failed to fund deal' });
  }
});

// List a position
app.post('/api/positions/list', async (req, res) => {
  try {
    const { dealId, askingPrice, userAddress } = req.body;
    
    // In production, this would interact with the smart contract
    console.log(`Listing position for deal ${dealId} at price ${askingPrice}`);
    
    // Mock response
    res.json({
      success: true,
      listingId: "SEC-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      message: "Position listed successfully"
    });
  } catch (error) {
    console.error('Error listing position:', error);
    res.status(500).json({ error: 'Failed to list position' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend_trade/trade-proof-gateway-main/dist/index.html'));
});

// WR Attachment API Routes

// Helper function to compute keccak256 hash
function computeKeccak256Hash(buffer) {
  return '0x' + crypto.createHash('sha3-256').update(buffer).digest('hex');
}

// Helper function to simulate IPFS pinning (demo implementation)
async function pinToIPFS(fileBuffer, fileName) {
  // In a real implementation, this would use IPFS client
  // For demo purposes, we'll simulate with a mock CID
  const mockCid = 'Qm' + crypto.randomBytes(20).toString('base58');
  console.log(`📌 Simulated IPFS pin: ${fileName} -> ${mockCid}`);
  return mockCid;
}

// POST /api/invoices/:invoiceId/wr-attachment
app.post('/api/invoices/:invoiceId/wr-attachment', upload.single('file'), async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, size, buffer, mimetype } = req.file;
    
    // Validate file type
    if (mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    // Validate file size (already handled by multer, but double-check)
    if (size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 10MB limit' });
    }

    // Compute wrFileHash (keccak256 of raw file bytes)
    const wrFileHash = computeKeccak256Hash(buffer);
    
    // Try to pin to IPFS (simulated)
    let fileCid = null;
    let status = 'local';
    
    try {
      fileCid = await pinToIPFS(buffer, originalname);
      status = 'pinned';
    } catch (ipfsError) {
      console.warn('IPFS pinning failed:', ipfsError.message);
      // Continue without IPFS
    }

    // Create attachment record
    const attachment = {
      id: `wr-attachment-${Date.now()}`,
      invoiceId,
      fileName: originalname,
      fileSize: size,
      wrFileHash,
      fileCid,
      uploadedAt: new Date().toISOString(),
      status,
      replacedAt: null,
      removedAt: null
    };

    // Store attachment (replace any existing one for this invoice)
    wrAttachments.set(invoiceId, attachment);

    console.log(`📎 WR attachment created for invoice ${invoiceId}:`, {
      fileName: originalname,
      fileSize: size,
      wrFileHash: wrFileHash.substring(0, 16) + '...',
      fileCid: fileCid ? fileCid.substring(0, 16) + '...' : null,
      status
    });

    res.json({
      success: true,
      attachment
    });

  } catch (error) {
    console.error('Error uploading WR attachment:', error);
    res.status(500).json({ error: 'Failed to upload WR attachment' });
  }
});

// GET /api/invoices/:invoiceId/wr-attachment
app.get('/api/invoices/:invoiceId/wr-attachment', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const attachment = wrAttachments.get(invoiceId);
    
    if (!attachment) {
      return res.status(404).json({ error: 'No WR attachment found for this invoice' });
    }

    res.json({
      success: true,
      attachment
    });

  } catch (error) {
    console.error('Error fetching WR attachment:', error);
    res.status(500).json({ error: 'Failed to fetch WR attachment' });
  }
});

// DELETE /api/invoices/:invoiceId/wr-attachment/:id
app.delete('/api/invoices/:invoiceId/wr-attachment/:id', async (req, res) => {
  try {
    const { invoiceId, id } = req.params;
    const attachment = wrAttachments.get(invoiceId);
    
    if (!attachment || attachment.id !== id) {
      return res.status(404).json({ error: 'WR attachment not found' });
    }

    // Soft delete - mark as removed
    attachment.status = 'removed';
    attachment.removedAt = new Date().toISOString();
    
    wrAttachments.set(invoiceId, attachment);

    console.log(`🗑️ WR attachment removed for invoice ${invoiceId}:`, id);

    res.json({
      success: true,
      message: 'WR attachment removed successfully'
    });

  } catch (error) {
    console.error('Error removing WR attachment:', error);
    res.status(500).json({ error: 'Failed to remove WR attachment' });
  }
});

// POST /api/invoices/register-wr-hash
app.post('/api/invoices/register-wr-hash', async (req, res) => {
  try {
    const { wrId, wrFileHash, fileCid } = req.body;
    
    if (!wrId || !wrFileHash) {
      return res.status(400).json({ error: 'Missing required fields: wrId, wrFileHash' });
    }

    // Simulate smart contract interaction
    // In a real implementation, this would call the actual WRRegistry contract
    const mockTransactionHash = '0x' + crypto.randomBytes(32).toString('hex');
    
    console.log(`🔗 Simulating WR hash registration on blockchain:`, {
      wrId,
      wrFileHash: wrFileHash.substring(0, 16) + '...',
      fileCid: fileCid ? fileCid.substring(0, 16) + '...' : null,
      transactionHash: mockTransactionHash
    });

    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real implementation, you would:
    // 1. Connect to the blockchain
    // 2. Call WRRegistry.registerWR(wrId, wrFileHash)
    // 3. Wait for transaction confirmation
    // 4. Return actual transaction hash

    res.json({
      success: true,
      message: 'WR hash registered on blockchain successfully',
      transactionHash: mockTransactionHash,
      wrId,
      wrFileHash,
      fileCid,
      blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
      gasUsed: Math.floor(Math.random() * 50000) + 100000
    });

  } catch (error) {
    console.error('Error registering WR hash on blockchain:', error);
    res.status(500).json({ error: 'Failed to register WR hash on blockchain' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend served at http://localhost:${PORT}`);
});
