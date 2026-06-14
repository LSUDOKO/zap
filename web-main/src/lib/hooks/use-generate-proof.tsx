import { useState, useRef } from "react";
import { toast } from "sonner";
import { UseGenerateProofReturn } from "@/utils/types";

export const useGenerateProof = (): UseGenerateProofReturn => {
  const [proof, setProof] = useState<Record<string, string>>({});
  const [pullRequestUrl, setPullRequestUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const generateProof = async () => {
    if (!pullRequestUrl) {
      toast.error("Invalid Input", {
        description: "Please enter a valid Pull Request URL.",
      });
      return;
    }

    abortControllerRef.current = new AbortController();
    setIsFetching(true);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ZK_BACKEND_GENERATE_PROOF}?url=${encodeURIComponent(
          pullRequestUrl
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
          signal: abortControllerRef.current.signal,
        }
      );

      const data = await response.json();
      setProof(data);
      toast.success("Success", {
        description: "Proof generated successfully!",
      });
    } catch (error: any) {
      if (error.name === "AbortError") {
        toast.info("Proof generation cancelled");
      } else {
        console.error("Error generating proof:", error);
        toast.error("Error", {
          description: "Failed to generate proof. Please logout Github, and try to connect Github again.",
        });
      }
    } finally {
      setIsFetching(false);
      abortControllerRef.current = null;
    }
  };

  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsFetching(false);
    }
  };

  return {
    proof,
    pullRequestUrl,
    isFetching,
    setPullRequestUrl,
    generateProof,
    cancelGeneration,
  };
};
