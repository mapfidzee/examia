'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cgiNavigationGroups } from '@/app/lib/cgiNavigation'

export default function CGISidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full min-h-screen w-full max-w-72 flex-col border-r border-neutral-800 bg-neutral-950 text-neutral-100">
      <div className="border-b border-neutral-800 px-5 py-5">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-400">
          TSINAXA CGI
        </p>

        <h1 className="mt-2 text-lg font-black tracking-tight text-white">
          Executive Continuity Intelligence
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-7">
          {cgiNavigationGroups.map((group) => (
            <section key={group.title}>
              <div className="mb-3 px-2">
                <h2 className="text-[11px] font-black uppercase tracking-[0.22em] text-neutral-500">
                  {group.title}
                </h2>
              </div>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={[
                        'block rounded-xl border px-3 py-2.5 transition',
                        isActive
                          ? 'border-cyan-500/60 bg-cyan-500/10 text-white'
                          : 'border-transparent text-neutral-400 hover:border-neutral-800 hover:bg-neutral-900/70 hover:text-neutral-100',
                      ].join(' ')}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold">
                          {item.label}
                        </span>

                        {item.status !== 'ACTIVE' && (
                          <span className="rounded-full border border-neutral-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                            {item.status === 'FUTURE_RLI' ? 'RLI' : 'Legacy'}
                          </span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </nav>
    </aside>
  )
}