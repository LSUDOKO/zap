export const formatTokenAmount = (amount: string | number): string => {
  if (!amount) return "0";
  
  const amountStr = amount.toString();
  const amountBigInt = BigInt(amountStr);
  const divisor = BigInt("1000000000000000000");
  
  const wholePart = amountBigInt / divisor;
  const remainder = amountBigInt % divisor;
  
  if (remainder === BigInt(0)) {
    return wholePart.toString();
  }
  
  const decimal = remainder.toString().padStart(18, "0");
  const trimmedDecimal = decimal.replace(/0+$/, "");
  
  return trimmedDecimal.length > 0 
    ? `${wholePart.toString()}.${trimmedDecimal}` 
    : wholePart.toString();
};