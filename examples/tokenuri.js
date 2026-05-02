/**
 * Token URI Management Example
 * 
 * This example demonstrates how to:
 * - Initialize the ODude SDK
 * - Get the Token ID for a TLD or Subdomain
 * - Update the Token URI (Metadata URL) for an NFT
 * - Use a demo URL for subdomains
 * 
 * Usage: 
 * 1. Set PRIVATE_KEY in your .env file
 * 2. Set BASE_SEPOLIA_RPC_URL in your .env file
 * 3. Run: node examples/tokenuri.js
 */

// Load environment variables
require('dotenv').config();

const ODudeSDK = require('../src/index');
const { ethers } = require('ethers');

async function main() {
  console.log('=== ODude Token URI Management Example ===\n');

  // Check for required environment variables
  if (!process.env.PRIVATE_KEY) {
    console.error('❌ Error: PRIVATE_KEY not found in .env file');
    process.exit(1);
  }

  // Initialize SDK with Base Sepolia configuration
  const sdk = new ODudeSDK({
    rpcUrl_sepolia: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
    privateKey: process.env.PRIVATE_KEY
  });

  try {
    // Connect to Base Sepolia network
    sdk.connectNetwork('basesepolia');
    console.log('✓ Connected to Base Sepolia network\n');
  } catch (error) {
    console.error('❌ Failed to connect to Base Sepolia:', error.message);
    process.exit(1);
  }

  // Configuration for the example
  const domainName = 'demo@xxx'; // Replace with your domain name
  const demoMetadataUrl = `https://api.odude.com/metadata/${domainName}`;

  console.log(`--- Managing Token URI for: ${domainName} ---`);

  try {
    // 1. Get the Token ID for the domain
    console.log(`Step 1: Fetching Token ID for "${domainName}"...`);
    const tokenId = await sdk.registry().getTokenId(domainName);
    console.log(`✓ Token ID: ${tokenId.toString()}`);

    // 2. Check current Token URI
    console.log('Step 2: Checking current Token URI...');
    try {
      const currentURI = await sdk.registry().tokenURI(tokenId);
      console.log(`Current URI: ${currentURI}`);
    } catch (e) {
      console.log('No current URI set or token does not exist yet.');
    }

    // 3. Set new Token URI
    console.log(`Step 3: Setting new Token URI to: ${demoMetadataUrl}`);
    console.log('⏳ Submitting transaction...');

    // Note: You must be the owner of the token to update its URI
    const tx = await sdk.registry().setTokenURI(tokenId, demoMetadataUrl);
    
    console.log(`✓ Transaction submitted: ${tx.hash}`);
    console.log('⏳ Waiting for confirmation...');

    const receipt = await tx.wait();
    console.log('🎉 Token URI updated successfully!');
    console.log(`- Transaction Hash: ${receipt.hash}`);
    console.log(`- New URI: ${demoMetadataUrl}`);

    // 4. Verify the update
    console.log('\n--- Verifying Update ---');
    const updatedURI = await sdk.registry().tokenURI(tokenId);
    if (updatedURI === demoMetadataUrl) {
      console.log('✅ Verification successful! URI matches.');
    } else {
      console.log('❌ Verification failed. URI does not match.');
    }

  } catch (error) {
    console.error('\n❌ Operation failed:');
    if (error.message.includes('execution reverted')) {
      console.error('Error: Transaction reverted. Possible reasons:');
      console.error('- You are not the owner of this token');
      console.error('- The token does not exist');
      console.error('- Insufficient funds for gas');
    } else {
      console.error(error.message);
    }
  }

  console.log('\n✅ Example completed!');
}

// Run the example
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
