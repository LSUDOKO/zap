import { useCallback, useState } from "react";
import { useSmartAccount } from "@/lib/MetaMaskSmartAccountProvider";
import { sepolia } from "wagmi/chains";
import { erc7715ProviderActions } from "@metamask/smart-accounts-kit/actions";
import { getSmartAccountsEnvironment } from "@metamask/smart-accounts-kit";
import {
  createWalletClient,
  custom,
} from "viem";
import type { Address, Hex } from "viem";
import { toast } from "sonner";

// ──────────────────────────────────────────────
//  Types
// ──────────────────────────────────────────────

export type PermissionType =
  | "erc20-token-periodic"
  | "erc20-token-allowance"
  | "function-call"
  | "native-token-periodic";

export type PermissionRequest = {
  type: PermissionType;
  data: Record<string, unknown>;
  isAdjustmentAllowed?: boolean;
};

export type GrantedPermission = {
  context: Hex;
  permissions: Array<{
    type: string;
    data: Record<string, unknown>;
  }>;
  expiry: number;
  to: Address;
};

/** Supported permission types as a flat string array. */
export type SupportedPermissionTypes = string[];

export type ExecutionCall = {
  to: Address;
  value: bigint;
  data: Hex;
};

export type AdvancedPermissionsState = {
  /** Whether a permissions request is in progress */
  isRequesting: boolean;
  /** Whether the user is checking supported permissions */
  isChecking: boolean;
  /** Whether a permission-context execution is in progress */
  isExecuting: boolean;
  /** Error message if the last operation failed */
  error: string | null;
  /** The last successfully granted permission context */
  grantedPermissions: GrantedPermission[];
  /** Supported permission types from the connected wallet */
  supportedPermissions: string[];
};

// ──────────────────────────────────────────────
//  Hook
// ──────────────────────────────────────────────

/**
 * `useAdvancedPermissions`
 *
 * Hook for ERC-7715 Advanced Permissions with MetaMask Smart Accounts Kit.
 * Allows dapps to request fine-grained execution permissions from MetaMask users.
 *
 * ## Usage
 *
 * ```tsx
 * const { checkSupportedPermissions, requestPermissions } = useAdvancedPermissions();
 *
 * // Check what permissions the wallet supports
 * const supported = await checkSupportedPermissions();
 *
 * // Request permission to spend 10 mUSD/day
 * const granted = await requestPermissions([{
 *   type: "erc20-token-periodic",
 *   data: {
 *     tokenAddress: USD_TOKEN_ADDRESS,
 *     periodAmount: parseEther("10"),
 *     periodDuration: 86400, // 1 day
 *   },
 * }]);
 * ```
 */
export function useAdvancedPermissions() {
  const { smartAccount } = useSmartAccount();

  const [state, setState] = useState<AdvancedPermissionsState>({
    isRequesting: false,
    isChecking: false,
    isExecuting: false,
    error: null,
    grantedPermissions: [],
    supportedPermissions: [],
  });

  /**
   * Create an ERC-7715 wallet client from the connected MetaMask wallet.
   * This extends the wagmi wallet client with `requestExecutionPermissions`,
   * `getSupportedExecutionPermissions`, and `getGrantedExecutionPermissions`.
   */
  const getErc7715Client = useCallback(() => {
    if (!window.ethereum) {
      throw new Error("MetaMask not detected. Please install MetaMask.");
    }

    return createWalletClient({
      transport: custom(window.ethereum),
      chain: sepolia,
    }).extend(erc7715ProviderActions());
  }, []);

  /**
   * Check which permission types the connected wallet supports.
   *
   * @returns Array of supported permission type strings
   */
  const checkSupportedPermissions = useCallback(async (): Promise<string[]> => {
    setState((prev) => ({ ...prev, isChecking: true, error: null }));

    try {
      const client = getErc7715Client();
      const result = await (client as any).getSupportedExecutionPermissions();
      const permissions: string[] = result?.permissions ?? [];

      setState((prev) => ({
        ...prev,
        isChecking: false,
        supportedPermissions: permissions,
      }));

      return permissions;
    } catch (err: any) {
      const msg = err?.message || "Failed to check supported permissions";
      console.error("checkSupportedPermissions error:", msg);
      setState((prev) => ({ ...prev, isChecking: false, error: msg }));
      return [];
    }
  }, [getErc7715Client]);

  /**
   * Request execution permissions from the MetaMask user.
   * The user will see a MetaMask prompt to approve or reject.
   *
   * @param requests - Array of permission requests
   * @param options - Optional: chainId (defaults to Sepolia), expiry
   * @returns Granted permission contexts, or empty array if rejected
   *
   * @example
   * ```ts
   * const granted = await requestPermissions([{
   *   type: "erc20-token-periodic",
   *   data: {
   *     tokenAddress: "0x...",
   *     periodAmount: parseEther("10"),
   *     periodDuration: 86400,
   *     justification: "Auto-distribute bounty rewards",
   *   },
   * }]);
   *
   * if (granted.length > 0) {
   *   await executeWithPermissions(granted[0].context, calls);
   * }
   * ```
   */
  const requestPermissions = useCallback(
    async (
      requests: PermissionRequest[],
      options?: {
        chainId?: number;
        expiry?: number;
        to?: Address;
      }
    ): Promise<GrantedPermission[]> => {
      const currentTime = Math.floor(Date.now() / 1000);
      const expiry = options?.expiry ?? currentTime + 604800; // 1 week default

      setState((prev) => ({ ...prev, isRequesting: true, error: null }));

      try {
        const client = getErc7715Client();

        const params = requests.map((req) => ({
          chainId: options?.chainId ?? sepolia.id,
          expiry,
          ...(options?.to ? { to: options.to } : {}),
          permission: {
            type: req.type,
            data: req.data,
            isAdjustmentAllowed: req.isAdjustmentAllowed ?? false,
          },
        }));

        toast.loading("MetaMask is requesting permission approval...", {
          id: "advanced-permissions",
        });

        const result = await (client as any).requestExecutionPermissions(params);

        toast.dismiss("advanced-permissions");

        const granted: GrantedPermission[] = (result || []).map(
          (perm: any) => ({
            context: perm.context,
            permissions: perm.permissions || [],
            expiry: perm.expiry || expiry,
            to: perm.to || options?.to || "",
          })
        );

        setState((prev) => ({
          ...prev,
          isRequesting: false,
          grantedPermissions: granted,
        }));

        if (granted.length > 0) {
          toast.success("Permissions granted!");
        } else {
          toast.error("Permission request rejected.");
        }

        return granted;
      } catch (err: any) {
        toast.dismiss("advanced-permissions");

        const msg = err?.message || "Permission request failed";
        console.error("requestPermissions error:", msg);
        setState((prev) => ({ ...prev, isRequesting: false, error: msg }));
        toast.error("Permission request failed", { description: msg });

        return [];
      }
    },
    [getErc7715Client]
  );

  /**
   * Retrieve currently granted execution permissions from MetaMask.
   *
   * @returns Array of granted permission contexts
   */
  const getGrantedPermissions = useCallback(async (): Promise<GrantedPermission[]> => {
    setState((prev) => ({ ...prev, error: null }));

    try {
      const client = getErc7715Client();
      const result = await (client as any).getGrantedExecutionPermissions();

      const granted: GrantedPermission[] = (result || []).map(
        (perm: any) => ({
          context: perm.context,
          permissions: perm.permissions || [],
          expiry: perm.expiry || 0,
          to: perm.to || "",
        })
      );

      setState((prev) => ({
        ...prev,
        grantedPermissions: granted,
      }));

      return granted;
    } catch (err: any) {
      const msg = err?.message || "Failed to get granted permissions";
      console.error("getGrantedPermissions error:", msg);
      setState((prev) => ({ ...prev, error: msg }));
      return [];
    }
  }, [getErc7715Client]);

  /**
   * Execute calls using a granted permission context.
   * Uses the smart account's `executePermissionContext` method with
   * the full `SmartAccountsEnvironment` from the SDK.
   *
   * @param permissionContext - The hex-encoded permission context from requestPermissions
   * @param calls - Array of calls to execute
   * @returns Transaction hash if successful, null otherwise
   */
  const executeWithPermissions = useCallback(
    async (
      permissionContext: Hex,
      calls: ExecutionCall[]
    ): Promise<Hex | null> => {
      if (!smartAccount) {
        toast.error("Smart account not initialized.");
        return null;
      }

      setState((prev) => ({ ...prev, isExecuting: true, error: null }));

      try {
        toast.loading("Executing with permission context...", {
          id: "execute-permission",
        });

        const environment = getSmartAccountsEnvironment(sepolia.id);

        const result = await (smartAccount as any).executePermissionContext({
          environment,
          permissionContext,
          calls: calls.map((call) => ({
            to: call.to,
            value: call.value,
            data: call.data,
          })),
        });

        toast.dismiss("execute-permission");

        setState((prev) => ({ ...prev, isExecuting: false }));

        toast.success("Execution successful!");
        return result;
      } catch (err: any) {
        toast.dismiss("execute-permission");

        const msg = err?.message || "Permission context execution failed";
        console.error("executeWithPermissions error:", msg);
        setState((prev) => ({ ...prev, isExecuting: false, error: msg }));
        toast.error("Execution failed", { description: msg });

        return null;
      }
    },
    [smartAccount]
  );

  /**
   * Redelegate a permission context to another address with optional narrowed caveats.
   * The delegate can only narrow the original authority, never expand it.
   *
   * @param params - Redelegation parameters
   * @param params.to - The address to delegate authority to
   * @param params.permissionContext - The existing permission context hex
   * @param params.caveats - Optional narrowed caveats (e.g., lower spend limits)
   * @returns The new permission context for the redelegation, or null if failed
   *
   * @example
   * ```ts
   * const redelegated = await redelegatePermissions({
   *   to: avsOperatorAddress,
   *   permissionContext: grantedPermissions[0].context,
   *   caveats: [{
   *     type: CaveatType.Erc20TransferAmount,
   *     tokenAddress: USD_TOKEN_ADDRESS,
   *     maxAmount: parseEther("5"),
   *   }],
   * });
   * ```
   */
  const redelegatePermissions = useCallback(
    async (params: {
      to: Address;
      permissionContext: Hex;
      caveats?: Array<{
        type: string;
        tokenAddress?: Address;
        maxAmount?: bigint;
        [key: string]: unknown;
      }>;
    }): Promise<Hex | null> => {
      if (!smartAccount) {
        toast.error("Smart account not initialized.");
        return null;
      }

      setState((prev) => ({ ...prev, isExecuting: true, error: null }));

      try {
        toast.loading("Creating permission redelegation...", {
          id: "redelegate-permission",
        });

        const environment = getSmartAccountsEnvironment(sepolia.id);

        const result = await (smartAccount as any).redelegatePermissionContext({
          to: params.to,
          environment,
          permissionContext: params.permissionContext,
          caveats: params.caveats || [],
        });

        toast.dismiss("redelegate-permission");

        setState((prev) => ({ ...prev, isExecuting: false }));

        const newPermissionContext: Hex = result?.permissionContext || result;
        toast.success("Redelegation created!");
        return newPermissionContext;
      } catch (err: any) {
        toast.dismiss("redelegate-permission");

        const msg = err?.message || "Redelegation failed";
        console.error("redelegatePermissions error:", msg);
        setState((prev) => ({ ...prev, isExecuting: false, error: msg }));
        toast.error("Redelegation failed", { description: msg });

        return null;
      }
    },
    [smartAccount]
  );

  /**
   * Reset the state (e.g., after a user disconnects their wallet).
   */
  const reset = useCallback(() => {
    setState({
      isRequesting: false,
      isChecking: false,
      isExecuting: false,
      error: null,
      grantedPermissions: [],
      supportedPermissions: [],
    });
  }, []);

  return {
    // State
    ...state,
    // Permission requests
    checkSupportedPermissions,
    requestPermissions,
    getGrantedPermissions,
    executeWithPermissions,
    redelegatePermissions,
    // Utility
    reset,
  };
}
