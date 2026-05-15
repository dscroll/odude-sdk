/**
 * Name Resolution Example
 * Demonstrates how to resolve names and reverse resolve addresses across multiple networks
 *
 * This example shows:
 * - Multi-network name resolution with automatic TLD routing
 * - Forward resolution (name → address)
 * - Reverse resolution (address → name)
 * - Cross-network domain handling
 */

const ODudeSDK = require('../src/index');

async function main() {
  console.log('=== ODude Multi-Network Name Resolution Example ===\n');

  // Initialize SDK with multi-network support
  const sdk = new ODudeSDK({
    rpcUrl_base: process.env.BASE_RPC_URL,
    rpcUrl_bnb: process.env.BNB_RPC_URL,
    rpcUrl_sepolia: process.env.BASE_SEPOLIA_RPC_URL
  });

  // Connect to all available networks
  try {
    const connectedNetworks = sdk.connectAllNetworks();
    console.log('✓ Connected to networks:', connectedNetworks.join(', '));
  } catch (error) {
    console.log('⚠️  Some networks may not be available:', error.message);
  }
  console.log();

  // Test names across different networks (using @ format)
  const testNames = [
    'crypto',           // TLD on default network
    'dscroll',      // Subdomain on default network
    'test@crypto',      // Another subdomain on default network
    'test@bnb',         // Subdomain on BNB network
    'example@binance',   // Subdomain on BNB network (binance TLD maps to bnb)
    'test@base'         // Subdomain on Base network
  ];

  console.log('--- Forward Resolution (Name → Address) ---');
  for (const name of testNames) {
    try {
      // Determine which network this name should resolve on
      let targetNetwork = 'base'; // default
      if (name.includes('@')) {
        const tld = name.split('@')[1];
        targetNetwork = sdk.getNetworkForTLD(tld);
      }

      console.log(`\nName: ${name}`);
      console.log(`Target Network: ${targetNetwork}`);

      try {
        // Check if name exists on the target network
        const exists = await sdk.resolver(targetNetwork).nameExists(name);
        console.log(`Exists: ${exists}`);

        if (exists) {
          const address = await sdk.resolve(name);
          console.log(`Resolved Address: ${address}`);

          // Get full resolution record
          const record = await sdk.resolver(targetNetwork).getResolutionRecord(name);
          console.log(`Token ID: ${record.tokenId.toString()}`);
          console.log(`Network: ${targetNetwork}`);
        } else {
          console.log(`Name "${name}" does not exist on ${targetNetwork} network`);
        }
      } catch (networkError) {
        console.log(`Network operation failed for ${targetNetwork}:`, networkError.message);
      }
    } catch (error) {
      console.log(`Failed to resolve "${name}":`, error.message);
    }
  }

  console.log('\n--- Reverse Resolution (Address → Name) ---');

  // Test addresses
  const testAddresses = [
    '0x90F79bf6EB2c4f870365E785982E1f101E93b906', // Default hardhat account
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
  ];

  for (const address of testAddresses) {
    try {
      const hasReverse = await sdk.resolver().hasReverse(address);
      console.log(`\nAddress: ${address}`);
      console.log(`Has Reverse: ${hasReverse}`);

      if (hasReverse) {
        const name = await sdk.reverse(address);
        console.log(`Primary Name: ${name}`);

        // Get full reverse record
        const record = await sdk.resolver().getReverseRecord(address);
        console.log(`Token ID: ${record.primaryTokenId.toString()}`);
      }
    } catch (error) {
      console.log(`Failed to reverse resolve ${address}:`, error.message);
    }
  }

  console.log('\n--- Name Information ---');

  // Get comprehensive name info
  for (const name of testNames) {
    try {
      const info = await sdk.getNameInfo(name);
      console.log(`\nName: ${name}`);
      console.log('Info:', JSON.stringify(info, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
        , 2));
    } catch (error) {
      console.log(`Failed to get info for "${name}":`, error.message);
    }
  }

  console.log('\n✓ Example completed!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

