"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "./button";
import Image from "next/image";
import { useWallet } from "@/lib/hooks/use-wallet";
import { useBalance } from "@/lib/hooks/use-balance";
import { formatUnits } from "viem";

export default function WalletConnect() {
  const { address } = useWallet();
  const { MantleUSDCBalance } = useBalance(address || "");

  const formattedBalance = () => {
    if (!MantleUSDCBalance) return "0";

    try {
      const balanceBigInt = BigInt(MantleUSDCBalance.toString());
      return parseInt(formatUnits(balanceBigInt, 18));
    } catch (error) {
      console.error("Error formatting balance:", error);
      return "0";
    }
  };

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
                <div className="flex gap-2">
                  <Button
                    onClick={openAccountModal}
                    type="button"
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span>{account.displayName}</span>
                      {account.displayBalance && (
                        <>
                          <span>({account.displayBalance})</span>
                        </>
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
                        src="/images/Logo/mantle-usd-logo.webp"
                        alt="mUSD"
                        width={16}
                        height={16}
                        className="object-contain"
                      />
                      <span>mUSD</span>
                    </div>
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
