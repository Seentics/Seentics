'use client'

import React, { useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  X,
  Home, 
  BarChart3, 
  Workflow, 
  Globe, 
  Settings, 
  ChevronDown,
  Activity,
  Zap,
  TrendingUp,
  Users,
  LogOut,
  Bot,
  FileText,
  CreditCard,
  HelpCircle,
  Shield,
  Target
} from 'lucide-react'
import { useLayoutStore } from '@/stores/useLayoutStore'


interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: string
  children?: NavItem[]
}

export default function Sidebar() {
  const { 
    isSidebarOpen, 
    isMobileMenuOpen, 
    expandedItems, 
    toggleMobileMenu,
    toggleExpanded,
    closeMobileMenu 
  } = useLayoutStore()
  const pathname = usePathname()
  const params = useParams();
  const websiteId = params.websiteId
  
  // Detect if we're in the demo context
  const isDemoContext = pathname.startsWith('/demo')
  
  // Generate navigation items based on context
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '', icon: Home },
      { 
        name: 'Analytics', 
        href: 'analytics', 
        icon: BarChart3,
      },
      { 
        name: 'Workflows', 
        href: 'workflows', 
        icon: Workflow,
      },
      { 
        name: 'Funnels', 
        href: 'funnels', 
        icon: Target,
      },

    ];
    
    // Add website-specific items only in website context
    if (!isDemoContext) {
      baseItems.push(
        { 
          name: 'Templates', 
          href: 'templates', 
          icon: FileText,
        },
        { 
          name: 'Billing', 
          href: 'billing', 
          icon: CreditCard,
        },
        { 
          name: 'Privacy', 
          href: 'privacy', 
          icon: Shield,
        },
        { 
          name: 'Support', 
          href: 'support', 
          icon: HelpCircle,
        },
        
      );
    }
    
    
    return baseItems;
  };
  
  const navigationItems = getNavigationItems();

  // Close mobile menu when route changes
  useEffect(() => {
    closeMobileMenu()
  }, [pathname, closeMobileMenu])

  const isActive = (href: string) => {
    if (isDemoContext) {
      const fullHref = `/demo${href === '' ? '' : `/${href}`}`
      return pathname === fullHref
    } else {
      const fullHref = `/websites/${websiteId}${href === '' ? '' : `/${href}`}`
      return pathname === fullHref
    }
  }
  
  const getBasePath = () => {
    if (isDemoContext) {
      return '/demo'
    } else {
      return `/websites/${websiteId}`
    }
  }

  const isExpanded = (itemName: string) => expandedItems.includes(itemName)

  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logging out...')
  }

  const renderNavItem = (item: NavItem, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0
    const active = isActive(item.href)
    const expanded = isExpanded(item.name)
    const basePath = getBasePath()

    return (
      <div key={item.name}>
        <div className="flex items-center">
          <Link
            href={`${basePath}${item.href === '' ? '' : `/${item.href}`}`}
            className={`flex items-center justify-center flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg ${
              active
                ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-200/50 dark:border-blue-700/50'
                : 'text-slate-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 hover:shadow-sm'
            } ${isChild ? 'ml-4 pl-7' : ''}`}
          >
            <item.icon 
              className={`mr-3 h-5 w-5 ${active ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`} 
            />
            {(isSidebarOpen || isMobileMenuOpen) && (
              <>
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className="ml-2 px-2 py-1 text-xs font-semibold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-full border border-red-200 dark:border-red-800 shadow-sm">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </Link>
          {hasChildren && (isSidebarOpen || isMobileMenuOpen) && (
            <button
              onClick={() => toggleExpanded(item.name)}
              className="p-1.5 ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              <ChevronDown 
                className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              />
            </button>
          )}
        </div>
        {hasChildren && expanded && (isSidebarOpen || isMobileMenuOpen) && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderNavItem(child, true))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`${
        isSidebarOpen ? 'w-64' : 'w-16'
      } hidden lg:block transition-all duration-300 ease-in-out bg-white dark:bg-slate-900 shadow-lg border-r border-gray-200/60 dark:border-gray-700/60`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-4 border-b border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <Bot className="size-6 text-white" />
              </div>
              {isSidebarOpen && (
                <div className="flex items-center gap-2">
                  <span className="ml-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                    Seentics
                  </span>
                  {isDemoContext && (
                    <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800">
                      DEMO
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
            {navigationItems.map(item => renderNavItem(item))}
          </nav>

          {/* Logout Button */}
          <div className="px-4 py-4 border-t border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:shadow-sm transition-all duration-200 group"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
              {isSidebarOpen && <span>Sign out</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-gray-600/80 dark:bg-gray-900/80 backdrop-blur-sm"
            onClick={toggleMobileMenu}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-900 shadow-xl">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={toggleMobileMenu}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-white dark:bg-gray-800 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <X className="h-6 w-6 text-gray-700 dark:text-gray-200" />
              </button>
            </div>
            
            {/* Mobile menu content */}
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="ml-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                    Seentics
                  </span>
                  {isDemoContext && (
                    <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800">
                      DEMO
                    </span>
                  )}
                </div>
              </div>
              <nav className="mt-5 px-2 space-y-2">
                {navigationItems.map(item => renderNavItem(item))}
                
                {/* Mobile Logout */}
                <div className="pt-4 border-t border-gray-200/60 dark:border-gray-700/60">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:shadow-sm transition-all duration-200 group"
                  >
                    <LogOut className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                    <span>Sign out</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  )
}