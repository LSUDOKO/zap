'use client'

import { sepolia } from "wagmi/chains";
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
import { env } from '@/env';

import "@rainbow-me/rainbowkit/styles.css";

const walletConnectProjectId = env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'fe575b36234dc9b54e34a40e332d7f92';

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
    chains: [sepolia],
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
