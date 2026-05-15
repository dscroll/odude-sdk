/**
 * Basic Usage Example
 * Demonstrates how to connect to ODude contracts and perform basic operations
 *
 * This example shows:
 * - Multi-network SDK initialization
 * - Contract connection and basic queries
 * - Name resolution with @ format
 * - Helper utilities usage
 * - node examples/basic-usage.js
 */

const ODudeSDK = require('../src/index');

async function main() {
  console.log('=== ODude SDK Multi-Network Basic Usage Example ===\n');

  // Initialize SDK with multi-network support
  const sdk = new ODudeSDK({
    rpcUrl_base: process.env.BASE_RPC_URL,
    rpcUrl_bnb: process.env.BNB_RPC_URL,
    rpcUrl_sepolia: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
  });

  // Display network information
  console.log('--- Network Information ---');
  sdk.displayNetworkList();

  // Connect to Base Sepolia (the working network)
  let connectedNetworks = [];
  try {
    sdk.connectNetwork('basesepolia');
    connectedNetworks = ['basesepolia'];
    console.log('✓ Connected to Base Sepolia network');
  } catch (error) {
    console.log('❌ Failed to connect to Base Sepolia network:', error.message);
    console.log('This may be due to network connectivity issues.');
    return;
  }
  console.log();

  // === Registry Contract ===
  console.log('--- Registry Contract ---');

  try {
    const registryName = await sdk.registry().name();
    const registrySymbol = await sdk.registry().symbol();
    const totalSupply = await sdk.registry().totalSupply();

    console.log('Contract Name:', registryName);
    console.log('Contract Symbol:', registrySymbol);
    console.log('Total Supply:', totalSupply.toString());
    console.log('Registry Address:', sdk.registry().address);
  } catch (error) {
    console.log('❌ Registry contract operations failed:', error.message);
    console.log('This may be due to network connectivity issues or contract deployment status.');
  }
  console.log();

  // === Resolver Contract ===
  console.log('--- Resolver Contract ---');

  try {
    const resolverAddress = sdk.resolver().address;
    console.log('Resolver Address:', resolverAddress);

    // Try to resolve a name
    try {
      const exists = await sdk.resolver().nameExists('xxx');
      console.log('Name "xxx" exists:', exists);
    } catch (error) {
      console.log('Name resolution check failed:', error.message);
    }
  } catch (error) {
    console.log('❌ Resolver contract access failed:', error.message);
  }
  console.log();

  // === TLD Contract ===
  console.log('--- TLD Contract ---');

  try {
    const baseTLDPrice = await sdk.tld().getBaseTLDPrice();
    const defaultCommission = await sdk.tld().getDefaultCommission();

    console.log('TLD Address:', sdk.tld().address);
    console.log('Base TLD Price:', sdk.utils.formatEther(baseTLDPrice), 'ETH');
    console.log('Default Commission:', defaultCommission.toString(), '%');
  } catch (error) {
    console.log('❌ TLD contract operations failed:', error.message);
  }
  console.log();

  // === RWAirdrop Contract ===
  console.log('--- RWAirdrop Contract ---');

  try {
    console.log('RWAirdrop Address:', sdk.rwairdrop().address);

    try {
      // Try to get TLD airdrop count for 'xxx' TLD
      const airdropCount = await sdk.rwairdrop().getTLDAirdropCount('xxx');
      console.log('Airdrop count for "xxx" TLD:', airdropCount.toString());

      if (airdropCount > 0) {
        // Check if first airdrop is active
        const isActive = await sdk.rwairdrop().isAirdropActive('xxx', 0);
        console.log('First airdrop active:', isActive);
      }
    } catch (error) {
      console.log('Airdrop operations failed:', error.message);
    }
  } catch (error) {
    console.log('❌ RWAirdrop contract access failed:', error.message);
  }
  console.log();

  // === Helper Utilities ===
  console.log('--- Helper Utilities ---');

  const testName = 'test@xxx';
  const normalized = sdk.utils.normalizeName(testName);
  const parsed = sdk.utils.parseName(normalized);

  console.log('Original name:', testName);
  console.log('Normalized:', normalized);
  console.log('Parsed:', parsed);
  console.log();

  console.log('✓ Example completed successfully!');
}

// Run the example
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

