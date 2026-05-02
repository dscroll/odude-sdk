/**
 * Get Names List Example
 * 
 * This example demonstrates how to:
 * - Get total number of names owned by an address
 * - Get list of all names owned by an address
 * - Display detailed information for each name
 * 
 * Use Case:
 * - Display all domains owned by a wallet
 * - Build a portfolio view for a user
 * - Check ownership before performing operations
 * 
 * How to run:
 * npm run example:names-list
 * or
 * node examples/get-names-list.js
 */

const ODudeSDK = require('../src/index');

// ==================== CONFIGURATION ====================
// Update these variables to test with your own values
const CONFIG = {
  // Wallet address to check (replace with actual address)
  WALLET_ADDRESS: '0xDF9dcaDF518670560fFDD62c3675304bDE8B8015',
  
  // Network to use (basesepolia, filecoin, bnb, localhost)
  NETWORK: 'basesepolia',
  
  // RPC URL (optional, will use default if not provided)
  RPC_URL: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
};
// =======================================================

async function main() {
  console.log('=== ODude SDK - Get Names List Example ===\n');
  console.log('Configuration:');
  console.log('  Wallet Address:', CONFIG.WALLET_ADDRESS);
  console.log('  Network:', CONFIG.NETWORK);
  console.log();

  // Initialize SDK
  const sdk = new ODudeSDK({
    rpcUrl_sepolia: CONFIG.RPC_URL,
    rpcUrl_filecoin: process.env.FILECOIN_RPC_URL,
    rpcUrl_bnb: process.env.BNB_RPC_URL,
    rpcUrl: process.env.LOCALHOST_RPC_URL || 'http://127.0.0.1:8545'
  });

  // Connect to network
  try {
    sdk.connectNetwork(CONFIG.NETWORK);
    console.log(`✓ Connected to ${CONFIG.NETWORK} network\n`);
  } catch (error) {
    console.error('❌ Failed to connect to network:', error.message);
    return;
  }

  // === Step 1: Get Total Names ===
  console.log('--- Step 1: Get Total Names ---');
  
  try {
    const totalNames = await sdk.getTotalNames(CONFIG.WALLET_ADDRESS);
    console.log('Total names owned:', totalNames.toString());
    
    if (totalNames === 0n) {
      console.log('\nThis address does not own any names.');
      console.log('Try using a different wallet address that owns some ODude names.');
      return;
    }
    console.log();
  } catch (error) {
    console.error('❌ Failed to get total names:', error.message);
    console.log('Make sure the wallet address is valid and the network has deployed contracts.\n');
    return;
  }

  // === Step 2: Get Names List ===
  console.log('--- Step 2: Get Names List ---');
  
  try {
    const namesList = await sdk.getNamesList(CONFIG.WALLET_ADDRESS);
    
    console.log(`Found ${namesList.length} name(s):\n`);
    
    if (namesList.length === 0) {
      console.log('No names found for this address.');
      return;
    }
    
    // Display each name
    for (let i = 0; i < namesList.length; i++) {
      const item = namesList[i];
      console.log(`${i + 1}. Name: ${item.name}`);
      console.log(`   Token ID: ${item.tokenId}`);
      console.log();
    }
    
  } catch (error) {
    console.error('❌ Failed to get names list:', error.message);
    return;
  }

  // === Step 3: Get Detailed Information for Each Name ===
  console.log('--- Step 3: Get Detailed Information ---');
  
  try {
    const namesList = await sdk.getNamesList(CONFIG.WALLET_ADDRESS);
    
    for (let i = 0; i < Math.min(namesList.length, 3); i++) {
      const item = namesList[i];
      console.log(`\nDetails for: ${item.name}`);
      console.log('─'.repeat(50));
      
      try {
        const details = await sdk.getNameDetails(item.name);
        
        console.log('Token ID:', details.tokenId);
        console.log('Owner:', details.owner);
        console.log('Exists:', details.exists);
        console.log('Resolved Address:', details.resolvedAddress || 'Not set');
        console.log('Token URI:', details.tokenURI);
        
        if (details.metadata) {
          console.log('Metadata:');
          console.log('  Name:', details.metadata.name || 'N/A');
          console.log('  Description:', details.metadata.description || 'N/A');
          console.log('  Image:', details.metadata.image || 'N/A');
        }
        
        // Check if approved
        try {
          const approved = await sdk.getApproved(details.tokenId);
          if (approved !== '0x0000000000000000000000000000000000000000') {
            console.log('Approved Address:', approved);
          }
        } catch (e) {
          // Ignore approval check errors
        }
        
      } catch (error) {
        console.log('⚠️  Could not get details:', error.message);
      }
    }
    
    if (namesList.length > 3) {
      console.log(`\n(Showing first 3 of ${namesList.length} names)`);
    }
    
  } catch (error) {
    console.error('❌ Failed to get detailed information:', error.message);
  }

  console.log('\n=== Example Complete ===');
  console.log('\nWhat you learned:');
  console.log('1. How to get the total number of names owned by an address');
  console.log('2. How to retrieve a list of all names with their token IDs');
  console.log('3. How to get comprehensive details for each name');
  console.log('4. How to check approval status for tokens');
  console.log('\nNext steps:');
  console.log('- Try with different wallet addresses');
  console.log('- Use getNameDetails() to get full information about specific names');
  console.log('- Check name availability with isNameAvailable()');
}

// Run the example
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

