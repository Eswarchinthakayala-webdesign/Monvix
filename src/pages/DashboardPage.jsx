import React, { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'
import { useProducts } from '@/hooks/useProducts'
import ProductCard from '@/components/ProductCard'
import AddProductDialog from '@/components/AddProductDialog'
import { Search, Filter, LayoutGrid, List as ListIcon, TrendingUp, DollarSign, Package, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PremiumLoader from '@/components/PremiumLoader';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const DashboardPage = () => {
  const { user } = useAuth();
  const { products, loading: productsLoading, addProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Calculate Portfolio Stats
  const totalValue = products.reduce((acc, p) => acc + (p.current_price || 0), 0);
  const totalProducts = products.length;
  
  // Real-time Chart Data: Top 5 Most Expensive Items
  const categoryData = products
      .filter(p => p.current_price > 0)
      .sort((a, b) => b.current_price - a.current_price)
      .slice(0, 5) // Top 5
      .map(p => ({
          name: p.title.length > 15 ? p.title.substring(0, 12) + '...' : p.title, // Truncate for label
          fullTitle: p.title,
          price: p.current_price
      }));

  // Check for pending URL from Landing Page
  useEffect(() => {
      const pendingUrl = sessionStorage.getItem('pendingProductUrl');
      if (pendingUrl) {
          setIsProcessing(true);
          sessionStorage.removeItem('pendingProductUrl'); 
          addProduct(pendingUrl)
            .then(() => setTimeout(() => setIsProcessing(false), 2000))
            .catch(() => setIsProcessing(false));
      }
  }, []); 
  
  const loading = productsLoading || isProcessing;
  
  const filteredProducts = products.filter(product => 
     product.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     product.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-foreground pb-20 selection:bg-orange-500/30  overflow-hidden">
        <PremiumLoader 
            isVisible={loading} 
            text={isProcessing ? "Configuring Agent..." : "Syncing Dashboard..."} 
        />
        <Navbar />
        
      {/* --- Ambient Background --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        {/* Glow Orbs */}
        <div className="absolute top-0 transform -translate-x-1/2 left-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-40 mix-blend-screen animate-pulse duration-[10s]" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] opacity-20" />
      </div>
        
        <main className="max-w-7xl mx-auto px-6 pt-24 space-y-8">
            
            {/* 1. Welcome & Stats Section */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* Welcome Card */}
                <div className="xl:col-span-8 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-neutral-900 to-black border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] -mr-16 -mt-16" />
                    <div className="relative z-10">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                            Overview
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-lg mb-6 max-w-xl">
                            Welcome back, <span className="text-white font-semibold">{user?.user_metadata?.full_name?.split(' ')[0] || 'Hunter'}</span>. 
                            Your tracking agents are active.
                        </p>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="text-muted-foreground text-[10px] md:text-xs uppercase tracking-wider mb-1">Total Tracked Value</div>
                                <div className="text-lg md:text-2xl font-mono font-bold text-primary">
                                    ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="text-muted-foreground text-[10px] md:text-xs uppercase tracking-wider mb-1">Active Targets</div>
                                <div className="text-lg md:text-2xl font-mono font-bold text-white">
                                    {totalProducts}
                                </div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-center sm:justify-start col-span-2 sm:col-span-1">
                                <AddProductDialog />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Assets Chart */}
                <div className="xl:col-span-4 rounded-2xl bg-neutral-900/50 border border-white/10 p-6 flex flex-col min-h-[300px] xl:min-h-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <DollarSign className="size-4 text-primary" /> Top Assets
                        </h3>
                        <span className="text-xs text-muted-foreground">Highest Value Items</span>
                    </div>
                    <div className="flex-1 min-h-[200px]">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryData} layout="vertical" margin={{ left: 0, right: 30, top: 0, bottom: 0 }}>
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        dataKey="name" 
                                        type="category" 
                                        width={100} 
                                        tick={{fill: '#888', fontSize: 11}} 
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip 
                                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                        contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value) => [`$${value}`, 'Price']}
                                    />
                                    <Bar dataKey="price" fill="#f97316" radius={[0, 4, 4, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                                Not enough data
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Controls & Search */}
            <div className="sticky top-20 z-30 bg-black/80 backdrop-blur-xl py-4 border-b border-white/5 -mx-6 px-6">
                 <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search your tracking list..." 
                            className="pl-9 bg-white/5 border-white/10 hover:border-white/20 focus:border-primary/50 transition-colors h-10 rounded-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button 
                            variant={viewMode === 'grid' ? "secondary" : "ghost"} 
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className="flex-1 sm:flex-none"
                        >
                            <LayoutGrid className="size-4 mr-2" /> Grid
                        </Button>
                        <Button 
                            variant={viewMode === 'list' ? "secondary" : "ghost"} 
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="flex-1 sm:flex-none"
                        >
                            <ListIcon className="size-4 mr-2" /> List
                        </Button>
                    </div>
                 </div>
            </div>

            {/* 3. Products Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1,2,3,4,5,6,7,8].map(i => (
                        <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
                    ))}
                </div>
            ) : filteredProducts.length > 0 ? (
                <div className={
                    viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                    : "grid grid-cols-1 sm:grid-cols-2 gap-4"
                }>
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
                    <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                        <Package className="size-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No products found</h3>
                    <p className="text-muted-foreground mb-8 text-center max-w-md">
                        Your tracking list is empty. Start by adding a product URL above.
                    </p>
                    <AddProductDialog />
                </div>
            )}
        </main>
    </div>
  )
}

export default DashboardPage