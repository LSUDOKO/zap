"use client";
import React, { useState } from "react";
import { useCreateIssue } from "@/lib/hooks/use-create-issue";
import { useWallet } from "@/lib/hooks/use-wallet";
import Image from "next/image";
import CornerLayout from "./CornerLayout";
import WalletConnectSection from "./WalletConnectSection";
import CreateBountyForm from "./CreateBountyForm";
import IssuePreview from "./IssuePreview";

export default function CreateBounty() {
  const {
    handleCreateIssue,
    isCreateIssuePending,
    isApprovalPending,
    isCreateIssueConfirming,
    isApprovalConfirming,
  } = useCreateIssue();
  const { address } = useWallet();

  const [formData, setFormData] = useState({
    title: "",
    repoLink: "",
    description: "",
    deadline: new Date(),
    bountyAmount: "0",
    maxClaims: "1",
  });

  const [error, setError] = useState<string | null>(null);

  const isLoading = 
    isCreateIssuePending ||
    isApprovalPending ||
    isCreateIssueConfirming ||
    isApprovalConfirming;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date: Date) => {
    setFormData((prev) => ({
      ...prev,
      deadline: date,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const deadlineTimestamp = BigInt(
        Math.floor(formData.deadline.getTime() / 1000)
      );
      const bountyAmountBigInt = BigInt(formData.bountyAmount).toString();
      const maxClaimsBigInt = BigInt(formData.maxClaims);

      await handleCreateIssue({
        githubProjectId: formData.title,
        bountyAmount: bountyAmountBigInt,
        projectName: formData.title,
        description: formData.description,
        repoLink: formData.repoLink,
        deadline: deadlineTimestamp,
        maxClaims: maxClaimsBigInt,
      });

      setFormData({
        title: "",
        repoLink: "",
        description: "",
        deadline: new Date(),
        bountyAmount: "0",
        maxClaims: "1",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  if (!address) {
    return (
      <CornerLayout>
        <WalletConnectSection />
      </CornerLayout>
    );
  }

  return (
    <CornerLayout>
      <div className="bg-white overflow-hidden border-t border-gray-300">
        <div className="relative h-[100px] md:h-[200px]">
          <Image
            src="/images/Background/bg-create-bounty.png"
            alt="Create Issue Background"
            fill
            className="object-cover"
            priority
          />
        </div>

        <main className="px-8 py-12 bg-gray-50">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Create New Issue</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Create a bounty issue for your open source project and reward contributors for their valuable contributions.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <CreateBountyForm
              formData={formData}
              onInputChange={handleInputChange}
              onDateChange={handleDateChange}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
            />
            <IssuePreview formData={formData} address={address!} />
          </div>
        </main>
      </div>
    </CornerLayout>
  );
}