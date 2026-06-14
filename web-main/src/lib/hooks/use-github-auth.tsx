import { useState, useEffect, useRef } from "react";
import { UseGithubAuthReturn } from "@/utils/types";
import { toast } from "sonner";

const CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

export const useGithubAuth = (onLogout?: () => void): UseGithubAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkTrigger, setCheckTrigger] = useState(0);
  const [isExchangingCode, setIsExchangingCode] = useState(false);
  const processedCodes = useRef(new Set<string>());

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = sessionStorage.getItem("accessToken");
      if (accessToken) {
        setIsAuthenticated(true);
        return;
      }
      
      const codeParam = sessionStorage.getItem("code");
      const codeTimestamp = sessionStorage.getItem("code_timestamp");
      
      if (codeParam && !isExchangingCode && !processedCodes.current.has(codeParam)) {
        const now = Date.now();
        const codeAge = codeTimestamp ? now - parseInt(codeTimestamp) : 0;
        const TEN_MINUTES = 10 * 60 * 1000;
        
        if (codeAge > TEN_MINUTES) {
          sessionStorage.removeItem("code");
          sessionStorage.removeItem("code_timestamp");
          toast.error("Authentication code expired. Please try connecting again.");
          return;
        }
        
        processedCodes.current.add(codeParam);
        setIsExchangingCode(true);
        sessionStorage.removeItem("code");
        sessionStorage.removeItem("code_timestamp");
        
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_ZK_BACKEND_GET_ACCESS_TOKEN}?code=${codeParam}`,
            {
              method: "GET",
            }
          );
          const data = await response.json();

          if (data.success && data.data?.access_token) {
            sessionStorage.setItem("accessToken", data.data.access_token);
            setIsAuthenticated(true);
            toast.success("Successfully connected to GitHub");

            window.dispatchEvent(new CustomEvent("githubAuthUpdate"));

            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
          } else if (data.access_token) {
            sessionStorage.setItem("accessToken", data.access_token);
            setIsAuthenticated(true);
            toast.success("Successfully connected to GitHub");

            window.dispatchEvent(new CustomEvent("githubAuthUpdate"));

            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
          } else {
            console.log("API Response:", data);
            toast.error(data.error || "GitHub authentication failed");
          }
        } catch (error) {
          console.error("Error getting access token:", error);
          toast.error("Failed to authenticate with GitHub");
        } finally {
          setIsExchangingCode(false);
        }
      }
    };

    checkAuth();
    
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [checkTrigger]);
  
  useEffect(() => {
    const handleFocus = () => {
      setCheckTrigger(prev => prev + 1);
    };
    
    const handleAuthUpdate = () => {
      setCheckTrigger(prev => prev + 1);
    };
    
    window.addEventListener("focus", handleFocus);
    window.addEventListener("githubAuthUpdate", handleAuthUpdate);
    
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("githubAuthUpdate", handleAuthUpdate);
    };
  }, []);

  const loginWithGithub = () => {
    window.location.assign(
      `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}`
    );
    toast.warning("Please complete GitHub authentication in the new window");
    
  };

  const logout = () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("code");
    sessionStorage.removeItem("code_timestamp");
    processedCodes.current.clear();
    setIsAuthenticated(false);
    setIsExchangingCode(false);
    onLogout?.();
    window.dispatchEvent(new CustomEvent("githubAuthUpdate"));
    toast.success("Logout GitHub Successfully");
  };

  return {
    isAuthenticated,
    loginWithGithub,
    logout,
  };
};
