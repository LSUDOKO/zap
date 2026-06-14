'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { toMetaMaskSmartAccount, Implementation } from '@metamask/smart-accounts-kit'
import { type Address } from 'viem'

interface SmartAccountContextType {
  smartAccount: any | null
  smartAccountAddress: Address | null
  isCreatingAccount: boolean
  createAccount: () => Promise<void>
  isSmartAccountDeployed: boolean
  deployAccount: () => Promise<string | null>
}

const SmartAccountContext = createContext<SmartAccountContextType>({
  smartAccount: null,
  smartAccountAddress: null,
  isCreatingAccount: false,
  createAccount: async () => {},
  isSmartAccountDeployed: false,
  deployAccount: async () => null,
})

export function useSmartAccount() {
  return useContext(SmartAccountContext)
}

export function MetaMaskSmartAccountProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  
  const [smartAccount, setSmartAccount] = useState<any>(null)
  const [smartAccountAddress, setSmartAccountAddress] = useState<Address | null>(null)
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [isSmartAccountDeployed, setIsSmartAccountDeployed] = useState(false)
  const creatingRef = useRef(false)

  const createAccount = useCallback(async () => {
    if (!address || !walletClient || !publicClient) {
      console.warn('Wallet not connected. Cannot create smart account.')
      return
    }

    // Guard against concurrent creation attempts
    if (creatingRef.current) return
    creatingRef.current = true

    setIsCreatingAccount(true)
    try {
      const account = await toMetaMaskSmartAccount({
        client: publicClient,
        implementation: Implementation.Hybrid,
        deployParams: [address, [], [], []],
        deploySalt: '0x',
        signer: { walletClient },
      })

      setSmartAccount(account)
      setSmartAccountAddress(account.address as Address)
      
      // Check if already deployed
      const code = await publicClient.getCode({ address: account.address as Address })
      setIsSmartAccountDeployed(code !== undefined && code !== '0x')
      
      console.log('✅ MetaMask Smart Account created:', account.address)
    } catch (error) {
      console.error('❌ Failed to create smart account:', error)
    } finally {
      setIsCreatingAccount(false)
      creatingRef.current = false
    }
  }, [address, walletClient, publicClient])

  const deployAccount = useCallback(async () => {
    if (!smartAccount || !publicClient) return null

    try {
      const hash = await smartAccount.deploy()
      await publicClient.waitForTransactionReceipt({ hash })
      setIsSmartAccountDeployed(true)
      console.log('✅ Smart Account deployed at:', smartAccount.address)
      return hash
    } catch (error) {
      console.error('❌ Failed to deploy smart account:', error)
      return null
    }
  }, [smartAccount, publicClient])

  // Auto-create smart account when wallet connects (with race condition guard)
  useEffect(() => {
    if (isConnected && address && walletClient && !smartAccount && !creatingRef.current) {
      createAccount()
    }
  }, [isConnected, address, walletClient, smartAccount, createAccount])

  return (
    <SmartAccountContext.Provider
      value={{
        smartAccount,
        smartAccountAddress,
        isCreatingAccount,
        createAccount,
        isSmartAccountDeployed,
        deployAccount,
      }}
    >
      {children}
    </SmartAccountContext.Provider>
  )
}
