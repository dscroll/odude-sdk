# ODude SDK - Quick Reference Guide

## Installation

```bash
npm install @odude/odude-sdk
```

## Basic Setup

```javascript
const ODudeSDK = require('@odude/odude-sdk');

const sdk = new ODudeSDK({
  rpcUrl_base: 'https://mainnet.base.org'
});

sdk.connectNetwork('base');
```

## Configuration Variables

### Test Files

Update these at the top of `test/extended-functions.test.js`:

```javascript
const TEST_CONFIG = {
  WALLET_ADDRESS: '0x...',      // Your wallet address
  TLD_NAME: 'crypto',           // TLD to test
  ODUDE_NAME: 'test@crypto',    // Full name to test
  TOKEN_ID: 1,                  // Token ID to test
  START_INDEX: 0,               // Pagination start
  PAGE_SIZE: 5,                 // Pagination size
  TEST_NETWORK: 'base'   // Network to test
};
```

### Example Files

#### get-names-list.js
```javascript
const CONFIG = {
  WALLET_ADDRESS: '0x...',
  NETWORK: 'base',
  RPC_URL: process.env.BASE_RPC_URL || 'https://mainnet.base.org'
};
```

#### get-all-names.js
```javascript
const CONFIG = {
  NETWORK: 'base',
  START_INDEX: 0,
  PAGE_SIZE: 10,
  RPC_URL: process.env.BASE_RPC_URL || 'https://mainnet.base.org'
};
```

#### network-info.js
```javascript
const CONFIG = {
  RPC_URL_BASE: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
  RPC_URL_SEPOLIA: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
  RPC_URL_BNB: process.env.BNB_RPC_URL,
  TEST_TLDS: ['crypto', 'bnb', 'binance', 'eth', 'base']
};
```

## Extended Functions Quick Reference

### Get Total Names
```javascript
const total = await sdk.getTotalNames('0x...');
console.log('Total:', total.toString());
```

### Get Names List
```javascript
const names = await sdk.getNamesList('0x...');
names.forEach(item => {
  console.log(`${item.name} (${item.tokenId})`);
});
```

### Get Name Details
```javascript
const details = await sdk.getNameDetails('alice@crypto');
console.log({
  name: details.name,
  tokenId: details.tokenId,
  owner: details.owner,
  exists: details.exists,
  resolvedAddress: details.resolvedAddress
});
```

### Get Name by ID
```javascript
const name = await sdk.getNameById(123);
console.log('Name:', name);
```

### Get All Names (Paginated)
```javascript
const names = await sdk.getAllNames(0, 10);
names.forEach(item => {
  console.log(`${item.name} - ${item.owner}`);
});
```

### Check Name Existence
```javascript
const exists = await sdk.resolver().nameExists('newname@crypto');
console.log('Exists:', exists);
```

### Get Approved Address
```javascript
const approved = await sdk.getApproved(123);
console.log('Approved:', approved);
```

### Network Information
```javascript
// Get network info
const info = sdk.NetworkList();
console.log('Current:', info.currentNetwork);
console.log('Connected:', info.connectedNetworks);

// Display formatted info
sdk.displayNetworkList();
```

## Running Tests

```bash
# All tests
npm test

# Specific tests
npm run test:ownership
npm run test:connectivity
npm run test:extended
```

## Running Examples

```bash
# Basic examples
npm run example:basic
npm run example:resolve
npm run example:airdrop
npm run example:tld

# New examples
npm run example:names-list
npm run example:all-names
npm run example:network-info
```

## Common Patterns

### Check and Get Names for Address
```javascript
// Step 1: Check total
const total = await sdk.getTotalNames(address);
console.log(`Address owns ${total} names`);

// Step 2: Get list
if (total > 0) {
  const names = await sdk.getNamesList(address);
  
  // Step 3: Get details for each
  for (const item of names) {
    const details = await sdk.getNameDetails(item.name);
    console.log(details);
  }
}
```

### Browse All Names with Pagination
```javascript
const pageSize = 10;
const totalSupply = await sdk.registry().totalSupply();
const totalPages = Math.ceil(Number(totalSupply) / pageSize);

for (let page = 0; page < totalPages; page++) {
  const startIndex = page * pageSize;
  const names = await sdk.getAllNames(startIndex, pageSize);
  
  console.log(`Page ${page + 1}:`);
  names.forEach(item => console.log(`  ${item.name}`));
}
```

### Check Name Before Registration
```javascript
const name = 'myname@crypto';

// Check existence
const exists = await sdk.resolver().nameExists(name);

if (!exists) {
  console.log('Name is available!');
  // Proceed with registration
} else {
  console.log('Name is taken');
  
  // Get details of existing name
  const details = await sdk.getNameDetails(name);
  console.log('Owner:', details.owner);
}
```

### Network Status Check
```javascript
const networkInfo = sdk.NetworkList();

// Check if network is connected
const isConnected = networkInfo.supportedNetworks.base.isConnected;

// Check if contracts are deployed
const hasContracts = networkInfo.supportedNetworks.base.hasContracts;

if (isConnected && hasContracts) {
  console.log('Ready to use!');
} else {
  console.log('Network not ready');
}
```

## Environment Variables

```bash
# Set these in your .env file or shell
export BASE_RPC_URL="https://mainnet.base.org"
export BASE_SEPOLIA_RPC_URL="https://sepolia.base.org"
export BNB_RPC_URL="https://bsc-dataseed1.binance.org"
```

## Error Handling

```javascript
try {
  const details = await sdk.getNameDetails('name@crypto');
  console.log(details);
} catch (error) {
  if (error.message.includes('not found')) {
    console.log('Name does not exist');
  } else {
    console.error('Error:', error.message);
  }
}
```

## Network Status

- ✅ **Base Mainnet**: Fully working (default)
- ✅ **Base Sepolia**: Fully working
- ⚠️ **BNB Chain**: RPC accessible, no contracts

## TLD Mappings

- `@bnb`, `@binance` → BNB Chain
- All others → Base Mainnet (default)

## Important Notes

1. **Use @ not .** for domain separation: `alice@crypto` not `alice.crypto`
2. **Configure variables** at the top of test/example files
3. **Only Base Sepolia** has deployed contracts currently
4. **Check network status** with `NetworkList()` before operations
5. **Handle errors** gracefully - names may not exist

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Network connection failed | Check RPC URL, use environment variables |
| Contract not found | Only Base networks have contracts |
| Name not found | Use `nameExists()` to check first |
| Method not a function | Use `sdk.registry()` not `sdk.registry` |

## Need Help?

- Check `README.md` for full documentation
- Review examples in `examples/` directory
- Check tests in `test/` directory
- Use `sdk.displayNetworkList()` for debugging

---

**Quick Start:** Update config variables → Run tests → Run examples → Build your app!

