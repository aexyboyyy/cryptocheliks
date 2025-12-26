// FHE encryption utilities - everything encrypted/decrypted via Zama FHEVM Relayer
// All encrypted data lives on-chain, we decrypt it on the fly when needed

let relayerInstance: any = null
let isInitializing = false
let initPromise: Promise<any> | null = null

const CONTRACT_ADDRESS = '0x892324719831df4CC0d3c4eAc5B4aBe1f17CAdea' // CharacterManager contract address

// Convert Uint8Array to hex string (0x... format) for viem contract calls
// Ensures the result is exactly 32 bytes (bytes32) for contract compatibility
function uint8ArrayToHex(uint8Array: Uint8Array | string): string {
  // If it's already a string, validate and return
  if (typeof uint8Array === 'string') {
    // If it already starts with 0x, validate length
    if (uint8Array.startsWith('0x')) {
      // bytes32 = 32 bytes = 64 hex chars + 0x = 66 chars total
      // If longer, take first 64 hex chars (characters 2-65, 0-indexed)
      if (uint8Array.length > 66) {
        const trimmed = '0x' + uint8Array.slice(2, 66) // Take chars 2 to 65 (64 hex chars)
        if (trimmed.length !== 66) {
          console.error('Trim failed:', { original: uint8Array.length, trimmed: trimmed.length })
        }
        return trimmed
      }
      // If shorter, pad with zeros
      if (uint8Array.length < 66) {
        const hexPart = uint8Array.slice(2).padStart(64, '0')
        return '0x' + hexPart
      }
      return uint8Array // Already correct length (66 chars)
    }
    // Not a hex string, convert to Uint8Array first
    const encoder = new TextEncoder()
    uint8Array = encoder.encode(uint8Array)
  }
  
  // For Uint8Array: take first 32 bytes (or pad if shorter)
  // CRITICAL: We MUST take FIRST 32 bytes, not last 32 bytes!
  const bytes32 = new Uint8Array(32)
  const sourceLength = Math.min(uint8Array.length, 32)
  
  // Fill with zeros first
  bytes32.fill(0)
  
  // Copy first 32 bytes (or all if shorter)
  if (sourceLength > 0) {
    bytes32.set(uint8Array.slice(0, sourceLength), 0)
  }
  
  // Convert to hex string
  const hexString = '0x' + Array.from(bytes32)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
  
  // Final safety check: ensure exactly 66 chars
  if (hexString.length !== 66) {
    console.error('[uint8ArrayToHex] Uint8Array conversion produced invalid length:', hexString.length, 'Expected 66')
    throw new Error(`Uint8Array to hex conversion failed: got ${hexString.length} chars, expected 66`)
  }
  
  return hexString
}

// Set the contract address so relayer knows where to encrypt/decrypt
export const setContractAddress = (address: string) => {
  (globalThis as any).__FHE_CONTRACT_ADDRESS__ = address
}

// Initialize the FHE relayer SDK - this loads all the crypto stuff we need
export const initFHERelayer = async (contractAddress?: string): Promise<any> => {
  if (relayerInstance) {
    return relayerInstance
  }

  if (isInitializing && initPromise) {
    return initPromise
  }

  isInitializing = true
  initPromise = (async () => {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Relayer can only be initialized in browser environment')
      }

      // Browser compatibility fix - some libraries need global defined
      if (typeof (window as any).global === 'undefined') {
        (window as any).global = window
      }
      if (typeof (globalThis as any).global === 'undefined') {
        (globalThis as any).global = globalThis
      }

      console.log('Loading FHE relayer SDK...')
      
      // Load the relayer SDK with timeout
      const relayerModule: any = await Promise.race([
        import('@zama-fhe/relayer-sdk/web'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Relayer load timeout')), 15000))
      ])

      console.log('Initializing SDK...')

      // Initialize the SDK
      const sdkInitialized = await Promise.race([
        relayerModule.initSDK(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('SDK init timeout')), 15000))
      ])

      if (!sdkInitialized) {
        throw new Error('SDK initialization failed')
      }

      console.log('Creating relayer instance...')

      const addr = contractAddress || (globalThis as any).__FHE_CONTRACT_ADDRESS__ || CONTRACT_ADDRESS

      // Create instance for Sepolia network
      const instance = await Promise.race([
        relayerModule.createInstance(relayerModule.SepoliaConfig, addr),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Instance creation timeout')), 20000))
      ])

      console.log('FHE relayer ready!')
      relayerInstance = instance
      isInitializing = false
      return instance
    } catch (error) {
      console.error('FHE relayer initialization failed:', error)
      isInitializing = false
      initPromise = null
      relayerInstance = null
      throw error
    }
  })()

  return initPromise
}

// Encrypt a number using FHE - returns a bytes32 handle that gets stored on-chain
// The actual number is encrypted and only the handle (which is useless without the key) goes to blockchain
export const encryptNumber = async (value: number, userAddress: string, contractAddress?: string): Promise<string> => {
  if (!relayerInstance) {
    const addr = contractAddress || (globalThis as any).__FHE_CONTRACT_ADDRESS__ || CONTRACT_ADDRESS
    await initFHERelayer(addr)
  }

  if (!relayerInstance) {
    throw new Error('FHE relayer not initialized')
  }

  try {
    const addr = contractAddress || (globalThis as any).__FHE_CONTRACT_ADDRESS__ || CONTRACT_ADDRESS
    const inputBuilder = relayerInstance.createEncryptedInput(addr, userAddress)
    inputBuilder.add32(value)
    
    const encryptedInput = await Promise.race([
      inputBuilder.encrypt(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Encryption timeout')), 30000)
      )
    ]) as any

    if (!encryptedInput?.handles || encryptedInput.handles.length === 0) {
      throw new Error('Encryption failed - no handles returned')
    }

    // Convert handle to hex string (handles can be Uint8Array or string)
    // CRITICAL: bytes32 must be exactly 32 bytes (64 hex chars + 0x = 66 chars total)
    const handle = encryptedInput.handles[0]
    
    // Debug logging
    const handleType = typeof handle
    const handleLength = handle instanceof Uint8Array ? handle.length : (typeof handle === 'string' ? handle.length : 0)
    console.log(`[encryptNumber] Handle type: ${handleType}, length: ${handleLength}`)
    
    let hexString = uint8ArrayToHex(handle)
    
    // CRITICAL: Force trim to exactly 66 chars if longer (defensive programming)
    if (hexString.length > 66) {
      console.warn(`[encryptNumber] Hex string is ${hexString.length} chars, trimming to 66`)
      hexString = '0x' + hexString.slice(2, 66) // Take first 64 hex chars after 0x
    }
    
    // Final validation: ensure it's exactly bytes32 length
    if (!hexString.startsWith('0x') || hexString.length !== 66) {
      console.error('[encryptNumber] Invalid handle length after conversion:', hexString.length, 'Expected 66 (0x + 64 hex chars)')
      console.error('[encryptNumber] Original handle type:', handleType, 'length:', handleLength)
      console.error('[encryptNumber] Hex string:', hexString)
      throw new Error(`Invalid FHE handle format: expected 32 bytes, got ${(hexString.length - 2) / 2} bytes`)
    }
    
    console.log(`[encryptNumber] Successfully converted to bytes32 (${hexString.length} chars): ${hexString.substring(0, 20)}...`)
    return hexString
  } catch (error: any) {
    console.error('Error encrypting number:', error)
    const errorMessage = error?.message || (typeof error === 'string' ? error : 'Unknown error')
    throw new Error(`Encryption failed: ${errorMessage}`)
  }
}

// Encrypt all character parts at once - much faster than doing them one by one
export const encryptCharacterParts = async (
  parts: {
    head: number
    eyes: number
    mouth: number
    body: number
    hat: number
    accessory: number
  },
  userAddress: string,
  contractAddress?: string
): Promise<{
  encryptedHead: string
  encryptedEyes: string
  encryptedMouth: string
  encryptedBody: string
  encryptedHat: string
  encryptedAccessory: string
}> => {
  const addr = contractAddress || (globalThis as any).__FHE_CONTRACT_ADDRESS__ || CONTRACT_ADDRESS
  const [encryptedHead, encryptedEyes, encryptedMouth, encryptedBody, encryptedHat, encryptedAccessory] = await Promise.all([
    encryptNumber(parts.head, userAddress, addr),
    encryptNumber(parts.eyes, userAddress, addr),
    encryptNumber(parts.mouth, userAddress, addr),
    encryptNumber(parts.body, userAddress, addr),
    encryptNumber(parts.hat, userAddress, addr),
    encryptNumber(parts.accessory, userAddress, addr),
  ])

  // Final validation - ensure all values are exactly 66 chars
  const validateBytes32 = (value: string, name: string) => {
    if (value.length !== 66 || !value.startsWith('0x')) {
      console.error(`[encryptCharacterParts] Invalid ${name} length: ${value.length}, value: ${value}`);
      throw new Error(`Invalid ${name} format: expected 66 chars, got ${value.length}`);
    }
  };
  
  validateBytes32(encryptedHead, 'encryptedHead');
  validateBytes32(encryptedEyes, 'encryptedEyes');
  validateBytes32(encryptedMouth, 'encryptedMouth');
  validateBytes32(encryptedBody, 'encryptedBody');
  validateBytes32(encryptedHat, 'encryptedHat');
  validateBytes32(encryptedAccessory, 'encryptedAccessory');

  return {
    encryptedHead,
    encryptedEyes,
    encryptedMouth,
    encryptedBody,
    encryptedHat,
    encryptedAccessory,
  }
}

// Store original character parts in localStorage so we can display the character
// Note: The encrypted data is stored on-chain, but we keep original values locally for UI rendering
export const storeOriginalCharacterParts = (
  characterId: number,
  parts: {
    head: number
    eyes: number
    mouth: number
    body: number
    hat: number
    accessory: number
  }
) => {
  if (typeof window === 'undefined') return

  try {
    const key = `character_${characterId}_parts`
    localStorage.setItem(key, JSON.stringify(parts))
  } catch (error) {
    console.error('Error storing original character parts:', error)
  }
}

// Get original character parts from localStorage
export const getOriginalCharacterParts = (
  characterId: number
): {
  head: number
  eyes: number
  mouth: number
  body: number
  hat: number
  accessory: number
} | null => {
  if (typeof window === 'undefined') return null

  try {
    const key = `character_${characterId}_parts`
    const stored = localStorage.getItem(key)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error retrieving original character parts:', error)
  }

  return null
}

