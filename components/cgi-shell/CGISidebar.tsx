'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cgiNavigationGroups } from '@/app/lib/cgiNavigation'

export default function CGISidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full min-h-screen w-full max-w-80 flex-col border-r border-neutral-800 bg-neutral-950 text-neutral-100">
      <div className="border-b border-neutral-800 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">
          TSINAXA
        </p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-white">
          CGI
        </h1>
        <p className="mt-1 text-sm leading-5 text-neutral-400">
          Continuity Governance Infrastructure
        </p>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
        {cgiNavigationGroups.map((group) => (
          <section key={group.title}>
            <div className="mb-2 px-2">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                {group.title}
              </h2>
              <p className="mt-1 text-xs leading-4 text-neutral-600">
                {group.purpose}
              </p>
            </div>

            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      'block rounded-xl border px-3 py-3 transition',
                      isActive
                        ? 'border-neutral-600 bg-neutral-900 text-white'
                        : 'border-transparent text-neutral-400 hover:border-neutral-800 hover:bg-neutral-900/60 hover:text-neutral-100',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium">{item.label}</span>

                      {item.status !== 'ACTIVE' && (
                        <span className="rounded-full border border-neutral-700 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-500">
                          {item.status === 'FUTURE_RLI' ? 'RLI' : 'Legacy'}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs leading-4 text-neutral-500">
                      {item.description}
                    </p>
                  </Link>
                )
              })}
            </div>
          </section>
        ))}
      </nav>

      <div className="border-t border-neutral-800 px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-600">
          Doctrine
        </p>
        <p className="mt-2 text-sm leading-5 text-neutral-400">
          Discipline. Boundaries. Security. Analytics. Execution.
        </p>
      </div>
    </aside>
  )
}