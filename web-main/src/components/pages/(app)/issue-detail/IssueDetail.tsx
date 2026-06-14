"use client";
import React from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { toFunctionSelector, encodeFunctionData } from "viem";
import { useGetIssueById } from "@/lib/hooks/use-get-issue-by-id";
import { useGenerateProof } from "@/lib/hooks/use-generate-proof";
import { useGithubAuth } from "@/lib/hooks/use-github-auth";
import { useValidationRewards } from "@/lib/hooks/use-validation-rewards";
import { useClaimRewards } from "@/lib/hooks/use-claim-rewards";
import { useAdvancedPermissions } from "@/lib/hooks/use-advanced-permissions";
import { useDelegations } from "@/lib/hooks/use-delegations";
import { ISSUE_ADDRESS, ISSUE_ABI } from "@/config/const";
import { useSmartAccount } from "@/lib/MetaMaskSmartAccountProvider";
import { IssueDetails } from "@/utils/types";
import CornerLayout from "./CornerLayout";
import IssueHeader from "./IssueHeader";
import GithubAuthSection from "./GithubAuthSection";
import IssueDescription from "./IssueDescription";
import HorizontalValidationResults from "./HorizontalValidationResults";
import GeneratingProofPopup from "./GeneratingProofPopup";
import DelegateToAVSSection from "./DelegateToAVSSection";
import TimerIssue from "@/components/TimerIssue";

export default function IssueDetail() {
  const params = useParams();
  const issueId = params.id as string;

  const { issueDetails, isLoading, error } = useGetIssueById(issueId) as {
    issueDetails: IssueDetails | null;
    isLoading: boolean;
    error: Error | null;
  };

  const {
    proof,
    pullRequestUrl,
    isFetching,
    setPullRequestUrl,
    generateProof,
    cancelGeneration,
  } = useGenerateProof();

  const {
    isAuthenticated,
    loginWithGithub,
    logout: githubLogout,
  } = useGithubAuth(() => {
    setPullRequestUrl("");
  });

  const { validationResults } = useValidationRewards({
    proof,
    pullRequestUrl,
    issueDetails,
  });

  const {
    handleClaimRewards,
    isClaimPending,
    isClaimConfirming,
    isApprovalPending,
    isApprovalConfirming,
    usedPRLinksData,
    isClaimSuccess,
    claimHash,
  } = useClaimRewards(pullRequestUrl);

  const {
    requestPermissions,
    executeWithPermissions,
    checkSupportedPermissions,
    isRequesting: isPermissionRequesting,
    isExecuting: isPermissionExecuting,
  } = useAdvancedPermissions();

  const { smartAccount } = useSmartAccount();

  const {
    createNewDelegation,
    isPending: isDelegationPending,
  } = useDelegations();

  const isAllValid =
    validationResults.isValidRepo &&
    validationResults.isValidId &&
    validationResults.isValidUser &&
    validationResults.isMerged;

  const isProcessing =
    isClaimPending ||
    isClaimConfirming ||
    isApprovalPending ||
    isApprovalConfirming ||
    isPermissionRequesting ||
    isPermissionExecuting ||
    isDelegationPending;

  const handleClaim = async () => {
    if (usedPRLinksData === true) {
      toast.error("PR already used", {
        description: "This PR has already been claimed.",
      });
      return;
    }
    if (!issueDetails || !pullRequestUrl) return;

    const accessToken = sessionStorage.getItem("accessToken") || "";
    const issueIdBigInt = BigInt(issueId);

    try {
      // Step 1: Check if the wallet supports ERC-7715 function-call permissions
      let usePermissionFlow = false;
      try {
        const supported = await checkSupportedPermissions();
        usePermissionFlow = supported.includes("function-call");
      } catch {
        usePermissionFlow = false;
      }

      if (usePermissionFlow && smartAccount) {
        // Step 2: Request a function-call permission for claimReward()
        // This grants the smart account permission to call claimReward()
        // on the IssuesClaim contract on the developer's behalf.
        toast.loading("Requesting permission to claim reward...", {
          id: "permission-claim",
        });

        const claimSelector = toFunctionSelector(
          "claimReward(uint256,string,bool,string)"
        );

        const granted = await requestPermissions([
          {
            type: "function-call",
            data: {
              contractAddress: ISSUE_ADDRESS,
              functionSelector: claimSelector,
              justification: `Claim reward for ${pullRequestUrl}`,
            },
            isAdjustmentAllowed: false,
          },
        ]);

        toast.dismiss("permission-claim");

        if (granted.length > 0) {
          // Step 3: Execute claimReward using the permission context
          const permissionContext = granted[0].context;

          toast.loading("Claiming reward with permission context...", {
            id: "claim-permission",
          });

          const result = await executeWithPermissions(permissionContext, [
            {
              to: ISSUE_ADDRESS,
              value: BigInt(0),
              data: encodeFunctionData({
                abi: ISSUE_ABI,
                functionName: "claimReward",
                args: [
                  issueIdBigInt,
                  pullRequestUrl,
                  validationResults.isMerged,
                  accessToken,
                ],
              }),
            },
          ]);

          toast.dismiss("claim-permission");

          if (result) {
            toast.success("Reward claimed with advanced permissions!");
            return;
          }
        }

        // Permission rejected or execution failed — fall through to normal flow
        toast.info("Falling back to standard claim flow...");
      }

      // Fallback: Normal UserOperation flow
      handleClaimRewards({
        issueId,
        prLink: pullRequestUrl,
        isMerged: validationResults.isMerged,
        bountyAmount: issueDetails.bountyAmount?.toString() || "0",
      });
    } catch (err: any) {
      console.error("Error in claim flow:", err);
      // Fall back to normal flow
      handleClaimRewards({
        issueId,
        prLink: pullRequestUrl,
        isMerged: validationResults.isMerged,
        bountyAmount: issueDetails.bountyAmount?.toString() || "0",
      });
    }
  };

  if (isLoading) {
    return (
      <CornerLayout>
        <div className="bg-white overflow-hidden">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">Loading Issue Details...</h2>
            </div>
          </div>
        </div>
      </CornerLayout>
    );
  }

  if (error) {
    return (
      <CornerLayout>
        <div className="bg-white overflow-hidden">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600">
                Failed to load issue details
              </h2>
              <p className="text-gray-600 mt-2">Error: {error.message}</p>
            </div>
          </div>
        </div>
      </CornerLayout>
    );
  }

  if (!issueDetails) {
    return (
      <CornerLayout>
        <div className="bg-white overflow-hidden">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-500">
                No issue details found
              </h2>
            </div>
          </div>
        </div>
      </CornerLayout>
    );
  }

  return (
    <CornerLayout>
      <div className="bg-white overflow-hidden">
        <div className="relative h-[100px] md:h-[200px]">
          <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-gray-400 rounded-tl-lg z-10"></span>
          <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-gray-400 rounded-tr-lg z-10"></span>
          <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-gray-400 rounded-bl-lg z-10"></span>
          <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-gray-400 rounded-br-lg z-10"></span>
          <Image
            src="/images/Background/bg-detail.png"
            alt="Issue Detail Background"
            fill
            className="object-cover"
            priority
          />
        </div>

        <main className="px-8 py-12 bg-gray-50 space-y-8">
          <TimerIssue deadline={issueDetails.deadline} />
          
          <IssueHeader issueDetails={issueDetails} />
          
          <GithubAuthSection
            isAuthenticated={isAuthenticated}
            pullRequestUrl={pullRequestUrl}
            setPullRequestUrl={setPullRequestUrl}
            isFetching={isFetching}
            generateProof={generateProof}
            githubLogout={githubLogout}
            loginWithGithub={loginWithGithub}
          />
          
          <IssueDescription issueDetails={issueDetails} />
          
          <HorizontalValidationResults
            proof={proof}
            validationResults={validationResults}
            isAllValid={isAllValid}
            isProcessing={isProcessing}
            handleClaim={handleClaim}
            rewardAmount={issueDetails.bountyAmount?.toString() || "100"}
            maxClaims={issueDetails.maxClaims}
            isClaimSuccess={isClaimSuccess}
            claimHash={claimHash}
          />

          {/* Task 3.2: Delegate reward distribution to AVS operator */}
          {smartAccount && (
            <DelegateToAVSSection
              smartAccountAddress={smartAccount.address as `0x${string}`}
              issueId={issueId}
              issueDetails={issueDetails}
              createNewDelegation={createNewDelegation}
              isPending={isDelegationPending}
            />
          )}
        </main>
      </div>
      
      <GeneratingProofPopup isVisible={isFetching} onCancel={cancelGeneration} />
    </CornerLayout>
  );
}