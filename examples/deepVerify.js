// To run this example, use the following command:
// node examples/deepVerify.js
// This example verifies the ownership of a TLD.
// It checks the Registry contract owner and the TLD Contract owner.

const ODudeSDK = require('../src/index');
const { ethers } = require('ethers');

async function main() {
  const sdk = new ODudeSDK({
    rpcUrl_sepolia: 'https://sepolia.base.org'
  });
  sdk.connectNetwork('basesepolia');

  const registry = sdk.registry();
  const tld = sdk.tld();

  const TLD_NAME = 'xxx';
  const TARGET_WALLET = '0xDF9dcaDF518670560fFDD62c3675304bDE8B8015';

  console.log(`=== Deep Verification for '${TLD_NAME}' ===\n`);

  // 1. Get Token ID
  const tokenId = await registry.getTokenId(TLD_NAME);
  console.log(`Token ID: ${tokenId.toString()}`);

  // 2. Registry Owner
  const registryOwner = await registry.ownerOf(tokenId);
  console.log(`Registry Owner (NFT): ${registryOwner}`);

  // 3. TLD Contract Owner
  let tldContractOwner;
  try {
    tldContractOwner = await tld.getTLDOwner(tokenId);
    console.log(`TLD Contract Owner:   ${tldContractOwner}`);
  } catch (e) {
    console.log(`TLD Contract Owner:   Error - ${e.message}`);
  }

  // 4. Comparison
  console.log('\nResults:');
  if (registryOwner.toLowerCase() === TARGET_WALLET.toLowerCase()) {
    console.log(`✅ Registry confirms ${TARGET_WALLET} OWNS the '${TLD_NAME}' NFT.`);
  } else {
    console.log(`❌ Registry says ${registryOwner} owns the '${TLD_NAME}' NFT (Expected ${TARGET_WALLET}).`);
  }

  if (tldContractOwner && tldContractOwner.toLowerCase() === TARGET_WALLET.toLowerCase()) {
    console.log(`✅ TLD Contract confirms ${TARGET_WALLET} is the TLD manager.`);
  } else if (tldContractOwner) {
    console.log(`❌ TLD Contract says ${tldContractOwner} is the TLD manager.`);
  }

  // 5. Check if it's actually a TLD in the Registry metadata
  try {
    const metadata = await registry.getNFTMetadata(tokenId);
    console.log(`\nMetadata:`);
    console.log(`  Name: ${metadata.name}`);
    console.log(`  Is TLD: ${metadata.isTLD}`);
    console.log(`  Parent TLD: ${metadata.parentTLD}`);
  } catch (e) {
    console.log(`\nMetadata Error: ${e.message}`);
  }
}

main().catch(console.error);
