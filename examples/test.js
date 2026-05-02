//** node examples/test.js */

const ODudeSDK = require('../src/index');

async function main() {
  console.log('=== ODude SDK Test Example ===\n');

  // Initialize SDK with multi-network support
  const sdk = new ODudeSDK({
    rpcUrl_filecoin: process.env.FILECOIN_RPC_URL,
    rpcUrl_bnb: process.env.BNB_RPC_URL,
    rpcUrl_sepolia: process.env.BASE_SEPOLIA_RPC_URL,
    rpcUrl: process.env.LOCALHOST_RPC_URL || 'http://127.0.0.1:8545',
  });

  try {
    sdk.connectNetwork('basesepolia');
    console.log('✓ Connected to Base Sepolia network');
  } catch (error) {
    console.log('❌ Failed to connect to Base Sepolia network:', error.message);

    return;
  }

  try {
    const name = 'test@xxx';
    const exists = await sdk.resolver().nameExists(name);
    console.log(`Name ${name} exists: ${exists}`);

    if (!exists) {
      const normalized = sdk.utils.normalizeName(name);
      const parsed = sdk.utils.parseName(normalized);
      //get subdomain from parsed
      const tld = parsed.tld;
      console.log(`TLD: ${tld}`);

      //Check if TLD exists
      const tld_address = await sdk.resolver().nameExists(tld);
      if (tld_address) {
        console.log(`TLDName ${tld} is already registered`);
        console.log('Lets check requisite to mint ' + name);
        
        //Get the id of tld
        const tokenId = await sdk.registry().getTokenId(tld);
        console.log('TLD Token ID:', tokenId.toString());

        const tldPrice = await sdk.tld().getTLDPrice(tokenId);
        console.log('TLD Price:', sdk.utils.formatEther(tldPrice), 'ETH');
       
        //Get getTLDToken
        const tldToken = await sdk.tld().getTLDToken(tokenId);
        console.log('TLD Token:', tldToken);


        //checkMintEligibility
        const eligibility = await sdk.checkMintEligibility(name);
        console.log('Eligibility:', eligibility);

        //getNFTMetadata
        const metadata = await sdk.registry().getNFTMetadata(tokenId);
        console.log('Metadata:', metadata);

        //getNameInfo
        const nameInfo = await sdk.getNameInfo(tld);
        console.log('Name Info:', nameInfo);    


      } else {


        console.log(`TLDName ${tld} is available: ${!tld_address}`);
        console.log('TLD should be minted before minting ' + name);
        
        const baseTLDPrice = await sdk.tld().getBaseTLDPrice();
        console.log(
          'Base TLD Price:',
          sdk.utils.formatEther(baseTLDPrice),
          'ETH'
        );
        const registryContract = await sdk.tld().getRegistryContract();
        console.log('Registry Contract:', registryContract);

        console.log('Minting TLD...');
        //Lets mint the tld
        const tx = await sdk.tld().mintDomain(tld, '0x...');
        await tx.wait();
      }
    } else {
      console.log(`Name ${name} is not available`);
    }
  } catch (error) {
    console.log('❌ Failed to check name availability:', error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
