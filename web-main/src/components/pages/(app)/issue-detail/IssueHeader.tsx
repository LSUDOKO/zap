import Image from "next/image";
import { IssueDetails } from "@/utils/types";
import { ethers } from "ethers";
import { Users } from "lucide-react";

interface IssueHeaderProps {
  issueDetails: IssueDetails;
}

export default function IssueHeader({ issueDetails }: IssueHeaderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {issueDetails.projectName || "N/A"}
        </h1>
        <p className="text-gray-600">
          Created by{" "}
          <span className="font-medium text-gray-900">{issueDetails.owner || "Unknown"}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-lg">
          <Image
            src="/images/Logo/mantle-usd-logo.webp"
            alt="Mantle USD"
            width={48}
            height={48}
            className="object-contain"
          />
          <div>
            <p className="font-bold text-2xl text-gray-900">
              {parseInt(ethers.formatEther(issueDetails.bountyAmount).toString())} mUSD
            </p>
            <p className="text-sm text-gray-600">Bounty Reward</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-lg">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-gray-900" />
          </div>
          <div>
            <p className="font-bold text-2xl text-gray-900">{Number(issueDetails.maxClaims)} Developers</p>
            <p className="text-sm text-gray-600">Can claim this bounty</p>
          </div>
        </div>
      </div>
    </div>
  );
}