import { Provider, Signer, ContractTransactionResponse, BigNumberish } from 'ethers';
import { Registry, Resolver, TLD, RWAirdrop } from './contracts/types';
import {
  ODudeSDKConfig,
  ContractAddresses,
  NetworkInfo,
  NameInfo,
  TldInfo,
  AirdropInfo,
  NameListItem,
  AllNamesItem,
  HelperUtils,
  TransferCallback,
  NameResolvedCallback,
  DomainMintedCallback,
  MultiNetworkTransferCallback,
  MultiNetworkNameResolvedCallback,
  MintEligibility
} from './types';

export declare class ODudeSDK {
  config: ODudeSDKConfig;
  providers: Record<string, Provider>;
  signers: Record<string, Signer>;
  contracts: Record<string, {
    registry?: Registry;
    resolver?: Resolver;
    tld?: TLD;
    rwairdrop?: RWAirdrop;
  }>;
  networkConfig: any;
  currentNetwork: string | null;

  constructor(config?: ODudeSDKConfig);

  // ==================== Network Management ====================
  
  getNetworkForTLD(tld: string): string;
  getProvider(networkOrTld?: string | null): Provider;
  getSigner(networkOrTld?: string | null): Signer | null;
  
  connect(addresses: ContractAddresses, network?: string | null): void;

  connectNetwork(network?: string | null): void;
  connectAllNetworks(): string[];
  connectSigner(signer: Signer, network?: string | null): void;

  // ==================== Contract Access ====================
  
  registry(networkOrTld?: string | null): Registry;
  resolver(networkOrTld?: string | null): Resolver;
  tld(networkOrTld?: string | null): TLD;
  rwairdrop(networkOrTld?: string | null): RWAirdrop;

  // ==================== Convenience Methods ====================
  
  resolve(name: string): Promise<string>;
  reverse(address: string, networkOrTld?: string | null): Promise<string>;
  getOwner(name: string): Promise<string>;
  getOwnerSafe(name: string): Promise<string | null>;
  domainExists(name: string): Promise<boolean>;
  getDomainStatus(name: string): Promise<DomainStatus>;
  getNameInfo(name: string): Promise<NameInfo>;
  getTldInfo(tldName: string): Promise<TldInfo>;
  getAirdropInfo(address: string, networkOrTld?: string | null): Promise<AirdropInfo>;
  checkMintEligibility(domainName: string): Promise<MintEligibility>;

  // ==================== Domain and TLD Management ====================

  mintDomain(
    domainName: string,
    toAddress: string,
    options?: { value?: BigNumberish; gasLimit?: number }
  ): Promise<ContractTransactionResponse>;

  mintTLD(
    tldName: string,
    toAddress: string,
    options?: { value?: BigNumberish; gasLimit?: number }
  ): Promise<ContractTransactionResponse>;

  // ==================== Extended Functions ====================
  
  getTotalNames(address: string): Promise<bigint>;
  getNamesList(address: string): Promise<NameListItem[]>;
  getNameDetails(name: string): Promise<{
    name: string;
    tokenId: string;
    owner: string;
    metadata: any;
    tokenURI: string;
    exists: boolean;
    resolvedAddress: string | null;
  }>;
  getNameById(tokenId: number | string | bigint): Promise<string>;
  getAllNames(startIndex?: number, count?: number): Promise<AllNamesItem[]>;

  getApproved(tokenId: number | string | bigint): Promise<string>;

  // ==================== Network Information ====================
  
  NetworkList(): NetworkInfo;
  displayNetworkList(): NetworkInfo;

  // ==================== Event Monitoring ====================
  
  onTransfer(callback: TransferCallback, networkOrTld?: string | null): void;
  onNameResolved(callback: NameResolvedCallback, networkOrTld?: string | null): void;
  onDomainMinted(callback: DomainMintedCallback, networkOrTld?: string | null): void;
  onTransferAllNetworks(callback: MultiNetworkTransferCallback): void;
  onNameResolvedAllNetworks(callback: MultiNetworkNameResolvedCallback): void;
  removeAllListeners(networkOrTld?: string | null): void;
  removeAllListenersAllNetworks(): void;

  // ==================== Utilities ====================
  
  get utils(): HelperUtils;
}
