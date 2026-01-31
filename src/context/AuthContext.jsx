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
        // Prioritize environment variable for redirect URL, fallback to window.location.origin
        // This helps when running in production but maybe window context is tricky, or allows override.
        const origin = import.meta.env.VITE_SITE_URL ? import.meta.env.VITE_SITE_URL.replace(/\/$/, "") : window.location.origin;
        const redirectUrl = `${origin}/auth/callback`;

        console.log("Starting OAuth with redirect to:", redirectUrl);

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl
            }
        });
        if(error) throw error;
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if(error) throw error;
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, loginWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
