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
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
            TSINAXA CGI
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
            {currentItem?.label ?? 'Continuity Governance Infrastructure'}
          </h1>

          <p className="mt-1 max-w-3xl text-sm leading-5 text-neutral-400">
            {currentItem?.description ??
              'Govern active instability until operations reach stabilization threshold.'}
          </p>
        </div>

        <div className="grid gap-2 text-sm sm:grid-cols-3 lg:min-w-[520px]">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
              System
            </p>
            <p className="mt-1 font-medium text-neutral-100">
              Continuity Governance
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
              Boundary
            </p>
            <p className="mt-1 font-medium text-neutral-100">
              Stabilization Threshold
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
              Mode
            </p>
            <p className="mt-1 font-medium text-neutral-100">
              Governed Execution
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}