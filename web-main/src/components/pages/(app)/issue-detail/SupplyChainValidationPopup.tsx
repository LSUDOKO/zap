"use client";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import { IoMdClose } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import destinationAnimation from "../../../../../public/images/Animation/destination-animation.json";

interface SupplyChainValidationPopupProps {
  isVisible: boolean;
  onClose: () => void;
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

interface ValidationStepProps {
  label: string;
  isValid: boolean;
  isLast?: boolean;
  description: string;
}

function ValidationStep({ label, isValid, isLast, description }: ValidationStepProps) {
  return (
    <div className="flex flex-col items-center relative flex-1 px-3">
      <div className="text-center max-w-40 mt-5 flex flex-col">
        <h4 className="font-medium text-gray-900 text-sm mb-2 leading-tight min-h-[40px] flex items-center justify-center">
          {label}
        </h4>
        <p className={`text-sm font-medium mb-3 ${
          isValid ? "text-green-600" : "text-red-600"
        }`}>
          {isValid ? "Valid" : "Invalid"}
        </p>
        <p className="text-xs text-gray-600 leading-relaxed min-h-[60px]">
          {description}
        </p>
      </div>
      
      {!isLast && (
        <div className="absolute top-0 -right-8 transform -translate-y-10 w-20 h-16 flex items-center justify-center z-10">
          <Lottie
            animationData={destinationAnimation}
            loop={true}
            autoplay={true}
            className="w-16 h-16"
          />
        </div>
      )}
    </div>
  );
}

export default function SupplyChainValidationPopup({
  isVisible,
  onClose,
  validationResults,
  isAllValid,
  isProcessing,
  handleClaim,
}: SupplyChainValidationPopupProps) {
  const steps = [
    { 
      label: "Repository GitHub Verification", 
      isValid: validationResults.isValidRepo, 
      description: "Verifies that the repository exists and is accessible via zkTLS validation"
    },
    { 
      label: "ID GitHub Verification", 
      isValid: validationResults.isValidId, 
      description: "Confirms the GitHub issue ID matches and is valid for the specified repository"
    },
    { 
      label: "Username GitHub Validation", 
      isValid: validationResults.isValidUser, 
      description: "Validates that the GitHub username is authentic and matches the contributor"
    },
    { 
      label: "Pull Request Merged", 
      isValid: validationResults.isMerged, 
      description: "Verifies that the pull request has been successfully merged into the repository"
    },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <div>
          <motion.div
            className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          >
            <motion.div
              className="bg-white rounded-lg max-w-4xl w-full border border-gray-200 max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    <span className="font-bold">zkTLS</span> Validation Results - Detailed View
                  </h3>
                  <p className="text-sm text-gray-600">
                    zkTLS technology ensures secure and private validation of your GitHub contributions through zero-knowledge proofs
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                  <IoMdClose size={24} className="text-gray-600" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-8 relative py-8 px-4">
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.15, duration: 0.4 }}
                    >
                      <ValidationStep
                        label={step.label}
                        isValid={step.isValid}
                        isLast={index === steps.length - 1}
                        description={step.description}
                      />
                    </motion.div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">How zkTLS Validation Works</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Our zkTLS (Zero-Knowledge Transport Layer Security) technology validates your GitHub contributions without exposing sensitive data. 
                    Each step represents a cryptographic proof that your pull request is legitimate, merged, and ready for reward claiming.
                  </p>
                </div>

                <div className="flex gap-3">
                  {isAllValid && (
                    <Button
                      size="lg"
                      className="flex-1 bg-black hover:bg-gray-800 text-white cursor-pointer"
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
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={onClose}
                    className="bg-white border-black text-black hover:text-black hover:bg-gray-50 cursor-pointer"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}