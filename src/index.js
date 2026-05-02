/**
 * ODude SDK - Main export file
 * Developer-friendly SDK for interacting with ODude smart contracts
 *
 * Supports both CommonJS (require) and ES Modules (import) syntax:
 *
 * CommonJS:
 *   const ODudeSDK = require('@odude/odude-sdk');
 *   const { Registry, Resolver } = require('@odude/odude-sdk');
 *
 * ES Modules:
 *   import ODudeSDK from '@odude/odude-sdk';
 *   import { Registry, Resolver } from '@odude/odude-sdk';
 *
 * TypeScript:
 *   import ODudeSDK, { Registry, Resolver, ODudeSDKConfig } from '@odude/odude-sdk';
 */

const ODudeSDK = require('./ODudeSDK');
const Registry = require('./contracts/Registry');
const Resolver = require('./contracts/Resolver');
const TLD = require('./contracts/TLD');
const RWAirdrop = require('./contracts/RWAirdrop');
const helpers = require('./utils/helpers');

// Import error classes for re-export
const {
  ODudeSDKError,
  TokenNotFoundError,
  NameNotFoundError,
  NetworkError,
  ConfigurationError,
  ContractNotConnectedError,
  UnsupportedTLDError,
  MintingError
} = require('./utils/errors');

// Main default export
module.exports = ODudeSDK;

// Named exports for tree-shaking and modern import syntax
module.exports.ODudeSDK = ODudeSDK;
module.exports.Registry = Registry;
module.exports.Resolver = Resolver;
module.exports.TLD = TLD;
module.exports.RWAirdrop = RWAirdrop;
module.exports.utils = helpers;

// Error exports
module.exports.ODudeSDKError = ODudeSDKError;
module.exports.TokenNotFoundError = TokenNotFoundError;
module.exports.NameNotFoundError = NameNotFoundError;
module.exports.NetworkError = NetworkError;
module.exports.ConfigurationError = ConfigurationError;
module.exports.ContractNotConnectedError = ContractNotConnectedError;
module.exports.UnsupportedTLDError = UnsupportedTLDError;
module.exports.MintingError = MintingError;

// ESM compatibility
module.exports.default = ODudeSDK;

// Support for destructuring default export
module.exports.__esModule = true;

