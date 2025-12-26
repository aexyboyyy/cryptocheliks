"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CharacterBuilder } from "@/components/CharacterBuilder";
import { parseAbi } from "viem";
import { getCharacterManagerAddress } from "@/utils/address";
import { initFHERelayer, encryptCharacterParts, setContractAddress, getOriginalCharacterParts, storeOriginalCharacterParts } from "@/lib/fheEncryption";

const CHARACTER_MANAGER_ABI = parseAbi([
  "function getCharacter(uint256 characterId) public view returns (bytes32 encryptedHead, bytes32 encryptedEyes, bytes32 encryptedMouth, bytes32 encryptedBody, bytes32 encryptedHat, bytes32 encryptedAccessory, string memory name, address owner, uint256 createdAt, uint256 updatedAt, bool isPublic)",
  "function updateCharacter(uint256 characterId, bytes32 encryptedHead, bytes32 encryptedEyes, bytes32 encryptedMouth, bytes32 encryptedBody, bytes32 encryptedHat, bytes32 encryptedAccessory) public",
  "function changeCharacterName(uint256 characterId, string memory newName) public",
]);

export default function EditCharacterPage() {
  const { id } = useParams();
  const characterId = Number(id);
  const { address, isConnected, isConnecting } = useAccount();
  const router = useRouter();
  const [name, setName] = useState("");
  const [parts, setParts] = useState({
    head: 0,
    eyes: 0,
    mouth: 0,
    body: 0,
    hat: 0,
    accessory: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isRelayerReady, setIsRelayerReady] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);

  const characterManagerAddress = getCharacterManagerAddress();

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

  const { data: characterData } = useReadContract({
    address: characterManagerAddress || undefined,
    abi: CHARACTER_MANAGER_ABI,
    functionName: "getCharacter",
    args: [BigInt(characterId)],
    query: {
      enabled: !!characterManagerAddress && characterId >= 0,
    },
  });

  const { writeContract: updateChar, data: updateHash, isPending: isUpdating, error: updateError, reset: resetUpdate } = useWriteContract();
  const { writeContract: updateName, data: nameHash, isPending: isUpdatingName, error: nameError, reset: resetName } = useWriteContract();
  
  const { isSuccess: updateSuccess, isError: updateTxError, error: updateReceiptError } = useWaitForTransactionReceipt({ hash: updateHash });
  const { isSuccess: nameSuccess, isError: nameTxError, error: nameReceiptError } = useWaitForTransactionReceipt({ hash: nameHash });

  useEffect(() => {
    if (characterData && characterId >= 0) {
      // Get original parts from localStorage (they're stored there when character was created/updated)
      const originalParts = getOriginalCharacterParts(characterId);
      
      if (originalParts) {
        // Use stored original parts for display
        setParts(originalParts);
      } else {
        // Fallback to default values if not found (shouldn't happen, but handle gracefully)
        setParts({
          head: 0,
          eyes: 0,
          mouth: 0,
          body: 0,
          hat: 0,
          accessory: 0,
        });
      }
      
      // Extract name from contract data (name is public, not encrypted)
      const [, , , , , , charName] = characterData as any;
      setName(charName as string);
      setLoading(false);
    }
  }, [characterData, characterId]);

  // Handle errors
  useEffect(() => {
    if (updateError) {
      console.error("Update error:", updateError);
      const errorMsg = updateError?.message || String(updateError) || "Failed to send transaction";
      alert(`Transaction error: ${errorMsg}`);
    }
    if (nameError) {
      console.error("Name update error:", nameError);
      const errorMsg = nameError?.message || String(nameError) || "Failed to send transaction";
      alert(`Transaction error: ${errorMsg}`);
    }
    if (updateTxError && updateReceiptError) {
      console.error("Update transaction receipt error:", updateReceiptError);
      const errorMsg = updateReceiptError?.message || String(updateReceiptError) || "Transaction was rejected or failed";
      alert(`Transaction failed: ${errorMsg}`);
    }
    if (nameTxError && nameReceiptError) {
      console.error("Name transaction receipt error:", nameReceiptError);
      const errorMsg = nameReceiptError?.message || String(nameReceiptError) || "Transaction was rejected or failed";
      alert(`Transaction failed: ${errorMsg}`);
    }
  }, [updateError, nameError, updateTxError, updateReceiptError, nameTxError, nameReceiptError]);

  // Handle successful update - store original parts
  useEffect(() => {
    if (updateSuccess) {
      console.log("Character update successful!");
      // Store updated parts in localStorage
      storeOriginalCharacterParts(characterId, parts);
      console.log("Updated character parts stored for characterId:", characterId);
    }
  }, [updateSuccess, characterId, parts]);

  // Redirect on success
  useEffect(() => {
    if ((updateSuccess && nameSuccess) || (updateSuccess && name === (characterData ? (characterData as any)[6] : ""))) {
      console.log("Update successful!");
      setTimeout(() => {
        router.push("/my-characters");
      }, 1000);
    }
  }, [updateSuccess, nameSuccess, router, characterData, name]);

  const handleUpdate = async () => {
    if (!isConnected || !name.trim()) {
      alert("Please connect wallet and enter a name");
      return;
    }

    if (!characterManagerAddress || characterManagerAddress.length === 0) {
      alert("Character manager address not configured");
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

    // Reset errors
    resetUpdate();
    resetName();

    console.log("Updating character with:", {
      characterId,
      parts,
      name,
    });

    setIsEncrypting(true);

    try {
      // Encrypt character parts using FHE
      console.log("Encrypting character parts for update...");
      const encryptedParts = await encryptCharacterParts(parts, address, characterManagerAddress);
      console.log("Character parts encrypted:", encryptedParts);

      setIsEncrypting(false);

      // Update character parts with encrypted values
      updateChar({
        address: characterManagerAddress,
        abi: CHARACTER_MANAGER_ABI,
        functionName: "updateCharacter",
        args: [
          BigInt(characterId),
          encryptedParts.encryptedHead as `0x${string}`,
          encryptedParts.encryptedEyes as `0x${string}`,
          encryptedParts.encryptedMouth as `0x${string}`,
          encryptedParts.encryptedBody as `0x${string}`,
          encryptedParts.encryptedHat as `0x${string}`,
          encryptedParts.encryptedAccessory as `0x${string}`,
        ] as const,
        gas: 10000000n, // Limit gas to 10M (under the 16.7M cap)
      });

      // Update name if changed (name is public, no encryption needed)
      const currentName = characterData ? (characterData as any)[6] : "";
      if (name !== currentName) {
        updateName({
          address: characterManagerAddress,
          abi: CHARACTER_MANAGER_ABI,
          functionName: "changeCharacterName",
          args: [BigInt(characterId), name],
          gas: 500000n, // Name change doesn't need much gas
        });
      }
    } catch (error: any) {
      console.error("Error encrypting or calling writeContract:", error);
      setIsEncrypting(false);
      const errorMsg = error?.message || String(error) || "Failed to encrypt or create transaction";
      alert(`Error: ${errorMsg}`);
    }
  };

  if (!isConnected && !isConnecting) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Please Connect Your Wallet</h1>
          <p className="text-xl mb-6">You need to connect your wallet to edit a character.</p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white text-xl">Loading character...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/my-characters"
            className="inline-flex items-center gap-2 text-white hover:text-blue-300 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to My Characters</span>
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-white text-center mb-8 pixel-art">
          🦎 Edit Your Cryptochelik
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

          {/* Status Messages */}
          {(updateHash || nameHash) && (
            <div className="mt-4 p-4 bg-blue-900/50 rounded-lg text-blue-200">
              <p className="font-semibold">Transaction sent!</p>
              {updateHash && <p className="text-sm">Update hash: {updateHash}</p>}
              {nameHash && <p className="text-sm">Name hash: {nameHash}</p>}
              {(isUpdating || isUpdatingName) && <p className="text-sm mt-2">⏳ Waiting for confirmation...</p>}
            </div>
          )}

          {(updateError || nameError || updateReceiptError || nameReceiptError) && (
            <div className="mt-4 p-4 bg-red-900/50 rounded-lg text-red-200">
              <p className="font-semibold">Error:</p>
              <p className="text-sm">{updateError?.message || nameError?.message || updateReceiptError?.message || nameReceiptError?.message || String(updateError || nameError || updateReceiptError || nameReceiptError) || "Transaction failed"}</p>
            </div>
          )}

          <div className="mt-8 flex gap-4">
            <button
              onClick={handleUpdate}
              disabled={!name.trim() || isUpdating || isUpdatingName || isEncrypting || !isRelayerReady || !characterManagerAddress || characterManagerAddress.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isEncrypting ? "Encrypting..." : isUpdating ? "Preparing update..." : isUpdatingName ? "Updating name..." : (updateSuccess || nameSuccess) ? "Success! Redirecting..." : "Update Character"}
            </button>
            <button
              onClick={() => router.back()}
              disabled={isUpdating || isUpdatingName}
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

