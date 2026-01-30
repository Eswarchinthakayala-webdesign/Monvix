import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '@/utils/supabase';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Terminal, ChevronRight, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const ScrapeDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productTitle, setProductTitle] = useState('Product');
    const [isTitleExpanded, setIsTitleExpanded] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Product Name
                const { data: product, error: productError } = await supabase
                    .from('products')
                    .select('title')
                    .eq('id', id)
                    .single();
                
                if (product) setProductTitle(product.title);

                // Fetch Logs
                const { data, error } = await supabase
                    .from('scrape_logs')
                    .select('*')
                    .eq('product_id', id)
                    .order('attempted_at', { ascending: false });

                if (error) throw error;
                setLogs(data || []);
            } catch (error) {
                console.error("Error fetching logs:", error);
                toast.error("Failed to load scrape logs");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

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
            
            <main className="max-w-7xl mx-auto px-4 md:px-6 pt-24 space-y-6 md:space-y-8 relative z-10">
                {/* Header */}
                <div className="flex items-center gap-4">
                     <Button variant="ghost" className="pl-0 text-muted-foreground hover:text-white" onClick={() => navigate(`/product/${id}`)}>
                        <ArrowLeft className="mr-2 size-4" /> Back to Product
                    </Button>
                </div>
                
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
                            <span className="bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent">Execution Logs</span>
                        </h1>
                        <div className="text-muted-foreground flex items-start gap-2 text-base md:text-lg">
                            <Activity className="size-5 text-primary mt-1 shrink-0" />
                            <div className="flex-1">
                                <span>Live agent history for:</span>
                                <div className={`text-white font-medium mt-1 transition-all duration-300 ${!isTitleExpanded ? 'line-clamp-1' : ''}`}>
                                    {productTitle}
                                </div>
                                {productTitle.length > 50 && (
                                    <button 
                                        onClick={() => setIsTitleExpanded(!isTitleExpanded)}
                                        className="text-xs text-primary hover:text-primary/80 mt-1 font-medium focus:outline-none"
                                    >
                                        {isTitleExpanded ? '- Show Less' : '+ Show More'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
                        <Card className="bg-white/5 border-white/10 backdrop-blur-md px-4 py-3 flex items-center gap-3">
                            <div className="size-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                            <div>
                                <div className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold whitespace-nowrap">Total Runs</div>
                                <div className="text-xl font-mono font-bold leading-none">{logs.length}</div>
                            </div>
                        </Card>
                        <Card className="bg-white/5 border-white/10 backdrop-blur-md px-4 py-3 flex items-center gap-3">
                            <div className="size-2 rounded-full bg-primary shrink-0" />
                            <div>
                                <div className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold whitespace-nowrap">Success Rate</div>
                                <div className="text-xl font-mono font-bold leading-none text-primary">
                                    {logs.length > 0 
                                        ? Math.round((logs.filter(l => l.success).length / logs.length) * 100) 
                                        : 0}%
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Logs Display */}
                <Card className="bg-black/40 border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
                    <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <div>
                                <CardTitle className="text-xl">Chronological Feed</CardTitle>
                                <CardDescription>
                                    Detailed record of every automated scrape attempt.
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="w-fit border-white/10 bg-white/5 font-mono text-xs">
                                REAL-TIME
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="space-y-4 p-6">
                                {[1,2,3,4,5].map(i => <div key={i} className="h-16 w-full bg-white/5 animate-pulse rounded-xl" />)}
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                <Terminal className="size-16 opacity-20 mb-4" />
                                <p className="text-lg font-medium">No logs recorded yet.</p>
                                <p className="text-sm">Wait for the next scheduled run or trigger one manually.</p>
                            </div>
                        ) : (
                            <ScrollArea className="max-h-[600px] overflow-y-auto w-full">
                                
                                {/* Mobile View: Card List */}
                                <div className="block md:hidden p-4 space-y-3">
                                    {logs.map((log) => (
                                        <div 
                                            key={log.id} 
                                            onClick={() => navigate(`/product/${id}/logs/${log.id}`)}
                                            className="bg-white/5 border border-white/10 rounded-xl p-4 active:scale-95 transition-transform cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                 <span className="text-xs font-mono text-muted-foreground">
                                                    {format(new Date(log.attempted_at), 'MMM d, HH:mm')}
                                                 </span>
                                                 {log.success ? (
                                                     <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] px-2 py-0.5 h-5">
                                                         Success
                                                     </Badge>
                                                 ) : (
                                                     <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] px-2 py-0.5 h-5">
                                                         Failed
                                                     </Badge>
                                                 )}
                                            </div>
                                            
                                            <div className="mb-3">
                                                {log.success ? (
                                                    <p className="text-sm font-medium text-white line-clamp-2 leading-snug">{log.title}</p>
                                                ) : (
                                                    <p className="text-sm text-red-400 font-mono line-clamp-2">{log.error_message}</p>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center justify-between border-t border-white/5 pt-3">
                                                 <span className="text-xs text-muted-foreground uppercase tracking-wider">Detected Price</span>
                                                 <span className={`font-mono font-bold ${log.price ? 'text-primary' : 'text-muted-foreground'}`}>
                                                    {log.price ? `$${Number(log.price).toLocaleString()}` : 'N/A'}
                                                 </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop View: Table */}
                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader className="bg-white/[0.02] sticky top-0 z-10 backdrop-blur-md shadow-sm">
                                            <TableRow className="border-white/5 hover:bg-transparent">
                                                <TableHead className="w-[180px] pl-6">Timestamp</TableHead>
                                                <TableHead className="w-[120px]">Status</TableHead>
                                                <TableHead>Outcome</TableHead>
                                                <TableHead className="text-right pr-6">Price</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {logs.map((log) => (
                                                <TableRow 
                                                    key={log.id} 
                                                    className="group border-white/5 hover:bg-white/[0.03] transition-all cursor-pointer relative"
                                                    onClick={() => navigate(`/product/${id}/logs/${log.id}`)}
                                                >
                                                    <TableCell className="pl-6 font-mono text-xs text-muted-foreground group-hover:text-white transition-colors">
                                                        <div className="flex flex-col">
                                                            <span>{format(new Date(log.attempted_at), 'MMM d, yyyy')}</span>
                                                            <span className="opacity-50">{format(new Date(log.attempted_at), 'HH:mm:ss')}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {log.success ? (
                                                            <Badge variant="outline" className="bg-green-500/5 text-green-500 border-green-500/20 gap-1.5 pr-2.5">
                                                                <div className="size-1.5 rounded-full bg-green-500" /> Success
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="bg-red-500/5 text-red-500 border-red-500/20 gap-1.5 pr-2.5">
                                                                <div className="size-1.5 rounded-full bg-red-500" /> Failed
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="max-w-[400px] relative">
                                                         <div className="flex items-center justify-between">
                                                            {log.success ? (
                                                                <span className="text-sm text-white/90 truncate block max-w-[300px]" title={log.title}>
                                                                    {log.title}
                                                                </span>
                                                            ) : (
                                                                <div className="flex items-center gap-2 text-red-400 text-sm">
                                                                    <AlertTriangle className="size-3 shrink-0" />
                                                                    <span className="truncate max-w-[300px]" title={log.error_message}>
                                                                        {log.error_message || "Unknown Error"}
                                                                    </span>
                                                                </div>
                                                            )}
                                                             
                                                             {/* Hover Arrow */}
                                                             <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0 absolute right-4" />
                                                         </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono pr-6">
                                                        {log.price ? (
                                                            <span className="text-primary font-bold text-base">
                                                                ${Number(log.price).toLocaleString()}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground opacity-50">-</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </ScrollArea>
                        )}
                    </CardContent>
                </Card>

            </main>
        </div>
    );
};

export default ScrapeDetailsPage;
