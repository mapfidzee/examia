import Link from 'next/link'

const quickGroups = [
  {
    title: 'Lifecycle',
    links: [
      { label: 'Request', href: '/request' },
      { label: 'Triage', href: '/triage' },
      { label: 'Cases', href: '/cases' },
      { label: 'Routing', href: '/routing' },
      { label: 'Interventions', href: '/interventions' },
      { label: 'Outcomes', href: '/outcomes' },
      { label: 'Recovery', href: '/recovery' },
    ],
  },
  {
    title: 'Executive',
    links: [
      { label: 'Situation Room', href: '/situation-room' },
      { label: 'Executive Center', href: '/executive-center' },
      { label: 'Command', href: '/command' },
      { label: 'Executive Report', href: '/executive-report' },
    ],
  },
  {
    title: 'Intelligence',
    links: [
      { label: 'Pressure', href: '/pressure' },
      { label: 'Trajectory', href: '/trajectory' },
      { label: 'Predictive', href: '/predictive' },
      { label: 'Reliability', href: '/reliability' },
      { label: 'Bottlenecks', href: '/bottlenecks' },
    ],
  },
]

export default function InfrastructureQuickNav() {
  return (
    <nav className="rounded-3xl border border-[#2a2418] bg-[#070707]/95 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-400">
              TSINAXA CGI
            </p>

            <h2 className="mt-1 text-lg font-black text-white">
              Executive Continuity Navigation
            </h2>
          </div>

          <Link
            href="/system"
            className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-center text-sm font-semibold text-amber-100 transition hover:border-amber-400 hover:bg-amber-500/20"
          >
            System Stability Board
          </Link>
        </div>

        <div className="space-y-4">
          {quickGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-neutral-500">
                {group.title}
              </p>

              <div className="flex flex-wrap gap-2">
                {group.links.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-[#2a2418] bg-[#111827]/40 px-4 py-2 text-xs font-semibold text-neutral-200 transition hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}