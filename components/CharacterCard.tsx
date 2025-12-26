"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useAccount } from "wagmi";
import { useCharacter } from "@/hooks/useCharacter";
import { CharacterRenderer } from "./CharacterRenderer";
import { useCharacterLikes } from "./CharacterLikes";

interface CharacterCardProps {
  characterId: number;
  onLike: () => void;
}

export function CharacterCard({ characterId, onLike }: CharacterCardProps) {
  const { address } = useAccount();
  const { character, loading } = useCharacter(characterId);
  const { likes, hasLiked } = useCharacterLikes({ characterId, userAddress: address });
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await onLike();
    } finally {
      setIsLiking(false);
    }
  };

  // If character doesn't exist (was deleted), don't show anything
  if (!loading && !character) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 animate-pulse">
        <div className="h-48 bg-gray-700 rounded mb-4"></div>
        <div className="h-6 bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  if (!character) {
    return null;
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 hover:bg-white/20 transition-all">
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
      
      <div className="flex items-center justify-between">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            hasLiked
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-white"
          } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Heart size={18} fill={hasLiked ? "currentColor" : "none"} />
          <span>{likes}</span>
        </button>
        
        <span className="text-sm text-gray-300">
          by {character.owner.slice(0, 6)}...{character.owner.slice(-4)}
        </span>
      </div>
    </div>
  );
}



