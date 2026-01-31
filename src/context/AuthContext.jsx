import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../utils/supabase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Function to process session and fetch profile
        const initializeUser = async (session) => {
            if (session?.user) {
                try {
                    // Fetch Profile safely
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .maybeSingle(); // Use maybeSingle to avoid 406/JSON errors if row missing
                    
                    setUser({ ...session.user, profile });
                    setIsAuthenticated(true);
                } catch (err) {
                    console.error("Profile fetch error:", err);
                    setUser(session.user); // Fallback to basic user
                    setIsAuthenticated(true);
                }
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
            setLoading(false);
        };

        // 1. Check active session immediately
        supabase.auth.getSession().then(({ data: { session } }) => {
            initializeUser(session);
        });

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            // Only update if the session actually changed to avoid redundant fetches
             initializeUser(session);
        });
        
        return () => {
            subscription.unsubscribe();
        }
    }, []);

    const loginWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        });
        if(error) throw error;
    };

    const handleAuthCallback = async () => {
        try {
            const hash = window.location.hash;
            if (!hash) throw new Error("No authentication details found");

            const params = new URLSearchParams(hash.substring(1));
            const access_token = params.get("access_token");
            const refresh_token = params.get("refresh_token");
            const expires_in = params.get("expires_in");
            const token_type = params.get("token_type");

            if (!access_token || !refresh_token) throw new Error("Missing tokens in URL");

            const { error } = await supabase.auth.setSession({
                access_token,
                refresh_token,
                expires_in: expires_in ? Number(expires_in) : undefined,
                token_type
            });

            if (error) throw error;

            // Clear hash
            window.history.replaceState(null, "", window.location.pathname + window.location.search);

            return { success: true };
        } catch (error) {
            console.error("Auth callback error:", error);
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if(error) throw error;
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, loginWithGoogle, logout, handleAuthCallback }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
