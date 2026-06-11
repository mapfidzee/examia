import Link from 'next/link'
import InfrastructureNav from '@/components/InfrastructureNav'
import { buildCGIInfrastructureDoctrine } from '@/lib/cgiInfrastructureDoctrineEngine'

export default function InfrastructurePage() {
  const infrastructure = buildCGIInfrastructureDoctrine()

  return (
    <main className="min-h-screen bg-[#07111F] text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:px-8 lg:px-10">
        <InfrastructureNav />

        <header className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            TSINAXA CGI
          </div>

          <h1 className="max-w-5xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {infrastructure.title}
          </h1>

          <p className="mt-3 text-xl font-black text-emerald-200 sm:text-2xl">
            {infrastructure.subtitle}
          </p>

          <p className="mt-5 max-w-4xl text-base leading-8 text-slate-300 sm:text-lg">
            {infrastructure.thesis}
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {infrastructure.commandSignals.map((signal) => (
            <div
              key={signal.label}
              className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {signal.label}
              </p>
              <p className="mt-3 text-2xl font-bold text-cyan-300">
                {signal.value}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {signal.cue}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-cyan-400/25 bg-cyan-400/10 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
            Locked Doctrine
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Continuity Must Be Governed Until Stabilization Is Credible
          </h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {infrastructure.doctrine.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-cyan-400/20 bg-[#07111F]/70 p-4 text-sm font-bold leading-6 text-cyan-100"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8 lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Institutional Adoption Pathway
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              From First Review to Governed Continuity Intelligence
            </h2>

            <p className="mt-4 leading-8 text-slate-300">
              {infrastructure.adoptionPathwayMeaning}
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-400/25 bg-cyan-400/10 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
              Category Lock
            </p>

            <h2 className="mt-2 text-xl font-bold text-white">
              {infrastructure.categoryLock}
            </h2>

            <p className="mt-4 leading-7 text-slate-200">
              {infrastructure.categoryMeaning}
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
            Adoption Lifecycle
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Institutional Activation Stages
          </h2>

          <div className="mt-6 grid gap-4 lg:grid-cols-5">
            {infrastructure.adoptionStages.map((item) => (
              <div
                key={item.status}
                className="rounded-3xl border border-blue-900/60 bg-[#07111F] p-5"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10 text-sm font-black text-cyan-200">
                  {item.stage}
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
                  {item.status}
                </p>

                <h3 className="mt-2 text-lg font-bold text-white">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {item.meaning}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Deployment Readiness
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Readiness Checklist Before Activation
            </h2>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {infrastructure.readinessChecks.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-blue-900/60 bg-[#07111F] p-4 text-sm font-semibold text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-400/25 bg-cyan-400/10 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
              Deployment Guardrails
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Governance Rules That Protect Trust
            </h2>

            <div className="mt-6 grid gap-4">
              {infrastructure.deploymentLocks.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-cyan-400/20 bg-[#07111F]/70 p-4"
                >
                  <h3 className="text-base font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
            Core Intelligence Routes
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Continuity Governance Access
          </h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {infrastructure.accessRoutes.map((route) => (
              <GatewayLink
                key={route.href}
                label={route.label}
                href={route.href}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Next Hardening Layer
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              {infrastructure.nextHardeningTitle}
            </h2>

            <p className="mt-4 leading-8 text-slate-300">
              {infrastructure.nextHardeningMeaning}
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-400/25 bg-cyan-400/10 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
              System Boundary
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              {infrastructure.systemBoundaryTitle}
            </h2>

            <p className="mt-4 leading-8 text-slate-200">
              {infrastructure.systemBoundaryMeaning}
            </p>
          </div>
        </section>
      </section>
    </main>
  )
}

function GatewayLink({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-blue-900/60 bg-[#07111F] p-4 text-sm font-semibold text-slate-200 transition hover:border-cyan-300 hover:bg-[#102744] hover:text-cyan-100"
    >
      {label}
      <div className="mt-1 text-xs font-normal text-slate-500">{href}</div>
    </Link>
  )
}