import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WRDocumentViewer from "@/components/WRDocumentViewer";
import XRPLAssets from "@/components/XRPLAssets";
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Download,
  Eye,
  Play,
  Pause,
  RotateCcw,
  Shield,
  Hash
} from "lucide-react";

interface Document {
  name: string;
  type: string;
  verified: boolean;
  hash?: string;
}

interface Milestone {
  name: string;
  status: 'completed' | 'in_progress' | 'pending';
  date: string | null;
}

interface WRDocument {
  id: string;
  warehouseName: string;
  warehouseAddress: string;
  warehouseLicense: string;
  commodity: string;
  grade: string;
  quantity: string;
  unit: string;
  batchNumber: string;
  harvestDate: string;
  storageDate: string;
  expiryDate: string;
  storageConditions: string;
  qualityCert: string;
  inspector: string;
  inspectorLicense: string;
  digitalSignature: string;
  blockchainHash: string;
  verificationStatus: 'pending' | 'registered' | 'verified';
  contractAddress: string;
  transactionHash: string | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  supplier: string;
  buyer: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: string;
  commodity: string;
  quantity: string;
  location: string;
  warehouse: string;
  wrId: string;
  createdAt: string;
  wrDocument: WRDocument;
  documents: Document[];
  milestones: Milestone[];
}

const InvoiceManagement: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      const data = await response.json();
      setInvoices(data);
      if (data.length > 0) {
        setSelectedInvoice(data[0]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      // Set fallback data to ensure content is always shown
      const fallbackInvoices = [
        {
          id: "INV-001",
          invoiceNumber: "INV-2024-001",
          supplier: "AgriCorp Ltd",
          buyer: "Global Trading Co",
          amount: 50000,
          currency: "USD",
          dueDate: "2024-03-15",
          status: "pending",
          commodity: "Cocoa Beans",
          quantity: "100 MT",
          location: "Lagos, Nigeria",
          warehouse: "Lagos Port Warehouse",
          wrId: "WR-2024-001",
          createdAt: "2024-01-15",
          wrDocument: {
            wrId: "WR-2024-001",
            warehouseName: "Lagos Port Warehouse",
            warehouseAddress: "123 Port Road, Lagos, Nigeria",
            commodity: "Cocoa Beans",
            grade: "Grade A",
            quantity: "100 MT",
            batchNumber: "BATCH-001",
            storageDate: "2024-01-10",
            storageConditions: "Temperature controlled",
            qualityCert: "ISO 9001",
            inspector: "John Doe",
            inspectorLicense: "LIC-12345",
            digitalSignature: "0x1234567890abcdef",
            blockchainHash: "0xabcdef1234567890",
            verificationStatus: "pending",
            contractAddress: "0xContract123",
            transactionHash: null
          },
          documents: [
            { name: "Warehouse Receipt", type: "pdf", verified: true, hash: "0x123" },
            { name: "Quality Certificate", type: "pdf", verified: false, hash: "0x456" },
            { name: "Insurance Policy", type: "pdf", verified: true, hash: "0x789" }
          ],
          milestones: [
            { name: "Invoice Creation", status: "completed", date: "2024-01-15" },
            { name: "Document Upload", status: "completed", date: "2024-01-16" },
            { name: "WR Blockchain Registration", status: "pending", date: null },
            { name: "WR Verification", status: "pending", date: null },
            { name: "Credit Assessment", status: "in_progress", date: "2024-01-17" },
            { name: "Escrow Contract Creation", status: "pending", date: null },
            { name: "Funding Approved", status: "pending", date: null },
            { name: "Funds Release", status: "pending", date: null },
            { name: "Repayment", status: "pending", date: null }
          ]
        }
      ];
      setInvoices(fallbackInvoices);
      setSelectedInvoice(fallbackInvoices[0]);
      setIsLoading(false);
    }
  };

  const updateMilestone = async (invoiceId: string, milestoneName: string, status: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/milestone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ milestoneName, status }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setInvoices(invoices.map(inv => inv.id === invoiceId ? result.invoice : inv));
        if (selectedInvoice?.id === invoiceId) {
          setSelectedInvoice(result.invoice);
        }
      }
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  const registerWR = async () => {
    if (!selectedInvoice) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/invoices/${selectedInvoice.id}/register-wr`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        setInvoices(invoices.map(inv => inv.id === selectedInvoice.id ? result.invoice : inv));
        setSelectedInvoice(result.invoice);
        console.log('WR Registration Transaction:', result.transaction);
      }
    } catch (error) {
      console.error('Error registering WR:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyWR = async () => {
    if (!selectedInvoice) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/invoices/${selectedInvoice.id}/verify-wr`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        setInvoices(invoices.map(inv => inv.id === selectedInvoice.id ? result.invoice : inv));
        setSelectedInvoice(result.invoice);
        console.log('WR Verification Result:', result.verification);
      }
    } catch (error) {
      console.error('Error verifying WR:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const createEscrow = async () => {
    if (!selectedInvoice) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/invoices/${selectedInvoice.id}/create-escrow`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        setInvoices(invoices.map(inv => inv.id === selectedInvoice.id ? result.invoice : inv));
        setSelectedInvoice(result.invoice);
        console.log('Escrow Contract Created:', result.escrow);
      }
    } catch (error) {
      console.error('Error creating escrow:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateFDC = async () => {
    if (!selectedInvoice) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/invoices/${selectedInvoice.id}/simulate-fdc`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        setInvoices(invoices.map(inv => inv.id === selectedInvoice.id ? result.invoice : inv));
        setSelectedInvoice(result.invoice);
        console.log('FDC Simulation Result:', result.fdc);
      }
    } catch (error) {
      console.error('Error simulating FDC:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const createXRPLAssets = async () => {
    if (!selectedInvoice) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/invoices/${selectedInvoice.id}/create-xrpl-assets`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        setInvoices(invoices.map(inv => inv.id === selectedInvoice.id ? result.invoice : inv));
        setSelectedInvoice(result.invoice);
        console.log('XRPL Assets Created:', result.xrplAssets);
      }
    } catch (error) {
      console.error('Error creating XRPL assets:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const runDemoFlow = async () => {
    if (!selectedInvoice) return;
    
    const milestones = selectedInvoice.milestones;
    let step = 0;
    
    const runStep = async () => {
      if (step < milestones.length) {
        const milestone = milestones[step];
        if (milestone.status === 'pending') {
          // Execute the actual action for each step
          if (milestone.name === 'WR Blockchain Registration') {
            await registerWR();
          } else if (milestone.name === 'WR Verification') {
            await verifyWR();
          } else if (milestone.name === 'Credit Assessment') {
            await simulateFDC();
          } else if (milestone.name === 'Escrow Contract Creation') {
            await createEscrow();
          } else if (milestone.name === 'Funding Approved') {
            await createXRPLAssets();
          } else {
            await updateMilestone(selectedInvoice.id, milestone.name, 'in_progress');
          }
        }
        step++;
        setCurrentStep(step);
        
        if (step < milestones.length) {
          setTimeout(runStep, 3000); // 3 second delay between steps
        }
      }
    };
    
    await runStep();
  };

  const resetDemo = async () => {
    if (!selectedInvoice) return;
    
    // Reset all milestones to their initial state
    const initialStates = [
      'completed', 'completed', 'completed', 'pending', 'pending', 'in_progress', 'pending', 'pending', 'pending'
    ];
    
    for (let i = 0; i < selectedInvoice.milestones.length; i++) {
      const milestone = selectedInvoice.milestones[i];
      const newStatus = initialStates[i] || 'pending';
      await updateMilestone(selectedInvoice.id, milestone.name, newStatus);
    }
    
    // Reset WR document status
    if (selectedInvoice.wrDocument) {
      selectedInvoice.wrDocument.verificationStatus = 'pending';
      selectedInvoice.wrDocument.transactionHash = null;
    }
    
    setCurrentStep(0);
    setIsProcessing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold glow-text">Invoice Management</h1>
          <p className="text-muted-foreground mt-2">
            Track trade finance invoices from creation to credit
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={runDemoFlow}
            className="btn-primary"
            disabled={!selectedInvoice}
          >
            <Play className="w-4 h-4 mr-2" />
            Run Demo Flow
          </Button>
          <Button 
            onClick={resetDemo}
            variant="outline"
            disabled={!selectedInvoice}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Demo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice List */}
        <div className="lg:col-span-1">
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Invoices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedInvoice?.id === invoice.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                      : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                  }`}
                  onClick={() => setSelectedInvoice(invoice)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.supplier} → {invoice.buyer}
                      </p>
                      <p className="text-sm font-medium text-emerald-600">
                        ${invoice.amount.toLocaleString()} {invoice.currency}
                      </p>
                    </div>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Invoice Details */}
        <div className="lg:col-span-2">
          {selectedInvoice ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="wr-document">WR Document</TabsTrigger>
                <TabsTrigger value="xrpl-assets">XRPL Assets</TabsTrigger>
                <TabsTrigger value="process">Process Flow</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Invoice Header */}
                <Card className="card-glow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{selectedInvoice.invoiceNumber}</CardTitle>
                      <CardDescription>
                        {selectedInvoice.commodity} • {selectedInvoice.quantity} • {selectedInvoice.location}
                      </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(selectedInvoice.status)} text-white`}>
                      {selectedInvoice.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Supplier</p>
                      <p className="font-medium">{selectedInvoice.supplier}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Buyer</p>
                      <p className="font-medium">{selectedInvoice.buyer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-medium">${selectedInvoice.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Due Date</p>
                      <p className="font-medium">{selectedInvoice.dueDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Process Flow */}
              <Card className="card-glow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Trade Finance Process
                  </CardTitle>
                  <CardDescription>
                    Step-by-step process from invoice to credit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedInvoice.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getStatusColor(milestone.status)}`}>
                          {getStatusIcon(milestone.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <p className="font-medium">{milestone.name}</p>
                            {milestone.date && (
                              <p className="text-sm text-muted-foreground">{milestone.date}</p>
                            )}
                          </div>
                          {milestone.status === 'in_progress' && (
                            <Progress value={50} className="mt-2" />
                          )}
                        </div>
                        {milestone.status === 'pending' && isDemoMode && (
                          <Button
                            size="sm"
                            onClick={() => updateMilestone(selectedInvoice.id, milestone.name, 'in_progress')}
                          >
                            Start
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card className="card-glow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedInvoice.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">{doc.type.toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.verified ? (
                            <Badge className="bg-green-500 text-white">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              </TabsContent>

              <TabsContent value="wr-document" className="space-y-6">
                <WRDocumentViewer
                  wrDocument={selectedInvoice.wrDocument}
                  onRegisterWR={registerWR}
                  onVerifyWR={verifyWR}
                  onCreateEscrow={createEscrow}
                  isProcessing={isProcessing}
                />
              </TabsContent>

              <TabsContent value="xrpl-assets" className="space-y-6">
                <XRPLAssets
                  invoiceId={selectedInvoice.id}
                  onSimulateFDC={simulateFDC}
                  onCreateAssets={createXRPLAssets}
                  isProcessing={isProcessing}
                />
              </TabsContent>

              <TabsContent value="process" className="space-y-6">
                {/* Process Flow with Actions */}
                <Card className="card-glow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      Trade Finance Process
                    </CardTitle>
                    <CardDescription>
                      Step-by-step process from invoice to credit - Click actions to progress
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {selectedInvoice.milestones.map((milestone, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getStatusColor(milestone.status)}`}>
                            {getStatusIcon(milestone.status)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="text-lg font-semibold">{milestone.name}</h3>
                              {milestone.date && (
                                <p className="text-sm text-muted-foreground">{milestone.date}</p>
                              )}
                            </div>
                            
                            {/* Action Buttons for each step */}
                            {milestone.name === 'WR Blockchain Registration' && milestone.status === 'pending' && (
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Register the warehouse receipt hash on the blockchain to prevent double-pledging</p>
                                <Button onClick={registerWR} disabled={isProcessing} className="btn-primary">
                                  <Hash className="w-4 h-4 mr-2" />
                                  Register WR on Blockchain
                                </Button>
                              </div>
                            )}
                            
                            {milestone.name === 'WR Verification' && milestone.status === 'pending' && (
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Verify the warehouse receipt through smart contract validation</p>
                                <Button onClick={verifyWR} disabled={isProcessing} className="btn-primary">
                                  <Shield className="w-4 h-4 mr-2" />
                                  Verify WR
                                </Button>
                              </div>
                            )}
                            
                            {milestone.name === 'Credit Assessment' && milestone.status === 'in_progress' && (
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Simulate Flare Data Connector fetching real-world data and producing cryptographic proof</p>
                                <Button onClick={simulateFDC} disabled={isProcessing} className="btn-primary">
                                  <Database className="w-4 h-4 mr-2" />
                                  Simulate FDC Proof
                                </Button>
                              </div>
                            )}
                            
                            {milestone.name === 'Escrow Contract Creation' && milestone.status === 'pending' && (
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Create smart contract escrow to hold lender funds</p>
                                <Button onClick={createEscrow} disabled={isProcessing} className="btn-primary">
                                  <FileText className="w-4 h-4 mr-2" />
                                  Create Escrow Contract
                                </Button>
                              </div>
                            )}
                            
                            {milestone.name === 'Funding Approved' && milestone.status === 'pending' && (
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Create XRPL assets: WR-NFT for SME and INV-IOU for lender</p>
                                <Button onClick={createXRPLAssets} disabled={isProcessing} className="btn-primary">
                                  <Building className="w-4 h-4 mr-2" />
                                  Create XRPL Assets
                                </Button>
                              </div>
                            )}
                            
                            {milestone.status === 'completed' && (
                              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-lg p-3">
                                <p className="text-sm text-green-800 dark:text-green-200">
                                  ✅ {milestone.name} completed successfully
                                </p>
                              </div>
                            )}
                            
                            {milestone.status === 'in_progress' && milestone.name !== 'Credit Assessment' && (
                              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-3">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                  🔄 {milestone.name} in progress...
                                </p>
                                <Progress value={50} className="mt-2" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* System Architecture */}
                <Card className="card-glow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      System Architecture
                    </CardTitle>
                    <CardDescription>
                      How Flare and XRPL work together
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          <h4 className="font-semibold">Flare (Coston2)</h4>
                          <Badge className="bg-orange-500 text-white text-xs">The Brain + Lockbox</Badge>
                        </div>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• WRRegistry: Prevents double-pledging</li>
                          <li>• ProofRegistry: One-time use proofs</li>
                          <li>• MilestoneEscrow: Holds and releases funds</li>
                          <li>• FDC: Fetches real-world data</li>
                        </ul>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <h4 className="font-semibold">XRPL Testnet</h4>
                          <Badge className="bg-blue-500 text-white text-xs">The Badge + Receipt</Badge>
                        </div>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• WR-NFT: Visible proof of collateral</li>
                          <li>• INV-IOU: Lender's claim token</li>
                          <li>• Fast Payments: Quick settlements</li>
                          <li>• NFT Ecosystem: Portable assets</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="card-glow">
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Select an invoice to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceManagement;
