import { USD_TOKEN_ADDRESS, USD_TOKEN_ABI } from "@/config/const";
import { useReadContract } from "wagmi";

export const useBalance = (address: string) => {
  const { data: tokenBalance } = useReadContract({
    address: USD_TOKEN_ADDRESS,
    abi: USD_TOKEN_ABI,
    functionName: "balanceOf",
    args: [address],
  });

  return {
    tokenBalance,
  };
};
