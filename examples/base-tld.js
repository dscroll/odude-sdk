// Set setBaseTLDPrice for tld
const ODudeSDK = require('../src/index');

async function main() {
  console.log('=== ODude TLD Management Example ===\n');

  // Initialize SDK with Base Sepolia (the working network)
  const sdk = new ODudeSDK({
    rpcUrl_sepolia: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
    rpcUrl: process.env.LOCALHOST_RPC_URL || 'http://127.0.0.1:8545'
  });

  try {
    sdk.connectNetwork('basesepolia');
    console.log('✓ Connected to Base Sepolia network\n');
  } catch (error) {
    console.log('❌ Failed to connect to Base Sepolia:', error.message);
    return;
  }

  // === Global TLD Settings ===    
  try {
    const baseTLDPrice = await sdk.tld().getBaseTLDPrice();
    console.log('Base TLD Price:', sdk.utils.formatEther(baseTLDPrice), 'ETH');
  } catch (error) {
    console.log('Failed to get TLD settings:', error.message);
  }
  console.log();

  // === Set Base TLD Price ===
  try {
    const tx = await sdk.tld().setBaseTLDPrice(sdk.utils.parseEther('0.011'));
    await tx.wait();
    console.log('✓ Base TLD price set to 0.011 ETH');
  } catch (error) {
    console.log('❌ Failed to set base TLD price:', error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });


