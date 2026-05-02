/**
 * List Airdrops by Wallet Address
 * Demonstrates how to list all claimable airdrops for a specific wallet address
 *
 * This example shows:
 * - Listing all claimable airdrops for a wallet address
 * - Displaying airdrop details including token information
 * - Checking domain ownership in various TLDs
 * - Showing claim status for each airdrop
 *
 * Usage: node examples/airdrop/list-airdrops-by-wallet.js
 */

// Load environment variables
require('dotenv').config();

const { initializeSDK, getTokenInfo, displayClaimableAirdrop } = require('./utils');

// ==================== CONFIGURATION VARIABLES ====================
// Update this variable to check different wallet addresses
const WALLET_ADDRESS = process.env.WALLET_ADDRESS || '0xaa481F8d2d966e5fCC0446fA459F5d580AE5ea9f';

// ==================== MAIN FUNCTION ====================

async function main() {
  console.log('=== List Airdrops by Wallet Address ===\n');

  console.log('📋 Configuration:');
  console.log(`  Wallet Address: ${WALLET_ADDRESS}`);
  console.log();

  // Initialize SDK (no private key required for read-only operations)
  const { sdk } = await initializeSDK(false);
  const provider = sdk.getProvider('basesepolia');

  console.log('--- Checking Claimable Airdrops ---\n');

  try {
    // Get all claimable airdrops for the wallet address
    const claimableAirdrops = await sdk.rwairdrop().getClaimableAirdrops(WALLET_ADDRESS);
    
    console.log(`✓ Found ${claimableAirdrops.length} claimable airdrops for ${WALLET_ADDRESS}`);

    if (claimableAirdrops.length === 0) {
      console.log('\n❌ No claimable airdrops found for this wallet');
      console.log('💡 This could mean:');
      console.log('  - The wallet has no domains registered');
      console.log('  - All available airdrops have been claimed');
      console.log('  - No airdrops are active for the wallet\'s domains');
      console.log('  - The domains need to be synced to the RWAirdrop contract');
      
      // Check if wallet has any domains
      console.log('\n--- Checking Domain Ownership ---');
      try {
        const namesList = await sdk.getNamesList(WALLET_ADDRESS);
        console.log(`\n📝 Wallet owns ${namesList.length} domains in total:`);
        
        if (namesList.length > 0) {
          namesList.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.name} (Token ID: ${item.tokenId})`);
          });
          
          console.log('\n💡 Tip: These domains may need to be synced to the RWAirdrop contract');
          console.log('   Use: node examples/airdrop/sync-domain-ownership.js');
        } else {
          console.log('  No domains found');
          console.log('\n💡 Tip: Register a domain to be eligible for airdrops');
          console.log('   Use: node examples/SubNameMint.js');
        }
      } catch (error) {
        console.log(`⚠️  Could not check domain ownership: ${error.message}`);
      }
      
      return;
    }

    // Display all claimable airdrops with details
    console.log('\n🎁 Claimable Airdrops:\n');
    
    for (let index = 0; index < claimableAirdrops.length; index++) {
      const airdrop = claimableAirdrops[index];
      
      // Get token information for this airdrop
      const tokenInfo = await getTokenInfo(airdrop.tokenAddress, provider);
      
      // Display the claimable airdrop
      displayClaimableAirdrop(airdrop, index, tokenInfo);
    }

    // Group airdrops by TLD
    console.log('\n--- Airdrops Grouped by TLD ---\n');
    
    const airdropsByTLD = {};
    claimableAirdrops.forEach(airdrop => {
      const tld = airdrop.tldName;
      if (!airdropsByTLD[tld]) {
        airdropsByTLD[tld] = [];
      }
      airdropsByTLD[tld].push(airdrop);
    });

    for (const [tld, airdrops] of Object.entries(airdropsByTLD)) {
      console.log(`📂 TLD: ${tld}`);
      console.log(`   Claimable airdrops: ${airdrops.length}`);
      
      // Check user domains in this TLD
      try {
        const userDomains = await sdk.rwairdrop().getUserDomainsInTLD(WALLET_ADDRESS, tld);
        console.log(`   Domains owned: ${userDomains.length}`);
        if (userDomains.length > 0) {
          console.log(`   Domains: ${userDomains.join(', ')}`);
        }
      } catch (error) {
        console.log(`   ⚠️  Could not fetch domains: ${error.message}`);
      }
      
      console.log();
    }

    // Display summary
    console.log('--- Summary ---\n');
    console.log(`✅ Total claimable airdrops: ${claimableAirdrops.length}`);
    console.log(`📂 TLDs with airdrops: ${Object.keys(airdropsByTLD).length}`);
    console.log(`📱 Wallet address: ${WALLET_ADDRESS}`);
    
    console.log('\n💡 Next steps:');
    console.log('  1. To claim airdrops, use: node examples/airdrop/claim-airdrop.js');
    console.log('  2. To view airdrop details by TLD, use: node examples/airdrop/list-airdrops-by-tld.js');
    console.log('  3. To sync domain ownership, use: node examples/airdrop/sync-domain-ownership.js');

  } catch (error) {
    console.error('❌ Error listing airdrops:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('  - Ensure the wallet address is valid');
    console.log('  - Check network connectivity');
    console.log('  - Verify the RWAirdrop contract is deployed');
  }

  console.log('\n✓ Example completed!');
}

// Run the main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

