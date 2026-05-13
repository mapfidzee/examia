import Link from 'next/link'
import InfrastructureNav from '@/components/InfrastructureNav'

const commandSignals = [
  {
    label: 'Command Readiness',
    value: 'ACTIVE',
    cue: 'Executive continuity oversight is available',
  },
  {
    label: 'Onboarding Pathway',
    value: 'STRUCTURED',
    cue: 'Institutional adoption steps are visible',
  },
  {
    label: 'Recovery Protocol',
    value: 'REQUIRED',
    cue: 'Continuity survival rules must be formalized',
  },
  {
    label: 'Governance Boundary',
    value: 'LOCKED',
    cue: 'TSINAXA and EXAMIA remain separate systems',
  },
]

const onboardingStages = [
  {
    stage: '1',
    title: 'Institution Registered',
    status: 'REGISTERED',
    meaning:
      'The institution, site, partner, district office, NGO, or operating unit is known to EXAMIA.',
  },
  {
    stage: '2',
    title: 'Governance Review',
    status: 'UNDER_REVIEW',
    meaning:
      'Leadership, scope, access, coordination boundaries, and safety rules are reviewed before activation.',
  },
  {
    stage: '3',
    title: 'Readiness Confirmation',
    status: 'GOVERNANCE_PENDING',
    meaning:
      'Responder pathways, escalation routes, audit expectations, and recovery ownership are confirmed.',
  },
  {
    stage: '4',
    title: 'Deployment Approved',
    status: 'READY_FOR_DEPLOYMENT',
    meaning:
      'The institution is ready to use EXAMIA for governed continuity response.',
  },
  {
    stage: '5',
    title: 'Continuity Operations Active',
    status: 'ACTIVE',
    meaning:
      'Visible disruption can now move through routing, response, evidence, recovery, and audit memory.',
  },
]

const readinessChecks = [
  'Institution profile identified',
  'Command owner assigned',
  'Governance officer identified',
  'Responder pathway defined',
  'Escalation route confirmed',
  'Audit expectations accepted',
  'Recovery confirmation process understood',
  'Data boundary and privacy rules acknowledged',
  'Non-punitive interpretation accepted',
  'Deployment support owner identified',
]

const deploymentLocks = [
  {
    title: 'No Hidden Surveillance',
    text: 'EXAMIA governs visible disruption pathways. It does not monitor private behavior or rank people.',
  },
  {
    title: 'No Clinical Replacement',
    text: 'EXAMIA supports coordination, continuity, routing, recovery, and governance. It does not diagnose or prescribe.',
  },
  {
    title: 'No Blame Logic',
    text: 'Signals are interpreted at system level. The purpose is stabilization, not punishment.',
  },
  {
    title: 'Trace Until Stabilized',
    text: 'Disruption should not disappear after it is noticed. Ownership, evidence, recovery, and memory must remain visible.',
  },
]

const accessRoutes = [
  { label: 'Executive Command', href: '/command' },
  { label: 'Operational Audit', href: '/audit' },
  { label: 'Routing Intelligence', href: '/routing' },
  { label: 'Case Governance', href: '/cases' },
  { label: 'Interventions', href: '/interventions' },
  { label: 'Outcomes', href: '/outcomes' },
  { label: 'Recovery', href: '/recovery' },
  { label: 'Reliability', href: '/reliability' },
  { label: 'Timeline Memory', href: '/timeline' },
  { label: 'Trajectory', href: '/trajectory' },
  { label: 'Pressure', href: '/pressure' },
  { label: 'Bottlenecks', href: '/bottlenecks' },
]

export default function InfrastructurePage() {
  return (
    <main className="min-h-screen bg-[#07111F] text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:px-8 lg:px-10">
        <InfrastructureNav />

        <header className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            EXAMIA Infrastructure Gateway
          </div>

          <h1 className="max-w-5xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Continuity Governance Infrastructure
          </h1>

          <p className="mt-5 max-w-4xl text-base leading-8 text-slate-300 sm:text-lg">
            EXAMIA governs what happens after visible disruption enters an institutional
            pathway. It keeps response, routing, evidence, recovery, escalation,
            accountability, and institutional memory traceable until stabilization is
            confirmed.
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {commandSignals.map((signal) => (
            <div
              key={signal.label}
              className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {signal.label}
              </p>
              <p className="mt-3 text-2xl font-bold text-cyan-300">{signal.value}</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{signal.cue}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8 lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Institutional Onboarding Pathway
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              From Registration to Governed Continuity Operations
            </h2>

            <p className="mt-4 leading-8 text-slate-300">
              EXAMIA should not depend on founder explanation to be adopted. This pathway
              gives institutions a clear route from first registration to safe operational
              use, with governance review, readiness confirmation, deployment approval, and
              active continuity operations.
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-400/25 bg-cyan-400/10 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
              Category Lock
            </p>

            <h2 className="mt-2 text-xl font-bold text-white">
              Disruption Must Not Disappear
            </h2>

            <p className="mt-4 leading-7 text-slate-200">
              The infrastructure exists to keep visible operational disruption governed
              until ownership, action, evidence, recovery, and memory are confirmed.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
            Onboarding Lifecycle
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Institutional Adoption Stages
          </h2>

          <div className="mt-6 grid gap-4 lg:grid-cols-5">
            {onboardingStages.map((item) => (
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

                <h3 className="mt-2 text-lg font-bold text-white">{item.title}</h3>

                <p className="mt-3 text-sm leading-6 text-slate-300">{item.meaning}</p>
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
              {readinessChecks.map((item) => (
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
              {deploymentLocks.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-cyan-400/20 bg-[#07111F]/70 p-4"
                >
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
            Core Entry Routes
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Continuity Governance Access
          </h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {accessRoutes.map((route) => (
              <GatewayLink key={route.href} label={route.label} href={route.href} />
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Next Hardening Layer
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Infrastructure Recovery Protocol
            </h2>

            <p className="mt-4 leading-8 text-slate-300">
              The next maturity step is to formalize how EXAMIA itself survives
              disruption: backup discipline, degraded operations mode, audit preservation,
              recovery verification, restoration validation, and continuity ownership
              during platform interruption.
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-400/25 bg-cyan-400/10 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
              Ecosystem Boundary
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Separate Systems, Shared Stability Mission
            </h2>

            <p className="mt-4 leading-8 text-slate-200">
              TSINAXA detects hidden structural strain. EXAMIA governs the response after
              visible disruption enters the pathway. They remain separate but complementary
              infrastructure layers.
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