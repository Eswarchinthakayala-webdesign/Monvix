import { useEffect, useState } from 'react';
import supabase from '@/utils/supabase';

export const usePriceHistory = (productId) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        if (!productId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('price_history')
                .select('*')
                .eq('product_id', productId)
                .order('checked_at', { ascending: true });

            if (error) throw error;
            setHistory(data || []);
        } catch (error) {
            console.error('Error fetching price history:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [productId]);

    return { history, loading };
};
