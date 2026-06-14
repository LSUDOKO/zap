import WalletConnect from "@/components/ui/WalletConnect";

export default function WalletConnectSection() {
  return (
    <div className="bg-white overflow-hidden border-t border-gray-300">
      <div className="px-8 py-16 bg-gray-50 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-4xl font-bold text-gray-900">Connect Your Wallet</h1>
          <p className="text-lg text-gray-600">
            Please connect your wallet to create an issue and start contributing to open source projects.
          </p>
          <WalletConnect />
        </div>
      </div>
    </div>
  );
}