import { Provider, Signer, Contract, ContractTransactionResponse, BigNumberish } from 'ethers';
import { 
  NFTMetadata, 
  ResolutionRecord, 
  ReverseRecord, 
  AirdropInfo, 
  MintEligibility,
  BatchResolutionResult,
  TransferCallback,
  NameResolvedCallback
} from '../types';

// ==================== Registry Contract ====================

export declare class Registry {
  address: string;
  contract: Contract;

  constructor(address: string, providerOrSigner: Provider | Signer);

  // Read-only functions
  name(): Promise<string>;
  symbol(): Promise<string>;
  totalSupply(): Promise<bigint>;
  ownerOf(tokenId: BigNumberish): Promise<string>;
  balanceOf(owner: string): Promise<bigint>;
  tokenOfOwnerByIndex(owner: string, index: BigNumberish): Promise<bigint>;
  tokenByIndex(index: BigNumberish): Promise<bigint>;
  tokenURI(tokenId: BigNumberish): Promise<string>;
  getApproved(tokenId: BigNumberish): Promise<string>;
  isApprovedForAll(owner: string, operator: string): Promise<boolean>;
  
  // ODude-specific functions
  getTokenId(name: string): Promise<bigint>;
  nameOf(tokenId: BigNumberish): Promise<string>;
  getOwnerByName(name: string): Promise<string>;
  getNFTMetadata(tokenId: BigNumberish): Promise<NFTMetadata>;
  
  // Batch operations
  getMultipleNames(tokenIds: BigNumberish[]): Promise<string[]>;
  getMultipleOwners(tokenIds: BigNumberish[]): Promise<string[]>;
  getMultipleTokenInfo(tokenIds: BigNumberish[]): Promise<Array<{
    tokenId: string;
    name: string;
    owner: string;
    tokenURI: string;
    metadata: NFTMetadata;
  }>>;
  getMultipleMetadata(tokenIds: BigNumberish[]): Promise<NFTMetadata[]>;

  // Write functions
  mintDomain(
    tokenId: BigNumberish,
    name: string,
    metadataURI: string,
    to: string,
    options?: { value?: BigNumberish }
  ): Promise<ContractTransactionResponse>;
  
  setReverse(tokenId: BigNumberish): Promise<ContractTransactionResponse>;
  setTokenURI(tokenId: BigNumberish, newTokenURI: string): Promise<ContractTransactionResponse>;
  approve(to: string, tokenId: BigNumberish): Promise<ContractTransactionResponse>;
  setApprovalForAll(operator: string, approved: boolean): Promise<ContractTransactionResponse>;
  transferFrom(from: string, to: string, tokenId: BigNumberish): Promise<ContractTransactionResponse>;
  safeTransferFrom(from: string, to: string, tokenId: BigNumberish, data?: string): Promise<ContractTransactionResponse>;

  // Admin/System functions
  getBalance(): Promise<bigint>;
  paused(): Promise<boolean>;
  owner(): Promise<string>;
  getTLDContract(): Promise<string>;
  getResolverContract(): Promise<string>;

  // Event listeners
  onTransfer(callback: TransferCallback): void;
  onTLDMinted(callback: (tokenId: bigint, name: string, owner: string) => void): void;
  onSubdomainMinted(callback: (tokenId: bigint, name: string, owner: string) => void): void;
  removeAllListeners(): void;
}

// ==================== Resolver Contract ====================

export declare class Resolver {
  address: string;
  contract: Contract;

  constructor(address: string, providerOrSigner: Provider | Signer);

  // Read-only functions
  resolve(name: string): Promise<string>;
  reverse(address: string): Promise<string>;
  nameExists(name: string): Promise<boolean>;
  hasReverse(address: string): Promise<boolean>;
  getResolutionRecord(name: string): Promise<ResolutionRecord>;
  getReverseRecord(address: string): Promise<ReverseRecord>;
  
  // Batch operations
  resolveMultiple(names: string[]): Promise<BatchResolutionResult[]>;
  reverseMultiple(addresses: string[]): Promise<Array<{
    address: string;
    name: string | null;
    resolved: boolean;
    error?: string;
  }>>;
  checkMultipleNamesExist(names: string[]): Promise<Array<{
    name: string;
    exists: boolean;
    error?: string;
  }>>;

  // Write functions
  setName(name: string, address: string): Promise<ContractTransactionResponse>;
  setReverse(name: string): Promise<ContractTransactionResponse>;

  // Event listeners
  onNameSet(callback: NameResolvedCallback): void;
  removeAllListeners(): void;
}

// ==================== TLD Contract ====================

export declare class TLD {
  address: string;
  contract: Contract;

  constructor(address: string, providerOrSigner: Provider | Signer);

  // Read-only functions
  getBaseTLDPrice(): Promise<bigint>;
  getTLDPrice(tldTokenId: BigNumberish): Promise<bigint>;
  getCommission(tldTokenId: BigNumberish): Promise<bigint>;
  getTLDOwner(tldTokenId: BigNumberish): Promise<string>;
  getTLDsByOwner(owner: string): Promise<bigint[]>;
  getErcToken(tldTokenId: BigNumberish): Promise<string>;
  getTLDToken(tldTokenId: BigNumberish): Promise<string>;
  getTLD(tldTokenId: BigNumberish): Promise<any>;
  getTLDId(tldName: string): Promise<bigint>;
  tldExists(tldTokenId: BigNumberish): Promise<boolean>;
  isTLDActive(tldTokenId: BigNumberish): Promise<boolean>;
  getTLDName(tldTokenId: BigNumberish): Promise<string>;
  getDefaultCommission(): Promise<bigint>;
  getRegistryContract(): Promise<string>;
  owner(): Promise<string>;
  
  // Domain minting functions
  checkMintEligibility(domainName: string): Promise<MintEligibility>;
  estimateMintCost(domainName: string): Promise<bigint>;
  mintDomain(
    domainName: string,
    to: string,
    options?: { value?: BigNumberish },
    registryContract?: any
  ): Promise<ContractTransactionResponse>;

  // Write functions
  setBaseTLDPrice(price: BigNumberish): Promise<ContractTransactionResponse>;
  setTLDPrice(tldTokenId: BigNumberish, price: BigNumberish): Promise<ContractTransactionResponse>;
  setCommission(tldTokenId: BigNumberish, commission: BigNumberish): Promise<ContractTransactionResponse>;
  setErcToken(tldTokenId: BigNumberish, tokenAddress: string): Promise<ContractTransactionResponse>;
  setDefaultCommission(commission: BigNumberish): Promise<ContractTransactionResponse>;
  setRegistryContract(registryContract: string): Promise<ContractTransactionResponse>;
  registerTLD(tldTokenId: BigNumberish, tldName: string, owner: string): Promise<ContractTransactionResponse>;
  syncTLDOwnership(tldTokenId: BigNumberish, newOwner: string): Promise<ContractTransactionResponse>;
  transferOwnership(newOwner: string): Promise<ContractTransactionResponse>;
  renounceOwnership(): Promise<ContractTransactionResponse>;

  // Event listeners
  onTLDPriceSet(callback: Function): void;
  onCommissionSet(callback: Function): void;
  onTLDOwnershipTransferred(callback: Function): void;
  removeAllListeners(): void;
}

// ==================== RWAirdrop Contract ====================

export declare class RWAirdrop {
  address: string;
  contract: Contract;

  constructor(address: string, providerOrSigner: Provider | Signer);

  // Read-only functions
  getClaimableAirdrops(user: string): Promise<any[]>;
  getAirdropInfoByTLD(tldName: string, airdropId: BigNumberish): Promise<any>;
  getDomainClaimedAmount(odudeName: string, airdropId: BigNumberish): Promise<bigint>;
  getRemainingAirdrop(tldName: string, airdropId: BigNumberish): Promise<bigint>;
  getTLDAirdropCount(tldName: string): Promise<bigint>;
  getTLDAirdropIds(tldName: string): Promise<bigint[]>;
  getUserDomainsInTLD(user: string, tldName: string): Promise<string[]>;
  hasDomainClaimed(odudeName: string, airdropId: BigNumberish): Promise<boolean>;
  isAirdropActive(tldName: string, airdropId: BigNumberish): Promise<boolean>;
  owner(): Promise<string>;

  // Write functions
  claimShare(tldName: string, airdropId: BigNumberish, odudeName: string, options?: any): Promise<ContractTransactionResponse>;
  createAirdrop(tldName: string, tokenAddress: string, totalAmount: BigNumberish, perUserShare: BigNumberish, options?: any): Promise<ContractTransactionResponse>;
  withdrawAirdrop(tldName: string, airdropId: BigNumberish, options?: any): Promise<ContractTransactionResponse>;

  // New sync functions (v2.0+)
  syncMyDomains(odudeNames: string[], options?: any): Promise<ContractTransactionResponse>;
  syncDomainOwnershipsAdmin(odudeNames: string[], owners: string[], options?: any): Promise<ContractTransactionResponse>;

  // Event listeners
  onClaimed(callback: Function): void;
  onAirdropCreated(callback: Function): void;
  onDomainOwnershipUpdated(callback: Function): void;
  removeAllListeners(): void;

  // Helper functions
  getAirdropDetails(tldName: string, airdropId: BigNumberish): Promise<any>;
}
