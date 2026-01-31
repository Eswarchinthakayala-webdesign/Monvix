import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Logo from "../components/Logo";
import supabase from "../utils/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();
  const hasHandledAuth = useRef(false);

  useEffect(() => {
    if (hasHandledAuth.current) return; // run only once
    hasHandledAuth.current = true;

    async function handleAuth() {
      try {
        const hash = window.location.hash;

        if (!hash) {
          // No OAuth tokens in URL, redirect to login
          navigate("/login");
          return;
        }

        // Parse URL hash params (after '#')
        const params = new URLSearchParams(hash.substring(1));
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        const expires_in = params.get("expires_in");
        const token_type = params.get("token_type");

        if (!access_token || !refresh_token) {
          toast.error("Authentication tokens not found in URL", { duration: 3000 });
          navigate("/login");
          return;
        }

        // Set session using Supabase client
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
          expires_in: expires_in ? Number(expires_in) : undefined,
          token_type,
        });

        if (error) {
          toast.error("Failed to set session", { 
            duration: 3000, 
            description: error.message 
          });
          navigate("/login");
          return;
        }

        // Clear URL hash to avoid re-processing on reload
        window.history.replaceState(null, "", window.location.pathname + window.location.search);

        // Get current session info
        const sessionResponse = await supabase.auth.getSession();
        const session = sessionResponse.data.session;

        if (!session) {
          toast.error("Session not found after login", { duration: 3000 });
          navigate("/login");
          return;
        }

        const user = session.user;
        // Show name if exists, otherwise show email
        const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email || "User";

        toast.success("Login successful", {
          duration: 2000,
          description: `Welcome back, ${userName}`
        });

        // Navigate to dashboard SPA-style
        navigate("/dashboard");
      } catch (err) {
        toast.error("Unexpected error", {
          duration: 3000,
          description: err.message || String(err)
        });
        navigate("/login");
      }
    }

    handleAuth();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background/50 backdrop-blur-sm">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
        <Logo className="scale-150 mb-8 relative z-10" withText={false} />
      </div>
      <div className="flex flex-col items-center gap-2 mt-8">
        <div className="h-1.5 w-32 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-progress origin-left" />
        </div>
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          Authenticating...
        </p>
      </div>
    </div>
  );
}