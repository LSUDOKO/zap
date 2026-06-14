"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "./button";
import Image from "next/image";
import { useWallet } from "@/lib/hooks/use-wallet";
import { useBalance } from "@/lib/hooks/use-balance";
import { useSmartAccount } from "@/lib/MetaMaskSmartAccountProvider";
import { formatUnits } from "viem";
import { useState } from "react";

export default function WalletConnect() {
  const { address } = useWallet();
  const { tokenBalance } = useBalance(address || "");
  const {
    smartAccountAddress,
    isSmartAccountDeployed,
    isCreatingAccount,
    deployAccount,
  } = useSmartAccount();
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);

  const formattedBalance = () => {
    if (!tokenBalance) return "0";

    try {
      const balanceBigInt = BigInt(tokenBalance.toString());
      return parseInt(formatUnits(balanceBigInt, 18));
    } catch (error) {
      console.error("Error formatting balance:", error);
      return "0";
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeployError(null);
    try {
      await deployAccount();
    } catch (error: any) {
      setDeployError(error?.message || "Deployment failed");
    } finally {
      setIsDeploying(false);
    }
  };

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button onClick={openConnectModal} type="button">
                    Connect Wallet
                  </Button>
                );
              }
              if (chain.unsupported) {
                return (
                  <Button onClick={openChainModal} type="button">
                    Wrong network
                  </Button>
                );
              }
              return (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button
                      onClick={openAccountModal}
                      type="button"
                      className="flex items-center gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span>{account.displayName}</span>
                        {account.displayBalance && (
                          <span>({account.displayBalance})</span>
                        )}
                      </div>
                    </Button>
                    <Button
                      type="button"
                      className="flex items-center gap-2 cursor-default"
                    >
                      <div className="flex items-center gap-2">
                        <span>{formattedBalance()}</span>
                        <Image
                          src="/images/Logo/ethereum-eth-logo.png"
                          alt="USD"
                          width={16}
                          height={16}
                          className="object-contain"
                        />
                        <span>USD</span>
                      </div>
                    </Button>
                  </div>

                  {/* Smart Account Status */}
                  {smartAccountAddress && (
                    <div className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md bg-muted/50 border border-border">
                      <span className="text-muted-foreground font-medium">
                        Smart Acc:
                      </span>
                      <code className="font-mono text-foreground">
                        {truncateAddress(smartAccountAddress)}
                      </code>
                      {isSmartAccountDeployed ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Deployed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Not Deployed
                        </span>
                      )}
                    </div>
                  )}

                  {/* Deploy Button */}
                  {smartAccountAddress &&
                    !isSmartAccountDeployed &&
                    !isCreatingAccount && (
                      <div className="flex flex-col gap-1">
                        <Button
                          onClick={handleDeploy}
                          disabled={isDeploying}
                          size="sm"
                          variant="secondary"
                          className="w-full text-xs"
                          type="button"
                        >
                          {isDeploying ? (
                            <span className="flex items-center gap-2">
                              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              Deploying...
                            </span>
                          ) : (
                            "Deploy Smart Account"
                          )}
                        </Button>
                        {deployError && (
                          <p className="text-[10px] text-red-500 px-1">
                            {deployError}
                          </p>
                        )}
                      </div>
                    )}

                  {/* Creating Account Loading */}
                  {isCreatingAccount && (
                    <div className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md bg-muted/50 border border-border">
                      <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span className="text-muted-foreground">
                        Creating smart account...
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
