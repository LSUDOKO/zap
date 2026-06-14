import Image from "next/image";

interface FormData {
  title: string;
  repoLink: string;
  description: string;
  deadline: Date;
  bountyAmount: string;
}

interface IssuePreviewProps {
  formData: FormData;
  address: string;
}

export default function IssuePreview({ formData, address }: IssuePreviewProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 h-fit">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Preview</h3>
      
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600">Owner</p>
          <p className="font-medium text-gray-900 break-all">{address}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Title</p>
          <p className="font-medium text-gray-900">{formData.title || "Not set"}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Repository</p>
          <p className="font-medium text-gray-900 break-all">{formData.repoLink || "Not set"}</p>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded p-3">
          <p className="text-sm text-gray-700 font-medium">Make sure your repository is public.</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Description</p>
          <p className="font-medium text-gray-900">{formData.description || "Not set"}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Reward</p>
          <div className="flex items-center space-x-2">
            <p className="font-medium text-gray-900">{formData.bountyAmount || '0'} mUSD</p>
            <Image
              src="/images/Logo/mantle-usd-logo.webp"
              alt="Mantle USD"
              width={16}
              height={16}
              className="object-contain"
            />
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Deadline</p>
          <p className="font-medium text-gray-900">{formData.deadline.toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}