'use client';

import { GithubIcon, GoogleIcon } from '@/components/icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { initiateGitHubOAuth, initiateGoogleOAuth } from '@/lib/oauth';
import { AlertCircle, ArrowLeft, Bot, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Sign in failed');
      }

      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
        variant: "default",
      });

      router.push('/dashboard');

    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message || 'Sign in failed');
      toast({
        title: "Sign In Failed",
        description: error.message || 'Sign in failed',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setIsLoading(true);
      initiateGoogleOAuth();
    } catch (error: any) {
      console.error('Google sign in error:', error);
      setError(error.message || 'Google sign in failed');
      toast({
        title: "Sign In Failed",
        description: error.message || 'Google sign in failed',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      setError(null);
      setIsLoading(true);
      initiateGitHubOAuth();
    } catch (error: any) {
      console.error('GitHub sign in error:', error);
      setError(error.message || 'GitHub sign in failed');
      toast({
        title: "Sign In Failed",
        description: error.message || 'GitHub sign in failed',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-slate-900 dark:bg-white rounded-2xl">
              <Bot className="h-8 w-8 text-white dark:text-slate-900" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome back</h1>
          <p className="text-slate-600 dark:text-slate-400">Sign in to your account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-4 mb-6">
          <div>
            <Input
              name="email"
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleInputChange}
              className="h-11"
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="h-11 pr-10"
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-slate-500" />
              ) : (
                <Eye className="h-4 w-4 text-slate-500" />
              )}
            </Button>
          </div>

          <div className="flex justify-end">
            <Link 
              href="/forgot-password" 
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-950 px-2 text-slate-500 dark:text-slate-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <Button 
            variant="outline" 
            className="w-full h-11"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <GoogleIcon className="mr-2 h-4 w-4" />
            Google
          </Button>

          <Button 
            variant="outline" 
            className="w-full h-11"
            onClick={handleGithubSignIn}
            disabled={isLoading}
          >
            <GithubIcon className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-slate-900 dark:text-white hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
