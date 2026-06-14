import Image from "next/image";

interface ContributionItem {
  id: string;
  project: string;
  type: string;
  reward: number;
  date: string;
  status: "completed" | "pending";
}

interface ContributionHistoryProps {
  contributions: ContributionItem[];
}

export default function ContributionHistory({ contributions }: ContributionHistoryProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Contributions</h3>
      
      <div className="space-y-4">
        {contributions.map((contribution) => (
          <div 
            key={contribution.id}
            className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Image
                  src="/images/github.png"
                  alt="GitHub"
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{contribution.project}</h4>
                <p className="text-sm text-gray-600">{contribution.type}</p>
                <p className="text-xs text-gray-500">{contribution.date}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">
                  {contribution.reward} mUSD
                </span>
                <Image
                  src="/images/Logo/mantle-usd-logo.webp"
                  alt="mUSD"
                  width={16}
                  height={16}
                  className="object-contain"
                />
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                contribution.status === 'completed' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {contribution.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}