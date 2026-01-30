import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const LogoutButton = ({ className, variant = "ghost" }) => {
    const { logout } = useAuth();
    
    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Signed out successfully");
        } catch (error) {
            toast.error("Error signing out");
        }
    };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} className={`text-muted-foreground hover:text-red-500 gap-2 ${className}`}>
            <LogOut className="size-4" />
            <span>Sign Out</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-black/90 border-white/10 backdrop-blur-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out of Monvix?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to sign out? You will need to sign in again to access your dashboard.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">Sign Out</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutButton;
