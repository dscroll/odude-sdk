const { Contract } = require('ethers');
const TLDABI = require('../../abi/TLD.json');
const { MintingError, TokenNotFoundError } = require('../utils/errors');

/**
 * TLD contract wrapper
 * Handles TLD pricing, commission, and configuration
 */
class TLD {
  /**
   * @param {string} address - Contract address
   * @param {ethers.Provider|ethers.Signer} providerOrSigner - Ethers provider or signer
   */
  constructor(address, providerOrSigner) {
    this.address = address;
    this.contract = new Contract(address, TLDABI.abi, providerOrSigner);
  }

  // ==================== Read-only Functions ====================

  /**
   * Get base TLD price
   * @returns {Promise<bigint>} Price in wei
   */
  async getBaseTLDPrice() {
    return await this.contract.getBaseTLDPrice();
  }

  /**
   * Get TLD price for a specific TLD token
   * @param {number|string|bigint} tldTokenId - TLD token ID
   * @returns {Promise<bigint>} Price in wei
   */
  async getTLDPrice(tldTokenId) {
    return await this.contract.getTLDPrice(tldTokenId);
  }

  /**
   * Get commission rate for a TLD
   * @param {number|string|bigint} tldTokenId - TLD token ID
   * @returns {Promise<bigint>} Commission percentage
   */
  async getCommission(tldTokenId) {
    return await this.contract.getTLDCommission(tldTokenId);
  }

  /**
   * Get TLD owner address
   * @param {number|string|bigint} tldTokenId - TLD token ID
   * @returns {Promise<string>} Owner address
   */
  async getTLDOwner(tldTokenId) {
    return await this.contract.getTLDOwner(tldTokenId);
  }

  /**
   * Get all TLD token IDs owned by an address
   * @param {string} owner - Owner address
   * @returns {Promise<bigint[]>} Array of TLD token IDs
   */
  async getTLDsByOwner(owner) {
    return await this.contract.getTLDsByOwner(owner);
  }



  /**
   * Get ERC token address for a TLD
   * @param {number|string|bigint} tldTokenId - TLD token ID
   * @returns {Promise<string>} ERC token address
   */
  async getErcToken(tldTokenId) {
    return await this.contract.getTLDToken(tldTokenId);
  }


  /**
   * Get TLD token address for a TLD
   * @param {number|string|bigint} tldTokenId - TLD token ID
   * @returns {Promise<string>} TLD token address
   */
  async getTLDToken(tldTokenId) {
    return await this.contract.getTLDToken(tldTokenId);
  }

  /**
   * Get comprehensive TLD information
   * @param {number|string|bigint} tldTokenId - TLD token ID
   * @returns {Promise<Object>} TLD information
   */
  async getTLD(tldTokenId) {
    return await this.contract.getTLD(tldTokenId);
  }

  /**
   * Get TLD ID by name
   * @param {string} tldName - TLD name
   * @returns {Promise<bigint>} TLD token ID
   */
  async getTLDId(tldName) {
    return await this.contract.getTLDId(tldName);
  }

  /**
   * Check if TLD exists
   * @param {number|string|bigint} tldTokenId - TLD token ID
   * @returns {Promise<boolean>} True if TLD exists
   */
  async tldExists(tldTokenId) {
    return await this.contract.tldExists(tldTokenId);
  }

  /**
   * Check if a TLD exists (active)
   * @param {number|string|bigint} tldTokenId - TLD token ID
   * @returns {Promise<boolean>}
   */
  async isTLDActive(tldTokenId) {
    return await this.contract.tldExists(tldTokenId);
  }

  /**
   * Get TLD name by token ID
   * @param {number|string|bigint} tldTokenId - TLD token ID
   * @returns {Promise<string>}
   */
  async getTLDName(tldTokenId) {
    const tld = await this.contract.getTLD(tldTokenId);
    return tld.name;
  }

  /**
   * Get default commission rate
   * @returns {Promise<bigint>}
   */
  async getDefaultCommission() {
    return await this.contract.getDefaultCommission();
  }

  /**
   * Get Registry contract address
   * @returns {Promise<string>}
   */
  async getRegistryContract() {
    return await this.contract.getRegistryContract();
  }

  /**
   * Get contract owner
   * @returns {Promise<string>}
   */
  async owner() {
    return await this.contract.owner();
  }

  // ==================== Write Functions ====================

  /**
   * Set base TLD price (only owner)
   * @param {bigint|string} price - Price in wei
   * @returns {Promise<Object>} Transaction response
   */
  async setBaseTLDPrice(price) {
    return await this.contract.setBaseTLDPrice(price);
  }

  /**
   * Set TLD price for a specific TLD (only TLD owner)
   * @param {number|string|bigint} tldTokenId - TLD token ID
   * @param {bigint|string} price - Price in wei
   * @returns {Promise<Object>} Transaction response
   */
  async setTLDPrice(tldTokenId, price) {
    return await this.contract.setTLDPrice(tldTokenId, price);
  }

  /**
   * Set commission for a TLD (only TLD owner)
   * @param {number|string|bigint} tldTokenId - TLD token ID
   * @param {number|string|bigint} commission - Commission percentage
   * @returns {Promise<Object>} Transaction response
   */
  async setCommission(tldTokenId, commission) {
    return await this.contract.setTLDCommission(tldTokenId, commission);
  }



  /**
   * Set ERC token address for a TLD (only TLD owner)
   * @param {number|string|bigint} tldTokenId - TLD token ID
   * @param {string} ercAddress - ERC token address
   * @returns {Promise<Object>} Transaction response
   */
  async setErcToken(tldTokenId, ercAddress) {
    return await this.contract.setTLDToken(tldTokenId, ercAddress);
  }




  /**
   * Set default commission (only owner)
   * @param {number|string|bigint} commission - Commission percentage
   * @returns {Promise<Object>} Transaction response
   */
  async setDefaultCommission(commission) {
    return await this.contract.setDefaultCommission(commission);
  }

  /**
   * Set Registry contract address (only owner)
   * @param {string} registryContract - Registry contract address
   * @returns {Promise<Object>} Transaction response
   */
  async setRegistryContract(registryContract) {
    return await this.contract.setRegistryContract(registryContract);
  }

  /**
   * Register a new TLD configuration (called by Registry)
   * @param {number|string|bigint} tldTokenId - TLD token ID
   * @param {string} tldName - TLD name
   * @param {string} owner - TLD owner address
   * @returns {Promise<Object>} Transaction response
   */
  async registerTLD(tldTokenId, tldName, owner) {
    return await this.contract.registerTLD(tldTokenId, tldName, owner);
  }

  /**
   * Synchronize TLD ownership (called by Registry or Owner)
   * @param {number|string|bigint} tldTokenId - TLD token ID
   * @param {string} newOwner - New owner address
   * @returns {Promise<Object>} Transaction response
   */
  async syncTLDOwnership(tldTokenId, newOwner) {
    return await this.contract.syncTLDOwnership(tldTokenId, newOwner);
  }

  /**
   * Transfer contract ownership (only owner)
   * @param {string} newOwner - New owner address
   * @returns {Promise<Object>} Transaction response
   */
  async transferOwnership(newOwner) {
    return await this.contract.transferOwnership(newOwner);
  }

  /**
   * Renounce contract ownership (only owner)
   * @returns {Promise<Object>} Transaction response
   */
  async renounceOwnership() {
    return await this.contract.renounceOwnership();
  }

  // ==================== Domain Minting Functions ====================

  /**
   * Mint a domain under a TLD
   * Note: This method requires a Registry contract instance to perform the actual minting
   * @param {string} domainName - Full domain name (e.g., "alice@fil")
   * @param {string} toAddress - Address to mint the domain to
   * @param {Object} options - Minting options
   * @param {bigint|string} options.value - ETH value to send (for payment)
   * @param {number} options.gasLimit - Gas limit (optional)
   * @param {Object} registryContract - Registry contract instance (required for minting)
   * @returns {Promise<Object>} Transaction response
   * @throws {MintingError} When minting fails
   */
  async mintDomain(domainName, toAddress, options = {}, registryContract = null) {
    try {
      if (!domainName || typeof domainName !== 'string') {
        throw new MintingError('Invalid domain name provided', domainName);
      }

      if (!toAddress || typeof toAddress !== 'string') {
        throw new MintingError('Invalid address provided', domainName);
      }

      if (!registryContract) {
        throw new MintingError('Registry contract is required for domain minting', domainName);
      }

      // Check eligibility first
      const eligibility = await this.checkMintEligibility(domainName);
      if (!eligibility.eligible) {
        throw new MintingError(`Domain not eligible for minting: ${eligibility.reason}`, domainName);
      }

      // Generate a token ID for the domain using the helper function
      const { randomTokenId } = require('../utils/helpers');
      const tokenId = randomTokenId();

      // Create a basic metadata URI (this could be enhanced)
      const tokenUri = `https://metadata.odude.com/${domainName}`;

      const txOptions = {};

      if (options.value) {
        txOptions.value = options.value;
      }

      if (options.gasLimit) {
        txOptions.gasLimit = options.gasLimit;
      }

      // Use Registry contract to mint the domain
      return await registryContract.mintDomain(tokenId, domainName, tokenUri, toAddress, txOptions);
    } catch (error) {
      if (error instanceof MintingError) {
        throw error;
      }
      throw new MintingError(`Failed to mint domain: ${error.message}`, domainName);
    }
  }

  /**
   * Estimate the cost to mint a domain
   * @param {string} domainName - Full domain name (e.g., "alice@fil")
   * @returns {Promise<bigint>} Estimated cost in wei
   */
  async estimateMintCost(domainName) {
    // Since the smart contract doesn't have estimateMintCost, we'll get the TLD price
    try {
      const tld = domainName.split('@').pop();
      const tldTokenId = await this.contract.getTLDId(tld);
      return await this.contract.getTLDPrice(tldTokenId);
    } catch (error) {
      throw new Error(`Failed to estimate mint cost for ${domainName}: ${error.message}`);
    }
  }

  /**
   * Check if a domain is eligible for minting
   * @param {string} domainName - Full domain name (e.g., "alice@fil")
   * @param {Object} resolverContract - Resolver contract instance
   * @returns {Promise<Object>} Eligibility information
   */
  async checkMintEligibility(domainName, resolverContract = null) {
    try {
      const tld = domainName.split('@').pop();

      // Check if this is a TLD minting (no @ symbol) or subdomain minting
      const isTLDMinting = !domainName.includes('@');

      if (isTLDMinting) {
        // For TLD minting, check base TLD price and availability
        const baseTLDPrice = await this.contract.getBaseTLDPrice();

        // Check if TLD already exists
        let tldExists = false;
        try {
          const tldTokenId = await this.contract.getTLDId(domainName);
          tldExists = await this.contract.tldExists(tldTokenId);
        } catch (error) {
          // TLD doesn't exist yet, which is good for minting
          tldExists = false;
        }

        return {
          eligible: !tldExists,
          available: !tldExists,
          tldActive: true, // Not applicable for TLD minting
          cost: baseTLDPrice,
          reason: tldExists ? 'TLD already exists' : 'Eligible for TLD minting'
        };
      } else {
        // For subdomain minting, use existing logic
        const tldTokenId = await this.contract.getTLDId(tld);

        const [isAvailable, tldActive, tldPrice] = await Promise.all([
          resolverContract ? !await resolverContract.nameExists(domainName) : true,
          this.contract.tldExists(tldTokenId),
          this.contract.getTLDPrice(tldTokenId)
        ]);

        return {
          eligible: isAvailable && tldActive,
          available: isAvailable,
          tldActive: tldActive,
          cost: tldPrice,
          reason: !isAvailable ? 'Domain already taken' :
            !tldActive ? 'TLD not active' :
              'Eligible for minting'
        };
      }
    } catch (error) {
      return {
        eligible: false,
        available: false,
        tldActive: false,
        cost: 0n,
        reason: 'Error checking eligibility: ' + error.message
      };
    }
  }

  /**
   * Check if TLD is active for a domain
   * @private
   * @param {string} domainName - Full domain name
   * @returns {Promise<boolean>} True if TLD is active
   */
  async _checkTLDActive(domainName) {
    try {
      const tld = domainName.split('@').pop();
      const tldTokenId = await this.contract.getTLDId(tld);
      return await this.contract.tldExists(tldTokenId);
    } catch (error) {
      return false;
    }
  }

  // ==================== Events ====================

  /**
   * Listen to TLDPriceSet events
   * @param {Function} callback - Callback function
   */
  onTLDPriceSet(callback) {
    this.contract.on('TLDPriceSet', callback);
  }

  /**
   * Listen to TLDCommissionSet events
   * @param {Function} callback - Callback function
   */
  onCommissionSet(callback) {
    this.contract.on('TLDCommissionSet', callback);
  }

  /**
   * Listen to TLDOwnershipTransferred events
   * @param {Function} callback - Callback function
   */
  onTLDOwnershipTransferred(callback) {
    this.contract.on('TLDOwnershipTransferred', callback);
  }

  /**
   * Remove all listeners
   */
  removeAllListeners() {
    this.contract.removeAllListeners();
  }
}

module.exports = TLD;

