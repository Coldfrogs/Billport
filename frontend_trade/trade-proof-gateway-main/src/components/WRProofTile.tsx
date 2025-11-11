import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Copy, 
  ExternalLink, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Hash,
  Database
} from "lucide-react";

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

interface WRProofTileProps {
  attachment: WRAttachment;
  onReplace: () => void;
  onRemove: () => void;
  onUseInProofFlow: () => void;
  isReplacing?: boolean;
}

const WRProofTile: React.FC<WRProofTileProps> = ({
  attachment,
  onReplace,
  onRemove,
  onUseInProofFlow,
  isReplacing = false
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const shortenHash = (hash: string, length: number = 8): string => {
    if (hash.length <= length * 2) return hash;
    return `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pinned': return 'bg-green-500';
      case 'local': return 'bg-yellow-500';
      case 'removed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pinned': return <CheckCircle className="w-3 h-3" />;
      case 'local': return <AlertTriangle className="w-3 h-3" />;
      case 'removed': return <Trash2 className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pinned': return 'Pinned';
      case 'local': return 'Local only';
      case 'removed': return 'Removed';
      default: return 'Unknown';
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log(`${label} copied to clipboard`);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const openIPFS = (cid: string) => {
    // In a real implementation, this would open the IPFS gateway
    const gatewayUrl = `https://ipfs.io/ipfs/${cid}`;
    window.open(gatewayUrl, '_blank');
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-lg">Warehouse Receipt (PDF attachment)</CardTitle>
          </div>
          <Badge className={`${getStatusColor(attachment.status)} text-white flex items-center gap-1`}>
            {getStatusIcon(attachment.status)}
            {getStatusText(attachment.status)}
          </Badge>
        </div>
        <CardDescription>
          File: {attachment.fileName} • {formatFileSize(attachment.fileSize)} • {formatDate(attachment.uploadedAt)}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Hash Information */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Content Hash (keccak256)</p>
                <code className="text-xs text-gray-600 dark:text-gray-400">
                  {shortenHash(attachment.wrFileHash, 12)}
                </code>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(attachment.wrFileHash, 'Content hash')}
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
          </div>

          {/* IPFS CID (if available) */}
          {attachment.fileCid && (
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">IPFS CID</p>
                  <code className="text-xs text-blue-600 dark:text-blue-400">
                    {shortenHash(attachment.fileCid, 12)}
                  </code>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(attachment.fileCid!, 'IPFS CID')}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openIPFS(attachment.fileCid!)}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Open
                </Button>
              </div>
            </div>
          )}

          {/* No IPFS CID message */}
          {!attachment.fileCid && attachment.status !== 'removed' && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                File not pinned to IPFS. Hash computed locally only.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={onUseInProofFlow}
            className="btn-primary flex-1"
            disabled={attachment.status === 'removed'}
          >
            <Hash className="w-4 h-4 mr-2" />
            Use in Proof Flow
          </Button>
          
          <Button
            onClick={onReplace}
            variant="outline"
            disabled={isReplacing || attachment.status === 'removed'}
          >
            {isReplacing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Replace
          </Button>
          
          <Button
            onClick={onRemove}
            variant="outline"
            className="text-red-600 hover:text-red-700"
            disabled={attachment.status === 'removed'}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove
          </Button>
        </div>

        {/* Warning for hash changes */}
        {attachment.replacedAt && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <p className="text-sm text-orange-700 dark:text-orange-300">
              This PDF was replaced on {formatDate(attachment.replacedAt)}. 
              The hash has been updated for proof verification.
            </p>
          </div>
        )}

        {/* Audit trail (collapsible) */}
        <details className="text-xs text-gray-500 dark:text-gray-400">
          <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
            Audit Trail
          </summary>
          <div className="mt-2 space-y-1 pl-4">
            <p>Created: {formatDate(attachment.uploadedAt)}</p>
            {attachment.replacedAt && (
              <p>Replaced: {formatDate(attachment.replacedAt)}</p>
            )}
            {attachment.removedAt && (
              <p>Removed: {formatDate(attachment.removedAt)}</p>
            )}
            <p>Attachment ID: {attachment.id}</p>
          </div>
        </details>
      </CardContent>
    </Card>
  );
};

export default WRProofTile;

