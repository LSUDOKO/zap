"use client";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import { IoMdClose } from "react-icons/io";
import { Button } from "@/components/ui/button";
import generatingProofAnimation from "../../../../../public/images/Animation/generating-proof-animation.json";

interface GeneratingProofPopupProps {
  isVisible: boolean;
  onCancel?: () => void;
}

export default function GeneratingProofPopup({
  isVisible,
  onCancel,
}: GeneratingProofPopupProps) {
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
              className="bg-white rounded-lg p-8 max-w-md w-full mx-4 border border-gray-200 relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                  <IoMdClose size={20} className="text-gray-600" />
                </button>
              )}
              
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6">
                  <Lottie
                    animationData={generatingProofAnimation}
                    loop={true}
                    autoplay={true}
                  />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Generating Proof
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Please wait while we generate your proof using zkTLS technology
                </p>
                
                {onCancel && (
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="border-gray-300 text-white hover:text-black hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}