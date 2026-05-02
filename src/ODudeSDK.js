const { JsonRpcProvider, Wallet, Network } = require('ethers');
const Registry = require('./contracts/Registry');
const Resolver = require('./contracts/Resolver');
const TLD = require('./contracts/TLD');
const RWAirdrop = require('./contracts/RWAirdrop');
const helpers = require('./utils/helpers');
const {
  NetworkError,
  ConfigurationError,
  ContractNotConnectedError,
  UnsupportedTLDError,
  NameNotFoundError
} = require('./utils/errors');

/**
 * Custom JsonRpcProvider with limited retries
 */
class LimitedRetryJsonRpcProvider extends JsonRpcProvider {
  constructor(url, network, options = {}) {
    super(url, network, options);
    this.maxRetries = options.maxRetries || 3;
    this.retryCount = 0;
    this.skipNetworkDetection = options.skipNetworkDetection || false;
    this.expectedChainId = options.expectedChainId || null;
  }

  async _detectNetwork() {
    // Skip network detection if requested and use expected chain ID
    if (this.skipNetworkDetection && this.expectedChainId) {
      return new Network('unknown', this.expectedChainId);
    }

    if (this.retryCount >= this.maxRetries) {
      console.warn(`Failed to detect network after ${this.maxRetries} attempts for URL: ${this._getConnection().url}. Continuing with expected or default network.`);
      return new Network('unknown', this.expectedChainId || 1);
    }

    try {
      this.retryCount++;
      return await super._detectNetwork();
    } catch (error) {
      if (this.retryCount >= this.maxRetries) {
        console.warn(`Network detection failed after ${this.maxRetries} attempts: ${error.message}. Continuing with expected or default network.`);
        return new Network('unknown', this.expectedChainId || 1);
      }
      throw error;
    }
  }
}

/**
 * Main ODude SDK class
 * Provides easy access to all ODude contracts
 */
class ODudeSDK {
  /**
   * @param {Object} config - Configuration object
   * @param {string} config.rpcUrl - Single RPC URL (legacy, optional if provider is provided)
   * @param {string} config.rpcUrl_filecoin - Filecoin RPC URL (optional)
   * @param {string} config.rpcUrl_bnb - BNB Smart Chain RPC URL (optional)
   * @param {string} config.rpcUrl_sepolia - Base Sepolia RPC URL (optional)
   * @param {ethers.Provider} config.provider - Ethers provider (optional)
   * @param {ethers.Signer} config.signer - Ethers signer (optional)
   * @param {string} config.privateKey - Private key for signing (optional)
   * @param {Object} config.addresses - Contract addresses (optional, will use network config if not provided)
   */
  constructor(config = {}) {
    this.config = config;
    this.providers = {};
    this.signers = {};
    this.contracts = {};
    this.networkConfig = null;
    this.currentNetwork = null;

    this._loadNetworkConfig();
    this._validateConfiguration();
    this._initializeProviders();
  }

  /**
   * Load network configuration from config file
   * @private
   */
  _loadNetworkConfig() {
    try {
      this.networkConfig = require('../config/networks.json');
    } catch (error) {
      throw new ConfigurationError('Failed to load network configuration: ' + error.message);
    }
  }

  /**
   * Validate the provided configuration
   * @private
   */
  _validateConfiguration() {
    const errors = [];
    const warnings = [];

    // Check if multi-network RPC URLs are provided correctly
    const networkRpcUrls = {
      filecoin: this.config.rpcUrl_filecoin,
      bnb: this.config.rpcUrl_bnb,
      sepolia: this.config.rpcUrl_sepolia
    };

    // Validate that if any network-specific RPC URL is provided, it's a valid URL
    for (const [network, url] of Object.entries(networkRpcUrls)) {
      if (url && typeof url !== 'string') {
        errors.push(`Invalid RPC URL for ${network}: must be a string`);
      } else if (url && !this._isValidUrl(url)) {
        warnings.push(`RPC URL for ${network} may be invalid: ${url}`);
      }
    }

    // Check for legacy rpcUrl
    if (this.config.rpcUrl && typeof this.config.rpcUrl !== 'string') {
      errors.push('Invalid rpcUrl: must be a string');
    } else if (this.config.rpcUrl && !this._isValidUrl(this.config.rpcUrl)) {
      warnings.push(`Legacy rpcUrl may be invalid: ${this.config.rpcUrl}`);
    }

    // Check private key format if provided
    if (this.config.privateKey) {
      if (typeof this.config.privateKey !== 'string') {
        errors.push('Invalid privateKey: must be a string');
      } else if (!this.config.privateKey.startsWith('0x') && this.config.privateKey.length !== 64 && this.config.privateKey.length !== 66) {
        warnings.push('Private key format may be invalid (should be 64 hex characters or start with 0x)');
      }
    }

    // Log warnings
    if (warnings.length > 0) {
      console.warn('⚠️  ODude SDK Configuration Warnings:');
      warnings.forEach(warning => console.warn(`   - ${warning}`));
    }

    // Throw errors
    if (errors.length > 0) {
      console.error('❌ ODude SDK Configuration Errors:');
      errors.forEach(error => console.error(`   - ${error}`));
      throw new ConfigurationError(`Configuration validation failed: ${errors.join(', ')}`);
    }

    // Log successful configuration
    const configuredNetworks = Object.entries(networkRpcUrls)
      .filter(([, url]) => url)
      .map(([network]) => network);

    if (configuredNetworks.length > 0) {
      console.log('✅ ODude SDK initialized with networks:', configuredNetworks.join(', '));
    } else if (this.config.rpcUrl) {
      console.log('✅ ODude SDK initialized with legacy RPC URL');
    } else {
      console.log('✅ ODude SDK initialized with default network configurations');
    }
  }

  /**
   * Check if a URL is valid
   * @private
   * @param {string} url - URL to validate
   * @returns {boolean}
   */
  _isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Initialize providers for all networks
   * @private
   */
  _initializeProviders() {
    // Handle legacy single provider/signer configuration
    if (this.config.provider) {
      this.providers.default = this.config.provider;
      return;
    }

    if (this.config.signer) {
      this.signers.default = this.config.signer;
      this.providers.default = this.config.signer.provider;
      return;
    }

    // Initialize providers for each network
    for (const [networkName, networkInfo] of Object.entries(this.networkConfig.networks)) {
      const rpcUrl = this._getRpcUrlForNetwork(networkName);
      if (rpcUrl) {
        try {
          // Skip network detection for external networks to avoid connection issues
          const skipDetection = !rpcUrl.includes('127.0.0.1') && !rpcUrl.includes('localhost');
          this.providers[networkName] = new LimitedRetryJsonRpcProvider(rpcUrl, null, {
            maxRetries: 3,
            skipNetworkDetection: skipDetection,
            expectedChainId: networkInfo.chainId
          });

          // Create signer if private key is provided
          if (this.config.privateKey) {
            this.signers[networkName] = new Wallet(this.config.privateKey, this.providers[networkName]);
          }
        } catch (error) {
          console.warn(`Failed to initialize provider for ${networkName}: ${error.message}`);
        }
      }
    }

    // Fallback to localhost if no providers were created
    if (Object.keys(this.providers).length === 0) {
      try {
        this.providers.localhost = new LimitedRetryJsonRpcProvider('http://127.0.0.1:8545', null, { maxRetries: 3 });
        if (this.config.privateKey) {
          this.signers.localhost = new Wallet(this.config.privateKey, this.providers.localhost);
        }
      } catch (error) {
        console.warn(`Failed to initialize localhost provider: ${error.message}`);
      }
    }
  }

  /**
   * Get RPC URL for a specific network
   * @private
   * @param {string} networkName - Network name
   * @returns {string|null} RPC URL
   */
  _getRpcUrlForNetwork(networkName) {
    const networkInfo = this.networkConfig.networks[networkName];
    if (!networkInfo) return null;

    // Check for environment variable first
    if (networkInfo.rpcUrlEnvVar && process.env[networkInfo.rpcUrlEnvVar]) {
      return process.env[networkInfo.rpcUrlEnvVar];
    }

    // Check for config-specific RPC URLs
    const configKey = `rpcUrl_${networkName}`;
    if (this.config[configKey]) {
      return this.config[configKey];
    }

    // Special handling for legacy config keys
    if (networkName === 'basesepolia' && this.config.rpcUrl_sepolia) {
      return this.config.rpcUrl_sepolia;
    }

    // Check for legacy single rpcUrl
    if (this.config.rpcUrl && networkName === 'localhost') {
      return this.config.rpcUrl;
    }

    // Use default RPC URL
    return networkInfo.defaultRpcUrl;
  }

  /**
   * Determine network based on TLD
   * @param {string} tld - Top-level domain
   * @returns {string} Network name
   */
  getNetworkForTLD(tld) {
    const tldLower = tld.toLowerCase();

    // Check if it's already a network name
    if (this.networkConfig.networks[tldLower]) {
      return tldLower;
    }

    // Check TLD mappings
    if (this.networkConfig.tldMappings[tldLower]) {
      return this.networkConfig.tldMappings[tldLower];
    }

    // Return default network
    return this.networkConfig.defaultNetwork;
  }

  /**
   * Get provider for a specific network or TLD
   * @param {string} networkOrTld - Network name or TLD
   * @returns {ethers.Provider} Provider instance
   */
  getProvider(networkOrTld = null) {
    if (!networkOrTld) {
      // Return default provider
      if (this.providers.default) return this.providers.default;
      if (this.currentNetwork && this.providers[this.currentNetwork]) {
        return this.providers[this.currentNetwork];
      }
      // Return first available provider
      const firstNetwork = Object.keys(this.providers)[0];
      return this.providers[firstNetwork];
    }

    // Check if it's a network name
    if (this.providers[networkOrTld]) {
      return this.providers[networkOrTld];
    }

    // Treat as TLD and find corresponding network
    const network = this.getNetworkForTLD(networkOrTld);
    if (this.providers[network]) {
      return this.providers[network];
    }

    throw new NetworkError(`No provider available for network/TLD: ${networkOrTld}`);
  }

  /**
   * Get signer for a specific network or TLD
   * @param {string} networkOrTld - Network name or TLD
   * @returns {ethers.Signer|null} Signer instance
   */
  getSigner(networkOrTld = null) {
    if (!networkOrTld) {
      // Return default signer
      if (this.signers.default) return this.signers.default;
      if (this.currentNetwork && this.signers[this.currentNetwork]) {
        return this.signers[this.currentNetwork];
      }
      // Return first available signer
      const firstNetwork = Object.keys(this.signers)[0];
      return this.signers[firstNetwork] || null;
    }

    // Check if it's a network name
    if (this.signers[networkOrTld]) {
      return this.signers[networkOrTld];
    }

    // Treat as TLD and find corresponding network
    const network = this.getNetworkForTLD(networkOrTld);
    if (this.signers[network]) {
      return this.signers[network];
    }

    return null;
  }

  /**
   * Connect contracts with addresses for a specific network
   * @param {Object} addresses - Contract addresses
   * @param {string} addresses.Registry - Registry contract address
   * @param {string} addresses.Resolver - Resolver contract address
   * @param {string} addresses.TLD - TLD contract address
   * @param {string} addresses.RWAirdrop - RWAirdrop contract address
   * @param {string} network - Network name (optional, uses current or default)
   */
  connect(addresses, network = null) {
    const targetNetwork = network || this.currentNetwork || this.networkConfig.defaultNetwork;
    const providerOrSigner = this.getSigner(targetNetwork) || this.getProvider(targetNetwork);

    if (!this.contracts[targetNetwork]) {
      this.contracts[targetNetwork] = {};
    }

    if (addresses.Registry) {
      this.contracts[targetNetwork].registry = new Registry(addresses.Registry, providerOrSigner);
    }

    if (addresses.Resolver) {
      this.contracts[targetNetwork].resolver = new Resolver(addresses.Resolver, providerOrSigner);
    }

    if (addresses.TLD) {
      this.contracts[targetNetwork].tld = new TLD(addresses.TLD, providerOrSigner);
    }

    if (addresses.RWAirdrop) {
      this.contracts[targetNetwork].rwairdrop = new RWAirdrop(addresses.RWAirdrop, providerOrSigner);
    }

    // Set as current network if not already set
    if (!this.currentNetwork) {
      this.currentNetwork = targetNetwork;
    }
  }

  /**
   * Connect to localhost deployment
   * Reads addresses from localhost-deployment.json
   */
  connectLocalhost() {
    try {
      const deployment = require('../localhost-deployment.json');
      const addresses = {
        Registry: deployment.contracts.Registry.address,
        Resolver: deployment.contracts.Resolver.address,
        TLD: deployment.contracts.TLD.address,
        RWAirdrop: deployment.contracts.RWAirdrop.address
      };
      this.connect(addresses, 'localhost');
    } catch (error) {
      throw new NetworkError('Failed to load localhost-deployment.json: ' + error.message, 'localhost');
    }
  }

  /**
   * Connect to a network using config file
   * @param {string} network - Network name ('localhost', 'filecoin', 'bnb', 'basesepolia')
   */
  connectNetwork(network = null) {
    try {
      const targetNetwork = network || this.networkConfig.defaultNetwork;

      if (!this.networkConfig.networks[targetNetwork]) {
        throw new NetworkError(`Network "${targetNetwork}" not found in config`, targetNetwork);
      }

      const networkInfo = this.networkConfig.networks[targetNetwork];

      // Ensure provider exists for this network
      if (!this.providers[targetNetwork]) {
        const rpcUrl = this._getRpcUrlForNetwork(targetNetwork);
        if (!rpcUrl) {
          throw new NetworkError(`No RPC URL available for network "${targetNetwork}"`, targetNetwork);
        }
        const skipDetection = !rpcUrl.includes('127.0.0.1') && !rpcUrl.includes('localhost');
        this.providers[targetNetwork] = new LimitedRetryJsonRpcProvider(rpcUrl, null, {
          maxRetries: 3,
          skipNetworkDetection: skipDetection,
          expectedChainId: networkInfo.chainId
        });

        if (this.config.privateKey) {
          this.signers[targetNetwork] = new Wallet(this.config.privateKey, this.providers[targetNetwork]);
        }
      }

      this.connect(networkInfo.contracts, targetNetwork);
      this.currentNetwork = targetNetwork;
    } catch (error) {
      if (error instanceof NetworkError) {
        throw error;
      }
      throw new NetworkError('Failed to connect to network: ' + error.message, network);
    }
  }

  /**
   * Connect to all configured networks
   */
  connectAllNetworks() {
    const connectedNetworks = [];

    for (const networkName of Object.keys(this.networkConfig.networks)) {
      try {
        this.connectNetwork(networkName);
        connectedNetworks.push(networkName);
      } catch (error) {
        console.warn(`Failed to connect to network ${networkName}:`, error.message);
      }
    }

    if (connectedNetworks.length === 0) {
      throw new NetworkError('Failed to connect to any network');
    }

    return connectedNetworks;
  }

  /**
   * Connect with a signer (for write operations)
   * @param {ethers.Signer} signer - Ethers signer
   * @param {string} network - Network name (optional)
   */
  connectSigner(signer, network = null) {
    const targetNetwork = network || this.currentNetwork || this.networkConfig.defaultNetwork;

    this.signers[targetNetwork] = signer;
    this.providers[targetNetwork] = signer.provider;

    // Reconnect contracts for this network with the new signer
    if (this.contracts[targetNetwork]) {
      const addresses = {};
      if (this.contracts[targetNetwork].registry) addresses.Registry = this.contracts[targetNetwork].registry.address;
      if (this.contracts[targetNetwork].resolver) addresses.Resolver = this.contracts[targetNetwork].resolver.address;
      if (this.contracts[targetNetwork].tld) addresses.TLD = this.contracts[targetNetwork].tld.address;
      if (this.contracts[targetNetwork].rwairdrop) addresses.RWAirdrop = this.contracts[targetNetwork].rwairdrop.address;

      if (Object.keys(addresses).length > 0) {
        this.connect(addresses, targetNetwork);
      }
    }
  }

  /**
   * Get Registry contract instance for a specific network or TLD
   * @param {string} networkOrTld - Network name or TLD (optional, uses current network)
   * @returns {Registry}
   */
  registry(networkOrTld = null) {
    const network = networkOrTld ? this.getNetworkForTLD(networkOrTld) : (this.currentNetwork || this.networkConfig.defaultNetwork);

    if (!network || !this.contracts[network] || !this.contracts[network].registry) {
      throw new ContractNotConnectedError('Registry');
    }
    return this.contracts[network].registry;
  }

  /**
   * Get Resolver contract instance for a specific network or TLD
   * @param {string} networkOrTld - Network name or TLD (optional, uses current network)
   * @returns {Resolver}
   */
  resolver(networkOrTld = null) {
    const network = networkOrTld ? this.getNetworkForTLD(networkOrTld) : (this.currentNetwork || this.networkConfig.defaultNetwork);

    if (!network || !this.contracts[network] || !this.contracts[network].resolver) {
      throw new ContractNotConnectedError('Resolver');
    }
    return this.contracts[network].resolver;
  }

  /**
   * Get TLD contract instance for a specific network or TLD
   * @param {string} networkOrTld - Network name or TLD (optional, uses current network)
   * @returns {TLD}
   */
  tld(networkOrTld = null) {
    const network = networkOrTld ? this.getNetworkForTLD(networkOrTld) : (this.currentNetwork || this.networkConfig.defaultNetwork);

    if (!network || !this.contracts[network] || !this.contracts[network].tld) {
      throw new ContractNotConnectedError('TLD');
    }
    return this.contracts[network].tld;
  }

  /**
   * Get RWAirdrop contract instance for a specific network or TLD
   * @param {string} networkOrTld - Network name or TLD (optional, uses current network)
   * @returns {RWAirdrop}
   */
  rwairdrop(networkOrTld = null) {
    const network = networkOrTld ? this.getNetworkForTLD(networkOrTld) : (this.currentNetwork || this.networkConfig.defaultNetwork);

    if (!network || !this.contracts[network] || !this.contracts[network].rwairdrop) {
      throw new ContractNotConnectedError('RWAirdrop');
    }
    return this.contracts[network].rwairdrop;
  }









  /**
   * Helper utilities
   */
  get utils() {
    return helpers;
  }



  // ==================== Event Monitoring ====================

  /**
   * Listen to Transfer events from Registry contract
   * @param {Function} callback - Callback function (from, to, tokenId) => {}
   * @param {string} networkOrTld - Network name or TLD (optional, uses current network)
   */
  onTransfer(callback, networkOrTld = null) {
    const network = networkOrTld ? this.getNetworkForTLD(networkOrTld) : this.currentNetwork;
    this.registry(network).onTransfer(callback);
  }

  /**
   * Listen to NameResolved events from Resolver contract
   * @param {Function} callback - Callback function (name, address) => {}
   * @param {string} networkOrTld - Network name or TLD (optional, uses current network)
   */
  onNameResolved(callback, networkOrTld = null) {
    const network = networkOrTld ? this.getNetworkForTLD(networkOrTld) : this.currentNetwork;
    this.resolver(network).onNameSet(callback);
  }

  /**
   * Listen to DomainMinted events from TLD contract
   * @param {Function} callback - Callback function (name, owner) => {}
   * @param {string} networkOrTld - Network name or TLD (optional, uses current network)
   */
  onDomainMinted(callback, networkOrTld = null) {
    const network = networkOrTld ? this.getNetworkForTLD(networkOrTld) : this.currentNetwork;
    // Note: This assumes the TLD contract has a DomainMinted event
    // You may need to adjust based on actual contract events
    this.tld(network).contract.on('DomainMinted', callback);
  }

  /**
   * Listen to all Transfer events across all connected networks
   * @param {Function} callback - Callback function (from, to, tokenId, network) => {}
   */
  onTransferAllNetworks(callback) {
    for (const [network, contracts] of Object.entries(this.contracts)) {
      if (contracts.registry) {
        contracts.registry.onTransfer((from, to, tokenId) => {
          callback(from, to, tokenId, network);
        });
      }
    }
  }

  /**
   * Listen to all NameResolved events across all connected networks
   * @param {Function} callback - Callback function (name, address, network) => {}
   */
  onNameResolvedAllNetworks(callback) {
    for (const [network, contracts] of Object.entries(this.contracts)) {
      if (contracts.resolver) {
        contracts.resolver.onNameSet((name, address) => {
          callback(name, address, network);
        });
      }
    }
  }

  /**
   * Remove all event listeners for a specific network
   * @param {string} networkOrTld - Network name or TLD (optional, uses current network)
   */
  removeAllListeners(networkOrTld = null) {
    const network = networkOrTld ? this.getNetworkForTLD(networkOrTld) : this.currentNetwork;

    if (this.contracts[network]) {
      if (this.contracts[network].registry) {
        this.contracts[network].registry.removeAllListeners();
      }
      if (this.contracts[network].resolver) {
        this.contracts[network].resolver.removeAllListeners();
      }
      if (this.contracts[network].tld) {
        this.contracts[network].tld.removeAllListeners();
      }
      if (this.contracts[network].rwairdrop) {
        this.contracts[network].rwairdrop.removeAllListeners();
      }
    }
  }

  /**
   * Remove all event listeners across all networks
   */
  removeAllListenersAllNetworks() {
    for (const network of Object.keys(this.contracts)) {
      this.removeAllListeners(network);
    }
  }

  // ==================== Convenience Methods ====================

  /**
   * Resolve a name to an address
   * @param {string} name - ODude name
   * @returns {Promise<string>} Resolved address
   * @throws {NameNotFoundError} When name doesn't exist
   * @throws {NetworkError} When network is not available
   * @throws {UnsupportedTLDError} When TLD is not supported
   */
  async resolve(name) {
    try {
      if (!name || typeof name !== 'string') {
        throw new Error('Invalid name provided');
      }

      // Use @ separator for ODude domain format
      const parts = name.split('@');
      if (parts.length < 2) {
        throw new Error('Invalid domain format. Expected format: name@tld');
      }

      const tld = parts[parts.length - 1];
      const network = this.getNetworkForTLD(tld);

      if (!this.networkConfig.networks[network]) {
        throw new UnsupportedTLDError(tld);
      }

      const result = await this.resolver(network).resolve(name);
      if (!result || result === '0x0000000000000000000000000000000000000000') {
        throw new NameNotFoundError(name);
      }

      return result;
    } catch (error) {
      if (error instanceof NameNotFoundError ||
          error instanceof UnsupportedTLDError ||
          error instanceof NetworkError) {
        throw error;
      }
      throw new NameNotFoundError(name);
    }
  }

  /**
   * Reverse resolve an address to a name
   * @param {string} address - Ethereum address
   * @param {string} networkOrTld - Network name or TLD (optional)
   * @returns {Promise<string>} Primary name
   */
  async reverse(address, networkOrTld = null) {
    const network = networkOrTld ? this.getNetworkForTLD(networkOrTld) : this.currentNetwork;
    return await this.resolver(network).reverse(address);
  }

  /**
   * Get owner of a name
   * @param {string} name - ODude name
   * @returns {Promise<string>} Owner address
   * @throws {NameNotFoundError} When name doesn't exist
   * @throws {UnsupportedTLDError} When TLD is not supported
   */
  async getOwner(name) {
    try {
      if (!name || typeof name !== 'string') {
        throw new Error('Invalid name provided');
      }

      // Use @ separator for ODude domain format
      const parts = name.split('@');
      if (parts.length < 2) {
        throw new Error('Invalid domain format. Expected format: name@tld');
      }

      const tld = parts[parts.length - 1];
      const network = this.getNetworkForTLD(tld);

      if (!this.networkConfig.networks[network]) {
        throw new UnsupportedTLDError(tld);
      }

      return await this.registry(network).getOwnerByName(name);
    } catch (error) {
      if (error instanceof UnsupportedTLDError) {
        throw error;
      }
      throw new NameNotFoundError(name);
    }
  }

  /**
   * Get owner of a name (safe version that returns null instead of throwing)
   * @param {string} name - ODude name
   * @returns {Promise<string|null>} Owner address or null if not found
   */
  async getOwnerSafe(name) {
    try {
      const owner = await this.getOwner(name);
      return owner === '0x0000000000000000000000000000000000000000' ? null : owner;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if a domain exists
   * @param {string} name - ODude name
   * @returns {Promise<boolean>} True if domain exists
   */
  async domainExists(name) {
    try {
      if (!name || typeof name !== 'string') {
        return false;
      }

      // Use @ separator for ODude domain format
      const parts = name.split('@');
      if (parts.length < 2) {
        return false;
      }

      const tld = parts[parts.length - 1];
      const network = this.getNetworkForTLD(tld);

      if (!this.networkConfig.networks[network]) {
        return false;
      }

      const tokenId = await this.registry(network).getTokenId(name);
      const owner = await this.registry(network).ownerOf(tokenId);
      return owner !== '0x0000000000000000000000000000000000000000';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get comprehensive name info
   * @param {string} name - ODude name
   * @returns {Promise<Object>} Name information
   */
  async getNameInfo(name) {
    // Use @ separator for ODude domain format
    const parts = name.split('@');
    const tld = parts[parts.length - 1];
    const network = this.getNetworkForTLD(tld);

    const tokenId = await this.registry(network).getTokenId(name);
    const [owner, metadata, tokenURI, resolutionRecord] = await Promise.all([
      this.registry(network).ownerOf(tokenId),
      this.registry(network).getNFTMetadata(tokenId),
      this.registry(network).tokenURI(tokenId),
      this.resolver(network).getResolutionRecord(name)
    ]);

    return {
      name,
      tokenId,
      owner,
      metadata,
      tokenURI,
      resolvedAddress: resolutionRecord.resolvedAddress,
      exists: resolutionRecord.exists,
      network
    };
  }

  /**
   * Check if a domain is eligible for minting
   * @param {string} domainName - Full domain name (e.g., "alice@crypto")
   * @returns {Promise<Object>} Eligibility information
   */
  async checkMintEligibility(domainName) {
    const tld = domainName.split('@').pop();
    const network = this.getNetworkForTLD(tld);

    return await this.tld(network).checkMintEligibility(domainName, this.resolver(network));
  }

  /**
   * Get comprehensive domain status including existence, ownership, and airdrop information
   * @param {string} name - ODude name
   * @returns {Promise<Object>} Complete domain status information
   */
  async getDomainStatus(name) {
    try {
      const exists = await this.domainExists(name);

      if (!exists) {
        // Check if domain can be minted
        let canMint = false;
        let mintEligibility = null;

        try {
          mintEligibility = await this.checkMintEligibility(name);
          canMint = mintEligibility.eligible;
        } catch (error) {
          // Mint eligibility check failed
        }

        return {
          name,
          exists: false,
          owner: null,
          canMint,
          mintEligibility,
          inAirdropContract: false,
          claimableAirdrops: 0,
          airdropDetails: []
        };
      }

      // Domain exists, get detailed information
      const owner = await this.getOwnerSafe(name);
      const tld = this.utils.extractTLD(name);

      // Check airdrop information
      let inAirdropContract = false;
      let claimableAirdrops = 0;
      let airdropDetails = [];

      if (owner) {
        try {
          const airdropDomains = await this.rwairdrop().getUserDomainsInTLD(owner, tld);
          inAirdropContract = airdropDomains.includes(name);

          if (inAirdropContract) {
            airdropDetails = await this.rwairdrop().getClaimableAirdrops(owner);
            claimableAirdrops = airdropDetails.length;
          }
        } catch (error) {
          // Airdrop information not available
        }
      }

      return {
        name,
        exists: true,
        owner,
        canMint: false,
        mintEligibility: null,
        inAirdropContract,
        claimableAirdrops,
        airdropDetails
      };
    } catch (error) {
      throw new Error(`Failed to get domain status for ${name}: ${error.message}`);
    }
  }

  /**
   * Get comprehensive TLD information
   * @param {string} tldName - TLD name (e.g., "crypto")
   * @returns {Promise<Object>} TLD information
   */
  async getTldInfo(tldName) {
    const network = this.getNetworkForTLD(tldName);
    const tldContract = this.tld(network);
    const resolverContract = this.resolver(network);

    try {
      // Get TLD token ID first
      const tokenId = await tldContract.getTLDId(tldName);

      // Get comprehensive TLD info from the contract
      const tldInfo = await tldContract.getTLD(tokenId);

      // Get resolved address for the TLD
      let resolvedAddress = null;
      try {
        resolvedAddress = await resolverContract.resolve(tldName);
      } catch (e) {
        // TLD might not have a resolved address
      }

      return {
        tokenId: tldInfo.id,
        name: tldInfo.name,
        getTLDOwner: tldInfo.owner,
        resolvedAddress: resolvedAddress,
        getTLDPrice: tldInfo.price,
        getCommission: tldInfo.commission,
        getErcToken: tldInfo.erc20Token,
        getTokenPrice: tldInfo.price,
        isTLDActive: tldInfo.exists,
        network
      };
    } catch (error) {
      throw new Error(`Failed to get TLD info for ${tldName}: ${error.message}`);
    }
  }



  /**
   * Mint a domain (convenience method)
   * @param {string} domainName - Full domain name (e.g., "alice@crypto")
   * @param {string} toAddress - Address to mint the domain to
   * @param {Object} options - Minting options
   * @param {bigint|string} options.value - ETH value to send (for payment)
   * @param {number} options.gasLimit - Gas limit (optional)
   * @returns {Promise<Object>} Transaction response
   */
  async mintDomain(domainName, toAddress, options = {}) {
    const tld = domainName.split('@').pop();
    const network = this.getNetworkForTLD(tld);
    const registryContract = this.registry(network);
    return await this.tld(network).mintDomain(domainName, toAddress, options, registryContract);
  }

  /**
   * Mint a TLD (Top-Level Domain)
   * @param {string} tldName - TLD name (e.g., "crypto", "sepolia")
   * @param {string} toAddress - Address to mint the TLD to
   * @param {Object} options - Minting options
   * @param {bigint|string} options.value - ETH value to send (for payment)
   * @param {number} options.gasLimit - Gas limit (optional)
   * @returns {Promise<Object>} Transaction response
   * @throws {MintingError} When TLD minting fails
   */
  async mintTLD(tldName, toAddress, options = {}) {
    try {
      if (!tldName || typeof tldName !== 'string') {
        throw new Error('Invalid TLD name provided');
      }

      if (!toAddress || typeof toAddress !== 'string') {
        throw new Error('Invalid address provided');
      }

      // Use the current network (typically basesepolia)
      const network = this.currentNetwork;
      if (!network) {
        throw new Error('No network connected. Please connect to a network first.');
      }

      const registryContract = this.registry(network);
      const tldContract = this.tld(network);

      // Check eligibility first
      const eligibility = await tldContract.checkMintEligibility(tldName);
      if (!eligibility.eligible) {
        throw new Error(`TLD not eligible for minting: ${eligibility.reason}`);
      }

      // Generate a token ID for the TLD using the helper function
      const { randomTokenId } = require('./utils/helpers');
      const tokenId = randomTokenId();

      // Create a basic metadata URI for the TLD
      const tokenUri = `https://metadata.odude.com/tld/${tldName}`;

      const txOptions = {};

      if (options.value) {
        txOptions.value = options.value;
      } else {
        // Use the cost from eligibility check
        txOptions.value = eligibility.cost;
      }

      if (options.gasLimit) {
        txOptions.gasLimit = options.gasLimit;
      }

      // First mint the TLD NFT through Registry
      const mintTx = await registryContract.mintDomain(tokenId, tldName, tokenUri, toAddress, txOptions);

      // Wait for the transaction to be mined
      const receipt = await mintTx.wait();

      // Then register the TLD in the TLD contract
      try {
        const registerTx = await tldContract.registerTLD(tokenId, tldName, toAddress);
        await registerTx.wait();
      } catch (registerError) {
        console.warn('TLD NFT minted but registration failed:', registerError.message);
        console.warn('You may need to register the TLD manually.');
      }

      return receipt;
    } catch (error) {
      throw new Error(`Failed to mint TLD: ${error.message}`);
    }
  }

  /**
   * Get airdrop info for an address
   * @param {string} address - Ethereum address
   * @param {string} networkOrTld - Network name or TLD (optional, uses current network)
   * @returns {Promise<Object>} Airdrop information
   * @throws {NetworkError} When network is not available
   * @throws {ContractNotConnectedError} When RWAirdrop contract is not connected
   */
  async getAirdropInfo(address, networkOrTld = null) {
    try {
      if (!address || typeof address !== 'string') {
        throw new Error('Invalid address provided');
      }

      const network = networkOrTld ? this.getNetworkForTLD(networkOrTld) : this.currentNetwork;

      if (!network) {
        throw new NetworkError('No network specified and no current network set');
      }

      return await this.rwairdrop(network).getAirdropInfo(address);
    } catch (error) {
      if (error instanceof NetworkError || error instanceof ContractNotConnectedError) {
        throw error;
      }
      throw new NetworkError(`Failed to get airdrop info for address ${address}: ${error.message}`, networkOrTld);
    }
  }

  // ==================== Extended Methods (from old_sample.js) ====================

  /**
   * Get total number of names owned by an address
   * @param {string} address - Wallet address
   * @returns {Promise<bigint>} Total number of names
   * @throws {NetworkError} When network is not available
   * @throws {ContractNotConnectedError} When Registry contract is not connected
   */
  async getTotalNames(address) {
    try {
      if (!address || typeof address !== 'string') {
        throw new Error('Invalid address provided');
      }

      return await this.registry().balanceOf(address);
    } catch (error) {
      if (error instanceof NetworkError || error instanceof ContractNotConnectedError) {
        throw error;
      }
      throw new NetworkError(`Failed to get total names for address ${address}: ${error.message}`);
    }
  }

  /**
   * Get list of names owned by an address
   * @param {string} address - Wallet address
   * @returns {Promise<Array<{tokenId: string, name: string}>>} List of names with token IDs
   * @throws {NetworkError} When network is not available
   * @throws {ContractNotConnectedError} When Registry contract is not connected
   */
  async getNamesList(address) {
    try {
      if (!address || typeof address !== 'string') {
        throw new Error('Invalid address provided');
      }

      const balance = await this.registry().balanceOf(address);
      const names = [];

      for (let i = 0; i < balance; i++) {
        try {
          const tokenId = await this.registry().tokenOfOwnerByIndex(address, i);
          const name = await this.registry().nameOf(tokenId);
          names.push({
            tokenId: tokenId.toString(),
            name: name
          });
        } catch (error) {
          console.error(`Error fetching name at index ${i} for address ${address}:`, error.message);
          // Continue with other names instead of failing completely
        }
      }

      return names;
    } catch (error) {
      if (error instanceof NetworkError || error instanceof ContractNotConnectedError) {
        throw error;
      }
      throw new NetworkError(`Failed to get names list for address ${address}: ${error.message}`);
    }
  }

  /**
   * Get comprehensive details about a name
   * @param {string} name - ODude name
   * @returns {Promise<Object>} Comprehensive name details
   * @throws {NameNotFoundError} When name doesn't exist
   * @throws {UnsupportedTLDError} When TLD is not supported
   * @throws {NetworkError} When network is not available
   */
  async getNameDetails(name) {
    try {
      if (!name || typeof name !== 'string') {
        throw new Error('Invalid name provided');
      }

      // Use @ separator for ODude domain format
      const parts = name.split('@');
      if (parts.length < 2) {
        throw new Error('Invalid domain format. Expected format: name@tld');
      }

      const tld = parts[parts.length - 1];
      const network = this.getNetworkForTLD(tld);

      if (!this.networkConfig.networks[network]) {
        throw new UnsupportedTLDError(tld);
      }

      const tokenId = await this.registry(network).getTokenId(name);
      const [owner, metadata, tokenURI, exists] = await Promise.all([
        this.registry(network).ownerOf(tokenId),
        this.registry(network).getNFTMetadata(tokenId),
        this.registry(network).tokenURI(tokenId),
        this.resolver(network).nameExists(name)
      ]);

      let resolvedAddress = null;
      if (exists) {
        try {
          resolvedAddress = await this.resolver(network).resolve(name);
        } catch (e) {
          // Name exists but not resolved
        }
      }

      return {
        name,
        tokenId: tokenId.toString(),
        owner,
        metadata,
        tokenURI,
        exists,
        resolvedAddress
      };
    } catch (error) {
      if (error instanceof NameNotFoundError ||
          error instanceof UnsupportedTLDError ||
          error instanceof NetworkError) {
        throw error;
      }
      throw new NameNotFoundError(name);
    }
  }

  /**
   * Get name by token ID
   * @param {number|string|bigint} tokenId - Token ID
   * @returns {Promise<string>} Name
   */
  async getNameById(tokenId) {
    return await this.registry().nameOf(tokenId);
  }

  /**
   * Get all names (paginated)
   * @param {number} startIndex - Start index (default: 0)
   * @param {number} count - Number of names to fetch (default: 10)
   * @returns {Promise<Array<{tokenId: string, name: string, owner: string}>>} List of names
   */
  async getAllNames(startIndex = 0, count = 10) {
    const totalSupply = await this.registry().totalSupply();
    const endIndex = Math.min(Number(startIndex) + count, Number(totalSupply));
    const names = [];

    for (let i = startIndex; i < endIndex; i++) {
      try {
        const tokenId = await this.registry().tokenByIndex(i);
        const name = await this.registry().nameOf(tokenId);
        const owner = await this.registry().ownerOf(tokenId);

        names.push({
          tokenId: tokenId.toString(),
          name,
          owner
        });
      } catch (error) {
        console.error(`Error fetching token at index ${i}:`, error.message);
      }
    }

    return names;
  }



  /**
   * Get approved address for a token
   * @param {number|string|bigint} tokenId - Token ID
   * @returns {Promise<string>} Approved address
   */
  async getApproved(tokenId) {
    return await this.registry().getApproved(tokenId);
  }



  /**
   * Get network list information for 3rd party validation
   * @returns {Object} Network configuration and connection status
   */
  NetworkList() {
    const networkInfo = {
      supportedNetworks: {},
      currentNetwork: this.currentNetwork,
      connectedNetworks: Object.keys(this.providers),
      tldMappings: this.networkConfig.tldMappings,
      defaultNetwork: this.networkConfig.defaultNetwork
    };

    // Add detailed information for each supported network
    for (const [networkName, networkConfig] of Object.entries(this.networkConfig.networks)) {
      networkInfo.supportedNetworks[networkName] = {
        name: networkConfig.name,
        chainId: networkConfig.chainId,
        defaultRpcUrl: networkConfig.defaultRpcUrl,
        rpcUrlEnvVar: networkConfig.rpcUrlEnvVar,
        contracts: networkConfig.contracts,
        isConnected: this.providers[networkName] ? true : false,
        hasContracts: this._hasValidContracts(networkConfig.contracts)
      };
    }

    return networkInfo;
  }

  /**
   * Display network list information in console
   */
  displayNetworkList() {
    const networkInfo = this.NetworkList();

    console.log('\n=== ODude SDK Network Information ===');
    console.log(`Current Network: ${networkInfo.currentNetwork || 'None'}`);
    console.log(`Default Network: ${networkInfo.defaultNetwork}`);
    console.log(`Connected Networks: ${networkInfo.connectedNetworks.join(', ') || 'None'}`);

    console.log('\n--- Supported Networks ---');
    for (const [networkName, config] of Object.entries(networkInfo.supportedNetworks)) {
      const status = config.isConnected ? '✅' : '❌';
      const contracts = config.hasContracts ? '✅' : '⚠️';
      console.log(`${status} ${networkName} (${config.name})`);
      console.log(`   Chain ID: ${config.chainId}`);
      console.log(`   RPC URL: ${config.defaultRpcUrl}`);
      console.log(`   Contracts Deployed: ${contracts}`);
      console.log(`   Connected: ${config.isConnected}`);
      console.log('');
    }

    console.log('--- TLD Mappings ---');
    for (const [tld, network] of Object.entries(networkInfo.tldMappings)) {
      console.log(`${tld} → ${network}`);
    }
    console.log('');

    return networkInfo;
  }

  /**
   * Check if network has valid contract addresses
   * @private
   * @param {Object} contracts - Contract addresses
   * @returns {boolean}
   */
  _hasValidContracts(contracts) {
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    return Object.values(contracts).some(address => address !== zeroAddress);
  }
}

module.exports = ODudeSDK;

