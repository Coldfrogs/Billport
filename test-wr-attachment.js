#!/usr/bin/env node

/**
 * WR PDF Attachment Test Script
 * Tests the complete WR PDF attachment flow including upload, hash computation, and IPFS simulation
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:3001';
const TEST_INVOICE_ID = 'WR-001';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Create a test PDF file
function createTestPDF() {
  const testPDFContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Test WR PDF) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000369 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
465
%%EOF`;

  const testPDFPath = path.join(__dirname, 'test-wr.pdf');
  fs.writeFileSync(testPDFPath, testPDFContent);
  return testPDFPath;
}

function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

function uploadFile(filePath, invoiceId) {
  return new Promise((resolve, reject) => {
    const fs = require('fs');
    const FormData = require('form-data');
    
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/invoices/${invoiceId}/wr-attachment`,
      method: 'POST',
      headers: form.getHeaders()
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    form.pipe(req);
  });
}

async function runTests() {
  log('\n🧪 WR PDF ATTACHMENT TESTING SUITE', 'bold');
  log('====================================', 'blue');
  
  let passed = 0;
  let failed = 0;
  let testPDFPath = null;

  try {
    // Create test PDF
    log('\n📄 Creating test PDF...', 'yellow');
    testPDFPath = createTestPDF();
    log(`✅ Test PDF created: ${testPDFPath}`, 'green');

    const tests = [
      {
        name: 'Health Check',
        test: () => makeRequest('/'),
        expected: (result) => result.status === 200
      },
      {
        name: 'Upload WR PDF',
        test: async () => {
          const result = await uploadFile(testPDFPath, TEST_INVOICE_ID);
          return result;
        },
        expected: (result) => result.status === 200 && result.data.success === true && result.data.attachment
      },
      {
        name: 'Get WR Attachment',
        test: () => makeRequest(`/api/invoices/${TEST_INVOICE_ID}/wr-attachment`),
        expected: (result) => result.status === 200 && result.data.success === true && result.data.attachment
      },
      {
        name: 'Verify Hash Computation',
        test: async () => {
          const result = await makeRequest(`/api/invoices/${TEST_INVOICE_ID}/wr-attachment`);
          if (result.status === 200 && result.data.attachment) {
            const attachment = result.data.attachment;
            return {
              status: 200,
              data: {
                hasHash: !!attachment.wrFileHash,
                hashLength: attachment.wrFileHash ? attachment.wrFileHash.length : 0,
                hasCid: !!attachment.fileCid,
                status: attachment.status
              }
            };
          }
          return result;
        },
        expected: (result) => result.status === 200 && result.data.hasHash && result.data.hashLength === 66
      },
      {
        name: 'Test File Size Validation',
        test: async () => {
          // Create a large file (>10MB) to test size validation
          const largeFilePath = path.join(__dirname, 'large-test.pdf');
          const largeContent = Buffer.alloc(11 * 1024 * 1024, 'A'); // 11MB
          fs.writeFileSync(largeFilePath, largeContent);
          
          const result = await uploadFile(largeFilePath, TEST_INVOICE_ID);
          
          // Clean up
          fs.unlinkSync(largeFilePath);
          
          return result;
        },
        expected: (result) => result.status === 400 && result.data.error.includes('size')
      },
      {
        name: 'Test File Type Validation',
        test: async () => {
          // Create a non-PDF file
          const txtFilePath = path.join(__dirname, 'test.txt');
          fs.writeFileSync(txtFilePath, 'This is not a PDF');
          
          const result = await uploadFile(txtFilePath, TEST_INVOICE_ID);
          
          // Clean up
          fs.unlinkSync(txtFilePath);
          
          return result;
        },
        expected: (result) => result.status === 400 && result.data.error.includes('PDF')
      },
      {
        name: 'Replace WR Attachment',
        test: async () => {
          // Create a different test PDF
          const newPDFPath = path.join(__dirname, 'test-wr-2.pdf');
          const newContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
endobj

4 0 obj
<<
/Length 50
>>
stream
BT
/F1 12 Tf
72 720 Td
(Test WR PDF 2) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000369 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
471
%%EOF`;
          
          fs.writeFileSync(newPDFPath, newContent);
          const result = await uploadFile(newPDFPath, TEST_INVOICE_ID);
          
          // Clean up
          fs.unlinkSync(newPDFPath);
          
          return result;
        },
        expected: (result) => result.status === 200 && result.data.success === true
      },
      {
        name: 'Remove WR Attachment',
        test: async () => {
          // First get the attachment to get its ID
          const getResult = await makeRequest(`/api/invoices/${TEST_INVOICE_ID}/wr-attachment`);
          if (getResult.status !== 200) return getResult;
          
          const attachmentId = getResult.data.attachment.id;
          const result = await makeRequest(`/api/invoices/${TEST_INVOICE_ID}/wr-attachment/${attachmentId}`, 'DELETE');
          return result;
        },
        expected: (result) => result.status === 200 && result.data.success === true
      },
      {
        name: 'Verify Removal',
        test: () => makeRequest(`/api/invoices/${TEST_INVOICE_ID}/wr-attachment`),
        expected: (result) => result.status === 404
      }
    ];

    for (const test of tests) {
      try {
        log(`\n🔍 Testing: ${test.name}`, 'yellow');
        const result = await test.test();
        
        if (test.expected(result)) {
          log(`✅ PASS: ${test.name}`, 'green');
          log(`   Status: ${result.status}`, 'blue');
          if (result.data && typeof result.data === 'object') {
            log(`   Response: ${JSON.stringify(result.data).substring(0, 200)}...`, 'blue');
          }
          passed++;
        } else {
          log(`❌ FAIL: ${test.name}`, 'red');
          log(`   Status: ${result.status}`, 'red');
          log(`   Response: ${JSON.stringify(result.data)}`, 'red');
          failed++;
        }
      } catch (error) {
        log(`❌ ERROR: ${test.name}`, 'red');
        log(`   Error: ${error.message}`, 'red');
        failed++;
      }
    }

  } catch (error) {
    log(`❌ Setup Error: ${error.message}`, 'red');
    failed++;
  } finally {
    // Clean up test files
    if (testPDFPath && fs.existsSync(testPDFPath)) {
      fs.unlinkSync(testPDFPath);
      log('\n🧹 Cleaned up test files', 'blue');
    }
  }

  // Summary
  log('\n📊 TEST SUMMARY', 'bold');
  log('================', 'blue');
  log(`✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, 'red');
  log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`, 'blue');

  if (failed === 0) {
    log('\n🎉 ALL TESTS PASSED! WR PDF attachment system is working correctly.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the backend server is running on port 3001.', 'yellow');
  }

  log('\n💡 To start the backend server:', 'blue');
  log('   cd proof-of-trade/backend && node server.js', 'blue');
  log('\n💡 To start the frontend:', 'blue');
  log('   cd proof-of-trade/frontend_trade/trade-proof-gateway-main && npm run dev', 'blue');
}

// Check if backend is running first
makeRequest('/')
  .then(() => {
    runTests();
  })
  .catch(() => {
    log('❌ Backend server is not running on port 3001', 'red');
    log('💡 Please start the backend server first:', 'yellow');
    log('   cd proof-of-trade/backend && node server.js', 'blue');
    process.exit(1);
  });

