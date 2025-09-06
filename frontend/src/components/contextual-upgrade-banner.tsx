'use client'

import { AlertTriangle, X, TrendingUp, Globe, Zap } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface UsageData {
  websites?: number
  workflows?: number
  monthlyEvents?: number
  aiOptimizations?: number
}

interface LimitsData {
  websites: number
  workflows: number
  monthlyEvents: number
  aiOptimizations: number
}

interface ContextualUpgradeBannerProps {
  type: 'websites' | 'workflows' | 'monthlyEvents' | 'aiOptimizations'
  current: number
  limit: number
  plan: string
  className?: string
  showProgress?: boolean
  dismissible?: boolean
  onDismiss?: () => void
}

const typeConfig = {
  websites: {
    icon: Globe,
    title: 'Website Limit',
    description: 'websites',
    color: 'blue',
    upgradePath: '/websites/billing'
  },
  workflows: {
    icon: Zap,
    title: 'Workflow Limit',
    description: 'workflows',
    color: 'purple',
    upgradePath: '/websites/billing'
  },
  monthlyEvents: {
    icon: TrendingUp,
    title: 'Monthly Events',
    description: 'monthly events',
    color: 'green',
    upgradePath: '/websites/billing'
  },
  aiOptimizations: {
    icon: TrendingUp,
    title: 'AI Optimizations',
    description: 'AI optimizations',
    color: 'orange',
    upgradePath: '/websites/billing'
  }
}

export default function ContextualUpgradeBanner({
  type,
  current,
  limit,
  plan,
  className = '',
  showProgress = true,
  dismissible = true,
  onDismiss
}: ContextualUpgradeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const config = typeConfig[type]
  const IconComponent = config.icon
  const usagePercentage = Math.min(100, (current / limit) * 100)
  const isAtLimit = current >= limit
  const isNearLimit = usagePercentage >= 80

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  if (isDismissed || (!isAtLimit && !isNearLimit)) {
    return null
  }

  const getBannerVariant = () => {
    if (isAtLimit) return 'destructive'
    if (isNearLimit) return 'secondary'
    return 'default'
  }

  const getBannerColors = () => {
    if (isAtLimit) {
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100'
    }
    if (isNearLimit) {
      return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100'
    }
    return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100'
  }

  const getIconColor = () => {
    if (isAtLimit) return 'text-red-600 dark:text-red-400'
    if (isNearLimit) return 'text-amber-600 dark:text-amber-400'
    return 'text-blue-600 dark:text-blue-400'
  }

  return (
    <div className={`p-4 border rounded-lg ${getBannerColors()} ${className}`}>
      <div className="flex items-start gap-3">
        <IconComponent className={`h-5 w-5 mt-0.5 flex-shrink-0 ${getIconColor()}`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-sm">
              {isAtLimit ? `${config.title} Reached` : `${config.title} Warning`}
            </h4>
            <Badge variant={getBannerVariant()} className="text-xs">
              {plan === 'free' ? 'Free Plan' : plan}
            </Badge>
          </div>
          
          <p className="text-sm mb-3">
            {isAtLimit 
              ? `You've used all ${limit} ${config.description} on your ${plan} plan.`
              : `You've used ${current} of ${limit} ${config.description} (${usagePercentage.toFixed(0)}%).`
            }
            {isAtLimit && ' Upgrade to create more and unlock additional features.'}
          </p>

          {showProgress && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Usage</span>
                <span>{current} / {limit}</span>
              </div>
              <Progress 
                value={usagePercentage} 
                className="h-2"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button size="sm" asChild>
              <Link href={config.upgradePath}>
                {isAtLimit ? 'Upgrade Plan' : 'View Plans'}
              </Link>
            </Button>
            
            {dismissible && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleDismiss}
                className="text-xs"
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>

        {dismissible && (
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// Usage summary component for showing multiple limits at once
export function UsageSummaryBanner({
  usage,
  limits,
  plan,
  className = ''
}: {
  usage: UsageData
  limits: LimitsData
  plan: string
  className?: string
}) {
  const [isDismissed, setIsDismissed] = useState(false)
  
  const usageItems = [
    { type: 'websites' as const, current: usage.websites || 0, limit: limits.websites },
    { type: 'workflows' as const, current: usage.workflows || 0, limit: limits.workflows },
    { type: 'monthlyEvents' as const, current: usage.monthlyEvents || 0, limit: limits.monthlyEvents },
    { type: 'aiOptimizations' as const, current: usage.aiOptimizations || 0, limit: limits.aiOptimizations }
  ]

  const atLimitItems = usageItems.filter(item => item.current >= item.limit)
  const nearLimitItems = usageItems.filter(item => 
    item.current < item.limit && (item.current / item.limit) >= 0.8
  )

  if (isDismissed || (atLimitItems.length === 0 && nearLimitItems.length === 0)) {
    return null
  }

  return (
    <div className={`p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 ${className}`}>
      <div className="flex items-start gap-3">
        <TrendingUp className="h-5 w-5 mt-0.5 text-slate-600 dark:text-slate-400" />
        
        <div className="flex-1">
          <h4 className="font-medium text-sm mb-3">
            Plan Usage Summary
          </h4>
          
          <div className="space-y-3">
            {atLimitItems.map(item => (
              <ContextualUpgradeBanner
                key={item.type}
                type={item.type}
                current={item.current}
                limit={item.limit}
                plan={plan}
                showProgress={false}
                dismissible={false}
                className="!p-3 !border-0 !bg-transparent"
              />
            ))}
            
            {nearLimitItems.map(item => (
              <ContextualUpgradeBanner
                key={item.type}
                type={item.type}
                current={item.current}
                limit={item.limit}
                plan={plan}
                showProgress={false}
                dismissible={false}
                className="!p-3 !border-0 !bg-transparent"
              />
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button size="sm" asChild>
              <Link href="/websites/settings">
                View All Plans
              </Link>
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setIsDismissed(true)}
            >
              Dismiss
            </Button>
          </div>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
