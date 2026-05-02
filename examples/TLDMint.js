/**
 * TLDMint.js - TLD (Top-Level Domain) Minting Example
 *
 * This example demonstrates:
 * - Prompting for TLD name input
 * - Validating TLD name format
 * - Checking TLD availability and requirements
 * - Minting a TLD using the ODude SDK
 * - Using private key from environment variables
 * - Working with Base Sepolia network
 *
 * Usage: node examples/TLDMint.js
 */

// Load environment variables
require('dotenv').config();

const ODudeSDK = require('../src/index');
const { utils } = require('../src/index');
const { ethers } = require('ethers');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('=== ODude TLD Minting Example ===\n');

  // Check for required environment variables
  if (!process.env.PRIVATE_KEY) {
    console.error('❌ Error: PRIVATE_KEY not found in .env file');
    console.log('Please add your private key to the .env file:');
    console.log('PRIVATE_KEY=your_private_key_here');
    process.exit(1);
  }

  if (!process.env.BASE_SEPOLIA_RPC_URL) {
    console.error('❌ Error: BASE_SEPOLIA_RPC_URL not found in .env file');
    console.log('Please add the Base Sepolia RPC URL to the .env file:');
    console.log('BASE_SEPOLIA_RPC_URL=https://sepolia.base.org');
    process.exit(1);
  }

  // Initialize SDK with Base Sepolia configuration
  const sdk = new ODudeSDK({
    rpcUrl_sepolia: process.env.BASE_SEPOLIA_RPC_URL,
    privateKey: process.env.PRIVATE_KEY
  });

  try {
    // Connect to Base Sepolia network
    sdk.connectNetwork('basesepolia');
    console.log('✓ Connected to Base Sepolia network\n');
  } catch (error) {
    console.error('❌ Failed to connect to Base Sepolia:', error.message);
    console.log('Please check your BASE_SEPOLIA_RPC_URL in the .env file');
    process.exit(1);
  }

  try {
    // Prompt for TLD name
    const tldName = await askQuestion('Enter TLD name to mint (e.g., crypto, sepolia, mycompany): ');

    // Validate TLD name format using the new utility function
    if (!utils.isValidTLD(tldName)) {
      console.error('❌ Invalid TLD name format. TLD requirements:');
      console.error('   - Only alphanumeric characters and dots allowed');
      console.error('   - No @ symbols allowed');
      console.error('   - Must be 2-63 characters long');
      console.error('   - Examples: crypto, sepolia, mycompany, web3');
      process.exit(1);
    }

    console.log(`\n--- Checking TLD Availability for "${tldName}" ---`);

    // Check if TLD already exists
    let tldExists = false;
    try {
      const tldInfo = await sdk.getTldInfo(tldName);
      if (tldInfo && tldInfo.isTLDActive) {
        tldExists = true;
        console.error(`❌ TLD "${tldName}" already exists and is active.`);
        console.log('TLD Details:');
        console.log(`  - Name: ${tldInfo.name}`);
        console.log(`  - Token ID: ${tldInfo.tokenId}`);
        console.log(`  - Owner: ${tldInfo.getTLDOwner}`);
        console.log(`  - Price: ${ethers.formatEther(tldInfo.getTLDPrice)} ETH`);
        console.log(`  - Commission: ${tldInfo.getCommission}%`);
        console.log(`  - Network: ${tldInfo.network}`);
        process.exit(1);
      }
    } catch (error) {
      // TLD doesn't exist, which is good for minting
      console.log(`✓ TLD "${tldName}" is available for minting`);
    }

    console.log('\n--- Checking TLD Minting Requirements ---');

    // Check TLD minting eligibility
    let eligibility;
    try {
      eligibility = await sdk.checkMintEligibility(tldName);
      console.log('TLD Minting Eligibility:');
      console.log(`  - Eligible: ${eligibility.eligible}`);
      console.log(`  - Available: ${eligibility.available}`);
      console.log(`  - Cost: ${ethers.formatEther(eligibility.cost)} ETH`);
      console.log(`  - Reason: ${eligibility.reason}`);
    } catch (error) {
      console.error('❌ Failed to check TLD eligibility:', error.message);
      process.exit(1);
    }

    if (!eligibility.eligible) {
      console.error(`❌ TLD "${tldName}" is not eligible for minting: ${eligibility.reason}`);
      process.exit(1);
    }

    console.log(`\n--- Preparing to Mint TLD "${tldName}" ---`);
    
    // Get the signer address (recipient)
    const signer = sdk.getSigner();
    if (!signer) {
      console.error('❌ No signer available. Please check your PRIVATE_KEY in .env file.');
      process.exit(1);
    }
    
    const signerAddress = await signer.getAddress();
    console.log(`TLD Owner Address: ${signerAddress}`);
    console.log(`Minting Cost: ${ethers.formatEther(eligibility.cost)} ETH`);

    // Show TLD benefits
    console.log('\n--- TLD Ownership Benefits ---');
    console.log('As a TLD owner, you will be able to:');
    console.log('  - Set pricing for subdomains under your TLD');
    console.log('  - Earn commission from subdomain sales');
    console.log('  - Control TLD settings and policies');
    console.log('  - Transfer TLD ownership');

    // Confirm minting
    const confirm = await askQuestion('\nDo you want to proceed with TLD minting? (y/N): ');
    
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('❌ TLD minting cancelled by user.');
      process.exit(0);
    }

    console.log('\n--- Minting TLD ---');
    console.log('⏳ Submitting transaction...');

    // Mint the TLD
    try {
      const mintTx = await sdk.mintTLD(tldName, signerAddress, {
        value: eligibility.cost
      });

      console.log(`✓ Transaction submitted: ${mintTx.hash}`);
      console.log(`✓ Block Number: ${mintTx.blockNumber}`);
      console.log(`✓ Gas Used: ${mintTx.gasUsed.toString()}`);

      console.log('🎉 TLD minted successfully!');
      console.log(`  - TLD Name: ${tldName}`);
      console.log(`  - Owner: ${signerAddress}`);
      console.log(`  - Transaction Hash: ${mintTx.hash}`);

      // Verify the minting by checking TLD info
      console.log('\n--- Verifying Minted TLD ---');
      try {
        // Wait a bit for indexing
        console.log('⏳ Waiting for blockchain indexing...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const tldInfo = await sdk.getTldInfo(tldName);
        console.log('✓ TLD verification successful:');
        console.log(`  - Name: ${tldInfo.name}`);
        console.log(`  - Token ID: ${tldInfo.tokenId}`);
        console.log(`  - Owner: ${tldInfo.getTLDOwner}`);
        console.log(`  - Price: ${ethers.formatEther(tldInfo.getTLDPrice)} ETH`);
        console.log(`  - Commission: ${tldInfo.getCommission}%`);
        console.log(`  - Active: ${tldInfo.isTLDActive}`);
        console.log(`  - Network: ${tldInfo.network}`);
      } catch (verifyError) {
        console.log('⚠️  TLD minted but verification failed:', verifyError.message);
        console.log('This might be due to indexing delays. The TLD should be available shortly.');
        console.log('You can verify your TLD ownership by checking your wallet for the NFT.');
      }

      console.log('\n--- Next Steps ---');
      console.log('Now that you own this TLD, you can:');
      console.log('1. Set subdomain pricing using the TLD management functions');
      console.log('2. Allow others to mint subdomains under your TLD');
      console.log('3. Earn commission from subdomain sales');
      console.log(`4. Try minting a subdomain: node examples/SubNameMint.js (use format: name@${tldName})`);

    } catch (error) {
      console.error('❌ Failed to mint TLD:', error.message);
      
      if (error.message.includes('insufficient funds')) {
        console.log('💡 Make sure you have enough ETH in your wallet to cover the TLD minting cost and gas fees.');
      } else if (error.message.includes('already exists')) {
        console.log('💡 This TLD name is already taken. Please try a different name.');
      } else if (error.message.includes('invalid name')) {
        console.log('💡 Please check the TLD name format. Only alphanumeric characters are allowed.');
      }
      
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }

  console.log('\n✅ TLD minting example completed successfully!');
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Goodbye!');
  rl.close();
  process.exit(0);
});

// Run the example
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    rl.close();
    process.exit(1);
  });
