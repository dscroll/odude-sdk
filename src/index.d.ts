// Main exports
export { ODudeSDK as default } from './ODudeSDK';
export { ODudeSDK } from './ODudeSDK';

// Contract exports
export { Registry, Resolver, TLD, RWAirdrop } from './contracts/types';

// Type exports
export * from './types';

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
} from './types';

// Utility exports
export { HelperUtils } from './types';
export {
  normalizeName,
  extractTLD,
  extractSubdomain,
  isTLD,
  isSubdomain,
  parseName,
  isValidAddress,
  formatTokenId,
  parseEther,
  formatEther,
  randomTokenId,
  isValidSubName,
  isValidTLD
} from './types';
export const utils: HelperUtils;

// Re-export ethers types that users might need
export type {
  Provider,
  Signer,
  Contract,
  ContractTransactionResponse,
  BigNumberish
} from 'ethers';
