# Network Configuration

This directory contains network configuration files for the ODude SDK.

## networks.json

The `networks.json` file contains contract addresses for different networks:

- **localhost**: Local development network (Hardhat/Ganache)
- **testnet**: Test network deployment
- **mainnet**: Production network deployment

### Structure

```json
{
  "network_name": {
    "name": "Network Display Name",
    "rpcUrl": "https://rpc-url.example.com",
    "chainId": 1234,
    "contracts": {
      "Registry": "0x...",
      "Resolver": "0x...",
      "TLD": "0x...",
      "RWAirdrop": "0x..."
    }
  }
}
```

### Usage

```javascript
const ODudeSDK = require('odude-sdk');

// Connect to localhost
const sdk = new ODudeSDK();
sdk.connectNetwork('localhost');

// Connect to testnet
const sdkTestnet = new ODudeSDK();
sdkTestnet.connectNetwork('testnet');

// Connect to mainnet
const sdkMainnet = new ODudeSDK();
sdkMainnet.connectNetwork('mainnet');
```

### Updating Contract Addresses

After deploying contracts to a new network:

1. Open `networks.json`
2. Update the contract addresses for the appropriate network
3. Update the RPC URL if needed
4. Save the file

The SDK will automatically use the updated addresses when connecting to that network.

### Important Notes

- **localhost** addresses are automatically synced from `localhost-deployment.json` when available
- **testnet** and **mainnet** addresses must be manually updated after deployment
- Always verify contract addresses before using them in production
- Keep this file secure and do not commit sensitive RPC URLs with API keys to public repositories

