import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <BarChart3 className="size-10 text-primary animate-bounce"/>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
