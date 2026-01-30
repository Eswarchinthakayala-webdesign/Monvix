import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Calendar, Mail, User, Shield, Clock, ExternalLink, LogOut, Edit2, Save, X, Camera } from 'lucide-react';
import { format } from 'date-fns';
import supabase from '@/utils/supabase';
import { toast } from 'sonner';

const ProfilePage = () => {
    const { user, loading, signOut } = useAuth(); // Assuming useAuth provides signOut
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(user?.user_metadata?.full_name || "");
    const [updateLoading, setUpdateLoading] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                 <div className="flex flex-col items-center gap-4">
                    <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse">Loading Profile...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    // Extract Data safely
    // Note: user_metadata is where Supabase Auth stores user editable fields typically
    const fullName = user.user_metadata?.full_name || "User";
    const email = user.email;
    const avatarUrl = user.user_metadata?.avatar_url;
    const provider = user.app_metadata?.provider || 'email';
    const createdAt = user.created_at ? format(new Date(user.created_at), 'PPP') : 'Unknown';
    const lastSignIn = user.last_sign_in_at ? format(new Date(user.last_sign_in_at), 'PPP p') : 'Unknown';

    const handleUpdateProfile = async () => {
        if (!newName.trim()) return toast.error("Name cannot be empty");
        
        setUpdateLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: newName }
            });

            if (error) throw error;
            
            toast.success("Profile updated successfully");
            setIsEditing(false);
            // Ideally force a refresh or update local state context, window reload for simplicity if context doesn't auto-update
            window.location.reload(); 
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            window.location.href = '/login'; // Force redirect
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Error logging out");
        }
    };

    return (
        <div className="min-h-screen bg-black text-foreground pb-20 selection:bg-orange-500/30 overflow-hidden relative">
            <Navbar />
            
             {/* --- Ambient Background --- */}
             <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
            </div>

            <main className="max-w-7xl mx-auto px-6 pt-32 space-y-8 relative z-10">
                
                {/* Header Profile Section */}
                <Card className="bg-black/40 border-white/10 overflow-hidden relative backdrop-blur-xl shadow-2xl group hover:border-white/20 transition-colors">
                    <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-primary/20 via-orange-500/10 to-purple-500/0 opacity-50" />
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 blur-[80px] rounded-full" />
                    
                    <CardContent className="relative pt-12 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 px-8">
                        {/* Avatar */}
                        <div className="relative group/avatar">
                            <div className="absolute -inset-0.5 bg-gradient-to-br from-primary to-purple-600 rounded-full opacity-75 blur opacity-0 group-hover/avatar:opacity-100 transition duration-500" />
                            <Avatar className="h-32 w-32 border-4 border-black shadow-2xl relative">
                                <AvatarImage src={avatarUrl} alt={fullName} className="object-cover" />
                                <AvatarFallback className="bg-neutral-800 text-3xl font-bold text-white">
                                    {fullName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-1 right-1 bg-black rounded-full p-1 border border-white/10 cursor-pointer hover:scale-110 transition-transform">
                                <div className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20">
                                    <Camera className="size-4 text-white" />
                                </div>
                            </div>
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 text-center md:text-left space-y-2 mb-2">
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                {isEditing ? (
                                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4">
                                        <Input 
                                            value={newName} 
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="h-9 w-64 bg-white/5 border-white/10 text-lg font-bold"
                                            placeholder="Enter full name"
                                            autoFocus
                                        />
                                        <Button size="icon" className="h-9 w-9 bg-primary hover:bg-primary/90" onClick={handleUpdateProfile} disabled={updateLoading}>
                                            <Save className="size-4" />
                                        </Button>
                                         <Button size="icon" variant="ghost" className="h-9 w-9 hover:bg-white/10" onClick={() => setIsEditing(false)}>
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <h1 className="text-4xl font-bold text-white tracking-tight">{fullName}</h1>
                                        <button 
                                            onClick={() => {
                                                setNewName(fullName);
                                                setIsEditing(true);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary p-1"
                                        >
                                            <Edit2 className="size-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm">
                                <Badge variant="outline" className="border-white/10 bg-white/5 text-muted-foreground capitalize flex items-center gap-1.5 px-3 py-1">
                                    <Shield className="size-3" /> {provider}
                                </Badge>
                                <div className="h-1 w-1 rounded-full bg-white/20 hidden md:block" />
                                <span className="text-muted-foreground font-mono">{email}</span>
                                {user.email_confirmed_at && (
                                     <Badge variant="outline" className="border-green-500/20 text-green-500 bg-green-500/5 px-2 py-0.5 text-xs gap-1">
                                        Verified
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Logout Button */}
                         <div className="flex flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
                            <Button 
                                variant="destructive" 
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 gap-2 w-full md:w-auto"
                                onClick={handleLogout}
                            >
                                <LogOut className="size-4" /> Sign Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Details Grid */}
                <div className="grid md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-backwards">
                    {/* Account Stats */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <User className="size-5 text-primary" /> Identity & Security
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors">
                                <div className="p-2.5 rounded-lg bg-neutral-900 border border-white/5 group-hover:border-primary/20 transition-colors">
                                    <Mail className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                     <p className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold mb-0.5">Contact Email</p>
                                     <p className="font-mono text-sm truncate text-white/90">{email}</p>
                                </div>
                            </div>
                            
                             <div className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors">
                                <div className="p-2.5 rounded-lg bg-neutral-900 border border-white/5 group-hover:border-primary/20 transition-colors">
                                    <Shield className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                     <p className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold mb-0.5">User ID</p>
                                     <p className="font-mono text-xs truncate text-muted-foreground/80">{user.id}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Clock className="size-5 text-primary" /> Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative pl-4 border-l border-white/10 space-y-6 ml-2">
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-black" />
                                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold mb-0.5">Current Session</p>
                                    <p className="font-medium text-white flex items-center gap-2">
                                        {lastSignIn}
                                        <span className="inline-block w-2 H-2 rounded-full bg-green-500 animate-pulse" />
                                    </p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-white/20 ring-4 ring-black" />
                                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold mb-0.5">Joined On</p>
                                    <p className="font-medium text-white/60">{createdAt}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </main>
        </div>
    );
};

export default ProfilePage;
