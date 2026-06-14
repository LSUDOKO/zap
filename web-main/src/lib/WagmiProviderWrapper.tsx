'use client'

import { mantleSepoliaTestnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import {
    darkTheme,
    getDefaultConfig,
    getDefaultWallets,
    RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { rabbyWallet, metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { useState, useEffect } from 'react';
import { defineChain } from 'viem';
import { env } from '@/env';

import "@rainbow-me/rainbowkit/styles.css";

// Use env vars with fallback for the Alchemy RPC
const alchemyApiKey = env.NEXT_PUBLIC_ALCHEMY_API_KEY || 'jsv8qLwrBKaShfeL_NJzfHbWoj5h-hnM';
const mantleRpcUrl = env.NEXT_PUBLIC_MANTLE_RPC_URL || 'https://rpc.sepolia.mantle.xyz';
const walletConnectProjectId = env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'fe575b36234dc9b54e34a40e332d7f92';

const mantleSepoliaCustom = defineChain({
    ...mantleSepoliaTestnet,
    rpcUrls: {
        default: {
            http: [`https://mantle-sepolia.g.alchemy.com/v2/${alchemyApiKey}`],
        },
        public: {
            http: [mantleRpcUrl],
        },
    },
});

const queryClient = new QueryClient();
const { wallets } = getDefaultWallets();
const config = getDefaultConfig({
    appName: "zkPull",
    projectId: walletConnectProjectId,
    wallets: [
        ...wallets,
        {
            groupName: "Other",
            wallets: [rabbyWallet, metaMaskWallet],
        },
    ],
    chains: [mantleSepoliaCustom],
    ssr: true,
});

export function WagmiProviderWrapper({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const theme = darkTheme({
        accentColor: '#7b3fe4',
        accentColorForeground: 'white',
        borderRadius: 'small',
        fontStack: 'system',
        overlayBlur: 'small',
    });

    if (!mounted) {
        return null;
    }

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider modalSize="compact" theme={theme}>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
