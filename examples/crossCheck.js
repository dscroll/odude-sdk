/**
 * Cross Check Example - TLD Ownership Verification
 * 
 * This example demonstrates how to:
 * 1. Check the owner of a specific TLD ('xxx')
 * 2. Check if a specific wallet address owns that TLD
 * 3. List all names owned by a specific wallet
 * 
 * How to run:
 * node examples/crossCheck.js
 */

const ODudeSDK = require('../src/index');

// ==================== CONFIGURATION ====================
const CONFIG = {
  NETWORK: 'base',
  TLD_NAME: 'xxx',
  WALLET_ADDRESS: '0xDF9dcaDF518670560fFDD62c3675304bDE8B8015',
  RPC_URL: process.env.BASE_RPC_URL || 'https://mainnet.base.org'
};
// =======================================================

async function main() {
  console.log('=== ODude SDK - Cross Check Ownership ===\n');
  console.log('Configuration:');
  console.log('  Network:', CONFIG.NETWORK);
  console.log('  Checking TLD:', CONFIG.TLD_NAME);
  console.log('  Checking Wallet:', CONFIG.WALLET_ADDRESS);
  console.log();

  // Initialize SDK
  const sdk = new ODudeSDK({
    rpcUrl_sepolia: CONFIG.RPC_URL
  });

  // Connect to network
  try {
    sdk.connectNetwork(CONFIG.NETWORK);
    console.log(`✓ Connected to ${CONFIG.NETWORK} network\n`);
  } catch (error) {
    console.error('❌ Failed to connect to network:', error.message);
    return;
  }

  // === Part 1: Check TLD Owner for 'xxx' ===
  console.log(`--- Part 1: Checking TLD Owner for '${CONFIG.TLD_NAME}' ---`);
  
  let tldId;
  let tldOwner;

  try {
    const tldContract = sdk.tld();
    
    // Get TLD ID for 'xxx'
    tldId = await tldContract.getTLDId(CONFIG.TLD_NAME);
    console.log(`TLD ID for '${CONFIG.TLD_NAME}':`, tldId.toString());

    // Get TLD Owner
    tldOwner = await tldContract.getTLDOwner(tldId);
    console.log(`TLD Owner of '${CONFIG.TLD_NAME}':`, tldOwner);
    
    if (tldOwner === '0x0000000000000000000000000000000000000000') {
      console.log('⚠️  This TLD does not appear to have an owner or is not registered.');
    }
    console.log();
  } catch (error) {
    console.error(`❌ Failed to check TLD owner:`, error.message);
    console.log();
  }

  // === Part 2: Check if specific wallet has TLD 'xxx' ===
  console.log(`--- Part 2: Checking if ${CONFIG.WALLET_ADDRESS} owns '${CONFIG.TLD_NAME}' ---`);
  
  const ownsTLD = tldOwner && tldOwner.toLowerCase() === CONFIG.WALLET_ADDRESS.toLowerCase();
  
  if (ownsTLD) {
    console.log(`✅ YES! Wallet ${CONFIG.WALLET_ADDRESS} OWNS the TLD '${CONFIG.TLD_NAME}'.`);
  } else {
    console.log(`❌ NO. Wallet ${CONFIG.WALLET_ADDRESS} does NOT own the TLD '${CONFIG.TLD_NAME}'.`);
    if (tldOwner) {
      console.log(`   The current owner is: ${tldOwner}`);
    }
  }
  console.log();

  // === Part 3: List all names owned by the wallet ===
  console.log(`--- Part 3: All names owned by ${CONFIG.WALLET_ADDRESS} ---`);
  
  try {
    const names = await sdk.getNamesList(CONFIG.WALLET_ADDRESS);
    
    if (names.length === 0) {
      console.log(`Wallet ${CONFIG.WALLET_ADDRESS} does not own any names on ${CONFIG.NETWORK}.`);
    } else {
      console.log(`Found ${names.length} name(s) owned by this wallet:`);
      names.forEach((item, index) => {
        const isTargetTLD = item.name === CONFIG.TLD_NAME;
        const marker = isTargetTLD ? ' ⭐ [TARGET TLD]' : '';
        console.log(`  ${index + 1}. ${item.name} (ID: ${item.tokenId})${marker}`);
      });
      
      // Double check if 'xxx' was found in the list
      const hasTLDInList = names.some(n => n.name === CONFIG.TLD_NAME);
      if (hasTLDInList && !ownsTLD) {
        console.log(`\n⚠️  Discovery: '${CONFIG.TLD_NAME}' is in the wallet's name list, but Part 1 reported a different owner.`);
        console.log('   This might happen if the Registry and TLD contracts are out of sync.');
      }
    }
  } catch (error) {
    console.error(`❌ Failed to fetch name list:`, error.message);
  }

  console.log('\n=== Cross Check Complete ===');
}

// Run the example
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
