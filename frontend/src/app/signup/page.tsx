'use client';

import { GithubIcon, GoogleIcon } from '@/components/icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { initiateGitHubOAuth, initiateGoogleOAuth } from '@/lib/oauth';
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setError(null);
      setIsLoading(true);

      const response = await api.post('/user/auth/register', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      const data = response.data;

      toast({
        title: "Account Created Successfully",
        description: "Welcome to Seentics! Redirecting to sign in...",
        variant: "default",
      });

      // Clear form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });

      // Redirect to signin page after a brief delay
      setTimeout(() => {
        router.push('/signin');
      }, 1500);

    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed');
      toast({
        title: "Registration Failed",
        description: error.message || 'Registration failed',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setError(null);
      setIsLoading(true);
      initiateGoogleOAuth();
    } catch (error: any) {
      console.error('Google sign up error:', error);
      setError(error.message || 'Google sign up failed');
      toast({
        title: "Sign Up Failed",
        description: error.message || 'Google sign up failed',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignUp = async () => {
    try {
      setError(null);
      setIsLoading(true);
      initiateGitHubOAuth();
    } catch (error: any) {
      console.error('GitHub sign up error:', error);
      setError(error.message || 'GitHub sign up failed');
      toast({
        title: "Sign Up Failed",
        description: error.message || 'GitHub sign up failed',
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
            <Logo size="xl" className="w-14 h-14 rounded-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Create account</h1>
          <p className="text-slate-600 dark:text-slate-400">Get started with Seentics</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleEmailSignUp} className="space-y-4 mb-6">
          <div>
            <Input
              name="name"
              type="text"
              placeholder="Full name"
              value={formData.name}
              onChange={handleInputChange}
              className="h-11"
              disabled={isLoading}
            />
          </div>

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

          <div className="relative">
            <Input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="h-11 pr-10"
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-slate-500" />
              ) : (
                <Eye className="h-4 w-4 text-slate-500" />
              )}
            </Button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Password must be at least 8 characters with uppercase, lowercase, and number
          </p>

          <Button
            type="submit"
            className="w-full "
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create account'
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
            onClick={handleGoogleSignUp}
            disabled={isLoading}
          >
            <GoogleIcon className="mr-2 h-4 w-4" />
            Google
          </Button>

          <Button 
            variant="outline" 
            className="w-full h-11"
            onClick={handleGithubSignUp}
            disabled={isLoading}
          >
            <GithubIcon className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link href="/signin" className="text-slate-900 dark:text-white hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
