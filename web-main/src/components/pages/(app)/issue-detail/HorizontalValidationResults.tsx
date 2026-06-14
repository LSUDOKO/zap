"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Lottie from "lottie-react";
import SupplyChainValidationPopup from "./SupplyChainValidationPopup";
import ClaimRewardsPopup from "./ClaimRewardsPopup";
import ClaimSuccessPopup from "./ClaimSuccessPopup";
import destinationAnimation from "../../../../../public/images/Animation/destination-animation.json";

interface HorizontalValidationResultsProps {
  proof: any;
  validationResults: {
    isValidRepo: boolean;
    isValidId: boolean;
    isValidUser: boolean;
    isMerged: boolean;
  };
  isAllValid: boolean;
  isProcessing: boolean;
  handleClaim: () => void | Promise<void>;
  rewardAmount?: string;
  maxClaims: number;
  isClaimSuccess?: boolean;
  claimHash?: string;
}

interface HorizontalValidationStepProps {
  label: string;
  isValid: boolean;
  isLast?: boolean;
}

function HorizontalValidationStep({
  label,
  isValid,
  isLast,
}: HorizontalValidationStepProps) {
  return (
    <div className="flex flex-col items-center relative min-h-16 flex-1 px-1.5">
      <div className="text-center max-w-32 lg:max-w-36">
        <h4 className="font-medium text-gray-900 text-xs sm:text-sm mb-1 leading-tight mt-5">
          {label}
        </h4>
        <p
          className={`text-xs sm:text-sm font-medium ${
            isValid ? "text-green-600" : "text-red-600"
          }`}
        >
          {isValid ? "Valid" : "Invalid"}
        </p>
      </div>

      {!isLast && (
        <div className="absolute top-0 -right-7 sm:-right-8 transform -translate-y-6 sm:-translate-y-7 w-20 h-10 sm:h-12 flex items-center justify-center z-10">
          <Lottie
            animationData={destinationAnimation}
            loop={true}
            autoplay={true}
            className="w-8 h-8 sm:w-20 sm:h-12"
          />
        </div>
      )}
    </div>
  );
}

export default function HorizontalValidationResults({
  proof,
  validationResults,
  isAllValid,
  isProcessing,
  handleClaim,
  rewardAmount = "100",
  maxClaims,
  isClaimSuccess,
  claimHash,
}: HorizontalValidationResultsProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [showClaimPopup, setShowClaimPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleClaimReward = () => {
    setShowClaimPopup(false);
    handleClaim();
  };

  useEffect(() => {
    if (isClaimSuccess) {
      setShowSuccessPopup(true);
    }
  }, [isClaimSuccess]);

  if (!proof || Object.keys(proof).length === 0) {
    return null;
  }

  const steps = [
    {
      label: "Repository GitHub Verification",
      isValid: validationResults.isValidRepo,
      step: "repo",
    },
    {
      label: "ID GitHub Verification",
      isValid: validationResults.isValidId,
      step: "id",
    },
    {
      label: "Username GitHub Validation",
      isValid: validationResults.isValidUser,
      step: "user",
    },
    {
      label: "Pull Request Merged",
      isValid: validationResults.isMerged,
      step: "merged",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-5 gap-3">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            <span className="font-bold">zkTLS</span> Validation Results
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPopup(true)}
            className="border-black text-white hover:bg-gray-50  hover:text-black cursor-pointer self-start sm:self-auto"
          >
            View Details
          </Button>
        </div>
        {/* <pre className="text-black text-sm whitespace-pre-wrap">
            {JSON.stringify(proof, null, 2)}
          </pre> */}

        <div className="flex items-start justify-center mb-4 sm:mb-6 relative py-3 sm:py-4 px-4 sm:px-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.4 }}
            >
              <HorizontalValidationStep
                label={step.label}
                isValid={step.isValid}
                isLast={index === steps.length - 1}
              />
            </motion.div>
          ))}
        </div>

        {isAllValid && (
          <Button
            size="default"
            className="w-full bg-black hover:bg-gray-800 text-white cursor-pointer"
            onClick={() => setShowClaimPopup(true)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="animate-spin h-4 w-4" />
                <span>Claiming...</span>
              </div>
            ) : (
              "Claim Rewards"
            )}
          </Button>
        )}
      </div>

      <SupplyChainValidationPopup
        isVisible={showPopup}
        onClose={() => setShowPopup(false)}
        validationResults={validationResults}
        isAllValid={isAllValid}
        isProcessing={isProcessing}
        handleClaim={handleClaim}
      />

      <ClaimRewardsPopup
        isVisible={showClaimPopup}
        onClose={() => setShowClaimPopup(false)}
        onConfirmClaim={handleClaimReward}
        rewardAmount={rewardAmount}
        maxClaims={maxClaims}
        isProcessing={isProcessing}
      />

      <ClaimSuccessPopup
        isVisible={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        rewardAmount={rewardAmount}
        maxClaims={maxClaims}
        claimHash={claimHash}
      />
    </div>
  );
}
