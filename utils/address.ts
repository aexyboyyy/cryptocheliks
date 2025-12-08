/**
 * Normalize and validate Ethereum address from environment variable
 * Fixes common issues like "Ox" instead of "0x" and validates format
 */
export function normalizeAddress(address: string | undefined): `0x${string}` | undefined {
  if (!address || address.length === 0) return undefined;
  
  // Fix common issues: replace "Ox" with "0x", remove whitespace
  let normalized = address.trim().replace(/^Ox/i, "0x");
  
  // Ensure it starts with 0x
  if (!normalized.startsWith("0x")) {
    normalized = "0x" + normalized;
  }
  
  // Validate length (should be 42 characters: 0x + 40 hex chars)
  if (normalized.length !== 42) {
    console.error("Invalid address length:", normalized, "Expected 42 characters");
    return undefined;
  }
  
  // Validate hex characters
  if (!/^0x[0-9a-fA-F]{40}$/.test(normalized)) {
    console.error("Invalid address format (must be hex):", normalized);
    return undefined;
  }
  
  return normalized.toLowerCase() as `0x${string}`;
}

/**
 * Get character manager address from environment
 */
export function getCharacterManagerAddress(): `0x${string}` | undefined {
  return normalizeAddress(process.env.NEXT_PUBLIC_CHARACTER_MANAGER_ADDRESS);
}

/**
 * Get gallery manager address from environment
 */
export function getGalleryManagerAddress(): `0x${string}` | undefined {
  return normalizeAddress(process.env.NEXT_PUBLIC_GALLERY_MANAGER_ADDRESS);
}



