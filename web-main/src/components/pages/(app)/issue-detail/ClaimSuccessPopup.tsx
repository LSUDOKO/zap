"use client";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import Image from "next/image";
import { IoMdClose } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { formatTokenAmount } from "@/utils/format";
import successAnimation from "../../../../../public/images/Animation/success-animation.json";

interface ClaimSuccessPopupProps {
  isVisible: boolean;
  onClose: () => void;
  rewardAmount: string;
  maxClaims: number;
  claimHash?: string;
}

export default function ClaimSuccessPopup({
  isVisible,
  onClose,
  rewardAmount,
  maxClaims,
  claimHash,
}: ClaimSuccessPopupProps) {
  const rewardPerClaim = Number(formatTokenAmount(rewardAmount)) / Number(maxClaims);
  return (
    <AnimatePresence>
      {isVisible && (
        <div>
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-lg max-w-md w-full border border-gray-200 relative"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <IoMdClose size={20} className="text-gray-600" />
            </button>

            <div className="p-8 text-center">
              <motion.div
                className="w-32 h-32 mx-auto mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
              >
                <Lottie
                  animationData={successAnimation}
                  loop={false}
                  autoplay={true}
                />
              </motion.div>

              <motion.h3
                className="text-2xl font-semibold text-gray-900 mb-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                Claim Successful
              </motion.h3>

              <motion.p
                className="text-gray-600 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                Your reward has been successfully claimed and transferred to your wallet
              </motion.p>

              <motion.div
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                <div className="flex items-center justify-center">
                  <Image
                    src="/images/Logo/mantle-usd-logo.webp"
                    alt="Mantle USD"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  <p className="text-gray-900 font-medium">
                    {rewardPerClaim.toFixed(2)} mUSD claimed successfully
                  </p>
                </div>
              </motion.div>

              {claimHash && (
                <motion.div
                  className="mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.3 }}
                >
                  <a
                    href={`https://sepolia.mantlescan.xyz/tx/${claimHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm underline cursor-pointer"
                  >
                    View Transaction on Mantle Sepolia Explorer
                  </a>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.3 }}
              >
                <Button
                  size="lg"
                  className="w-full bg-black hover:bg-gray-800 text-white cursor-pointer"
                  onClick={onClose}
                >
                  Continue
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}