"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

// Create wagmi config from ConnectKit default config
const wagmiConfig = createConfig(
  getDefaultConfig({
    appName: "Cryptocheliks",
    appDescription: "Private Pixel Character Builder with FHE",
    appUrl: "https://cryptocheliks.vercel.app",
    appIcon: "https://cryptocheliks.vercel.app/icon.png",
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "cryptocheliks-default",
    chains: [sepolia],
    transports: {
      [sepolia.id]: http(),
    },
  })
);

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}


