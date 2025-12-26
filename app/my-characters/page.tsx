"use client";

import { useState, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft, LogOut, Upload } from "lucide-react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbi } from "viem";
import { CharacterRenderer } from "@/components/CharacterRenderer";
import { ConnectKitButton } from "connectkit";
import { getCharacterManagerAddress, getGalleryManagerAddress } from "@/utils/address";
import { useCharacter } from "@/hooks/useCharacter";

const CHARACTER_MANAGER_ABI = parseAbi([
  "function getOwnerCharacters(address owner) public view returns (uint256[])",
  "function getCharacterPublicInfo(uint256 characterId) public view returns (string memory name, address owner, uint256 createdAt, uint256 updatedAt, bool isPublic)",
  "function getCharacter(uint256 characterId) public view returns (bytes32 encryptedHead, bytes32 encryptedEyes, bytes32 encryptedMouth, bytes32 encryptedBody, bytes32 encryptedHat, bytes32 encryptedAccessory, string memory name, address owner, uint256 createdAt, uint256 updatedAt, bool isPublic)",
  "function deleteCharacter(uint256 characterId) public",
  "function setCharacterVisibility(uint256 characterId, bool isPublic) public",
  "function updateCharacter(uint256 characterId, bytes32 encryptedHead, bytes32 encryptedEyes, bytes32 encryptedMouth, bytes32 encryptedBody, bytes32 encryptedHat, bytes32 encryptedAccessory) public",
  "function changeCharacterName(uint256 characterId, string memory newName) public",
]);

// GalleryManager functions are called through CharacterManager.setCharacterVisibility

export default function MyCharactersPage() {
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const characterManagerAddress = getCharacterManagerAddress();

  const { data: characterIds, refetch } = useReadContract({
    address: characterManagerAddress || undefined,
    abi: CHARACTER_MANAGER_ABI,
    functionName: "getOwnerCharacters",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!characterManagerAddress,
    },
  });

  const galleryManagerAddress = getGalleryManagerAddress();

  const { writeContract: deleteChar, data: deleteHash, error: deleteError } = useWriteContract();
  const { writeContract: toggleVisibility, data: visibilityHash, error: visibilityError } = useWriteContract();
  
  const { isSuccess: deleteSuccess, isError: deleteTxError, error: deleteReceiptError } = useWaitForTransactionReceipt({ hash: deleteHash });
  const { isSuccess: visibilitySuccess, isError: visibilityTxError, error: visibilityReceiptError } = useWaitForTransactionReceipt({ hash: visibilityHash });
  
  // Separate write contracts for add to gallery flow (for public characters that aren't in gallery)
  const { writeContract: makePrivate, data: makePrivateHash } = useWriteContract();
  const { writeContract: makePublic, data: makePublicHash } = useWriteContract();
  const { isSuccess: makePrivateSuccess } = useWaitForTransactionReceipt({ hash: makePrivateHash });
  const { isSuccess: makePublicSuccess } = useWaitForTransactionReceipt({ hash: makePublicHash });

  useEffect(() => {
    if (characterIds !== undefined) {
      if (Array.isArray(characterIds) && characterIds.length > 0) {
        const ids = (characterIds as bigint[]).map((id) => Number(id));
        console.log("✅ Loaded character IDs:", ids);
        // Store character IDs with metadata for handleAddToGallery
        setCharacters(ids.map((id) => ({ id })));
      } else {
        console.log("ℹ️ No characters found");
        setCharacters([]);
      }
      setLoading(false);
    } else if (characterIds === null && address) {
      // Query completed but returned null - might be loading or no characters
      console.log("⚠️ Query returned null, but address exists");
      // Don't set loading to false immediately, wait a bit
    }
  }, [characterIds, address]);

  // Handle errors
  useEffect(() => {
    if (deleteError) {
      console.error("Delete error:", deleteError);
      const errorMsg = deleteError?.message || String(deleteError) || "Failed to send transaction";
      alert(`Transaction error: ${errorMsg}`);
    }
    if (visibilityError) {
      console.error("Visibility error:", visibilityError);
      const errorMsg = visibilityError?.message || String(visibilityError) || "Failed to send transaction";
      alert(`Transaction error: ${errorMsg}`);
    }
    if (deleteTxError && deleteReceiptError) {
      console.error("Delete transaction receipt error:", deleteReceiptError);
      const errorMsg = deleteReceiptError?.message || String(deleteReceiptError) || "Transaction was rejected or failed";
      alert(`Transaction failed: ${errorMsg}`);
    }
    if (visibilityTxError && visibilityReceiptError) {
      console.error("Visibility transaction receipt error:", visibilityReceiptError);
      const errorMsg = visibilityReceiptError?.message || String(visibilityReceiptError) || "Transaction was rejected or failed";
      alert(`Transaction failed: ${errorMsg}`);
    }
  }, [deleteError, visibilityError, deleteTxError, deleteReceiptError, visibilityTxError, visibilityReceiptError]);

  useEffect(() => {
    if (deleteSuccess || visibilitySuccess || makePublicSuccess) {
      console.log("Transaction successful, refetching characters...");
      // Wait a bit for blockchain to update, then refetch
      const timeoutId = setTimeout(() => {
        console.log("Refetching characters after transaction...");
        refetch();
      }, 3000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [deleteSuccess, visibilitySuccess, makePublicSuccess, refetch]);

  // Handle the two-step process for adding public characters to gallery
  useEffect(() => {
    if (makePrivateSuccess && characterManagerAddress) {
      // First transaction (make private) succeeded, now make it public again
      const pendingId = (window as any).pendingGalleryAdd;
      if (pendingId !== undefined) {
        console.log("Character made private, now making it public to add to gallery...");
        makePublic({
          address: characterManagerAddress,
          abi: CHARACTER_MANAGER_ABI,
          functionName: "setCharacterVisibility",
          args: [BigInt(pendingId), true],
          gas: 1000000n, // Visibility toggle doesn't need much gas
        });
        (window as any).pendingGalleryAdd = undefined;
      }
    }
  }, [makePrivateSuccess, characterManagerAddress, makePublic]);

  const handleDelete = (characterId: number) => {
    if (!confirm("Are you sure you want to delete this character?")) return;

    if (!characterManagerAddress) {
      alert("Character manager address not configured");
      return;
    }

    console.log("Deleting character:", characterId);
    deleteChar({
      address: characterManagerAddress,
      abi: CHARACTER_MANAGER_ABI,
      functionName: "deleteCharacter",
      args: [BigInt(characterId)],
      gas: 1000000n, // Delete operation doesn't need much gas
    });
  };

  const handleToggleVisibility = (characterId: number, currentVisibility: boolean) => {
    if (!characterManagerAddress) {
      alert("Character manager address not configured");
      return;
    }

    console.log("Toggling visibility for character:", characterId, "to:", !currentVisibility);
    toggleVisibility({
      address: characterManagerAddress,
      abi: CHARACTER_MANAGER_ABI,
      functionName: "setCharacterVisibility",
      args: [BigInt(characterId), !currentVisibility],
      gas: 1000000n, // Visibility toggle doesn't need much gas
    });
  };

  const handleAddToGallery = async (characterId: number, isCurrentlyPublic: boolean) => {
    if (!characterManagerAddress) {
      alert("Character manager address not configured");
      return;
    }

    // If character is already public, it should already be in gallery
    // If it's not, that means CharacterManager wasn't linked to GalleryManager when it was created
    // In this case, we need to toggle visibility to trigger addToGallery
    if (isCurrentlyPublic) {
      alert("Character is already public. If it's not in the gallery, the contracts may not be properly linked. Toggling visibility to force add to gallery...");
      // Store characterId for the second transaction
      (window as any).pendingGalleryAdd = characterId;
      // First make it private - wait for this to complete before making it public
      makePrivate({
        address: characterManagerAddress,
        abi: CHARACTER_MANAGER_ABI,
        functionName: "setCharacterVisibility",
        args: [BigInt(characterId), false],
        gas: 1000000n, // Visibility toggle doesn't need much gas
      });
    } else {
      // Character is private - just make it public (this will automatically add to gallery)
      toggleVisibility({
        address: characterManagerAddress,
        abi: CHARACTER_MANAGER_ABI,
        functionName: "setCharacterVisibility",
        args: [BigInt(characterId), true],
      });
    }
  };

  // Only show "connect wallet" if definitely not connected (after a short delay to allow connection check)
  if (!isConnected && !isConnecting) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Please Connect Your Wallet</h1>
          <p className="text-xl mb-6">You need to connect your wallet to view your characters.</p>
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
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-4xl font-bold text-white pixel-art">🦎 My Cryptocheliks</h1>
          {isConnected && (
            <Link
              href="/create"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Create New
            </Link>
          )}
        </div>

        {loading ? (
          <div className="text-center text-white text-xl">Loading your characters...</div>
        ) : characters.length === 0 ? (
          <div className="text-center text-white text-xl">
            <p className="mb-4">You haven't created any characters yet.</p>
            <Link
              href="/create"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Create Your First Character
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((char) => (
              <CharacterCard
                key={char.id}
                characterId={char.id}
                onDelete={handleDelete}
                onToggleVisibility={handleToggleVisibility}
                onAddToGallery={handleAddToGallery}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function CharacterCard({
  characterId,
  onDelete,
  onToggleVisibility,
  onAddToGallery,
}: {
  characterId: number;
  onDelete: (id: number) => void;
  onToggleVisibility: (id: number, current: boolean) => void;
  onAddToGallery: (id: number, isPublic: boolean) => void;
}) {
  const { character, loading: characterLoading } = useCharacter(characterId);

  if (characterLoading || !character) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 animate-pulse">
        <div className="h-48 bg-gray-700 rounded mb-4"></div>
        <div className="h-6 bg-gray-700 rounded"></div>
      </div>
    );
  }

  const isPublic = character.isPublic;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
      <div className="mb-4">
        <CharacterRenderer
          head={character.head}
          eyes={character.eyes}
          mouth={character.mouth}
          body={character.body}
          hat={character.hat}
          accessory={character.accessory}
        />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">{character.name}</h3>
      <p className="text-sm text-gray-300 mb-4">
        {isPublic ? "✅ Public (in gallery)" : "🔒 Private (not in gallery)"}
      </p>
      
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Link
            href={`/edit/${characterId}`}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Edit size={18} />
            Edit
          </Link>
          <button
            onClick={() => onToggleVisibility(characterId, isPublic)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
              isPublic
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-600 hover:bg-gray-700 text-white"
            }`}
          >
            {isPublic ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
          <button
            onClick={() => onDelete(characterId)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <Trash2 size={18} />
          </button>
        </div>
        {!isPublic && (
          <button
            onClick={() => onAddToGallery(characterId, isPublic)}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Upload size={16} />
            Add to Gallery
          </button>
        )}
        {isPublic && (
          <p className="text-xs text-yellow-300 mt-2 text-center">
            ⚠️ If this character is not in the gallery, the contracts may not be properly linked.
          </p>
        )}
      </div>
    </div>
  );
}


