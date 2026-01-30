import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { toast } from 'sonner';

const LoginPage = () => {
  const { loginWithGoogle, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
    } catch (error) {
      toast.error('Failed to login with Google');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px]" />
        </div>

      <Card className="w-full max-w-md bg-black/50 backdrop-blur-xl border-white/10 shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-4 pt-10">
            <div className="flex justify-center mb-2">
                <Logo className="h-12 w-auto" />
            </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription className="text-base">
            Sign in to your Pricelyt account to start tracking prices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-10 px-8">
            <div className="grid gap-4">
                <Button 
                    variant="outline" 
                    className="h-12 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white relative overflow-hidden group transition-all"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Connecting...
                        </span>
                    ) : (
                        <span className="flex items-center gap-3">
                            <img src="/google.svg" alt="Google" className="w-5 h-5" />
                            Continue with Google
                        </span>
                    )}
                </Button>
            </div>
          
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-black/50 px-2 text-muted-foreground">Secure Authentication</span>
                </div>
            </div>

            <p className="px-8 text-center text-sm text-muted-foreground">
                By clicking continue, you agree to our <Link to="#" className="underline hover:text-white">Terms of Service</Link> and <Link to="#" className="underline hover:text-white">Privacy Policy</Link>.
            </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
