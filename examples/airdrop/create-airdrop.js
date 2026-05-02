/**
 * Create Airdrop Example
 * Demonstrates how to create an airdrop for a TLD using ERC20 tokens
 *
 * This example shows:
 * - Connecting to Base Sepolia network
 * - Checking ERC20 token balance and allowance
 * - Creating an airdrop for a specific TLD
 * - Verifying airdrop creation
 *
 * Usage: node examples/airdrop/create-airdrop.js
 */

// Load environment variables
require('dotenv').config();

const { ethers } = require('ethers');
const { getTokenInfo, ERC20_ABI } = require('./utils');

// ==================== CONFIGURATION VARIABLES ====================
// Update these variables to test with different values

const TOKEN_ADDRESS = process.env.USDC_CONTRACT || '0x036CbD53842c5426634e7929541eC2318f3dCF7e'; // USDC on Base Sepolia
const TLD_NAME = 'xxx';
const TOTAL_AMOUNT = '0.1'; // Total amount for airdrop (in tokens) - adjust based on your token balance
const PER_USER_SHARE = '0.01'; // Per user share (in tokens) - should be <= TOTAL_AMOUNT
const PRIVATE_KEY = process.env.ACCOUNT_2_PRIVATE_KEY; // Use ACCOUNT_2_PRIVATE_KEY from .env

// NOTE: To get test USDC tokens on Base Sepolia:
// 1. Visit a Base Sepolia faucet
// 2. Or use a DEX to swap ETH for USDC
// 3. Make sure you have enough tokens for the TOTAL_AMOUNT specified above

// ==================== MAIN FUNCTION ====================

async function main() {
  console.log('=== ODude Airdrop Creation Example ===\n');

  console.log('📋 Configuration:');
  console.log(`  Token Address: ${TOKEN_ADDRESS}`);
  console.log(`  TLD Name: ${TLD_NAME}`);
  console.log(`  Total Amount: ${TOTAL_AMOUNT} tokens`);
  console.log(`  Per User Share: ${PER_USER_SHARE} tokens`);
  console.log();

  // Check if ACCOUNT_2_PRIVATE_KEY is available
  if (!PRIVATE_KEY) {
    console.error('❌ ACCOUNT_2_PRIVATE_KEY not found in .env file!');
    console.log('Please add ACCOUNT_2_PRIVATE_KEY to your .env file');
    process.exit(1);
  }

  // Initialize SDK with ACCOUNT_2_PRIVATE_KEY
  const ODudeSDK = require('../../src/index');
  const sdk = new ODudeSDK({
    rpcUrl_sepolia: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
    privateKey: PRIVATE_KEY
  });

  try {
    sdk.connectNetwork('basesepolia');
    console.log('✅ Connected to Base Sepolia network');
  } catch (error) {
    console.error('❌ Failed to connect to Base Sepolia:', error.message);
    process.exit(1);
  }

  const provider = sdk.getProvider('basesepolia');
  const signer = sdk.getSigner('basesepolia');
  const walletAddress = signer?.address;

  if (!walletAddress) {
    console.error('❌ No wallet connected. Please check your private key.');
    process.exit(1);
  }

  console.log(`📱 Wallet Address: ${walletAddress}`);
  console.log(`📱 Expected Address: ${process.env.ACCOUNT_2}\n`);

  // ==================== STEP 1: TOKEN INFORMATION ====================
  console.log('--- Step 1: Token Information ---');

  const tokenInfo = await getTokenInfo(TOKEN_ADDRESS, provider);
  const tokenDecimals = tokenInfo.decimals;

  console.log(`✓ Token Details:`);
  console.log(`  Name: ${tokenInfo.name}`);
  console.log(`  Symbol: ${tokenInfo.symbol}`);
  console.log(`  Decimals: ${tokenDecimals}`);

  // ==================== STEP 2: CHECK TOKEN BALANCE ====================
  console.log('\n--- Step 2: Check Token Balance ---');

  const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
  const balance = await tokenContract.balanceOf(walletAddress);
  const balanceFormatted = ethers.formatUnits(balance, tokenDecimals);

  console.log(`✓ Token Balance: ${balanceFormatted} tokens`);

  const totalAmountWei = ethers.parseUnits(TOTAL_AMOUNT, tokenDecimals);

  if (balance < totalAmountWei) {
    console.error(`❌ Insufficient token balance!`);
    console.log(`  Required: ${TOTAL_AMOUNT} tokens`);
    console.log(`  Available: ${balanceFormatted} tokens`);
    console.log('\n💡 To get test tokens:');
    console.log('  1. Visit a Base Sepolia faucet for ETH');
    console.log('  2. Use a DEX to swap ETH for USDC');
    console.log('  3. Or modify TOTAL_AMOUNT and PER_USER_SHARE to smaller values');
    process.exit(1);
  }

  console.log(`✓ Sufficient balance available for airdrop`);

  // ==================== STEP 3: CHECK ALLOWANCE ====================
  console.log('\n--- Step 3: Check Token Allowance ---');
  
  const rwAirdropAddress = sdk.rwairdrop().address;
  console.log(`📍 RWAirdrop Contract: ${rwAirdropAddress}`);
  
  const allowance = await tokenContract.allowance(walletAddress, rwAirdropAddress);
  const allowanceFormatted = ethers.formatUnits(allowance, tokenDecimals);

  console.log(`✓ Current Allowance: ${allowanceFormatted} tokens`);

  if (allowance < totalAmountWei) {
    console.log(`⚠️  Insufficient allowance! Need to approve tokens.`);
    console.log(`  Required: ${TOTAL_AMOUNT} tokens`);
    console.log(`  Current: ${allowanceFormatted} tokens`);

    console.log('\n🔄 Approving tokens...');
    const tokenContractWithSigner = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);
    const approveTx = await tokenContractWithSigner.approve(rwAirdropAddress, totalAmountWei);
    console.log(`📝 Approval transaction: ${approveTx.hash}`);

    await approveTx.wait();
    console.log('✓ Token approval confirmed');

    // Verify new allowance
    const newAllowance = await tokenContract.allowance(walletAddress, rwAirdropAddress);
    const newAllowanceFormatted = ethers.formatUnits(newAllowance, tokenDecimals);
    console.log(`✓ New Allowance: ${newAllowanceFormatted} tokens`);
  } else {
    console.log(`✓ Sufficient allowance already approved`);
  }

  // ==================== STEP 4: VERIFY TLD EXISTS ====================
  console.log('\n--- Step 4: Verify TLD Exists ---');

  const tldExists = await sdk.resolver().nameExists(TLD_NAME);

  if (!tldExists) {
    console.error(`❌ TLD "${TLD_NAME}" does not exist!`);
    console.log('Please mint the TLD first or use an existing TLD name.');
    console.log('Use: node examples/TLDMint.js');
    process.exit(1);
  }

  console.log(`✓ TLD "${TLD_NAME}" exists and is ready for airdrop`);

  // Get TLD information
  const tldInfo = await sdk.getTldInfo(TLD_NAME);
  console.log(`  TLD Owner: ${tldInfo.getTLDOwner}`);
  console.log(`  TLD Token ID: ${tldInfo.tokenId}`);

  // ==================== STEP 5: CREATE AIRDROP ====================
  console.log('\n--- Step 5: Create Airdrop ---');

  const perUserShareWei = ethers.parseUnits(PER_USER_SHARE, tokenDecimals);

  console.log('🚀 Creating airdrop...');
  console.log(`  TLD: ${TLD_NAME}`);
  console.log(`  Token: ${TOKEN_ADDRESS}`);
  console.log(`  Total Amount: ${TOTAL_AMOUNT} tokens (${totalAmountWei.toString()} wei)`);
  console.log(`  Per User Share: ${PER_USER_SHARE} tokens (${perUserShareWei.toString()} wei)`);
  console.log(`  RWAirdrop Contract: ${sdk.rwairdrop().address}`);
  console.log(`  From Address: ${walletAddress}`);

  try {
    const createTx = await sdk.rwairdrop().createAirdrop(
      TLD_NAME,
      TOKEN_ADDRESS,
      totalAmountWei,
      perUserShareWei
    );

    console.log(`\n📝 Airdrop creation transaction submitted!`);
    console.log(`  Transaction Hash: ${createTx.hash}`);
    console.log(`  View on Block Explorer: https://sepolia.basescan.org/tx/${createTx.hash}`);
    console.log('⏳ Waiting for transaction confirmation...');

    const receipt = await createTx.wait();
    console.log('\n✓ Airdrop creation confirmed!');
    console.log(`  Block Number: ${receipt.blockNumber}`);
    console.log(`  Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(`  Status: ${receipt.status === 1 ? 'Success ✅' : 'Failed ❌'}`);

    if (receipt.status !== 1) {
      console.error('❌ Transaction failed! Check the block explorer for details.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Failed to create airdrop!');
    console.error(`  Error: ${error.message}`);
    if (error.data) {
      console.error(`  Error Data: ${error.data}`);
    }
    if (error.transaction) {
      console.error(`  Transaction: ${JSON.stringify(error.transaction, null, 2)}`);
    }
    throw error;
  }

  // ==================== STEP 6: VERIFY AIRDROP CREATION ====================
  console.log('\n--- Step 6: Verify Airdrop Creation ---');

  // Get airdrop count for the TLD
  const airdropCount = await sdk.rwairdrop().getTLDAirdropCount(TLD_NAME);
  console.log(`✓ Total airdrops for "${TLD_NAME}": ${airdropCount.toString()}`);

  if (airdropCount > 0) {
    // Get the latest airdrop (assuming it's the one we just created)
    const latestAirdropIndex = airdropCount - 1n;
    const airdropInfo = await sdk.rwairdrop().getAirdropInfoByTLD(TLD_NAME, latestAirdropIndex);

    console.log(`✓ Latest Airdrop Details (ID: ${latestAirdropIndex}):`);
    console.log(`  Token Address: ${airdropInfo.tokenAddress}`);
    console.log(`  Total Amount: ${ethers.formatUnits(airdropInfo.totalAmount, tokenDecimals)} tokens`);
    console.log(`  Per User Share: ${ethers.formatUnits(airdropInfo.perUserShare, tokenDecimals)} tokens`);
    console.log(`  Remaining Balance: ${ethers.formatUnits(airdropInfo.remainingBalance, tokenDecimals)} tokens`);
    console.log(`  Is Active: ${airdropInfo.isActive}`);
    console.log(`  Is Withdrawn: ${airdropInfo.isWithdrawn}`);

    // Verify it matches our parameters
    const expectedTotal = ethers.parseUnits(TOTAL_AMOUNT, tokenDecimals);
    const expectedPerUser = ethers.parseUnits(PER_USER_SHARE, tokenDecimals);

    if (airdropInfo.tokenAddress.toLowerCase() === TOKEN_ADDRESS.toLowerCase() &&
        airdropInfo.totalAmount === expectedTotal &&
        airdropInfo.perUserShare === expectedPerUser &&
        airdropInfo.isActive) {
      console.log('\n🎉 SUCCESS! Airdrop created successfully!');
      console.log(`✓ Airdrop ID: ${latestAirdropIndex}`);
      console.log(`✓ All parameters match expected values`);
      console.log(`✓ Airdrop is active and ready for claims`);
    } else {
      console.log('\n⚠️  Airdrop created but parameters may not match exactly');
    }
  } else {
    console.log('⚠️  No airdrops found - this might indicate an issue');
  }

  console.log('\n=== Airdrop Creation Complete ===');
  console.log('💡 Next steps:');
  console.log('  1. Users with domains in the TLD can now claim their shares');
  console.log('     Use: node examples/airdrop/claim-airdrop.js');
  console.log('  2. Check airdrop details:');
  console.log('     Use: node examples/airdrop/list-airdrops-by-tld.js');
  console.log('  3. Monitor claimable airdrops for a wallet:');
  console.log('     Use: node examples/airdrop/list-airdrops-by-wallet.js');
}

// Run the main function
main()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error.message);
    process.exit(1);
  });

