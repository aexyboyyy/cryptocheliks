"use client";

import { useEffect, useState } from "react";

export function useFHEVM() {
  const [instance, setInstance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        if (typeof window === "undefined") {
          setLoading(false);
          return;
        }

        // Dynamic import to avoid build-time WASM issues
        // Using eval to prevent webpack from analyzing this import
        const fhevmjsModule = await new Function('return import("fhevmjs")')();
        const { initFhevm, createInstance } = fhevmjsModule;
        const { BrowserProvider } = await import("ethers");

        // Initialize FHEVM
        await initFhevm();

        // Get provider from window.ethereum
        if (!window.ethereum) {
          setError("MetaMask or compatible wallet not found");
          setLoading(false);
          return;
        }

        const provider = new BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);

        // Create FHEVM instance
        const fhevmInstance = await createInstance({ chainId, publicKey: {} });
        setInstance(fhevmInstance);
        setLoading(false);
      } catch (err: any) {
        console.error("FHEVM initialization error:", err);
        setError(err.message || "Failed to initialize FHEVM");
        setLoading(false);
      }
    }

    init();
  }, []);

  return { instance, loading, error };
}

// Helper function to encrypt a number
export function encryptNumber(instance: any, value: number): any {
  if (!instance) return null;
  try {
    return instance.encrypt32(value);
  } catch (err) {
    console.error("Encryption error:", err);
    return null;
  }
}

// Helper function to decrypt a number
export async function decryptNumber(instance: any, encrypted: any): Promise<number | null> {
  if (!instance || !encrypted) return null;
  try {
    const decrypted = instance.decrypt(encrypted);
    return Number(decrypted);
  } catch (err) {
    console.error("Decryption error:", err);
    return null;
  }
}


