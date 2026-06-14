'use client'

import { createBundlerClient } from 'viem/account-abstraction'
import { http, createPublicClient, type Chain } from 'viem'
import { mantleSepoliaTestnet } from 'wagmi/chains'
import { env } from '@/env'

/**
 * Bundler RPC URL for Mantle Sepolia.
 * Falls back to the public Mantle Sepolia RPC if no bundler URL is configured.
 * For production, use a dedicated bundler provider like Pimlico, Biconomy, or Stackup.
 * 
 * Get a Pimlico API key: https://dashboard.pimlico.io
 * Pimlico Mantle Sepolia endpoint: https://api.pimlico.io/v2/5003/rpc?apikey=YOUR_KEY
 */
const MANTLE_SEPOLIA_BUNDLER_URL = 
  process.env.NEXT_PUBLIC_BUNDLER_RPC_URL || 
  'https://rpc.sepolia.mantle.xyz'

/**
 * Paymaster RPC URL for gas sponsorship.
 * When configured, UserOperations can be sponsored (gasless for users).
 */
const MANTLE_SEPOLIA_PAYMASTER_URL = 
  process.env.NEXT_PUBLIC_PAYMASTER_RPC_URL || undefined

// Custom Mantle Sepolia chain definition for the bundler
const mantleSepoliaCustom = {
  ...mantleSepoliaTestnet,
  rpcUrls: {
    default: {
      http: [MANTLE_SEPOLIA_BUNDLER_URL],
    },
    public: {
      http: [env.NEXT_PUBLIC_MANTLE_RPC_URL || 'https://rpc.sepolia.mantle.xyz'],
    },
  },
} as Chain

/**
 * Creates and configures a bundler client for sending UserOperations
 * on Mantle Sepolia. The bundler client is the core of ERC-4337
 * account abstraction — it handles bundling UserOperations, submitting
 * them to the EntryPoint contract, and waiting for receipts.
 * 
 * @param publicClient - A viem PublicClient for the Mantle Sepolia chain
 * @returns A configured BundlerClient
 */
export function createBundlerClientConfig(publicClient: ReturnType<typeof createPublicClient>) {
  const bundlerClient = createBundlerClient({
    client: publicClient,
    transport: http(MANTLE_SEPOLIA_BUNDLER_URL),
    // Paymaster: when a paymaster URL is configured, set paymaster to true
    // so the bundler handles gas sponsorship. The bundler provider (e.g. Pimlico)
    // will use its own paymaster endpoint internally.
    // When not configured, users pay their own gas for UserOperations.
    paymaster: MANTLE_SEPOLIA_PAYMASTER_URL ? true : undefined,
  })

  return bundlerClient
}

export { MANTLE_SEPOLIA_BUNDLER_URL, MANTLE_SEPOLIA_PAYMASTER_URL }
