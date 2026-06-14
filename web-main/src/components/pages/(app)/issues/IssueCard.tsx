import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ethers } from "ethers";
import { Issue } from "@/utils/types";
import Image from "next/image";
import { ShineBorder } from "@/components/ui/shine-border";

interface IssueCardProps {
  issue: Issue;
  index: number;
  isHighestReward?: boolean;
}

export default function IssueCard({
  issue,
  index,
  isHighestReward,
}: IssueCardProps) {
  const renderIssueStatus = (deadline: bigint) => {
    const deadlineDate = new Date(Number(deadline) * 1000);
    const timeRemaining = formatDistanceToNow(deadlineDate);
    return deadlineDate > new Date() ? `ends in ${timeRemaining}` : "CLOSED";
  };

  const shortenAddress = (address: string, length: number = 5) => {
    if (!address) return "";
    return `${address.substring(0, length)}...${address.substring(
      address.length - length
    )}`;
  };

  const cardContent = (
    <>
      <Image
        src="/images/Background/bg-zkpull.png"
        alt="Background"
        fill
        className="object-cover w-full h-full"
        style={{ objectPosition: "center" }}
      />
      <div className="absolute inset-0 bg-black/10 backdrop-blur-md"></div>

      {isHighestReward && (
        <ShineBorder
          shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
          borderWidth={5}
        />
      )}

      {isHighestReward && (
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-white text-black text-xs font-medium px-3 py-1.5 rounded-full flex items-center space-x-2 shadow-lg border border-black">
            <Image
              src="/images/Logo/highest-rewards-logo.png"
              alt="Highest Reward"
              width={20}
              height={20}
            />
            <span>Highest Reward!</span>
          </div>
        </div>
      )}

      <div className="relative z-10 p-6 flex flex-col justify-between h-full">
        <div className="space-y-2">
          <div className={isHighestReward ? 'pr-40' : ''}>
            <h1 className="text-xl font-bold text-white line-clamp-2">{issue.projectName}</h1>
          </div>
          <p className="text-sm text-white">
            Owner: {shortenAddress(issue.owner)}
          </p>
        </div>

        <div className="flex justify-between items-end mt-4">
          <div>
            <p className="text-sm text-white/80 mb-1">Reward</p>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-xl text-white">
                {parseInt(ethers.formatEther(issue.bountyAmount).toString())}{" "}
                mUSD
              </h2>
              <Image
                src="/images/Logo/mantle-usd-logo.webp"
                alt="Mantle USD"
                width={20}
                height={20}
                className="object-contain"
              />
            </div>
          </div>
          <div className="bg-gray-100 border border-gray-300 px-3 py-1 rounded text-sm text-gray-700 whitespace-nowrap">
            {renderIssueStatus(issue.deadline)}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <Link href={`/issues/${issue.id}`} key={index}>
      <div className="relative overflow-hidden border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer h-[200px]">
        {cardContent}
      </div>
    </Link>
  );
}
