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
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-80 shrink-0 border-r border-neutral-800 bg-neutral-950 lg:block">
          <CGISidebar />
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <CGITopbar />

          <main className="flex-1 bg-neutral-950 px-4 py-6 sm:px-6 lg:px-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}