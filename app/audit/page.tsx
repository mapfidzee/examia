'use client'

import InfrastructureQuickNav from '@/components/InfrastructureQuickNav'

export default function AuditPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">

        <InfrastructureQuickNav />

        <header className="rounded-3xl border border-cyan-900/40 bg-[#0B1120] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
                EXAMIA AUDIT INFRASTRUCTURE
              </p>

              <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
                Governance Audit Visibility
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
                EXAMIA audit infrastructure preserves traceability,
                stabilization visibility, continuity review, routing integrity,
                and governance-safe operational interpretation across the
                stabilization ecosystem.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <SignalCard
                label="Audit Integrity"
                value="TRACEABLE"
              />

              <SignalCard
                label="Governance Status"
                value="ACTIVE"
              />

              <SignalCard
                label="Continuity Review"
                value="VISIBLE"
              />

              <SignalCard
                label="Operational Meaning"
                value="NON-PUNITIVE"
              />
            </div>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-3">

          <div className="rounded-3xl border border-cyan-900/40 bg-[#07101F] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
              Audit Purpose
            </p>

            <h2 className="mt-3 text-2xl font-black text-white">
              Structural Traceability
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              Audit visibility ensures that stabilization pathways remain
              governable, reviewable, explainable, and operationally coherent
              without shifting into blame, surveillance, or responder ranking.
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-900/40 bg-[#07101F] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
              Governance Boundary
            </p>

            <h2 className="mt-3 text-2xl font-black text-white">
              Operational Interpretation
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              EXAMIA audit infrastructure reviews routing, continuity,
              intervention movement, stabilization pressure, recovery visibility,
              and governance alignment. It does not diagnose, punish, or profile
              individuals.
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-900/40 bg-[#07101F] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
              System Commitment
            </p>

            <h2 className="mt-3 text-2xl font-black text-white">
              Trust Preservation
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              Governance-safe audit infrastructure strengthens institutional
              trust, stabilization coordination, continuity reliability, and
              structural visibility across high-pressure operational systems.
            </p>
          </div>

        </section>

        <section className="rounded-3xl border border-cyan-900/40 bg-[#07101F] p-6 sm:p-8">

          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
            Governance Reminder
          </p>

          <h2 className="mt-3 text-3xl font-black text-white">
            Visibility Without Blame
          </h2>

          <p className="mt-5 max-w-4xl text-base leading-8 text-slate-300">
            EXAMIA audit infrastructure exists to preserve operational clarity,
            stabilization visibility, continuity review, and governance
            traceability. The infrastructure must remain healthcare-first,
            structural, governed, and non-punitive at all times.
          </p>

        </section>

      </section>
    </main>
  )
}

function SignalCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-cyan-800/40 bg-[#020817] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-lg font-black text-cyan-300">
        {value}
      </p>
    </div>
  )
}