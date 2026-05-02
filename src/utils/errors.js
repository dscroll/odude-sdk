/**
 * Custom error classes for ODude SDK
 */

/**
 * Base error class for ODude SDK
 */
class ODudeSDKError extends Error {
  constructor(message, code = null) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when a token is not found
 */
class TokenNotFoundError extends ODudeSDKError {
  constructor(tokenId) {
    super(`Token with ID ${tokenId} not found`, 'TOKEN_NOT_FOUND');
    this.tokenId = tokenId;
  }
}

/**
 * Error thrown when a name is not found
 */
class NameNotFoundError extends ODudeSDKError {
  constructor(name) {
    super(`Name "${name}" not found`, 'NAME_NOT_FOUND');
    this.domainName = name;
  }
}

/**
 * Error thrown when network-related issues occur
 */
class NetworkError extends ODudeSDKError {
  constructor(message, networkName = null) {
    super(message, 'NETWORK_ERROR');
    this.networkName = networkName;
  }
}

/**
 * Error thrown when configuration is invalid
 */
class ConfigurationError extends ODudeSDKError {
  constructor(message) {
    super(message, 'CONFIGURATION_ERROR');
  }
}

/**
 * Error thrown when contract is not connected
 */
class ContractNotConnectedError extends ODudeSDKError {
  constructor(contractName) {
    super(`${contractName} contract not connected. Call connect() or connectNetwork() first.`, 'CONTRACT_NOT_CONNECTED');
    this.contractName = contractName;
  }
}

/**
 * Error thrown when TLD is not supported
 */
class UnsupportedTLDError extends ODudeSDKError {
  constructor(tld) {
    super(`TLD "${tld}" is not supported`, 'UNSUPPORTED_TLD');
    this.tld = tld;
  }
}

/**
 * Error thrown when domain minting fails
 */
class MintingError extends ODudeSDKError {
  constructor(message, domainName = null) {
    super(message, 'MINTING_ERROR');
    this.domainName = domainName;
  }
}

module.exports = {
  ODudeSDKError,
  TokenNotFoundError,
  NameNotFoundError,
  NetworkError,
  ConfigurationError,
  ContractNotConnectedError,
  UnsupportedTLDError,
  MintingError
};
