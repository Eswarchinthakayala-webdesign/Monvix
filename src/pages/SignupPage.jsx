import React from 'react';
import { Navigate } from 'react-router-dom';

const SignupPage = () => {
    // Since we only use Google Auth, Signup is effectively the same as Login
    // But to respect the route, we can redirect or render the same component.
    // For better UX, redirecting to login is cleaner since the flow is identical.
    return <Navigate to="/login" replace />;
};

export default SignupPage;
