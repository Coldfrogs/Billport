# WR PDF Attachment Feature

## Overview

The WR PDF Attachment feature allows users to attach Warehouse Receipt (WR) PDFs to invoices, compute content hashes using keccak256, optionally pin files to IPFS, and prepare them for the proof verification flow.

## Features

### ✅ **Core Functionality**
- **PDF Upload**: Drag & drop or click to upload PDF files (≤10MB)
- **Hash Computation**: Automatic keccak256 hash generation from file content
- **IPFS Integration**: Optional file pinning to IPFS (simulated in demo)
- **Duplicate Detection**: Prevents uploading the same file multiple times
- **File Management**: Replace, remove, and manage attachments
- **Proof Flow Integration**: Emits events for existing attestation workflows

### 🎯 **User Interface**
- **WR Proof Tile**: Compact display of file information, hash, and IPFS CID
- **Status Indicators**: Visual status pills (Pinned, Local only, Removed)
- **Copy Functions**: One-click copying of hashes and CIDs
- **Action Buttons**: Replace, Remove, Use in Proof Flow
- **Audit Trail**: Collapsible history of file operations

### 🔧 **Technical Implementation**
- **Backend API**: RESTful endpoints for file upload, retrieval, and management
- **File Validation**: MIME type and size validation
- **Hash Generation**: Server-side keccak256 computation
- **IPFS Simulation**: Mock IPFS pinning for demo purposes
- **Error Handling**: Comprehensive error messages and validation

## API Endpoints

### `POST /api/invoices/:invoiceId/wr-attachment`
Upload a WR PDF file for an invoice.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: PDF file

**Response:**
```json
{
  "success": true,
  "attachment": {
    "id": "wr-attachment-1234567890",
    "invoiceId": "WR-001",
    "fileName": "warehouse-receipt.pdf",
    "fileSize": 1024000,
    "wrFileHash": "0x1234567890abcdef...",
    "fileCid": "Qm1234567890abcdef...",
    "uploadedAt": "2024-01-15T10:30:00Z",
    "status": "pinned"
  }
}
```

### `GET /api/invoices/:invoiceId/wr-attachment`
Retrieve the current WR attachment for an invoice.

**Response:**
```json
{
  "success": true,
  "attachment": {
    "id": "wr-attachment-1234567890",
    "invoiceId": "WR-001",
    "fileName": "warehouse-receipt.pdf",
    "fileSize": 1024000,
    "wrFileHash": "0x1234567890abcdef...",
    "fileCid": "Qm1234567890abcdef...",
    "uploadedAt": "2024-01-15T10:30:00Z",
    "status": "pinned"
  }
}
```

### `DELETE /api/invoices/:invoiceId/wr-attachment/:id`
Remove a WR attachment (soft delete).

**Response:**
```json
{
  "success": true,
  "message": "WR attachment removed successfully"
}
```

## Frontend Components

### `WRProofTile`
Main component for displaying WR attachment information.

**Props:**
- `attachment`: WRAttachment object
- `onReplace`: Function to handle file replacement
- `onRemove`: Function to handle file removal
- `onUseInProofFlow`: Function to emit proof flow event
- `isReplacing`: Boolean indicating if replacement is in progress

**Features:**
- File information display (name, size, upload time)
- Hash display with copy functionality
- IPFS CID display with copy and open links
- Status indicators and action buttons
- Audit trail with operation history

## Usage Instructions

### 1. **Upload WR PDF**
1. Navigate to Warehouse Receipts tab
2. Select a WR from the list
3. In the Overview tab, find the "Warehouse Receipt (PDF attachment)" section
4. Click "Attach WR PDF" or drag & drop a PDF file
5. Wait for upload and hash computation to complete

### 2. **View WR Proof Tile**
After successful upload, the WR Proof Tile will display:
- File name, size, and upload time
- Content hash (keccak256) with copy button
- IPFS CID (if pinned) with copy and open buttons
- Status indicator (Pinned/Local only)
- Action buttons (Replace, Remove, Use in Proof Flow)

### 3. **Use in Proof Flow**
1. Click "Use in Proof Flow" button
2. Check browser console for `onWrFilePrepared` event
3. Event contains: `{ invoiceId, wrFileHash, fileCid }`
4. Use these values in your existing attestation workflow

### 4. **Replace File**
1. Click "Replace" button
2. Select new PDF file
3. System will compute new hash and update IPFS CID
4. Warning message will appear about hash changes

### 5. **Remove Attachment**
1. Click "Remove" button
2. Confirm removal
3. File is soft-deleted (marked as removed)
4. Audit trail is preserved

## Configuration

### Environment Variables
```bash
# IPFS Configuration (optional)
IPFS_ENABLED=true
IPFS_GATEWAY_URL=https://ipfs.io/ipfs/
IPFS_API_URL=http://localhost:5001

# File Upload Limits
MAX_WR_PDF_MB=10
```

### Backend Dependencies
```json
{
  "multer": "^1.4.5-lts.1",
  "crypto": "built-in"
}
```

## Testing

### Manual Testing
1. Start backend: `cd proof-of-trade/backend && node server.js`
2. Start frontend: `cd proof-of-trade/frontend_trade/trade-proof-gateway-main && npm run dev`
3. Open browser: `http://localhost:5173`
4. Navigate to Warehouse Receipts tab
5. Test upload, replace, and remove functionality

### Automated Testing
```bash
# Run WR attachment test suite
cd proof-of-trade
node test-wr-attachment.js
```

### Test Scenarios
- ✅ Upload valid PDF file
- ✅ Upload file >10MB (should fail)
- ✅ Upload non-PDF file (should fail)
- ✅ Replace existing attachment
- ✅ Remove attachment
- ✅ Verify hash computation
- ✅ Verify IPFS simulation
- ✅ Test proof flow event emission

## Security & Privacy

### Data Handling
- **No Raw File Storage**: Only metadata, hash, and CID are stored
- **File Validation**: Server-side MIME type and size validation
- **Rate Limiting**: Upload endpoint has built-in rate limiting
- **Audit Trail**: All operations are logged with timestamps

### Hash Security
- **keccak256**: Industry-standard hash function
- **Content-Based**: Hash computed from raw file bytes
- **Immutable**: Hash changes if file content changes
- **Verifiable**: Can be verified against original file

## Integration Points

### Existing Workflows
- **Invoice Management**: Integrates with existing invoice system
- **Proof Verification**: Emits events for FDC/registry flow
- **Blockchain Integration**: Hash can be used in smart contracts
- **Audit System**: Maintains compliance with existing audit trails

### Event System
```javascript
// onWrFilePrepared event
{
  invoiceId: "WR-001",
  wrFileHash: "0x1234567890abcdef...",
  fileCid: "Qm1234567890abcdef..."
}
```

## Troubleshooting

### Common Issues
1. **Upload Fails**: Check file size and type
2. **Hash Not Generated**: Verify file is valid PDF
3. **IPFS Not Working**: Check IPFS_ENABLED setting
4. **Event Not Fired**: Check browser console for errors

### Debug Information
- Check browser console for detailed logs
- Backend logs show hash computation and IPFS operations
- Network tab shows API request/response details

## Future Enhancements

### Planned Features
- **Real IPFS Integration**: Replace simulation with actual IPFS client
- **Progress Bars**: Show upload and pinning progress
- **Batch Operations**: Upload multiple files at once
- **File Preview**: Show PDF preview before upload
- **Advanced Validation**: OCR-based content validation

### Performance Optimizations
- **Chunked Upload**: Support for large files
- **Compression**: Automatic file compression
- **Caching**: Client-side file caching
- **CDN Integration**: Serve files from CDN

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Check backend logs for server-side issues
4. Test with the automated test suite

---

**Note**: This feature is designed for demo purposes. In production, implement proper IPFS integration, enhanced security measures, and comprehensive error handling.

