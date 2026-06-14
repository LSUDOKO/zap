'use client'

import { createBundlerClient } from 'viem/account-abstraction'
import { http, createPublicClient, type Chain } from 'viem'
import { sepolia } from 'wagmi/chains'

/**
 * Bundler RPC URL for Ethereum Sepolia.
 * Falls back to the public Sepolia RPC if no bundler URL is configured.
 * For production, use a dedicated bundler provider like Pimlico, Biconomy, or Stackup.
 * 
 * Get a Pimlico API key: https://dashboard.pimlico.io
 * Pimlico Sepolia endpoint: https://api.pimlico.io/v2/11155111/rpc?apikey=YOUR_KEY
 */
const BUNDLER_RPC_URL = 
  process.env.NEXT_PUBLIC_BUNDLER_RPC_URL || 
  'https://ethereum-sepolia.publicnode.com'

/**
 * Paymaster RPC URL for gas sponsorship.
 * When configured, UserOperations can be sponsored (gasless for users).
 */
const PAYMASTER_RPC_URL = 
  process.env.NEXT_PUBLIC_PAYMASTER_RPC_URL || undefined

/**
 * Creates and configures a bundler client for sending UserOperations
 * on Ethereum Sepolia. The bundler client is the core of ERC-4337
 * account abstraction — it handles bundling UserOperations, submitting
 * them to the EntryPoint contract, and waiting for receipts.
 * 
 * @param publicClient - A viem PublicClient for the Sepolia chain
 * @returns A configured BundlerClient
 */
export function createBundlerClientConfig(publicClient: ReturnType<typeof createPublicClient>) {
  const bundlerClient = createBundlerClient({
    client: publicClient,
    transport: http(BUNDLER_RPC_URL),
    // Paymaster: when a paymaster URL is configured, set paymaster to true
    // so the bundler handles gas sponsorship. The bundler provider (e.g. Pimlico)
    // will use its own paymaster endpoint internally.
    paymaster: PAYMASTER_RPC_URL ? true : undefined,
  })

  return bundlerClient
}

export { BUNDLER_RPC_URL, PAYMASTER_RPC_URL }
