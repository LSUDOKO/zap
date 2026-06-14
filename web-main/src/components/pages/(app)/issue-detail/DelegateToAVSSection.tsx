"use client";

import React, { useState } from "react";
import { toFunctionSelector } from "viem";
import type { Address, Hex } from "viem";
import { ISSUE_ADDRESS } from "@/config/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import type { CreateDelegationParams } from "@/lib/hooks/use-delegations";
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
  ) => Promise<any>;
  isPending: boolean;
}

/**
 * DelegateToAVSSection
 *
 * Allows bounty owners to delegate `validateClaim()` authority
 * to the AVS operator via ERC-7710 delegation.
 *
 * This creates an offline delegation object that the AVS operator
 * can then sign and redeem on-chain to auto-validate claims.
 */
export default function DelegateToAVSSection({
  smartAccountAddress,
  issueId,
  issueDetails,
  createNewDelegation,
  isPending,
}: DelegateToAVSSectionProps) {
  const [delegationCreated, setDelegationCreated] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const isBountyOwner =
    issueDetails?.owner?.toLowerCase() === smartAccountAddress?.toLowerCase();

  // Only show if the user is the bounty owner
  if (!isBountyOwner || !issueDetails) return null;

  const handleCreateDelegation = async () => {
    setIsCreating(true);
    try {
      // Create a function-call delegation for validateClaim()
      // The AVS operator will be able to call validateClaim() on the
      // IssuesClaim contract for this specific issue.
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
            "The AVS operator can now validate claims for this bounty. " +
            "The delegation needs to be signed and redeemed by the operator to take effect on-chain.",
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
      <CardContent className="space-y-3">
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

        {delegationCreated ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-700">
            <div className="flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4" />
              Delegation created successfully
            </div>
            <p className="text-xs mt-1 text-green-600">
              The AVS operator can now validate claims. Share the delegation
              data with the operator for on-chain redemption.
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
