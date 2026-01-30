

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '@/utils/supabase';
import Navbar from '@/components/Navbar';
import PriceChart from '@/components/PriceChart';
import { usePriceHistory } from '@/hooks/usePriceHistory';
import { useAlerts } from '@/hooks/useAlerts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Bell, ExternalLink, RefreshCw, Trash2, TrendingDown, Clock, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { useProducts } from '@/hooks/useProducts';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const { history } = usePriceHistory(id);
    const { alert, setTargetPrice } = useAlerts(id);
    const { scrapeProduct } = useProducts(); 
    
    // Local state for form
    const [targetInput, setTargetInput] = useState('');
    const [isTitleExpanded, setIsTitleExpanded] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .single();
                
                if (error) throw error;
                setProduct(data);
            } catch (error) {
                console.error("Error fetching product:", error);
                toast.error("Product not found");
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, navigate]);

    useEffect(() => {
        if (alert) {
            setTargetInput(alert.target_price.toString());
        }
    }, [alert]);

    const handleRefresh = async () => {
        if (!product) return;
        toast.info("Updating price...");
        try {
            await scrapeProduct(product.id, product.url);
            // Manually refresh product data to see update immediately
             const { data } = await supabase.from('products').select('*').eq('id', id).single();
             if(data) setProduct(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSetAlert = async (e) => {
        e.preventDefault();
        const price = parseFloat(targetInput);
        if (isNaN(price) || price <= 0) {
            toast.error("Please enter a valid positive price");
            return;
        }
        await setTargetPrice(price);
    };

    if (loading) return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground animate-pulse">Loading Product Data...</p>
            </div>
        </div>
    );
    
    if (!product) return null;

    const currencySymbol = product.currency === 'INR' ? '₹' : (product.currency === 'USD' ? '$' : product.currency);
    const hostname = new URL(product.url).hostname.replace('www.', '');

    return (
        <div className="min-h-screen bg-black text-foreground pb-20 selection:bg-orange-500/30 overflow-hidden relative">
            <Navbar />
            
             {/* --- Ambient Background --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        {/* Glow Orbs */}
        <div className="absolute top-0 transform -translate-x-1/2 left-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-40 mix-blend-screen animate-pulse duration-[10s]" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] opacity-20" />
      </div>

            <main className="max-w-7xl mx-auto px-6 pt-24 space-y-8 relative z-10">
                
                {/* Back Button */}
                <Button variant="ghost" className="pl-0 text-muted-foreground hover:text-white" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft className="mr-2 size-4" /> Back to Dashboard
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    
                    {/* Left Column: Image & Quick Stats */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Image Card */}
                        <div className="relative aspect-square rounded-3xl bg-neutral-900/50 border border-white/10 overflow-hidden group shadow-2xl">
                             <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent opacity-50 pointer-events-none" />
                             {product.image_url ? (
                                <img 
                                    src={product.image_url} 
                                    alt={product.title} 
                                    className="w-full h-full object-contain p-8 mix-blend-normal hover:scale-105 transition-transform duration-700 ease-out"
                                />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <span className="text-6xl font-bold opacity-10">IMG</span>
                                </div>
                             )}
                             
                             {/* Floating Status Badge */}
                             <div className="absolute top-4 left-4">
                                <Badge variant="secondary" className="backdrop-blur-xl bg-black/40 border-white/10 text-white px-3 py-1">
                                    {hostname}
                                </Badge>
                             </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-white/5 border-white/5 backdrop-blur-sm">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                        <Clock className="size-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-muted-foreground font-semibold">Last Checked</p>
                                        <p className="text-sm font-medium">{product.last_checked_at ? formatDistanceToNow(new Date(product.last_checked_at), { addSuffix: true }) : 'Just now'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white/5 border-white/5 backdrop-blur-sm">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                                        <ShieldCheck className="size-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-muted-foreground font-semibold">Track Status</p>
                                        <p className="text-sm font-medium text-green-400">Active Agent</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Right Column: Details, Chart, Actions */}
                    <div className="lg:col-span-7 space-y-8">
                        
                        {/* Title Header with Collapsible Logic */}
                        <div className="space-y-4">
                            <div className="relative">
                                <h1 className={`text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent leading-tight transition-all duration-300 ${!isTitleExpanded ? 'line-clamp-1' : ''}`}>
                                    {product.title}
                                </h1>
                                {product.title.length > 50 && (
                                    <button 
                                        onClick={() => setIsTitleExpanded(!isTitleExpanded)}
                                        className="text-xs text-primary hover:text-primary/80 mt-1 font-medium focus:outline-none"
                                    >
                                        {isTitleExpanded ? '- Show Less' : '+ Show More'}
                                    </button>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3">
                                <Button className="h-8 rounded-full bg-white/5 hover:bg-white/10 text-xs gap-2 border border-white/10 text-muted-foreground hover:text-white" onClick={() => window.open(product.url, '_blank')}>
                                    <ExternalLink className="size-3" /> Visit Website
                                </Button>
                                <Button className="h-8 rounded-full bg-white/5 hover:bg-white/10 text-xs gap-2 border border-white/10 text-muted-foreground hover:text-white" onClick={() => navigate(`/product/${id}/logs`)}>
                                    <TrendingDown className="size-3" /> Scrape Logs
                                </Button>
                            </div>
                        </div>

                        {/* Price Display */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-neutral-900 to-black border border-primary/20 relative overflow-hidden group">
                             <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/20 blur-[60px] rounded-full group-hover:bg-primary/30 transition-colors duration-500" />
                             
                             <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                                 <div>
                                     <p className="text-sm uppercase tracking-wider text-muted-foreground font-medium mb-1">Current Price</p>
                                     <div className="text-5xl md:text-6xl font-mono font-bold text-primary tracking-tighter flex items-start gap-1">
                                        <span className="text-2xl md:text-3xl mt-2 opacity-60 font-normal">{currencySymbol}</span>
                                        {product.current_price?.toLocaleString()}
                                    </div>
                                 </div>
                                 
                                 <Button size="lg" className="bg-white text-black hover:bg-neutral-200 font-semibold shadow-lg shadow-white/5 transition-transform hover:scale-105 active:scale-95" onClick={handleRefresh}>
                                     <RefreshCw className="mr-2 size-4" /> Check Now
                                 </Button>
                             </div>
                        </div>

                        {/* Chart */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <TrendingDown className="size-5 text-primary" /> Price History
                            </h2>
                            <div className=" w-full bg-neutral-900/30 border border-white/5 rounded-2xl p-4 overflow-hidden relative group">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                <PriceChart history={history} currency={product.currency} />
                            </div>
                        </div>

                        {/* Alert Config */}
                        <div className="p-6 rounded-2xl bg-neutral-900/30 border border-white/10 backdrop-blur-sm">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-3 bg-neutral-800 rounded-xl">
                                    <Bell className="size-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Price Alerts</h3>
                                    <p className="text-muted-foreground text-sm">Get notified instantly when the price triggers.</p>
                                </div>
                            </div>
                            
                            <form onSubmit={handleSetAlert} className="flex gap-4">
                                <div className="relative flex-1 max-w-sm">
                                    <span className="absolute left-4 top-3 text-muted-foreground">{currencySymbol}</span>
                                    <Input 
                                        type="number" 
                                        step="0.01" 
                                        min="0"
                                        placeholder="0.00" 
                                        className="pl-9 h-12 bg-black/40 border-white/10 focus:border-primary/50 text-lg font-mono placeholder:text-neutral-700"
                                        value={targetInput}
                                        onChange={(e) => setTargetInput(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" size="lg" className="h-12 px-8">
                                    {alert ? 'Update Target' : 'Set Target'}
                                </Button>
                            </form>
                            
                            {alert && (
                                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                                    <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                                    Active Target: <span className="font-mono font-bold">{currencySymbol}{alert.target_price}</span>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProductDetailsPage;


