import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  BarChart3, 
  Bell, 
  CheckCircle2, 
  Clock, 
  Globe, 
  Lock, 
  Search, 
  ShieldCheck, 
  Sparkles,
  TrendingDown, 
  TrendingUp, 
  Zap 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/hooks/useProducts';
import { toast } from 'sonner';

// --- Mock Data for Chart ---
const priceData = [
  { date: 'Mon', price: 145 },
  { date: 'Tue', price: 142 },
  { date: 'Wed', price: 138 },
  { date: 'Thu', price: 139 },
  { date: 'Fri', price: 135 },
  { date: 'Sat', price: 132 },
  { date: 'Sun', price: 129 },
];

import PremiumLoader from '@/components/PremiumLoader';

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('chart');
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { addProduct } = useProducts();

  const handleTrack = async () => {
    if (!url) {
        toast.error("Please enter a product URL");
        return;
    }

    if (loading) return; // Prevent action while checking auth

    if (!user) {
        // Save URL to storage and redirect to Login
        sessionStorage.setItem('pendingProductUrl', url);
        toast.info("Please login to track this product");
        navigate('/login');
    } else {
        // User is logged in, add product directly
        setIsProcessing(true);
        try {
            await addProduct(url);
            // Artificial delay for premium feel
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (error) {
            console.error(error);
            setIsProcessing(false);
        }
    }
  };
  
  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 10 }
    }
  };

  return (
    <div className="min-h-screen bg-black text-foreground overflow-x-hidden selection:bg-primary/30 selection:text-primary-foreground font-sans">
      <PremiumLoader isVisible={isProcessing} text="Connecting to Satellite..." />
      <Navbar />

      {/* --- Ambient Background --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        {/* Glow Orbs */}
        <div className="absolute top-0 transform -translate-x-1/2 left-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-40 mix-blend-screen animate-pulse duration-[10s]" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] opacity-20" />
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 pt-32 pb-20 lg:pt-48 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium text-primary mb-8 hover:bg-white/10 transition-colors cursor-default"
          >
            <Sparkles className="size-4" />
            <span>The Future of Price Tracking is Here</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/50"
          >
            Track Prices.<br />
            <span className="text-primary drop-shadow-[0_0_30px_rgba(var(--primary),0.5)]">Dominate Deals.</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Hyper-accurate tracking for millions of products. Set targets, get instant alerts, and visualize trends with professional-grade analytics.
          </motion.p>

          {/* Search Input */}
          <motion.div 
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-lg relative group mb-20"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-black/80 backdrop-blur-xl rounded-lg border border-white/10 p-2 shadow-2xl">
              <Search className="ml-3 text-muted-foreground size-5" />
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                placeholder="Paste Amazon, BestBuy, or Walmart link..." 
                className="flex-1 bg-transparent border-none text-foreground placeholder:text-muted-foreground/50 focus:outline-none px-4 h-10 w-full"
              />
              <Button 
                onClick={handleTrack} 
                disabled={loading || isProcessing}
                className="h-10 px-6 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(234,88,12,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Checking...' : 'Track It'}
              </Button>
            </div>
          </motion.div>

          {/* --- FUTURISTIC DASHBOARD PREVIEW --- */}
          <motion.div 
            initial={{ opacity: 0, y: 100, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, type: "spring", bounce: 0.2 }}
            style={{ perspective: "1000px" }}
            className="w-full max-w-5xl mx-auto"
          >
            <div className="relative rounded-2xl border border-white/10 bg-[#0A0A0A]/90 backdrop-blur-md shadow-2xl overflow-hidden ring-1 ring-white/5">
              {/* Header Bar */}
              <div className="h-14 border-b border-white/5 flex items-center px-6 justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <div className="size-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="size-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="size-3 rounded-full bg-green-500/20 border border-green-500/50" />
                  </div>
                  <div className="h-4 w-px bg-white/10 mx-2" />
                  <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground/70">
                    <Lock className="size-3" /> monvix.secure/dashboard
                  </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-xs font-mono text-primary animate-pulse">● LIVE UPDATE</div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="p-8 grid md:grid-cols-12 gap-8">
                
                {/* Product Info - Left Col */}
                <div className="md:col-span-4 space-y-6">
                  <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                    <div className="aspect-square rounded-lg bg-gradient-to-br from-white/5 to-white/0 flex items-center justify-center mb-4 relative overflow-hidden group">
                        <img 
                            src="demo.webp" 
                            alt="Sony Headphones" 
                            className="w-3/4 h-3/4 object-contain mix-blend-overlay opacity-80 group-hover:scale-110 transition-transform duration-500"
                        />
                         <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs font-mono border border-white/10">Scanned 2m ago</div>
                    </div>
                    <h3 className="font-bold text-lg leading-tight mb-2">Sony WH-1000XM5 Wireless Noise Canceling Headphones</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Globe className="size-3" /> Amazon.com</span>
                        <span className="text-xs font-mono p-1 bg-white/5 rounded">B092XCDD</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Current Price</p>
                        <p className="text-2xl font-bold text-primary font-mono">$129.99</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Target Price</p>
                        <p className="text-2xl font-bold font-mono text-white/80">$120.00</p>
                    </div>
                  </div>
                </div>

                {/* Chart Area - Right Col */}
                <div className="md:col-span-8 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold">Price Analysis</h2>
                        <p className="text-sm text-muted-foreground">Thinking about buying? Wait for a drop.</p>
                    </div>
                    <div className="flex gap-2">
                        {['1D', '1W', '1M', '1Y'].map(range => (
                            <button 
                                key={range}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${range === '1W' ? 'bg-white text-black' : 'hover:bg-white/10 text-muted-foreground'}`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                  </div>

                  <div className="flex-1 min-h-[300px] w-full bg-white/[0.02] rounded-xl border border-white/5 p-4 relative">
                    {/* Tooltip for the chart */}
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={priceData}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            stroke="#555" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 12}} 
                            dy={10}
                        />
                        <YAxis 
                            stroke="#555" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 12}} 
                            tickFormatter={(value) => `$${value}`}
                            dx={-10}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value) => [`$${value}`, 'Price']}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="price" 
                            stroke="var(--primary)" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorPrice)" 
                        />
                      </AreaChart>
                   </ResponsiveContainer>
                   
                   {/* Floating Badge on graph */}
                   <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.5 }}
                        className="absolute bottom-1/4 right-1/4 bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-bold flex gap-2 items-center backdrop-blur-md"
                   >
                        <TrendingDown className="size-3" /> Lowest in 30 days
                   </motion.div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
            <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-20"
            >
                <h2 className="text-4xl font-bold mb-4">Engineered for Deal Hunters</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">We've simplified the complex technology of web scraping into a beautiful, easy-to-use dashboard.</p>
            </motion.div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid md:grid-cols-3 gap-8"
            >
                {[
                    {
                        icon: <Clock />,
                        title: "Real-time Monitoring",
                        desc: "Our bots scan products every 30 minutes to ensure you never miss a lightning deal."
                    },
                    {
                        icon: <Bell />,
                        title: "Instant Notifications",
                        desc: "Get notified via Email, SMS, or Discord webhook the second a price drops."
                    },
                    {
                        icon: <BarChart3 />,
                        title: "Historical Analytics",
                        desc: "Make data-driven decisions by analyzing price trends over the last 12 months."
                    },
                    {
                        icon: <Globe />,
                        title: "Global Marketplace",
                        desc: "Support for all Amazon regions, eBay, Walmart, BestBuy, and 50+ other retailers."
                    },
                    {
                        icon: <ShieldCheck />,
                        title: "Reliable & Secure",
                        desc: "Enterprise-grade uptime and security. We respect your privacy and data."
                    },
                    {
                        icon: <Zap />,
                        title: "One-Click Import",
                        desc: "Import your entire wishlist in seconds using our browser extension."
                    }
                ].map((item, idx) => (
                    <motion.div 
                        key={idx}
                        variants={itemVariants}
                        className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="size-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                                {React.cloneElement(item.icon, { className: "size-6" })}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-8">Ready to stop overpaying?</h2>
            <p className="text-xl text-muted-foreground mb-12">Join 50,000+ users saving millions every year with FireCrawl.</p>
            

        </div>
      </section>

      <footer className="py-12 border-t border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          
            <div className="text-muted-foreground text-sm">
                &copy; {new Date().getFullYear()} Monvix. All rights reserved.
            </div>
            <div className="flex gap-6">
                <a href="#" className="text-muted-foreground hover:text-white transition-colors">Twitter</a>
                <a href="#" className="text-muted-foreground hover:text-white transition-colors">GitHub</a>
                <a href="#" className="text-muted-foreground hover:text-white transition-colors">Discord</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;