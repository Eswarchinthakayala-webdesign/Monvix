import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/utils/supabase';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Bell, ArrowRight, CheckCheck, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const NotificationsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            // Join with Products to get title/image
            const { data, error } = await supabase
                .from('alerts')
                .select(`
                    id, 
                    target_price, 
                    triggered_at, 
                    product:products (id, title, image_url, current_price, currency)
                `)
                .eq('user_id', user.id)
                .eq('triggered', true)
                .order('triggered_at', { ascending: false });

            if (error) throw error;
            setNotifications(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [user]);

    const handleDismiss = async (e, id) => {
        e.stopPropagation();
        try {
            // Disable and un-trigger the alert to "dismiss" it from the list
            await supabase
                .from('alerts')
                .update({ triggered: false, enabled: false })
                .eq('id', id);
            
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success("Alert dismissed");
        } catch (error) {
            console.error("Error dismissing alert:", error);
            toast.error("Failed to dismiss");
        }
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

    const unreadCount = notifications.length;

    return (
        <div className="min-h-screen bg-black text-foreground pb-20 selection:bg-orange-500/30 overflow-hidden relative">
            <Navbar />
            
             {/* --- Ambient Background --- */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
            </div>

            <main className="max-w-7xl mx-auto px-6 pt-32 space-y-8 relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
                            <span className="bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">Alert Center</span>
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            You have <span className="text-primary font-bold">{unreadCount}</span> active price triggers.
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button 
                            variant="outline" 
                            className="border-white/10 hover:bg-white/10 text-xs uppercase tracking-wider gap-2"
                            onClick={() => {
                                // Logic to dismiss all could go here
                                notifications.forEach(n => handleDismiss({stopPropagation:()=>{}}, n.id));
                            }}
                        >
                            <CheckCheck className="size-4" /> Clear All
                        </Button>
                    )}
                </div>

                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/10 rounded-3xl bg-black/40 backdrop-blur-sm">
                            <div className="size-20 bg-white/5 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10">
                                <Bell className="size-10 text-muted-foreground opacity-30" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-white">All caught up</h3>
                            <p className="text-muted-foreground text-center max-w-sm">
                                No price alerts triggered yet. Set targets on products to get notified here.
                            </p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div 
                                key={notif.id} 
                                onClick={() => navigate(`/product/${notif.product?.id}`)}
                                className="group relative flex flex-col md:flex-row items-start md:items-center gap-6 p-6 rounded-3xl border border-white/5 bg-neutral-900/50 backdrop-blur-md hover:bg-white/[0.03] hover:border-primary/20 transition-all duration-500 cursor-pointer overflow-hidden shadow-2xl"
                            >
                                {/* Glow Effect on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

                                {/* Product Image */}
                                <div className="relative size-20 md:size-24 shrink-0 rounded-2xl overflow-hidden bg-white p-2 shadow-lg group-hover:scale-105 transition-transform duration-500">
                                    <img 
                                        src={notif.product?.image_url} 
                                        alt={notif.product?.title} 
                                        className="h-full w-full object-contain"
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex items-start justify-between gap-4">
                                        <h4 className="text-lg font-bold text-white truncate w-full group-hover:text-primary transition-colors">
                                            {notif.product?.title || "Unknown Product"}
                                        </h4>
                                        <div className="flex shrink-0 gap-2">
                                             <Button 
                                                variant="ghost" 
                                                size="icon"
                                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                                                onClick={(e) => handleDismiss(e, notif.id)}
                                            >
                                                <CheckCheck className="size-4" />
                                            </Button>
                                            <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(249,115,22,0.8)] animate-pulse mt-3" />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Clock className="size-3.5" /> 
                                            <span className="font-mono text-xs">{format(new Date(notif.triggered_at), 'MMM d, p')}</span>
                                        </div>
                                        <div className="h-1 w-1 rounded-full bg-white/20 hidden md:block" />
                                         <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Target: ${notif.target_price}</span>
                                    </div>
                                    
                                    <div className="pt-2 flex items-center gap-3">
                                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 px-3 py-1 text-sm font-mono gap-2 transition-colors">
                                            <ArrowRight className="size-3 rotate-45" />
                                            Detected: ${notif.product?.current_price}
                                        </Badge>
                                        <span className="text-xs text-green-500/60 font-medium">
                                            {notif.target_price > 0 && notif.product?.current_price <= notif.target_price && "Price Drop Alert!"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default NotificationsPage;
