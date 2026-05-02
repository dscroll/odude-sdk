// ===== View / Read Functions =====

function UPGRADE_INTERFACE_VERSION() view; 
// Returns the current UUPS upgrade interface version.

function getName(uint256 tokenId) view; 
// Returns the domain name linked to a given tokenId.

function getRegistryContract() view; 
// Returns the address of the linked Registry contract.

function getResolutionRecord(string name) view; 
// Returns resolution details (address, name, tokenId, exists) for a domain.

function getReverseRecord(address addr) view; 
// Returns reverse record (primary name, tokenId, exists) for a wallet.

function getTokenId(string name) view; 
// Returns tokenId for a given domain name.

function hasReverse(address addr) view; 
// Checks if a wallet has a reverse record set.

function nameExists(string name) view; 
// Returns true if a name record exists in the resolver.

function owner() view; 
// Returns the owner (admin) of the resolver contract.

function proxiableUUID() view; 
// Returns UUID for the UUPS proxy system.

function resolve(string name) view; 
// Resolves a domain name → wallet address.

function reverse(address addr) view; 
// Resolves a wallet address → primary domain name.


// ===== Write / State-Changing Functions =====

function initialize(address initialOwner) nonpayable; 
// Initializes the contract (used instead of constructor).

function removeNameRecord(string name) nonpayable; 
// Removes a name record from the resolver.

function removeReverse(address addr) nonpayable; 
// Removes reverse record for a given address.

function renounceOwnership() nonpayable; 
// Removes ownership (sets owner = zero address).

function setNameRecord(string name, address resolvedAddress, uint256 tokenId) nonpayable; 
// Creates or updates a domain name record → wallet address.

function setRegistryContract(address registryContract) nonpayable; 
// Links the resolver to the Registry contract.

function setReverse(address addr, string name, uint256 tokenId) nonpayable; 
// Sets or updates reverse record (wallet → name).

function transferOwnership(address newOwner) nonpayable; 
// Transfers ownership to a new admin.

function upgradeToAndCall(address newImplementation, bytes data) payable; 
// Upgrades contract implementation (UUPS pattern).

