import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface GithubAuthSectionProps {
  isAuthenticated: boolean;
  pullRequestUrl: string;
  setPullRequestUrl: (url: string) => void;
  isFetching: boolean;
  generateProof: () => void;
  githubLogout: () => void;
  loginWithGithub: () => void;
}

export default function GithubAuthSection({
  isAuthenticated,
  pullRequestUrl,
  setPullRequestUrl,
  isFetching,
  generateProof,
  githubLogout,
  loginWithGithub,
}: GithubAuthSectionProps) {
  if (!isAuthenticated) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Connect GitHub
        </h3>
        <Button
          size="lg"
          className="bg-white text-black border-black border hover:bg-gray-200 cursor-pointer"
          onClick={loginWithGithub}
        >
          <Image
            src="/images/github.png"
            alt="GitHub"
            width={24}
            height={24}
            className=""
          />
          Connect with GitHub
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Submit your Pull Request URL
      </h3>

      <div className="space-y-3">
        <Input
          placeholder="GitHub Pull Request Link"
          value={pullRequestUrl}
          onChange={(e) => setPullRequestUrl(e.target.value)}
          disabled={isFetching}
          className="border-gray-300 bg-white text-gray-900"
        />

        <div className="flex gap-3">
          <Button
            size="lg"
            className="flex-1 bg-black text-white hover:bg-gray-800 border border-black cursor-pointer"
            onClick={generateProof}
            disabled={isFetching}
          >
            {isFetching ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="animate-spin h-4 w-4" />
                <span>Generating...</span>
              </div>
            ) : (
              "Generate Proof"
            )}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={githubLogout}
            disabled={isFetching}
            className="bg-white border-black text-black hover:bg-gray-400 cursor-pointer"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
