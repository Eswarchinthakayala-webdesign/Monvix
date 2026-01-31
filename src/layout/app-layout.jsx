import React, { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Toaster } from 'sonner'

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Determine if the URL contains a Supabase auth callback hash
    const hasAuthHash = location.hash.includes('access_token') && location.hash.includes('refresh_token');
    
    // If we have the hash but not on the callback route, redirect to it manually
    // This fixes issues where Supabase might redirect to the root URL
    if (hasAuthHash && !location.pathname.startsWith('/auth/callback')) {
      navigate({
        pathname: '/auth/callback',
        hash: location.hash
      });
    }
  }, [location, navigate]);

  return (
    <div>

       
        
        <main className='min-h-screen max-w-8xl mx-auto'>
            <Toaster position="bottom-right" />
         <Outlet/>

        </main>
    </div>
  )
}

export default AppLayout