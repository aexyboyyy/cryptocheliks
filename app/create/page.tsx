"use client";

import { useState, useEffect } from "react";
import { useAccount, useDisconnect, usePublicClient } from "wagmi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LogOut } from "lucide-react";
import { CharacterBuilder } from "@/components/CharacterBuilder";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbi, decodeEventLog } from "viem";
import { ConnectKitButton } from "connectkit";
import { getCharacterManagerAddress } from "@/utils/address";
import { initFHERelayer, encryptCharacterParts, setContractAddress, storeOriginalCharacterParts } from "@/lib/fheEncryption";

const CHARACTER_MANAGER_ABI = parseAbi([
  "function createCharacter(string memory name, bytes32 encryptedHead, bytes32 encryptedEyes, bytes32 encryptedMouth, bytes32 encryptedBody, bytes32 encryptedHat, bytes32 encryptedAccessory, bool isPublic) public returns (uint256)",
  "event CharacterCreated(uint256 indexed characterId, address indexed owner, string name, bool isPublic)",
]);

export default function CreatePage() {
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [parts, setParts] = useState({
    head: 0,
    eyes: 0,
    mouth: 0,
    body: 0,
    hat: 0,
    accessory: 0,
  });

  const characterManagerAddress = getCharacterManagerAddress();
  
  // Debug: log the address being used
  useEffect(() => {
    console.log('[CreatePage] CharacterManager address:', characterManagerAddress);
    console.log('[CreatePage] Expected address from README: 0x892324719831df4CC0d3c4eAc5B4aBe1f17CAdea');
    if (characterManagerAddress) {
      console.log('[CreatePage] Addresses match:', characterManagerAddress.toLowerCase() === '0x892324719831df4cc0d3c4eac5b4abe1f17cadea');
    }
  }, [characterManagerAddress]);
  const [isRelayerReady, setIsRelayerReady] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [createdParts, setCreatedParts] = useState<typeof parts | null>(null);
  const publicClient = usePublicClient();

  const { writeContract, data: hash, isPending, error: writeError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError: txError, error: receiptError, data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  // Initialize FHE relayer on mount
  useEffect(() => {
    if (characterManagerAddress) {
      setContractAddress(characterManagerAddress);
      initFHERelayer(characterManagerAddress)
        .then(() => {
          setIsRelayerReady(true);
          console.log("FHE relayer initialized");
        })
        .catch((error) => {
          console.error("Failed to initialize FHE relayer:", error);
          alert("Failed to initialize FHE encryption. Please refresh the page.");
        });
    }
  }, [characterManagerAddress]);

  const handleCreate = async () => {
    if (!isConnected || !name.trim()) {
      alert("Please connect wallet and enter a name");
      return;
    }

    if (!characterManagerAddress) {
      alert("Character manager address not configured or invalid. Please check environment variables.");
      console.error("Character manager address is missing or invalid");
      return;
    }

    if (!address) {
      alert("Wallet address not available");
      return;
    }

    if (!isRelayerReady) {
      alert("FHE encryption is not ready yet. Please wait a moment and try again.");
      return;
    }

    // Reset any previous errors
    reset();

    setIsEncrypting(true);

    try {
      // Save parts for later storage (before encryption so we have the original values)
      setCreatedParts({ ...parts });
      
      // Encrypt character parts using FHE
      console.log("Encrypting character parts...");
      const encryptedParts = await encryptCharacterParts(parts, address, characterManagerAddress);
      
      // Debug: verify all values are exactly 66 chars
      console.log("Character parts encrypted:", encryptedParts);
      Object.entries(encryptedParts).forEach(([key, value]) => {
        if (typeof value === 'string') {
          console.log(`${key}: length=${value.length}, value=${value}`);
          if (value.length !== 66) {
            console.error(`ERROR: ${key} is ${value.length} chars, expected 66!`);
          }
        }
      });

      setIsEncrypting(false);

      // Validate name before sending
      const trimmedName = name.trim();
      if (!trimmedName || trimmedName.length === 0) {
        throw new Error("Character name cannot be empty");
      }
      if (trimmedName.length > 50) {
        throw new Error(`Character name is too long: ${trimmedName.length} characters (max 50)`);
      }

      // Prepare args with explicit validation
      const args = [
        trimmedName,
        encryptedParts.encryptedHead as `0x${string}`,
        encryptedParts.encryptedEyes as `0x${string}`,
        encryptedParts.encryptedMouth as `0x${string}`,
        encryptedParts.encryptedBody as `0x${string}`,
        encryptedParts.encryptedHat as `0x${string}`,
        encryptedParts.encryptedAccessory as `0x${string}`,
        isPublic,
      ] as const;

      console.log("Calling createCharacter with args:", {
        contractAddress: characterManagerAddress,
        expectedAddress: '0x892324719831df4cc0d3c4eac5b4abe1f17cadea',
        addressMatches: characterManagerAddress?.toLowerCase() === '0x892324719831df4cc0d3c4eac5b4abe1f17cadea',
        name: args[0],
        nameLength: args[0].length,
        nameBytes: new TextEncoder().encode(args[0]).length,
        encryptedHead: args[1],
        encryptedHeadLength: args[1].length,
        encryptedHeadIsZero: args[1] === '0x0000000000000000000000000000000000000000000000000000000000000000',
        isPublic: args[7]
      });

      // Final validation: ensure we're using the correct contract address
      const expectedAddress = '0x892324719831df4cc0d3c4eac5b4abe1f17cadea';
      if (!characterManagerAddress || characterManagerAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
        const errorMsg = `Wrong contract address! Using: ${characterManagerAddress}, Expected: ${expectedAddress}`;
        console.error('[handleCreate]', errorMsg);
        throw new Error(errorMsg);
      }

      writeContract({
        address: characterManagerAddress,
        abi: CHARACTER_MANAGER_ABI,
        functionName: "createCharacter",
        args,
        gas: 10000000n, // Limit gas to 10M (under the 16.7M cap)
      });
    } catch (error: any) {
      console.error("Error encrypting or calling writeContract:", error);
      setIsEncrypting(false);
      const errorMsg = error?.message || String(error) || "Failed to encrypt or create transaction";
      alert(`Error: ${errorMsg}`);
    }
  };

  // Handle errors
  useEffect(() => {
    if (writeError) {
      console.error("Write error:", writeError);
      const errorMsg = writeError?.message || String(writeError) || "Failed to send transaction";
      alert(`Transaction error: ${errorMsg}`);
    }
    if (txError && receiptError) {
      console.error("Transaction receipt error:", receiptError);
      const errorMsg = receiptError?.message || String(receiptError) || "Transaction was rejected or failed";
      alert(`Transaction failed: ${errorMsg}`);
    }
  }, [writeError, txError, receiptError]);

  // Handle successful character creation - parse event and store original parts
  useEffect(() => {
    async function handleCharacterCreated() {
      if (isSuccess && receipt && characterManagerAddress && createdParts) {
        try {
          // Filter logs by contract address and parse CharacterCreated event
          const contractLogs = receipt.logs.filter(
            (log: any) => log.address.toLowerCase() === characterManagerAddress.toLowerCase()
          );
          
          const characterCreatedEvent = contractLogs.find((log: any) => {
            try {
              const decoded = decodeEventLog({
                abi: CHARACTER_MANAGER_ABI,
                data: log.data,
                topics: log.topics,
              });
              return decoded.eventName === 'CharacterCreated';
            } catch {
              return false;
            }
          });

          if (characterCreatedEvent) {
            const decoded = decodeEventLog({
              abi: CHARACTER_MANAGER_ABI,
              data: characterCreatedEvent.data,
              topics: characterCreatedEvent.topics,
            }) as any;
            
            const characterId = Number(decoded.args.characterId);
            console.log("Character created with ID:", characterId);
            
            // Store original parts with the characterId
            storeOriginalCharacterParts(characterId, createdParts);
            console.log("Original character parts stored for characterId:", characterId);
            setCreatedParts(null); // Clear after storing
          } else {
            console.warn("CharacterCreated event not found in receipt");
          }
          
          // Redirect after a short delay
          setTimeout(() => {
            router.push("/my-characters");
          }, 1000);
        } catch (error) {
          console.error("Error parsing character creation event:", error);
          // Still redirect even if event parsing fails
          setTimeout(() => {
            router.push("/my-characters");
          }, 1000);
        }
      }
    }
    
    handleCharacterCreated();
  }, [isSuccess, receipt, characterManagerAddress, createdParts, router]);

  if (!isConnected && !isConnecting) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Please Connect Your Wallet</h1>
          <p className="text-xl mb-6">You need to connect your wallet to create a character.</p>
          <ConnectKitButton />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 text-white hover:text-blue-300 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Gallery</span>
            </Link>
            <div className="flex items-center gap-4">
              <ConnectKitButton />
              {isConnected && (
                <button
                  onClick={() => disconnect()}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors text-sm"
                >
                  <LogOut size={16} />
                  Disconnect
                </button>
              )}
            </div>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white text-center mb-8 pixel-art">
          🦎 Create Your Cryptochelik
        </h1>

        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-lg p-8">
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">Character Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter character name..."
              maxLength={50}
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:border-blue-400"
            />
          </div>

          <CharacterBuilder parts={parts} onPartsChange={setParts} />

          <div className="mt-6 flex items-center gap-4">
            <label className="flex items-center gap-2 text-white cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-5 h-5"
              />
              <span>Make character public (visible in gallery)</span>
            </label>
          </div>

          {/* Status Messages */}
          {hash && (
            <div className="mt-4 p-4 bg-blue-900/50 rounded-lg text-blue-200">
              <p className="font-semibold">Transaction sent!</p>
              <p className="text-sm">Hash: {hash}</p>
              {isConfirming && <p className="text-sm mt-2">⏳ Waiting for confirmation...</p>}
            </div>
          )}

          {(writeError || receiptError) && (
            <div className="mt-4 p-4 bg-red-900/50 rounded-lg text-red-200">
              <p className="font-semibold">Error:</p>
              <p className="text-sm">{writeError?.message || receiptError?.message || String(writeError || receiptError) || "Transaction failed"}</p>
            </div>
          )}

          <div className="mt-8 flex gap-4">
            <button
              onClick={handleCreate}
              disabled={!name.trim() || isPending || isConfirming || !characterManagerAddress || !isRelayerReady || isEncrypting}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {!isRelayerReady ? "Initializing FHE..." : isEncrypting ? "Encrypting..." : isPending ? "Preparing transaction..." : isConfirming ? "Confirming transaction..." : isSuccess ? "Success! Redirecting..." : "Create Character"}
            </button>
            <button
              onClick={() => router.back()}
              disabled={isPending || isConfirming}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}


