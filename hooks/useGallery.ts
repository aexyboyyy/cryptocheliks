"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbi } from "viem";
import { useFHEVM } from "./useFHEVM";
import { getGalleryManagerAddress } from "@/utils/address";

const GALLERY_MANAGER_ABI = parseAbi([
  "function getAllPublicCharacters() public view returns (uint256[])",
  "function getCharacterLikes(uint256 characterId) public view returns (uint256)",
  "function hasUserLiked(address user, uint256 characterId) public view returns (bool)",
  "function likeCharacter(uint256 characterId) public",
  "function unlikeCharacter(uint256 characterId) public",
]);

export function useGallery() {
  const [characters, setCharacters] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const galleryManagerAddress = getGalleryManagerAddress();

  // Debug logging
  useEffect(() => {
    console.log("Gallery Manager Address:", galleryManagerAddress);
    console.log("Gallery Manager Address from env:", process.env.NEXT_PUBLIC_GALLERY_MANAGER_ADDRESS);
  }, [galleryManagerAddress]);

  const { data: characterIds, refetch: refetchCharacters, isLoading: isLoadingCharacters, error: galleryError } = useReadContract({
    address: galleryManagerAddress || undefined,
    abi: GALLERY_MANAGER_ABI,
    functionName: "getAllPublicCharacters",
    query: {
      enabled: !!galleryManagerAddress,
      refetchInterval: 5000, // Refetch every 5 seconds
      retry: 3,
    },
  });

  // Log errors
  useEffect(() => {
    if (galleryError) {
      console.error("Error loading gallery:", galleryError);
    }
  }, [galleryError]);

  // Update loading state based on contract query
  useEffect(() => {
    if (isLoadingCharacters) {
      setLoading(true);
    } else if (characterIds !== undefined) {
      setLoading(false);
    }
  }, [isLoadingCharacters, characterIds]);

  const { writeContract: likeChar, data: likeHash, error: likeError, reset: resetLike } = useWriteContract();
  const { isLoading: isLiking, isSuccess: likeSuccess, isError: likeTxError, error: likeReceiptError } = useWaitForTransactionReceipt({
    hash: likeHash,
  });

  // Load character IDs
  useEffect(() => {
    if (characterIds !== undefined) {
      if (Array.isArray(characterIds) && characterIds.length > 0) {
        const ids = (characterIds as bigint[]).map((id) => Number(id));
        console.log("✅ Loaded character IDs from gallery:", ids);
        setCharacters(ids);
      } else {
        console.log("ℹ️ Gallery returned empty array");
        setCharacters([]);
      }
      setLoading(false);
    } else if (!isLoadingCharacters && characterIds === null) {
      // Query completed but returned null
      console.log("⚠️ Gallery query returned null - check contract address");
      setCharacters([]);
      setLoading(false);
    }
  }, [characterIds, isLoadingCharacters, loading]);


  // Handle errors
  useEffect(() => {
    if (likeError) {
      console.error("Like error:", likeError);
      alert(`Transaction error: ${likeError.message || "Failed to send transaction"}`);
    }
    if (likeTxError && likeReceiptError) {
      console.error("Like transaction receipt error:", likeReceiptError);
      alert(`Transaction failed: ${likeReceiptError.message || "Transaction was rejected or failed"}`);
    }
    if (likeSuccess) {
      // Refetch likes after successful like
      refetchCharacters();
    }
  }, [likeError, likeTxError, likeReceiptError, likeSuccess, refetchCharacters]);

  const likeCharacter = async (characterId: number) => {
    if (!galleryManagerAddress) {
      alert("Gallery manager address not configured");
      return;
    }

    resetLike();
    console.log("Liking character:", characterId);

    try {
      likeChar({
        address: galleryManagerAddress,
        abi: GALLERY_MANAGER_ABI,
        functionName: "likeCharacter",
        args: [BigInt(characterId)],
      });
    } catch (err: any) {
      console.error("Error calling writeContract:", err);
      alert(`Error: ${err.message || "Failed to create transaction"}`);
    }
  };

  return {
    characters,
    loading,
    likeCharacter,
    refetch: refetchCharacters,
  };
}


