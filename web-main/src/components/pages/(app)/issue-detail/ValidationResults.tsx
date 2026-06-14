"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import ValidationItem from "./ValidationItem";
import ValidationResultsPopup from "./ValidationResultsPopup";

interface ValidationResultsProps {
  proof: any;
  validationResults: {
    isValidRepo: boolean;
    isValidId: boolean;
    isValidUser: boolean;
    isMerged: boolean;
  };
  isAllValid: boolean;
  isProcessing: boolean;
  handleClaim: () => void;
}

export default function ValidationResults({
  proof,
  validationResults,
  isAllValid,
  isProcessing,
  handleClaim,
}: ValidationResultsProps) {
  const [showPopup, setShowPopup] = useState(false);

  if (!proof || Object.keys(proof).length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
        <pre className="text-green-400 text-sm whitespace-pre-wrap">
          {JSON.stringify(proof, null, 2)}
        </pre>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            <span className="font-bold">zkTLS</span> Validation Results
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPopup(true)}
            className="border-black text-white hover:bg-gray-200 cursor-pointer"
          >
            View Details
          </Button>
        </div>
        
        <div className="space-y-2 mb-6">
          <ValidationItem
            label="Repository GitHub Verification"
            isValid={validationResults.isValidRepo}
          />
          <ValidationItem
            label="ID GitHub Verification"
            isValid={validationResults.isValidId}
          />
          <ValidationItem
            label="Username GitHub Validation"
            isValid={validationResults.isValidUser}
          />
          <ValidationItem
            label="Pull Request Merged"
            isValid={validationResults.isMerged}
          />
        </div>

        {isAllValid && (
          <Button
            size="lg"
            className="w-full bg-black hover:bg-gray-800 text-white cursor-pointer"
            onClick={handleClaim}
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

      <ValidationResultsPopup
        isVisible={showPopup}
        onClose={() => setShowPopup(false)}
        validationResults={validationResults}
        isAllValid={isAllValid}
        isProcessing={isProcessing}
        handleClaim={handleClaim}
      />
    </div>
  );
}