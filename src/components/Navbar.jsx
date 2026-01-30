import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Bell } from 'lucide-react';
import { useEffect, useState } from "react";
import supabase from "@/utils/supabase";

const Navbar = () => {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Fetch initial count of triggered alerts
    const fetchUnread = async () => {
        const { count } = await supabase
            .from('alerts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('triggered', true)
            // .eq('read', false) // Column missing in DB
        setUnreadCount(count || 0);
    };

    fetchUnread();

    // Subscribe to changes in alerts table for real-time badge updates
    const sub = supabase
        .channel('nav-alerts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts', filter: `user_id=eq.${user.id}` }, () => {
            fetchUnread();
        })
        .subscribe();

    return () => {
        supabase.removeChannel(sub);
    };
  }, [user]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="group">
          <Logo className="h-10 w-fit" />
        </Link>

      

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          {loading ? (
             <div className="h-10 w-24 bg-white/5 animate-pulse rounded-md" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <Link to="/notifications" className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
                    <Bell className="size-5 text-muted-foreground hover:text-white" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-pulse" />
                    )}
                </Link>

                {!isDashboard && (
                    <Link to="/dashboard">
                        <Button variant="ghost" className="hidden sm:flex hover:text-primary">
                            Dashboard
                        </Button>
                    </Link>
                )}
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10 border border-white/10 hover:border-primary/50 transition-colors">
                                <AvatarImage src={user?.profile?.avatar_url || user?.user_metadata?.avatar_url} alt={user?.email} />
                                <AvatarFallback className="bg-primary/20 text-primary font-bold">
                                    {user?.email?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-black border-white/10" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                             <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none text-white">
                                    {user?.profile?.full_name || user?.user_metadata?.full_name || 'User'}
                                </p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10"/>
                        <Link to="/profile">
                            <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                        </Link>
                         <DropdownMenuItem 
                            className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
                            onClick={logout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          ) : (
             <>
                <Link to="/login">
                    <Button variant="ghost" className="hidden sm:flex hover:text-primary hover:bg-primary/10">
                    Sign In
                    </Button>
                </Link>
                <Link to="/signup">
                    <Button className="font-semibold shadow-lg shadow-primary/20">
                    Get Started
                    </Button>
                </Link>
             </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
