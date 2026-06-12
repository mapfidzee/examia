'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cgiNavigationGroups } from '@/app/lib/cgiNavigation'

export default function CGISidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full min-h-screen w-full max-w-72 flex-col border-r border-[#3b2f16] bg-[#050505] text-neutral-100 shadow-[18px_0_50px_rgba(0,0,0,0.35)]">
      <div className="border-b border-[#3b2f16] bg-[radial-gradient(circle_at_top_left,rgba(214,178,94,0.14),transparent_42%)] px-5 py-5">
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#d6b25e]">
          TSINAXA CGI
        </p>

        <h1 className="mt-2 text-lg font-black leading-tight tracking-tight text-[#fff8e7]">
          Executive Continuity Intelligence
        </h1>

        <p className="mt-2 text-xs leading-5 text-[#cfc7b5]/70">
          Continuity Governance Infrastructure
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-7">
          {cgiNavigationGroups.map((group) => (
            <section key={group.title}>
              <div className="mb-3 px-2">
                <h2 className="text-[10px] font-black uppercase tracking-[0.24em] text-[#9f8142]">
                  {group.title}
                </h2>

                <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-neutral-600">
                  {group.purpose}
                </p>
              </div>

              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={item.description}
                      className={[
                        'block rounded-xl border px-3 py-2.5 transition-all duration-200',
                        isActive
                          ? 'border-[#d6b25e]/70 bg-[#d6b25e]/12 text-[#fff8e7] shadow-[0_0_0_1px_rgba(214,178,94,0.2),0_12px_30px_rgba(0,0,0,0.28)]'
                          : 'border-transparent text-neutral-400 hover:border-[#3b2f16] hover:bg-[#11100d] hover:text-[#fff8e7]',
                      ].join(' ')}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[13px] font-bold leading-5">
                          {item.label}
                        </span>

                        {item.status !== 'ACTIVE' && (
                          <span className="rounded-full border border-[#3b3424] bg-[#16120a] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-[#d6b25e]">
                            {item.status === 'FUTURE_RLI'
                              ? 'RLI'
                              : 'Legacy'}
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