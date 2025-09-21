import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ExternalLink,
  Copy,
  Shield,
  Hash
} from "lucide-react";

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

interface WRDocumentViewerProps {
  wrDocument: WRDocument;
  onRegisterWR: () => void;
  onVerifyWR: () => void;
  onCreateEscrow: () => void;
  isProcessing: boolean;
}

const WRDocumentViewer: React.FC<WRDocumentViewerProps> = ({
  wrDocument,
  onRegisterWR,
  onVerifyWR,
  onCreateEscrow,
  isProcessing
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-500';
      case 'registered': return 'bg-blue-500';
      case 'pending': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'registered': return <Clock className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* WR Header */}
      <Card className="card-glow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Warehouse Receipt {wrDocument.id}
              </CardTitle>
              <CardDescription>
                {wrDocument.commodity} • {wrDocument.quantity} • {wrDocument.grade}
              </CardDescription>
            </div>
            <Badge className={`${getStatusColor(wrDocument.verificationStatus)} text-white flex items-center gap-1`}>
              {getStatusIcon(wrDocument.verificationStatus)}
              {wrDocument.verificationStatus.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Warehouse Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Warehouse Information</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Warehouse Name</p>
                  <p className="font-medium">{wrDocument.warehouseName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{wrDocument.warehouseAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Number</p>
                  <p className="font-medium">{wrDocument.warehouseLicense}</p>
                </div>
              </div>
            </div>

            {/* Commodity Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Commodity Details</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Commodity</p>
                  <p className="font-medium">{wrDocument.commodity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Grade</p>
                  <p className="font-medium">{wrDocument.grade}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium">{wrDocument.quantity} {wrDocument.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Batch Number</p>
                  <p className="font-medium">{wrDocument.batchNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Information */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Storage Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Harvest Date</p>
              <p className="font-medium">{wrDocument.harvestDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Storage Date</p>
              <p className="font-medium">{wrDocument.storageDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expiry Date</p>
              <p className="font-medium">{wrDocument.expiryDate}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Storage Conditions</p>
            <p className="font-medium">{wrDocument.storageConditions}</p>
          </div>
        </CardContent>
      </Card>

      {/* Quality & Inspection */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Quality & Inspection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Quality Certificate</p>
              <p className="font-medium">{wrDocument.qualityCert}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inspector</p>
              <p className="font-medium">{wrDocument.inspector}</p>
              <p className="text-sm text-muted-foreground">License: {wrDocument.inspectorLicense}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blockchain Information */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Blockchain Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Digital Signature</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {wrDocument.digitalSignature.slice(0, 20)}...{wrDocument.digitalSignature.slice(-20)}
                </code>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(wrDocument.digitalSignature)}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Blockchain Hash</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {wrDocument.blockchainHash.slice(0, 20)}...{wrDocument.blockchainHash.slice(-20)}
                </code>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(wrDocument.blockchainHash)}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Contract Address</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {wrDocument.contractAddress}
                </code>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(wrDocument.contractAddress)}>
                  <Copy className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline">
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {wrDocument.transactionHash && (
              <div>
                <p className="text-sm text-muted-foreground">Transaction Hash</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {wrDocument.transactionHash.slice(0, 20)}...{wrDocument.transactionHash.slice(-20)}
                  </code>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(wrDocument.transactionHash!)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Blockchain Actions</CardTitle>
          <CardDescription>
            Register and verify this WR on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {wrDocument.verificationStatus === 'pending' && (
              <Button 
                onClick={onRegisterWR}
                disabled={isProcessing}
                className="btn-primary"
              >
                <Hash className="w-4 h-4 mr-2" />
                Register WR on Blockchain
              </Button>
            )}
            
            {wrDocument.verificationStatus === 'registered' && (
              <Button 
                onClick={onVerifyWR}
                disabled={isProcessing}
                className="btn-primary"
              >
                <Shield className="w-4 h-4 mr-2" />
                Verify WR
              </Button>
            )}
            
            {wrDocument.verificationStatus === 'verified' && (
              <Button 
                onClick={onCreateEscrow}
                disabled={isProcessing}
                className="btn-primary"
              >
                <FileText className="w-4 h-4 mr-2" />
                Create Escrow Contract
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WRDocumentViewer;
