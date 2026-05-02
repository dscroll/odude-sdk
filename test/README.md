# ODude SDK Test Suite

This directory contains the updated test suite for the ODude SDK, focusing on multi-network functionality and proper domain name format (@ instead of .).

## Test Files

### 1. network-connectivity.test.js
**Purpose**: Verifies network connectivity and displays total supply of names on each configured network.

**What it tests**:
- Connection to all networks defined in `config/networks.json`
- Registry contract accessibility on each network
- Total supply of names on each network
- Network configuration integrity

**How to run**:
```bash
npm test -- --grep "Network Connectivity"
# or
npx mocha test/network-connectivity.test.js --timeout 30000
```

**Expected output**:
- Shows connection status for each network (localhost, filecoin, bnb, basesepolia)
- Displays total supply of names for successfully connected networks
- Handles network failures gracefully with informative error messages

### 2. name-ownership.test.js
**Purpose**: Tests name ownership resolution across different networks using the correct @ format.

**What it tests**:
- Resolution of specific test names: `crypto`, `test@crypto`, `test@bnb`, `test@filecoin`, `test@eth`
- Automatic TLD-to-network routing
- Owner lookup functionality
- Cross-network domain handling

**How to run**:
```bash
npm test -- --grep "Name Ownership"
# or
npx mocha test/name-ownership.test.js --timeout 30000
```

**Expected output**:
- Shows which network each name routes to
- Displays owner information when names exist
- Shows contract addresses and network information
- Handles non-existent names gracefully

## Running All Tests

```bash
# Run all tests
npm test

# Run tests with verbose output
npm test -- --reporter spec

# Run tests in watch mode
npm run test:watch
```

## Environment Variables

For better test coverage, set these environment variables:

```bash
# Filecoin network
export FILECOIN_RPC_URL="https://api.node.glif.io"

# BNB Smart Chain
export BNB_RPC_URL="https://bsc-dataseed1.binance.org"

# Base Sepolia
export BASE_SEPOLIA_RPC_URL="https://sepolia.base.org"

# Localhost (for development)
export LOCALHOST_RPC_URL="http://127.0.0.1:8545"
```

## Test Results Interpretation

### Network Connectivity Test
- ✅ **Success**: Network is accessible and contracts are deployed
- ⚠️ **Warning**: Network is configured but contracts may not be deployed (shows 0x000... addresses)
- ❌ **Failure**: Network is not accessible (RPC URL issues, network down, etc.)

### Name Ownership Test
- ✅ **Success**: Name exists and owner was retrieved
- ⚠️ **Warning**: Network is accessible but name doesn't exist
- ❌ **Failure**: Network connection issues or contract problems

## Notes

1. **Network Availability**: Some networks may not be available during testing. This is expected for test networks or networks without deployed contracts.

2. **Domain Format**: All tests use the correct @ format (e.g., `test@crypto`, `demo@bnb`) instead of the old dot format.

3. **TLD Mappings**: Tests verify that TLD mappings work correctly:
   - `@fil`, `@fvm` → Filecoin network
   - `@bnb`, `@binance` → BNB Smart Chain
   - Other TLDs → Base Sepolia (default)

4. **Contract Deployment**: Tests check for deployed contracts by verifying non-zero addresses in the network configuration.

## Troubleshooting

### Common Issues

1. **Network Timeout**: Increase timeout in test files if networks are slow
2. **RPC Rate Limits**: Use your own RPC URLs via environment variables
3. **Contract Not Deployed**: Some networks may not have contracts deployed yet
4. **Name Not Found**: Test names may not exist on all networks

### Debug Mode

Run tests with debug output:
```bash
DEBUG=* npm test
```

Or run individual test files for focused debugging:
```bash
npx mocha test/network-connectivity.test.js --timeout 30000 --reporter spec
```
