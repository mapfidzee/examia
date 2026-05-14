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
        <div className="hidden w-80 shrink-0 lg:block">
          <CGISidebar />
        </div>

        <div className="flex min-h-screen flex-1 flex-col">
          <CGITopbar />

          <main className="flex-1 bg-neutral-950 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}