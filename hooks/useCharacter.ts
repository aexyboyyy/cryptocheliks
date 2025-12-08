"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseAbi } from "viem";
import { getCharacterManagerAddress } from "@/utils/address";

const CHARACTER_MANAGER_ABI = parseAbi([
  "function getCharacter(uint256 characterId) public view returns (uint32 head, uint32 eyes, uint32 mouth, uint32 body, uint32 hat, uint32 accessory, string memory name, address owner, uint256 createdAt, uint256 updatedAt, bool isPublic)",
  "function getCharacterPublicInfo(uint256 characterId) public view returns (string memory name, address owner, uint256 createdAt, uint256 updatedAt, bool isPublic)",
]);

export function useCharacter(characterId: number) {
  const { address } = useAccount();
  const [character, setCharacter] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const characterManagerAddress = getCharacterManagerAddress();

  const { data: characterData, isLoading: isLoadingData } = useReadContract({
    address: characterManagerAddress || undefined,
    abi: CHARACTER_MANAGER_ABI,
    functionName: "getCharacter",
    args: [BigInt(characterId)],
    query: {
      enabled: !!characterManagerAddress && characterId >= 0,
    },
  });

  useEffect(() => {
    if (characterData) {
      try {
        const [head, eyes, mouth, body, hat, accessory, name, owner, createdAt, updatedAt, isPublic] = characterData as any;
        
        // Check if character exists (owner should not be zero address)
        const ownerAddress = owner as string;
        if (!ownerAddress || ownerAddress === "0x0000000000000000000000000000000000000000") {
          // Character was deleted or doesn't exist
          setCharacter(null);
          setLoading(false);
          return;
        }
        
        setCharacter({
          head: Number(head),
          eyes: Number(eyes),
          mouth: Number(mouth),
          body: Number(body),
          hat: Number(hat),
          accessory: Number(accessory),
          name: name as string,
          owner: ownerAddress,
          createdAt: Number(createdAt),
          updatedAt: Number(updatedAt),
          isPublic: isPublic as boolean,
        });
        setLoading(false);
      } catch (err) {
        console.error("Error parsing character data:", err);
        setCharacter(null);
        setLoading(false);
      }
    } else if (!isLoadingData && characterData === null) {
      // Character not found or query completed
      setCharacter(null);
      setLoading(false);
    } else if (isLoadingData) {
      setLoading(true);
    }
  }, [characterData, isLoadingData]);

  return { character, loading };
}


