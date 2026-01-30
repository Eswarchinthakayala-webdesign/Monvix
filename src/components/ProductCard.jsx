import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, ExternalLink, MoreVertical, Trash2, TrendingDown, ArrowUpRight, Download } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useProducts } from '@/hooks/useProducts';
import { usePriceHistory } from '@/hooks/usePriceHistory';
import { useAlerts } from '@/hooks/useAlerts';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const ProductCard = ({ product }) => {
    const { deleteProduct } = useProducts();
    const { history } = usePriceHistory(product.id);
    const { alert, setTargetPrice } = useAlerts(product.id);
    
    // Calculate simple price trend
    const latestPrice = history.length > 0 ? history[history.length - 1].price : product.current_price;
    const startPrice = history.length > 0 ? history[0].price : product.current_price;
    const isPriceDown = latestPrice < startPrice;
    const dropPercentage = startPrice > 0 ? ((startPrice - latestPrice) / startPrice) * 100 : 0;

    const hostname = (() => {
        try {
            return new URL(product.url).hostname.replace('www.','');
        } catch {
            return 'Unknown Site';
        }
    })();

    const handleDownloadImage = async (e) => {
        e.stopPropagation();
        if (!product.image_url) return;
        
        toast.info("Downloading image...");
        try {
            const response = await fetch(product.image_url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `pricelyt-${product.title.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed:", error);
            // Fallback for CORS issues
            window.open(product.image_url, '_blank');
        }
    };
    
    return (
        <div className="group relative w-full h-auto min-h-[320px] flex flex-col">
            {/* Pulsing Glow Background on Hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/30 to-purple-600/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500 will-change-[opacity]" />
            
            {/* Main Card */}
            <Card className="relative flex flex-col flex-grow overflow-hidden bg-black/80 border-white/10 backdrop-blur-xl rounded-2xl hover:border-primary/50 transition-all duration-300 group-hover:-translate-y-1 shadow-2xl h-full">
                
                {/* Clickable Overlay */}
                <Link to={`/product/${product.id}`} className="absolute inset-0 z-0 cursor-pointer" aria-label={`View ${product.title}`} />

                {/* Image Section */}
                <div className="relative h-44 w-full bg-gradient-to-b from-white/[0.03] to-transparent overflow-hidden shrink-0">
                    {/* Badge Overlay */}
                    <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-black/60 backdrop-blur-md border-primary/40 text-primary text-[10px] uppercase tracking-wider font-semibold shadow-lg">
                            {hostname}
                        </Badge>
                        {isPriceDown && (
                            <Badge variant="default" className="bg-green-500/90 hover:bg-green-500 text-white border-green-500/50 text-[10px] gap-1 px-1.5 font-bold shadow-[0_0_10px_rgba(34,197,94,0.4)] animate-pulse">
                                <TrendingDown className="size-3" /> {dropPercentage.toFixed(0)}%
                            </Badge>
                        )}
                    </div>

                    {/* Actions Menu */}
                    <div className="absolute top-3 right-3 z-20">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full border border-white/5 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                                    <MoreVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-neutral-900/95 border-white/10 backdrop-blur-xl w-48">
                                <DropdownMenuItem className="focus:bg-white/10 cursor-pointer" onClick={handleDownloadImage}>
                                    <Download className="mr-2 size-4" /> Save Image
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer" onClick={(e) => { e.stopPropagation(); deleteProduct(product.id); }}>
                                    <Trash2 className="mr-2 size-4" /> Stop Tracking
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Image */}
                    {product.image_url ? (
                        <div className="w-full h-full p-6 flex items-center justify-center">
                             <div className="absolute inset-0 bg-radial-gradient from-white/10 to-transparent opacity-20 pointer-events-none" />
                            <img 
                                src={product.image_url} 
                                alt={product.title} 
                                className="relative z-10 max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-500 ease-out"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-white/[0.02]">
                            <span className="text-4xl opacity-10 font-bold select-none">IMG</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <CardContent className="flex-1 p-5 flex flex-col justify-between relative z-10">
                    <div className="space-y-2">
                        <h3 className="font-medium text-base leading-snug text-white/90 line-clamp-2 min-h-[2.75rem] group-hover:text-primary transition-colors" title={product.title}>
                            {product.title}
                        </h3>
                        {/* Last Checked */}
                        <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                             <div className={`h-1.5 w-1.5 rounded-full ${product.is_active ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)]' : 'bg-neutral-500'}`} />
                             <span className="opacity-70">Sync: {product.last_checked_at ? formatDistanceToNow(new Date(product.last_checked_at), { addSuffix: true }) : 'Never'}</span>
                        </div>
                    </div>

                    <div className="pt-4 flex items-end justify-between border-t border-white/5 mt-auto">
                        <div>
                             <p className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider mb-0.5">Price</p>
                             <div className="text-2xl font-bold font-mono text-primary flex items-baseline gap-1">
                                <span className="text-sm font-normal text-muted-foreground align-top mt-1">{product.currency === 'USD' ? '$' : product.currency}</span>
                                {product.current_price?.toLocaleString()}
                            </div>
                        </div>
                        
                        {/* Quick Actions - Visit Button */}
                        <div className="absolute right-4 bottom-4 z-20 transition-all duration-300 opacity-100 translate-x-0 lg:opacity-0 lg:translate-x-2 lg:group-hover:opacity-100 lg:group-hover:translate-x-0">
                             <Button 
                                size="icon" 
                                className="h-10 w-10 rounded-full bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-transform hover:scale-110"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.open(product.url, '_blank', 'noopener,noreferrer');
                                }}
                                title="Visit Website"
                             >
                                <ArrowUpRight className="size-5 font-bold" />
                             </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProductCard;
