'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/stores/useAuthStore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import api from '@/lib/api';

function GoogleCallbackContent() {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          setError('Google authentication was cancelled or failed.');
          setIsProcessing(false);
          return;
        }

        if (!code) {
          setError('No authorization code received from Google.');
          setIsProcessing(false);
          return;
        }

        // Exchange code for tokens via backend
        const response = await api.post('/user/auth/google', { code });

        if (response.data?.success) {
          const { user, subscription, tokens } = response.data.data;
          
          // Debug: Log the actual response to see user data structure
          console.log('Google OAuth response:', response.data.data)
          console.log('User object from backend:', user)
          
          setAuth({
            user,
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
          });

          toast({
            title: "Login Successful",
            description: `Welcome back, ${user?.name || 'User'}!`,
          });

          // Redirect to dashboard or intended page
          router.push('/websites');
        } else {
          throw new Error('Failed to authenticate with Google');
        }
      } catch (error: any) {
        console.error('Google OAuth error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Google authentication failed';
        setError(errorMessage);
        toast({
          title: "Authentication Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    handleGoogleCallback();
  }, [searchParams, router, setAuth, toast]);

  if (isProcessing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Logo size="xl" />
            </div>
            <CardTitle className="font-headline text-2xl">Authenticating with Google</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Please wait while we complete your authentication...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Logo size="xl" />
            </div>
            <CardTitle className="font-headline text-2xl">Authentication Failed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <button
              onClick={() => router.push('/signin')}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors"
            >
              Back to Sign In
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md shadow-2xl shadow-primary/10 p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
