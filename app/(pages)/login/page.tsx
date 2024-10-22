"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import { setCookie } from 'nookies'; // Import nookies for cookie handling

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
    // ... other properties if needed
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${BaseUrl}/adm/admins/login`, {
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
        const data: AuthResponse = await response.json();
        const token = data.token; 
        
        // Store the token in a cookie
        setCookie(null, 'token', token, {
          maxAge: 30 * 24 * 60 * 60, // 30 days expiration
          path: '/',
          secure: process.env.NODE_ENV === 'production', // Only secure cookies in production
          httpOnly: true, // More secure: only accessible by the server
        });

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
      {/* background */}
      <div className="absolute inset-0 z-0">
        {/* SVG background code */}
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
  );
}
