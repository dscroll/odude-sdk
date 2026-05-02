/**
 * SubNameMint.js - Domain Minting Example
 *
 * This example demonstrates:
 * - Prompting for domain name input
 * - Checking TLD information and availability
 * - Minting a domain using the ODude SDK
 * - Using private key from environment variables
 * - Working with Base Sepolia network
 *
 * Usage: node examples/SubNameMint.js
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
  console.log('=== ODude Domain Minting Example ===\n');

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
    // Prompt for domain name
    const domainName = await askQuestion('Enter domain name to mint (e.g., test@sepolia): ');

    // Validate domain name format using the new utility function
    if (!utils.isValidSubName(domainName)) {
      console.error('❌ Invalid domain name format. Please use format: name@tld (e.g., test@sepolia)');
      console.error('   - Only alphanumeric characters and dots allowed');
      console.error('   - Must have exactly one @ symbol');
      console.error('   - Each segment must be 1-63 characters');
      console.error('   - Total length must be 1-253 characters');
      process.exit(1);
    }

    const [name, tld] = domainName.split('@');

    if (!name || !tld) {
      console.error('❌ Invalid domain name format. Please use format: name@tld (e.g., test@sepolia)');
      process.exit(1);
    }

    console.log(`\n--- Checking TLD Information for "${tld}" ---`);

    // Get TLD information
    let tldInfo;
    try {
      tldInfo = await sdk.getTldInfo(tld);
      console.log('✓ TLD found!');
      console.log('TLD Details:');
      console.log(`  - Name: ${tldInfo.name}`);
      console.log(`  - Token ID: ${tldInfo.tokenId}`);
      console.log(`  - Owner: ${tldInfo.getTLDOwner}`);
      console.log(`  - Price: ${ethers.formatEther(tldInfo.getTLDPrice)} ETH`);
      console.log(`  - Commission: ${tldInfo.getCommission}%`);
      console.log(`  - Active: ${tldInfo.isTLDActive}`);
      console.log(`  - Network: ${tldInfo.network}`);
      
      if (tldInfo.resolvedAddress) {
        console.log(`  - Resolved Address: ${tldInfo.resolvedAddress}`);
      }
    } catch (error) {
      console.error(`❌ TLD "${tld}" not found or not available:`, error.message);
      console.log('\nAvailable TLDs on Base Sepolia:');
      console.log('  - sepolia (if minted)');
      console.log('  - crypto (if minted)');
      console.log('  - fil (if minted)');
      console.log('\nPlease try with an existing TLD or mint the TLD first.');
      process.exit(1);
    }

    if (!tldInfo.isTLDActive) {
      console.error(`❌ TLD "${tld}" is not active and cannot be used for domain minting.`);
      process.exit(1);
    }

    console.log(`\n--- Checking Domain Availability for "${domainName}" ---`);

    // Check if domain is eligible for minting
    let eligibility;
    try {
      eligibility = await sdk.checkMintEligibility(domainName);
      console.log('Eligibility Check Results:');
      console.log(`  - Eligible: ${eligibility.eligible}`);
      console.log(`  - Available: ${eligibility.available}`);
      console.log(`  - TLD Active: ${eligibility.tldActive}`);
      console.log(`  - Cost: ${ethers.formatEther(eligibility.cost)} ETH`);
      console.log(`  - Reason: ${eligibility.reason}`);
    } catch (error) {
      console.error('❌ Failed to check domain eligibility:', error.message);
      process.exit(1);
    }

    if (!eligibility.eligible) {
      console.error(`❌ Domain "${domainName}" is not eligible for minting: ${eligibility.reason}`);
      process.exit(1);
    }

    console.log(`\n--- Preparing to Mint "${domainName}" ---`);
    
    // Get the signer address (recipient)
    const signer = sdk.getSigner();
    if (!signer) {
      console.error('❌ No signer available. Please check your PRIVATE_KEY in .env file.');
      process.exit(1);
    }
    
    const signerAddress = await signer.getAddress();
    console.log(`Recipient Address: ${signerAddress}`);
    console.log(`Minting Cost: ${ethers.formatEther(eligibility.cost)} ETH`);

    // Confirm minting
    const confirm = await askQuestion('\nDo you want to proceed with minting? (y/N): ');
    
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('❌ Minting cancelled by user.');
      process.exit(0);
    }

    console.log('\n--- Minting Domain ---');
    console.log('⏳ Submitting transaction...');

    // Mint the domain
    try {
      const mintTx = await sdk.mintDomain(domainName, signerAddress, {
        value: eligibility.cost
      });

      console.log(`✓ Transaction submitted: ${mintTx.hash}`);
      console.log('⏳ Waiting for confirmation...');

      const receipt = await mintTx.wait();
      
      console.log('🎉 Domain minted successfully!');
      console.log(`  - Transaction Hash: ${receipt.hash}`);
      console.log(`  - Block Number: ${receipt.blockNumber}`);
      console.log(`  - Gas Used: ${receipt.gasUsed.toString()}`);
      console.log(`  - Domain: ${domainName}`);
      console.log(`  - Owner: ${signerAddress}`);

      // Verify the minting by checking name info
      console.log('\n--- Verifying Minted Domain ---');
      try {
        const nameInfo = await sdk.getNameInfo(domainName);
        console.log('✓ Domain verification successful:');
        console.log(`  - Name: ${nameInfo.name}`);
        console.log(`  - Token ID: ${nameInfo.tokenId}`);
        console.log(`  - Owner: ${nameInfo.owner}`);
        console.log(`  - Exists: ${nameInfo.exists}`);
        console.log(`  - Network: ${nameInfo.network}`);
      } catch (verifyError) {
        console.log('⚠️  Domain minted but verification failed:', verifyError.message);
        console.log('This might be due to indexing delays. The domain should be available shortly.');
      }

    } catch (error) {
      console.error('❌ Failed to mint domain:', error.message);
      
      if (error.message.includes('insufficient funds')) {
        console.log('💡 Make sure you have enough ETH in your wallet to cover the minting cost and gas fees.');
      } else if (error.message.includes('already taken')) {
        console.log('💡 This domain name is already taken. Please try a different name.');
      } else if (error.message.includes('TLD not active')) {
        console.log('💡 The TLD is not active. Please contact the TLD owner or try a different TLD.');
      }
      
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }

  console.log('\n✅ Example completed successfully!');
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
