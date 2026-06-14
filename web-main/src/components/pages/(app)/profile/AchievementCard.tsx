import Image from "next/image";

interface AchievementCardProps {
  title: string;
  description: string;
  isUnlocked: boolean;
  icon: string;
}

export default function AchievementCard({ 
  title, 
  description, 
  isUnlocked, 
  icon 
}: AchievementCardProps) {
  return (
    <div className={`relative bg-white border border-gray-200 rounded-lg p-6 ${
      isUnlocked ? 'opacity-100' : 'opacity-60'
    }`}>
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
          isUnlocked ? 'bg-green-100' : 'bg-gray-100'
        }`}>
          <Image
            src={icon}
            alt={title}
            width={24}
            height={24}
            className="object-contain"
          />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
          <div className="mt-2">
            <span className={`text-xs px-2 py-1 rounded ${
              isUnlocked 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              {isUnlocked ? 'Unlocked' : 'Locked'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}