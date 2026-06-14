'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { toMetaMaskSmartAccount, Implementation } from '@metamask/smart-accounts-kit'
import { type Address, type PublicClient } from 'viem'
import { type BundlerClient, type SmartAccount } from 'viem/account-abstraction'
import { createBundlerClientConfig } from './bundler.config'

interface SmartAccountContextType {
  smartAccount: SmartAccount | null
  smartAccountAddress: Address | null
  isCreatingAccount: boolean
  createAccount: () => Promise<void>
  isSmartAccountDeployed: boolean
  deployAccount: () => Promise<string | null>
  /** The ERC-4337 bundler client for sending UserOperations */
  bundlerClient: BundlerClient | null
  /** Public client for reading chain state */
  chainPublicClient: PublicClient | null
}

const SmartAccountContext = createContext<SmartAccountContextType>({
  smartAccount: null,
  smartAccountAddress: null,
  isCreatingAccount: false,
  createAccount: async () => {},
  isSmartAccountDeployed: false,
  deployAccount: async () => null,
  bundlerClient: null,
  chainPublicClient: null,
})

export function useSmartAccount() {
  return useContext(SmartAccountContext)
}

export function MetaMaskSmartAccountProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const wagmiPublicClient = usePublicClient()
  
  const [smartAccount, setSmartAccount] = useState<SmartAccount | null>(null)
  const [smartAccountAddress, setSmartAccountAddress] = useState<Address | null>(null)
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [isSmartAccountDeployed, setIsSmartAccountDeployed] = useState(false)
  const creatingRef = useRef(false)

  // Create bundler client once wagmi public client is available
  const bundlerClient = useMemo(() => {
    if (!wagmiPublicClient) return null
    return createBundlerClientConfig(wagmiPublicClient as any)
  }, [wagmiPublicClient])

  const createAccount = useCallback(async () => {
    if (!address || !walletClient || !wagmiPublicClient) {
      console.warn('Wallet not connected. Cannot create smart account.')
      return
    }

    // Guard against concurrent creation attempts
    if (creatingRef.current) return
    creatingRef.current = true

    setIsCreatingAccount(true)
    try {
      const account = await toMetaMaskSmartAccount({
        client: wagmiPublicClient as any,
        implementation: Implementation.Hybrid,
        deployParams: [address, [], [], []],
        deploySalt: '0x',
        signer: { walletClient: walletClient as any },
      })

      setSmartAccount(account as any)
      setSmartAccountAddress(account.address as Address)
      
      // Check if already deployed
      const code = await wagmiPublicClient.getCode({ address: account.address as Address })
      setIsSmartAccountDeployed(code !== undefined && code !== '0x')
      
      console.log('✅ MetaMask Smart Account created:', account.address)
    } catch (error) {
      console.error('❌ Failed to create smart account:', error)
    } finally {
      setIsCreatingAccount(false)
      creatingRef.current = false
    }
  }, [address, walletClient, wagmiPublicClient])

  const deployAccount = useCallback(async () => {
    if (!smartAccount || !wagmiPublicClient) return null

    try {
      const hash = await (smartAccount as any).deploy()
      await wagmiPublicClient.waitForTransactionReceipt({ hash })
      setIsSmartAccountDeployed(true)
      console.log('✅ Smart Account deployed at:', (smartAccount as any).address)
      return hash
    } catch (error) {
      console.error('❌ Failed to deploy smart account:', error)
      return null
    }
  }, [smartAccount, wagmiPublicClient])

  // Auto-create smart account when wallet connects (with race condition guard)
  useEffect(() => {
    if (isConnected && address && walletClient && !smartAccount && !creatingRef.current) {
      createAccount()
    }
  }, [isConnected, address, walletClient, smartAccount, createAccount])

  return (
    <SmartAccountContext.Provider
      value={{
        smartAccount: smartAccount as any,
        smartAccountAddress,
        isCreatingAccount,
        createAccount,
        isSmartAccountDeployed,
        deployAccount,
        bundlerClient,
        chainPublicClient: wagmiPublicClient as any,
      }}
    >
      {children}
    </SmartAccountContext.Provider>
  )
}
