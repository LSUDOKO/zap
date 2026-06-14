import {
  ISSUE_ADDRESS,
  ISSUE_ABI,
  MANTLE_USD_ADDRESS,
  MANTLE_USD_ABI,
} from "@/config/const";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CreateIssueParams } from "@/utils/types";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

export const useCreateIssue = () => {
  const [issueParams, setIssueParams] = useState<CreateIssueParams | null>(null);

  const {
    data: approvalHash,
    isPending: isApprovalPending,
    writeContract: writeApproval,
  } = useWriteContract();

  const {
    data: createIssueHash,
    isPending: isCreateIssuePending,
    writeContract: writeCreateIssue,
  } = useWriteContract();

  const {
    isLoading: isApprovalConfirming,
    isSuccess: isApprovalSuccess,
  } = useWaitForTransactionReceipt({
    hash: approvalHash,
  });

  const {
    isLoading: isCreateIssueConfirming,
    isSuccess: isCreateIssueConfirmed,
    isError: isCreateIssueError,
  } = useWaitForTransactionReceipt({
    hash: createIssueHash,
  });

  // useEffect(() => {
  //   if (approvalHash) {
  //     toast.success("Token Approval Transaction Sent", {
  //       description: (
  //         <a
  //           href={`${MANTLE_SEPOLIA_EXPLORER}${approvalHash}`}
  //           target="_blank"
  //           rel="noopener noreferrer"
  //           className="text-blue-500 underline"
  //         >
  //           View Transaction on Mantle Sepolia Explorer
  //         </a>
  //       ),
  //     });
  //   }
  // }, [approvalHash]);

  useEffect(() => {
    if (isApprovalConfirming) {
      toast.loading("Waiting for approval confirmation...", {
        id: "approval-confirming",
      });
    }
  }, [isApprovalConfirming]);

  useEffect(() => {
    if (isApprovalSuccess && issueParams) {
      toast.dismiss("approval-confirming");
      toast.success("Token Approved Successfully");

      const bountyAmountWei = ethers.parseEther(issueParams.bountyAmount);
      writeCreateIssue({
        address: ISSUE_ADDRESS,
        abi: ISSUE_ABI,
        functionName: "createIssue",
        args: [
          issueParams.githubProjectId,
          bountyAmountWei,
          issueParams.projectName,
          issueParams.description,
          issueParams.repoLink,
          issueParams.deadline,
          issueParams.maxClaims,
        ],
      });

      setIssueParams(null);
    }
  }, [isApprovalSuccess, issueParams, writeCreateIssue]);

  // useEffect(() => {
  //   if (createIssueHash) {
  //     toast.success("Issue Creation Transaction Sent", {
  //       description: (
  //         <a
  //           href={`${MANTLE_SEPOLIA_EXPLORER}${createIssueHash}`}
  //           target="_blank"
  //           rel="noopener noreferrer"
  //           className="text-blue-500 underline"
  //         >
  //           View Transaction on Mantle Sepolia Explorer
  //         </a>
  //       ),
  //     });
  //   }
  // }, [createIssueHash]);

  useEffect(() => {
    if (isCreateIssueConfirming) {
      toast.loading("Waiting for issue creation confirmation...", {
        id: "create-issue-confirming",
      });
    }
  }, [isCreateIssueConfirming]);

  useEffect(() => {
    if (isCreateIssueConfirmed) {
      toast.dismiss("create-issue-confirming");
      toast.success("Issue Created Successfully");
    }
    if (isCreateIssueError) {
      toast.dismiss("create-issue-confirming");
      toast.error("Issue Creation Failed");
    }
  }, [isCreateIssueConfirmed, isCreateIssueError]);

  const handleCreateIssue = async (params: CreateIssueParams) => {
    try {
      const bountyAmountWei = ethers.parseEther(params.bountyAmount);
      writeApproval({
        abi: MANTLE_USD_ABI,
        address: MANTLE_USD_ADDRESS,
        functionName: "approve",
        args: [ISSUE_ADDRESS, bountyAmountWei],
      });

      setIssueParams(params);
    } catch (err) {
      toast.error("Transaction Failed", {
        description: err instanceof Error ? err.message : "Unexpected error occurred",
      });
      throw err;
    }
  };

  return {
    handleCreateIssue,
    isApprovalPending,
    isCreateIssuePending,
    isApprovalConfirming,
    isCreateIssueConfirmed,
    isCreateIssueConfirming,
  };
};
