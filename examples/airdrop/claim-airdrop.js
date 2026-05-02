/**
 * Claim Airdrop Example
 * Demonstrates how to claim airdrop shares for domains owned by the current wallet
 *
 * This example shows:
 * - Connecting to Base Sepolia network with private key
 * - Getting wallet address from private key
 * - Checking for domains owned by the wallet in the specified TLD
 * - Finding claimable airdrops for owned domains
 * - Claiming airdrop shares
 * - Displaying airdrop creator information
 *
 * Usage: node examples/airdrop/claim-airdrop.js
 */

// Load environment variables
require('dotenv').config();

const { ethers } = require('ethers');
const { initializeSDK, getTokenInfo, getUserDomainsInTLD } = require('./utils');

// ==================== CONFIGURATION VARIABLES ====================
// Update these variables to claim from different TLDs
const TLD_NAME = 'sepolia'; // TLD to check for owned domains and claim airdrops

// ==================== MAIN FUNCTION ====================

async function main() {
  console.log('=== ODude Airdrop Claim Example ===\n');

  console.log('📋 Configuration:');
  console.log(`  TLD Name: ${TLD_NAME}`);
  console.log();

  // Initialize SDK with private key (required for claiming)
  const { sdk, walletAddress } = await initializeSDK(true);
  const provider = sdk.getProvider('basesepolia');

  console.log(`📱 Current Wallet Address: ${walletAddress}\n`);

  console.log(`--- Checking Domains in "${TLD_NAME}" TLD ---`);

  // Get user domains in the specified TLD
  const userDomains = await getUserDomainsInTLD(sdk, walletAddress, TLD_NAME);
  
  console.log(`✓ Found ${userDomains.length} domains owned by your wallet in '${TLD_NAME}' TLD`);

  if (userDomains.length > 0) {
    console.log('📝 Your domains:');
    userDomains.forEach((domain, index) => {
      console.log(`  ${index + 1}. ${domain}`);
    });
  } else {
    console.log(`❌ You don't own any domains in the "${TLD_NAME}" TLD`);
    console.log('💡 To be eligible for airdrops, you need to own domains in the TLD');
    console.log('💡 Use the SubNameMint.js example to mint a domain first');
    process.exit(0);
  }

  console.log(`\n--- Checking Available Airdrops for "${TLD_NAME}" TLD ---`);
  
  let airdropCount = 0;
  try {
    // Get airdrop count for the specified TLD
    airdropCount = await sdk.rwairdrop().getTLDAirdropCount(TLD_NAME);
    console.log(`✓ Total airdrops available for "${TLD_NAME}" TLD: ${airdropCount.toString()}`);
    
    if (airdropCount === 0) {
      console.log(`❌ No airdrops found for "${TLD_NAME}" TLD`);
      console.log('💡 Create an airdrop using: node examples/airdrop/create-airdrop.js');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Failed to get airdrop count:', error.message);
    process.exit(1);
  }

  console.log('\n--- Syncing Domain Ownership ---');

  // Sync domain ownership to RWAirdrop contract using the new syncMyDomains function
  if (userDomains.length > 0) {
    try {
      console.log(`🔄 Syncing ${userDomains.length} domains using syncMyDomains...`);
      console.log(`📝 Domains: ${userDomains.join(', ')}`);

      const syncTx = await sdk.rwairdrop().syncMyDomains(userDomains);
      console.log(`  📝 Sync transaction: ${syncTx.hash}`);

      const receipt = await syncTx.wait();
      console.log(`  ✅ Sync confirmed! Block: ${receipt.blockNumber}`);
      console.log(`  ⛽ Gas used: ${receipt.gasUsed.toString()}`);
    } catch (error) {
      if (error.message.includes('already synced') || error.message.includes('already exists')) {
        console.log('✅ All domains already synced');
      } else {
        console.log(`  ⚠️  Sync failed: ${error.message}`);
        console.log('  💡 Note: You can only sync domains that you own');
      }
    }
  }

  console.log('\n--- Checking Claimable Airdrops ---');

  try {
    // Get claimable airdrops for the current wallet (after sync)
    const claimableAirdrops = await sdk.rwairdrop().getClaimableAirdrops(walletAddress);
    console.log(`✓ You have ${claimableAirdrops.length} claimable airdrops`);
    
    if (claimableAirdrops.length === 0) {
      console.log('❌ No claimable airdrops found for your wallet');
      console.log('💡 This could mean:');
      console.log('  - You have already claimed all available airdrops');
      console.log('  - No airdrops are active for your domains');
      console.log('  - Your domains are not eligible for current airdrops');
      process.exit(0);
    }

    // Display claimable airdrops
    console.log('\n🎁 Claimable Airdrops:');
    for (let index = 0; index < claimableAirdrops.length; index++) {
      const airdrop = claimableAirdrops[index];
      const tokenInfo = await getTokenInfo(airdrop.tokenAddress, provider);
      
      console.log(`\n  ${index + 1}. Airdrop Details:`);
      console.log(`    TLD: ${airdrop.tldName}`);
      console.log(`    Airdrop ID: ${airdrop.airdropId.toString()}`);
      console.log(`    Token: ${tokenInfo.symbol}`);
      console.log(`    Per User Share: ${ethers.formatUnits(airdrop.perUserShare, tokenInfo.decimals)} ${tokenInfo.symbol}`);
    }
  } catch (error) {
    console.error('❌ Failed to get claimable airdrops:', error.message);
    process.exit(1);
  }

  console.log('\n--- Claiming Airdrop Shares ---');

  let claimsSuccessful = 0;
  let totalClaimsAttempted = 0;

  // Process each domain and attempt to claim from available airdrops
  for (const domain of userDomains) {
    console.log(`\n🏷️  Processing domain: ${domain}`);

    for (let airdropIndex = 0; airdropIndex < airdropCount; airdropIndex++) {
      try {
        // Check if this domain has already claimed from this airdrop
        const hasClaimed = await sdk.rwairdrop().hasDomainClaimed(domain, airdropIndex);

        if (hasClaimed) {
          console.log(`  📦 Airdrop ${airdropIndex}: ✅ Already claimed`);
          continue;
        }

        // Get airdrop info to check if it's active
        const airdropInfo = await sdk.rwairdrop().getAirdropInfoByTLD(TLD_NAME, airdropIndex);

        if (!airdropInfo.isActive) {
          console.log(`  📦 Airdrop ${airdropIndex}: ❌ Not active`);
          continue;
        }

        if (airdropInfo.remainingBalance === 0n) {
          console.log(`  📦 Airdrop ${airdropIndex}: ❌ No remaining balance`);
          continue;
        }

        // Get token info for display
        const tokenInfo = await getTokenInfo(airdropInfo.tokenAddress, provider);

        console.log(`  📦 Airdrop ${airdropIndex}: 🚀 Attempting to claim...`);
        console.log(`    Token: ${tokenInfo.symbol}`);
        console.log(`    Claimable Amount: ${ethers.formatUnits(airdropInfo.perUserShare, tokenInfo.decimals)} ${tokenInfo.symbol}`);

        totalClaimsAttempted++;

        // Get balance before claim
        let balanceBefore = 0n;
        if (tokenInfo.contract) {
          balanceBefore = await tokenInfo.contract.balanceOf(walletAddress);
        }

        // Attempt to claim the airdrop share
        const claimTx = await sdk.rwairdrop().claimShare(TLD_NAME, airdropIndex, domain);
        console.log(`    📝 Claim transaction: ${claimTx.hash}`);
        console.log('    ⏳ Waiting for confirmation...');

        const receipt = await claimTx.wait();
        console.log(`    ✅ Claim confirmed! Block: ${receipt.blockNumber}`);
        console.log(`    ⛽ Gas used: ${receipt.gasUsed.toString()}`);

        // Check balance after claim
        if (tokenInfo.contract) {
          const balanceAfter = await tokenInfo.contract.balanceOf(walletAddress);
          const received = balanceAfter - balanceBefore;
          console.log(`    💰 Tokens received: ${ethers.formatUnits(received, tokenInfo.decimals)} ${tokenInfo.symbol}`);
        }

        claimsSuccessful++;

      } catch (error) {
        console.log(`  📦 Airdrop ${airdropIndex}: ❌ Claim failed - ${error.message}`);
      }
    }
  }

  console.log('\n=== Claim Summary ===');
  console.log(`✅ Successful claims: ${claimsSuccessful}`);
  console.log(`📊 Total attempts: ${totalClaimsAttempted}`);
  console.log(`📱 Wallet address: ${walletAddress}`);
  console.log(`🏷️  Domains processed: ${userDomains.length}`);
  console.log(`📦 Airdrops checked: ${airdropCount}`);

  if (claimsSuccessful > 0) {
    console.log('\n🎉 Congratulations! You have successfully claimed airdrop shares!');
    console.log('💡 Check your wallet balance to see the received tokens');
  } else if (totalClaimsAttempted === 0) {
    console.log('\n💡 No claims were attempted - all airdrops may have been already claimed');
  } else {
    console.log('\n⚠️  Some claims failed - check the error messages above for details');
  }

  console.log('\n✓ Claim process completed!');
}

// Run the main function
main()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  });

