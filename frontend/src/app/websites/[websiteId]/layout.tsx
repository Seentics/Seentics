import Header from '@/components/header'
import Sidebar from '@/components/sidebar'
import React from 'react'
import TrackerScript from '@/components/tracker-script'


interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="relative min-h-screen bg-slate-300 dark:bg-slate-950">
      <TrackerScript />
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden ">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-900 ">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}