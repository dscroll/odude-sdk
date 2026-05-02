/**
 * Flow Test Example
 * Complete flow for checking registration, getting TLD info, and minting based on payment type
 * 
 * Usage: npx hardhat run examples/flow-test.js --network basesepolia
 * node examples/flow-test.js
 */

const ODudeSDK = require('../src/index');

// Configuration variables
const tld_name = 'mango';
const sub_name = 'test@mango';
const wallet_address = '0xaa481F8d2d966e5fCC0446fA459F5d580AE5ea9f'; // Replace with your wallet address

async function main() {
  console.log('=== ODude Flow Test Example ===\n');
  console.log(`TLD Name: ${tld_name}`);
  console.log(`Subdomain Name: ${sub_name}`);
  console.log(`Wallet Address: ${wallet_address}\n`);

  // Initialize SDK
  const sdk = new ODudeSDK({
    rpcUrl_sepolia: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
  });

  try {
    // Connect to Base Sepolia network
    await sdk.connectAllNetworks();
    console.log('✓ Connected to Base Sepolia network\n');

    // Step 1: Check if subdomain is registered
    console.log('--- Step 1: Check Subdomain Registration ---');
    const exists = await sdk.resolver().nameExists(sub_name);
    console.log(`Subdomain "${sub_name}" exists: ${exists}`);

    if (exists) {
      console.log('✓ Subdomain is already registered');
      
      // Get existing name info
      const nameInfo = await sdk.getNameInfo(sub_name);
      console.log('Name Info:', {
        owner: nameInfo.owner,
        resolvedAddress: nameInfo.resolvedAddress,
        tokenId: nameInfo.tokenId.toString()
      });
      
      console.log('\n✓ Flow completed - subdomain already exists');
      return;
    }

    console.log('✓ Subdomain is available for registration\n');

    // Step 2: Get TLD info
    console.log('--- Step 2: Get TLD Information ---');
    let tldInfo;
    try {
      tldInfo = await sdk.getTldInfo(tld_name);
      console.log('TLD Info:', {
        tokenId: tldInfo.tokenId.toString(),
        name: tldInfo.name,
        owner: tldInfo.getTLDOwner,
        price: sdk.utils.formatEther(tldInfo.getTLDPrice) + ' ETH',
        commission: tldInfo.getCommission.toString() + '%',
        ercToken: tldInfo.getErcToken,
        active: tldInfo.isTLDActive
      });
    } catch (error) {
      console.error('❌ Failed to get TLD info:', error.message);
      return;
    }

    if (!tldInfo.isTLDActive) {
      console.error('❌ TLD is not active for minting');
      return;
    }

    console.log('✓ TLD is active and ready for minting\n');

    // Step 3: Check payment type
    console.log('--- Step 3: Check Payment Type ---');
    const isEthPayment = tldInfo.getErcToken === '0x0000000000000000000000000000000000000000';
    
    if (isEthPayment) {
      console.log('✓ TLD accepts ETH payments');
      console.log(`  Price: ${sdk.utils.formatEther(tldInfo.getTLDPrice)} ETH`);
    } else {
      console.log('✓ TLD accepts ERC20 token payments');
      console.log(`  Token Address: ${tldInfo.getErcToken}`);
      console.log(`  Price: ${sdk.utils.formatEther(tldInfo.getTokenPrice)} tokens`);
    }

    // Step 4: Check minting eligibility
    console.log('\n--- Step 4: Check Minting Eligibility ---');
    const eligibility = await sdk.checkMintEligibility(sub_name);
    console.log('Eligibility Check:', {
      eligible: eligibility.eligible,
      available: eligibility.available,
      tldActive: eligibility.tldActive,
      cost: sdk.utils.formatEther(eligibility.cost) + (isEthPayment ? ' ETH' : ' tokens'),
      reason: eligibility.reason
    });

    if (!eligibility.eligible) {
      console.error('❌ Domain is not eligible for minting:', eligibility.reason);
      return;
    }

    console.log('✓ Domain is eligible for minting\n');

    // Step 5: Simulate minting process
    console.log('--- Step 5: Minting Process (Simulation) ---');
    console.log('⚠️  This is a simulation - no actual minting will occur');
    console.log('To perform actual minting, you need:');
    console.log('1. A signer with sufficient balance');
    console.log('2. Proper gas estimation');
    console.log('3. Transaction execution');
    
    if (isEthPayment) {
      console.log('\nFor ETH payment:');
      console.log(`  sdk.tld().mintDomain('${sub_name}', '${wallet_address}', {`);
      console.log(`    value: '${eligibility.cost.toString()}'`);
      console.log('  });');
    } else {
      console.log('\nFor ERC20 payment:');
      console.log('1. First approve the TLD contract to spend tokens');
      console.log('2. Then call mintDomain without value parameter');
      console.log(`  sdk.tld().mintDomain('${sub_name}', '${wallet_address}');`);
    }

    console.log('\n✓ Flow test completed successfully!');
    console.log('\nSummary:');
    console.log(`- TLD "${tld_name}" is active and ready`);
    console.log(`- Subdomain "${sub_name}" is available`);
    console.log(`- Payment type: ${isEthPayment ? 'ETH' : 'ERC20 Token'}`);
    console.log(`- Minting cost: ${sdk.utils.formatEther(eligibility.cost)} ${isEthPayment ? 'ETH' : 'tokens'}`);

  } catch (error) {
    console.error('❌ Flow test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Handle both direct execution and hardhat run
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
} else {
  module.exports = main;
}
