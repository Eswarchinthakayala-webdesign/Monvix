import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'sonner';
import { useAuth } from "../context/AuthContext";
import PremiumLoader from "../components/PremiumLoader";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { handleAuthCallback } = useAuth();
  const hasHandledAuth = useRef(false);

  useEffect(() => {
    if (hasHandledAuth.current) return; // run only once
    hasHandledAuth.current = true;

    async function processAuth() {
      const result = await handleAuthCallback();
      if (result.success) {
        toast.success("Login successful");
        navigate("/dashboard");
      } else {
        toast.error(result.error || "Authentication failed");
        navigate("/login");
      }
    }

    processAuth();
  }, [navigate, handleAuthCallback]);

  return <PremiumLoader isVisible={true} text="Finalizing Authentication..." />;
}