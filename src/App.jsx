import { useState } from 'react'

import './App.css'
import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import AppLayout from './layout/app-layout'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import ScrapeDetailsPage from './pages/ScrapeDetailsPage'
import ScrapeLogDetail from './pages/ScrapeLogDetail'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AuthCallback from './pages/AuthCallback'

const router=createBrowserRouter([
  {

    element:<AppLayout/>,
    children:[
      {
        path:"/",
        element:<LandingPage/>
      },
      {
        path:"/login",
         element:<LoginPage/>
      },
      {
        path:"/signup",
        element:<SignupPage/>
      },
      {
        path:"/auth/callback",
        element:<AuthCallback/>
      },
      {
        path:"/dashboard",
        element:(
            <ProtectedRoute>
                <DashboardPage/>
            </ProtectedRoute>
        )
      },
      {
        path:"/product/:id",
        element:(
            <ProtectedRoute>
                <ProductDetailsPage/>
            </ProtectedRoute>
        )
      },
      {
        path:"/product/:id/logs",
        element:(
            <ProtectedRoute>
                <ScrapeDetailsPage/>
            </ProtectedRoute>
        )
      },
      {
        path:"/product/:id/logs/:logId",
        element:(
            <ProtectedRoute>
                <ScrapeLogDetail/>
            </ProtectedRoute>
        )
      },
      {
        path:"/notifications",
        element:(
            <ProtectedRoute>
                <NotificationsPage/>
            </ProtectedRoute>
        )
      },
      {
        path:"/profile",
        element:(
            <ProtectedRoute>
                <ProfilePage/>
            </ProtectedRoute>
        )
      }
      ]

  }


])

function App() {
  
  return (
   <AuthProvider>
    <RouterProvider router={router}/>
   </AuthProvider>
  )
}

export default App