import { Loader2 } from "lucide-react";
import { Issue } from "@/utils/types";
import IssueCard from "./IssueCard";

interface IssuesListProps {
  allIssue: Issue[];
  isFetchingData: boolean;
  highestRewardAmount?: bigint;
}

export default function IssuesList({ allIssue, isFetchingData, highestRewardAmount }: IssuesListProps) {
  if (isFetchingData) {
    return (
      <div className="col-span-2 flex justify-center items-center min-h-[300px] space-x-3">
        <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
        <p className="text-gray-600">Loading bounty issues...</p>
      </div>
    );
  }

  if (allIssue.length === 0) {
    return (
      <div className="col-span-2 text-center py-16">
        <p className="text-gray-500 text-lg">No bounty issues found.</p>
        <p className="text-gray-400 text-sm mt-2">Check back later for new opportunities.</p>
      </div>
    );
  }

  return (
    <>
      {allIssue.map((issue, index) => {
        const isHighestReward = Boolean(highestRewardAmount && issue.bountyAmount === highestRewardAmount);
        return (
          <IssueCard 
            key={issue.id} 
            issue={issue} 
            index={index} 
            isHighestReward={isHighestReward}
          />
        );
      })}
    </>
  );
}