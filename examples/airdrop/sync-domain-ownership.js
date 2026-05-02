/**
 * Sync Domain Ownership
 * Demonstrates the syncMyDomains function for synchronizing domain ownership
 * between Registry and RWAirdrop contracts
 *
 * This example shows:
 * - Using the syncMyDomains function to sync domain ownership
 * - Checking domain ownership before and after sync
 * - Verifying claimable airdrops after synchronization
 * 
 * Usage: node examples/airdrop/sync-domain-ownership.js
 */

require('dotenv').config();
const { initializeSDK } = require('./utils');

async function main() {
  console.log('=== Sync Domain Ownership ===\n');

  // Initialize SDK with private key (required for syncing)
  const { sdk, walletAddress } = await initializeSDK(true);

  console.log(`\n🔍 Wallet address: ${walletAddress}`);
  console.log('🔍 Checking domains owned by this wallet...');

  // Check Registry contract
  console.log('\n--- Registry Contract ---');
  let ownedDomains = [];
  try {
    const namesList = await sdk.getNamesList(walletAddress);
    console.log(`📝 Names in Registry: ${namesList.length}`);
    namesList.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.name} (Token ID: ${item.tokenId})`);
    });
    ownedDomains = namesList.map(item => item.name);
  } catch (error) {
    console.log('❌ Error getting names from Registry:', error.message);
  }

  if (ownedDomains.length === 0) {
    console.log('\n❌ No domains found to sync');
    console.log('💡 Register a domain first using: node examples/SubNameMint.js');
    return;
  }

  // Check RWAirdrop contract for each TLD
  console.log('\n--- RWAirdrop Contract (Before Sync) ---');
  const tldDomains = {};

  // Group domains by TLD
  ownedDomains.forEach(domain => {
    const tld = domain.split('@')[1];
    if (!tldDomains[tld]) {
      tldDomains[tld] = [];
    }
    tldDomains[tld].push(domain);
  });

  for (const [tld, domains] of Object.entries(tldDomains)) {
    try {
      const userDomains = await sdk.rwairdrop().getUserDomainsInTLD(walletAddress, tld);
      console.log(`📝 Domains in '${tld}' TLD (RWAirdrop): ${userDomains.length}`);
      if (userDomains.length > 0) {
        userDomains.forEach((domain, index) => {
          console.log(`  ${index + 1}. ${domain}`);
        });
      }
    } catch (error) {
      console.log(`❌ Error getting domains from RWAirdrop for '${tld}':`, error.message);
    }
  }

  // Sync domain ownership using the syncMyDomains function
  console.log('\n--- Synchronizing Domain Ownership ---');

  try {
    console.log(`🔄 Syncing ${ownedDomains.length} domains using syncMyDomains...`);
    console.log(`📝 Domains to sync: ${ownedDomains.join(', ')}`);

    const syncTx = await sdk.rwairdrop().syncMyDomains(ownedDomains);
    console.log(`📝 Transaction hash: ${syncTx.hash}`);

    console.log('⏳ Waiting for transaction confirmation...');
    const receipt = await syncTx.wait();
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);

    // Verify synchronization worked
    console.log('\n--- Verification After Sync ---');
    for (const [tld, domains] of Object.entries(tldDomains)) {
      try {
        const userDomainsAfter = await sdk.rwairdrop().getUserDomainsInTLD(walletAddress, tld);
        console.log(`📝 Domains in '${tld}' TLD after sync: ${userDomainsAfter.length}`);
        if (userDomainsAfter.length > 0) {
          userDomainsAfter.forEach((domain, index) => {
            console.log(`  ${index + 1}. ${domain}`);
          });
        }
      } catch (error) {
        console.log(`❌ Error verifying sync for '${tld}':`, error.message);
      }
    }

    // Check claimable airdrops after sync
    const claimableAirdrops = await sdk.rwairdrop().getClaimableAirdrops(walletAddress);
    console.log(`\n🎁 Claimable airdrops after sync: ${claimableAirdrops.length}`);

    if (claimableAirdrops.length > 0) {
      console.log('🎉 SUCCESS! Domains are now synchronized and airdrops are claimable!');
      claimableAirdrops.forEach((airdrop, index) => {
        console.log(`  🎁 Airdrop ${index + 1}: ${airdrop.tldName} (ID: ${airdrop.airdropId})`);
      });
      
      console.log('\n💡 Next steps:');
      console.log('  - To claim airdrops, use: node examples/airdrop/claim-airdrop.js');
      console.log('  - To view airdrop details, use: node examples/airdrop/list-airdrops-by-wallet.js');
    } else {
      console.log('⚠️  Domains synchronized but no claimable airdrops found');
      console.log('💡 Check if there are active airdrops for your TLDs');
      console.log('   Use: node examples/airdrop/list-airdrops-by-tld.js');
    }

  } catch (error) {
    console.log('❌ Error syncing domain ownership:', error.message);

    if (error.message.includes('insufficient funds')) {
      console.log('💡 Make sure the wallet has enough ETH for gas fees');
    } else if (error.message.includes('Empty domain array')) {
      console.log('💡 No domains provided for synchronization');
    } else if (error.message.includes('Not owner of all domains')) {
      console.log('💡 You can only sync domains that you own');
    } else {
      console.log('💡 Make sure you own the domains you are trying to sync');
    }
  }

  console.log('\n✓ Sync attempt completed!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

