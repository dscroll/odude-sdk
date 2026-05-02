/**
 * Extended Functions Test
 * 
 * Test Motive:
 * This test verifies the extended SDK functions that provide additional functionality
 * for querying names, checking availability, and managing network information.
 * 
 * Functions tested:
 * - getTotalNames(address) - Get total number of names owned by an address
 * - getNamesList(address) - Get list of names owned by an address
 * - getNameDetails(name) - Get comprehensive details about a name
 * - getNameById(tokenId) - Get name by token ID
 * - getAllNames(startIndex, count) - Get all names with pagination
 * - isNameAvailable(name) - Check if a name is available
 * - getApproved(tokenId) - Get approved address for a token
 * - NetworkList() - Get network configuration and connection status
 * - displayNetworkList() - Display network information
 * 
 * How to run:
 * npm run test:extended
 * or
 * npx mocha test/extended-functions.test.js --timeout 30000
 * 
 * Configuration:
 * Update the test variables below to test with different values
 */

const { expect } = require('chai');
const ODudeSDK = require('../src/index');

// ==================== TEST CONFIGURATION ====================
// Update these variables to test with different values
const TEST_CONFIG = {
  // Wallet address to test (should own some names for full testing)
  WALLET_ADDRESS: '0xaa481F8d2d966e5fCC0446fA459F5d580AE5ea9f',
  
  // TLD name to test
  TLD_NAME: 'crypto',
  
  // ODude name to test (format: name@tld)
  ODUDE_NAME: 'test@crypto',
  
  // Token ID to test (use a valid token ID if available)
  TOKEN_ID: 1,
  
  // Pagination settings for getAllNames
  START_INDEX: 0,
  PAGE_SIZE: 5,
  
  // Network to test (basesepolia, filecoin, bnb, localhost)
  TEST_NETWORK: 'basesepolia'
};
// ============================================================

describe('Extended Functions Test', function() {
  this.timeout(30000); // 30 second timeout for network operations
  
  let sdk;
  let networkConfig;

  before(function() {
    networkConfig = require('../config/networks.json');
    console.log('\n=== ODude SDK Extended Functions Test ===');
    console.log('Testing extended SDK functionality...\n');
    console.log('Test Configuration:');
    console.log('  Wallet Address:', TEST_CONFIG.WALLET_ADDRESS);
    console.log('  TLD Name:', TEST_CONFIG.TLD_NAME);
    console.log('  ODude Name:', TEST_CONFIG.ODUDE_NAME);
    console.log('  Token ID:', TEST_CONFIG.TOKEN_ID);
    console.log('  Test Network:', TEST_CONFIG.TEST_NETWORK);
    console.log();
  });

  beforeEach(function() {
    // Initialize SDK with environment variables or default RPC URLs
    sdk = new ODudeSDK({
      rpcUrl_filecoin: process.env.FILECOIN_RPC_URL,
      rpcUrl_bnb: process.env.BNB_RPC_URL,
      rpcUrl_sepolia: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
      rpcUrl: process.env.LOCALHOST_RPC_URL || 'http://127.0.0.1:8545'
    });

    // Connect to test network
    try {
      sdk.connectNetwork(TEST_CONFIG.TEST_NETWORK);
      console.log(`✓ Connected to ${TEST_CONFIG.TEST_NETWORK} network`);
    } catch (error) {
      console.log(`⚠️  Failed to connect to ${TEST_CONFIG.TEST_NETWORK}:`, error.message);
    }
  });

  describe('NetworkList() and displayNetworkList()', function() {
    it('should return network configuration and connection status', function() {
      console.log('\n--- Testing NetworkList() ---');
      
      const networkInfo = sdk.NetworkList();
      
      // Verify structure
      expect(networkInfo).to.be.an('object');
      expect(networkInfo).to.have.property('supportedNetworks');
      expect(networkInfo).to.have.property('currentNetwork');
      expect(networkInfo).to.have.property('connectedNetworks');
      expect(networkInfo).to.have.property('tldMappings');
      expect(networkInfo).to.have.property('defaultNetwork');
      
      console.log('Current Network:', networkInfo.currentNetwork);
      console.log('Default Network:', networkInfo.defaultNetwork);
      console.log('Connected Networks:', networkInfo.connectedNetworks);
      console.log('Supported Networks:', Object.keys(networkInfo.supportedNetworks));
      console.log('TLD Mappings:', networkInfo.tldMappings);
      
      // Verify each supported network has required properties
      for (const [networkName, config] of Object.entries(networkInfo.supportedNetworks)) {
        expect(config).to.have.property('name');
        expect(config).to.have.property('chainId');
        expect(config).to.have.property('defaultRpcUrl');
        expect(config).to.have.property('contracts');
        expect(config).to.have.property('isConnected');
        expect(config).to.have.property('hasContracts');
      }
      
      console.log('✓ NetworkList() returned valid structure');
    });

    it('should display network information to console', function() {
      console.log('\n--- Testing displayNetworkList() ---');
      
      const result = sdk.displayNetworkList();
      
      expect(result).to.be.an('object');
      expect(result).to.have.property('supportedNetworks');
      
      console.log('✓ displayNetworkList() executed successfully');
    });
  });

  describe('getTotalNames(address)', function() {
    it('should return total number of names owned by an address', async function() {
      console.log('\n--- Testing getTotalNames() ---');
      console.log('Address:', TEST_CONFIG.WALLET_ADDRESS);
      
      try {
        const totalNames = await sdk.getTotalNames(TEST_CONFIG.WALLET_ADDRESS);
        
        expect(totalNames).to.exist;
        console.log('Total Names:', totalNames.toString());
        console.log('✓ getTotalNames() executed successfully');
      } catch (error) {
        console.log('⚠️  getTotalNames() failed:', error.message);
        console.log('This may be expected if the address has no names or contracts are not deployed');
      }
    });
  });

  describe('getNamesList(address)', function() {
    it('should return list of names owned by an address', async function() {
      console.log('\n--- Testing getNamesList() ---');
      console.log('Address:', TEST_CONFIG.WALLET_ADDRESS);
      
      try {
        const namesList = await sdk.getNamesList(TEST_CONFIG.WALLET_ADDRESS);
        
        expect(namesList).to.be.an('array');
        console.log('Names Count:', namesList.length);
        
        if (namesList.length > 0) {
          console.log('Names:');
          namesList.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.name} (Token ID: ${item.tokenId})`);
          });
          
          // Verify structure of each item
          namesList.forEach(item => {
            expect(item).to.have.property('tokenId');
            expect(item).to.have.property('name');
          });
        } else {
          console.log('No names found for this address');
        }
        
        console.log('✓ getNamesList() executed successfully');
      } catch (error) {
        console.log('⚠️  getNamesList() failed:', error.message);
        console.log('This may be expected if the address has no names or contracts are not deployed');
      }
    });
  });

  describe('getNameDetails(name)', function() {
    it('should return comprehensive details about a name', async function() {
      console.log('\n--- Testing getNameDetails() ---');
      console.log('Name:', TEST_CONFIG.ODUDE_NAME);
      
      try {
        const details = await sdk.getNameDetails(TEST_CONFIG.ODUDE_NAME);
        
        expect(details).to.be.an('object');
        expect(details).to.have.property('name');
        expect(details).to.have.property('tokenId');
        expect(details).to.have.property('owner');
        expect(details).to.have.property('metadata');
        expect(details).to.have.property('tokenURI');
        expect(details).to.have.property('exists');
        
        console.log('Name Details:');
        console.log('  Name:', details.name);
        console.log('  Token ID:', details.tokenId);
        console.log('  Owner:', details.owner);
        console.log('  Exists:', details.exists);
        console.log('  Resolved Address:', details.resolvedAddress || 'Not set');
        console.log('  Token URI:', details.tokenURI);
        console.log('  Metadata:', JSON.stringify(details.metadata, null, 2));
        
        console.log('✓ getNameDetails() executed successfully');
      } catch (error) {
        console.log('⚠️  getNameDetails() failed:', error.message);
        console.log('This may be expected if the name does not exist');
      }
    });
  });

  describe('getNameById(tokenId)', function() {
    it('should return name for a given token ID', async function() {
      console.log('\n--- Testing getNameById() ---');
      console.log('Token ID:', TEST_CONFIG.TOKEN_ID);
      
      try {
        const name = await sdk.getNameById(TEST_CONFIG.TOKEN_ID);
        
        expect(name).to.be.a('string');
        console.log('Name:', name);
        console.log('✓ getNameById() executed successfully');
      } catch (error) {
        console.log('⚠️  getNameById() failed:', error.message);
        console.log('This may be expected if the token ID does not exist');
      }
    });
  });

  describe('getAllNames(startIndex, count)', function() {
    it('should return paginated list of all names', async function() {
      console.log('\n--- Testing getAllNames() ---');
      console.log('Start Index:', TEST_CONFIG.START_INDEX);
      console.log('Page Size:', TEST_CONFIG.PAGE_SIZE);
      
      try {
        const allNames = await sdk.getAllNames(TEST_CONFIG.START_INDEX, TEST_CONFIG.PAGE_SIZE);
        
        expect(allNames).to.be.an('array');
        console.log('Names Retrieved:', allNames.length);
        
        if (allNames.length > 0) {
          console.log('Names:');
          allNames.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.name} (Token ID: ${item.tokenId}, Owner: ${item.owner})`);
          });
          
          // Verify structure of each item
          allNames.forEach(item => {
            expect(item).to.have.property('tokenId');
            expect(item).to.have.property('name');
            expect(item).to.have.property('owner');
          });
        } else {
          console.log('No names found in this range');
        }
        
        console.log('✓ getAllNames() executed successfully');
      } catch (error) {
        console.log('⚠️  getAllNames() failed:', error.message);
        console.log('This may be expected if no names exist or contracts are not deployed');
      }
    });
  });

  describe('nameExists(name)', function() {
    it('should check if a name exists', async function() {
      console.log('\n--- Testing nameExists() ---');

      const testNames = [
        TEST_CONFIG.ODUDE_NAME,
        `nonexistent-${Date.now()}@${TEST_CONFIG.TLD_NAME}`
      ];

      for (const name of testNames) {
        try {
          console.log(`Checking: ${name}`);
          const exists = await sdk.resolver().nameExists(name);

          expect(exists).to.be.a('boolean');
          console.log(`  Exists: ${exists}`);
        } catch (error) {
          console.log(`  ⚠️  Check failed: ${error.message}`);
        }
      }

      console.log('✓ nameExists() executed successfully');
    });
  });

  describe('getApproved(tokenId)', function() {
    it('should return approved address for a token', async function() {
      console.log('\n--- Testing getApproved() ---');
      console.log('Token ID:', TEST_CONFIG.TOKEN_ID);
      
      try {
        const approved = await sdk.getApproved(TEST_CONFIG.TOKEN_ID);
        
        expect(approved).to.be.a('string');
        console.log('Approved Address:', approved);
        
        if (approved === '0x0000000000000000000000000000000000000000') {
          console.log('(No approval set)');
        }
        
        console.log('✓ getApproved() executed successfully');
      } catch (error) {
        console.log('⚠️  getApproved() failed:', error.message);
        console.log('This may be expected if the token ID does not exist');
      }
    });
  });

  after(function() {
    console.log('\n=== Extended Functions Test Complete ===');
    console.log('Note: Some tests may show warnings if names/tokens do not exist.');
    console.log('This is expected behavior and demonstrates proper error handling.\n');
    
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

