const { Contract } = require('ethers');
const RegistryABI = require('../../abi/Registry.json');

/**
 * Registry contract wrapper
 * Handles TLD and subdomain registration, ownership, and metadata
 */
class Registry {
  /**
   * @param {string} address - Contract address
   * @param {ethers.Provider|ethers.Signer} providerOrSigner - Ethers provider or signer
   */
  constructor(address, providerOrSigner) {
    this.address = address;
    this.contract = new Contract(address, RegistryABI.abi, providerOrSigner);
  }

  // ==================== Read-only Functions ====================

  /**
   * Get the name of the NFT collection
   * @returns {Promise<string>}
   */
  async name() {
    return await this.contract.name();
  }

  /**
   * Get the symbol of the NFT collection
   * @returns {Promise<string>}
   */
  async symbol() {
    return await this.contract.symbol();
  }

  /**
   * Get total supply of registered names
   * @returns {Promise<bigint>}
   */
  async totalSupply() {
    return await this.contract.totalSupply();
  }

  /**
   * Get owner of a token
   * @param {number|string|bigint} tokenId - Token ID
   * @returns {Promise<string>} Owner address
   */
  async ownerOf(tokenId) {
    return await this.contract.ownerOf(tokenId);
  }

  /**
   * Get balance of an address
   * @param {string} address - Owner address
   * @returns {Promise<bigint>}
   */
  async balanceOf(address) {
    return await this.contract.balanceOf(address);
  }

  /**
   * Get token ID by name
   * @param {string} name - ODude name
   * @returns {Promise<bigint>}
   */
  async getTokenId(name) {
    return await this.contract.getTokenId(name);
  }

  /**
   * Get owner by name
   * @param {string} name - ODude name
   * @returns {Promise<string>} Owner address
   */
  async getOwnerByName(name) {
    return await this.contract.getOwnerByName(name);
  }

  /**
   * Get name by token ID
   * @param {number|string|bigint} tokenId - Token ID
   * @returns {Promise<string>}
   */
  async nameOf(tokenId) {
    return await this.contract.nameOf(tokenId);
  }

  /**
   * Get NFT metadata
   * @param {number|string|bigint} tokenId - Token ID
   * @returns {Promise<Object>} Metadata object with id, name, isTLD, parentTLD
   */
  async getNFTMetadata(tokenId) {
    const metadata = await this.contract.getNFTMetadata(tokenId);
    return {
      id: metadata.id,
      name: metadata.name,
      isTLD: metadata.isTLD,
      parentTLD: metadata.parentTLD
    };
  }

  /**
   * Get token URI
   * @param {number|string|bigint} tokenId - Token ID
   * @returns {Promise<string>}
   */
  async tokenURI(tokenId) {
    return await this.contract.tokenURI(tokenId);
  }

  /**
   * Get token by index
   * @param {number|string|bigint} index - Index
   * @returns {Promise<bigint>}
   */
  async tokenByIndex(index) {
    return await this.contract.tokenByIndex(index);
  }

  /**
   * Get token of owner by index
   * @param {string} owner - Owner address
   * @param {number|string|bigint} index - Index
   * @returns {Promise<bigint>}
   */
  async tokenOfOwnerByIndex(owner, index) {
    return await this.contract.tokenOfOwnerByIndex(owner, index);
  }

  /**
   * Get approved address for token
   * @param {number|string|bigint} tokenId - Token ID
   * @returns {Promise<string>}
   */
  async getApproved(tokenId) {
    return await this.contract.getApproved(tokenId);
  }

  /**
   * Check if operator is approved for all
   * @param {string} owner - Owner address
   * @param {string} operator - Operator address
   * @returns {Promise<boolean>}
   */
  async isApprovedForAll(owner, operator) {
    return await this.contract.isApprovedForAll(owner, operator);
  }

  /**
   * Get contract balance
   * @returns {Promise<bigint>}
   */
  async getBalance() {
    return await this.contract.getBalance();
  }

  /**
   * Check if contract is paused
   * @returns {Promise<boolean>}
   */
  async paused() {
    return await this.contract.paused();
  }

  /**
   * Get contract owner
   * @returns {Promise<string>}
   */
  async owner() {
    return await this.contract.owner();
  }

  /**
   * Get TLD contract address
   * @returns {Promise<string>}
   */
  async getTLDContract() {
    return await this.contract.getTLDContract();
  }

  /**
   * Get Resolver contract address
   * @returns {Promise<string>}
   */
  async getResolverContract() {
    return await this.contract.getResolverContract();
  }

  // ==================== Write Functions ====================

  /**
   * mintDomain a name (TLD or subdomain)
   * @param {number|string|bigint} tokenId - Token ID
   * @param {string} name - Name to mintDomain
   * @param {string} tokenUri - Token URI
   * @param {string} to - Recipient address
   * @param {Object} options - Transaction options (value, gasLimit, etc.)
   * @returns {Promise<Object>} Transaction response
   */
  async mintDomain(tokenId, name, tokenUri, to, options = {}) {
    return await this.contract.mintDomain(tokenId, name, tokenUri, to, options);
  }

  /**
   * Set reverse resolution for a token
   * @param {number|string|bigint} tokenId - Token ID
   * @param {Object} options - Transaction options
   * @returns {Promise<Object>} Transaction response
   */
  async setReverse(tokenId, options = {}) {
    return await this.contract.setReverse(tokenId, options);
  }

  /**
   * Set token URI
   * @param {number|string|bigint} tokenId - Token ID
   * @param {string} newTokenURI - New token URI
   * @param {Object} options - Transaction options
   * @returns {Promise<Object>} Transaction response
   */
  async setTokenURI(tokenId, newTokenURI, options = {}) {
    return await this.contract.setTokenURI(tokenId, newTokenURI, options);
  }

  /**
   * Approve address for token
   * @param {string} to - Address to approve
   * @param {number|string|bigint} tokenId - Token ID
   * @returns {Promise<Object>} Transaction response
   */
  async approve(to, tokenId) {
    return await this.contract.approve(to, tokenId);
  }

  /**
   * Set approval for all
   * @param {string} operator - Operator address
   * @param {boolean} approved - Approved status
   * @returns {Promise<Object>} Transaction response
   */
  async setApprovalForAll(operator, approved) {
    return await this.contract.setApprovalForAll(operator, approved);
  }

  /**
   * Transfer token
   * @param {string} from - From address
   * @param {string} to - To address
   * @param {number|string|bigint} tokenId - Token ID
   * @returns {Promise<Object>} Transaction response
   */
  async transferFrom(from, to, tokenId) {
    return await this.contract.transferFrom(from, to, tokenId);
  }

  /**
   * Safe transfer token
   * @param {string} from - From address
   * @param {string} to - To address
   * @param {number|string|bigint} tokenId - Token ID
   * @returns {Promise<Object>} Transaction response
   */
  async safeTransferFrom(from, to, tokenId) {
    return await this.contract['safeTransferFrom(address,address,uint256)'](from, to, tokenId);
  }

  // ==================== Events ====================

  /**
   * Listen to TLDMinted events
   * @param {Function} callback - Callback function
   */
  onTLDMinted(callback) {
    this.contract.on('TLDMinted', callback);
  }

  /**
   * Listen to SubdomainMinted events
   * @param {Function} callback - Callback function
   */
  onSubdomainMinted(callback) {
    this.contract.on('SubdomainMinted', callback);
  }

  /**
   * Listen to Transfer events
   * @param {Function} callback - Callback function
   */
  onTransfer(callback) {
    this.contract.on('Transfer', callback);
  }

  /**
   * Remove all listeners
   */
  removeAllListeners() {
    this.contract.removeAllListeners();
  }

  // ==================== Batch Operations ====================

  /**
   * Get multiple names by token IDs
   * @param {Array<number|string|bigint>} tokenIds - Array of token IDs
   * @returns {Promise<Array<string>>} Array of names
   */
  async getMultipleNames(tokenIds) {
    const promises = tokenIds.map(tokenId => this.nameOf(tokenId));
    return await Promise.all(promises);
  }

  /**
   * Get multiple owners by token IDs
   * @param {Array<number|string|bigint>} tokenIds - Array of token IDs
   * @returns {Promise<Array<string>>} Array of owner addresses
   */
  async getMultipleOwners(tokenIds) {
    const promises = tokenIds.map(tokenId => this.ownerOf(tokenId));
    return await Promise.all(promises);
  }

  /**
   * Get multiple token metadata
   * @param {Array<number|string|bigint>} tokenIds - Array of token IDs
   * @returns {Promise<Array<Object>>} Array of metadata objects
   */
  async getMultipleMetadata(tokenIds) {
    const promises = tokenIds.map(tokenId => this.getNFTMetadata(tokenId));
    return await Promise.all(promises);
  }

  /**
   * Get comprehensive info for multiple tokens
   * @param {Array<number|string|bigint>} tokenIds - Array of token IDs
   * @returns {Promise<Array<Object>>} Array of token info objects
   */
  async getMultipleTokenInfo(tokenIds) {
    const promises = tokenIds.map(async (tokenId) => {
      try {
        const [name, owner, metadata, tokenURI] = await Promise.all([
          this.nameOf(tokenId),
          this.ownerOf(tokenId),
          this.getNFTMetadata(tokenId),
          this.tokenURI(tokenId)
        ]);

        return {
          tokenId: tokenId.toString(),
          name,
          owner,
          metadata,
          tokenURI
        };
      } catch (error) {
        return {
          tokenId: tokenId.toString(),
          error: error.message
        };
      }
    });

    return await Promise.all(promises);
  }
}

module.exports = Registry;

