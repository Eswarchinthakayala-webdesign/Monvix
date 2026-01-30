import { useEffect, useState } from 'react';
import supabase from '@/utils/supabase';
import { toast } from 'sonner';

export const useAlerts = (productId) => {
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAlert = async () => {
        if (!productId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('alerts')
                .select('*')
                .eq('product_id', productId)
                .maybeSingle();

            if (error) throw error;
            setAlert(data);
        } catch (error) {
            console.error('Error fetching alert:', error);
        } finally {
            setLoading(false);
        }
    };

    const setTargetPrice = async (targetPrice, enabled = true) => {
        if (!productId) return;
        try {
            // Upsert alert
            const { data: userData } = await supabase.auth.getUser();
            const user = userData.user;

            if (!user) throw new Error("User not authenticated");

            const { data, error } = await supabase
                .from('alerts')
                .upsert(
                    { 
                        user_id: user.id, 
                        product_id: productId, 
                        target_price: targetPrice, 
                        enabled 
                    },
                    { onConflict: 'user_id,product_id' }
                )
                .select()
                .single();

            if (error) throw error;
            setAlert(data);
            toast.success('Price alert updated');
        } catch (error) {
            console.error('Error setting alert:', error);
            toast.error('Failed to set alert');
        }
    };

    const toggleAlert = async (enabled) => {
        if (!alert) return;
        try {
            const { data, error } = await supabase
                .from('alerts')
                .update({ enabled })
                .eq('id', alert.id)
                .select()
                .single();

            if (error) throw error;
            setAlert(data);
            toast.success(enabled ? 'Alert enabled' : 'Alert disabled');
        } catch (error) {
            console.error('Error toggling alert:', error);
        }
    };

    useEffect(() => {
        fetchAlert();
    }, [productId]);

    return { alert, loading, setTargetPrice, toggleAlert };
};
