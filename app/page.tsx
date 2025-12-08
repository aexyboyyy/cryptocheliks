"use client";

import { useAccount, useDisconnect } from "wagmi";
import Link from "next/link";
import { Play, Info, LogOut, User } from "lucide-react";
import { ConnectKitButton } from "connectkit";

export default function HomePage() {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-8">
      {/* Logo */}
      <div className="mb-12">
        <div className="pixel-art text-6xl font-bold text-white mb-4 text-center">
          🦎 CRYPTOCHELIKS
        </div>
        <div className="flex justify-center">
          <div className="pixel-art" style={{ width: "120px", height: "120px" }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Pixel lizard/chameleon logo */}
              <rect x="20" y="30" width="60" height="50" fill="#4ade80" stroke="#000" strokeWidth="2" />
              <rect x="25" y="25" width="20" height="20" fill="#22c55e" stroke="#000" strokeWidth="2" />
              <rect x="55" y="25" width="20" height="20" fill="#22c55e" stroke="#000" strokeWidth="2" />
              <circle cx="30" cy="35" r="3" fill="#000" />
              <circle cx="70" cy="35" r="3" fill="#000" />
              <rect x="35" y="50" width="30" height="8" fill="#16a34a" stroke="#000" strokeWidth="1" />
              <rect x="15" y="60" width="10" height="20" fill="#4ade80" stroke="#000" strokeWidth="1" />
              <rect x="75" y="60" width="10" height="20" fill="#4ade80" stroke="#000" strokeWidth="1" />
              <rect x="25" y="75" width="8" height="15" fill="#4ade80" stroke="#000" strokeWidth="1" />
              <rect x="67" y="75" width="8" height="15" fill="#4ade80" stroke="#000" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4 pixel-art">
          Welcome to Cryptocheliks
        </h1>
        <p className="text-xl text-blue-200 max-w-2xl">
          Create your private pixel character with Fully Homomorphic Encryption (FHE)
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <Link
          href="/gallery"
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-xl flex items-center gap-3 transition-all transform hover:scale-105 pixel-art shadow-lg"
        >
          <Play size={28} />
          <span>PLAY</span>
        </Link>

        {isConnected && (
          <Link
            href="/my-characters"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-bold text-xl flex items-center gap-3 transition-all transform hover:scale-105 pixel-art shadow-lg"
          >
            <User size={28} />
            <span>MY CHARACTERS</span>
          </Link>
        )}

        <Link
          href="/about"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-xl flex items-center gap-3 transition-all transform hover:scale-105 pixel-art shadow-lg"
        >
          <Info size={28} />
          <span>ABOUT</span>
        </Link>
      </div>

      {/* Connect Wallet Button */}
      <div className="mb-8 flex flex-col items-center gap-4">
        <ConnectKitButton />
        {isConnected && (
          <button
            onClick={() => disconnect()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <LogOut size={18} />
            Disconnect Wallet
          </button>
        )}
      </div>

      {/* Status */}
      {isConnected && (
        <div className="text-green-300 text-lg font-semibold mb-4">
          ✅ Wallet Connected
        </div>
      )}

      {/* Quick Info */}
      <div className="mt-12 text-center text-blue-200 max-w-3xl">
        <p className="text-lg">
          Build your unique pixel character with encrypted parts stored on the blockchain.
          <br />
          Powered by <span className="font-bold text-white">Zama FHEVM</span> technology.
        </p>
      </div>
    </main>
  );
}
