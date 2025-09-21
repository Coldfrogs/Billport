import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus
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
}

const WarehouseReceipts: React.FC = () => {
  const [warehouseReceipts, setWarehouseReceipts] = useState<WarehouseReceipt[]>([]);
  const [selectedWR, setSelectedWR] = useState<WarehouseReceipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

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
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{wr.wrId}</h3>
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
