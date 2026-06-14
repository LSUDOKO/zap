"use client";

import React, { useEffect, useCallback } from "react";
import { useDelegations } from "@/lib/hooks/use-delegations";
import { useWallet } from "@/lib/hooks/use-wallet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, ShieldX, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { type Hex } from "viem";

/**
 * DelegationSection
 *
 * Displays the user's active ERC-7710 delegations and allows revoking them.
 * Use this in the Profile page or any settings panel.
 *
 * ## Usage
 * ```tsx
 * <DelegationSection />
 * ```
 */
export default function DelegationSection() {
  const { address } = useWallet();
  const {
    delegations,
    fetchDelegations,
    disableDelegation,
    isPending,
    error,
  } = useDelegations();

  const [revokingHashes, setRevokingHashes] = React.useState<Set<string>>(
    new Set()
  );

  // Fetch delegations when the component mounts and address changes
  useEffect(() => {
    if (address) {
      fetchDelegations();
    }
  }, [address, fetchDelegations]);

  const handleRevoke = useCallback(
    async (delegationHash: Hex) => {
      setRevokingHashes((prev) => new Set(prev).add(delegationHash));
      try {
        const result = await disableDelegation(delegationHash);
        if (result) {
          // refresh list after revocation
          await fetchDelegations();
        }
      } finally {
        setRevokingHashes((prev) => {
          const next = new Set(prev);
          next.delete(delegationHash);
          return next;
        });
      }
    },
    [disableDelegation, fetchDelegations]
  );

  // Get a human-readable label for a scope type
  const getScopeLabel = (scope: string): string => {
    if (scope.includes("Erc20TransferAmount") || scope.includes("erc20-transfer")) {
      return "ERC-20 Transfer";
    }
    if (scope.includes("FunctionCall") || scope.includes("function-call") || scope.includes("validateClaim")) {
      return "Claim Validation";
    }
    if (scope.includes("Erc20TokenPeriodic") || scope.includes("periodic")) {
      return "Periodic Transfer";
    }
    return scope || "Unknown";
  };

  const getScopeBadgeVariant = (scope: string): "default" | "secondary" | "outline" => {
    if (scope.includes("FunctionCall") || scope.includes("function-call") || scope.includes("validateClaim")) {
      return "default";
    }
    if (scope.includes("Erc20TransferAmount") || scope.includes("erc20-transfer")) {
      return "secondary";
    }
    return "outline";
  };

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="w-5 h-5" />
            Delegations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Connect your wallet to view and manage delegations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="w-5 h-5" />
          Delegations & Permissions
        </CardTitle>
        <p className="text-sm text-gray-500">
          Manage who can execute actions on your behalf via ERC-7710 delegations.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Refresh button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDelegations}
            disabled={isPending}
            className="text-xs"
          >
            {isPending ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : null}
            Refresh
          </Button>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!isPending && delegations.length === 0 && !error && (
          <div className="text-center py-8 text-gray-500">
            <ShieldX className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium">No active delegations</p>
            <p className="text-xs mt-1">
              Delegations allow your smart account to grant execution authority
              to other accounts like the AVS operator.
            </p>
          </div>
        )}

        {/* Loading state */}
        {isPending && delegations.length === 0 && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        )}

        {/* Delegation list */}
        {delegations.length > 0 && (
          <div className="space-y-3">
            {delegations.map((delegation) => (
              <div
                key={delegation.hash}
                className="border border-gray-200 rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getScopeBadgeVariant(delegation.scope)}
                    >
                      {getScopeLabel(delegation.scope)}
                    </Badge>
                    <Badge
                      variant={delegation.isActive ? "default" : "secondary"}
                      className={
                        delegation.isActive
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }
                    >
                      {delegation.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevoke(delegation.hash as Hex)}
                    disabled={
                      !delegation.isActive ||
                      revokingHashes.has(delegation.hash)
                    }
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    {revokingHashes.has(delegation.hash) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>
                    <span className="font-medium text-gray-900">To:</span>{" "}
                    {delegation.to
                      ? `${delegation.to.slice(0, 6)}...${delegation.to.slice(-4)}`
                      : "Unknown"}
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">From:</span>{" "}
                    {delegation.from
                      ? `${delegation.from.slice(0, 6)}...${delegation.from.slice(-4)}`
                      : "Unknown"}
                  </div>
                </div>

                <div className="text-xs text-gray-400 font-mono truncate">
                  Hash: {delegation.hash.slice(0, 10)}...{delegation.hash.slice(-6)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
