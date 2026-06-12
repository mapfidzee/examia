import type { ReactNode } from 'react'

import CGISidebar from './CGISidebar'
import CGITopbar from './CGITopbar'

type CGIGovernanceShellProps = {
  children: ReactNode
}

export default function CGIGovernanceShell({
  children,
}: CGIGovernanceShellProps) {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-80 shrink-0 border-r border-[#2a2418] bg-[#070707] lg:block">
          <CGISidebar />
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <CGITopbar />

          <main className="flex-1 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.08),transparent_32%),linear-gradient(180deg,#050505_0%,#0b0b0b_45%,#111827_100%)] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}