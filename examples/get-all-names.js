/**
 * Get All Names Example
 * 
 * This example demonstrates how to:
 * - Get paginated list of all registered names
 * - Navigate through pages of names
 * - Display comprehensive information for each name
 * 
 * Use Case:
 * - Browse all registered domains in the system
 * - Build a marketplace or explorer interface
 * - Analyze domain registration patterns
 * 
 * How to run:
 * npm run example:all-names
 * or
 * node examples/get-all-names.js
 */

const ODudeSDK = require('../src/index');

// ==================== CONFIGURATION ====================
// Update these variables to test with your own values
const CONFIG = {
  // Network to use (base, basesepolia, bnb)
  NETWORK: 'base',
  
  // Pagination settings
  START_INDEX: 0,
  PAGE_SIZE: 10,
  
  // RPC URL (optional, will use default if not provided)
  RPC_URL: process.env.BASE_RPC_URL || 'https://mainnet.base.org'
};
// =======================================================

async function main() {
  console.log('=== ODude SDK - Get All Names Example ===\n');
  console.log('Configuration:');
  console.log('  Network:', CONFIG.NETWORK);
  console.log('  Start Index:', CONFIG.START_INDEX);
  console.log('  Page Size:', CONFIG.PAGE_SIZE);
  console.log();

  // Initialize SDK
  const sdk = new ODudeSDK({
    rpcUrl_base: CONFIG.RPC_URL,
    rpcUrl_sepolia: process.env.BASE_SEPOLIA_RPC_URL,
    rpcUrl_bnb: process.env.BNB_RPC_URL
  });

  // Connect to network
  try {
    sdk.connectNetwork(CONFIG.NETWORK);
    console.log(`✓ Connected to ${CONFIG.NETWORK} network\n`);
  } catch (error) {
    console.error('❌ Failed to connect to network:', error.message);
    return;
  }

  // === Step 1: Get Total Supply ===
  console.log('--- Step 1: Get Total Supply ---');
  
  let totalSupply;
  try {
    totalSupply = await sdk.registry().totalSupply();
    console.log('Total names registered:', totalSupply.toString());
    
    if (totalSupply === 0n) {
      console.log('\nNo names have been registered yet on this network.');
      return;
    }
    console.log();
  } catch (error) {
    console.error('❌ Failed to get total supply:', error.message);
    console.log('Make sure the network has deployed contracts.\n');
    return;
  }

  // === Step 2: Get Paginated Names ===
  console.log('--- Step 2: Get Paginated Names ---');
  console.log(`Fetching names ${CONFIG.START_INDEX} to ${CONFIG.START_INDEX + CONFIG.PAGE_SIZE - 1}...\n`);
  
  try {
    const allNames = await sdk.getAllNames(CONFIG.START_INDEX, CONFIG.PAGE_SIZE);
    
    if (allNames.length === 0) {
      console.log('No names found in this range.');
      return;
    }
    
    console.log(`Retrieved ${allNames.length} name(s):\n`);
    
    // Display each name
    for (let i = 0; i < allNames.length; i++) {
      const item = allNames[i];
      console.log(`${CONFIG.START_INDEX + i + 1}. ${item.name}`);
      console.log(`   Token ID: ${item.tokenId}`);
      console.log(`   Owner: ${item.owner}`);
      console.log();
    }
    
  } catch (error) {
    console.error('❌ Failed to get names:', error.message);
    return;
  }

  // === Step 3: Get Detailed Information for First Few Names ===
  console.log('--- Step 3: Get Detailed Information ---');
  
  try {
    const allNames = await sdk.getAllNames(CONFIG.START_INDEX, Math.min(CONFIG.PAGE_SIZE, 3));
    
    for (let i = 0; i < allNames.length; i++) {
      const item = allNames[i];
      console.log(`\nDetails for: ${item.name}`);
      console.log('─'.repeat(50));
      
      try {
        // Get name by token ID (alternative method)
        const nameFromId = await sdk.getNameById(item.tokenId);
        console.log('Name (from token ID):', nameFromId);
        
        // Check if name exists (should be true since it exists)
        const exists = await sdk.resolver().nameExists(item.name);
        console.log('Exists:', exists);
        
        // Get comprehensive details
        const details = await sdk.getNameDetails(item.name);
        console.log('Exists:', details.exists);
        console.log('Resolved Address:', details.resolvedAddress || 'Not set');
        
        // Check approval
        const approved = await sdk.getApproved(item.tokenId);
        if (approved !== '0x0000000000000000000000000000000000000000') {
          console.log('Approved Address:', approved);
        }
        
      } catch (error) {
        console.log('⚠️  Could not get details:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to get detailed information:', error.message);
  }

  // === Step 4: Pagination Example ===
  console.log('\n--- Step 4: Pagination Example ---');
  
  const totalPages = Math.ceil(Number(totalSupply) / CONFIG.PAGE_SIZE);
  console.log(`Total pages (with page size ${CONFIG.PAGE_SIZE}): ${totalPages}`);
  console.log(`Current page: ${Math.floor(CONFIG.START_INDEX / CONFIG.PAGE_SIZE) + 1}`);
  
  if (totalPages > 1) {
    console.log('\nTo view other pages, update CONFIG.START_INDEX:');
    console.log(`  Page 1: START_INDEX = 0`);
    console.log(`  Page 2: START_INDEX = ${CONFIG.PAGE_SIZE}`);
    console.log(`  Page 3: START_INDEX = ${CONFIG.PAGE_SIZE * 2}`);
    console.log('  ...');
  }

  console.log('\n=== Example Complete ===');
  console.log('\nWhat you learned:');
  console.log('1. How to get the total supply of registered names');
  console.log('2. How to retrieve paginated lists of all names');
  console.log('3. How to get name by token ID');
  console.log('4. How to check name availability');
  console.log('5. How to implement pagination for large datasets');
  console.log('\nNext steps:');
  console.log('- Adjust START_INDEX and PAGE_SIZE to browse different pages');
  console.log('- Build a web interface with pagination controls');
  console.log('- Filter names by specific criteria');
  console.log('- Export data for analysis');
}

// Run the example
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

