'use client'
import { ISSUE_ADDRESS, ISSUE_ABI } from "@/config/const";
import { useReadContract } from "wagmi";
import { useEffect } from "react";
import { mantleSepoliaTestnet } from "wagmi/chains";

export const useGetAllIssue = () => {
  const { data: allIssue, isPending: isFetchingData, error, isError, refetch } = useReadContract({
    address: ISSUE_ADDRESS,
    abi: ISSUE_ABI,
    functionName: "getAllIssues",
    chainId: mantleSepoliaTestnet.id,
  });

  useEffect(() => {
    if (isError) {
      console.error("Error fetching issues:", error);
    }
  }, [isError, error]);

  return {
    allIssue,
    isFetchingData,
    isError,
    error,
    refetch
  };
};
