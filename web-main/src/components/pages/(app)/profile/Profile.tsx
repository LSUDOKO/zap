"use client";
import Image from "next/image";
import { useWallet } from "@/lib/hooks/use-wallet";
import { FaCode, FaAward, FaCodeBranch } from "react-icons/fa";
import CornerLayout from "./CornerLayout";
import WalletConnectSection from "./WalletConnectSection";
import ProfileHeader from "./ProfileHeader";
import StatsCard from "./StatsCard";
import AchievementCard from "./AchievementCard";
import ContributionHistory from "./ContributionHistory";

const mockAchievements = [
  {
    id: "1",
    title: "First Contribution",
    description: "Made your first open source contribution",
    isUnlocked: true,
    icon: "/images/checklist.png"
  },
  {
    id: "2",
    title: "Bug Hunter",
    description: "Fixed 5 bugs in different repositories",
    isUnlocked: true,
    icon: "/images/github.png"
  },
  {
    id: "3",
    title: "Feature Developer",
    description: "Implemented 3 new features",
    isUnlocked: false,
    icon: "/images/Logo/zkpull-logo.png"
  },
  {
    id: "4",
    title: "Community Helper",
    description: "Helped 10 developers with their issues",
    isUnlocked: false,
    icon: "/images/Logo/mantle-usd-logo.webp"
  }
];

const mockContributions = [
  {
    id: "1",
    project: "react-components-library",
    type: "Bug Fix",
    reward: 25,
    date: "2 days ago",
    status: "completed" as const
  },
  {
    id: "2",
    project: "typescript-utils",
    type: "Feature Implementation",
    reward: 50,
    date: "1 week ago",
    status: "completed" as const
  },
  {
    id: "3",
    project: "web3-dashboard",
    type: "UI Enhancement",
    reward: 30,
    date: "2 weeks ago",
    status: "pending" as const
  }
];

export default function Profile() {
  const { address } = useWallet();

  if (!address) {
    return (
      <CornerLayout>
        <WalletConnectSection />
      </CornerLayout>
    );
  }

  const totalRewards = mockContributions
    .filter(c => c.status === "completed")
    .reduce((sum, c) => sum + c.reward, 0);
  
  const totalContributions = mockContributions.length;
  const unlockedAchievements = mockAchievements.filter(a => a.isUnlocked).length;

  return (
    <CornerLayout>
      <div className="bg-white overflow-hidden">
        <div className="relative h-[100px] md:h-[200px]">
          <Image
            src="/images/Background/bg-profile.png"
            alt="Profile Background"
            fill
            className="object-cover"
            priority
          />
        </div>

        <main className="px-8 py-12 bg-gray-50 space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Developer Profile</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Track your open source contributions, achievements, and rewards earned through zkTLS-verified pull requests.
            </p>
          </div>

          <ProfileHeader address={address} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Contributions"
              value={totalContributions}
              subtitle="Open source projects"
              icon={<FaCodeBranch size={20} />}
            />
            <StatsCard
              title="Total Rewards Earned"
              value={`${totalRewards} mUSD`}
              subtitle="zkTLS verified"
              icon={
                <Image
                  src="/images/Logo/mantle-usd-logo.webp"
                  alt="Mantle USD"
                  width={20}
                  height={20}
                  className="object-contain"
                />
              }
            />
            <StatsCard
              title="Achievements Unlocked"
              value={`${unlockedAchievements}/${mockAchievements.length}`}
              subtitle="Developer milestones"
              icon={<FaAward size={20} />}
            />
            <StatsCard
              title="Active Projects"
              value="3"
              subtitle="Currently contributing"
              icon={<FaCode size={20} />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Achievements</h2>
              <div className="space-y-4">
                {mockAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    title={achievement.title}
                    description={achievement.description}
                    isUnlocked={achievement.isUnlocked}
                    icon={achievement.icon}
                  />
                ))}
              </div>
            </div>

            <div>
              <ContributionHistory contributions={mockContributions} />
            </div>
          </div>
        </main>
      </div>
    </CornerLayout>
  );
}