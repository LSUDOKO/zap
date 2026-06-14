import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { env } from '@/env';
import {
    sepolia,
} from 'wagmi/chains';

const walletConnectProjectId = env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'fe575b36234dc9b54e34a40e332d7f92';

export const wagmiConfig = getDefaultConfig({
    appName: 'zkPull.',
    appDescription: "Starting your zk journey with proof generation for GitHub Pull Requests.",
    projectId: walletConnectProjectId,
    chains: [
        sepolia,
    ],
    ssr: true,
});
