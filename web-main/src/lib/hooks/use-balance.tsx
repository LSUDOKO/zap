import { MANTLE_USD_ADDRESS, MANTLE_USD_ABI } from "@/config/const";
import { useReadContract } from "wagmi";

export const useBalance = (address: string) => {
  const { data: MantleUSDCBalance } = useReadContract({
    address: MANTLE_USD_ADDRESS,
    abi: MANTLE_USD_ABI,
    functionName: "balanceOf",
    args: [address],
  });

  return {
    MantleUSDCBalance,
  };
};
