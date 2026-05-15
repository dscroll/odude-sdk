import { Provider, Signer, Contract, ContractTransactionResponse, BigNumberish } from 'ethers';

// ==================== Configuration Types ====================

export interface ODudeSDKConfig {
  /** Single RPC URL (legacy, optional if provider is provided) */
  rpcUrl?: string;
  /** Base Mainnet RPC URL */
  rpcUrl_base?: string;
  /** BNB Smart Chain RPC URL */
  rpcUrl_bnb?: string;
  /** Base Sepolia RPC URL */
  rpcUrl_sepolia?: string;
  /** Ethers provider */
  provider?: Provider;
  /** Ethers signer */
  signer?: Signer;
  /** Private key for signing */
  privateKey?: string;
  /** Contract addresses */
  addresses?: ContractAddresses;
}

export interface ContractAddresses {
  Registry?: string;
  Resolver?: string;
  TLD?: string;
  RWAirdrop?: string;
}

export interface NetworkConfig {
  name: string;
  chainId: number;
  defaultRpcUrl: string;
  rpcUrlEnvVar?: string;
  contracts: ContractAddresses;
}

export interface NetworkInfo {
  supportedNetworks: Record<string, NetworkConfig & {
    isConnected: boolean;
    hasContracts: boolean;
  }>;
  currentNetwork: string | null;
  connectedNetworks: string[];
  tldMappings: Record<string, string>;
  defaultNetwork: string;
}

// ==================== Data Types ====================

export interface NameInfo {
  name: string;
  tokenId: bigint;
  owner: string;
  metadata: NFTMetadata;
  tokenURI: string;
  resolvedAddress: string;
  exists: boolean;
  network: string;
}

export interface DomainStatus {
  name: string;
  exists: boolean;
  owner: string | null;
  canMint: boolean;
  mintEligibility: any | null;
  inAirdropContract: boolean;
  claimableAirdrops: number;
  airdropDetails: any[];
}

export interface TldInfo {
  tokenId: bigint;
  name: string;
  getTLDOwner: string;
  resolvedAddress: string | null;
  getTLDPrice: bigint;
  getCommission: bigint;
  getErcToken: string;
  getTokenPrice: bigint;
  isTLDActive: boolean;
  network: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface ResolutionRecord {
  resolvedAddress: string;
  name: string;
  tokenId: bigint;
  exists: boolean;
}

export interface ReverseRecord {
  primaryName: string;
  primaryTokenId: bigint;
  exists: boolean;
}

export interface AirdropInfo {
  eligible: boolean;
  claimed: boolean;
  claimableAmount: bigint;
  isActive: boolean;
  canClaim: boolean;
}

export interface MintEligibility {
  eligible: boolean;
  available: boolean;
  tldActive: boolean;
  cost: bigint;
  reason: string;
}

export interface ParsedName {
  full: string;
  tld: string;
  subdomain: string;
  parts: string[];
  isTLD: boolean;
  isSubdomain: boolean;
}

export interface NameListItem {
  tokenId: string;
  name: string;
}

export interface AllNamesItem extends NameListItem {
  owner: string;
}

export interface BatchResolutionResult {
  name: string;
  address: string | null;
  resolved: boolean;
  error?: string;
}

// ==================== Error Types ====================

export class ODudeSDKError extends Error {
  code: string | null;
  constructor(message: string, code?: string | null);
}

export class TokenNotFoundError extends ODudeSDKError {
  tokenId: BigNumberish;
  constructor(tokenId: BigNumberish);
}

export class NameNotFoundError extends ODudeSDKError {
  name: string;
  constructor(name: string);
}

export class NetworkError extends ODudeSDKError {
  networkName: string | null;
  constructor(message: string, networkName?: string | null);
}

export class ConfigurationError extends ODudeSDKError {
  constructor(message: string);
}

export class ContractNotConnectedError extends ODudeSDKError {
  contractName: string;
  constructor(contractName: string);
}

export class UnsupportedTLDError extends ODudeSDKError {
  tld: string;
  constructor(tld: string);
}

export class MintingError extends ODudeSDKError {
  domainName: string | null;
  constructor(message: string, domainName?: string | null);
}

// ==================== Utility Types ====================

export interface HelperUtils {
  normalizeName(name: string): string;
  extractTLD(name: string): string;
  extractSubdomain(name: string): string;
  isTLD(name: string): boolean;
  isSubdomain(name: string): boolean;
  parseName(name: string): ParsedName;
  isValidAddress(address: string): boolean;
  formatTokenId(tokenId: BigNumberish): string;
  parseEther(value: string): bigint;
  formatEther(value: BigNumberish): string;
  randomTokenId(): number;
  isValidSubName(domainName: string): boolean;
  isValidTLD(tldName: string): boolean;
}

export declare function normalizeName(name: string): string;
export declare function extractTLD(name: string): string;
export declare function extractSubdomain(name: string): string;
export declare function isTLD(name: string): boolean;
export declare function isSubdomain(name: string): boolean;
export declare function parseName(name: string): ParsedName;
export declare function isValidAddress(address: string): boolean;
export declare function formatTokenId(tokenId: BigNumberish): string;
export declare function parseEther(value: string): bigint;
export declare function formatEther(value: BigNumberish): string;
export declare function randomTokenId(): number;
export declare function isValidSubName(domainName: string): boolean;
export declare function isValidTLD(tldName: string): boolean;

// ==================== Event Callback Types ====================

export type TransferCallback = (from: string, to: string, tokenId: bigint) => void;
export type NameResolvedCallback = (name: string, address: string) => void;
export type DomainMintedCallback = (name: string, owner: string) => void;
export type MultiNetworkTransferCallback = (from: string, to: string, tokenId: bigint, network: string) => void;
export type MultiNetworkNameResolvedCallback = (name: string, address: string, network: string) => void;
