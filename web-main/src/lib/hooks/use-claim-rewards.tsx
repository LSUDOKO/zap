import {
  ISSUE_ADDRESS,
  ISSUE_ABI,
} from "@/config/const";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { toast } from "sonner";
import React from "react";
import { claimRewardParams } from "@/utils/types";

const MANTLE_SEPOLIA_EXPLORER = "https://sepolia.mantlescan.xyz/tx/";

export const useClaimRewards = (prLink: string) => {
  const {
    data: claimHash,
    isPending: isClaimPending,
    writeContract: writeClaim,
  } = useWriteContract();

  const { data: usedPRLinksData, isError: isCheckError } = useReadContract({
    address: ISSUE_ADDRESS,
    abi: ISSUE_ABI,
    functionName: "usedPRLinks",
    args: [prLink],
  });

  const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess, isError: isClaimError } =
    useWaitForTransactionReceipt({
      hash: claimHash,
    });

  // Approval is not needed for claiming rewards (the contract sends from escrow, not from user)
  // These are kept as false for backward compatibility with components that still destructure them
  const isApprovalPending = false;
  const isApprovalConfirming = false;

  React.useEffect(() => {
    if (isClaimConfirming) {
      toast.loading("Claiming your reward...", {
        id: "claim-confirming",
      });
    }
  }, [isClaimConfirming]);

  React.useEffect(() => {
    if (isClaimSuccess) {
      toast.dismiss("claim-confirming");
      toast.success("Reward Claimed Successfully!", {
        description: (
          <a
            href={`${MANTLE_SEPOLIA_EXPLORER}${claimHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View Transaction on Mantle Sepolia Explorer
          </a>
        ),
      });
    }
  }, [isClaimSuccess, claimHash]);

  React.useEffect(() => {
    if (isClaimError) {
      toast.dismiss("claim-confirming");
      toast.error("Claim Failed", {
        description: "The transaction was not confirmed. Please try again.",
      });
    }
  }, [isClaimError]);

  const handleClaimRewards = async (params: claimRewardParams) => {
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

      const accessToken = sessionStorage.getItem("accessToken") || "";

      writeClaim({
        address: ISSUE_ADDRESS,
        abi: ISSUE_ABI,
        functionName: "claimReward",
        args: [
          BigInt(params.issueId),
          params.prLink,
          params.isMerged,
          accessToken,
        ],
      });
    } catch (err) {
      toast.error("Transaction Failed", {
        description:
          err instanceof Error ? err.message : "Unexpected error occurred",
      });
      throw err;
    }
  };

  return {
    isClaimPending,
    handleClaimRewards,
    isClaimConfirming,
    isClaimSuccess,
    isApprovalPending,
    isApprovalConfirming,
    usedPRLinksData,
    claimHash,
  };
};
