/**
 * Helper utilities for ODude SDK
 */

/**
 * Normalize ODude name to lowercase
 * @param {string} name - The ODude name
 * @returns {string} Normalized name
 */
export function normalizeName(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('Invalid name: must be a non-empty string');
  }
  return name.toLowerCase().trim();
}

/**
 * Extract TLD from a full ODude name
 * @param {string} name - Full ODude name (e.g., "alice@crypto" or "bob@alice@crypto")
 * @returns {string} The TLD portion
 */
export function extractTLD(name) {
  const normalized = normalizeName(name);
  const parts = normalized.split('@');
  if (parts.length === 0) {
    throw new Error('Invalid name format');
  }
  return parts[parts.length - 1];
}

/**
 * Extract subdomain from a full ODude name
 * @param {string} name - Full ODude name (e.g., "alice.odude")
 * @returns {string|null} The subdomain portion or null if it's a TLD
 */
export function extractSubdomain(name) {
  const normalized = normalizeName(name);
  const parts = normalized.split('.');
  if (parts.length <= 1) {
    return null;
  }
  return parts.slice(0, -1).join('.');
}

/**
 * Check if a name is a TLD (single part)
 * @param {string} name - The ODude name
 * @returns {boolean} True if it's a TLD
 */
export function isTLD(name) {
  const normalized = normalizeName(name);
  return !normalized.includes('.');
}

/**
 * Check if a name is a subdomain (multiple parts)
 * @param {string} name - The ODude name
 * @returns {boolean} True if it's a subdomain
 */
export function isSubdomain(name) {
  return !isTLD(name);
}

/**
 * Parse a full ODude name into components
 * @param {string} name - Full ODude name
 * @returns {Object} Object with tld, subdomain, and parts
 */
export function parseName(name) {
  const normalized = normalizeName(name);
  const parts = normalized.split('@');
  
  return {
    full: normalized,
    tld: parts[parts.length - 1],
    subdomain: parts.length > 1 ? parts.slice(0, -1).join('@') : null,
    parts: parts,
    isTLD: parts.length === 1,
    isSubdomain: parts.length > 1
  };
}

/**
 * Validate Ethereum address
 * @param {string} address - Ethereum address
 * @returns {boolean} True if valid
 */
export function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Format token ID to string
 * @param {*} tokenId - Token ID (can be BigInt, number, or string)
 * @returns {string} Formatted token ID
 */
export function formatTokenId(tokenId) {
  if (typeof tokenId === 'bigint') {
    return tokenId.toString();
  }
  if (typeof tokenId === 'number') {
    return tokenId.toString();
  }
  return String(tokenId);
}

/**
 * Format ether value to wei
 * @param {string|number} ether - Ether value
 * @returns {bigint} Wei value
 */
export function parseEther(ether) {
  const { parseEther: ethersParseEther } = require('ethers');
  return ethersParseEther(String(ether));
}

/**
 * Format wei value to ether
 * @param {bigint|string} wei - Wei value
 * @returns {string} Ether value
 */
export function formatEther(wei) {
  const { formatEther: ethersFormatEther } = require('ethers');
  return ethersFormatEther(wei);
}

/**
 * Generate a random 10-digit token ID
 * @returns {number} Random 10-digit number
 */
export function randomTokenId() {
  // Generate a random number between 1000000000 and 9999999999 (10 digits)
  return Math.floor(Math.random() * 9000000000) + 1000000000;
}

/**
 * Validate if a sub-name is valid according to ODude naming rules
 * @param {string} domainName - The domain name to validate (e.g., "test@sepolia")
 * @returns {boolean} True if the sub-name is valid
 */
export function isValidSubName(domainName) {
  if (!domainName || typeof domainName !== 'string') {
    return false;
  }

  // Count @ symbols - should have exactly 1 for sub-names
  const atCount = (domainName.match(/@/g) || []).length;
  if (atCount !== 1) return false;

  // Regular expressions for validation
  const validFormatRegex = /^[a-z\d]([a-z\d.]*[a-z\d])?(@[a-z\d]([a-z\d.]*[a-z\d])?)*$/i;
  const maxLengthRegex = /^.{1,253}$/;
  const segmentLengthRegex = /^[^@]{1,63}(@[^@]{1,63})*$/;

  // Validate the domain name
  return validFormatRegex.test(domainName) &&
         maxLengthRegex.test(domainName) &&
         segmentLengthRegex.test(domainName);
}

/**
 * Validate if a TLD name is valid according to ODude naming rules
 * @param {string} tldName - The TLD name to validate (e.g., "crypto", "sepolia")
 * @returns {boolean} True if the TLD name is valid
 */
export function isValidTLD(tldName) {
  if (!tldName || typeof tldName !== 'string') {
    return false;
  }

  // TLD should not contain @ symbols
  if (tldName.includes('@')) return false;

  // Regular expressions for TLD validation
  const validFormatRegex = /^[a-z\d]([a-z\d.]*[a-z\d])?$/i;
  const maxLengthRegex = /^.{1,63}$/; // TLD max length is 63 characters
  const minLengthRegex = /^.{2,}$/; // TLD min length is 2 characters

  // Validate the TLD name
  return validFormatRegex.test(tldName) &&
         maxLengthRegex.test(tldName) &&
         minLengthRegex.test(tldName);
}

const helpers = {
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
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = helpers;
}

export default helpers;

