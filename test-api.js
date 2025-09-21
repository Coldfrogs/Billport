#!/usr/bin/env node

/**
 * Quick API Test Script for Billport
 * Tests all backend endpoints to ensure verification system works
 */

import http from 'http';

const BASE_URL = 'http://localhost:3001';
const TEST_WALLET = '0x1234567890abcdef1234567890abcdef12345678';

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

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
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

async function runTests() {
  log('\n🧪 BILLPORT API TESTING SUITE', 'bold');
  log('================================', 'blue');
  
  let passed = 0;
  let failed = 0;

  const tests = [
    {
      name: 'Health Check',
      test: () => makeRequest('/'),
      expected: (result) => result.status === 200
    },
    {
      name: 'Get Wallet Balance',
      test: () => makeRequest(`/api/balance/${TEST_WALLET}`),
      expected: (result) => result.status === 200 && result.data.c2flr !== undefined
    },
    {
      name: 'Get Invoices',
      test: () => makeRequest('/api/invoices'),
      expected: (result) => result.status === 200 && Array.isArray(result.data)
    },
    {
      name: 'Get Deals',
      test: () => makeRequest('/api/deals'),
      expected: (result) => result.status === 200 && Array.isArray(result.data)
    },
    {
      name: 'Get Specific Invoice',
      test: () => makeRequest('/api/invoices/INV-2024-001'),
      expected: (result) => result.status === 200 && result.data.id === 'INV-2024-001'
    },
    {
      name: 'Register WR on Blockchain',
      test: () => makeRequest('/api/invoices/INV-2024-001/register-wr', 'POST'),
      expected: (result) => result.status === 200 && result.data.success === true
    },
    {
      name: 'Verify WR',
      test: () => makeRequest('/api/invoices/INV-2024-001/verify-wr', 'POST'),
      expected: (result) => result.status === 200 && result.data.success === true
    },
    {
      name: 'Create Escrow Contract',
      test: () => makeRequest('/api/invoices/INV-2024-001/create-escrow', 'POST'),
      expected: (result) => result.status === 200 && result.data.success === true
    },
    {
      name: 'Simulate FDC Proof',
      test: () => makeRequest('/api/invoices/INV-2024-001/simulate-fdc', 'POST'),
      expected: (result) => result.status === 200 && result.data.success === true
    },
    {
      name: 'Create XRPL Assets',
      test: () => makeRequest('/api/invoices/INV-2024-001/create-xrpl-assets', 'POST'),
      expected: (result) => result.status === 200 && result.data.success === true
    },
    {
      name: 'Get XRPL Assets',
      test: () => makeRequest('/api/invoices/INV-2024-001/xrpl-assets'),
      expected: (result) => result.status === 200 && result.data.wrNft !== undefined
    },
    {
      name: 'Fund Deal',
      test: () => makeRequest('/api/deals/1/fund', 'POST'),
      expected: (result) => result.status === 200 && result.data.success === true
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
          log(`   Response: ${JSON.stringify(result.data).substring(0, 100)}...`, 'blue');
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

  // Summary
  log('\n📊 TEST SUMMARY', 'bold');
  log('================', 'blue');
  log(`✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, 'red');
  log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`, 'blue');

  if (failed === 0) {
    log('\n🎉 ALL TESTS PASSED! Billport verification system is working correctly.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the backend server is running on port 3001.', 'yellow');
  }

  log('\n💡 To start the backend server:', 'blue');
  log('   cd proof-of-trade && node backend/server.js', 'blue');
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
    log('   cd proof-of-trade && node backend/server.js', 'blue');
    process.exit(1);
  });
