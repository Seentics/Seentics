import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/stores/useAuthStore';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export function useAuthGuard() {
  const { 
    isAuthenticated, 
    user, 
    access_token, 
    refresh_token, 
    isTokenExpired, 
    logout, 
    setTokens,
    setLoading 
  } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated || !user) {
        router.push('/signin');
        return;
      }

      // Check if token is expired
      if (isTokenExpired()) {
        await refreshToken();
      }
    };

    checkAuth();
  }, [isAuthenticated, user, isTokenExpired, router]);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    if (!refresh_token) {
      logout();
      router.push('/signin');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/user/auth/refresh', {
        refresh_token,
      });

      const { accessToken, refreshToken } = response.data;
      
      setTokens({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      toast({
        title: "Session Refreshed",
        description: "Your session has been refreshed successfully.",
      });
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      router.push('/signin');
      toast({
        title: "Session Expired",
        description: "Please sign in again to continue.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [refresh_token, setTokens, logout, router, toast, setLoading]);

  // Auto-refresh token before it expires
  useEffect(() => {
    if (!access_token) return;

    const checkTokenExpiry = () => {
      if (isTokenExpired()) {
        refreshToken();
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkTokenExpiry, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [access_token, isTokenExpired, refreshToken]);

  return {
    isAuthenticated,
    user,
    isLoading: false, // You can add loading state from auth store
    logout,
    refreshToken,
  };
}

// Hook for protecting specific components
export function useRequireAuth(redirectTo = '/signin') {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return {
    isAuthenticated,
    user,
    isLoading,
  };
} 