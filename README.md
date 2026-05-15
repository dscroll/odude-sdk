# ODude SDK

A comprehensive, developer-friendly npm package for interacting with the ODude smart contracts ecosystem across multiple blockchain networks. This SDK provides easy-to-use wrappers for Registry, Resolver, TLD, and RWAirdrop contracts with seamless multi-network support.

## Features

- 🚀 **Simple and intuitive API** - Easy to use for both beginners and experts
- 🌐 **Multi-network support** - Base Mainnet, Base Sepolia, BNB Chain
- 🔄 **Automatic TLD-based network routing** - Smart routing based on domain TLD
- 📦 **Full TypeScript support** - Complete type definitions and IntelliSense
- 🔧 **Built on ethers.js v6** - Modern, secure, and well-maintained foundation
- 🧪 **Comprehensive test coverage** - Thoroughly tested with 50+ test cases
- 📚 **Well-documented with examples** - Extensive documentation and examples
- 🎯 **Helper utilities** - Name parsing, formatting, and validation utilities
- 🔍 **Batch operations** - Efficient bulk queries and operations
- 📡 **Event monitoring** - Real-time event listening across networks
- ⚡ **Retry logic** - Configurable retry limits for network resilience
- 🌳 **Tree-shakeable** - Import only what you need for optimal bundle size
- 🔀 **Dual module support** - Works with both CommonJS and ES Modules
- 🌍 **Universal compatibility** - Node.js, browsers, Next.js, and modern bundlers

## Installation

### npm
```bash
npm install @odude/odude-sdk
```

### yarn
```bash
yarn add @odude/odude-sdk
```

### pnpm
```bash
pnpm add @odude/odude-sdk
```

### Requirements
- Node.js 16+ (for Node.js environments)
- Modern browser with ES2020 support (for browser environments)
- TypeScript 4.5+ (for TypeScript projects)

## Table of Contents

1. [Quick Start](#quick-start)
2. [TypeScript Usage](#typescript-usage)
3. [Configuration](#configuration)
4. [Core Concepts](#core-concepts)
5. [Import Patterns](#import-patterns)
6. [API Reference](#api-reference)
7. [Extended Functions](#extended-functions)
8. [Usage Examples](#usage-examples)
9. [Testing](#testing)
10. [Browser Usage](#browser-usage)
11. [Next.js Integration](#nextjs-integration)
12. [Troubleshooting](#troubleshooting)

## Quick Start

### Multi-Network Configuration

The ODude SDK supports multiple networks with automatic TLD-based routing:

```javascript
const ODudeSDK = require('@odude/odude-sdk');

// Initialize SDK with multiple network RPC URLs
const sdk = new ODudeSDK({
  rpcUrl_base: 'https://mainnet.base.org',
  rpcUrl_bnb: 'https://bsc-dataseed1.binance.org',
  rpcUrl_sepolia: 'https://sepolia.base.org'
});

// Connect to all networks
sdk.connectAllNetworks();

// The SDK automatically routes based on TLD:
// - @bnb, @binance domains → BNB Smart Chain
// - Other domains → Base Mainnet (default)

// Resolve names automatically routes to correct network
const address = await sdk.resolve('alice@base'); // Uses Base network
const bnbAddress = await sdk.resolve('bob@bnb'); // Uses BNB network
```

**Note:** Currently, Base Mainnet and Base Sepolia networks have deployed contracts and are fully functional. Other networks are under development.

## TypeScript Usage

The ODude SDK is built with TypeScript and provides comprehensive type definitions for all functions, interfaces, and classes.

### Basic TypeScript Setup

```typescript
import ODudeSDK, {
  ODudeSDKConfig,
  NameInfo,
  NetworkInfo,
  NameNotFoundError
} from '@odude/odude-sdk';

// Type-safe configuration
const config: ODudeSDKConfig = {
  rpcUrl_base: 'https://mainnet.base.org',
  rpcUrl_sepolia: 'https://sepolia.base.org',
  privateKey: process.env.PRIVATE_KEY
};

// Create SDK instance with full type support
const sdk = new ODudeSDK(config);

// Connect to networks
await sdk.connectAllNetworks();

// Type-safe method calls with IntelliSense
try {
  const address: string = await sdk.resolve('alice@crypto');
  const nameInfo: NameInfo = await sdk.getNameInfo('alice@crypto');
  const networkInfo: NetworkInfo = sdk.NetworkList();

  console.log('Resolved address:', address);
  console.log('Name info:', nameInfo);
} catch (error) {
  if (error instanceof NameNotFoundError) {
    console.log('Name not found:', error.domainName);
  }
}
```

### Advanced TypeScript Usage

```typescript
import {
  ODudeSDK,
  Registry,
  Resolver,
  TLD,
  RWAirdrop,
  AirdropInfo,
  MintEligibility,
  TransferCallback,
  NameResolvedCallback
} from '@odude/odude-sdk';
import { BigNumberish, ContractTransactionResponse } from 'ethers';

class ODudeManager {
  private sdk: ODudeSDK;

  constructor(config: ODudeSDKConfig) {
    this.sdk = new ODudeSDK(config);
  }

  async initialize(): Promise<void> {
    await this.sdk.connectAllNetworks();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Type-safe event callbacks
    const transferCallback: TransferCallback = (from, to, tokenId) => {
      console.log(`Transfer: ${from} → ${to} (Token: ${tokenId})`);
    };

    const nameResolvedCallback: NameResolvedCallback = (name, address) => {
      console.log(`Name resolved: ${name} → ${address}`);
    };

    this.sdk.onTransfer(transferCallback);
    this.sdk.onNameResolved(nameResolvedCallback);
  }

  async mintDomain(
    domainName: string,
    recipient: string
  ): Promise<ContractTransactionResponse> {
    const tld: TLD = this.sdk.tld();

    // Check eligibility with full type safety
    const eligibility: MintEligibility = await tld.checkMintEligibility(domainName);

    if (!eligibility.eligible) {
      throw new Error(`Cannot mint ${domainName}: ${eligibility.reason}`);
    }

    // Mint with proper typing
    return await tld.mintDomain(domainName, recipient, {
      value: eligibility.cost
    });
  }

  async getAirdropStatus(address: string): Promise<AirdropInfo> {
    const rwairdrop: RWAirdrop = this.sdk.rwairdrop();
    return await rwairdrop.getAirdropInfo(address);
  }
}

// Usage
const manager = new ODudeManager({
  rpcUrl_sepolia: 'https://sepolia.base.org',
  privateKey: process.env.PRIVATE_KEY
});

await manager.initialize();
```

### Type Definitions

The SDK exports comprehensive TypeScript types:

```typescript
// Configuration types
import type {
  ODudeSDKConfig,
  ContractAddresses,
  NetworkConfig,
  NetworkInfo
} from '@odude/odude-sdk';

// Data types
import type {
  NameInfo,
  NFTMetadata,
  ResolutionRecord,
  ReverseRecord,
  AirdropInfo,
  MintEligibility,
  ParsedName
} from '@odude/odude-sdk';

// Error types
import type {
  ODudeSDKError,
  NameNotFoundError,
  NetworkError,
  UnsupportedTLDError
} from '@odude/odude-sdk';

// Callback types
import type {
  TransferCallback,
  NameResolvedCallback,
  DomainMintedCallback
} from '@odude/odude-sdk';
```

## Configuration

### Environment Variable Configuration

You can also configure RPC URLs using environment variables:

```bash
# Set environment variables
export BASE_RPC_URL="https://your-base-rpc.com"
export BNB_RPC_URL="https://your-bnb-rpc.com"
export BASE_SEPOLIA_RPC_URL="https://your-base-sepolia-rpc.com"
```

```javascript
// SDK will automatically use environment variables
const sdk = new ODudeSDK();
sdk.connectAllNetworks();
```



### Connect to Specific Network

```javascript
const ODudeSDK = require('odude-sdk');

// Connect to a specific network
const sdk = new ODudeSDK();
sdk.connectNetwork('base'); // or 'bnb', 'basesepolia'

// Access contracts for the connected network
const registry = sdk.registry;
const resolver = sdk.resolver;
```

### With Signer (for Write Operations)

```javascript
const { Wallet } = require('ethers');
const ODudeSDK = require('odude-sdk');

const sdk = new ODudeSDK({
  rpcUrl: 'http://127.0.0.1:8545',
  privateKey: 'YOUR_PRIVATE_KEY'
});

sdk.connectLocalhost();

// Now you can perform write operations
const tx = await sdk.registry().setReverse(tokenId);
await tx.wait();
```

## Core Concepts

### Multi-Network Architecture

The ODude SDK is designed to work seamlessly across multiple blockchain networks:

- **Base Mainnet** (default): Primary network with full contract deployment
- **Base Sepolia**: Testnet for development
- **BNB Chain**: For BNB/Binance ecosystem domains

### TLD-Based Routing

The SDK automatically routes operations to the correct network based on the TLD (Top-Level Domain):

```javascript
// These automatically route to the correct network
await sdk.resolve('alice@base');    // → Base Mainnet
await sdk.resolve('bob@bnb');      // → BNB Chain
await sdk.resolve('charlie@xxx');   // → Base Mainnet (default)
```

**TLD Mappings:**
- `@bnb`, `@binance` → BNB Chain
- All other TLDs → Base Mainnet (default network)

### Contract Architecture

The SDK provides access to four main contracts:

1. **Registry**: NFT-based name ownership and management
2. **Resolver**: Name-to-address resolution and reverse resolution
3. **TLD**: Top-level domain management and pricing
4. **RWAirdrop**: Token airdrop functionality for domain holders

### Name Format

ODude uses the `@` symbol for domain separation (not `.`):

```javascript
// ✅ Correct format
'alice@crypto'
'subdomain@alice@crypto'
'test@base'

// ❌ Incorrect format
'alice.crypto'
'test.fil'
```

### Network Detection and Retry Logic

The SDK includes intelligent network detection with automatic retry:

- Maximum 3 retry attempts for network detection
- Graceful fallback for failed connections
- Detailed error logging for debugging
- Skip network detection for external RPCs to avoid timeouts

### Provider and Signer Management

The SDK manages providers and signers for each network:

```javascript
// Get provider for specific network
const provider = sdk.getProvider('basesepolia');

// Get signer for write operations
const signer = sdk.getSigner('basesepolia');

// Connect custom signer
sdk.connectSigner(customSigner, 'basesepolia');
```

## Import Patterns

The ODude SDK supports multiple import patterns for maximum compatibility:

### CommonJS (Node.js)

```javascript
// Default import
const ODudeSDK = require('@odude/odude-sdk');
const sdk = new ODudeSDK();

// Named imports
const { ODudeSDK, Registry, Resolver, utils } = require('@odude/odude-sdk');

// Error imports
const { NameNotFoundError, NetworkError } = require('@odude/odude-sdk');
```

### ES Modules (Modern JavaScript)

```javascript
// Default import
import ODudeSDK from '@odude/odude-sdk';
const sdk = new ODudeSDK();

// Named imports
import { ODudeSDK, Registry, Resolver, utils } from '@odude/odude-sdk';

// Mixed imports
import ODudeSDK, { NameNotFoundError, NetworkError } from '@odude/odude-sdk';

// Tree-shaking friendly imports
import { utils } from '@odude/odude-sdk';
const normalized = utils.normalizeName('TEST@CRYPTO');
```

### TypeScript

```typescript
// Default import with types
import ODudeSDK, { ODudeSDKConfig } from '@odude/odude-sdk';

// Named imports with types
import {
  ODudeSDK,
  Registry,
  NameInfo,
  NetworkError
} from '@odude/odude-sdk';

// Type-only imports
import type {
  ODudeSDKConfig,
  NameInfo,
  AirdropInfo
} from '@odude/odude-sdk';
```

### Browser (UMD)

```html
<script src="https://unpkg.com/@odude/odude-sdk/dist/index.umd.js"></script>
<script>
  const sdk = new ODudeSDK({
    rpcUrl_base: 'https://mainnet.base.org'
  });
</script>
```

### Dynamic Imports

```javascript
// Lazy loading
const loadSDK = async () => {
  const { ODudeSDK } = await import('@odude/odude-sdk');
  return new ODudeSDK();
};

// Conditional loading
if (typeof window !== 'undefined') {
  const { ODudeSDK } = await import('@odude/odude-sdk');
  // Browser-specific code
}
```

## Usage Examples

### Registry Contract

```javascript
// Get name information
const tokenId = await sdk.registry().getTokenId('alice@crypto');
const owner = await sdk.registry().ownerOf(tokenId);
const metadata = await sdk.registry().getNFTMetadata(tokenId);

console.log('Token ID:', tokenId.toString());
console.log('Owner:', owner);
console.log('Metadata:', metadata);

// Get owner by name
const ownerAddress = await sdk.registry().getOwnerByName('alice@crypto');

// Get name by token ID
const name = await sdk.registry().nameOf(tokenId);

// Get total supply
const totalSupply = await sdk.registry().totalSupply();

// mintDomain a name (requires signer)
const tx = await sdk.registry().mintDomain(
  tokenId,
  'myname@crypto',
  'ipfs://...',
  recipientAddress,
  { value: ethers.parseEther('0.1') }
);
await tx.wait();

// Set reverse resolution
const reverseTx = await sdk.registry().setReverse(tokenId);
await reverseTx.wait();

// Listen to events
sdk.registry().onTLDMinted((tokenId, name, owner) => {
  console.log('New TLD minted:', name, 'by', owner);
});
```

### Resolver Contract

```javascript
// Resolve name to address
const address = await sdk.resolver().resolve('alice@crypto');
console.log('Resolved address:', address);

// Reverse resolve address to name
const name = await sdk.resolver().reverse('0x...');
console.log('Primary name:', name);

// Check if name exists
const exists = await sdk.resolver().nameExists('alice@crypto');

// Get resolution record
const record = await sdk.resolver().getResolutionRecord('alice@crypto');
console.log('Resolution record:', record);
// {
//   resolvedAddress: '0x...',
//   name: 'alice@crypto',
//   tokenId: 123n,
//   exists: true
// }

// Get reverse record
const reverseRecord = await sdk.resolver().getReverseRecord('0x...');
console.log('Reverse record:', reverseRecord);
// {
//   primaryName: 'alice@crypto',
//   primaryTokenId: 123n,
//   exists: true
// }

// Check if address has reverse
const hasReverse = await sdk.resolver().hasReverse('0x...');
```

### TLD Contract

```javascript
// Get base TLD price
const basePrice = await sdk.tld().getBaseTLDPrice();
console.log('Base TLD price:', ethers.formatEther(basePrice), 'ETH');

// Get TLD-specific price
const tldPrice = await sdk.tld().getTLDPrice(tldTokenId);

// Get commission rate
const commission = await sdk.tld().getCommission(tldTokenId);
console.log('Commission:', commission.toString(), '%');

// Get TLD owner
const tldOwner = await sdk.tld().getTLDOwner(tldTokenId);

// Check if TLD is active
const isActive = await sdk.tld().isTLDActive(tldTokenId);

// Get TLD name
const tldName = await sdk.tld().getTLDName(tldTokenId);

// Set TLD price (requires signer and ownership)
const tx = await sdk.tld().setTLDPrice(tldTokenId, ethers.parseEther('0.05'));
await tx.wait();

// Set commission (requires signer and ownership)
const commissionTx = await sdk.tld().setCommission(tldTokenId, 15);
await commissionTx.wait();

// New TLD Management Functions
// Set ERC token for a TLD
const setErcTx = await sdk.tld().setErcToken(tldTokenId, '0x...');
await setErcTx.wait();

// Get ERC token for a TLD
const ercToken = await sdk.tld().getErcToken(tldTokenId);

// Get token price for a TLD (same as TLD price)
const tokenPrice = await sdk.tld().getTokenPrice(tldTokenId);

// Domain Minting Functions
// Check if domain is eligible for minting
const eligibility = await sdk.tld().checkMintEligibility('alice@base');
console.log('Eligibility:', eligibility);
// {
//   eligible: true,
//   available: true,
//   tldActive: true,
//   cost: 500000000000000000n,
//   reason: 'Eligible for minting'
// }

// Estimate minting cost
const cost = await sdk.tld().estimateMintCost('alice@base');
console.log('Minting cost:', ethers.formatEther(cost), 'ETH');

// Mint domain
const mintTx = await sdk.tld().mintDomain(
  'alice@base',
  '0x...',
  { value: cost }
);
await mintTx.wait();

// TLD Minting Functions
// Check TLD minting eligibility (no @ symbol for TLD names)
const tldEligibility = await sdk.tld().checkMintEligibility('mycompany');
console.log('TLD Eligibility:', tldEligibility);
// {
//   eligible: true,
//   available: true,
//   tldActive: true, // Not applicable for TLD minting
//   cost: 1000000000000000000n, // Base TLD price
//   reason: 'Eligible for TLD minting'
// }

// Mint a TLD (Top-Level Domain)
const tldMintTx = await sdk.mintTLD('mycompany', '0x...', {
  value: tldEligibility.cost
});
await tldMintTx.wait();
```

### RWAirdrop Contract

```javascript
// Get claimable airdrops for a user
const claimableAirdrops = await sdk.rwairdrop().getClaimableAirdrops('0x...');
console.log('Claimable airdrops:', claimableAirdrops.length);

// Get airdrop information for a specific TLD and airdrop ID
const airdropInfo = await sdk.rwairdrop().getAirdropInfoByTLD('crypto', 0);
console.log('Airdrop info:', airdropInfo);
// {
//   tokenAddress: '0x...',
//   totalAmount: 1000000000000000000n,
//   perUserShare: 100000000000000000n,
//   remainingBalance: 900000000000000000n,
//   granter: '0x...',
//   tldOwner: '0x...',
//   isActive: true,
//   isWithdrawn: false,
//   createdAt: 1234567890n,
//   airdropId: 0n
// }

// Check if a domain has claimed from an airdrop
const hasClaimed = await sdk.rwairdrop().hasDomainClaimed('alice@crypto', 0);

// Get user domains in a specific TLD
const userDomains = await sdk.rwairdrop().getUserDomainsInTLD('0x...', 'crypto');

// Claim airdrop share (requires signer)
const claimTx = await sdk.rwairdrop().claimShare('crypto', 0, 'alice@crypto');
await claimTx.wait();
console.log('Airdrop claimed!');

// Create an airdrop (requires signer and TLD ownership)
const createTx = await sdk.rwairdrop().createAirdrop(
  'crypto',
  '0x...', // token address
  ethers.parseEther('100'), // total amount
  ethers.parseEther('1') // per user share
);
await createTx.wait();

// Sync your domains (new method - replaces old syncDomainOwnership)
const domains = ['alice@crypto', 'bob@crypto'];
const syncTx = await sdk.rwairdrop().syncMyDomains(domains);
await syncTx.wait();
console.log('Domains synced!');

// Admin-only: Emergency sync for data recovery
// (Only contract owner can call this)
const adminSyncTx = await sdk.rwairdrop().syncDomainOwnershipsAdmin(
  ['alice@crypto', 'bob@crypto'],
  ['0x...', '0x...'] // corresponding owners
);
await adminSyncTx.wait();
```

### Helper Utilities

```javascript
const { utils } = sdk;

// Normalize name
const normalized = utils.normalizeName('ALICE@CRYPTO');
// 'alice@crypto'

// Extract TLD
const tld = utils.extractTLD('alice@crypto');
// 'crypto'

// Extract subdomain
const subdomain = utils.extractSubdomain('alice@crypto');
// 'alice'

// Check if TLD
const isTLD = utils.isTLD('crypto');
// true

// Check if subdomain
const isSubdomain = utils.isSubdomain('alice@crypto');
// true

// Parse name
const parsed = utils.parseName('demo@alice@crypto');
// {
//   full: 'demo@alice@crypto',
//   tld: 'crypto',
//   subdomain: 'demo@alice',
//   parts: ['demo', 'alice', 'crypto'],
//   isTLD: false,
//   isSubdomain: true
// }

// Validate address
const isValid = utils.isValidAddress('0x...');

// Format token ID
const formatted = utils.formatTokenId(123n);
// '123'

// Parse and format ether
const wei = utils.parseEther('1.0');
const ether = utils.formatEther(wei);

// Generate random token ID
const tokenId = utils.randomTokenId();
// 1234567890 (random 10-digit number)

// Validate sub-name format
const isValidName = utils.isValidSubName('test@sepolia');
// true
const isInvalidName = utils.isValidSubName('test@@sepolia');
// false
```

### Convenience Methods

```javascript
// Quick resolve
const address = await sdk.resolve('alice@crypto');

// Quick reverse
const name = await sdk.reverse('0x...');

// Get owner (throws error if not found)
const owner = await sdk.getOwner('alice@crypto');

// Get owner safely (returns null if not found)
const ownerSafe = await sdk.getOwnerSafe('alice@crypto');

// Check if domain exists
const exists = await sdk.domainExists('alice@crypto');

// Get comprehensive domain status
const status = await sdk.getDomainStatus('alice@crypto');
console.log(status);
// {
//   name: 'alice@crypto',
//   exists: true,
//   owner: '0x...',
//   canMint: false,
//   mintEligibility: null,
//   inAirdropContract: true,
//   claimableAirdrops: 3,
//   airdropDetails: [...]
// }

// Get comprehensive name info
const nameInfo = await sdk.getNameInfo('alice@crypto');
console.log(nameInfo);
// {
//   name: 'alice@crypto',
//   tokenId: 123n,
//   owner: '0x...',
//   metadata: { ... },
//   tokenURI: 'ipfs://...',
//   resolvedAddress: '0x...',
//   exists: true
// }

// Get user domains from RWAirdrop contract
const domains = await sdk.rwairdrop().getUserDomainsInTLD('0x...', 'crypto');

// Get airdrop info
const airdropInfo = await sdk.getAirdropInfo('0x...');

// Mint a domain (requires signer)
const mintTx = await sdk.mintDomain('alice@crypto', recipientAddress, {
  value: ethers.parseEther('0.1')
});
await mintTx.wait();

// Mint a TLD (requires signer and more ETH)
const tldMintTx = await sdk.mintTLD('mycompany', recipientAddress, {
  value: ethers.parseEther('1.0') // TLD minting typically costs more
});
await tldMintTx.wait();
```

## TLD vs Subdomain Minting

The ODude SDK supports two types of domain minting:

### TLD (Top-Level Domain) Minting
- **Format**: Single name without @ symbol (e.g., `crypto`, `sepolia`, `mycompany`)
- **Cost**: Higher cost (typically 1+ ETH)
- **Benefits**:
  - Own the entire TLD namespace
  - Set pricing for subdomains under your TLD
  - Earn commission from subdomain sales
  - Control TLD policies and settings
- **Method**: `sdk.mintTLD(tldName, toAddress, options)`
- **Example**: `node examples/TLDMint.js`

### Subdomain Minting
- **Format**: Name with @ symbol (e.g., `alice@crypto`, `bob@sepolia`)
- **Cost**: Lower cost (set by TLD owner)
- **Benefits**:
  - Get a unique name under an existing TLD
  - Use for identity, websites, or applications
  - Transfer ownership like any NFT
- **Method**: `sdk.mintDomain(domainName, toAddress, options)`
- **Example**: `node examples/SubNameMint.js`

### Key Differences in Implementation
- **Eligibility Checking**: TLD minting checks if TLD already exists; subdomain minting checks if TLD is active and subdomain is available
- **Pricing**: TLD uses base TLD price; subdomain uses TLD-specific pricing
- **Registration**: TLD minting includes automatic TLD registration; subdomain minting only creates the NFT

## Enhanced Domain Management

The ODude SDK v2.0+ includes enhanced domain management features with improved error handling, automatic synchronization, and comprehensive status checking.

### New Methods

#### `domainExists(name)`
Check if a domain exists without throwing errors.

```javascript
const exists = await sdk.domainExists('test@crypto');
console.log('Domain exists:', exists); // true or false
```

#### `getOwnerSafe(name)`
Get domain owner with safe error handling (returns null instead of throwing).

```javascript
const owner = await sdk.getOwnerSafe('test@crypto');
console.log('Owner:', owner); // address or null
```

#### `getDomainStatus(name)`
Get comprehensive domain information including existence, ownership, and airdrop status.

```javascript
const status = await sdk.getDomainStatus('test@crypto');
console.log(status);
// {
//   name: 'test@crypto',
//   exists: true,
//   owner: '0x...',
//   canMint: false,
//   mintEligibility: null,
//   inAirdropContract: true,
//   claimableAirdrops: 3,
//   airdropDetails: [...]
// }
```

### Domain Synchronization

The RWAirdrop contract provides synchronization functions to keep domain ownership data in sync:

#### Available Functions
- ✅ **`syncMyDomains(domainNames[])`** - Domain holders sync all their domains at once
- ✅ **`syncDomainOwnershipsAdmin(domainNames[], owners[])`** - Emergency/admin-only function for data recovery

#### Usage Examples

```javascript
// User syncs their own domains
const myDomains = ['alice@crypto', 'bob@crypto'];
await sdk.rwairdrop().syncMyDomains(myDomains);

// Admin emergency sync (admin only)
await sdk.rwairdrop().syncDomainOwnershipsAdmin(
  ['alice@crypto', 'bob@crypto'],
  ['0x...', '0x...']
);
```

### Key Improvements

- **Fixed Domain Format Parsing**: All methods now correctly use `@` separator instead of `.`
- **Better Error Handling**: Safe methods return null instead of throwing errors
- **Automatic Synchronization**: Airdrop operations automatically sync with Registry contract
- **Comprehensive Status**: Single method to get complete domain information

## Extended Functions

The SDK provides additional extended functions for comprehensive name management and querying.

### getTotalNames(address)

Get the total number of names owned by a specific address.

```javascript
const totalNames = await sdk.getTotalNames('0x...');
console.log('Total names owned:', totalNames.toString());
```

**Parameters:**
- `address` (string): Wallet address to check

**Returns:** Promise<bigint> - Total number of names owned

**Use Case:** Check how many domains a wallet owns before fetching the full list.

### getNamesList(address)

Get a list of all names owned by a specific address with their token IDs.

```javascript
const namesList = await sdk.getNamesList('0x...');
console.log('Names owned:');
namesList.forEach(item => {
  console.log(`  ${item.name} (Token ID: ${item.tokenId})`);
});
```

**Parameters:**
- `address` (string): Wallet address to query

**Returns:** Promise<Array<{tokenId: string, name: string}>> - Array of name objects

**Use Case:** Display all domains owned by a user in a portfolio view.

### getNameDetails(name)

Get comprehensive details about a specific name including metadata, ownership, and resolution status.

```javascript
const details = await sdk.getNameDetails('alice@crypto');
console.log('Name Details:', {
  name: details.name,
  tokenId: details.tokenId,
  owner: details.owner,
  exists: details.exists,
  resolvedAddress: details.resolvedAddress,
  tokenURI: details.tokenURI,
  metadata: details.metadata
});
```

**Parameters:**
- `name` (string): ODude name to query (format: name@tld)

**Returns:** Promise<Object> - Comprehensive name details

**Use Case:** Get full information about a domain for display or verification.

### getNameById(tokenId)

Get the name associated with a specific token ID.

```javascript
const name = await sdk.getNameById(123);
console.log('Name:', name);
```

**Parameters:**
- `tokenId` (number|string|bigint): Token ID to query

**Returns:** Promise<string> - Name associated with the token

**Use Case:** Reverse lookup from token ID to name.

### getAllNames(startIndex, count)

Get a paginated list of all registered names in the system.

```javascript
// Get first 10 names
const names = await sdk.getAllNames(0, 10);

// Get next 10 names
const moreNames = await sdk.getAllNames(10, 10);

names.forEach(item => {
  console.log(`${item.name} - Owner: ${item.owner} - Token ID: ${item.tokenId}`);
});
```

**Parameters:**
- `startIndex` (number): Starting index (default: 0)
- `count` (number): Number of names to fetch (default: 10)

**Returns:** Promise<Array<{tokenId: string, name: string, owner: string}>> - Array of name objects

**Use Case:** Build a marketplace, explorer, or analytics dashboard with pagination.

### nameExists(name)

Check if a name exists (is registered).

```javascript
const exists = await sdk.resolver().nameExists('newname@crypto');
if (exists) {
  console.log('Name is already registered.');
} else {
  console.log('Name is available for registration!');
}
```

**Parameters:**
- `name` (string): ODude name to check (format: name@tld)

**Returns:** Promise<boolean> - True if available, false if taken

**Use Case:** Validate name availability before attempting registration.

### getApproved(tokenId)

Get the approved address for a specific token (for transfers).

```javascript
const approved = await sdk.getApproved(123);
if (approved !== '0x0000000000000000000000000000000000000000') {
  console.log('Approved address:', approved);
} else {
  console.log('No approval set');
}
```

**Parameters:**
- `tokenId` (number|string|bigint): Token ID to check

**Returns:** Promise<string> - Approved address (zero address if none)

**Use Case:** Check transfer approvals before performing operations.

### NetworkList()

Get comprehensive network configuration and connection status information.

```javascript
const networkInfo = sdk.NetworkList();
console.log('Current Network:', networkInfo.currentNetwork);
console.log('Connected Networks:', networkInfo.connectedNetworks);
console.log('Supported Networks:', Object.keys(networkInfo.supportedNetworks));
console.log('TLD Mappings:', networkInfo.tldMappings);

// Check specific network details
const baseSepoliaInfo = networkInfo.supportedNetworks.basesepolia;
console.log('Base Sepolia:', {
  chainId: baseSepoliaInfo.chainId,
  isConnected: baseSepoliaInfo.isConnected,
  hasContracts: baseSepoliaInfo.hasContracts,
  contracts: baseSepoliaInfo.contracts
});
```

**Returns:** Object with network configuration and status

**Use Case:** Debug network issues, validate configuration, display network status in UI.

### displayNetworkList()

Display formatted network information to the console.

```javascript
sdk.displayNetworkList();
// Outputs:
// === ODude SDK Network Information ===
// Current Network: basesepolia
// Default Network: basesepolia
// Connected Networks: basesepolia
//
// --- Supported Networks ---
// ✅ basesepolia (Base Sepolia)
//    Chain ID: 84532
//    RPC URL: https://sepolia.base.org
//    Contracts Deployed: ✅
//    Connected: true
// ...
```

**Returns:** Object with network information (same as NetworkList())

**Use Case:** Quick debugging and status checking during development.

### Batch Operations

The SDK supports efficient batch operations for multiple queries:

```javascript
// Registry batch operations
const tokenIds = [1, 2, 3, 4, 5];

// Get multiple names at once
const names = await sdk.registry().getMultipleNames(tokenIds);
console.log('Names:', names);

// Get multiple owners at once
const owners = await sdk.registry().getMultipleOwners(tokenIds);
console.log('Owners:', owners);

// Get comprehensive info for multiple tokens
const tokenInfo = await sdk.registry().getMultipleTokenInfo(tokenIds);
console.log('Token info:', tokenInfo);

// Resolver batch operations
const domainNames = ['alice@fil', 'bob@bnb', 'charlie@crypto'];

// Resolve multiple names at once
const resolutions = await sdk.resolver().resolveMultiple(domainNames);
console.log('Resolutions:', resolutions);
// [
//   { name: 'alice@fil', address: '0x...', resolved: true },
//   { name: 'bob@bnb', address: '0x...', resolved: true },
//   { name: 'charlie@crypto', address: null, resolved: false, error: '...' }
// ]

// Reverse resolve multiple addresses
const addresses = ['0x...', '0x...', '0x...'];
const reverseResolutions = await sdk.resolver().reverseMultiple(addresses);

// Check multiple names existence
const existenceResults = await sdk.resolver().checkMultipleNamesExist(domainNames);
```

### Event Monitoring

Listen to real-time events across networks:

```javascript
// Listen to Transfer events
sdk.onTransfer((from, to, tokenId) => {
  console.log(`Transfer: ${from} → ${to} (Token: ${tokenId})`);
});

// Listen to NameResolved events
sdk.onNameResolved((name, address) => {
  console.log(`Name resolved: ${name} → ${address}`);
});

// Listen to DomainMinted events
sdk.onDomainMinted((name, owner) => {
  console.log(`Domain minted: ${name} by ${owner}`);
});

// Listen to events across all networks
sdk.onTransferAllNetworks((from, to, tokenId, network) => {
  console.log(`Transfer on ${network}: ${from} → ${to} (Token: ${tokenId})`);
});

// Remove all event listeners
sdk.removeAllListeners();

// Remove listeners for specific network
sdk.removeAllListeners('filecoin');
```

### Error Handling

The SDK provides specific error types for better error handling:

```javascript
const {
  TokenNotFoundError,
  NameNotFoundError,
  NetworkError,
  UnsupportedTLDError,
  MintingError
} = require('odude-sdk');

try {
  const address = await sdk.resolve('nonexistent@fil');
} catch (error) {
  if (error instanceof NameNotFoundError) {
    console.log('Name not found:', error.name);
  } else if (error instanceof UnsupportedTLDError) {
    console.log('Unsupported TLD:', error.tld);
  } else if (error instanceof NetworkError) {
    console.log('Network error:', error.networkName);
  }
}

try {
  await sdk.tld().mintDomain('alice@fil', '0x...');
} catch (error) {
  if (error instanceof MintingError) {
    console.log('Minting failed:', error.domainName, error.message);
  }
}
```

## Testing

The SDK includes comprehensive tests for all functionality.

### Running Tests

```bash
# Install dependencies
npm install

# Verify setup
npm run verify

# Run all tests
npm test

# Run specific test suites
npm run test:ownership      # Name ownership tests
npm run test:connectivity   # Network connectivity tests
npm run test:extended       # Extended functions tests

# Run tests in watch mode
npm run test:watch
```

### Running Examples

```bash
# Basic usage
npm run example:basic

# Name resolution
npm run example:resolve

# Airdrop checking
npm run example:airdrop

# TLD minting (requires private key and funds)
node examples/TLDMint.js

# Subdomain minting (requires private key and funds)
node examples/SubNameMint.js

# TLD management
npm run example:tld

# Get names list for an address
npm run example:names-list

# Get all names with pagination
npm run example:all-names

# Network information
npm run example:network-info
```

### Test Configuration

Each test file has configurable variables at the top. Update these to test with your own values:

```javascript
// In test/extended-functions.test.js
const TEST_CONFIG = {
  WALLET_ADDRESS: '0x...',  // Your wallet address
  TLD_NAME: 'crypto',
  ODUDE_NAME: 'test@crypto',
  TOKEN_ID: 1,
  TEST_NETWORK: 'basesepolia'
};
```

### Example Configuration

Each example file also has configurable variables:

```javascript
// In examples/get-names-list.js
const CONFIG = {
  WALLET_ADDRESS: '0x...',  // Replace with actual address
  NETWORK: 'basesepolia',
  RPC_URL: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
};
```

### Local Development

For local testing with Hardhat:

```bash
# In your ODude contracts repository
npx hardhat node

# In another terminal, run SDK tests
npm test
```

## Browser Usage

The ODude SDK is fully compatible with modern browsers and can be used in various ways:

### Direct Script Tag

```html
<!DOCTYPE html>
<html>
<head>
  <title>ODude SDK Browser Example</title>
</head>
<body>
  <!-- Include ethers.js -->
  <script src="https://unpkg.com/ethers@6/dist/ethers.umd.min.js"></script>

  <!-- Include ODude SDK -->
  <script src="https://unpkg.com/@odude/odude-sdk/dist/index.umd.js"></script>

  <script>
    async function initSDK() {
      // Create SDK instance
      const sdk = new ODudeSDK({
        rpcUrl_sepolia: 'https://sepolia.base.org'
      });

      // Connect to networks
      await sdk.connectAllNetworks();

      // Use SDK
      try {
        const address = await sdk.resolve('alice@crypto');
        console.log('Resolved:', address);
      } catch (error) {
        console.log('Name not found');
      }
    }

    initSDK();
  </script>
</body>
</html>
```

### Modern Browser with ES Modules

```html
<!DOCTYPE html>
<html>
<head>
  <title>ODude SDK ES Modules</title>
</head>
<body>
  <script type="module">
    import ODudeSDK from 'https://unpkg.com/@odude/odude-sdk/dist/index.browser.mjs';

    const sdk = new ODudeSDK({
      rpcUrl_sepolia: 'https://sepolia.base.org'
    });

    await sdk.connectAllNetworks();

    // Your code here
  </script>
</body>
</html>
```

### With Web3 Wallet Integration

```javascript
// Connect to user's wallet
async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Create provider from wallet
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Initialize SDK with wallet
    const sdk = new ODudeSDK({
      provider: provider,
      signer: signer
    });

    await sdk.connectNetwork('basesepolia');

    // Now you can perform write operations
    return sdk;
  } else {
    throw new Error('Please install MetaMask or another Web3 wallet');
  }
}

// Usage
try {
  const sdk = await connectWallet();
  const address = await sdk.resolve('alice@crypto');
  console.log('Resolved:', address);
} catch (error) {
  console.error('Error:', error.message);
}
```

## Next.js Integration

The ODude SDK works seamlessly with Next.js applications:

### App Router (Next.js 13+)

```typescript
// app/lib/odude.ts
import ODudeSDK, { ODudeSDKConfig } from '@odude/odude-sdk';

const config: ODudeSDKConfig = {
  rpcUrl_sepolia: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL,
  rpcUrl_filecoin: process.env.NEXT_PUBLIC_FILECOIN_RPC_URL,
};

export const sdk = new ODudeSDK(config);

// Initialize on server startup
sdk.connectAllNetworks().catch(console.error);
```

```typescript
// app/api/resolve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sdk } from '@/lib/odude';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: 'Name parameter required' }, { status: 400 });
  }

  try {
    const address = await sdk.resolve(name);
    return NextResponse.json({ name, address });
  } catch (error) {
    return NextResponse.json({ error: 'Name not found' }, { status: 404 });
  }
}
```

```typescript
// app/components/NameResolver.tsx
'use client';

import { useState } from 'react';
import { NameNotFoundError } from '@odude/odude-sdk';

export default function NameResolver() {
  const [name, setName] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resolveName = async () => {
    if (!name) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/resolve?name=${encodeURIComponent(name)}`);
      const data = await response.json();

      if (response.ok) {
        setResult(data.address);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to resolve name');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter ODude name (e.g., alice@crypto)"
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={resolveName}
          disabled={loading || !name}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Resolving...' : 'Resolve'}
        </button>
      </div>

      {result && (
        <div className="p-3 bg-green-100 border border-green-300 rounded">
          <strong>Resolved:</strong> {result}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}
```

### Pages Router (Next.js 12 and below)

```typescript
// lib/odude.ts
import ODudeSDK from '@odude/odude-sdk';

export const sdk = new ODudeSDK({
  rpcUrl_sepolia: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL,
});

// Initialize once
let initialized = false;
export const initializeSDK = async () => {
  if (!initialized) {
    await sdk.connectAllNetworks();
    initialized = true;
  }
  return sdk;
};
```

```typescript
// pages/api/resolve.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { initializeSDK } from '@/lib/odude';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name } = req.query;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Name parameter required' });
  }

  try {
    const sdk = await initializeSDK();
    const address = await sdk.resolve(name);
    res.status(200).json({ name, address });
  } catch (error) {
    res.status(404).json({ error: 'Name not found' });
  }
}
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_FILECOIN_RPC_URL=https://api.node.glif.io
NEXT_PUBLIC_BNB_RPC_URL=https://bsc-dataseed1.binance.org
PRIVATE_KEY=your_private_key_here
```

## Troubleshooting

### Common Issues

#### Network Connection Failures

**Problem:** `JsonRpcProvider failed to detect network` or connection timeouts

**Solution:**
- Verify RPC URL is correct and accessible
- Check network connectivity
- The SDK automatically retries up to 3 times
- Currently, only Base Sepolia network has deployed contracts
- Use environment variables for RPC URLs:

```bash
export BASE_SEPOLIA_RPC_URL="https://sepolia.base.org"
export FILECOIN_RPC_URL="https://api.node.glif.io"
export BNB_RPC_URL="https://bsc-dataseed1.binance.org"
```

#### Contract Not Found Errors

**Problem:** `Contract not connected` or `could not decode result data`

**Solution:**
- Verify contracts are deployed on the target network
- Only Base Sepolia has deployed contracts currently
- Check contract addresses in `config/networks.json`
- Use `sdk.NetworkList()` to verify deployment status:

```javascript
const networkInfo = sdk.NetworkList();
console.log(networkInfo.supportedNetworks.basesepolia.hasContracts);
```

#### Name Not Found Errors

**Problem:** `Name "..." not found` or `Registry: Name not found`

**Solution:**
- This is expected when names don't exist
- Use `nameExists()` to check before resolving:

```javascript
const exists = await sdk.resolver().nameExists('name@crypto');
if (exists) {
  const address = await sdk.resolve('name@crypto');
}
```

#### Method Not Found Errors

**Problem:** `sdk.registry.name is not a function`

**Solution:**
- Use method calls with parentheses: `sdk.registry().name()`
- Not property access: `sdk.registry.name`

```javascript
// ✅ Correct
const name = await sdk.registry().name();
const resolver = sdk.resolver('basesepolia');

// ❌ Incorrect
const name = await sdk.registry.name();
```

### Network Status

Currently supported networks:

- ✅ **Base Sepolia**: Fully working with deployed contracts
- ⚠️ **Localhost**: Works when local Hardhat node is running
- ⚠️ **Filecoin**: RPC accessible but no contracts deployed yet
- ⚠️ **BNB Chain**: RPC accessible but no contracts deployed yet

### Best Practices

1. **Always use try-catch blocks** for async operations
2. **Check network connectivity** before performing operations
3. **Use environment variables** for sensitive data like private keys
4. **Validate names exist** before attempting resolution
5. **Handle network-specific errors** gracefully
6. **Use the working network** (Base Sepolia) for testing
7. **Configure test variables** at the top of test/example files
8. **Check NetworkList()** to debug network issues

### Getting Help

- Check the examples in the `examples/` directory
- Review test files in the `test/` directory
- Examine network configuration in `config/networks.json`
- Use `sdk.displayNetworkList()` to debug network issues
- Open an issue on GitHub with detailed error messages

## API Reference

### ODudeSDK

Main SDK class that provides access to all contracts.

#### Constructor Options

- `rpcUrl` (string): RPC URL for the network
- `provider` (ethers.Provider): Custom provider instance
- `signer` (ethers.Signer): Signer for write operations
- `privateKey` (string): Private key to create a signer

#### Methods

- `connect(addresses)`: Connect to contracts with custom addresses
- `connectNetwork(network)`: Connect to a named network ('base', 'bnb', 'basesepolia')
- `connectSigner(signer)`: Connect a signer for write operations

#### Properties

- `registry`: Registry contract instance
- `resolver`: Resolver contract instance
- `tld`: TLD contract instance
- `rwairdrop`: RWAirdrop contract instance
- `utils`: Helper utilities
- `provider`: Ethers provider
- `signer`: Ethers signer (if connected)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

