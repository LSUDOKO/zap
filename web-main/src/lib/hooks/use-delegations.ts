import { useCallback, useState, useRef } from "react";
import { useSmartAccount } from "@/lib/MetaMaskSmartAccountProvider";
import { sepolia } from "wagmi/chains";
import {
  createDelegation,
  getSmartAccountsEnvironment,
  ScopeType,
  type Delegation,
  type Caveats,
} from "@metamask/smart-accounts-kit";
import { encodeDelegations, hashDelegation } from "@metamask/smart-accounts-kit/utils";
import { type Address, type Hex, encodeFunctionData } from "viem";
import { toast } from "sonner";

// ──────────────────────────────────────────────
//  Types
// ──────────────────────────────────────────────

/** Supported delegation scope types */
export type DelegationScopeType =
  | "erc20-transfer-amount"
  | "function-call"
  | "native-token-periodic";

/** Parameters for creating a delegation */
export type CreateDelegationParams = {
  /** The delegate address (who receives authority) */
  to: Address;
  /** The scope defining what the delegate can do */
  scope: {
    type: DelegationScopeType;
    tokenAddress?: Address;
    maxAmount?: bigint;
    to?: Address;
    selector?: Hex;
  };
  /** Optional caveats to further restrict the scope */
  caveats?: Caveats;
  /** Optional hex salt for unique delegation hash (default: random) */
  salt?: Hex;
};

/** An active delegation with its metadata */
export type DelegationInfo = {
  /** The delegation hash used to identify it on-chain */
  hash: Hex;
  /** Who granted this delegation */
  from: Address;
  /** Who received this delegation */
  to: Address;
  /** The scope of authority */
  scope: string;
  /** Whether the delegation is currently active */
  isActive: boolean;
  /** Serialized delegation JSON for sharing with operator */
  delegationData?: Delegation;
};

export type DelegationsState = {
  /** Whether a delegation operation is in progress */
  isPending: boolean;
  /** List of active delegations on the current smart account */
  delegations: DelegationInfo[];
  /** Error message if the last operation failed */
  error: string | null;
  /** The last created delegation object (for sharing/export) */
  lastCreatedDelegation: Delegation | null;
};

// ──────────────────────────────────────────────
//  Helper: generate a random hex salt
// ──────────────────────────────────────────────

function randomSalt(): Hex {
  const chars = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
  return `0x${chars}` as Hex;
}

// ──────────────────────────────────────────────
//  Helper: extract a human-readable scope label
// ──────────────────────────────────────────────

// ──────────────────────────────────────────────
//  Hook
// ──────────────────────────────────────────────

/**
 * `useDelegations`
 *
 * Hook for ERC-7710 Delegation management with MetaMask Smart Accounts Kit.
 * Allows smart account owners to delegate authority to other accounts,
 * check existing delegations, and revoke them.
 *
 * Delegations created in-session are tracked locally and appear immediately
 * in the `delegations` list without requiring on-chain confirmation.
 *
 * ## Usage
 *
 * ```tsx
 * const {
 *   createNewDelegation,
 *   fetchDelegations,
 *   disableDelegation,
 *   delegations,
 *   isPending,
 *   lastCreatedDelegation,
 * } = useDelegations();
 *
 * // Grant the AVS operator the ability to call validateClaim()
 * const delegation = await createNewDelegation({
 *   to: avsOperatorAddress,
 *   scope: {
 *     type: "function-call",
 *     to: ISSUE_ADDRESS,
 *     selector: toFunctionSelector("validateClaim(uint256,uint256,bool)"),
 *   },
 * });
 * ```
 */
export function useDelegations() {
  const { smartAccount, bundlerClient, chainPublicClient } = useSmartAccount();

  const [state, setState] = useState<DelegationsState>({
    isPending: false,
    delegations: [],
    error: null,
    lastCreatedDelegation: null,
  });

  // Local cache of in-session delegations (survives re-renders)
  const localDelegationsRef = useRef<Map<string, DelegationInfo>>(new Map());

  /**
   * Get the SDK environment for the current chain.
   */
  const getEnvironment = useCallback(() => {
    return getSmartAccountsEnvironment(sepolia.id);
  }, []);

  /**
   * Build a DelegationInfo from a Delegation object.
   */
  const toDelegationInfo = useCallback(
    (delegation: Delegation, isActive = true): DelegationInfo => {
      const hash = hashDelegation(delegation);
      const scopeStr =
        (delegation as any).scope?.type ||
        (delegation as any).scopeType ||
        "Unknown";
      return {
        hash,
        from: (delegation as any).delegator || (delegation as any).from || "0x",
        to: (delegation as any).delegate || (delegation as any).to || "0x",
        scope: scopeStr,
        isActive,
        delegationData: delegation,
      };
    },
    []
  );

  // ──────────────────
  //  Create Delegation
  // ──────────────────

  /**
   * Create a new delegation from the current smart account to a delegate.
   *
   * This creates the delegation object offline (no transaction sent).
   * The delegation is immediately added to the local cache so it shows
   * in the UI. To activate it on-chain, call `redeemDelegations` with
   * the signed delegation.
   *
   * @param params - The delegation parameters
   * @returns The created Delegation object, or null on failure
   *
   * @example
   * ```ts
   * // Delegate validateClaim() authority to the AVS operator
   * const delegation = await createNewDelegation({
   *   to: avsOperatorAddress,
   *   scope: {
   *     type: "function-call",
   *     to: ISSUE_ADDRESS,
   *     selector: toFunctionSelector("validateClaim(uint256,uint256,bool)"),
   *   },
   * });
   * ```
   */
  const createNewDelegation = useCallback(
    async (params: CreateDelegationParams): Promise<Delegation | null> => {
      if (!smartAccount) {
        toast.error("Smart account not initialized.");
        return null;
      }

      setState((prev) => ({ ...prev, isPending: true, error: null }));

      try {
        const environment = getEnvironment();

        // Map user-friendly scope type to SDK ScopeType
        const scopeTypeMap: Record<string, string> = {
          "erc20-transfer-amount": ScopeType.Erc20TransferAmount,
          "function-call": ScopeType.FunctionCall,
          "native-token-periodic": "erc20-token-periodic",
        };

        const scopeType = scopeTypeMap[params.scope.type] || params.scope.type;

        // Build the scope object for createDelegation
        const scope: Record<string, unknown> = {
          type: scopeType,
        };

        if (params.scope.tokenAddress) {
          scope.tokenAddress = params.scope.tokenAddress;
        }
        if (params.scope.maxAmount !== undefined) {
          scope.maxAmount = params.scope.maxAmount;
        }
        if (params.scope.to) {
          scope.to = params.scope.to;
        }
        if (params.scope.selector) {
          scope.selector = params.scope.selector;
        }

        toast.loading("Creating delegation...", {
          id: "create-delegation",
        });

        const delegation = createDelegation({
          to: params.to,
          from: smartAccount.address as Address,
          environment,
          salt: params.salt || randomSalt(),
          scope: scope as any,
          caveats: params.caveats || [],
        });

        toast.dismiss("create-delegation");

        // Compute delegation hash and add to local cache immediately
        const info = toDelegationInfo(delegation, true);
        localDelegationsRef.current.set(info.hash, info);

        setState((prev) => ({
          ...prev,
          isPending: false,
          lastCreatedDelegation: delegation,
          delegations: Array.from(localDelegationsRef.current.values()),
        }));

        toast.success("Delegation created! Share the delegation data with the operator for on-chain redemption.");
        return delegation;
      } catch (err: any) {
        toast.dismiss("create-delegation");

        const msg = err?.message || "Failed to create delegation";
        console.error("createNewDelegation error:", msg);
        setState((prev) => ({ ...prev, isPending: false, error: msg }));
        toast.error("Delegation failed", { description: msg });

        return null;
      }
    },
    [smartAccount, getEnvironment, toDelegationInfo]
  );

  // ────────────────────
  //  Redeem Delegations
  // ────────────────────

  /**
   * Submit delegations to the delegation contract to activate them on-chain.
   *
   * **Important**: Delegations must be signed before redemption.
   * The SDK's `signDelegation` function uses EIP-712 typed data signing
   * with the **delegator's private key** (server-side usage):
   *
   * ```ts
   * import { signDelegation } from "@metamask/smart-accounts-kit";
   * const signed = await signDelegation({
   *   privateKey: "0x...",
   *   delegation,
   *   delegationManager: "0x...", // from getSmartAccountsEnvironment()
   *   chainId: 11155111,
   * });
   * ```
   *
   * @param delegations - Array of signed Delegation objects to submit
   * @returns Transaction hash if successful, null otherwise
   */
  const redeemDelegations = useCallback(
    async (delegations: Delegation[]): Promise<Hex | null> => {
      if (!smartAccount || !bundlerClient) {
        toast.error("Smart account or bundler not initialized.");
        return null;
      }

      setState((prev) => ({ ...prev, isPending: true, error: null }));

      try {
        toast.loading("Submitting delegations on-chain...", {
          id: "redeem-delegations",
        });

        // Encode the redeemDelegations call
        const encodedDelegations = encodeDelegations(delegations);

        // Get the delegation contract address from the environment
        const environment = getEnvironment();
        const delegationContractAddress = (environment as any)
          ?.delegationContractAddress;

        if (!delegationContractAddress) {
          throw new Error(
            "Delegation contract address not found in environment."
          );
        }

        const userOpHash = await bundlerClient.sendUserOperation({
          account: smartAccount as any,
          calls: [
            {
              to: delegationContractAddress as Address,
              value: BigInt(0),
              data: encodedDelegations as Hex,
            },
          ],
        });

        const receipt = await bundlerClient.waitForUserOperationReceipt({
          hash: userOpHash,
        });

        toast.dismiss("redeem-delegations");

        setState((prev) => ({ ...prev, isPending: false }));

        const txHash = receipt.receipt.transactionHash;
        toast.success("Delegations submitted on-chain!");
        return txHash;
      } catch (err: any) {
        toast.dismiss("redeem-delegations");

        const msg = err?.message || "Failed to submit delegations";
        console.error("redeemDelegations error:", msg);
        setState((prev) => ({ ...prev, isPending: false, error: msg }));
        toast.error("Submission failed", { description: msg });

        return null;
      }
    },
    [smartAccount, bundlerClient, getEnvironment]
  );

  // ────────────────────
  //  Disable Delegation
  // ────────────────────

  /**
   * Disable/revoke a delegation on-chain.
   *
   * @param delegationHash - The hash of the delegation to disable
   * @returns Transaction hash if successful, null otherwise
   */
  const disableDelegation = useCallback(
    async (delegationHash: Hex): Promise<Hex | null> => {
      if (!smartAccount || !bundlerClient) {
        toast.error("Smart account or bundler not initialized.");
        return null;
      }

      setState((prev) => ({ ...prev, isPending: true, error: null }));

      try {
        toast.loading("Disabling delegation...", {
          id: "disable-delegation",
        });

        // Get the delegation contract address from the environment
        const environment = getEnvironment();
        const delegationContractAddress = (environment as any)
          ?.delegationContractAddress;

        if (!delegationContractAddress) {
          throw new Error(
            "Delegation contract address not found in environment."
          );
        }

        const delegationAbi = [
          {
            name: "disableDelegation",
            type: "function",
            inputs: [{ name: "delegationHash", type: "bytes32" }],
            outputs: [],
            stateMutability: "nonpayable",
          },
        ];
        const callData = encodeFunctionData({
          abi: delegationAbi,
          functionName: "disableDelegation",
          args: [delegationHash],
        });

        const userOpHash = await bundlerClient.sendUserOperation({
          account: smartAccount as any,
          calls: [
            {
              to: delegationContractAddress as Address,
              value: BigInt(0),
              data: callData,
            },
          ],
        });

        const receipt = await bundlerClient.waitForUserOperationReceipt({
          hash: userOpHash,
        });

        toast.dismiss("disable-delegation");

        setState((prev) => ({ ...prev, isPending: false }));

        const txHash = receipt.receipt.transactionHash;

        // Remove from local cache
        localDelegationsRef.current.delete(delegationHash);

        setState((prev) => ({
          ...prev,
          delegations: Array.from(localDelegationsRef.current.values()),
        }));

        toast.success("Delegation revoked!");
        return txHash;
      } catch (err: any) {
        toast.dismiss("disable-delegation");

        const msg = err?.message || "Failed to disable delegation";
        console.error("disableDelegation error:", msg);
        setState((prev) => ({ ...prev, isPending: false, error: msg }));
        toast.error("Revocation failed", { description: msg });

        return null;
      }
    },
    [smartAccount, bundlerClient, getEnvironment]
  );

  // ────────────────────
  //  Get Delegations
  // ────────────────────

  /**
   * Fetch all delegations from the connected smart account.
   *
   * Returns a combination of:
   * - **Local cache**: Delegations created during the current session
   *   (appear immediately, no blockchain confirmation needed)
   * - **On-chain delegations**: Attempts to read from the delegation
   *   contract via the delegation manager
   *
   * @returns Array of DelegationInfo
   */
  const fetchDelegations = useCallback(async (): Promise<DelegationInfo[]> => {
    if (!smartAccount) {
      return [];
    }

    setState((prev) => ({ ...prev, isPending: true, error: null }));

    try {
      const environment = getEnvironment();
      const delegationContractAddress = (environment as any)
        ?.delegationContractAddress;

      // Try to read on-chain delegations via the delegation manager
      if (delegationContractAddress && chainPublicClient) {
        try {
          // Attempt to read from the delegation manager contract.
          // The ERC-7710 delegation contract stores delegations in a
          // mapping by hash, so we try to read the delegation manager
          // address from the smart account.
          const delegationManager = await chainPublicClient.readContract({
            address: smartAccount.address as Address,
            abi: [
              {
                name: "getDelegationManager",
                type: "function",
                inputs: [],
                outputs: [{ name: "", type: "address" }],
                stateMutability: "view",
              },
            ],
            functionName: "getDelegationManager",
          });

          if (delegationManager && delegationManager !== "0x") {
            // We found the delegation manager — we can query it for
            // specific delegation hashes if we had them. Since there's
            // no generic "getAllDelegations" view function, we rely
            // on the local cache for in-session visibility.
            console.log(
              `Delegation manager found at ${delegationManager}`
            );
          }
        } catch {
          // Delegation manager read failed — not all smart accounts
          // implement this function. Fall through to local cache only.
        }
      }

      // Build final list: local cache + any on-chain delegations
      const localInfo = Array.from(localDelegationsRef.current.values());

      // Mark all local delegations as active (they haven't been revoked)
      const finalDelegations = localInfo.map((d) => ({
        ...d,
        isActive: true,
      }));

      setState((prev) => ({
        ...prev,
        isPending: false,
        delegations: finalDelegations,
      }));

      return finalDelegations;
    } catch (err: any) {
      const msg = err?.message || "Failed to fetch delegations";
      console.error("fetchDelegations error:", msg);
      setState((prev) => ({ ...prev, isPending: false, error: msg }));
      return Array.from(localDelegationsRef.current.values());
    }
  }, [smartAccount, chainPublicClient, getEnvironment]);

  // ────────────────────
  //  Export / Serialize
  // ────────────────────

  /**
   * Get the serialized JSON of a delegation by hash, suitable for
   * sharing with the AVS operator for signing and redemption.
   *
   * @param delegationHash - The hash of the delegation to export
   * @returns JSON string of the delegation data, or null if not found
   */
  const exportDelegationData = useCallback(
    (delegationHash: Hex): string | null => {
      const info = localDelegationsRef.current.get(delegationHash);
      if (!info?.delegationData) return null;
      return JSON.stringify(info.delegationData, (_key, value) =>
        typeof value === "bigint" ? value.toString() : value
      );
    },
    []
  );

  /**
   * Reset the delegations state (e.g., on wallet disconnect).
   */
  const reset = useCallback(() => {
    localDelegationsRef.current.clear();
    setState({
      isPending: false,
      delegations: [],
      error: null,
      lastCreatedDelegation: null,
    });
  }, []);

  return {
    // State
    ...state,
    // Delegation operations
    createNewDelegation,
    redeemDelegations,
    disableDelegation,
    fetchDelegations,
    // Export / serialize
    exportDelegationData,
    // Utility
    reset,
  };
}
