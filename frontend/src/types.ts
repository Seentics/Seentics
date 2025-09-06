export type User = {
    email: string
    name: string
    avatar: string | null
    isEmailVerified: boolean
    isActive: boolean
    loginCount: number
    _id: string
    id: string
    lastLoginAt: string
    createdAt: string
    updatedAt: string
    // OAuth fields
    googleId?: string
    githubId?: string
    // Helper methods
    isOAuthUser?: () => boolean
    getOAuthProvider?: () => string
  }
  
  export type Subscription = {
    userId: string
    lemonSqueezyId: string
    orderId: string
    productId: string
    plan: string
    status: string
    trialEndsAt: string | null
    renewsAt: string | null
    endsAt: string | null
    limits: {
      websites: number
      workflows: number
      monthlyEvents: number
      aiOptimizations: number
    }
    usage: {
      websites: number
      workflows: number
      monthlyEvents: number
      aiOptimizations: number
    }
    _id: string
    createdAt: string
    updatedAt: string
    __v: number
  }
  
  export type AuthState = {
  user: User | null
  subscription: Subscription | null
  access_token: string | null
  refresh_token: string | null
  isAuthenticated: boolean
  rememberMe: boolean
  isLoading: boolean
  setAuth: (data: {
    user: User
    subscription: Subscription
    access_token: string
    refresh_token: string
    rememberMe?: boolean
  }) => void
  setUser: (user: User) => void
  setTokens: (data: { access_token: string; refresh_token: string }) => void
  setRememberMe: (rememberMe: boolean) => void
  setLoading: (isLoading: boolean) => void
  logout: () => void
  resetAuth: () => void
  isTokenExpired: () => boolean
  getTokenExpiration: () => Date | null
}
  