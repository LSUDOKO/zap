"use client";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import Image from "next/image";
import { IoMdClose } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { formatTokenAmount } from "@/utils/format";
import deliveryAnimation from "../../../../../public/images/Animation/delivery-animation.json";

interface ClaimRewardsPopupProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirmClaim: () => void;
  rewardAmount: string;
  maxClaims: number;
  isProcessing: boolean;
}

export default function ClaimRewardsPopup({
  isVisible,
  onClose,
  onConfirmClaim,
  rewardAmount,
  maxClaims,
  isProcessing,
}: ClaimRewardsPopupProps) {
  const rewardPerClaim = Number(formatTokenAmount(rewardAmount)) / Number(maxClaims);
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
              className="bg-white rounded-lg max-w-md w-full border border-gray-200 relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <IoMdClose size={20} className="text-gray-600" />
              </button>

              <div className="p-8 text-center">
                <div className="w-24 h-24 mx-auto mb-6">
                  <Lottie
                    animationData={deliveryAnimation}
                    loop={true}
                    autoplay={true}
                  />
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Claim Your Rewards
                </h3>

                <p className="text-gray-600 mb-6">
                  Congratulations! You have successfully completed the validation process.
                </p>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <Image
                      src="/images/Logo/mantle-usd-logo.webp"
                      alt="Mantle USD"
                      width={40}
                      height={40}
                      className="mr-3"
                    />
                    <div className="text-left">
                      <p className="text-sm text-gray-600">Reward Per Claim</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {rewardPerClaim.toFixed(2)} <span className="font-light">mUSD</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Network</span>
                      <div className="flex items-center">
                        <Image
                          src="/images/Logo/mantle-logo.png"
                          alt="Mantle"
                          width={50}
                          height={16}
                        />
                        {/* <span className="font-medium text-gray-900">Mantle</span> */}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span className="text-gray-600">Token Type</span>
                      <div className="flex items-center">
                        <Image
                          src="/images/Logo/mantle-usd-logo.webp"
                          alt="mUSD"
                          width={16}
                          height={16}
                          className="mr-1"
                        />
                        <span className="font-medium text-gray-900">mUSD</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className="flex-1 bg-black hover:bg-gray-800 text-white cursor-pointer"
                    onClick={onConfirmClaim}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Confirm Claim"}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={onClose}
                    disabled={isProcessing}
                    className="bg-white border-black text-black hover:text-gray-500 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
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