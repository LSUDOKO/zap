"use client";
import React from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useGetIssueById } from "@/lib/hooks/use-get-issue-by-id";
import { useGenerateProof } from "@/lib/hooks/use-generate-proof";
import { useGithubAuth } from "@/lib/hooks/use-github-auth";
import { useValidationRewards } from "@/lib/hooks/use-validation-rewards";
import { useClaimRewards } from "@/lib/hooks/use-claim-rewards";
import { IssueDetails } from "@/utils/types";
import CornerLayout from "./CornerLayout";
import IssueHeader from "./IssueHeader";
import GithubAuthSection from "./GithubAuthSection";
import IssueDescription from "./IssueDescription";
import HorizontalValidationResults from "./HorizontalValidationResults";
import GeneratingProofPopup from "./GeneratingProofPopup";
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

  const isAllValid =
    validationResults.isValidRepo &&
    validationResults.isValidId &&
    validationResults.isValidUser &&
    validationResults.isMerged;

  const isProcessing =
    isClaimPending ||
    isClaimConfirming ||
    isApprovalPending ||
    isApprovalConfirming;

  const handleClaim = () => {
    if (usedPRLinksData === true) {
      toast.error("PR already used", {
        description: "This PR has already been claimed.",
      });
      return;
    }
    if (issueDetails && pullRequestUrl) {
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
        </main>
      </div>
      
      <GeneratingProofPopup isVisible={isFetching} onCancel={cancelGeneration} />
    </CornerLayout>
  );
}