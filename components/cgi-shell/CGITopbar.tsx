'use client'

import { usePathname } from 'next/navigation'
import { getCGINavigationItemByHref } from '@/app/lib/cgiNavigation'

export default function CGITopbar() {
  const pathname = usePathname()
  const currentItem = getCGINavigationItemByHref(pathname)

  return (
    <header className="border-b border-neutral-800 bg-neutral-950/95 px-6 py-4 text-neutral-100">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-400">
            TSINAXA CGI
          </p>

          <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
            {currentItem?.label ?? 'Continuity Governance Infrastructure'}
          </h1>

          <p className="mt-2 text-sm font-semibold text-emerald-300">
            Executive Continuity Intelligence Infrastructure
          </p>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
            {currentItem?.description ??
              'Govern visible operational instability until stabilization becomes credible, traceable, and survivable.'}
          </p>
        </div>

        <div className="grid gap-2 text-sm sm:grid-cols-3 lg:min-w-[560px]">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
              Infrastructure
            </p>

            <p className="mt-1 font-semibold text-neutral-100">
              Continuity Governance
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
              Executive Boundary
            </p>

            <p className="mt-1 font-semibold text-neutral-100">
              Stabilization Visibility
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
              Operational Mode
            </p>

            <p className="mt-1 font-semibold text-neutral-100">
              Governed Continuity Intelligence
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}