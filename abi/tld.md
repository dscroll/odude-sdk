// ========== VIEW FUNCTIONS (read-only) ==========
function UPGRADE_INTERFACE_VERSION() view returns (string);
// Returns the version string of the upgradeable interface.

function getBaseTLDPrice() view returns (uint256);
// Returns the base price for minting or registering new TLDs.

function getDefaultCommission() view returns (uint256);
// Returns the default commission percentage applied to TLDs.

function getRegistryContract() view returns (address);
// Returns the address of the linked Registry contract.

function getTLD(uint256 id) view returns (TLDInfo);
// Returns all information about a TLD by its ID (name, price, owner, etc.).

function getTLDCommission(uint256 id) view returns (uint256);
// Returns the custom commission for a specific TLD.

function getTLDId(string name) view returns (uint256);
// Returns the unique ID assigned to a TLD name.

function getTLDOwner(uint256 id) view returns (address);
// Returns the owner address of a specific TLD.

function getTLDPrice(uint256 id) view returns (uint256);
// Returns the price set for a specific TLD.

function getTLDToken(uint256 id) view returns (address);
// Returns the ERC20 token address associated with a TLD (if any).

function getTLDsByOwner(address owner) view returns (uint256[]);
// Returns a list of all TLD IDs owned by a given address.

function owner() view returns (address);
// Returns the owner (admin) of the TLD contract.

function proxiableUUID() view returns (bytes32);
// Returns the UUID used by UUPS proxy for upgrade compatibility.

function tldExists(uint256 id) view returns (bool);
// Checks whether a TLD with the given ID exists or not.


// ========== WRITE FUNCTIONS (state-changing) ==========
function initialize(address initialOwner);
// Initializes the contract and sets the initial owner (only once).

function registerTLD(uint256 id, string name, address tldOwner);
// Registers a new Top-Level Domain (TLD) with given ID, name, and owner.

function setBaseTLDPrice(uint256 price);
// Sets the base price for creating new TLDs (only callable by owner).

function setDefaultCommission(uint256 commission);
// Sets the default commission rate applied to all TLDs (only owner).

function setRegistryContract(address registryContract);
// Links the TLD contract with the Registry contract (only owner).

function setTLDCommission(uint256 id, uint256 commission);
// Sets a specific commission rate for a given TLD.

function setTLDPrice(uint256 id, uint256 price);
// Sets a specific minting price for a given TLD.

function setTLDToken(uint256 id, address token);
// Binds a custom ERC20 token as the payment method for a TLD.

function transferOwnership(address newOwner);
// Transfers ownership of the entire TLD contract to a new admin.

function syncTLDOwnership(uint256 id, address newOwner);
// Synchronizes TLD ownership with the Registry contract (Registry/Owner only).

function renounceOwnership();
// Removes the current owner, making the contract ownerless.

function upgradeToAndCall(address newImplementation, bytes data) payable;
// Upgraded the contract implementation (UUPS pattern) and optionally calls setup logic.


// ========== DATA STRUCTURES ==========
struct TLDInfo {
    uint256 id;          // Unique ID for the TLD
    string name;         // TLD name (e.g., "fil")
    uint256 price;       // Subdomain minting price (0 = free, 1982 = locked)
    uint256 commission;  // Commission percentage for TLD owner (0-99)
    address erc20Token;  // Associated ERC20 token for payments (address(0) for native)
    address owner;       // TLD owner address
    bool exists;         // Whether the TLD exists
}


// ========== EVENTS ==========
event TLDRegistered(uint256 indexed id, string indexed name, address indexed owner);
// Emitted when a new TLD is registered.

event TLDPriceSet(uint256 indexed id, uint256 price);
// Emitted when the subdomain minting price for a TLD is updated.

event TLDCommissionSet(uint256 indexed id, uint256 commission);
// Emitted when the commission percentage for a TLD is updated.

event TLDAllowanceSet(uint256 indexed id, uint256 allowance);
// Emitted when a TLD allowance is set.

event ERC20TokenSet(uint256 indexed id, address indexed token);
// Emitted when an ERC20 token is associated with a TLD for payments.

event TLDOwnershipTransferred(uint256 indexed id, address indexed previousOwner, address indexed newOwner);
// Emitted when ownership of a specific TLD is synchronized or changed.

event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
// Emitted when the owner of the TLD contract (admin) is changed.

event Upgraded(address indexed implementation);
// Emitted when the contract implementation is upgraded.
