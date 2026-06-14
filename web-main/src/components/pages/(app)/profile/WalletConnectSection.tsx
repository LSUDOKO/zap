import WalletConnect from "@/components/ui/WalletConnect";

export default function WalletConnectSection() {
  return (
    <div className="bg-white overflow-hidden border-t border-gray-300">
      <div className="flex items-center justify-center min-h-[400px] flex-col gap-8 px-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Connect Your Wallet</h1>
          <p className="text-gray-600 text-lg max-w-md mx-auto">
            Please connect your wallet to view your profile and track your open source contributions.
          </p>
        </div>
        <WalletConnect />
      </div>
    </div>
  );
}