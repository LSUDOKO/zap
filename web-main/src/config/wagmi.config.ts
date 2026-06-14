import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { env } from '@/env';
import {
    mantleSepoliaTestnet,
} from 'wagmi/chains';
import { defineChain } from 'viem';

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

export const wagmiConfig = getDefaultConfig({
    appName: 'zkPull.',
    appDescription: "Starting your zk journey with proof generation for GitHub Pull Requests.",
    projectId: walletConnectProjectId,
    chains: [
        mantleSepoliaCustom,
    ],
    ssr: true,
});
