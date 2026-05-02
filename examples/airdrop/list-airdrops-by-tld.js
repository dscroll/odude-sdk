/**
 * List Airdrops by TLD Name
 * Demonstrates how to list all airdrops for a specific TLD
 *
 * This example shows:
 * - Listing all airdrops for a TLD
 * - Displaying detailed airdrop information
 * - Checking airdrop status (active, withdrawn)
 * - Viewing token details for each airdrop
 *
 * Usage: node examples/airdrop/list-airdrops-by-tld.js
 */

// Load environment variables
require('dotenv').config();

const { initializeSDK, getTokenInfo, displayAirdropInfo } = require('./utils');

// ==================== CONFIGURATION VARIABLES ====================
// Update this variable to check different TLDs
const TLD_NAME = 'xxx';

// ==================== MAIN FUNCTION ====================

async function main() {
  console.log('=== List Airdrops by TLD Name ===\n');

  console.log('📋 Configuration:');
  console.log(`  TLD Name: ${TLD_NAME}`);
  console.log();

  // Initialize SDK (no private key required for read-only operations)
  const { sdk } = await initializeSDK(false);
  const provider = sdk.getProvider('basesepolia');

  console.log(`--- Checking Airdrops for "${TLD_NAME}" TLD ---\n`);

  try {
    // Verify TLD exists
    const tldExists = await sdk.resolver().nameExists(TLD_NAME);
    
    if (!tldExists) {
      console.log(`❌ TLD "${TLD_NAME}" does not exist`);
      console.log('💡 Please check the TLD name or use an existing TLD');
      console.log('   To create a TLD, use: node examples/TLDMint.js');
      return;
    }

    console.log(`✅ TLD "${TLD_NAME}" exists`);

    // Get TLD information
    try {
      const tldInfo = await sdk.getTldInfo(TLD_NAME);
      console.log(`  TLD Owner: ${tldInfo.getTLDOwner}`);
      console.log(`  TLD Token ID: ${tldInfo.tokenId}`);
    } catch (error) {
      console.log(`  ⚠️  Could not fetch TLD details: ${error.message}`);
    }

    // Get airdrop count for the TLD
    const airdropCount = await sdk.rwairdrop().getTLDAirdropCount(TLD_NAME);
    console.log(`\n✓ Total airdrops for "${TLD_NAME}" TLD: ${airdropCount.toString()}`);

    if (airdropCount === 0) {
      console.log(`\n❌ No airdrops found for "${TLD_NAME}" TLD`);
      console.log('💡 To create an airdrop for this TLD:');
      console.log('   Use: node examples/airdrop/create-airdrop.js');
      return;
    }

    // Get airdrop IDs for the TLD
    const airdropIds = await sdk.rwairdrop().getTLDAirdropIds(TLD_NAME);
    console.log(`✓ Airdrop IDs: [${airdropIds.map(id => id.toString()).join(', ')}]`);

    // Display detailed information for each airdrop
    console.log('\n--- Airdrop Details ---');

    for (let i = 0; i < airdropCount; i++) {
      const airdropInfo = await sdk.rwairdrop().getAirdropInfoByTLD(TLD_NAME, i);
      
      // Get token information for this airdrop
      const tokenInfo = await getTokenInfo(airdropInfo.tokenAddress, provider);
      
      // Display the airdrop information
      displayAirdropInfo(airdropInfo, i, tokenInfo);
    }

    // Calculate statistics
    console.log('\n--- Statistics ---\n');
    
    let totalActive = 0;
    let totalWithdrawn = 0;
    let totalRemainingValue = 0n;
    
    for (let i = 0; i < airdropCount; i++) {
      const airdropInfo = await sdk.rwairdrop().getAirdropInfoByTLD(TLD_NAME, i);
      
      if (airdropInfo.isActive) totalActive++;
      if (airdropInfo.isWithdrawn) totalWithdrawn++;
      totalRemainingValue += airdropInfo.remainingBalance;
    }

    console.log(`📊 Total airdrops: ${airdropCount}`);
    console.log(`✅ Active airdrops: ${totalActive}`);
    console.log(`🔒 Withdrawn airdrops: ${totalWithdrawn}`);
    console.log(`💰 Total remaining tokens: ${totalRemainingValue > 0n ? 'Available' : 'None'}`);

    // Show next steps
    console.log('\n💡 Next steps:');
    console.log('  1. To check claimable airdrops for a wallet:');
    console.log('     Use: node examples/airdrop/list-airdrops-by-wallet.js');
    console.log('  2. To claim airdrops:');
    console.log('     Use: node examples/airdrop/claim-airdrop.js');
    console.log('  3. To create a new airdrop:');
    console.log('     Use: node examples/airdrop/create-airdrop.js');

  } catch (error) {
    console.error('❌ Error listing airdrops:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('  - Ensure the TLD name is correct');
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

