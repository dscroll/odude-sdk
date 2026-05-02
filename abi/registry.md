// ========== VIEW FUNCTIONS (read-only) ==========

function UPGRADE_INTERFACE_VERSION() view returns (string);
// Returns the version string for the upgradeable interface.

function balanceOf(address owner) view returns (uint256);
// Returns the number of domains owned by an address.

function getApproved(uint256 tokenId) view returns (address);
// Returns the address approved to manage the specified token.

function getBalance() view returns (uint256);
// Returns the total ETH balance held in the contract.

function getNFTMetadata(uint256 tokenId) view returns (NFTMetadata);
// Returns metadata (id, name, isTLD, parentTLD) for a domain NFT.

function getOwnerByName(string name) view returns (address);
// Returns the owner's address for a given domain name.

function getResolverContract() view returns (address);
// Returns the address of the Resolver contract.

function getTLDContract() view returns (address);
// Returns the address of the TLD contract.

function getTokenId(string name) view returns (uint256);
// Returns the NFT token ID associated with a domain name.

function isApprovedForAll(address owner, address operator) view returns (bool);
// Checks if an operator is approved to manage all of an owner's tokens.

function name() view returns (string);
// Returns the name of the ERC721 token (e.g., "ODude Name Registry").

function nameOf(uint256 tokenId) view returns (string);
// Returns the domain name string for a specific token ID.

function owner() view returns (address);
// Returns the contract owner (admin address).

function ownerOf(uint256 tokenId) view returns (address);
// Returns the wallet address that owns a specific token.

function paused() view returns (bool);
// Returns true if the contract is currently paused.

function proxiableUUID() view returns (bytes32);
// Returns the UUID used by the UUPS proxy for upgrades.

function supportsInterface(bytes4 interfaceId) view returns (bool);
// Checks if the contract supports a specific interface ID.

function symbol() view returns (string);
// Returns the ERC721 symbol (e.g., "ODN").

function tokenByIndex(uint256 index) view returns (uint256);
// Returns a token ID at a given global index (used for enumeration).

function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256);
// Returns a token ID owned by an address at a specific index.

function tokenURI(uint256 tokenId) view returns (string);
// Returns the metadata URI for a given token.

function totalSupply() view returns (uint256);
// Returns total number of NFTs minted in the registry.


// ========== WRITE FUNCTIONS (state-changing) ==========

function initialize(address initialOwner);
// Initializes the contract (only once) and sets the owner.

function mintDomain(uint256 tokenId, string name, string tokenUri, address to) payable;
// Mints a new domain NFT (either TLD or subdomain) and assigns it to a user.

function setContracts(address tldContract, address resolverContract);
// Links the Registry contract with the TLD and Resolver contracts.

function setReverse(uint256 tokenId) payable;
// Sets reverse record (maps wallet to domain name).

function setTokenURI(uint256 tokenId, string newTokenURI) payable;
// Updates the metadata URI for an existing domain NFT.

function approve(address to, uint256 tokenId);
// Grants permission to another address to transfer a specific token.

function setApprovalForAll(address operator, bool approved);
// Approves or removes an operator to manage all user tokens.

function transferFrom(address from, address to, uint256 tokenId);
// Transfers ownership of a domain NFT to another address.

function safeTransferFrom(address from, address to, uint256 tokenId);
// Safely transfers an NFT to another address (ERC721 standard).

function safeTransferFrom(address from, address to, uint256 tokenId, bytes data);
// Same as above, with optional data payload for smart contract receivers.

function transferOwnership(address newOwner);
// Transfers contract ownership to another address.

function renounceOwnership();
// Removes contract owner privileges (makes contract ownerless).

function pause();
// Pauses minting and transfers (only owner).

function unpause();
// Unpauses contract operations.

function withdraw();
// Withdraws accumulated ETH from the contract to the owner.

function withdrawERC20(address tokenAddress, uint256 amount);
// Withdraws a specific ERC20 token balance from the contract.

function upgradeToAndCall(address newImplementation, bytes data) payable;
// Upgrades the contract to a new implementation and optionally executes setup logic.


// ========== SPECIAL FUNCTIONS ==========

receive() external payable;
// Accepts ETH sent directly to the contract.

fallback() external payable;
// Fallback function to handle direct calls or payments.
