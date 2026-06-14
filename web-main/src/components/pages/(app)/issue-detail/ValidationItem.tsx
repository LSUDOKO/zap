import Lottie from "lottie-react";
import destinationAnimation from "../../../../../public/images/Animation/destination-animation.json";
import deliveryAnimation from "../../../../../public/images/Animation/delivery-animation.json";

interface ValidationItemProps {
  label: string;
  isValid: boolean;
}

export default function ValidationItem({ label, isValid }: ValidationItemProps) {
  const getAnimation = () => {
    if (label === "Pull Request Merged") {
      return deliveryAnimation;
    }
    return destinationAnimation;
  };

  return (
    <div className="flex justify-between items-center p-3 border-b border-gray-100 last:border-none">
      <span className="font-medium text-gray-900">{label}</span>
      <div className={`flex items-center gap-3 font-medium ${
        isValid ? "text-green-600" : "text-red-600"
      }`}>
        <div className="w-6 h-6">
          {isValid && (
            <Lottie
              animationData={getAnimation()}
              loop={true}
              autoplay={true}
            />
          )}
          {!isValid && (
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 text-xs font-bold">✗</span>
            </div>
          )}
        </div>
        <span>{isValid ? "Valid" : "Invalid"}</span>
      </div>
    </div>
  );
}