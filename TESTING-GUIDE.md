# Billport Testing Guide

## 🧪 Complete Testing Scenarios for Billport Verification System

### **Prerequisites**
1. Start the backend server: `cd proof-of-trade && node backend/server.js`
2. Start the frontend: `cd proof-of-trade/frontend_trade/trade-proof-gateway-main && npm run dev`
3. Open the application in your browser

---

## **1. Dashboard Testing**

### **Test Wallet Connection & Balance Display**
```
1. Click "Connect Wallet" button
2. Verify wallet address appears
3. Check if C2FLR balance shows (should display ~99 C2FLR)
4. Check if MockUSD balance shows
5. Click "Refresh Data" button
6. Verify balances update
```

**Expected Results:**
- Wallet connects successfully
- Real C2FLR balance displays
- MockUSD balance shows
- Refresh button updates data

---

## **2. Warehouse Receipts Testing**

### **Test WR List Display**
```
1. Navigate to "Warehouse Receipts" tab
2. Verify 3 sample WRs are displayed
3. Check status badges (Verified, Registered, Pending)
4. Test search functionality:
   - Search for "Cocoa" → should show WR-001
   - Search for "Lagos" → should show WR-001
   - Search for "invalid" → should show no results
5. Test filter functionality:
   - Filter by "Verified" → should show 1 WR
   - Filter by "Registered" → should show 1 WR
   - Filter by "Pending" → should show 1 WR
```

### **Test WR Details View**
```
1. Click on WR-001 (Cocoa Beans - Verified)
2. Verify Overview tab shows:
   - WR ID: WR-2024-001
   - Commodity: Cocoa Beans (Grade A)
   - Quantity: 100 MT
   - Warehouse: Lagos Port Warehouse
   - Supplier: AgriCorp Ltd
   - Buyer: Global Trading Co
   - Amount: $50,000
3. Click on Blockchain tab:
   - Verify status shows "VERIFIED"
   - Check contract address is displayed
   - Check transaction hash is shown
   - Verify digital signature and blockchain hash
4. Click on Documents tab:
   - Verify all 3 documents are listed
   - Check all show "Verified" status
   - Test view/download buttons (should show alerts)
```

---

## **3. Marketplace Testing**

### **Test Deal Display & Funding**
```
1. Navigate to "Marketplace" tab
2. Verify deals are loaded and displayed
3. Check wallet connection status
4. Test "Connect Wallet" button
5. Test "Fund Deal" button on any deal
6. Verify funding simulation works
7. Test "Advanced" filter button
8. Test "List Deal" and "Pool Funding" buttons
```

**Expected Results:**
- Deals load successfully
- Wallet connects
- Funding simulation works
- All buttons show appropriate responses

---

## **4. CopperFlow Testing**

### **Test Process Flow Visualization**
```
1. Navigate to "CopperFlow" tab
2. Verify 8-step process is displayed
3. Check that first few steps show "completed" status
4. Verify step descriptions are clear
5. Test any interactive elements
```

---

## **5. About Tab Testing**

### **Test Information Display**
```
1. Navigate to "About" tab
2. Verify all sections load properly:
   - Hero section with Billport branding
   - Problem & Solution cards
   - How It Works (Flare + XRPL)
   - Key Benefits section
   - Call-to-Action section
3. Check all icons and badges display
4. Verify responsive design works
```

---

## **6. Backend API Testing**

### **Test API Endpoints**
```
1. Test balance endpoint:
   GET http://localhost:3001/api/balance/0x1234567890abcdef1234567890abcdef12345678
   Should return C2FLR and MockUSD balances

2. Test invoices endpoint:
   GET http://localhost:3001/api/invoices
   Should return demo invoice data

3. Test deals endpoint:
   GET http://localhost:3001/api/deals
   Should return marketplace deals

4. Test WR registration:
   POST http://localhost:3001/api/invoices/WR-001/register-wr
   Should simulate WR registration

5. Test WR verification:
   POST http://localhost:3001/api/invoices/WR-001/verify-wr
   Should simulate smart contract verification

6. Test FDC simulation:
   POST http://localhost:3001/api/invoices/WR-001/simulate-fdc
   Should simulate Flare Data Connector proof

7. Test XRPL assets creation:
   POST http://localhost:3001/api/invoices/WR-001/create-xrpl-assets
   Should simulate XRPL asset creation
```

---

## **7. Error Handling Testing**

### **Test Error Scenarios**
```
1. Disconnect backend server
2. Refresh frontend
3. Verify fallback data displays
4. Check error messages are user-friendly
5. Reconnect backend
6. Verify data loads normally
```

---

## **8. Integration Testing**

### **Test Complete Workflow**
```
1. Start with Dashboard
2. Connect wallet
3. Navigate to Warehouse Receipts
4. Select a WR
5. Test all tabs (Overview, Blockchain, Documents)
6. Navigate to Marketplace
7. Test deal funding
8. Navigate to CopperFlow
9. Verify process flow
10. Navigate to About
11. Verify information display
```

---

## **9. Performance Testing**

### **Test Loading & Responsiveness**
```
1. Test page load times
2. Test tab switching speed
3. Test search/filter responsiveness
4. Test on different screen sizes
5. Test with slow network (throttle in dev tools)
```

---

## **10. Security Testing**

### **Test Input Validation**
```
1. Test search with special characters
2. Test filter with invalid values
3. Test API calls with malformed data
4. Verify no sensitive data is exposed
5. Check console for errors
```

---

## **Expected Test Results Summary**

✅ **All tests should pass with:**
- Smooth navigation between tabs
- Real wallet balance display
- Interactive WR management
- Working marketplace functionality
- Clear process flow visualization
- Comprehensive about information
- Responsive design
- Error handling
- API integration

❌ **Common issues to watch for:**
- Blank pages (backend not running)
- Missing wallet balances
- Non-functional buttons
- API errors in console
- Layout issues on mobile
- Slow loading times

---

## **Quick Test Commands**

```bash
# Start backend
cd proof-of-trade && node backend/server.js

# Start frontend (in new terminal)
cd proof-of-trade/frontend_trade/trade-proof-gateway-main && npm run dev

# Test API endpoints
curl http://localhost:3001/api/balance/0x1234567890abcdef1234567890abcdef12345678
curl http://localhost:3001/api/invoices
curl http://localhost:3001/api/deals
```

---

## **Troubleshooting**

If tests fail:
1. Check backend is running on port 3001
2. Check frontend is running on port 5173
3. Check browser console for errors
4. Verify all dependencies are installed
5. Check network connectivity
6. Restart both servers if needed

---

**Happy Testing! 🚀**
