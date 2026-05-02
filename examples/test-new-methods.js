/**
 * Test New SDK Methods
 * Test the enhanced domain management methods
 * 
 * Usage: node examples/test-new-methods.js
 */

require('dotenv').config();
const ODudeSDK = require('../src/index');

async function main() {
  console.log('=== Testing New SDK Methods ===\n');

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

  const testDomain = 'test@xxx';
  const testAddress = '0xDF9dcaDF518670560fFDD62c3675304bDE8B8015';

  console.log(`\n🧪 Testing domain: ${testDomain}`);
  console.log(`🧪 Testing address: ${testAddress}`);

  // Test domainExists
  console.log('\n--- Testing domainExists() ---');
  try {
    const exists = await sdk.domainExists(testDomain);
    console.log(`✅ domainExists('${testDomain}'): ${exists}`);
  } catch (error) {
    console.log(`❌ domainExists error:`, error.message);
  }

  // Test getOwnerSafe
  console.log('\n--- Testing getOwnerSafe() ---');
  try {
    const owner = await sdk.getOwnerSafe(testDomain);
    console.log(`✅ getOwnerSafe('${testDomain}'): ${owner || 'null'}`);
  } catch (error) {
    console.log(`❌ getOwnerSafe error:`, error.message);
  }

  // Test getDomainStatus
  console.log('\n--- Testing getDomainStatus() ---');
  try {
    const status = await sdk.getDomainStatus(testDomain);
    console.log(`✅ getDomainStatus('${testDomain}'):`);
    console.log(`   Exists: ${status.exists}`);
    console.log(`   Owner: ${status.owner || 'null'}`);
    console.log(`   Can Mint: ${status.canMint}`);
    console.log(`   In Airdrop Contract: ${status.inAirdropContract}`);
    console.log(`   Claimable Airdrops: ${status.claimableAirdrops}`);
  } catch (error) {
    console.log(`❌ getDomainStatus error:`, error.message);
  }

  // Test getUserDomainsInTLD (direct RWAirdrop method)
  console.log('\n--- Testing getUserDomainsInTLD() ---');
  try {
    const domains = await sdk.rwairdrop().getUserDomainsInTLD(testAddress, 'xxx');
    console.log(`✅ getUserDomainsInTLD('${testAddress}', 'xxx'):`);
    console.log(`   Found ${domains.length} domains: ${domains.join(', ')}`);
  } catch (error) {
    console.log(`❌ getUserDomainsInTLD error:`, error.message);
  }

  // Test a non-existent domain
  console.log('\n--- Testing with non-existent domain ---');
  const nonExistentDomain = 'nonexistent@xxx';
  
  try {
    const exists = await sdk.domainExists(nonExistentDomain);
    const owner = await sdk.getOwnerSafe(nonExistentDomain);
    const status = await sdk.getDomainStatus(nonExistentDomain);
    
    console.log(`✅ Non-existent domain tests:`);
    console.log(`   domainExists('${nonExistentDomain}'): ${exists}`);
    console.log(`   getOwnerSafe('${nonExistentDomain}'): ${owner || 'null'}`);
    console.log(`   getDomainStatus shows canMint: ${status.canMint}`);
  } catch (error) {
    console.log(`❌ Non-existent domain test error:`, error.message);
  }

  console.log('\n✓ All tests completed!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
