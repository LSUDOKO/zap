import Image from "next/image";

interface ProfileHeaderProps {
  address: string;
}

export default function ProfileHeader({ address }: ProfileHeaderProps) {
  const shortenAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8">
      <div className="flex items-center space-x-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <Image
            src="/images/Logo/zkpull-logo.png"
            alt="Profile Avatar"
            width={48}
            height={48}
            className="rounded-full"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Developer Profile
          </h1>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Wallet Address</p>
            <p className="font-mono text-gray-900 bg-gray-50 px-3 py-1 rounded border inline-block">
              {shortenAddress(address)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
