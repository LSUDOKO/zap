"use client";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { toast } from "sonner";
import { USD_TOKEN_ADDRESS, USD_TOKEN_ABI } from "@/config/const";
import React from "react";

export function useMintTokens() {
  const {
    data: hash,
    isPending: isMintPending,
    writeContract: mint,
  } = useWriteContract();

  const { isLoading: isMintConfirming, isSuccess: isMintSuccess } =
    useWaitForTransactionReceipt({
      hash,
    });

  const handleMint = (to: `0x${string}`, amount: string) => {
    try {
      const amountWei = parseEther(amount);
      mint({
        address: USD_TOKEN_ADDRESS,
        abi: USD_TOKEN_ABI,
        functionName: "mint",
        args: [to, amountWei],
      });
    } catch (error) {
      toast.error("Mint Failed", {
        description: "Failed to mint tokens. Please try again.",
      });
    }
  };

  React.useEffect(() => {
    if (hash) {
      toast.info("Transaction Submitted", {
        description: "Your mint transaction has been submitted.",
      });
    }
  }, [hash]);

  React.useEffect(() => {
    if (isMintSuccess) {
      toast.success("Mint Successful", {
        description: "Tokens have been minted successfully to your wallet.",
      });
    }
  }, [isMintSuccess]);

  return {
    handleMint,
    isMintPending,
    isMintConfirming,
    isMintSuccess,
    mintHash: hash,
  };
}
