import {
  ISSUE_ADDRESS,
  ISSUE_ABI,
} from "@/config/const";
import {
  useReadContract,
} from "wagmi";
import { toast } from "sonner";
import React, { useCallback, useState } from "react";
import { encodeFunctionData } from "viem";
import { claimRewardParams } from "@/utils/types";
import { useSmartAccount } from "@/lib/MetaMaskSmartAccountProvider";

const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io/tx/";

export interface ClaimState {
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: string | null;
  transactionHash: `0x${string}` | null;
}

export const useClaimRewards = (prLink: string) => {
  const { smartAccount, bundlerClient } = useSmartAccount();
  
  const [state, setState] = useState<ClaimState>({
    isPending: false,
    isConfirming: false,
    isSuccess: false,
    isError: false,
    error: null,
    transactionHash: null,
  });

  const { data: usedPRLinksData, isError: isCheckError } = useReadContract({
    address: ISSUE_ADDRESS,
    abi: ISSUE_ABI,
    functionName: "usedPRLinks",
    args: [prLink],
  });

  const handleClaimRewards = useCallback(async (params: claimRewardParams) => {
    try {
      if (isCheckError) {
        console.error("Error checking PR:", isCheckError);
        toast.error("Failed to check PR status");
        return;
      }

      if (usedPRLinksData === true) {
        toast.error("PR Already Used", {
          description: "This PR has already been claimed for a reward.",
        });
        return;
      }

      if (!smartAccount || !bundlerClient) {
        toast.error("Wallet not connected. Please connect your wallet first.");
        return;
      }

      setState({
        isPending: true,
        isConfirming: false,
        isSuccess: false,
        isError: false,
        error: null,
        transactionHash: null,
      });

      const accessToken = sessionStorage.getItem("accessToken") || "";

      toast.loading("Claiming reward via smart account...", {
        id: "claim-reward",
      });

      // Send the claimReward call as a UserOperation via the bundler.
      // With a configured paymaster, this can be gasless (sponsored).
      // The bundler handles counterfactual deployment if needed.
      const userOpHash = await bundlerClient.sendUserOperation({
        account: smartAccount as any,
        calls: [
          {
            to: ISSUE_ADDRESS,
            value: BigInt(0),
            data: encodeFunctionData({
              abi: ISSUE_ABI,
              functionName: "claimReward",
              args: [
                BigInt(params.issueId),
                params.prLink,
                params.isMerged,
                accessToken,
              ],
            }),
          },
        ],
      });

      setState(prev => ({
        ...prev,
        isPending: false,
        isConfirming: true,
      }));

      toast.loading("Waiting for claim confirmation...", {
        id: "claim-reward",
      });

      // Wait for the UserOperation to be included in a block
      const receipt = await bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash,
      });

      const txHash = receipt.receipt.transactionHash;

      setState({
        isPending: false,
        isConfirming: false,
        isSuccess: true,
        isError: false,
        error: null,
        transactionHash: txHash,
      });

      toast.dismiss("claim-reward");
      toast.success("Reward Claimed Successfully!", {
        description: (
          <a
            href={`${SEPOLIA_EXPLORER}${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View Transaction on Etherscan (Sepolia)
          </a>
        ),
      });
    } catch (err: any) {
      console.error("Claim failed:", err);
      
      const errorMsg = err?.shortMessage || err?.message || "Claim failed";
      
      setState({
        isPending: false,
        isConfirming: false,
        isSuccess: false,
        isError: true,
        error: errorMsg,
        transactionHash: null,
      });

      toast.dismiss("claim-reward");
      toast.error("Claim Failed", {
        description: errorMsg,
      });
    }
  }, [smartAccount, bundlerClient, isCheckError, usedPRLinksData]);

  // Backward-compatible return values for existing UI components
  const isClaimPending = state.isPending;
  const isClaimConfirming = state.isConfirming;
  const isClaimSuccess = state.isSuccess;
  const isApprovalPending = false; // No separate approval step needed
  const isApprovalConfirming = false;
  const claimHash = state.transactionHash;

  return {
    isClaimPending,
    handleClaimRewards,
    isClaimConfirming,
    isClaimSuccess,
    isApprovalPending,
    isApprovalConfirming,
    usedPRLinksData,
    claimHash,
    // New state for advanced use
    ...state,
  };
};
