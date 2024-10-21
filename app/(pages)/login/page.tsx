"use client";
import { useState } from 'react';
import { motion } from 'framer-motion'
import { Loader2, Lock, User, Eye, EyeOff } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';




export default function AdminLogin() {
  const navigate = useRouter();
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [phoneNumber, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token1, setToken1] = useState('');
  const [error, setError] = useState('');
  const BaseUrl = process.env.NEXT_PUBLIC_API_URL;

  interface AuthResponse {
    message: string;
    token: string; // Add the token property
    // ... other properties if needed
}
  const handleSubmit = async (event: React.FormEvent) => {
    
    event.preventDefault()
    setIsLoading(true)
    // Simulate API call
    try {

      const response  = await fetch(`${BaseUrl}/adm/admins/login` , {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          password,
        }),
      });
      
      if (response.ok) {
         // Check if the response is successful
         
        const data: AuthResponse = await response.json(); // Parse the response as JSON
        const token = data.token; 
        localStorage.setItem('token', token);
        
          
        toast.success(data.message);
        // After successful sign-in
        setTimeout(() => {
          navigate.push('/dashboard'); // Adjust this path if needed
        }, 1500);
        
      } else {
        // Handle login error
        
        toast.error('Login failed');
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      console.error('An error occurred during login', error);
    }
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      {/* background */}
      <div className="absolute inset-0 z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="backgroundGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" style={{ stopColor: "#f3f4f7", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#e1e5ee", stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#backgroundGradient)" />

          <circle cx="150" cy="150" r="120" fill="#5a9bd5" opacity="0.2" />
          <rect x="800" y="100" width="400" height="400" rx="100" ry="100" fill="#ffcc00" opacity="0.2" />

          <circle cx="300" cy="600" r="50" fill="#90caf9" />
          <rect x="270" y="650" width="60" height="100" fill="#90caf9" />

          <polygon points="500,50 650,150 500,250" fill="#7b9fd4" opacity="0.15" />
          <circle cx="950" cy="500" r="200" fill="#f95d6a" opacity="0.1"/>

          <circle cx="1400" cy="250" r="120" fill="#5a9bd5" opacity="0.2"/>
          <rect x="800" y="100" width="400" height="400" rx="100" ry="100" fill="#ffcc00" opacity="0.2"/>

          <polygon points="500,50 650,150 500,250" fill="#7b9fd4" opacity="0.15" />
          <circle cx="950" cy="500" r="200" fill="#f95d6a" opacity="0.1" />

          <path d="M0 700 Q400 800 800 700 Q1200 600 1600 700 V800 H0 Z" fill="#cfd8dc" />
        </svg>
      </div>
      <ToastContainer />
      
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">Enter your credentials to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Input 
                    id="username" 
                    placeholder="Enter your username" 
                    className="pl-10" 
                    onChange={(e) => setUsername(e.target.value)}/>
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password" 
                    className="pl-10 pr-10"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                 
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff size={18} aria-label="Hide password" />
                    ) : (
                      <Eye size={18} aria-label="Show password" />
                    )}
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm my-2">{error}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading} onClick={handleSubmit}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Log In'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <a href="#" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
          </CardFooter>
        </Card>
      </motion.div>

      <div className="absolute bottom-4 left-4 text-gray-800 text-sm">
        © 2024 Enma Zero to one. All rights reserved.
      </div>
    </div>
  )
}



