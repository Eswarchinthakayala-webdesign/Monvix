import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';

const AddProductDialog = () => {
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addProduct } = useProducts();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!url) return;
        
        setIsSubmitting(true);
        
        try {
            // NOTE: In a real implementation, we would call an implementation of Firecrawl here to get the initial metadata.
            // For now, we will just add the URL with placeholder data.
            await addProduct(url, "Pending Scraping...", 0, "USD");
            
            setOpen(false);
            setUrl('');
        } catch (error) {
            // Error managed by hook
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="font-semibold shadow-lg shadow-primary/20 gap-2">
                    <Plus className="size-4" /> Add Product
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/95 border-white/10 backdrop-blur-xl sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Track New Product</DialogTitle>
                    <DialogDescription>
                        Paste the URL of the product you want to track. We support Amazon, BestBuy, Walmart, and more.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="url">Product URL</Label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-3 size-4 text-muted-foreground" />
                            <Input 
                                id="url" 
                                placeholder="https://amazon.com/dp/..." 
                                className="pl-9 bg-white/5 border-white/10"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting || !url}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Scanning...
                                </>
                            ) : (
                                "Start Tracking"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddProductDialog;
