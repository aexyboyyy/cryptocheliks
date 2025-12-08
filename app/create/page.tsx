"use client";

import { useState, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LogOut } from "lucide-react";
import { CharacterBuilder } from "@/components/CharacterBuilder";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbi } from "viem";
import { ConnectKitButton } from "connectkit";
import { getCharacterManagerAddress } from "@/utils/address";

const CHARACTER_MANAGER_ABI = parseAbi([
  "function createCharacter(string memory name, uint32 head, uint32 eyes, uint32 mouth, uint32 body, uint32 hat, uint32 accessory, bool isPublic) public returns (uint256)",
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

  const { writeContract, data: hash, isPending, error: writeError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError: txError, error: receiptError } = useWaitForTransactionReceipt({
    hash,
  });

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

    // Reset any previous errors
    reset();

    console.log("Creating character with:", {
      address: characterManagerAddress,
      name,
      parts,
      isPublic,
    });

    try {
      if (!characterManagerAddress) {
        alert("Character manager address not configured");
        return;
      }

      writeContract({
        address: characterManagerAddress,
        abi: CHARACTER_MANAGER_ABI,
        functionName: "createCharacter",
        args: [
          name,
          Number(parts.head),
          Number(parts.eyes),
          Number(parts.mouth),
          Number(parts.body),
          Number(parts.hat),
          Number(parts.accessory),
          isPublic,
        ],
      });
    } catch (error: any) {
      console.error("Error calling writeContract:", error);
      alert(`Error: ${error.message || "Failed to create transaction"}`);
    }
  };

  // Handle errors
  useEffect(() => {
    if (writeError) {
      console.error("Write error:", writeError);
      alert(`Transaction error: ${writeError.message || "Failed to send transaction"}`);
    }
    if (txError && receiptError) {
      console.error("Transaction receipt error:", receiptError);
      alert(`Transaction failed: ${receiptError.message || "Transaction was rejected or failed"}`);
    }
  }, [writeError, txError, receiptError]);

  // Redirect on success
  useEffect(() => {
    if (isSuccess && hash) {
      console.log("Transaction successful! Hash:", hash);
      setTimeout(() => {
        router.push("/my-characters");
      }, 1000);
    }
  }, [isSuccess, hash, router]);

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
              <p className="text-sm">{writeError?.message || receiptError?.message || "Transaction failed"}</p>
            </div>
          )}

          <div className="mt-8 flex gap-4">
            <button
              onClick={handleCreate}
              disabled={!name.trim() || isPending || isConfirming || !characterManagerAddress}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isPending ? "Preparing transaction..." : isConfirming ? "Confirming transaction..." : isSuccess ? "Success! Redirecting..." : "Create Character"}
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


