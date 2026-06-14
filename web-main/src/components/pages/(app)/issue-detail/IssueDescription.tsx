import Link from "next/link";
import { IssueDetails } from "@/utils/types";

interface IssueDescriptionProps {
  issueDetails: IssueDetails;
}

export default function IssueDescription({ issueDetails }: IssueDescriptionProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Description
        </h3>
        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
          {issueDetails.description || "No description available."}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          GitHub Repository
        </h3>
        <Link 
          href={issueDetails.repoLink} 
          target="_blank"
          className="text-blue-600 hover:text-blue-800 break-all underline cursor-pointer"
        >
          {issueDetails.repoLink || "No repository link provided."}
        </Link>
      </div>
    </div>
  );
}