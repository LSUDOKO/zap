import Image from "next/image";

export default function Work() {
  return (
    <div className="max-w-7xl mx-auto px-3 py-1 relative">
      <div className="absolute left-0 top-1 bottom-0 w-px bg-gray-200"></div>
      <div className="absolute right-0 top-1 bottom-0 w-px bg-gray-200"></div>

      <div className="absolute top-[-5] left-[-4] z-20">
        <div className="w-6 h-6">
          <div className="absolute top-0 left-1 w-6 h-2 border-l-2 border-t-2 border-black"></div>
        </div>
      </div>

      <div className="absolute bg-gray-200 top-[-5] w-[99%] flex items-center justify-center border border-gray-200"></div>

      <div className="absolute top-[-5] right-[-1] z-20">
        <div className="w-6 h-6">
          <div className="absolute top-0 right-0 w-6 h-2 border-r-2 border-t-2 border-black"></div>
        </div>
      </div>

      <div className="bg-white overflow-hidden border-t border-gray-300">
        <main className="px-8 py-12 bg-gray-50 space-y-12">
          <div className="text-center">
            <h1 className="text-2xl xl:text-3xl font-semibold text-black mb-4">
              How Open Source Contributors Earn Rewards
            </h1>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              Simple 3-step process to get rewarded for your open source
              contributions through verified pull requests.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="relative w-full h-48">
                <Image
                  src="/images/Background/step-1.png"
                  alt="Step 1: Create Issue & Pull Request"
                  fill
                  className="object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-6 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Create & Contribute
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Repository Owner creates the issue with clear requirements and
                  bounty details.
                </p>
                <p className="text-sm text-gray-600">
                  Open Source Contributor creates pull request to solve the
                  issue.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden">
              <div className="relative w-full h-48">
                <Image
                  src="/images/Background/step-2.png"
                  alt="Step 2: Merge & Submit"
                  fill
                  className="object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-6 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Merge & Submit
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Repository Owner reviews and merges the pull request after
                  verification.
                </p>
                <p className="text-sm text-gray-600">
                  Open Source Contributor submits PR URL to issue for reward
                  claim.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden">
              <div className="relative w-full h-48">
                <Image
                  src="/images/Background/step-3.png"
                  alt="Step 3: Verify & Reward"
                  fill
                  className="object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-6 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Verify & Reward
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  zkTLS and AVS technology verify the merge automatically and
                  securely.
                </p>
                <p className="text-sm text-gray-600">
                  Open Source Contributors receive their earned rewards
                  instantly.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className="absolute bottom-[-5] left-[-4] z-20">
        <div className="w-6 h-6">
          <div className="absolute bottom-0 left-1 w-6 h-2 border-l-2 border-b-2 border-black"></div>
        </div>
      </div>

      <div className="absolute bg-gray-200 bottom-[-5] w-[99%] flex items-center justify-center border border-gray-200"></div>

      <div className="absolute bottom-[-5] right-[-1] z-20">
        <div className="w-6 h-6">
          <div className="absolute bottom-0 right-0 w-6 h-2 border-r-2 border-b-2 border-black"></div>
        </div>
      </div>
    </div>
  );
}
