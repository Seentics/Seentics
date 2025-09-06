'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Bot, Loader2, AlertCircle, Shield, Zap, BarChart3, Users, ArrowLeft } from 'lucide-react';
import { GoogleIcon, GithubIcon } from '@/components/icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { initiateGoogleOAuth, initiateGitHubOAuth } from '@/lib/oauth';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setIsLoading(true);
      console.log('Google login button clicked');
      initiateGoogleOAuth();
    } catch (error: any) {
      console.error('Google login error:', error);
      setError(error.message || 'Google login failed');
      toast({
        title: "Login Failed",
        description: error.message || 'Google login failed',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      setError(null);
      setIsLoading(true);
      console.log('GitHub login button clicked');
      initiateGitHubOAuth();
    } catch (error: any) {
      console.error('GitHub login error:', error);
      setError(error.message || 'GitHub login failed');
      toast({
        title: "Login Failed",
        description: error.message || 'GitHub login failed',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-20 sm:top-6 sm:left-6">
        <Link href="/">
          <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-white/80 dark:hover:bg-slate-800/80 text-sm">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </Link>
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100/30 dark:bg-blue-900/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-100/30 dark:bg-indigo-900/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-7xl flex items-center relative z-10">
        {/* Left Side - Hero Content */}
       
        {/* Right Side - Login Form */}
        <div className="flex justify-center w-full animate-fade-in-up animation-delay-200">
          <Card className="w-full max-w-md shadow-2xl shadow-blue-500/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-3xl">
            <CardHeader className="text-center space-y-4 sm:space-y-6 pb-6 sm:pb-8 px-6 sm:px-8">
              <div className="flex items-center justify-center">
                <div className="p-3 sm:p-4 bg-blue-600 rounded-2xl shadow-lg">
                  <Bot className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <CardTitle className="font-bold text-2xl  text-slate-900 dark:text-slate-100">Welcome to Seentics</CardTitle>
                <CardDescription className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  Sign in to access your analytics dashboard and continue optimizing your website performance.
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 sm:space-y-6 px-6 sm:px-8 pb-6 sm:pb-8">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50/50 dark:bg-red-950/20 rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {/* Security Notice */}
              <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200/50 dark:border-blue-800/30">
                <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg flex-shrink-0">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="text-sm min-w-0">
                  <p className="font-semibold text-blue-900 dark:text-blue-100">Secure OAuth Authentication</p>
                  <p className="text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">Your account is protected with industry-standard OAuth from Google and GitHub.</p>
                </div>
              </div>

              {/* OAuth Buttons */}
              <div className="space-y-3 sm:space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full h-12 sm:h-14 text-base font-semibold border-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 hover:shadow-lg transition-all duration-300 rounded-xl group"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      <span className="text-sm sm:text-base">Signing in...</span>
                    </>
                  ) : (
                    <>
                      <GoogleIcon className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-sm sm:text-base">Continue with Google</span>
                    </>
                  )}
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full h-12 sm:h-14 text-base font-semibold border-2 border-slate-200 dark:border-slate-700 hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 hover:shadow-lg transition-all duration-300 rounded-xl group"
                  onClick={handleGithubLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      <span className="text-sm sm:text-base">Signing in...</span>
                    </>
                  ) : (
                    <>
                      <GithubIcon className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-sm sm:text-base">Continue with GitHub</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Footer Links */}
              <div className="text-center space-y-2 sm:space-y-3 pt-4">
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  By signing in, you agree to our{' '}
                  <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline underline-offset-2 hover:no-underline transition-colors duration-200">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline underline-offset-2 hover:no-underline transition-colors duration-200">Privacy Policy</Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
