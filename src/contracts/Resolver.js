const { Contract } = require('ethers');
const ResolverABI = require('../../abi/Resolver.json');

/**
 * Resolver contract wrapper
 * Handles name resolution and reverse resolution
 */
class Resolver {
  /**
   * @param {string} address - Contract address
   * @param {ethers.Provider|ethers.Signer} providerOrSigner - Ethers provider or signer
   */
  constructor(address, providerOrSigner) {
    this.address = address;
    this.contract = new Contract(address, ResolverABI.abi, providerOrSigner);
  }

  // ==================== Read-only Functions ====================

  /**
   * Resolve a name to an address
   * @param {string} name - ODude name
   * @returns {Promise<string>} Resolved address
   */
  async resolve(name) {
    return await this.contract.resolve(name);
  }

  /**
   * Reverse resolve an address to a name
   * @param {string} address - Ethereum address
   * @returns {Promise<string>} Primary name
   */
  async reverse(address) {
    return await this.contract.reverse(address);
  }

  /**
   * Check if a name exists
   * @param {string} name - ODude name
   * @returns {Promise<boolean>}
   */
  async nameExists(name) {
    return await this.contract.nameExists(name);
  }

  /**
   * Check if an address has a reverse record
   * @param {string} address - Ethereum address
   * @returns {Promise<boolean>}
   */
  async hasReverse(address) {
    return await this.contract.hasReverse(address);
  }

  /**
   * Get token ID for a name
   * @param {string} name - ODude name
   * @returns {Promise<bigint>}
   */
  async getTokenId(name) {
    return await this.contract.getTokenId(name);
  }

  /**
   * Get name for a token ID
   * @param {number|string|bigint} tokenId - Token ID
   * @returns {Promise<string>}
   */
  async getName(tokenId) {
    return await this.contract.getName(tokenId);
  }

  /**
   * Get resolution record for a name
   * @param {string} name - ODude name
   * @returns {Promise<Object>} Resolution record with resolvedAddress, name, tokenId, exists
   */
  async getResolutionRecord(name) {
    const record = await this.contract.getResolutionRecord(name);
    return {
      resolvedAddress: record.resolvedAddress,
      name: record.name,
      tokenId: record.tokenId,
      exists: record.exists
    };
  }

  /**
   * Get reverse record for an address
   * @param {string} address - Ethereum address
   * @returns {Promise<Object>} Reverse record with primaryName, primaryTokenId, exists
   */
  async getReverseRecord(address) {
    const record = await this.contract.getReverseRecord(address);
    return {
      primaryName: record.primaryName,
      primaryTokenId: record.primaryTokenId,
      exists: record.exists
    };
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
   * Set name record (only callable by Registry or owner)
   * @param {string} name - ODude name
   * @param {string} resolvedAddress - Address to resolve to
   * @param {number|string|bigint} tokenId - Token ID
   * @returns {Promise<Object>} Transaction response
   */
  async setNameRecord(name, resolvedAddress, tokenId) {
    return await this.contract.setNameRecord(name, resolvedAddress, tokenId);
  }

  /**
   * Set reverse record (only callable by Registry or owner)
   * @param {string} addr - Ethereum address
   * @param {string} name - ODude name
   * @param {number|string|bigint} tokenId - Token ID
   * @returns {Promise<Object>} Transaction response
   */
  async setReverse(addr, name, tokenId) {
    return await this.contract.setReverse(addr, name, tokenId);
  }

  /**
   * Remove name record (only callable by Registry or owner)
   * @param {string} name - ODude name
   * @returns {Promise<Object>} Transaction response
   */
  async removeNameRecord(name) {
    return await this.contract.removeNameRecord(name);
  }

  /**
   * Remove reverse record (only callable by Registry or owner)
   * @param {string} address - Ethereum address
   * @returns {Promise<Object>} Transaction response
   */
  async removeReverse(address) {
    return await this.contract.removeReverse(address);
  }

  /**
   * Set Registry contract address (only owner)
   * @param {string} registryContract - Registry contract address
   * @returns {Promise<Object>} Transaction response
   */
  async setRegistryContract(registryContract) {
    return await this.contract.setRegistryContract(registryContract);
  }

  // ==================== Events ====================

  /**
   * Listen to NameResolved events
   * @param {Function} callback - Callback function
   */
  onNameResolved(callback) {
    this.contract.on('NameResolved', callback);
  }

  /**
   * Listen to ReverseSet events
   * @param {Function} callback - Callback function
   */
  onReverseSet(callback) {
    this.contract.on('ReverseSet', callback);
  }

  /**
   * Listen to ReverseRemoved events
   * @param {Function} callback - Callback function
   */
  onReverseRemoved(callback) {
    this.contract.on('ReverseRemoved', callback);
  }

  /**
   * Remove all listeners
   */
  removeAllListeners() {
    this.contract.removeAllListeners();
  }

  // ==================== Batch Operations ====================

  /**
   * Resolve multiple names to addresses
   * @param {Array<string>} names - Array of ODude names
   * @returns {Promise<Array<Object>>} Array of resolution results
   */
  async resolveMultiple(names) {
    const promises = names.map(async (name) => {
      try {
        const address = await this.resolve(name);
        return {
          name,
          address,
          resolved: true
        };
      } catch (error) {
        return {
          name,
          address: null,
          resolved: false,
          error: error.message
        };
      }
    });

    return await Promise.all(promises);
  }

  /**
   * Reverse resolve multiple addresses to names
   * @param {Array<string>} addresses - Array of Ethereum addresses
   * @returns {Promise<Array<Object>>} Array of reverse resolution results
   */
  async reverseMultiple(addresses) {
    const promises = addresses.map(async (address) => {
      try {
        const name = await this.reverse(address);
        return {
          address,
          name,
          resolved: true
        };
      } catch (error) {
        return {
          address,
          name: null,
          resolved: false,
          error: error.message
        };
      }
    });

    return await Promise.all(promises);
  }

  /**
   * Get resolution records for multiple names
   * @param {Array<string>} names - Array of ODude names
   * @returns {Promise<Array<Object>>} Array of resolution records
   */
  async getMultipleResolutionRecords(names) {
    const promises = names.map(async (name) => {
      try {
        const record = await this.getResolutionRecord(name);
        return {
          name,
          ...record
        };
      } catch (error) {
        return {
          name,
          exists: false,
          resolvedAddress: null,
          error: error.message
        };
      }
    });

    return await Promise.all(promises);
  }

  /**
   * Check if multiple names exist
   * @param {Array<string>} names - Array of ODude names
   * @returns {Promise<Array<Object>>} Array of existence results
   */
  async checkMultipleNamesExist(names) {
    const promises = names.map(async (name) => {
      try {
        const exists = await this.nameExists(name);
        return {
          name,
          exists
        };
      } catch (error) {
        return {
          name,
          exists: false,
          error: error.message
        };
      }
    });

    return await Promise.all(promises);
  }
}

module.exports = Resolver;

