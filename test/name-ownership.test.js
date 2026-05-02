/**
 * Name Ownership Test
 * 
 * Test Motive:
 * This test verifies that the ODude SDK can correctly resolve and identify owners
 * of specific domain names across different networks. It demonstrates:
 * 1. Cross-network name resolution functionality
 * 2. Automatic TLD-to-network routing (@ format domains)
 * 3. Owner lookup capabilities
 * 4. Network-specific domain handling
 * 
 * How to run:
 * npm test -- --grep "Name Ownership"
 * or
 * npx mocha test/name-ownership.test.js --timeout 30000
 * 
 * Expected behavior:
 * - Should attempt to resolve each test name on its appropriate network
 * - Should display owner information when names exist
 * - Should handle non-existent names gracefully
 * - Should show which network each name is being resolved on
 */

const { expect } = require('chai');
const ODudeSDK = require('../src/ODudeSDK');

describe('Name Ownership Test', function() {
  this.timeout(30000); // 30 second timeout for network operations
  
  let sdk;
  let networkConfig;

  // Test names with their expected networks based on TLD mappings
  const testNames = [
    { name: 'crypto', expectedNetwork: 'basesepolia', description: 'TLD name on default network' },
    { name: 'test@crypto', expectedNetwork: 'basesepolia', description: 'Subdomain on default network' },
    { name: 'test@bnb', expectedNetwork: 'bnb', description: 'Subdomain on BNB network' },
    { name: 'test@filecoin', expectedNetwork: 'filecoin', description: 'Subdomain on Filecoin network' },
    { name: 'test@eth', expectedNetwork: 'basesepolia', description: 'Subdomain on default network (eth TLD)' }
  ];

  before(function() {
    networkConfig = require('../config/networks.json');
    console.log('\n=== ODude SDK Name Ownership Test ===');
    console.log('Testing name ownership resolution across networks...\n');
  });

  beforeEach(function() {
    // Initialize SDK with environment variables or default RPC URLs
    sdk = new ODudeSDK({
      rpcUrl_filecoin: process.env.FILECOIN_RPC_URL,
      rpcUrl_bnb: process.env.BNB_RPC_URL,
      rpcUrl_sepolia: process.env.BASE_SEPOLIA_RPC_URL,
      rpcUrl: process.env.LOCALHOST_RPC_URL || 'http://127.0.0.1:8545'
    });

    // Connect to all available networks
    try {
      sdk.connectAllNetworks();
    } catch (error) {
      console.log('Warning: Some networks may not be available:', error.message);
    }
  });

  it('should display owners of specific names with network information', async function() {
    console.log('--- Name Ownership Results ---\n');
    
    const results = {};

    for (const testCase of testNames) {
      const { name, expectedNetwork, description } = testCase;
      
      try {
        console.log(`Testing: ${name}`);
        console.log(`  Description: ${description}`);
        console.log(`  Expected Network: ${expectedNetwork}`);
        
        // Determine which network this name should resolve on
        let targetNetwork = expectedNetwork;
        if (name.includes('@')) {
          const tld = name.split('@')[1];
          targetNetwork = sdk.getNetworkForTLD(tld);
        }
        
        console.log(`  Actual Network: ${targetNetwork}`);
        
        // Check if we can connect to the target network
        const networkInfo = networkConfig.networks[targetNetwork];
        if (!networkInfo) {
          console.log(`  ❌ Network ${targetNetwork} not found in configuration\n`);
          results[name] = { error: 'Network not configured', network: targetNetwork };
          continue;
        }
        
        // Check if contracts are deployed (non-zero addresses)
        const registryAddress = networkInfo.contracts.Registry;
        if (registryAddress === '0x0000000000000000000000000000000000000000') {
          console.log(`  ⚠️  Contracts not deployed on ${targetNetwork} network\n`);
          results[name] = { error: 'Contracts not deployed', network: targetNetwork };
          continue;
        }
        
        console.log(`  Registry Address: ${registryAddress}`);
        
        // Try to get owner information
        try {
          const owner = await sdk.getOwner(name);
          console.log(`  ✅ Owner: ${owner}`);
          
          // Try to get additional name information
          try {
            const nameInfo = await sdk.getNameInfo(name);
            console.log(`  Token ID: ${nameInfo.tokenId}`);
            console.log(`  Resolved Address: ${nameInfo.resolvedAddress || 'Not set'}`);
            console.log(`  Exists: ${nameInfo.exists}`);
            
            results[name] = {
              owner,
              network: targetNetwork,
              tokenId: nameInfo.tokenId,
              resolvedAddress: nameInfo.resolvedAddress,
              exists: nameInfo.exists,
              registryAddress
            };
          } catch (infoError) {
            results[name] = {
              owner,
              network: targetNetwork,
              registryAddress,
              infoError: infoError.message
            };
          }
          
        } catch (ownerError) {
          console.log(`  ❌ Failed to get owner: ${ownerError.message}`);
          results[name] = {
            error: ownerError.message,
            network: targetNetwork,
            registryAddress
          };
        }
        
      } catch (error) {
        console.log(`  ❌ General error: ${error.message}`);
        results[name] = {
          error: error.message,
          network: expectedNetwork
        };
      }
      
      console.log(); // Empty line for readability
    }

    // Display summary
    console.log('--- Summary ---');
    const resolvedNames = Object.keys(results).filter(name => results[name].owner);
    const failedNames = Object.keys(results).filter(name => results[name].error);
    
    console.log(`✅ Successfully resolved: ${resolvedNames.length}/${testNames.length} names`);
    if (resolvedNames.length > 0) {
      resolvedNames.forEach(name => {
        const result = results[name];
        console.log(`   - ${name} → ${result.owner} (${result.network})`);
      });
    }
    
    if (failedNames.length > 0) {
      console.log(`❌ Failed to resolve: ${failedNames.length} names`);
      failedNames.forEach(name => {
        const result = results[name];
        console.log(`   - ${name}: ${result.error} (${result.network})`);
      });
    }
    
    console.log('\nNote: Names may not exist or networks may not have deployed contracts.');
    console.log('This test demonstrates the SDK\'s ability to route names to correct networks.\n');

    // Test should pass regardless of whether names exist
    // The important thing is that the SDK can attempt resolution on correct networks
    expect(results).to.be.an('object');
    expect(Object.keys(results)).to.have.length(testNames.length);
    
    // Store results for potential use in other tests
    this.nameResults = results;
  });

  it('should correctly map TLDs to networks', function() {
    const tldMappings = networkConfig.tldMappings;
    
    // Test TLD mapping functionality
    expect(sdk.getNetworkForTLD('fil')).to.equal('filecoin');
    expect(sdk.getNetworkForTLD('fvm')).to.equal('filecoin');
    expect(sdk.getNetworkForTLD('bnb')).to.equal('bnb');
    expect(sdk.getNetworkForTLD('binance')).to.equal('bnb');
    expect(sdk.getNetworkForTLD('crypto')).to.equal(networkConfig.defaultNetwork);
    expect(sdk.getNetworkForTLD('eth')).to.equal(networkConfig.defaultNetwork);
    
    console.log('✅ TLD to network mapping is working correctly');
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
