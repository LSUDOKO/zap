"use client";

import React, { useState } from "react";
import { toFunctionSelector } from "viem";
import type { Address, Hex } from "viem";
import { ISSUE_ADDRESS } from "@/config/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import type { CreateDelegationParams } from "@/lib/hooks/use-delegations";
import type { Delegation } from "@metamask/smart-accounts-kit";
import type { IssueDetails } from "@/utils/types";

/**
 * The deployed AVS operator address on Ethereum Sepolia.
 * This operator validates claims and manages the ZKPull AVS.
 */
export const AVS_OPERATOR_ADDRESS =
  "0x9F69599E5f0CE0D5D28795eFed28F0166c9F3955" as Address;

interface DelegateToAVSSectionProps {
  smartAccountAddress: Address;
  issueId: string;
  issueDetails: IssueDetails | null;
  createNewDelegation: (
    params: CreateDelegationParams
  ) => Promise<Delegation | null>;
  isPending: boolean;
  lastCreatedDelegation: Delegation | null;
}

/**
 * DelegateToAVSSection
 *
 * Allows bounty owners to delegate `validateClaim()` authority
 * to the AVS operator via ERC-7710 delegation.
 *
 * The delegation is created offline and its data can be shared with
 * the AVS operator (server-side) for signing and on-chain redemption.
 */
export default function DelegateToAVSSection({
  smartAccountAddress,
  issueId,
  issueDetails,
  createNewDelegation,
  isPending,
  lastCreatedDelegation,
}: DelegateToAVSSectionProps) {
  const [delegationCreated, setDelegationCreated] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showRawData, setShowRawData] = useState(false);

  const isBountyOwner =
    issueDetails?.owner?.toLowerCase() === smartAccountAddress?.toLowerCase();

  // Only show if the user is the bounty owner
  if (!isBountyOwner || !issueDetails) return null;

  const handleCreateDelegation = async () => {
    setIsCreating(true);
    try {
      // Create a function-call delegation for validateClaim()
      const validateSelector = toFunctionSelector(
        "validateClaim(uint256,uint256,bool)"
      );

      const delegation = await createNewDelegation({
        to: AVS_OPERATOR_ADDRESS,
        scope: {
          type: "function-call",
          to: ISSUE_ADDRESS,
          selector: validateSelector,
        },
        caveats: [],
      });

      if (delegation) {
        setDelegationCreated(true);
        toast.success("Delegation created!", {
          description:
            "Share the delegation data with the AVS operator for server-side signing and on-chain redemption.",
        });
      }
    } catch (err: any) {
      console.error("Failed to create delegation:", err);
      toast.error("Failed to create delegation", {
        description: err?.message || "Unknown error",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyDelegationData = async () => {
    if (!lastCreatedDelegation) return;

    // Serialize bigint values to strings for JSON
    const serialized = JSON.stringify(
      lastCreatedDelegation,
      (_key, value) =>
        typeof value === "bigint" ? value.toString() : value,
      2
    );

    try {
      await navigator.clipboard.writeText(serialized);
      setCopied(true);
      toast.success("Delegation data copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const isLoading = isPending || isCreating;

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {delegationCreated ? (
            <ShieldCheck className="w-5 h-5 text-green-600" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-blue-600" />
          )}
          AVS Operator Delegation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            Delegate claim validation authority to the{" "}
            <strong>ZKPull AVS Operator</strong>. This allows the operator to
            automatically validate and approve reward claims for this bounty
            without requiring your signature each time.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              Function: validateClaim()
            </Badge>
            <Badge variant="outline" className="text-xs">
              Contract: {ISSUE_ADDRESS.slice(0, 6)}...{ISSUE_ADDRESS.slice(-4)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Operator: {AVS_OPERATOR_ADDRESS.slice(0, 6)}...{AVS_OPERATOR_ADDRESS.slice(-4)}
            </Badge>
          </div>
        </div>

        {/* Three-step flow */}
        <div className="bg-white border border-blue-100 rounded-md p-3 space-y-2">
          <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">
            How it works
          </p>
          <div className="space-y-1.5">
            {[
              [1, "You create a delegation offline (no gas cost)"],
              [
                2,
                "Share the delegation data with the AVS operator (copy below)",
              ],
              [3, "Operator signs & redeems on-chain to activate"],
            ].map(([step, desc]) => (
              <div key={String(step)} className="flex items-start gap-2">
                <span
                  className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    delegationCreated && Number(step) === 1
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {delegationCreated && Number(step) === 1 ? "✓" : step}
                </span>
                <span className="text-xs text-gray-600">{String(desc)}</span>
              </div>
            ))}
          </div>
        </div>

        {delegationCreated ? (
          <div className="space-y-3">
            {/* Success state */}
            <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-700">
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck className="w-4 h-4" />
                Delegation created successfully
              </div>
              <p className="text-xs mt-1 text-green-600">
                Step 1 complete! Now copy the delegation data and share it with
                the AVS operator so they can sign and redeem it on-chain.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleCopyDelegationData}
                size="sm"
                variant="default"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" /> Copy Delegation Data
                  </>
                )}
              </Button>

              <Button
                onClick={() => setShowRawData(!showRawData)}
                size="sm"
                variant="outline"
              >
                {showRawData ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" /> Hide Raw Data
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" /> Show Raw Data
                  </>
                )}
              </Button>
            </div>

            {/* Raw delegation data preview */}
            {showRawData && lastCreatedDelegation && (
              <pre className="bg-gray-900 text-green-400 text-[10px] rounded-md p-3 overflow-x-auto max-h-48 overflow-y-auto">
                {JSON.stringify(
                  lastCreatedDelegation,
                  (_key, value) =>
                    typeof value === "bigint" ? value.toString() : value,
                  2
                )}
              </pre>
            )}

            {/* Next steps message */}
            <p className="text-xs text-gray-500">
              After the operator redeems the delegation, it will appear in your{" "}
              <strong>Delegations &amp; Permissions</strong> section on the
              Profile page.
            </p>
          </div>
        ) : (
          <Button
            onClick={handleCreateDelegation}
            disabled={isLoading}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                Creating...
              </>
            ) : (
              `Delegate to AVS Operator`
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
