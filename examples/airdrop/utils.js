/**
 * Shared Utility Functions for Airdrop Examples
 * 
 * This module provides common functions used across airdrop examples to avoid code duplication.
 */

const { ethers } = require('ethers');

// ==================== ERC20 TOKEN ABI ====================
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)'
];

/**
 * Get token information (name, symbol, decimals)
 * @param {string} tokenAddress - The ERC20 token contract address
 * @param {ethers.Provider} provider - The ethers provider
 * @returns {Promise<{name: string, symbol: string, decimals: number, contract: ethers.Contract}>}
 */
async function getTokenInfo(tokenAddress, provider) {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const [name, symbol, decimals] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals()
    ]);

    return {
      name,
      symbol,
      decimals: Number(decimals),
      contract: tokenContract
    };
  } catch (error) {
    console.log(`⚠️  Could not fetch token information for ${tokenAddress}:`, error.message);
    return {
      name: 'Unknown',
      symbol: 'UNK',
      decimals: 18,
      contract: null
    };
  }
}

/**
 * Initialize SDK and connect to Base Sepolia network
 * @param {boolean} requirePrivateKey - Whether a private key is required
 * @returns {Promise<{sdk: ODudeSDK, walletAddress?: string}>}
 */
async function initializeSDK(requirePrivateKey = false) {
  const ODudeSDK = require('../../src/index');
  
  if (requirePrivateKey && !process.env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY not found in .env file. Please add your private key.');
  }

  const sdk = new ODudeSDK({
    rpcUrl_sepolia: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
    privateKey: requirePrivateKey ? process.env.PRIVATE_KEY : undefined
  });

  try {
    sdk.connectNetwork('basesepolia');
    console.log('✅ Connected to Base Sepolia network');
  } catch (error) {
    throw new Error(`Failed to connect to Base Sepolia: ${error.message}`);
  }

  // Get wallet address from the signer for the connected network
  const signer = sdk.getSigner('basesepolia');
  const walletAddress = signer?.address;

  if (requirePrivateKey && !walletAddress) {
    throw new Error('No wallet connected. Please provide a valid private key in .env file');
  }

  return { sdk, walletAddress };
}

/**
 * Get user domains in a specific TLD with fallback to getNamesList
 * @param {ODudeSDK} sdk - The ODude SDK instance
 * @param {string} walletAddress - The wallet address to check
 * @param {string} tldName - The TLD name to filter by
 * @returns {Promise<string[]>} Array of domain names
 */
async function getUserDomainsInTLD(sdk, walletAddress, tldName) {
  try {
    // First try the RWAirdrop method
    const rwairdropDomains = await sdk.rwairdrop().getUserDomainsInTLD(walletAddress, tldName);
    
    if (rwairdropDomains.length > 0) {
      return rwairdropDomains;
    }
    
    // Fallback: Use getNamesList and filter for the TLD
    const allNames = await sdk.getNamesList(walletAddress);
    return allNames
      .map(nameInfo => nameInfo.name)
      .filter(name => name.endsWith(`@${tldName}`));
  } catch (error) {
    console.log(`⚠️  Error getting user domains: ${error.message}`);
    return [];
  }
}

/**
 * Display airdrop information in a formatted way
 * @param {Object} airdropInfo - Airdrop information object
 * @param {number} airdropIndex - The airdrop index
 * @param {Object} tokenInfo - Token information object
 */
function displayAirdropInfo(airdropInfo, airdropIndex, tokenInfo) {
  console.log(`\n📦 Airdrop ${airdropIndex} Details:`);
  console.log(`  Token Address: ${airdropInfo.tokenAddress}`);
  console.log(`  Token Name: ${tokenInfo.name}`);
  console.log(`  Token Symbol: ${tokenInfo.symbol}`);
  console.log(`  Total Amount: ${ethers.formatUnits(airdropInfo.totalAmount, tokenInfo.decimals)} ${tokenInfo.symbol}`);
  console.log(`  Per User Share: ${ethers.formatUnits(airdropInfo.perUserShare, tokenInfo.decimals)} ${tokenInfo.symbol}`);
  console.log(`  Remaining Balance: ${ethers.formatUnits(airdropInfo.remainingBalance, tokenInfo.decimals)} ${tokenInfo.symbol}`);
  console.log(`  Is Active: ${airdropInfo.isActive ? '✅ Yes' : '❌ No'}`);
  console.log(`  Is Withdrawn: ${airdropInfo.isWithdrawn ? '✅ Yes' : '❌ No'}`);
}

/**
 * Display claimable airdrop information
 * @param {Object} airdrop - Claimable airdrop object
 * @param {number} index - The airdrop index in the list
 * @param {Object} tokenInfo - Token information object
 */
function displayClaimableAirdrop(airdrop, index, tokenInfo) {
  console.log(`\n  ${index + 1}. Airdrop Details:`);
  console.log(`    TLD: ${airdrop.tldName}`);
  console.log(`    Airdrop ID: ${airdrop.airdropId.toString()}`);
  console.log(`    Token Address: ${airdrop.tokenAddress}`);
  console.log(`    Token Name: ${tokenInfo.name}`);
  console.log(`    Token Symbol: ${tokenInfo.symbol}`);
  console.log(`    Per User Share: ${ethers.formatUnits(airdrop.perUserShare, tokenInfo.decimals)} ${tokenInfo.symbol}`);
  console.log(`    Can Claim: ${airdrop.canClaim ? '✅ Yes' : '❌ No'}`);
}

module.exports = {
  ERC20_ABI,
  getTokenInfo,
  initializeSDK,
  getUserDomainsInTLD,
  displayAirdropInfo,
  displayClaimableAirdrop
};

