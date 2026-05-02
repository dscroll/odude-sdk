# Airdrop Examples

This folder contains examples demonstrating how to use the ODude SDK's airdrop functionality.

## Overview

The airdrop system allows TLD owners to distribute ERC20 tokens to domain holders within their TLD. Domain holders can claim their share of the airdrop tokens.

## Examples

### 1. Create Airdrop (`create-airdrop.js`)
Creates a new airdrop for a specific TLD.

**Features:**
- Check token balance and allowance
- Approve tokens for the RWAirdrop contract
- Create an airdrop with specified parameters
- Verify airdrop creation

**Usage:**
```bash
node examples/airdrop/create-airdrop.js
```

**Configuration:**
- `TOKEN_ADDRESS`: ERC20 token contract address
- `TLD_NAME`: Target TLD for the airdrop
- `TOTAL_AMOUNT`: Total tokens to distribute
- `PER_USER_SHARE`: Amount each domain can claim

---

### 2. List Airdrops by Wallet (`list-airdrops-by-wallet.js`)
Lists all claimable airdrops for a specific wallet address.

**Features:**
- Display all claimable airdrops for a wallet
- Show token information for each airdrop
- Group airdrops by TLD
- Check domain ownership

**Usage:**
```bash
node examples/airdrop/list-airdrops-by-wallet.js
```

**Configuration:**
- `WALLET_ADDRESS`: The wallet address to check (defaults to env variable)

---

### 3. List Airdrops by TLD (`list-airdrops-by-tld.js`)
Lists all airdrops for a specific TLD.

**Features:**
- Display all airdrops for a TLD
- Show detailed airdrop information
- Display statistics (active, withdrawn, remaining balance)
- Check TLD existence and ownership

**Usage:**
```bash
node examples/airdrop/list-airdrops-by-tld.js
```

**Configuration:**
- `TLD_NAME`: The TLD to check for airdrops

---

### 4. Claim Airdrop (`claim-airdrop.js`)
Claims airdrop shares for domains owned by the current wallet.

**Features:**
- Check owned domains in a TLD
- Sync domain ownership to RWAirdrop contract
- Claim airdrop shares for all eligible domains
- Display claim summary and token balances

**Usage:**
```bash
node examples/airdrop/claim-airdrop.js
```

**Configuration:**
- `TLD_NAME`: The TLD to claim airdrops from
- Requires `PRIVATE_KEY` in `.env` file

---

### 5. Sync Domain Ownership (`sync-domain-ownership.js`)
Synchronizes domain ownership between Registry and RWAirdrop contracts.

**Features:**
- Check domains in Registry contract
- Check domains in RWAirdrop contract
- Sync all owned domains using `syncMyDomains`
- Verify synchronization and check claimable airdrops

**Usage:**
```bash
node examples/airdrop/sync-domain-ownership.js
```

**Requirements:**
- Requires `PRIVATE_KEY` in `.env` file

---

## Shared Utilities (`utils.js`)

Common functions used across airdrop examples:

- `getTokenInfo()`: Fetch ERC20 token information
- `initializeSDK()`: Initialize SDK and connect to network
- `getUserDomainsInTLD()`: Get user domains with fallback
- `displayAirdropInfo()`: Format and display airdrop details
- `displayClaimableAirdrop()`: Format and display claimable airdrop

---

## Typical Workflow

1. **Create a TLD** (if not exists)
   ```bash
   node examples/TLDMint.js
   ```

2. **Register domains in the TLD**
   ```bash
   node examples/SubNameMint.js
   ```

3. **Create an airdrop for the TLD**
   ```bash
   node examples/airdrop/create-airdrop.js
   ```

4. **Sync domain ownership** (required before claiming)
   ```bash
   node examples/airdrop/sync-domain-ownership.js
   ```

5. **Check claimable airdrops**
   ```bash
   node examples/airdrop/list-airdrops-by-wallet.js
   ```

6. **Claim airdrop shares**
   ```bash
   node examples/airdrop/claim-airdrop.js
   ```

---

## Environment Variables

Required in `.env` file:

```env
# Required for read-only operations
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Required for write operations (create, claim, sync)
PRIVATE_KEY=your_private_key_here

# Optional: Default wallet address for list-airdrops-by-wallet.js
WALLET_ADDRESS=0x...
```

---

## Notes

- Only Base Sepolia network is currently working
- Domain ownership must be synced before claiming airdrops
- Each domain can only claim once per airdrop
- Airdrops must be active to be claimable
- Sufficient gas fees (ETH) required for transactions

