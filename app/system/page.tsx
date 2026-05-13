import Link from 'next/link'
import InfrastructureNav from '@/components/InfrastructureNav'

type Layer = {
  number: string
  title: string
  route: string
  status: string
  meaning: string
  actionCue: string
}

const demoFlow = [
  {
    step: '01',
    title: 'Visible disruption enters',
    text:
      'A need, risk, interruption, safeguarding concern, or operational instability becomes visible and is captured into EXAMIA.',
  },
  {
    step: '02',
    title: 'Governed case ownership begins',
    text:
      'The disruption becomes a traceable case with severity, status, pathway context, and governance-safe interpretation.',
  },
  {
    step: '03',
    title: 'Routing and response are assigned',
    text:
      'EXAMIA connects the case to the right coordination site, responder pathway, escalation route, or institutional support channel.',
  },
  {
    step: '04',
    title: 'Intervention evidence is preserved',
    text:
      'Response actions become visible and auditable so the disruption cannot disappear after it is noticed.',
  },
  {
    step: '05',
    title: 'Recovery is monitored',
    text:
      'Outcomes, recovery status, unresolved burden, and continuity risks remain visible until stabilization is confirmed.',
  },
  {
    step: '06',
    title: 'Command and audit retain memory',
    text:
      'Leadership can see pressure, bottlenecks, recovery, risk zones, and audit traceability across the institutional pathway.',
  },
]

const layers: Layer[] = [
  {
    number: '01',
    title: 'Need Intake Infrastructure',
    route: '/request',
    status: 'INTAKE_ACTIVE',
    meaning:
      'Receives visible needs, disruptions, requests, or stabilization signals into a governed intake pathway.',
    actionCue: 'Capture need clearly before routing begins.',
  },
  {
    number: '02',
    title: 'Beneficiary Case Governance',
    route: '/cases',
    status: 'CASE_VISIBILITY_ACTIVE',
    meaning:
      'Converts intake signals into traceable stabilization cases that can be routed, monitored, and governed.',
    actionCue: 'Review open cases and confirm stabilization priority.',
  },
  {
    number: '03',
    title: 'Routing Intelligence',
    route: '/routing',
    status: 'ROUTING_SIGNAL_ACTIVE',
    meaning:
      'Directs visible disruption toward responders, intervention pathways, escalation routes, or institutional support channels.',
    actionCue: 'Check whether routing pressure is rising.',
  },
  {
    number: '04',
    title: 'Controlled Intervention Governance',
    route: '/interventions',
    status: 'INTERVENTION_LAYER_ACTIVE',
    meaning:
      'Tracks governed stabilization actions after a case has been routed for response.',
    actionCue: 'Confirm that interventions are structured and traceable.',
  },
  {
    number: '05',
    title: 'Outcome Intelligence',
    route: '/outcomes',
    status: 'OUTCOME_REVIEW_ACTIVE',
    meaning:
      'Assesses whether the response produced resolution, partial resolution, escalation, or continued continuity risk.',
    actionCue: 'Review unresolved outcomes before closure.',
  },
  {
    number: '06',
    title: 'Operational Intelligence',
    route: '/operations',
    status: 'OPERATIONS_VISIBLE',
    meaning:
      'Provides visibility into system activity, operational movement, and active stabilization workload.',
    actionCue: 'Review current operational burden.',
  },
  {
    number: '07',
    title: 'Reliability Intelligence',
    route: '/reliability',
    status: 'RELIABILITY_MONITORING_ACTIVE',
    meaning:
      'Assesses whether stabilization pathways remain dependable under pressure.',
    actionCue: 'Watch for repeated continuity weakness.',
  },
  {
    number: '08',
    title: 'Institutional Coordination',
    route: '/coordination',
    status: 'COORDINATION_ACTIVE',
    meaning:
      'Shows how stabilization work connects across departments, institutions, responders, programs, and partners.',
    actionCue: 'Identify coordination gaps early.',
  },
  {
    number: '09',
    title: 'Predictive Coordination Intelligence',
    route: '/predictive',
    status: 'MODERATE_FORECAST_PRESSURE',
    meaning:
      'Forecasts where coordination pressure may increase based on visible stabilization patterns.',
    actionCue: 'Prepare capacity before pressure escalates.',
  },
  {
    number: '10',
    title: 'Stabilization Trajectory Intelligence',
    route: '/trajectory',
    status: 'FRAGMENTED_CONTINUITY',
    meaning:
      'Tracks whether stabilization is improving, fragmenting, slowing, or failing across time.',
    actionCue: 'Review handoff and continuity pathways.',
  },
  {
    number: '11',
    title: 'Predictive Routing Pressure',
    route: '/pressure',
    status: 'HIGH_ROUTING_PRESSURE',
    meaning:
      'Shows when routing demand is rising beyond smooth response capacity.',
    actionCue: 'Activate routing review and capacity balancing.',
  },
  {
    number: '12',
    title: 'Coordination Bottleneck Visibility',
    route: '/bottlenecks',
    status: 'HIGH_BOTTLENECK_PRESSURE',
    meaning:
      'Identifies where stabilization response is delayed, stuck, or repeatedly slowed.',
    actionCue: 'Inspect blocked coordination points.',
  },
  {
    number: '13',
    title: 'Infrastructure Recovery Protocol',
    route: '/recovery',
    status: 'RECOVERY_PROTOCOL_ACTIVE',
    meaning:
      'Tracks recovery continuity and defines how EXAMIA preserves governance during disruption to the platform itself.',
    actionCue: 'Review recovery load and infrastructure survivability.',
  },
  {
    number: '14',
    title: 'Executive Command Intelligence',
    route: '/command',
    status: 'EXECUTIVE_COMMAND_ACTIVE',
    meaning:
      'Gives leadership a consolidated view of continuity pressure, risk zones, recovery, governance integrity, and action cues.',
    actionCue: 'Prioritize executive continuity response.',
  },
  {
    number: '15',
    title: 'Operational Audit Intelligence',
    route: '/audit',
    status: 'STRONG_AUDIT_INTEGRITY',
    meaning:
      'Checks whether signals remain traceable, governed, safe for institutional interpretation, and connected to memory.',
    actionCue: 'Use audit strength to trust or challenge signals.',
  },
  {
    number: '16',
    title: 'Governance Framework',
    route: '/governance',
    status: 'GOVERNANCE_ACTIVE',
    meaning:
      'Defines the rules, safeguards, interpretation boundaries, and ethical limits of EXAMIA continuity governance.',
    actionCue: 'Keep all interpretation structural and non-punitive.',
  },
]

const operationalPortals = [
  { name: 'Admin Control', route: '/admin' },
  { name: 'Responder Assignment', route: '/admin/assign' },
  { name: 'Responder Registry', route: '/admin/teachers' },
  { name: 'Responder Portal', route: '/teacher-dashboard' },
  { name: 'Beneficiary Portal', route: '/student-dashboard' },
  { name: 'Controlled Intervention Room', route: '/lesson/demo' },
]

const lifecycle = [
  'Need Intake',
  'Case Governance',
  'Routing',
  'Intervention',
  'Outcome',
  'Recovery',
  'Trajectory',
  'Pressure',
  'Bottlenecks',
  'Command',
  'Audit',
]

const governanceRules = [
  'No blame-based interpretation.',
  'No person-level punishment framing.',
  'No surveillance positioning.',
  'Structural signals must not be used as individual performance labels.',
  'Every pressure signal requires traceable governance context.',
  'Action cues must support stabilization, continuity, and fair response.',
]

export default function SystemPage() {
  return (
    <main className="min-h-screen bg-[#07111F] text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:px-8 lg:px-10">
        <InfrastructureNav />

        <header className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            EXAMIA System Spine
          </div>

          <h1 className="max-w-5xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Continuity Governance Infrastructure Map
          </h1>

          <p className="mt-5 max-w-4xl text-base leading-8 text-slate-300 sm:text-lg">
            EXAMIA prevents operational disruption from disappearing after it is
            noticed. It governs response, routing, evidence, recovery, escalation,
            accountability, and institutional memory until stabilization is confirmed.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatusPill label="Category" value="CONTINUITY GOVERNANCE" />
            <StatusPill label="Command" value="EXECUTIVE ACTIVE" />
            <StatusPill label="Recovery" value="PROTOCOL ACTIVE" />
            <StatusPill label="Audit" value="TRACEABLE MEMORY" />
          </div>
        </header>

        <section className="rounded-3xl border border-cyan-400/25 bg-cyan-400/10 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
            Executive Demo Narrative
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            From Visible Disruption to Confirmed Stabilization
          </h2>

          <p className="mt-4 max-w-5xl leading-8 text-slate-200">
            EXAMIA is not just a dashboard. It is the governed pathway that takes visible
            disruption from first notice through ownership, routing, action, recovery,
            escalation, audit, and institutional memory.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {demoFlow.map((item) => (
              <div
                key={item.step}
                className="rounded-3xl border border-cyan-400/20 bg-[#07111F]/70 p-5"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10 text-sm font-black text-cyan-200">
                  {item.step}
                </div>

                <h3 className="text-lg font-bold text-white">{item.title}</h3>

                <p className="mt-3 text-sm leading-6 text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white">
            Current System Interpretation
          </h2>

          <p className="mt-4 max-w-5xl leading-8 text-slate-300">
            EXAMIA is now structured as continuity governance infrastructure. It
            preserves visibility across routing, bottlenecks, trajectory, recovery,
            command, audit, onboarding, and infrastructure survivability. The system
            is designed for governed response, not blame, surveillance, or person-level
            punishment.
          </p>
        </section>

        <section className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
                Stabilization Lifecycle
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                Governed Response Flow
              </h2>
            </div>

            <p className="max-w-2xl text-sm leading-6 text-slate-400">
              Every EXAMIA route must fit inside this lifecycle. If a future route cannot
              strengthen continuity, recovery, governance, command, onboarding, audit, or
              survivability, it should not be built.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-6">
            {lifecycle.map((item, index) => (
              <div
                key={item}
                className="rounded-2xl border border-blue-900/60 bg-[#07111F] p-4"
              >
                <div className="text-xs font-semibold text-cyan-300">
                  STEP {String(index + 1).padStart(2, '0')}
                </div>

                <div className="mt-2 text-sm font-semibold text-white">{item}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Infrastructure Layers
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              EXAMIA Governed Continuity Spine
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {layers.map((layer) => (
              <Link
                key={layer.number}
                href={layer.route}
                className="group rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 transition hover:border-cyan-300/60 hover:bg-[#102744]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl bg-[#07111F] px-3 py-2 text-sm font-bold text-cyan-300">
                    {layer.number}
                  </div>

                  <div className="rounded-full border border-blue-800/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                    {layer.route}
                  </div>
                </div>

                <h3 className="mt-5 text-xl font-bold text-white group-hover:text-cyan-100">
                  {layer.title}
                </h3>

                <div className="mt-3 rounded-xl border border-blue-900/60 bg-[#07111F] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-cyan-300">
                  {layer.status}
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-300">{layer.meaning}</p>

                <div className="mt-5 rounded-2xl border border-blue-900/60 bg-[#07111F] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Action Cue
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    {layer.actionCue}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Operational Portals
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Access Points Inside the Larger Infrastructure
            </h2>

            <p className="mt-4 leading-7 text-slate-300">
              These portals remain useful, but they no longer define EXAMIA. They are
              operational access points inside the larger continuity governance
              infrastructure.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {operationalPortals.map((portal) => (
                <Link
                  key={portal.route}
                  href={portal.route}
                  className="rounded-2xl border border-blue-900/60 bg-[#07111F] p-4 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/60 hover:text-cyan-100"
                >
                  {portal.name}
                  <div className="mt-1 text-xs font-normal text-slate-500">
                    {portal.route}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Governance Commitments
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Safe Interpretation Rules
            </h2>

            <div className="mt-6 space-y-3">
              {governanceRules.map((rule) => (
                <div
                  key={rule}
                  className="rounded-2xl border border-blue-900/60 bg-[#07111F] p-4 text-sm leading-6 text-slate-200"
                >
                  {rule}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-cyan-400/25 bg-cyan-400/10 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
            Ecosystem Boundary
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Separate Systems, Complementary Stability Intelligence
          </h2>

          <p className="mt-4 max-w-5xl leading-8 text-slate-200">
            TSINAXA detects hidden structural strain. EXAMIA governs the response after
            visible disruption enters the institutional pathway. They remain separate but
            complementary infrastructure layers.
          </p>
        </section>
      </section>
    </main>
  )
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-blue-900/60 bg-[#07111F] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-sm font-bold text-cyan-300">{value}</p>
    </div>
  )
}