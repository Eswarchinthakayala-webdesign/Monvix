import { useEffect, useState } from 'react';
import supabase from '@/utils/supabase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export const useProducts = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const scrapeProduct = async (productId, url) => {
        if (!url || !productId) return;
        
        try {
            // 2. Client-Side Scraping
            const apiKey = import.meta.env.VITE_FIRECRAWL_API_KEY;
            
            if (!apiKey) {
                toast.error("Missing API Key! check .env file");
                throw new Error("Missing VITE_FIRECRAWL_API_KEY");
            }

            // Detect country
            let country = 'US';
            if (url.includes('.in') || url.includes('.in/')) country = 'IN';
            else if (url.includes('.co.uk')) country = 'GB';
            else if (url.includes('.ca')) country = 'CA';

            console.log(`Scraping ${url} (Region: ${country})...`);

            const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    url: url,
                    formats: ['json'],
                    location: { country: country },
                    actions: [
                        { type: 'scroll', direction: "down", distance: 1000 },
                        { type: 'wait', milliseconds: 5000 }
                    ],
                    jsonOptions: {
                        prompt: "Return valid JSON with the product title, numeric price, currency, and image URL. The title must be the specific product name, NOT 'Continue Shopping' or 'Amazon'. The price must be the current buying price. If unavailable, return price: 0.",
                        schema: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                price: { type: "number" },
                                currency: { type: "string" },
                                image_url: { type: "string" }
                            },
                            required: ["title", "price"]
                        }
                    }
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                await supabase.from('scrape_logs').insert({
                    product_id: productId,
                    success: false,
                    error_message: `API HTTP ${response.status}: ${errText.substring(0, 200)}`,
                    raw_response: { status: response.status, statusText: response.statusText }
                });
                throw new Error(`Firecrawl API caught error: ${response.status} ${response.statusText}`);
            }

            const scrapeResult = await response.json();

            if (!scrapeResult.success) {
                await supabase.from('scrape_logs').insert({
                    product_id: productId,
                    success: false,
                    error_message: scrapeResult.error || 'Unknown Firecrawl error',
                    raw_response: scrapeResult
                });
                throw new Error(scrapeResult.error || 'Scraping failed internally');
            }

            console.log("Scrape Payload:", scrapeResult);

            let { title, price, currency, image_url } = scrapeResult.data.json;
            
            // Log Success
            await supabase.from('scrape_logs').insert({
                product_id: productId,
                success: true,
                title: title,
                price: price,
                currency: currency,
                image_url: image_url,
                raw_response: scrapeResult
            });

            // Debug Toast
            toast("Price updated", { description: `$${price}` });
            
             // Fallback for bad Amazon data
            if (!title || title.toLowerCase().includes('continue shopping') || price === 0) {
                 if (scrapeResult.data.metadata?.title) {
                     title = scrapeResult.data.metadata.title.split(':')[0];
                 }
            }

            // 3. Update Product in DB
            const updates = {
                title: title || 'Unknown Product',
                current_price: price || 0,
                currency: currency || 'USD',
                last_checked_at: new Date().toISOString(),
                is_active: true
            };
            if (image_url) updates.image_url = image_url;

            const { error: updateError } = await supabase
                .from('products')
                .update(updates)
                .eq('id', productId);

            if (updateError) throw updateError;

            // 4. Insert Price History
            await supabase.from('price_history').insert({
                product_id: productId,
                price: price || 0,
                checked_at: new Date().toISOString()
            });
            
            // 5. Check Alerts (Client-side Logic)
            const { data: alerts } = await supabase
                .from('alerts')
                .select('*')
                .eq('product_id', productId)
                .eq('enabled', true)
                .eq('triggered', false);
            
            if (alerts && alerts.length > 0) {
                 for (const alert of alerts) {
                     if (price <= alert.target_price && price > 0) {
                         // Trigger Alert
                         await supabase
                             .from('alerts')
                             .update({ 
                                 triggered: true, 
                                 triggered_at: new Date().toISOString()
                             })
                             .eq('id', alert.id);
                         
                         toast.success(`Price Alert Triggered!`, {
                             description: `${title.substring(0,30)}... is now $${price} (Target: $${alert.target_price})`,
                             duration: 8000
                         });
                     }
                 }
            }

        } catch (error) {
            console.error('Error scraping product:', error);
            if (productId) {
                 await supabase.from('scrape_logs').insert({
                    product_id: productId,
                    success: false,
                    error_message: error.message || 'Client-side Exception',
                    raw_response: null
                });
            }
            toast.error(`Scrape Error: ${error.message}`);
        }
    };

    const addProduct = async (url) => {
        if (!user) return;
        
        // 1. Initial Insert (Placeholder)
        let productId = null;
        try {
            const { data: initialData, error: initialError } = await supabase
                .from('products')
                .insert([
                    { 
                        user_id: user.id, 
                        url, 
                        title: 'Fetching details...', 
                        current_price: 0, 
                        currency: 'USD' 
                    }
                ])
                .select()
                .single();

            if (initialError) throw initialError;
            productId = initialData.id;
            toast.success('Product tracked. Scraping live data...');

            // Call the scraping logic
            scrapeProduct(productId, url);
            
            return initialData;

        } catch (error) {
            console.error('Error adding product:', error);
            toast.error(`Error: ${error.message}`);
            throw error;
        }
    };

    const deleteProduct = async (id) => {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setProducts(products.filter(p => p.id !== id));
            toast.success('Product deleted');
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product');
        }
    };

    useEffect(() => {
        fetchProducts();
        
        const subscription = supabase
            .channel('public:products')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products', filter: `user_id=eq.${user?.id}` }, (payload) => {
                 if (payload.eventType === 'INSERT') {
                    // Check if already exists to avoid dupes from self-update
                    setProducts(prev => {
                        if (prev.find(p => p.id === payload.new.id)) return prev;
                        return [payload.new, ...prev];
                    });
                 } else if (payload.eventType === 'DELETE') {
                    setProducts(prev => prev.filter(p => p.id !== payload.old.id));
                 } else if (payload.eventType === 'UPDATE') {
                    setProducts(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
                 }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [user]);

    return { products, loading, addProduct, deleteProduct, scrapeProduct, refreshProducts: fetchProducts };
};
