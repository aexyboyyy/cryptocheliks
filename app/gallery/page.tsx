"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { Plus, ArrowLeft, User } from "lucide-react";
import { CharacterCard } from "@/components/CharacterCard";
import { useGallery } from "@/hooks/useGallery";
import { ConnectKitButton } from "connectkit";

export default function GalleryPage() {
  const { address, isConnected } = useAccount();
  const { characters, loading, likeCharacter, refetch } = useGallery();

  // Auto-refresh gallery periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white hover:text-blue-300 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h1 className="text-4xl font-bold text-white pixel-art">
              🦎 Cryptocheliks Gallery
            </h1>
            
            <div className="flex items-center gap-4">
              {isConnected && (
                <>
                  <Link
                    href="/my-characters"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                  >
                    <User size={20} />
                    My Characters
                  </Link>
                  <Link
                    href="/create"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                  >
                    <Plus size={20} />
                    Create Character
                  </Link>
                </>
              )}
              <ConnectKitButton />
            </div>
          </div>
        </div>

        {/* Gallery */}
        <section>
          {loading ? (
            <div className="text-center text-white text-xl">Loading characters...</div>
          ) : characters.length === 0 ? (
            <div className="text-center text-white text-xl bg-white/10 backdrop-blur-md rounded-lg p-12">
              <p className="mb-4">No characters in gallery yet.</p>
              <p className="text-sm text-blue-300 mb-2">
                💡 <strong>Tip:</strong> Make sure your characters are set to "Public" when creating them, or use the "Add to Gallery" button on the "My Characters" page.
              </p>
              {isConnected ? (
                <>
                  <Link
                    href="/create"
                    className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors mb-4"
                  >
                    Create Your First Character
                  </Link>
                  <p className="text-sm text-gray-400 mt-4">
                    Or go to <Link href="/my-characters" className="text-blue-400 underline">My Characters</Link> to add existing characters to the gallery
                  </p>
                </>
              ) : (
                <p className="text-yellow-300">Connect your wallet to create characters!</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {characters.map((characterId) => (
                <CharacterCard
                  key={characterId}
                  characterId={characterId}
                  onLike={() => likeCharacter(characterId)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}


