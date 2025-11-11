import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WRProofTile from "@/components/WRProofTile";
import { 
  FileText, 
  Building, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  Eye,
  Hash,
  Shield,
  Database,
  Building2,
  DollarSign,
  Search,
  Filter,
  Plus,
  Upload,
  X,
  FileCheck,
  AlertTriangle,
  Paperclip
} from "lucide-react";

interface WarehouseReceipt {
  id: string;
  wrId: string;
  warehouseName: string;
  warehouseAddress: string;
  commodity: string;
  grade: string;
  quantity: string;
  batchNumber: string;
  storageDate: string;
  inspector: string;
  inspectorLicense: string;
  digitalSignature: string;
  blockchainHash: string;
  verificationStatus: 'pending' | 'registered' | 'verified';
  contractAddress: string;
  transactionHash: string | null;
  createdAt: string;
  supplier: string;
  buyer: string;
  amount: number;
  currency: string;
  uploadedPdf?: string;
  isDuplicate?: boolean;
  duplicateReason?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  hash: string;
  uploadDate: string;
  isDuplicate: boolean;
  duplicateOf?: string;
}

interface WRAttachment {
  id: string;
  invoiceId: string;
  fileName: string;
  fileSize: number;
  wrFileHash: string;
  fileCid: string | null;
  uploadedAt: string;
  status: 'pinned' | 'local' | 'removed';
  replacedAt?: string | null;
  removedAt?: string | null;
}

const WarehouseReceipts: React.FC = () => {
  const [warehouseReceipts, setWarehouseReceipts] = useState<WarehouseReceipt[]>([]);
  const [selectedWR, setSelectedWR] = useState<WarehouseReceipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [wrAttachment, setWrAttachment] = useState<WRAttachment | null>(null);
  const [isUploadingWR, setIsUploadingWR] = useState(false);
  const [isReplacingWR, setIsReplacingWR] = useState(false);
  const [blockchainStatus, setBlockchainStatus] = useState<{
    isRegistered: boolean;
    transactionHash?: string;
    blockNumber?: number;
  }>({ isRegistered: false });

  // Sample warehouse receipt data
  const sampleWRs: WarehouseReceipt[] = [
    {
      id: "WR-001",
      wrId: "WR-2024-001",
      warehouseName: "Lagos Port Warehouse",
      warehouseAddress: "123 Port Road, Lagos, Nigeria",
      commodity: "Cocoa Beans",
      grade: "Grade A",
      quantity: "100 MT",
      batchNumber: "BATCH-001",
      storageDate: "2024-01-10",
      inspector: "John Doe",
      inspectorLicense: "LIC-12345",
      digitalSignature: "0x1234567890abcdef",
      blockchainHash: "0xabcdef1234567890",
      verificationStatus: "verified",
      contractAddress: "0xContract123",
      transactionHash: "0xTxHash123456789",
      createdAt: "2024-01-15",
      supplier: "AgriCorp Ltd",
      buyer: "Global Trading Co",
      amount: 50000,
      currency: "USD"
    },
    {
      id: "WR-002",
      wrId: "WR-2024-002",
      warehouseName: "Accra Storage Facility",
      warehouseAddress: "456 Storage Ave, Accra, Ghana",
      commodity: "Coffee Beans",
      grade: "Premium",
      quantity: "75 MT",
      batchNumber: "BATCH-002",
      storageDate: "2024-01-12",
      inspector: "Sarah Johnson",
      inspectorLicense: "LIC-67890",
      digitalSignature: "0x9876543210fedcba",
      blockchainHash: "0xfedcba0987654321",
      verificationStatus: "registered",
      contractAddress: "0xContract456",
      transactionHash: "0xTxHash987654321",
      createdAt: "2024-01-18",
      supplier: "Coffee Traders Inc",
      buyer: "European Importers",
      amount: 75000,
      currency: "USD"
    },
    {
      id: "WR-003",
      wrId: "WR-2024-003",
      warehouseName: "Nairobi Cold Storage",
      warehouseAddress: "789 Cold St, Nairobi, Kenya",
      commodity: "Tea Leaves",
      grade: "Organic",
      quantity: "50 MT",
      batchNumber: "BATCH-003",
      storageDate: "2024-01-14",
      inspector: "Michael Chen",
      inspectorLicense: "LIC-54321",
      digitalSignature: "0x5555555555555555",
      blockchainHash: "0x6666666666666666",
      verificationStatus: "pending",
      contractAddress: "0xContract789",
      transactionHash: null,
      createdAt: "2024-01-20",
      supplier: "Tea Plantations Ltd",
      buyer: "Asian Markets Co",
      amount: 30000,
      currency: "USD"
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setWarehouseReceipts(sampleWRs);
      setSelectedWR(sampleWRs[0]);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Fetch WR attachment when selected WR changes
  useEffect(() => {
    if (selectedWR) {
      fetchWRAttachment(selectedWR.id);
    }
  }, [selectedWR]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-500';
      case 'registered': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'registered': return <Database className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Simple hash function for file content
  const generateFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Check if file is duplicate
  const checkForDuplicate = (fileHash: string): UploadedFile | null => {
    return uploadedFiles.find(file => file.hash === fileHash) || null;
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    console.log('handleFileUpload called with file:', file);
    console.log('File type:', file.type);
    console.log('File size:', file.size);
    
    if (file.type !== 'application/pdf') {
      console.log('Invalid file type:', file.type);
      alert('Please upload a PDF file only.');
      return;
    }

    console.log('Starting upload process...');
    setIsUploading(true);
    
    try {
      // Generate file hash
      console.log('Generating file hash...');
      const fileHash = await generateFileHash(file);
      console.log('File hash generated:', fileHash);
      
      // Check for duplicates
      const duplicateFile = checkForDuplicate(fileHash);
      console.log('Duplicate check result:', duplicateFile);
      
      const newFile: UploadedFile = {
        id: `file-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        hash: fileHash,
        uploadDate: new Date().toISOString(),
        isDuplicate: !!duplicateFile,
        duplicateOf: duplicateFile?.id
      };

      console.log('New file object:', newFile);
      setUploadedFiles(prev => [...prev, newFile]);

      // Update selected WR if it exists
      if (selectedWR) {
        console.log('Updating selected WR:', selectedWR.id);
        const updatedWR = {
          ...selectedWR,
          uploadedPdf: newFile.id,
          isDuplicate: newFile.isDuplicate,
          duplicateReason: newFile.isDuplicate ? `This invoice is a duplicate of ${duplicateFile?.name}` : undefined
        };
        
        setSelectedWR(updatedWR);
        
        // Update the WR in the list
        setWarehouseReceipts(prev => 
          prev.map(wr => wr.id === selectedWR.id ? updatedWR : wr)
        );
      }

      if (newFile.isDuplicate) {
        alert(`⚠️ DUPLICATE DETECTED!\n\nThis invoice has been uploaded before as: ${duplicateFile?.name}\n\nUpload Date: ${new Date(duplicateFile?.uploadDate || '').toLocaleDateString()}`);
      } else {
        alert(`✅ File uploaded successfully!\n\nFile: ${file.name}\nHash: ${fileHash.substring(0, 16)}...`);
      }

    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed:', e.target.files);
    if (e.target.files && e.target.files[0]) {
      console.log('File selected:', e.target.files[0]);
      handleFileUpload(e.target.files[0]);
    }
  };

  // WR Attachment functions
  const fetchWRAttachment = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/wr-attachment`);
      if (response.ok) {
        const data = await response.json();
        setWrAttachment(data.attachment);
      } else if (response.status === 404) {
        setWrAttachment(null);
      }
    } catch (error) {
      console.error('Error fetching WR attachment:', error);
    }
  };

  const uploadWRAttachment = async (file: File) => {
    if (!selectedWR) return;

    setIsUploadingWR(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/invoices/${selectedWR.id}/wr-attachment`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setWrAttachment(data.attachment);
        alert(`✅ WR PDF uploaded successfully!\n\nFile: ${file.name}\nHash: ${data.attachment.wrFileHash.substring(0, 16)}...`);
      } else {
        const error = await response.json();
        alert(`❌ Upload failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error uploading WR attachment:', error);
      alert('Error uploading WR attachment. Please try again.');
    } finally {
      setIsUploadingWR(false);
    }
  };

  const replaceWRAttachment = async (file: File) => {
    if (!selectedWR) return;

    setIsReplacingWR(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/invoices/${selectedWR.id}/wr-attachment`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setWrAttachment(data.attachment);
        alert(`✅ WR PDF replaced successfully!\n\nFile: ${file.name}\nHash: ${data.attachment.wrFileHash.substring(0, 16)}...\n\n⚠️ Hash updated for proof verification.`);
      } else {
        const error = await response.json();
        alert(`❌ Replace failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error replacing WR attachment:', error);
      alert('Error replacing WR attachment. Please try again.');
    } finally {
      setIsReplacingWR(false);
    }
  };

  const removeWRAttachment = async () => {
    if (!selectedWR || !wrAttachment) return;

    try {
      const response = await fetch(`/api/invoices/${selectedWR.id}/wr-attachment/${wrAttachment.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setWrAttachment(null);
        alert('✅ WR attachment removed successfully');
      } else {
        const error = await response.json();
        alert(`❌ Remove failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error removing WR attachment:', error);
      alert('Error removing WR attachment. Please try again.');
    }
  };

  const useInProofFlow = async () => {
    if (!wrAttachment) return;
    
    const eventData = {
      invoiceId: wrAttachment.invoiceId,
      wrFileHash: wrAttachment.wrFileHash,
      fileCid: wrAttachment.fileCid
    };
    
    console.log('🚀 onWrFilePrepared event:', eventData);
    
    try {
      // Simulate smart contract interaction
      const response = await fetch('/api/invoices/register-wr-hash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wrId: wrAttachment.invoiceId,
          wrFileHash: wrAttachment.wrFileHash,
          fileCid: wrAttachment.fileCid
        })
      });

      if (response.ok) {
        const result = await response.json();
        setBlockchainStatus({
          isRegistered: true,
          transactionHash: result.transactionHash,
          blockNumber: result.blockNumber
        });
        alert(`✅ WR hash registered on blockchain!\n\nTransaction: ${result.transactionHash}\nBlock: ${result.blockNumber}\nGas Used: ${result.gasUsed}\n\nEvent data:\n${JSON.stringify(eventData, null, 2)}`);
      } else {
        throw new Error('Failed to register on blockchain');
      }
    } catch (error) {
      console.error('Smart contract error:', error);
      alert(`⚠️ Smart contract interaction failed, but WR data is ready:\n\n${JSON.stringify(eventData, null, 2)}\n\nError: ${error.message}`);
    }
  };

  const handleWRAttachmentUpload = (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file only.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    if (wrAttachment) {
      replaceWRAttachment(file);
    } else {
      uploadWRAttachment(file);
    }
  };

  // Handle click on upload area
  const handleUploadClick = () => {
    console.log('Upload area clicked');
    const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const filteredWRs = warehouseReceipts.filter(wr => {
    if (filterStatus !== "all" && wr.verificationStatus !== filterStatus) return false;
    if (searchTerm && !wr.commodity.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !wr.warehouseName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="ml-2">Loading warehouse receipts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold glow-text">Warehouse Receipts</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track warehouse receipts for trade finance
          </p>
        </div>
        <div className="flex gap-3">
          <Button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add New WR
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="card-glow">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search by commodity or warehouse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-background"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="registered">Registered</option>
              <option value="verified">Verified</option>
            </select>
            <Button variant="outline" className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* WR List */}
        <div className="lg:col-span-1">
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Warehouse Receipts ({filteredWRs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredWRs.map((wr) => (
                  <div
                    key={wr.id}
                    onClick={() => setSelectedWR(wr)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedWR?.id === wr.id 
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' 
                        : 'hover:border-gray-300'
                    } ${wr.isDuplicate ? 'border-red-200 bg-red-50 dark:bg-red-950/10' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{wr.wrId}</h3>
                        {wr.isDuplicate && (
                          <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                            <X className="w-4 h-4" />
                            <span className="text-xs font-medium">DUPLICATE</span>
                          </div>
                        )}
                      </div>
                      <Badge className={`${getStatusColor(wr.verificationStatus)} text-white`}>
                        {wr.verificationStatus.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{wr.commodity} - {wr.quantity}</p>
                    <p className="text-sm text-muted-foreground">{wr.warehouseName}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(wr.verificationStatus)}`}></div>
                      <span className="text-xs text-muted-foreground">
                        {wr.verificationStatus === 'verified' ? 'Verified' : 
                         wr.verificationStatus === 'registered' ? 'On Blockchain' : 'Pending'}
                      </span>
                      {wr.uploadedPdf && (
                        <div className="flex items-center gap-1 ml-2">
                          <FileText className="w-3 h-3 text-blue-500" />
                          <span className="text-xs text-blue-500">PDF</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* WR Details */}
        <div className="lg:col-span-2">
          {selectedWR ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Duplicate Warning */}
                {selectedWR.isDuplicate && (
                  <Card className="card-glow border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                          <X className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-red-800 dark:text-red-200">Duplicate Invoice Detected</h3>
                          <p className="text-sm text-red-600 dark:text-red-300">{selectedWR.duplicateReason}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* PDF Upload Section */}
                <Card className="card-glow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Upload Invoice PDF
                    </CardTitle>
                    <CardDescription>
                      Upload the original invoice PDF for verification and duplicate detection
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                        dragActive 
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={handleUploadClick}
                    >
                      {isUploading ? (
                        <div className="space-y-4">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
                          <p className="text-muted-foreground">Processing file...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                            <Upload className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-lg font-medium">Drop your PDF here</p>
                            <p className="text-sm text-muted-foreground">or click to browse files</p>
                          </div>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileInputChange}
                            className="hidden"
                            id="pdf-upload"
                          />
                          <div
                            className="btn-primary cursor-pointer inline-flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUploadClick();
                            }}
                          >
                            <Upload className="w-4 h-4" />
                            Choose PDF File
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Uploaded File Info */}
                    {selectedWR.uploadedPdf && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              selectedWR.isDuplicate ? 'bg-red-500' : 'bg-green-500'
                            }`}>
                              {selectedWR.isDuplicate ? (
                                <X className="w-4 h-4 text-white" />
                              ) : (
                                <FileCheck className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {uploadedFiles.find(f => f.id === selectedWR.uploadedPdf)?.name || 'Uploaded PDF'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {selectedWR.isDuplicate ? 'Duplicate detected' : 'File verified'}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* WR Header */}
                <Card className="card-glow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl">{selectedWR.wrId}</CardTitle>
                        <CardDescription>
                          {selectedWR.commodity} • {selectedWR.quantity} • {selectedWR.warehouseName}
                        </CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(selectedWR.verificationStatus)} text-white`}>
                        {selectedWR.verificationStatus.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Supplier</p>
                        <p className="font-medium">{selectedWR.supplier}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Buyer</p>
                        <p className="font-medium">{selectedWR.buyer}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-medium">${selectedWR.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Storage Date</p>
                        <p className="font-medium">{selectedWR.storageDate}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Warehouse Details */}
                <Card className="card-glow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      Warehouse Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Warehouse Name</p>
                          <p className="font-medium">{selectedWR.warehouseName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Address</p>
                          <p className="font-medium">{selectedWR.warehouseAddress}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Commodity</p>
                          <p className="font-medium">{selectedWR.commodity} ({selectedWR.grade})</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Quantity</p>
                          <p className="font-medium">{selectedWR.quantity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Batch Number</p>
                          <p className="font-medium">{selectedWR.batchNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Inspector</p>
                          <p className="font-medium">{selectedWR.inspector}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* WR PDF Attachment Section */}
                <Card className="card-glow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Paperclip className="w-5 h-5" />
                      Warehouse Receipt (PDF attachment)
                    </CardTitle>
                    <CardDescription>
                      Attach a WR PDF to compute content hash and optionally pin to IPFS
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {wrAttachment ? (
                      <div className="space-y-4">
                        {/* Blockchain Status */}
                        {blockchainStatus.isRegistered && (
                          <Card className="card-glow border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                            <CardContent className="pt-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                  <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-green-800 dark:text-green-200">Registered on Blockchain</h3>
                                  <p className="text-sm text-green-600 dark:text-green-300">
                                    Transaction: {blockchainStatus.transactionHash?.substring(0, 16)}...
                                    {blockchainStatus.blockNumber && ` • Block: ${blockchainStatus.blockNumber}`}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (blockchainStatus.transactionHash) {
                                      navigator.clipboard.writeText(blockchainStatus.transactionHash);
                                      alert('Transaction hash copied to clipboard!');
                                    }
                                  }}
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copy
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        
                        <WRProofTile
                          attachment={wrAttachment}
                          onReplace={() => {
                            const fileInput = document.getElementById('wr-pdf-upload') as HTMLInputElement;
                            if (fileInput) fileInput.click();
                          }}
                          onRemove={removeWRAttachment}
                          onUseInProofFlow={useInProofFlow}
                          isReplacing={isReplacingWR}
                        />
                      </div>
                    ) : (
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                          dragActive 
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' 
                            : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragActive(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleWRAttachmentUpload(e.dataTransfer.files[0]);
                          }
                        }}
                        onClick={() => {
                          const fileInput = document.getElementById('wr-pdf-upload') as HTMLInputElement;
                          if (fileInput) fileInput.click();
                        }}
                      >
                        {isUploadingWR ? (
                          <div className="space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
                            <p className="text-muted-foreground">Processing WR PDF...</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                              <Upload className="w-8 h-8 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-lg font-medium">Attach WR PDF</p>
                              <p className="text-sm text-muted-foreground">
                                Drop your PDF here or click to browse
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                We compute a content hash and (optionally) pin to IPFS; this does not move funds.
                              </p>
                            </div>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleWRAttachmentUpload(e.target.files[0]);
                                }
                              }}
                              className="hidden"
                              id="wr-pdf-upload"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="blockchain" className="space-y-6">
                <Card className="card-glow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Blockchain Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getStatusColor(selectedWR.verificationStatus)}`}>
                            {getStatusIcon(selectedWR.verificationStatus)}
                          </div>
                          <div>
                            <h3 className="font-semibold">Verification Status</h3>
                            <p className="text-sm text-muted-foreground">
                              {selectedWR.verificationStatus === 'verified' ? 'Fully verified on blockchain' :
                               selectedWR.verificationStatus === 'registered' ? 'Registered on blockchain' : 'Pending verification'}
                            </p>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(selectedWR.verificationStatus)} text-white`}>
                          {selectedWR.verificationStatus.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Contract Address</p>
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded block mt-1">
                            {selectedWR.contractAddress}
                          </code>
                        </div>
                        {selectedWR.transactionHash && (
                          <div>
                            <p className="text-sm text-muted-foreground">Transaction Hash</p>
                            <code className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded block mt-1">
                              {selectedWR.transactionHash}
                            </code>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Digital Signature</p>
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded block mt-1">
                            {selectedWR.digitalSignature}
                          </code>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Blockchain Hash</p>
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded block mt-1">
                            {selectedWR.blockchainHash}
                          </code>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button className="btn-primary">
                          <Shield className="w-4 h-4 mr-2" />
                          Verify on Blockchain
                        </Button>
                        <Button variant="outline">
                          <Hash className="w-4 h-4 mr-2" />
                          View on Explorer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-6">
                <Card className="card-glow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      WR Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Warehouse Receipt</p>
                            <p className="text-sm text-muted-foreground">Original WR document</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Quality Certificate</p>
                            <p className="text-sm text-muted-foreground">Grade {selectedWR.grade} certification</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Inspector License</p>
                            <p className="text-sm text-muted-foreground">{selectedWR.inspectorLicense}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="card-glow">
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Select a warehouse receipt to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarehouseReceipts;
