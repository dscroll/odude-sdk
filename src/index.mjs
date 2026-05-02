/**
 * ODude SDK - ES Modules entry point
 * Modern ESM syntax for tree-shaking and optimal bundling
 */

import ODudeSDKClass from './ODudeSDK.js';
import RegistryClass from './contracts/Registry.js';
import ResolverClass from './contracts/Resolver.js';
import TLDClass from './contracts/TLD.js';
import RWAirdropClass from './contracts/RWAirdrop.js';
import * as helpersModule from './utils/helpers.js';
import {
  ODudeSDKError,
  TokenNotFoundError,
  NameNotFoundError,
  NetworkError,
  ConfigurationError,
  ContractNotConnectedError,
  UnsupportedTLDError,
  MintingError
} from './utils/errors.js';

// Default export
export default ODudeSDKClass;

// Named exports for tree-shaking
export const ODudeSDK = ODudeSDKClass;
export const Registry = RegistryClass;
export const Resolver = ResolverClass;
export const TLD = TLDClass;
export const RWAirdrop = RWAirdropClass;
export const utils = helpersModule;

// Error exports
export {
  ODudeSDKError,
  TokenNotFoundError,
  NameNotFoundError,
  NetworkError,
  ConfigurationError,
  ContractNotConnectedError,
  UnsupportedTLDError,
  MintingError
};

// Re-export all utilities
export * from './utils/helpers.js';

// Type exports are handled by the TypeScript declaration files
