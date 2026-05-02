// node examples\addr-test.js
// used to test contract addresses 

const ODudeSDK = require('../src/index');

const wallet_address = '0xaa481F8d2d966e5fCC0446fA459F5d580AE5ea9f'; // Replace with your wallet address

async function main() {

  // Initialize SDK
  const sdk = new ODudeSDK({
    rpcUrl_sepolia: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
  });
  try {
    sdk.connectNetwork('basesepolia');
    console.log('✓ Connected to Base Sepolia network\n');
    //print connected contract address
    console.log('Registry Address:', sdk.registry().address);
    console.log('Resolver Address:', sdk.resolver().address);
    console.log('TLD Address:', sdk.tld().address);
    console.log('RWAirdrop Address:', sdk.rwairdrop().address);
  } catch (error) {
    console.log('❌ Failed to connect to Base Sepolia:', error.message);
    return;
  }

  try {

const totalNames = await sdk.getTotalNames(wallet_address);
 console.log('Total names owned:', totalNames.toString());
  } catch (error) {
    console.log('❌ Failed to get total names:', error.message);
    return;
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