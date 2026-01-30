import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '@/utils/supabase';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Terminal, Code, Clock, Database, Globe, Image as ImageIcon, Download } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const ScrapeLogDetail = () => {
    const { id, logId } = useParams(); // id is product_id, logId is log_id
    const navigate = useNavigate();
    const [log, setLog] = useState(null);
    const [loading, setLoading] = useState(true);

    const [product, setProduct] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Log
                const { data: logData, error: logError } = await supabase
                    .from('scrape_logs')
                    .select('*')
                    .eq('id', logId)
                    .single();

                if (logError) throw logError;
                setLog(logData);

                // Fetch Product for image fallback
                const { data: productData, error: productError } = await supabase
                    .from('products')
                    .select('image_url, title')
                    .eq('id', id)
                    .single();
                
                if (productData) setProduct(productData);

            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Data not found");
                navigate(`/product/${id}/logs`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, logId, navigate]);

    if (loading) return (
         <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground animate-pulse">Retrieving Log Data...</p>
            </div>
        </div>
    );

    if (!log) return null;

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
                {/* Header */}
                 <div className="flex items-center gap-4">
                     <Button variant="ghost" className="pl-0 text-muted-foreground hover:text-white" onClick={() => navigate(`/product/${id}/logs`)}>
                        <ArrowLeft className="mr-2 size-4" /> Back to Logs
                    </Button>
                </div>

                <div className="space-y-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <Terminal className="size-8 text-primary" />
                            Log #{log.id.slice(0, 8)}
                        </h1>
                         {log.success ? (
                            <Badge variant="outline" className="w-fit bg-green-500/10 text-green-500 border-green-500/20 gap-2 px-4 py-1.5 text-sm uppercase tracking-wider">
                                <CheckCircle className="size-4" /> Successful Execution
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="w-fit bg-red-500/10 text-red-500 border-red-500/20 gap-2 px-4 py-1.5 text-sm uppercase tracking-wider">
                                <XCircle className="size-4" /> Execution Failed
                            </Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground font-mono text-sm">
                        ID: {log.id}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Meta Info */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2"><Clock className="size-4 text-primary" /> Timing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Timestamp</div>
                                <div className="text-sm font-medium text-white">{format(new Date(log.attempted_at), 'MMM d, yyyy HH:mm:ss')}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Relative Time</div>
                                <div className="text-sm font-medium text-white">{format(new Date(log.attempted_at), 'PPP p')}</div>
                            </div>
                        </CardContent>
                    </Card>

                     <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2"><Database className="size-4 text-primary" /> Data Extracted</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Price Detected</div>
                                <div className="text-xl font-mono font-bold text-white">
                                    {log.price ? `$${Number(log.price).toLocaleString()}` : <span className="text-muted-foreground">N/A</span>}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Title Detected</div>
                                <div className="text-sm font-medium text-white line-clamp-2" title={log.title}>
                                    {log.title || <span className="text-muted-foreground">N/A</span>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                     <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2"><Globe className="size-4 text-primary" /> Source</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Product ID</div>
                                <div className="text-xs font-mono text-white/50 truncate">{log.product_id}</div>
                            </div>
                             <div>
                                <Button variant="outline" size="sm" className="w-full text-xs h-8 border-white/10 hover:bg-white/10" onClick={() => navigate(`/product/${id}`)}>
                                    View Product Page
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Visual Evidence */}
                {product && product.image_url && (
                    <Card className="bg-white/5 border-white/10 backdrop-blur-md overflow-hidden">
                        <CardHeader className="border-b border-white/5">
                            <CardTitle className="text-base flex items-center justify-between">
                                <span className="flex items-center gap-2"><ImageIcon className="size-4 text-primary" /> Visual Evidence</span>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 gap-2 border-white/10 hover:bg-white/10 text-xs"
                                    onClick={async () => {
                                        try {
                                            toast.info("Downloading image...");
                                            const response = await fetch(product.image_url);
                                            const blob = await response.blob();
                                            const url = window.URL.createObjectURL(blob);
                                            const link = document.createElement('a');
                                            link.href = url;
                                            link.download = `pricelyt-evidence-${log.id.slice(0, 8)}.jpg`;
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                            window.URL.revokeObjectURL(url);
                                            toast.success("Download complete");
                                        } catch (e) {
                                            toast.error("Download failed");
                                        }
                                    }}
                                >
                                    <Download className="size-3" /> Download Evidence
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="relative w-full h-[300px] md:h-[400px] bg-black/40 flex items-center justify-center p-8">
                                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
                                <img 
                                    src={product.image_url} 
                                    alt="Scrape Evidence" 
                                    className="max-h-full max-w-full object-contain rounded-lg shadow-2xl border border-white/10 relative z-10"
                                />
                                <div className="absolute bottom-4 left-4 z-20 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-md flex items-center gap-2">
                                     <Clock className="size-3 text-primary" />
                                     <span className="text-xs font-mono text-white/80">
                                        Captured: {format(new Date(log.attempted_at), 'HH:mm:ss')}
                                     </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Error Console (if failed) */}
                {!log.success && (
                    <Card className="bg-red-500/5 border-red-500/20 backdrop-blur-md overflow-hidden">
                        <div className="px-6 py-3 border-b border-red-500/10 bg-red-500/10 flex items-center gap-2">
                             <AlertTriangle className="size-4 text-red-500" />
                             <span className="text-sm font-bold text-red-500 uppercase tracking-wider">Error Output</span>
                        </div>
                        <CardContent className="p-0">
                            <div className="bg-black/40 p-6 font-mono text-sm text-red-400 overflow-x-auto whitespace-pre-wrap">
                                {log.error_message}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Raw JSON Data */}
                <Card className="bg-black/40 border-white/10 overflow-hidden">
                    <div className="px-6 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <Code className="size-4 text-primary" />
                            <span className="text-sm font-bold text-white uppercase tracking-wider">Raw Log Object</span>
                         </div>
                         <Badge variant="secondary" className="bg-white/10 text-xs">JSON</Badge>
                    </div>
                    <CardContent className="p-0">
                         <div className="h-[400px] overflow-x-auto w-full">
                            <div className="p-6 font-mono text-xs overflow-x-auto  md:text-sm text-orange-400/80">
                                <pre>{JSON.stringify(log, null, 2)}</pre>
                            </div>
                         </div>
                    </CardContent>
                </Card>

            </main>
        </div>
    );
};

export default ScrapeLogDetail;
