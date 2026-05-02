function claimShare(string tldName, uint256 airdropId, string odudeName)
// Allows a domain owner to claim their share from a specific airdrop.

function createAirdrop(string tldName, address tokenAddress, uint256 totalAmount, uint256 perUserShare) returns (uint256)
// Creates a new token airdrop for all subdomains under a given TLD.

function getAirdropInfo(string tldName, uint256 airdropId) view returns (AirdropInfo)
// Retrieves detailed information about a specific airdrop.

function getClaimableAirdrops(address user) view returns (ClaimableAirdrop[])
// Returns all airdrops that the given user can currently claim.

function getDomainClaimedAmount(string odudeName, uint256 airdropId) view returns (uint256)
// Checks how much a specific domain has claimed from an airdrop.

function getRemainingAirdrop(string tldName, uint256 airdropId) view returns (uint256)
// Returns the remaining token balance in a given airdrop.

function getTLDAirdropCount(string tldName) view returns (uint256)
// Returns how many airdrops have been created under a TLD.

function getTLDAirdropIds(string tldName) view returns (uint256[])
// Lists all airdrop IDs for a specific TLD.

function getUserDomainsInTLD(address user, string tldName) view returns (string[])
// Returns all ODude names owned by a user under a specific TLD.

function hasDomainClaimed(string odudeName, uint256 airdropId) view returns (bool)
// Checks if a domain has already claimed from a specific airdrop.

function initialize(address initialOwner, address tldContract, address payable registryContract)
// Initializes the contract and links it with the TLD and Registry contracts.

function owner() view returns (address)
// Returns the current owner of the contract.

function proxiableUUID() view returns (bytes32)
// Used for UUPS proxy compatibility.

function renounceOwnership()
// Removes contract ownership from the current owner.

function syncMyDomains(string[] odudeNames)
// NEW: Domain holders sync all their domains at once. Replaces syncDomainOwnership.

function syncDomainOwnershipsAdmin(string[] odudeNames, address[] owners)
// NEW: Emergency/admin-only function for data recovery. Replaces batchSyncDomainOwnership.

function transferOwnership(address newOwner)
// Transfers contract ownership to another address.

function upgradeToAndCall(address newImplementation, bytes data) payable
// Upgrades contract logic (UUPS upgradeable function).

function withdrawAirdrop(string tldName, uint256 airdropId)
// Allows the TLD owner to withdraw remaining tokens from an expired airdrop.

function UPGRADE_INTERFACE_VERSION() view returns (string)
// Returns the version of the UUPS upgrade interface.

// ==================== DEPRECATED FUNCTIONS ====================
// The following functions have been removed in the latest contract version:

// function syncDomainOwnership(string odudeName, address owner) - REMOVED
// Replaced by syncMyDomains(string[] odudeNames)

// function batchSyncDomainOwnership(string[] odudeNames, address[] owners) - REMOVED
// Replaced by syncDomainOwnershipsAdmin(string[] odudeNames, address[] owners)
