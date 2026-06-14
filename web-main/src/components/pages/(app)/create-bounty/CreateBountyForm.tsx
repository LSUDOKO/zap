import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Loader2, Info } from "lucide-react";
import Image from "next/image";

interface FormData {
  title: string;
  repoLink: string;
  description: string;
  deadline: Date;
  bountyAmount: string;
  maxClaims: string;
}

interface CreateBountyFormProps {
  formData: FormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onDateChange: (date: Date) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function CreateBountyForm({
  formData,
  onInputChange,
  onDateChange,
  onSubmit,
  isLoading,
  error
}: CreateBountyFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border border-gray-200 rounded-lg p-6 space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="title" className="text-gray-900 font-medium">Title Issue</Label>
        <Input
          name="title"
          value={formData.title}
          onChange={onInputChange}
          required
          placeholder="Enter your issue title"
          className="border-gray-300 bg-white text-gray-900"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="repoLink" className="text-gray-900 font-medium">Github Repository Link</Label>
        <Input
          name="repoLink"
          value={formData.repoLink}
          onChange={onInputChange}
          required
          placeholder="https://github.com/username/repository"
          className="border-gray-300 bg-white text-gray-900"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-900 font-medium">Description</Label>
        <Textarea
          name="description"
          value={formData.description}
          onChange={onInputChange}
          required
          placeholder="Describe the issue and requirements"
          className="border-gray-300 min-h-[120px] bg-white text-gray-900"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Label htmlFor="bountyAmount" className="text-gray-900 font-medium">Reward (mUSD)</Label>
          <Image
            src="/images/Logo/mantle-usd-logo.webp"
            alt="Mantle USD"
            width={20}
            height={20}
            className="object-contain"
          />
        </div>
        <Input
          name="bountyAmount"
          type="number"
          value={formData.bountyAmount}
          onChange={onInputChange}
          required
          placeholder="0"
          className="border-gray-300 bg-white text-gray-900"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <Label htmlFor="deadline" className="text-gray-900 font-medium">Deadline</Label>
        <DatePicker
          date={formData.deadline}
          onSelect={onDateChange}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Label htmlFor="maxClaims" className="text-gray-900 font-medium">Maximum Claims</Label>
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className="cursor-pointer">
                <Info className="w-4 h-4 text-gray-500 hover:text-gray-700" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="bg-white border border-gray-200 text-gray-900">
              <div className="space-y-3">
                <p className="text-sm font-medium">Maximum Claims limits how many developers can claim rewards for 1 issue.</p>
                <div className="text-sm space-y-1">
                  <p className="font-medium">Reward per claim = Total Bounty / Max Claims</p>
                </div>
                <div className="text-sm space-y-1">
                  <p className="font-medium">Example:</p>
                  <p>Bounty: 300 mUSD</p>
                  <p>Max Claims: 3</p>
                  <p>Reward per claim: 100 mUSD</p>
                </div>
                <div className="text-sm space-y-1">
                  <p className="font-medium">If only 2 developers claim:</p>
                  <p>Paid: 200 mUSD (2 × 100)</p>
                  <p>Remaining: 100 mUSD (can be withdrawn by owner)</p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <Input
          name="maxClaims"
          type="number"
          value={formData.maxClaims}
          onChange={onInputChange}
          required
          placeholder="1"
          min="1"
          className="border-gray-300 bg-white text-gray-900"
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full bg-gray-200 text-gray-900 hover:bg-gray-300 border border-gray-300 cursor-pointer"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="animate-spin" />
            <p>Creating...</p>
          </div>
        ) : (
          "Create Issue"
        )}
      </Button>

      {error && <p className="text-red-500 text-sm">Error: {error}</p>}
    </form>
  );
}