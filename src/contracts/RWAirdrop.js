const { Contract } = require('ethers');
const RWAirdropABI = require('../../abi/RWAirdrop.json');

/**
 * RWAirdrop contract wrapper
 * Handles airdrop claims and management
 */
class RWAirdrop {
  /**
   * @param {string} address - Contract address
   * @param {ethers.Provider|ethers.Signer} providerOrSigner - Ethers provider or signer
   */
  constructor(address, providerOrSigner) {
    this.address = address;
    this.contract = new Contract(address, RWAirdropABI.abi, providerOrSigner);
  }

  // ==================== Read-only Functions ====================

  /**
   * Get claimable airdrops for a user
   * @param {string} user - User address
   * @returns {Promise<Array>} Array of claimable airdrops
   */
  async getClaimableAirdrops(user) {
    return await this.contract.getClaimableAirdrops(user);
  }

  /**
   * Get domain claimed amount for a specific airdrop
   * @param {string} odudeName - ODude name
   * @param {number|string|bigint} airdropId - Airdrop ID
   * @returns {Promise<bigint>} Claimed amount
   */
  async getDomainClaimedAmount(odudeName, airdropId) {
    return await this.contract.getDomainClaimedAmount(odudeName, airdropId);
  }

  /**
   * Get remaining airdrop amount for a TLD and airdrop ID
   * @param {string} tldName - TLD name
   * @param {number|string|bigint} airdropId - Airdrop ID
   * @returns {Promise<bigint>} Remaining amount
   */
  async getRemainingAirdrop(tldName, airdropId) {
    return await this.contract.getRemainingAirdrop(tldName, airdropId);
  }

  /**
   * Get user domains in a TLD
   * @param {string} user - User address
   * @param {string} tldName - TLD name
   * @returns {Promise<Array<string>>} Array of domain names
   */
  async getUserDomainsInTLD(user, tldName) {
    return await this.contract.getUserDomainsInTLD(user, tldName);
  }

  /**
   * Check if a domain has claimed from a specific airdrop
   * @param {string} odudeName - ODude name
   * @param {number|string|bigint} airdropId - Airdrop ID
   * @returns {Promise<boolean>} Whether domain has claimed
   */
  async hasDomainClaimed(odudeName, airdropId) {
    return await this.contract.hasDomainClaimed(odudeName, airdropId);
  }

  /**
   * Check if airdrop is active for a specific TLD and airdrop ID
   * @param {string} tldName - TLD name
   * @param {number|string|bigint} airdropId - Airdrop ID
   * @returns {Promise<boolean>}
   */
  async isAirdropActive(tldName, airdropId) {
    const airdropInfo = await this.contract.getAirdropInfo(tldName, airdropId);
    return airdropInfo.isActive;
  }

  /**
   * Get contract owner
   * @returns {Promise<string>}
   */
  async owner() {
    return await this.contract.owner();
  }

  /**
   * Get TLD airdrop count
   * @param {string} tldName - TLD name
   * @returns {Promise<bigint>}
   */
  async getTLDAirdropCount(tldName) {
    return await this.contract.getTLDAirdropCount(tldName);
  }

  /**
   * Get TLD airdrop IDs
   * @param {string} tldName - TLD name
   * @returns {Promise<Array<bigint>>}
   */
  async getTLDAirdropIds(tldName) {
    return await this.contract.getTLDAirdropIds(tldName);
  }

  /**
   * Get airdrop info for a specific TLD and airdrop ID
   * @param {string} tldName - TLD name
   * @param {number|string|bigint} airdropId - Airdrop ID
   * @returns {Promise<Object>} Airdrop info
   */
  async getAirdropInfoByTLD(tldName, airdropId) {
    return await this.contract.getAirdropInfo(tldName, airdropId);
  }

  // ==================== Write Functions ====================

  /**
   * Claim share from airdrop
   * @param {string} tldName - TLD name
   * @param {number|string|bigint} airdropId - Airdrop ID
   * @param {string} odudeName - ODude name
   * @param {Object} options - Transaction options
   * @returns {Promise<Object>} Transaction response
   */
  async claimShare(tldName, airdropId, odudeName, options = {}) {
    return await this.contract.claimShare(tldName, airdropId, odudeName, options);
  }

  /**
   * Create airdrop (only TLD owner)
   * @param {string} tldName - TLD name
   * @param {string} tokenAddress - Token address
   * @param {bigint|string} totalAmount - Total amount
   * @param {bigint|string} perUserShare - Per user share
   * @param {Object} options - Transaction options
   * @returns {Promise<Object>} Transaction response
   */
  async createAirdrop(tldName, tokenAddress, totalAmount, perUserShare, options = {}) {
    return await this.contract.createAirdrop(tldName, tokenAddress, totalAmount, perUserShare, options);
  }

  /**
   * Withdraw airdrop (only TLD owner)
   * @param {string} tldName - TLD name
   * @param {number|string|bigint} airdropId - Airdrop ID
   * @param {Object} options - Transaction options
   * @returns {Promise<Object>} Transaction response
   */
  async withdrawAirdrop(tldName, airdropId, options = {}) {
    return await this.contract.withdrawAirdrop(tldName, airdropId, options);
  }

  /**
   * Sync multiple domains owned by the caller
   * Domain holders sync all their domains at once
   * @param {Array<string>} odudeNames - Array of ODude names owned by the caller
   * @param {Object} options - Transaction options
   * @returns {Promise<Object>} Transaction response
   */
  async syncMyDomains(odudeNames, options = {}) {
    return await this.contract.syncMyDomains(odudeNames, options);
  }

  /**
   * Admin-only function for emergency data recovery
   * Sync domain ownership for multiple domains (admin only)
   * @param {Array<string>} odudeNames - Array of ODude names
   * @param {Array<string>} owners - Array of owner addresses
   * @param {Object} options - Transaction options
   * @returns {Promise<Object>} Transaction response
   */
  async syncDomainOwnershipsAdmin(odudeNames, owners, options = {}) {
    return await this.contract.syncDomainOwnershipsAdmin(odudeNames, owners, options);
  }

  // ==================== Events ====================

  /**
   * Listen to Claimed events
   * @param {Function} callback - Callback function
   */
  onClaimed(callback) {
    this.contract.on('Claimed', callback);
  }

  /**
   * Listen to AirdropActiveSet events
   * @param {Function} callback - Callback function
   */
  onAirdropActiveSet(callback) {
    this.contract.on('AirdropActiveSet', callback);
  }

  /**
   * Listen to EligibleAddressAdded events
   * @param {Function} callback - Callback function
   */
  onEligibleAddressAdded(callback) {
    this.contract.on('EligibleAddressAdded', callback);
  }

  /**
   * Remove all listeners
   */
  removeAllListeners() {
    this.contract.removeAllListeners();
  }

  // ==================== Helper Functions ====================

  /**
   * Get comprehensive airdrop info for a TLD and airdrop ID
   * @param {string} tldName - TLD name
   * @param {number|string|bigint} airdropId - Airdrop ID
   * @returns {Promise<Object>} Airdrop info
   */
  async getAirdropDetails(tldName, airdropId) {
    return await this.getAirdropInfoByTLD(tldName, airdropId);
  }
}

module.exports = RWAirdrop;

