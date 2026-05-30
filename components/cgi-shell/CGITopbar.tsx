'use client'

import { usePathname } from 'next/navigation'
import { getCGINavigationItemByHref } from '@/app/lib/cgiNavigation'

function getStageLabel(pathname: string) {
  if (pathname === '/request') return 'Visibility Opened'
  if (pathname === '/triage') return 'Eligibility Review'
  if (pathname === '/cases') return 'Case Custody'
  if (pathname === '/routing') return 'Stabilization Direction'
  if (pathname === '/interventions') return 'Action Evidence'
  if (pathname === '/outcomes') return 'Verification'
  if (pathname === '/recovery') return 'Durability Review'
  if (pathname === '/command') return 'Command Overwatch'
  return 'Continuity Intelligence'
}

function getVisibilityClass(pathname: string) {
  if (pathname === '/command') return 'Executive'
  if (
    [
      '/request',
      '/triage',
      '/cases',
      '/routing',
      '/interventions',
      '/outcomes',
      '/recovery',
    ].includes(pathname)
  ) {
    return 'Lifecycle'
  }

  return 'System'
}

function getNextMovement(pathname: string) {
  if (pathname === '/request') return 'Triage'
  if (pathname === '/triage') return 'Cases or Command'
  if (pathname === '/cases') return 'Routing'
  if (pathname === '/routing') return 'Interventions'
  if (pathname === '/interventions') return 'Outcomes'
  if (pathname === '/outcomes') return 'Recovery'
  if (pathname === '/recovery') return 'Memory / Closure'
  if (pathname === '/command') return 'Executive Decision'
  return 'Governed Review'
}

export default function CGITopbar() {
  const pathname = usePathname()
  const currentItem = getCGINavigationItemByHref(pathname)

  return (
    <header className="border-b border-neutral-800 bg-neutral-950/95 px-6 py-4 text-neutral-100">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-cyan-400">
            TSINAXA CGI
          </p>

          <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
            {currentItem?.label ?? 'Continuity Intelligence'}
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
            {currentItem?.description ??
              'Govern visible operational instability until stabilization becomes credible, traceable, and survivable.'}
          </p>
        </div>

        <div className="grid gap-2 text-sm sm:grid-cols-3 xl:min-w-[520px]">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
              Stage
            </p>

            <p className="mt-1 font-semibold text-neutral-100">
              {getStageLabel(pathname)}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
              Visibility
            </p>

            <p className="mt-1 font-semibold text-neutral-100">
              {getVisibilityClass(pathname)}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
              Next
            </p>

            <p className="mt-1 font-semibold text-neutral-100">
              {getNextMovement(pathname)}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}