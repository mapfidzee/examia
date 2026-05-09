import Link from "next/link";

type FlowStep = {
  number: string;
  title: string;
  route: string;
  status: string;
  purpose: string;
  caseSignal: string;
  governanceCheck: string;
};

const flowSteps: FlowStep[] = [
  {
    number: "01",
    title: "Need Intake",
    route: "/request",
    status: "VISIBLE_NEED_CAPTURED",
    purpose:
      "A visible coordination need enters the system through a controlled intake pathway.",
    caseSignal:
      "Example: A care coordination delay, handoff gap, support delay, or continuity concern is captured for review.",
    governanceCheck:
      "No blame language. Capture operational facts only. Avoid clinical diagnosis or person-level judgment.",
  },
  {
    number: "02",
    title: "Case Governance",
    route: "/cases",
    status: "CASE_OPENED",
    purpose:
      "The intake signal becomes a traceable stabilization case with visible ownership and review status.",
    caseSignal:
      "The case is classified as open, pending review, routed, active, unresolved, stabilized, or escalated.",
    governanceCheck:
      "Case language must remain structural, traceable, and safe for institutional interpretation.",
  },
  {
    number: "03",
    title: "Routing Intelligence",
    route: "/routing",
    status: "ROUTING_REVIEW_REQUIRED",
    purpose:
      "The case is directed toward the appropriate response pathway without assigning blame to individuals.",
    caseSignal:
      "Routing may point to operational leadership, care coordination, administrative support, responder pool, or escalation pathway.",
    governanceCheck:
      "Routing must support stabilization response, not personal performance labeling.",
  },
  {
    number: "04",
    title: "Intervention Governance",
    route: "/interventions",
    status: "INTERVENTION_ACTIVE",
    purpose:
      "A governed stabilization response is initiated to address the visible coordination need.",
    caseSignal:
      "The intervention may involve handoff support, resource coordination, escalation review, continuity repair, or follow-up action.",
    governanceCheck:
      "Intervention notes must describe action taken, not blame assigned.",
  },
  {
    number: "05",
    title: "Outcome Visibility",
    route: "/outcomes",
    status: "OUTCOME_UNDER_REVIEW",
    purpose:
      "The system checks whether the intervention produced resolution, partial resolution, continued strain, or escalation need.",
    caseSignal:
      "Outcome may show stabilized, partially stabilized, unresolved, delayed, or requiring escalation.",
    governanceCheck:
      "Outcome review must distinguish operational recovery from clinical judgment.",
  },
  {
    number: "06",
    title: "Recovery Intelligence",
    route: "/recovery",
    status: "RECOVERY_PRESSURE_VISIBLE",
    purpose:
      "The system tracks whether the coordination pathway is recovering or still carrying unresolved burden.",
    caseSignal:
      "Recovery signal shows whether continuity is improving, fragile, delayed, or still under pressure.",
    governanceCheck:
      "Recovery pressure should guide support and continuity repair, not punishment.",
  },
  {
    number: "07",
    title: "Trajectory Monitoring",
    route: "/trajectory",
    status: "FRAGMENTED_CONTINUITY",
    purpose:
      "The system evaluates whether the case pathway is improving, fragmenting, slowing, or failing over time.",
    caseSignal:
      "Trajectory may show stable recovery, delayed recovery, fragmented continuity, or escalation drift.",
    governanceCheck:
      "Trajectory must be interpreted as pathway behavior, not individual behavior.",
  },
  {
    number: "08",
    title: "Pressure Review",
    route: "/pressure",
    status: "HIGH_ROUTING_PRESSURE",
    purpose:
      "The case contributes to broader visibility of routing pressure and response capacity strain.",
    caseSignal:
      "Pressure review shows whether case volume, routing load, or response capacity requires leadership attention.",
    governanceCheck:
      "Pressure is a system signal, not evidence of individual failure.",
  },
  {
    number: "09",
    title: "Bottleneck Visibility",
    route: "/bottlenecks",
    status: "HIGH_BOTTLENECK_PRESSURE",
    purpose:
      "The system identifies whether the case is delayed by recurring coordination friction or blocked handoff points.",
    caseSignal:
      "Bottleneck may appear in intake review, routing, responder availability, intervention completion, outcome review, or recovery monitoring.",
    governanceCheck:
      "Bottlenecks must be treated as process constraints before person-level assumptions.",
  },
  {
    number: "10",
    title: "Command Oversight",
    route: "/command",
    status: "CRITICAL_COMMAND_STATUS",
    purpose:
      "Leadership receives a consolidated view of case pressure, continuity risk, and action priority.",
    caseSignal:
      "Command view determines whether the case requires leadership review, capacity balancing, escalation, or recovery protection.",
    governanceCheck:
      "Command oversight must guide structured response, not surveillance or punishment.",
  },
  {
    number: "11",
    title: "Governance Audit",
    route: "/audit",
    status: "STRONG_AUDIT_INTEGRITY",
    purpose:
      "The system verifies whether the case pathway remains traceable, governed, and safe for institutional interpretation.",
    caseSignal:
      "Audit confirms whether intake, routing, intervention, outcome, recovery, and command signals are sufficiently traceable.",
    governanceCheck:
      "Audit integrity makes signals trustworthy; it does not make them punitive.",
  },
];

const caseSnapshot = [
  { label: "Domain", value: "Healthcare Coordination" },
  { label: "Case Type", value: "Continuity / Coordination Concern" },
  { label: "Current Pressure", value: "High Routing + Bottleneck Pressure" },
  { label: "Recovery Signal", value: "Recovery Pressure Visible" },
  { label: "Trajectory", value: "Fragmented Continuity" },
  { label: "Audit Integrity", value: "Strong" },
];

const lifecycleRules = [
  "A case must begin with visible need intake.",
  "Every case must have a routing pathway.",
  "Every intervention must produce an outcome signal.",
  "Every outcome must connect to recovery review.",
  "Unresolved recovery pressure must inform trajectory and command visibility.",
  "Every case pathway must remain traceable through governance audit.",
  "No case signal may be used for blame, surveillance, or person-level punishment.",
];

export default function CaseFlowPage() {
  return (
    <main className="min-h-screen bg-[#07111F] text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:px-8 lg:px-10">
        <header className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            EXAMIA Case Flow
          </div>

          <h1 className="max-w-5xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Governed Stabilization Case Lifecycle
          </h1>

          <p className="mt-5 max-w-4xl text-base leading-8 text-slate-300 sm:text-lg">
            This layer shows how one healthcare-first stabilization case moves
            through EXAMIA: visible need intake, case governance, routing,
            intervention, outcome review, recovery monitoring, trajectory,
            pressure review, bottleneck visibility, command oversight, and
            governance audit.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SignalCard label="Flow Type" value="GOVERNED" />
            <SignalCard label="Primary Domain" value="HEALTHCARE" />
            <SignalCard label="Case Logic" value="TRACEABLE" />
            <SignalCard label="Interpretation" value="NON-PUNITIVE" />
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8 lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Case Flow Purpose
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              From Visible Need to Audited Stabilization Pathway
            </h2>
            <p className="mt-4 leading-8 text-slate-300">
              EXAMIA should make the life of a case visible without turning the
              case into blame, surveillance, or clinical decision-making. The
              purpose is to show whether a visible coordination need was
              captured, routed, addressed, reviewed, monitored for recovery, and
              kept traceable through governance.
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-400/25 bg-cyan-400/10 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
              Healthcare Boundary
            </p>
            <h2 className="mt-2 text-xl font-bold text-white">
              Operational Case, Not Clinical Record
            </h2>
            <p className="mt-4 leading-7 text-slate-200">
              This flow supports coordination and continuity review. It does not
              diagnose, prescribe, replace clinical judgment, store clinical
              conclusions, or rank individuals.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
                Demonstration Case Snapshot
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                Example Stabilization Case State
              </h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/action-cues"
                className="rounded-2xl border border-cyan-400/40 bg-cyan-400/10 px-5 py-3 text-center text-sm font-semibold text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-400/20"
              >
                Action Cues
              </Link>
              <Link
                href="/system"
                className="rounded-2xl border border-blue-800/70 bg-[#07111F] px-5 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-cyan-300 hover:text-cyan-100"
              >
                System Spine
              </Link>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {caseSnapshot.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-blue-900/60 bg-[#07111F] p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {item.label}
                </p>
                <p className="mt-2 text-sm font-bold text-cyan-300">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Lifecycle Trace
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              One Case Through the Full Stabilization Pathway
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {flowSteps.map((step) => (
              <article
                key={step.number}
                className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="rounded-2xl bg-[#07111F] px-3 py-2 text-sm font-bold text-cyan-300">
                    {step.number}
                  </div>
                  <Link
                    href={step.route}
                    className="rounded-full border border-blue-800/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-300 transition hover:border-cyan-300 hover:text-cyan-100"
                  >
                    {step.route}
                  </Link>
                </div>

                <h3 className="mt-5 text-2xl font-bold text-white">
                  {step.title}
                </h3>

                <div className="mt-3 rounded-xl border border-blue-900/60 bg-[#07111F] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-cyan-300">
                  {step.status}
                </div>

                <p className="mt-4 leading-7 text-slate-300">
                  {step.purpose}
                </p>

                <div className="mt-6 grid gap-3">
                  <FlowRow label="Case Signal" value={step.caseSignal} />
                  <FlowRow
                    label="Governance Check"
                    value={step.governanceCheck}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Lifecycle Control Rules
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Prevent Case Drift
            </h2>

            <div className="mt-6 space-y-3">
              {lifecycleRules.map((rule) => (
                <div
                  key={rule}
                  className="rounded-2xl border border-blue-900/60 bg-[#07111F] p-4 text-sm leading-6 text-slate-200"
                >
                  {rule}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-400/25 bg-cyan-400/10 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
              Case Governance Outcome
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Stabilization Pathway Is Traceable
            </h2>

            <p className="mt-4 leading-8 text-slate-200">
              This case pathway shows that the visible need was captured,
              routed, addressed, reviewed, monitored for recovery, elevated into
              pressure visibility where needed, and protected by governance
              audit. The case is not interpreted as individual failure. It is
              interpreted as a governed stabilization pathway.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/command"
                className="rounded-2xl border border-cyan-400/40 bg-[#07111F] px-5 py-3 text-center text-sm font-semibold text-cyan-100 transition hover:border-cyan-300 hover:bg-[#102744]"
              >
                View Command Center
              </Link>
              <Link
                href="/audit"
                className="rounded-2xl border border-blue-900/60 bg-[#07111F] px-5 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-cyan-300 hover:text-cyan-100"
              >
                View Audit Layer
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function SignalCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-blue-900/60 bg-[#07111F] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold text-cyan-300">{value}</p>
    </div>
  );
}

function FlowRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-blue-900/60 bg-[#07111F] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-200">{value}</p>
    </div>
  );
}