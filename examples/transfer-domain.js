/**
 * Transfer Domain Example
 * 
 * This example demonstrates how to transfer an ODude domain (NFT) 
 * from one wallet address to another.
 * 
 * Domains are ERC721 tokens, so transferring them is a single 
 * blockchain transaction using the Registry contract.
 * 
 * How to run:
 * node examples/transfer-domain.js
 */

const ODudeSDK = require('../src/index');

// ==================== CONFIGURATION ====================
const CONFIG = {
  NETWORK: 'basesepolia',
  DOMAIN_NAME: 'mango@xxx', // The domain you want to transfer
  TO_ADDRESS: '0xaa481F8d2d966e5fCC0446fA459F5d580AE5ea9f', // Recipient
  
  // The private key of the CURRENT owner
  PRIVATE_KEY: process.env.PRIVATE_KEY, 
  RPC_URL: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
};
// =======================================================

async function main() {
  console.log('=== ODude SDK - Transfer Domain ===\n');

  if (!CONFIG.PRIVATE_KEY) {
    console.error('❌ Error: PRIVATE_KEY of the current owner is required.');
    process.exit(1);
  }

  // Initialize SDK with the sender's private key
  const sdk = new ODudeSDK({
    rpcUrl_sepolia: CONFIG.RPC_URL,
    privateKey: CONFIG.PRIVATE_KEY
  });

  try {
    sdk.connectNetwork(CONFIG.NETWORK);
  } catch (error) {
    console.error('❌ Failed to connect:', error.message);
    return;
  }

  const registry = sdk.registry();
  const fromAddress = sdk.signers[CONFIG.NETWORK].address;

  console.log(`Transferring: ${CONFIG.DOMAIN_NAME}`);
  console.log(`From:         ${fromAddress}`);
  console.log(`To:           ${CONFIG.TO_ADDRESS}\n`);

  try {
    // 1. Get the Token ID for the domain
    const tokenId = await registry.getTokenId(CONFIG.DOMAIN_NAME);
    console.log(`Token ID:     ${tokenId.toString()}`);

    // 2. Verify current ownership
    const currentOwner = await registry.ownerOf(tokenId);
    if (currentOwner.toLowerCase() !== fromAddress.toLowerCase()) {
      throw new Error(`You are not the owner of this domain. Current owner is ${currentOwner}`);
    }

    // 3. Perform the transfer
    // safeTransferFrom is recommended for ERC721
    console.log('Sending transfer transaction...');
    const tx = await registry.safeTransferFrom(fromAddress, CONFIG.TO_ADDRESS, tokenId);
    
    console.log(`Transaction Hash: ${tx.hash}`);
    console.log('Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log('✅ Transfer complete! Confirmed in block:', receipt.blockNumber);

    // 4. Verify new ownership
    const newOwner = await registry.ownerOf(tokenId);
    console.log(`\nNew Owner verified: ${newOwner}`);

    // NOTE for TLDs:
    if (!CONFIG.DOMAIN_NAME.includes('@')) {
      console.log('\n------------------------------------------------------------');
      console.log('✨ NOTE FOR TLD TRANSFERS:');
      console.log('Management rights (pricing, commissions, etc.) have been');
      console.log('automatically transferred to the new owner.');
      console.log('------------------------------------------------------------');
    }

  } catch (error) {
    console.error('\n❌ Transfer failed:');
    console.error(`   ${error.message}`);
  }
}

main().catch(console.error);
