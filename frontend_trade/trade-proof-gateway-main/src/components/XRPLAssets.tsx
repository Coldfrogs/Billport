import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  DollarSign, 
  Eye, 
  ExternalLink, 
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
  Link,
  Database
} from "lucide-react";

interface XRPLAsset {
  id: string;
  owner: string;
  metadata?: {
    commodity: string;
    quantity: string;
    warehouse: string;
    wrId: string;
  };
  amount?: number;
  currency?: string;
  status: 'MINTED' | 'ISSUED' | 'PENDING' | 'BURNED';
  xrplNetwork: string;
  transactionHash?: string;
}

interface XRPLAssetsProps {
  invoiceId: string;
  onSimulateFDC: () => void;
  onCreateAssets: () => void;
  isProcessing: boolean;
}

const XRPLAssets: React.FC<XRPLAssetsProps> = ({
  invoiceId,
  onSimulateFDC,
  onCreateAssets,
  isProcessing
}) => {
  const [assets, setAssets] = useState<{wrNft: XRPLAsset | null, invIou: XRPLAsset | null}>({
    wrNft: null,
    invIou: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, [invoiceId]);

  const fetchAssets = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/xrpl-assets`);
      if (response.ok) {
        const data = await response.json();
        setAssets(data);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching XRPL assets:', error);
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'MINTED':
      case 'ISSUED': return 'bg-green-500';
      case 'PENDING': return 'bg-blue-500';
      case 'BURNED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'MINTED':
      case 'ISSUED': return <CheckCircle className="w-4 h-4" />;
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'BURNED': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* XRPL Network Header */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            XRPL Testnet Integration
          </CardTitle>
          <CardDescription>
            The Badge + Receipt - Visible proof of collateral and lender claims
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium">XRPL Testnet</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-sm font-medium">Flare Coston2</span>
            </div>
            <Badge className="bg-gradient-to-r from-blue-500 to-orange-500 text-white">
              Hybrid Architecture
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* WR-NFT Card */}
      <Card className="card-glow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                WR-NFT (Warehouse Receipt NFT)
              </CardTitle>
              <CardDescription>
                Visible, portable proof of collateral for the SME
              </CardDescription>
            </div>
            {assets.wrNft && (
              <Badge className={`${getStatusColor(assets.wrNft.status)} text-white flex items-center gap-1`}>
                {getStatusIcon(assets.wrNft.status)}
                {assets.wrNft.status}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {assets.wrNft ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">NFT ID</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {assets.wrNft.id}
                    </code>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(assets.wrNft!.id)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Owner</p>
                  <p className="font-medium">{assets.wrNft.owner}</p>
                </div>
              </div>
              
              {assets.wrNft.metadata && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Metadata</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Commodity:</span> {assets.wrNft.metadata.commodity}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Quantity:</span> {assets.wrNft.metadata.quantity}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Warehouse:</span> {assets.wrNft.metadata.warehouse}
                    </div>
                    <div>
                      <span className="text-muted-foreground">WR ID:</span> {assets.wrNft.metadata.wrId}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View on XRPL
                </Button>
                <Button size="sm" variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Explorer
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Building className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">WR-NFT not yet created</p>
              <Button onClick={onCreateAssets} disabled={isProcessing}>
                <Building className="w-4 h-4 mr-2" />
                Create WR-NFT
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* INV-IOU Card */}
      <Card className="card-glow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                INV-IOU (Invoice IOU)
              </CardTitle>
              <CardDescription>
                Lender's claim token representing their investment
              </CardDescription>
            </div>
            {assets.invIou && (
              <Badge className={`${getStatusColor(assets.invIou.status)} text-white flex items-center gap-1`}>
                {getStatusIcon(assets.invIou.status)}
                {assets.invIou.status}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {assets.invIou ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">IOU ID</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {assets.invIou.id}
                    </code>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(assets.invIou!.id)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Owner</p>
                  <p className="font-medium">{assets.invIou.owner}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold">${assets.invIou.amount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Currency</p>
                  <p className="font-medium">{assets.invIou.currency}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View on XRPL
                </Button>
                <Button size="sm" variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Explorer
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">INV-IOU not yet issued</p>
              <Button onClick={onCreateAssets} disabled={isProcessing}>
                <DollarSign className="w-4 h-4 mr-2" />
                Issue INV-IOU
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FDC Simulation */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Flare Data Connector (FDC) Simulation
          </CardTitle>
          <CardDescription>
            Simulate FDC fetching real-world data and producing cryptographic proofs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                How FDC Works
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Fetches data from mock warehouse API</li>
                <li>• Multiple validators must agree on the data</li>
                <li>• Produces cryptographic proof that can't be faked</li>
                <li>• Proof can only be used once (replay protection)</li>
              </ul>
            </div>
            
            <Button onClick={onSimulateFDC} disabled={isProcessing} className="w-full">
              <Database className="w-4 h-4 mr-2" />
              {isProcessing ? 'Simulating FDC...' : 'Simulate FDC Proof Generation'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default XRPLAssets;
