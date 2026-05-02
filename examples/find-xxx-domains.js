/**
 * Find XXX TLD Domains
 * Check what domains exist in the xxx TLD and who owns them
 * node examples/find-xxx-domains.js
 */

require('dotenv').config();
const ODudeSDK = require('../src/index');

async function main() {
  console.log('=== Finding XXX TLD Domains ===\n');

  const sdk = new ODudeSDK({
    rpcUrl_sepolia: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
  });

  try {
    sdk.connectNetwork('basesepolia');
    console.log('✅ Connected to Base Sepolia network');
  } catch (error) {
    console.log('❌ Failed to connect:', error.message);
    return;
  }

  // Test some common domain names that might exist
  const testDomains = [
    'test@xxx',
    '9f@xxx',
    'bob@xxx',
    'demo@xxx',
    'example@xxx',
    'admin@xxx',
    'user@xxx',
    '1@xxx',
    '2@xxx',
    '3@xxx'
  ];

  console.log('🔍 Checking for existing domains in xxx TLD...\n');

  const foundDomains = [];

  for (const domain of testDomains) {
    try {
      // First check using getNamesList approach - get all names and see if this domain exists
      const tokenId = await sdk.registry().getTokenId(domain);
      const owner = await sdk.registry().ownerOf(tokenId);

      if (owner !== '0x0000000000000000000000000000000000000000') {
        foundDomains.push({ domain, owner, tokenId: tokenId.toString() });
        console.log(`✅ Found: ${domain} -> ${owner} (Token ID: ${tokenId.toString()})`);
      }
    } catch (error) {
      // Try alternative method using getOwner
      try {
        const owner = await sdk.getOwner(domain);
        if (owner !== '0x0000000000000000000000000000000000000000') {
          foundDomains.push({ domain, owner });
          console.log(`✅ Found: ${domain} -> ${owner}`);
        }
      } catch (error2) {
        // Domain doesn't exist, continue
        console.log(`❌ ${domain} - Not found`);
      }
    }
  }

  if (foundDomains.length === 0) {
    console.log('❌ No domains found with common names');
    console.log('\n💡 Let\'s check if test@xxx can be minted...');

    try {
      // Try to mint test@xxx to the expected address
      const targetAddress = '0xDF9dcaDF518670560fFDD62c3675304bDE8B8015';
      console.log(`🔍 Checking mint eligibility for test@xxx...`);

      // Check if we can mint (this will show eligibility info)
      const eligibility = await sdk.tld().checkMintEligibility('test@xxx');
      console.log('📋 Mint eligibility:', eligibility);

      if (eligibility.eligible) {
        console.log(`💰 Cost: ${eligibility.cost} wei`);
        console.log('✅ Domain can be minted!');
        console.log('💡 To mint: sdk.mintDomain("test@xxx", "' + targetAddress + '", { value: eligibility.cost })');
      } else {
        console.log('❌ Cannot mint:', eligibility.reason);

        // If it can't be minted, it might already exist - let's double-check
        if (eligibility.reason && eligibility.reason.includes('already exists')) {
          console.log('🔍 Domain already exists, let\'s find the owner...');
          try {
            const namesList = await sdk.getNamesList(targetAddress);
            const testDomain = namesList.find(item => item.name === 'test@xxx');
            if (testDomain) {
              console.log(`✅ Found test@xxx owned by ${targetAddress}`);
              console.log(`   Token ID: ${testDomain.tokenId}`);
            } else {
              console.log('🔍 Checking other addresses for test@xxx ownership...');
              // We know it exists but need to find who owns it
              try {
                const owner = await sdk.registry().getOwnerByName('test@xxx');
                console.log(`✅ test@xxx is owned by: ${owner}`);
              } catch (e) {
                console.log('❌ Could not determine owner of test@xxx');
              }
            }
          } catch (e) {
            console.log('❌ Error checking ownership:', e.message);
          }
        }
      }

    } catch (error) {
      console.log('❌ Error checking mint eligibility:', error.message);
    }
  } else {
    console.log(`\n✅ Found ${foundDomains.length} domains in xxx TLD:`);
    
    // Now check which of these addresses have claimable airdrops
    console.log('\n🎁 Checking airdrop eligibility for found domains...');
    
    for (const { domain, owner } of foundDomains) {
      try {
        const claimableAirdrops = await sdk.rwairdrop().getClaimableAirdrops(owner);
        console.log(`\n👤 ${owner} (owns ${domain}):`);
        console.log(`  📋 Claimable airdrops: ${claimableAirdrops.length}`);
        
        if (claimableAirdrops.length > 0) {
          claimableAirdrops.forEach((airdrop, index) => {
            console.log(`  🎁 Airdrop ${index + 1}: ${airdrop.tldName} (ID: ${airdrop.airdropId})`);
          });
        }
      } catch (error) {
        console.log(`  ❌ Error checking airdrops: ${error.message}`);
      }
    }
  }

  console.log('\n✓ Search completed!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
