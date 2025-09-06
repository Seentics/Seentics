'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import api from '@/lib/api'

type Usage = { websites: number; workflows: number; monthlyEvents: number }
type Limits = { websites: number; workflows: number; monthlyEvents: number }

export default function UpgradeBanner() {
  const [visible, setVisible] = useState(false)
  const [checked, setChecked] = useState(false)
  const barRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const resp = await api.get('/user/subscriptions/usage')
        const data = resp?.data?.data as { plan: string; usage: Usage; limits: Limits }
        if (!data) { setChecked(true); return }
        const reached = data.plan === 'free' && (
          (data.usage?.websites ?? 0) >= (data.limits?.websites ?? Infinity) ||
          (data.usage?.workflows ?? 0) >= (data.limits?.workflows ?? Infinity) ||
          (data.usage?.monthlyEvents ?? 0) >= (data.limits?.monthlyEvents ?? Infinity)
        )
        setVisible(reached)
        setChecked(true)
      } catch {
        setChecked(true)
      }
    })()
  }, [])

  // Update CSS var with current banner height so layout can offset header
  useEffect(() => {
    const setVar = (px: number) => {
      if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--upgrade-banner-height', `${px}px`)
      }
    }
    if (visible) {
      const h = barRef.current?.offsetHeight ?? 40
      setVar(h)
    } else {
      setVar(0)
    }
    return () => setVar(0)
  }, [visible])

  if (!checked || !visible) return null

  return (
    <div ref={barRef} className="fixed inset-x-0 top-0 z-50 bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
      <div className="text-sm">
        <span className="font-medium">Free plan limit reached.</span> Upgrade to create more websites/workflows and increase monthly events.
      </div>
      <div className="flex items-center gap-3">
        <Link href="/#pricing" className="shrink-0">
          <span className="inline-flex items-center rounded-md bg-blue-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-blue-700">Upgrade plan</span>
        </Link>
        <button
          aria-label="Dismiss"
          className="p-1 rounded hover:bg-amber-100/50 dark:hover:bg-amber-800/50"
          onClick={() => {
            setVisible(false)
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}


