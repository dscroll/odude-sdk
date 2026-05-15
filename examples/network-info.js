/**
 * Network Information Example
 * 
 * This example demonstrates how to:
 * - Get network configuration and connection status
 * - Display network information in a formatted way
 * - Check which networks are available and connected
 * - Understand TLD to network mappings
 * 
 * Use Case:
 * - Debug network connectivity issues
 * - Validate SDK configuration
 * - Display network status in applications
 * - Understand which TLDs map to which networks
 * 
 * How to run:
 * npm run example:network-info
 * or
 * node examples/network-info.js
 */

const ODudeSDK = require('../src/index');

// ==================== CONFIGURATION ====================
// Update these variables to test with your own values
const CONFIG = {
  // RPC URLs (optional, will use defaults if not provided)
  RPC_URL_BASE: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
  RPC_URL_SEPOLIA: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
  RPC_URL_BNB: process.env.BNB_RPC_URL,
  
  // Test TLDs to check network mapping
  TEST_TLDS: ['crypto', 'bnb', 'binance', 'eth', 'base']
};
// =======================================================

async function main() {
  console.log('=== ODude SDK - Network Information Example ===\n');

  // Initialize SDK with all network configurations
  const sdk = new ODudeSDK({
    rpcUrl_base: CONFIG.RPC_URL_BASE,
    rpcUrl_sepolia: CONFIG.RPC_URL_SEPOLIA,
    rpcUrl_bnb: CONFIG.RPC_URL_BNB
  });

  // === Step 1: Display Network List ===
  console.log('--- Step 1: Display Network List ---');
  console.log('This shows all configured networks and their status:\n');
  
  sdk.displayNetworkList();

  // === Step 2: Get Network Information Programmatically ===
  console.log('\n--- Step 2: Get Network Information Programmatically ---');
  
  const networkInfo = sdk.NetworkList();
  
  console.log('\nCurrent Network:', networkInfo.currentNetwork || 'None');
  console.log('Default Network:', networkInfo.defaultNetwork);
  console.log('Connected Networks:', networkInfo.connectedNetworks.join(', ') || 'None');
  console.log();

  // === Step 3: Check Each Network's Status ===
  console.log('--- Step 3: Network Status Details ---\n');
  
  for (const [networkName, config] of Object.entries(networkInfo.supportedNetworks)) {
    console.log(`Network: ${networkName} (${config.name})`);
    console.log(`  Chain ID: ${config.chainId}`);
    console.log(`  RPC URL: ${config.defaultRpcUrl}`);
    console.log(`  Environment Variable: ${config.rpcUrlEnvVar || 'None'}`);
    console.log(`  Connected: ${config.isConnected ? '✅' : '❌'}`);
    console.log(`  Contracts Deployed: ${config.hasContracts ? '✅' : '⚠️  (Zero addresses)'}`);
    
    if (config.contracts) {
      console.log('  Contract Addresses:');
      console.log(`    Registry: ${config.contracts.Registry}`);
      console.log(`    Resolver: ${config.contracts.Resolver}`);
      console.log(`    TLD: ${config.contracts.TLD}`);
      console.log(`    RWAirdrop: ${config.contracts.RWAirdrop}`);
    }
    console.log();
  }

  // === Step 4: TLD to Network Mapping ===
  console.log('--- Step 4: TLD to Network Mapping ---\n');
  
  console.log('Configured TLD Mappings:');
  for (const [tld, network] of Object.entries(networkInfo.tldMappings)) {
    console.log(`  ${tld} → ${network}`);
  }
  console.log();
  
  console.log('Testing TLD Resolution:');
  for (const tld of CONFIG.TEST_TLDS) {
    const network = sdk.getNetworkForTLD(tld);
    console.log(`  ${tld} → ${network}`);
  }
  console.log();

  // === Step 5: Try Connecting to Networks ===
  console.log('--- Step 5: Try Connecting to Networks ---\n');
  
  const networksToTest = ['base', 'basesepolia', 'bnb'];
  
  for (const networkName of networksToTest) {
    try {
      console.log(`Attempting to connect to ${networkName}...`);
      sdk.connectNetwork(networkName);
      console.log(`  ✅ Successfully connected to ${networkName}`);
      
      // Try to get registry name
      try {
        const registryName = await sdk.registry(networkName).name();
        console.log(`  Registry Name: ${registryName}`);
      } catch (error) {
        console.log(`  ⚠️  Could not access registry: ${error.message}`);
      }
      
    } catch (error) {
      console.log(`  ❌ Failed to connect: ${error.message}`);
    }
    console.log();
  }

  // === Step 6: Provider and Signer Information ===
  console.log('--- Step 6: Provider and Signer Information ---\n');
  
  try {
    const provider = sdk.getProvider();
    console.log('Default Provider:', provider ? '✅ Available' : '❌ Not available');
    
    const signer = sdk.getSigner();
    console.log('Default Signer:', signer ? '✅ Available' : '❌ Not available');
    
    if (signer) {
      try {
        const address = await signer.getAddress();
        console.log('Signer Address:', address);
      } catch (error) {
        console.log('Could not get signer address');
      }
    }
  } catch (error) {
    console.log('⚠️  Provider/Signer check failed:', error.message);
  }

  console.log('\n=== Example Complete ===');
  console.log('\nWhat you learned:');
  console.log('1. How to display formatted network information');
  console.log('2. How to get network configuration programmatically');
  console.log('3. How to check network connection status');
  console.log('4. How to understand TLD to network mappings');
  console.log('5. How to test connectivity to different networks');
  console.log('\nKey Insights:');
  console.log('- Both Base Mainnet and Base Sepolia have deployed contracts');
  console.log('- TLDs like "bnb" and "binance" map to BNB network');
  console.log('- Other TLDs default to Base Mainnet network');
  console.log('\nNext steps:');
  console.log('- Set environment variables for RPC URLs');
  console.log('- Deploy contracts to other networks');
  console.log('- Use NetworkList() in your application for status checks');
}

// Run the example
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

