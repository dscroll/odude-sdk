/**
 * TLD Management Example
 * Demonstrates how to query TLD information and pricing
 */

const ODudeSDK = require('../src/index');

async function main() {
  console.log('=== ODude TLD Management Example ===\n');

  // Initialize SDK with Base Sepolia (the working network)
  const sdk = new ODudeSDK({
    rpcUrl_sepolia: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
  });

  try {
    sdk.connectNetwork('basesepolia');
    console.log('✓ Connected to Base Sepolia network\n');
  } catch (error) {
    console.log('❌ Failed to connect to Base Sepolia:', error.message);
    return;
  }

  // === Global TLD Settings ===
  console.log('--- Global TLD Settings ---');

  try {
    const baseTLDPrice = await sdk.tld().getBaseTLDPrice();
    const defaultCommission = await sdk.tld().getDefaultCommission();
    const registryContract = await sdk.tld().getRegistryContract();
    const owner = await sdk.tld().owner();

    console.log('Base TLD Price:', sdk.utils.formatEther(baseTLDPrice), 'ETH');
    console.log('Default Commission:', defaultCommission.toString(), '%');
    console.log('Registry Contract:', registryContract);
    console.log('Contract Owner:', owner);
  } catch (error) {
    console.log('Failed to get TLD settings:', error.message);
  }
  console.log();

  // === Check Specific TLDs ===
  console.log('--- Checking Specific TLDs ---');
  
  // Get total supply from registry to know how many TLDs exist
  try {
    const totalSupply = await sdk.registry().totalSupply();
    console.log('Total Names Registered:', totalSupply.toString());
    console.log();

    let i=1759685237;
    try {
      console.log(`--- Token ID ${i} ---`);

      // Get metadata from registry
      const metadata = await sdk.registry().getNFTMetadata(i);
      console.log('Name:', metadata.name);
      console.log('Is TLD:', metadata.isTLD);
      console.log('Parent TLD:', metadata.parentTLD.toString());

      if (metadata.isTLD) {
        // Get TLD-specific information
        const tldPrice = await sdk.tld().getTLDPrice(i);
        console.log('Price:', sdk.utils.formatEther(tldPrice), 'ETH');


      }
    } catch (tokenError) {
      console.log(`Token ID ${i} not found or error:`, tokenError.message);
    }
    
  } catch (error) {
    console.log('Failed to get registry information:', error.message);
  }

  // === Calculate Subdomain Costs ===
  console.log('--- Subdomain Cost Calculation ---');
  
  // Example: Calculate cost for registering a subdomain under a TLD
  const exampleTLDId = 1759685237;
  
  try {
    const tldPrice = await sdk.tld().getTLDPrice(exampleTLDId);
    const commission = await sdk.tld().getCommission(exampleTLDId);
    const tldOwner = await sdk.tld().getTLDOwner(exampleTLDId);

    console.log('TLD Owner:', tldOwner);

    const isActive = await sdk.tld().isTLDActive(exampleTLDId);
    console.log('TLD Active:', isActive);

    console.log(`For TLD Token ID ${exampleTLDId}:`);
    console.log('Subdomain Price:', sdk.utils.formatEther(tldPrice), 'ETH');
    console.log('Commission Rate:', commission.toString(), '%');

    // Calculate split
    const commissionAmount = (tldPrice * commission) / 100n;
    const ownerAmount = tldPrice - commissionAmount;

    console.log('\nPayment Split:');
    console.log('  TLD Owner receives:', sdk.utils.formatEther(ownerAmount), 'ETH');
    console.log('  Platform receives:', sdk.utils.formatEther(commissionAmount), 'ETH');
  } catch (error) {
    console.log('Error calculating costs:', error.message);
  }

  console.log('\n--- Name Parsing Examples (@ Format) ---');

  const exampleNames = [
    'crypto',           // TLD name
    'demo@crypto',      // Subdomain on crypto TLD
    'test@bnb',         // Subdomain on bnb TLD (maps to BNB network)
    'test@binance'      // Subdomain on binance TLD (maps to BNB network)
  ];

  for (const name of exampleNames) {
    const parsed = sdk.utils.parseName(name);
    console.log(`\n"${name}":`);
    console.log('  TLD:', parsed.tld);
    console.log('  Subdomain:', parsed.subdomain || 'N/A');
    console.log('  Is TLD:', parsed.isTLD);
    console.log('  Parts:', parsed.parts.join(' → '));

    // Show which network this would route to
    if (name.includes('@')) {
      const tld = name.split('@')[1];
      const network = sdk.getNetworkForTLD(tld);
      console.log('  Target Network:', network);
    }
  }

  console.log('\n✓ Example completed!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

