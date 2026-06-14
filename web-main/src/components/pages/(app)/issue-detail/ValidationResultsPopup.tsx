"use client";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import { IoMdClose } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import destinationAnimation from "../../../../../public/images/Animation/destination-animation.json";
import deliveryAnimation from "../../../../../public/images/Animation/delivery-animation.json";

interface ValidationResultsPopupProps {
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
  animation: any;
}

function ValidationStep({ label, isValid, animation }: ValidationStepProps) {
  return (
    <div className="flex justify-between items-center p-4 border-b border-gray-100 last:border-none">
      <span className="font-medium text-gray-900">{label}</span>
      <div className={`flex items-center gap-3 font-medium ${
        isValid ? "text-green-600" : "text-red-600"
      }`}>
        <div className="w-8 h-8">
          {isValid && (
            <Lottie
              animationData={animation}
              loop={true}
              autoplay={true}
            />
          )}
          {!isValid && (
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 text-sm font-bold">✗</span>
            </div>
          )}
        </div>
        <span>{isValid ? "Valid" : "Invalid"}</span>
      </div>
    </div>
  );
}

export default function ValidationResultsPopup({
  isVisible,
  onClose,
  validationResults,
  isAllValid,
  isProcessing,
  handleClaim,
}: ValidationResultsPopupProps) {
  const getAnimationForStep = (step: string) => {
    switch (step) {
      case "repo":
      case "id":
      case "user":
        return destinationAnimation;
      case "merged":
        return deliveryAnimation;
      default:
        return destinationAnimation;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white rounded-lg max-w-2xl w-full mx-4 border border-gray-200"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900">
                  <span className="font-bold">zkTLS</span> Validation Results
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                  <IoMdClose size={24} className="text-gray-600" />
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-0 mb-6">
                  <ValidationStep
                    label="Repository GitHub Verification"
                    isValid={validationResults.isValidRepo}
                    animation={getAnimationForStep("repo")}
                  />
                  <ValidationStep
                    label="ID GitHub Verification"
                    isValid={validationResults.isValidId}
                    animation={getAnimationForStep("id")}
                  />
                  <ValidationStep
                    label="Username GitHub Validation"
                    isValid={validationResults.isValidUser}
                    animation={getAnimationForStep("user")}
                  />
                  <ValidationStep
                    label="Pull Request Merged"
                    isValid={validationResults.isMerged}
                    animation={getAnimationForStep("merged")}
                  />
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
                    className="bg-white border-black text-black hover:bg-gray-50 cursor-pointer"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}