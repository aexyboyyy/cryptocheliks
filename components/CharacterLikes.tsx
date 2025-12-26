"use client";

import { useReadContract } from "wagmi";
import { parseAbi } from "viem";
import { getGalleryManagerAddress } from "@/utils/address";

const GALLERY_MANAGER_ABI = parseAbi([
  "function getCharacterLikes(uint256 characterId) public view returns (uint256)",
  "function hasUserLiked(address user, uint256 characterId) public view returns (bool)",
]);

interface CharacterLikesProps {
  characterId: number;
  userAddress?: string;
}

export function useCharacterLikes({ characterId, userAddress }: CharacterLikesProps) {
  const galleryManagerAddress = getGalleryManagerAddress();

  const { data: likesData } = useReadContract({
    address: galleryManagerAddress || undefined,
    abi: GALLERY_MANAGER_ABI,
    functionName: "getCharacterLikes",
    args: [BigInt(characterId)],
    query: {
      enabled: !!galleryManagerAddress && characterId >= 0,
      refetchInterval: 5000,
    },
  });

  const { data: hasLikedData } = useReadContract({
    address: galleryManagerAddress || undefined,
    abi: GALLERY_MANAGER_ABI,
    functionName: "hasUserLiked",
    args: userAddress && characterId >= 0 ? [userAddress as `0x${string}`, BigInt(characterId)] : undefined,
    query: {
      enabled: !!galleryManagerAddress && !!userAddress && characterId >= 0,
    },
  });

  return {
    likes: likesData ? Number(likesData) : 0,
    hasLiked: hasLikedData ? (hasLikedData as boolean) : false,
  };
}



