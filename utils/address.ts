/**
 * Normalize and validate Ethereum address from environment variable
 * Fixes common issues like "Ox" instead of "0x" and validates format
 */
export function normalizeAddress(address: string | undefined | null): `0x${string}` | undefined {
  // Handle null/undefined
  if (!address) return undefined;
  
  // Ensure address is a string - CRITICAL: check type first to prevent .replace() errors
  if (typeof address !== 'string') {
    console.error('normalizeAddress received non-string value:', address, typeof address);
    return undefined;
  }
  
  try {
    const addressStr = address.trim();
    if (addressStr.length === 0) return undefined;
    
    // Fix common issues: replace "Ox" with "0x", remove whitespace
    let normalized = addressStr.replace(/^Ox/i, "0x");
  
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
  } catch (error) {
    console.error('Error normalizing address:', error);
    return undefined;
  }
}

/**
 * Get character manager address from environment
 * Default to the deployed contract address if env var is not set
 */
export function getCharacterManagerAddress(): `0x${string}` | undefined {
  const envAddress = normalizeAddress(process.env.NEXT_PUBLIC_CHARACTER_MANAGER_ADDRESS);
  
  // Use deployed contract address as fallback
  const defaultAddress = '0x892324719831df4cc0d3c4eac5b4abe1f17cadea' as `0x${string}`;
  
  if (envAddress) {
    // Validate that it matches the expected address
    if (envAddress.toLowerCase() !== defaultAddress.toLowerCase()) {
      console.warn('[getCharacterManagerAddress] Env address does not match expected address!', {
        env: envAddress,
        expected: defaultAddress
      });
    }
    return envAddress;
  }
  
  // Return default if env var is not set
  console.warn('[getCharacterManagerAddress] Using default contract address (env var not set)');
  return defaultAddress;
}

/**
 * Get gallery manager address from environment
 * Default to the deployed contract address if env var is not set
 */
export function getGalleryManagerAddress(): `0x${string}` | undefined {
  const envAddress = normalizeAddress(process.env.NEXT_PUBLIC_GALLERY_MANAGER_ADDRESS);
  
  // Use deployed contract address as fallback
  const defaultAddress = '0xb5bb348751f50aad00628bd532d8cc74a4694d2f' as `0x${string}`;
  
  if (envAddress) {
    // Validate that it matches the expected address
    if (envAddress.toLowerCase() !== defaultAddress.toLowerCase()) {
      console.warn('[getGalleryManagerAddress] Env address does not match expected address!', {
        env: envAddress,
        expected: defaultAddress
      });
    }
    return envAddress;
  }
  
  // Return default if env var is not set
  console.warn('[getGalleryManagerAddress] Using default contract address (env var not set)');
  return defaultAddress;
}



