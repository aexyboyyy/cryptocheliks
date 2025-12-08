"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white hover:text-blue-300 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-5xl font-bold text-white pixel-art mb-4">
            About Cryptocheliks
          </h1>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 space-y-8">
          {/* What is Cryptocheliks */}
          <section>
            <h2 className="text-4xl font-bold text-white mb-6 pixel-art text-center">
              🦎 Create Your Own Unique Pixel Character!
            </h2>
            <div className="text-blue-100 text-xl leading-relaxed space-y-4 text-center">
              <p className="text-2xl font-semibold text-white">
                Welcome to Cryptocheliks! 🎨
              </p>
              <p>
                Build your <strong className="text-green-400">one-of-a-kind</strong> pixel character by mixing and matching different parts! 
                Choose from various heads, eyes, mouths, bodies, hats, and accessories to create something truly special.
              </p>
              <p>
                🎭 <strong className="text-white">Express yourself</strong> - Create as many characters as you want, each with its own unique style and personality!
              </p>
              <p>
                🔒 <strong className="text-white">Privacy first</strong> - Your character's details are encrypted and stored securely on the blockchain using cutting-edge FHE technology.
              </p>
              <p>
                🌟 <strong className="text-white">Share & shine</strong> - Show off your creations in the public gallery and let others like your amazing characters!
              </p>
              <p>
                ✨ <strong className="text-white">Edit anytime</strong> - Change your character's look whenever you want, or create brand new ones!
              </p>
            </div>
          </section>

          {/* How to Play */}
          <section className="bg-green-900/20 rounded-lg p-6">
            <h2 className="text-3xl font-bold text-white mb-4 pixel-art text-center">
              🎮 How to Play
            </h2>
            <div className="text-blue-100 text-lg space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">1️⃣</span>
                <p><strong className="text-white">Connect your wallet</strong> - Link your MetaMask or any Web3 wallet to get started!</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">2️⃣</span>
                <p><strong className="text-white">Create your character</strong> - Use the sliders to customize every part of your pixel character!</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">3️⃣</span>
                <p><strong className="text-white">Name it</strong> - Give your character a cool name and make it public to share with everyone!</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">4️⃣</span>
                <p><strong className="text-white">Show it off</strong> - Browse the gallery, like your favorites, and see what others have created!</p>
              </div>
            </div>
          </section>

          {/* Fun Facts */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-4 pixel-art text-center">
              🚀 Cool Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-100">
              <div className="p-4 bg-blue-900/30 rounded-lg">
                <h3 className="font-bold text-white mb-2 text-lg">🎨 Unlimited Creativity</h3>
                <p className="text-sm">Create as many characters as you want! Mix and match to your heart's content.</p>
              </div>
              <div className="p-4 bg-blue-900/30 rounded-lg">
                <h3 className="font-bold text-white mb-2 text-lg">🔐 Super Secure</h3>
                <p className="text-sm">Powered by Zama FHEVM - your data stays encrypted and private!</p>
              </div>
              <div className="p-4 bg-blue-900/30 rounded-lg">
                <h3 className="font-bold text-white mb-2 text-lg">💚 Like & Share</h3>
                <p className="text-sm">Show your love for awesome characters with likes!</p>
              </div>
              <div className="p-4 bg-blue-900/30 rounded-lg">
                <h3 className="font-bold text-white mb-2 text-lg">✏️ Edit Anytime</h3>
                <p className="text-sm">Changed your mind? No problem! Edit your characters whenever you want.</p>
              </div>
            </div>
          </section>

          {/* Back Button */}
          <div className="pt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Home size={20} />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}


