import {
  ISSUE_ADDRESS,
  ISSUE_ABI,
  USD_TOKEN_ADDRESS,
  USD_TOKEN_ABI,
} from "@/config/const";
import { CreateIssueParams } from "@/utils/types";
import { toast } from "sonner";
import { useCallback, useState } from "react";
import { parseEther, encodeFunctionData } from "viem";
import { useSmartAccount } from "@/lib/MetaMaskSmartAccountProvider";

const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io/tx/";

export interface CreateIssueState {
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  isError: boolean;
  error: string | null;
  transactionHash: `0x${string}` | null;
}

export const useCreateIssue = () => {
  const { bundlerClient, smartAccount } = useSmartAccount();
  
  const [state, setState] = useState<CreateIssueState>({
    isPending: false,
    isConfirming: false,
    isConfirmed: false,
    isError: false,
    error: null,
    transactionHash: null,
  });

  const handleCreateIssue = useCallback(async (params: CreateIssueParams) => {
    if (!smartAccount || !bundlerClient) {
      toast.error("Wallet not connected. Please connect your wallet first.");
      return;
    }

    setState({
      isPending: true,
      isConfirming: false,
      isConfirmed: false,
      isError: false,
      error: null,
      transactionHash: null,
    });

    try {
      const bountyAmountWei = parseEther(params.bountyAmount);
      const deadlineTimestamp = BigInt(params.deadline);
      const maxClaimsBigInt = BigInt(params.maxClaims);

      toast.loading("Creating bounty via smart account...", {
        id: "create-issue",
      });

      // Send a batched UserOperation: approve USD + createIssue
      const userOpHash = await bundlerClient.sendUserOperation({
        account: smartAccount as any,
        calls: [
          // Step 1: Approve USD token spending
          {
            to: USD_TOKEN_ADDRESS,
            value: BigInt(0),
            data: encodeFunctionData({
              abi: USD_TOKEN_ABI,
              functionName: "approve",
              args: [ISSUE_ADDRESS, bountyAmountWei],
            }),
          },
          // Step 2: Create the issue
          {
            to: ISSUE_ADDRESS,
            value: BigInt(0),
            data: encodeFunctionData({
              abi: ISSUE_ABI,
              functionName: "createIssue",
              args: [
                params.githubProjectId,
                bountyAmountWei,
                params.projectName,
                params.description,
                params.repoLink,
                deadlineTimestamp,
                maxClaimsBigInt,
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

      toast.loading("Waiting for bounty creation confirmation...", {
        id: "create-issue",
      });

      const receipt = await bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash,
      });

      const txHash = receipt.receipt.transactionHash;

      setState({
        isPending: false,
        isConfirming: false,
        isConfirmed: true,
        isError: false,
        error: null,
        transactionHash: txHash,
      });

      toast.dismiss("create-issue");
      toast.success("Bounty Created Successfully!", {
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
      console.error("Failed to create bounty:", err);
      
      const errorMsg = err?.shortMessage || err?.message || "Failed to create bounty";
      
      setState({
        isPending: false,
        isConfirming: false,
        isConfirmed: false,
        isError: true,
        error: errorMsg,
        transactionHash: null,
      });

      toast.dismiss("create-issue");
      toast.error("Bounty Creation Failed", {
        description: errorMsg,
      });
    }
  }, [smartAccount, bundlerClient]);

  const isApprovalPending = state.isPending;
  const isCreateIssuePending = state.isPending;
  const isApprovalConfirming = state.isConfirming;
  const isCreateIssueConfirmed = state.isConfirmed;
  const isCreateIssueConfirming = state.isConfirming;

  return {
    handleCreateIssue,
    isApprovalPending,
    isCreateIssuePending,
    isApprovalConfirming,
    isCreateIssueConfirmed,
    isCreateIssueConfirming,
    ...state,
  };
};
