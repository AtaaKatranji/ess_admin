"use client";
import {   useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';

//import { setCookie } from 'nookies'; // Import nookies for cookie handling

export default function AdminLogin() {
  const navigate = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const BaseUrl = process.env.NEXT_PUBLIC_API_URL;

  interface AuthResponse {
    message: string;
    token: string; // Add the token property
    data: { adminId: string; role: 'admin' | 'manager' };
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${BaseUrl}/api/v1/admins/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          password,
        }),
        credentials:'include'
      });
      console.log("response",response)
      if (response.ok) {
        const data : AuthResponse = await response.json();
        
        
        toast.success(data.message);
        // After successful sign-in



        setTimeout(() => {
          navigate.push('/dashboard'); // Adjust this path if needed
        }, 1500);
        
      } else {
        toast.error('Login failed');
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      console.error('An error occurred during login', error);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
        {/* SVG background code */}
        <div className="absolute inset-0 z-0">
  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <defs>
      {/* Soft diagonal gradient */}
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#eef3f8" />
        <stop offset="100%" stopColor="#dbe6f3" />
      </linearGradient>

      {/* Very subtle grid */}
      <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
        <path d="M64 0H0V64" fill="none" stroke="#1e3a8a" strokeOpacity="0.04" strokeWidth="1" />
      </pattern>

      {/* Gentle wave gradient */}
      <linearGradient id="wave" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
      </linearGradient>

      {/* Glow blobs */}
      <radialGradient id="blobBlue" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="blobTeal" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.18" />
        <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* Base gradient */}
    <rect x="0" y="0" width="100%" height="100%" fill="url(#bg)" />

    {/* Subtle grid overlay */}
    <rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" />

    {/* Soft blobs (top-right / bottom-left) */}
    <circle cx="82%" cy="18%" r="280" fill="url(#blobBlue)" />
    <circle cx="12%" cy="78%" r="220" fill="url(#blobTeal)" />

    {/* Abstract waves (bottom) */}
    <path d="M0,70% C20%,66% 32%,76% 50%,72% C68%,68% 80%,76% 100%,72% L100%,100% L0,100% Z" fill="url(#wave)" />
    <path d="M0,78% C18%,74% 36%,86% 52%,82% C70%,78% 86%,88% 100%,82% L100%,100% L0,100% Z" fill="url(#wave)" />

    {/* Faint, relevant icons */}
    <g opacity="0.06" fill="none" stroke="#0f172a" strokeWidth="2">
      {/* Calendar (top-left) */}
      <rect x="7%" y="12%" rx="10" ry="10" width="140" height="110" />
      <line x1="7%" y1="18%" x2="16.5%" y2="18%" />
      <line x1="9%" y1="12%" x2="9%" y2="18%" />
      <line x1="14%" y1="12%" x2="14%" y2="18%" />
      <rect x="8.5%" y="21%" width="18" height="14" rx="3" />
      <rect x="11.5%" y="21%" width="18" height="14" rx="3" />
      <rect x="14.5%" y="21%" width="18" height="14" rx="3" />
      <rect x="8.5%" y="24%" width="18" height="14" rx="3" />
      <rect x="11.5%" y="24%" width="18" height="14" rx="3" />

      {/* Clock (right side) */}
      <circle cx="88%" cy="36%" r="70" />
      <line x1="88%" y1="36%" x2="88%" y2="26%" />
      <line x1="88%" y1="36%" x2="94%" y2="36%" />

      {/* Building (bottom-right) */}
      <rect x="78%" y="68%" width="220" height="140" rx="8" />
      <rect x="80%" y="72%" width="28" height="28" rx="4" />
      <rect x="84%" y="72%" width="28" height="28" rx="4" />
      <rect x="88%" y="72%" width="28" height="28" rx="4" />
      <rect x="80%" y="78%" width="28" height="28" rx="4" />
      <rect x="84%" y="78%" width="28" height="28" rx="4" />
      <rect x="88%" y="78%" width="28" height="28" rx="4" />
      <rect x="92%" y="78%" width="28" height="60" rx="4" />
    </g>
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
                <Label htmlFor="username">Phone Number</Label>
                <div className="relative">
                  <Input 
                    id="username" 
                    placeholder="Enter your username" 
                    className="pl-10" 
                    onChange={(e) => setUsername(e.target.value)}
                  />
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
                    className="absolute right-3 top-1/2 transform-translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
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
              <Button type="submit" className="w-full  bg-gray-800 hover:bg-gray-500 transition-all duration-200" disabled={isLoading} onClick={handleSubmit}>
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
  );
}
