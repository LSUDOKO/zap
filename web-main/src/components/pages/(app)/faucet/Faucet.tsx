"use client";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useWallet } from "@/lib/hooks/use-wallet";
import { useMintTokens } from "@/lib/hooks/use-mint-tokens";
import CornerLayout from "../profile/CornerLayout";
import WalletConnectSection from "../profile/WalletConnectSection";

export default function Faucet() {
  const { address } = useWallet();
  const { handleMint, isMintPending, isMintConfirming } = useMintTokens();
  const [amount, setAmount] = React.useState("100");

  const isProcessing = isMintPending || isMintConfirming;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !address) {
      return;
    }
    handleMint(address, amount);
  };

  if (!address) {
    return (
      <CornerLayout>
        <WalletConnectSection />
      </CornerLayout>
    );
  }

  return (
    <CornerLayout>
      <div className="bg-white overflow-hidden">
        <div className="relative h-[100px] md:h-[200px]">
          <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-gray-400 rounded-tl-lg z-10"></span>
          <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-gray-400 rounded-tr-lg z-10"></span>
          <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-gray-400 rounded-bl-lg z-10"></span>
          <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-gray-400 rounded-br-lg z-10"></span>
          <Image
            src="/images/Background/bg-detail.png"
            alt="Faucet Background"
            fill
            className="object-cover"
            priority
          />
        </div>

        <main className="px-8 py-12 bg-gray-50 space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Mantle USD Faucet
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get test tokens for development and testing purposes on Mantle Sepolia Testnet.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-6">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Image
                  src="/images/Logo/mantle-usd-logo.webp"
                  alt="Mantle USD"
                  width={48}
                  height={48}
                  className="object-contain"
                />
                <h2 className="text-2xl font-bold text-gray-900">mUSD Token</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-gray-700">Amount</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isProcessing}
                    className="w-full bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:ring-0"
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Request test mUSD tokens for development
                  </p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-black hover:bg-gray-800 text-white cursor-pointer"
                  disabled={isProcessing || !amount || Number(amount) <= 0}
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="animate-spin h-4 w-4" />
                      <span>Minting...</span>
                    </div>
                  ) : (
                    "Request Tokens"
                  )}
                </Button>
              </form>

              <div className="border-t border-gray-200 pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Network</span>
                    <div className="flex items-center">
                      <Image
                        src="/images/Logo/mantle-logo.png"
                        alt="Mantle"
                        width={50}
                        height={16}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
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
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Your Address</span>
                    <span className="font-medium text-gray-900">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </CornerLayout>
  );
}
