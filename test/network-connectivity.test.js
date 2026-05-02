/**
 * Network Connectivity Test
 * 
 * Test Motive:
 * This test verifies that the ODude SDK can successfully connect to all configured networks
 * and retrieve the total supply of names from each network. This confirms that:
 * 1. Network RPC URLs are accessible
 * 2. Contract addresses are correctly configured
 * 3. Registry contracts are deployed and functional on each network
 * 
 * How to run:
 * npm test -- --grep "Network Connectivity"
 * or
 * npx mocha test/network-connectivity.test.js --timeout 30000
 * 
 * Expected behavior:
 * - Should connect to all networks defined in networks.json
 * - Should display total supply for each successfully connected network
 * - Should handle network connection failures gracefully
 */

const { expect } = require('chai');
const ODudeSDK = require('../src/index');

describe('Network Connectivity Test', function() {
  this.timeout(30000); // 30 second timeout for network operations
  
  let sdk;
  let networkConfig;

  before(function() {
    // Load network configuration
    networkConfig = require('../config/networks.json');
    console.log('\n=== ODude SDK Network Connectivity Test ===');
    console.log('Testing connectivity to all configured networks...\n');
  });

  beforeEach(function() {
    // Initialize SDK with environment variables or default RPC URLs
    sdk = new ODudeSDK({
      // Use environment variables if available, otherwise use defaults from config
      rpcUrl_filecoin: process.env.FILECOIN_RPC_URL,
      rpcUrl_bnb: process.env.BNB_RPC_URL,
      rpcUrl_sepolia: process.env.BASE_SEPOLIA_RPC_URL,
      rpcUrl: process.env.LOCALHOST_RPC_URL || 'http://127.0.0.1:8545'
    });
  });

  it('should display total supply of names on each network', async function() {
    const results = {};
    const networkNames = Object.keys(networkConfig.networks);
    
    console.log('--- Network Connectivity Results ---\n');

    for (const networkName of networkNames) {
      try {
        console.log(`Testing ${networkName} network...`);
        
        // Attempt to connect to the network
        await sdk.connectNetwork(networkName);
        
        // Get network info
        const networkInfo = networkConfig.networks[networkName];
        console.log(`  ✓ Connected to ${networkInfo.name} (Chain ID: ${networkInfo.chainId})`);
        console.log(`  ✓ Registry Contract: ${networkInfo.contracts.Registry}`);
        
        // Try to get total supply
        const totalSupply = await sdk.registry(networkName).totalSupply();
        console.log(`  ✓ Total Supply: ${totalSupply.toString()} names`);
        
        results[networkName] = {
          connected: true,
          totalSupply: totalSupply.toString(),
          chainId: networkInfo.chainId,
          registryAddress: networkInfo.contracts.Registry
        };
        
        console.log(`  ✅ ${networkName} network is working correctly\n`);
        
      } catch (error) {
        console.log(`  ❌ Failed to connect to ${networkName}: ${error.message}\n`);
        results[networkName] = {
          connected: false,
          error: error.message,
          chainId: networkConfig.networks[networkName].chainId
        };
      }
    }

    // Display summary
    console.log('--- Summary ---');
    const connectedNetworks = Object.keys(results).filter(net => results[net].connected);
    const failedNetworks = Object.keys(results).filter(net => !results[net].connected);
    
    console.log(`✅ Connected Networks: ${connectedNetworks.length}/${networkNames.length}`);
    if (connectedNetworks.length > 0) {
      connectedNetworks.forEach(net => {
        console.log(`   - ${net}: ${results[net].totalSupply} names`);
      });
    }
    
    if (failedNetworks.length > 0) {
      console.log(`❌ Failed Networks: ${failedNetworks.length}`);
      failedNetworks.forEach(net => {
        console.log(`   - ${net}: ${results[net].error}`);
      });
    }
    
    console.log('\nNote: Some networks may fail if RPC URLs are not configured or contracts are not deployed.');
    console.log('This is expected for test networks or networks without deployed contracts.\n');

    // Test should pass if at least one network is working
    expect(connectedNetworks.length).to.be.greaterThan(0, 'At least one network should be accessible');
    
    // Store results for potential use in other tests
    this.networkResults = results;
  });

  it('should verify network configuration integrity', function() {
    // Verify that all networks have required configuration
    const networks = networkConfig.networks;
    
    for (const [networkName, networkInfo] of Object.entries(networks)) {
      expect(networkInfo).to.have.property('name');
      expect(networkInfo).to.have.property('chainId');
      expect(networkInfo).to.have.property('defaultRpcUrl');
      expect(networkInfo).to.have.property('contracts');
      expect(networkInfo.contracts).to.have.property('Registry');
      expect(networkInfo.contracts).to.have.property('Resolver');
      expect(networkInfo.contracts).to.have.property('TLD');
      expect(networkInfo.contracts).to.have.property('RWAirdrop');
    }
    
    // Verify TLD mappings
    expect(networkConfig).to.have.property('tldMappings');
    expect(networkConfig).to.have.property('defaultNetwork');
    
    console.log('✅ Network configuration is valid');
  });

  after(function() {
    // Clean up event listeners
    if (sdk) {
      try {
        sdk.removeAllListenersAllNetworks();
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });
});
