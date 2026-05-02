/**
 * TypeScript Integration Test
 * Tests that TypeScript can properly import and use the SDK
 * 
 * Note: This file tests TypeScript compilation, not runtime behavior
 */

import ODudeSDK, {
  ODudeSDKConfig,
  NameInfo,
  NetworkInfo,
  Registry,
  Resolver,
  TLD,
  RWAirdrop,
  NameNotFoundError,
  NetworkError
} from '../../src/index';

// Import utils separately
const { utils } = require('../../src/index');

// Test configuration typing
const config: ODudeSDKConfig = {
  rpcUrl_sepolia: 'https://sepolia.base.org',
  rpcUrl_filecoin: 'https://api.node.glif.io',
  privateKey: '0x' + '1'.repeat(64)
};

// Test SDK instantiation
const sdk = new ODudeSDK(config);

// Test method signatures and return types
async function testSDKMethods(): Promise<void> {
  // Test resolve method
  const address: string = await sdk.resolve('alice@crypto');
  
  // Test getNameInfo method
  const nameInfo: NameInfo = await sdk.getNameInfo('alice@crypto');
  
  // Test NetworkList method
  const networkInfo: NetworkInfo = sdk.NetworkList();
  
  // Test contract access
  const registry: Registry = sdk.registry();
  const resolver: Resolver = sdk.resolver();
  const tld: TLD = sdk.tld();
  const rwairdrop: RWAirdrop = sdk.rwairdrop();
  
  // Test utility functions
  const normalized: string = utils.normalizeName('TEST@CRYPTO');
  const extractedTLD: string = utils.extractTLD('alice@crypto');
  const isValid: boolean = utils.isValidAddress('0x1234567890123456789012345678901234567890');
}

// Test error handling with proper types
async function testErrorHandling(): Promise<void> {
  try {
    await sdk.resolve('nonexistent@crypto');
  } catch (error) {
    if (error instanceof NameNotFoundError) {
      const code: string | null = error.code;
      // Note: domainName property exists but may conflict with Error.name
    } else if (error instanceof NetworkError) {
      const networkName: string | null = error.networkName;
    }
  }
}

// Test contract method signatures
async function testContractMethods(): Promise<void> {
  const registry = sdk.registry();
  const resolver = sdk.resolver();
  const tld = sdk.tld();
  const rwairdrop = sdk.rwairdrop();
  
  // Registry methods
  const totalSupply: bigint = await registry.totalSupply();
  const owner: string = await registry.ownerOf(BigInt(1));
  const balance: bigint = await registry.balanceOf('0x1234567890123456789012345678901234567890');
  
  // Resolver methods
  const resolvedAddress: string = await resolver.resolve('alice@crypto');
  const reverseName: string = await resolver.reverse('0x1234567890123456789012345678901234567890');
  const exists: boolean = await resolver.nameExists('alice@crypto');
  
  // TLD methods
  const basePrice: bigint = await tld.getBaseTLDPrice();
  const tldPrice: bigint = await tld.getTLDPrice(BigInt(1));
  const commission: bigint = await tld.getCommission(BigInt(1));
  
  // RWAirdrop methods
  const eligible: boolean = await rwairdrop.isEligible('0x1234567890123456789012345678901234567890');
  const claimable: bigint = await rwairdrop.getClaimableAmount('0x1234567890123456789012345678901234567890');
}

// Test event callback types
function testEventCallbacks(): void {
  sdk.onTransfer((from: string, to: string, tokenId: bigint) => {
    console.log(`Transfer: ${from} → ${to} (Token: ${tokenId})`);
  });
  
  sdk.onNameResolved((name: string, address: string) => {
    console.log(`Name resolved: ${name} → ${address}`);
  });
  
  sdk.onDomainMinted((name: string, owner: string) => {
    console.log(`Domain minted: ${name} by ${owner}`);
  });
}

// Test type-only imports
import type { 
  AirdropInfo, 
  MintEligibility, 
  ParsedName,
  TransferCallback,
  NameResolvedCallback 
} from '../../src/index';

// Test interface usage
function testInterfaces(): void {
  const airdropInfo: AirdropInfo = {
    eligible: true,
    claimed: false,
    claimableAmount: BigInt('1000000000000000000'),
    isActive: true,
    canClaim: true
  };

  const mintEligibility: MintEligibility = {
    eligible: true,
    available: true,
    tldActive: true,
    cost: BigInt('500000000000000000'),
    reason: 'Eligible for minting'
  };
  
  const parsedName: ParsedName = {
    full: 'sub@alice@crypto',
    tld: 'crypto',
    subdomain: 'sub@alice',
    parts: ['sub', 'alice', 'crypto'],
    isTLD: false,
    isSubdomain: true
  };
}

// Test callback type usage
function testCallbackTypes(): void {
  const transferCallback: TransferCallback = (from, to, tokenId) => {
    console.log(`Transfer: ${from} → ${to} (Token: ${tokenId})`);
  };
  
  const nameResolvedCallback: NameResolvedCallback = (name, address) => {
    console.log(`Name resolved: ${name} → ${address}`);
  };
  
  sdk.onTransfer(transferCallback);
  sdk.onNameResolved(nameResolvedCallback);
}

// Export functions for potential testing
export {
  testSDKMethods,
  testErrorHandling,
  testContractMethods,
  testEventCallbacks,
  testInterfaces,
  testCallbackTypes
};
