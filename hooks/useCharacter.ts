"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseAbi } from "viem";
import { getCharacterManagerAddress } from "@/utils/address";
import { getOriginalCharacterParts } from "@/lib/fheEncryption";

const CHARACTER_MANAGER_ABI = parseAbi([
  "function getCharacter(uint256 characterId) public view returns (bytes32 encryptedHead, bytes32 encryptedEyes, bytes32 encryptedMouth, bytes32 encryptedBody, bytes32 encryptedHat, bytes32 encryptedAccessory, string memory name, address owner, uint256 createdAt, uint256 updatedAt, bool isPublic)",
  "function getCharacterPublicInfo(uint256 characterId) public view returns (string memory name, address owner, uint256 createdAt, uint256 updatedAt, bool isPublic)",
  "function getEncryptedCharacterParts(uint256 characterId) public view returns (bytes32 encryptedHead, bytes32 encryptedEyes, bytes32 encryptedMouth, bytes32 encryptedBody, bytes32 encryptedHat, bytes32 encryptedAccessory)",
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
    async function loadAndDecryptCharacter() {
      if (!characterData || !address || !characterManagerAddress) {
        if (!isLoadingData && characterData === null) {
          setCharacter(null);
          setLoading(false);
        } else if (isLoadingData) {
          setLoading(true);
        }
        return;
      }

      try {
        const [encryptedHead, encryptedEyes, encryptedMouth, encryptedBody, encryptedHat, encryptedAccessory, name, owner, createdAt, updatedAt, isPublic] = characterData as any;
        
        // Check if character exists
        const ownerAddress = owner as string;
        if (!ownerAddress || ownerAddress === "0x0000000000000000000000000000000000000000") {
          setCharacter(null);
          setLoading(false);
          return;
        }
        
        // Get original character parts from localStorage (stored when character was created)
        const originalParts = getOriginalCharacterParts(characterId);
        
        // If we have original parts, use them; otherwise use default values
        const parts = originalParts || {
          head: 0,
          eyes: 0,
          mouth: 0,
          body: 0,
          hat: 0,
          accessory: 0,
        };
        
        setCharacter({
          head: parts.head,
          eyes: parts.eyes,
          mouth: parts.mouth,
          body: parts.body,
          hat: parts.hat,
          accessory: parts.accessory,
          name: name as string,
          owner: ownerAddress,
          createdAt: Number(createdAt),
          updatedAt: Number(updatedAt),
          isPublic: isPublic as boolean,
        });
        setLoading(false);
      } catch (err) {
        console.error("Error parsing or decrypting character data:", err);
        setCharacter(null);
        setLoading(false);
      }
    }

    loadAndDecryptCharacter();
  }, [characterData, isLoadingData, characterId, address, characterManagerAddress]);

  return { character, loading };
}


