import Link from "next/link";

type Domain = {
  number: string;
  title: string;
  status: string;
  purpose: string;
  intake: string;
  routing: string;
  intervention: string;
  recovery: string;
};

const domains: Domain[] = [
  {
    number: "01",
    title: "Healthcare Coordination",
    status: "PRIMARY DEPLOYMENT DOMAIN",
    purpose:
      "Supports healthcare coordination, continuity protection, response routing, recovery monitoring, and operational stabilization across pressured care environments.",
    intake:
      "Visible operational need, coordination delay, handoff gap, discharge pressure, support delay, continuity disruption, or escalation concern.",
    routing:
      "Route need to the appropriate clinical, operational, administrative, support, or escalation pathway without assigning blame to individuals.",
    intervention:
      "Structured coordination action, escalation review, handoff support, continuity repair, resource coordination, or recovery pathway activation.",
    recovery:
      "Track whether the care coordination pathway has stabilized, remains fragile, or requires continued leadership attention.",
  },
  {
    number: "02",
    title: "Education Stabilization",
    status: "SECONDARY DEPLOYMENT DOMAIN",
    purpose:
      "Supports learning continuity, beneficiary support, intervention routing, and recovery tracking when educational progress is disrupted.",
    intake:
      "Learning need, continuity disruption, preparation gap, support request, or academic recovery concern.",
    routing:
      "Route beneficiary need to the appropriate responder or support pathway.",
    intervention:
      "Governed support session, structured explanation, file exchange, voice support, or live intervention.",
    recovery:
      "Track whether learning continuity has improved, remained fragile, or requires escalation.",
  },
  {
    number: "03",
    title: "NGO Continuity Operations",
    status: "EXPANSION DOMAIN",
    purpose:
      "Supports beneficiary intake, responder coordination, field response visibility, and program continuity across NGO operations.",
    intake:
      "Beneficiary need, field disruption, service access gap, program continuity risk, or urgent support request.",
    routing:
      "Route case to field worker, coordinator, partner, resource pathway, or support program.",
    intervention:
      "Governed assistance action, referral, field support, resource coordination, or follow-up pathway.",
    recovery:
      "Track whether beneficiary support has stabilized or requires continued coordination.",
  },
  {
    number: "04",
    title: "Public Sector Response",
    status: "EXPANSION DOMAIN",
    purpose:
      "Supports ministries, departments, councils, and public institutions that need governed coordination across visible service disruptions.",
    intake:
      "Public service need, departmental delay, coordination gap, response request, or continuity concern.",
    routing:
      "Route need to department, unit, officer, program, or escalation pathway.",
    intervention:
      "Structured response action, departmental coordination, service recovery, or escalation review.",
    recovery:
      "Track whether the public service pathway has resumed stable function.",
  },
  {
    number: "05",
    title: "Humanitarian Routing",
    status: "EXPANSION DOMAIN",
    purpose:
      "Supports urgent need intake, case prioritization, responder routing, and continuity monitoring across humanitarian response environments.",
    intake:
      "Urgent beneficiary need, displacement-related need, access barrier, resource request, or field response concern.",
    routing:
      "Route case to responder, partner organization, resource hub, field team, or escalation channel.",
    intervention:
      "Aid coordination, referral, emergency support pathway, field response, or follow-up action.",
    recovery:
      "Track whether immediate stabilization occurred and whether continued support is required.",
  },
  {
    number: "06",
    title: "Workforce Recovery",
    status: "EXPANSION DOMAIN",
    purpose:
      "Supports workforce disruption response, operational continuity, recovery monitoring, and stabilization coordination.",
    intake:
      "Workforce disruption, coverage gap, role strain, continuity risk, support need, or operational pressure signal.",
    routing:
      "Route disruption to leadership, staffing support, coordination team, recovery pathway, or operational response channel.",
    intervention:
      "Coverage response, workload redistribution, support activation, continuity repair, or stabilization review.",
    recovery:
      "Track whether workforce continuity is recovering or remaining structurally fragile.",
  },
];

const universalSpine = [
  "Need Intake",
  "Case Governance",
  "Routing Intelligence",
  "Intervention Governance",
  "Outcome Visibility",
  "Recovery Intelligence",
  "Trajectory Monitoring",
  "Pressure Visibility",
  "Bottleneck Detection",
  "Command Oversight",
  "Governance Audit",
];

const safeguards = [
  "Healthcare is the primary deployment domain, but EXAMIA remains domain-adaptable stabilization infrastructure.",
  "EXAMIA supports operational coordination and continuity visibility; it does not replace clinical judgment.",
  "No domain may introduce blame-based interpretation.",
  "No domain may convert structural signals into person-level punishment.",
  "Every domain must preserve traceability, recovery logic, and governance-safe action cues.",
  "Domain expansion must strengthen stabilization response, not create dashboard sprawl.",
];

export default function DomainsPage() {
  return (
    <main className="min-h-screen bg-[#07111F] text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:px-8 lg:px-10">
        <header className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            EXAMIA Operational Domains
          </div>

          <h1 className="max-w-5xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Healthcare-First Stabilization Model
          </h1>

          <p className="mt-5 max-w-4xl text-base leading-8 text-slate-300 sm:text-lg">
            EXAMIA is governed stabilization response infrastructure with
            healthcare coordination as the primary deployment domain. It can
            support visible need intake, case governance, routing, intervention,
            continuity, recovery, pressure visibility, command oversight, and
            audit traceability across healthcare systems, NGOs, ministries,
            departments, humanitarian programs, education recovery, workforce
            continuity, and other institutional environments.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SignalCard label="Primary Domain" value="HEALTHCARE" />
            <SignalCard label="Core Function" value="STABILIZATION RESPONSE" />
            <SignalCard label="Governance" value="TRACEABLE" />
            <SignalCard label="Expansion Rule" value="CONTROLLED" />
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8 lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Strategic Interpretation
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Healthcare First, Infrastructure Always
            </h2>
            <p className="mt-4 leading-8 text-slate-300">
              EXAMIA naturally mirrors the logic of structured care
              coordination: assessment of visible need, case governance, routing,
              intervention, outcome review, recovery monitoring, continuity
              protection, pressure visibility, bottleneck detection, command
              response, and audit integrity. Healthcare gives the system its
              strongest first operating context, while the stabilization spine
              remains adaptable across other institutional domains.
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-400/25 bg-cyan-400/10 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
              Identity Lock
            </p>
            <h2 className="mt-2 text-xl font-bold text-white">
              Operational, Not Clinical
            </h2>
            <p className="mt-4 leading-7 text-slate-200">
              EXAMIA supports coordination, continuity, routing, recovery, and
              governance visibility. It does not diagnose, prescribe, replace
              clinical judgment, or create person-level punishment.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
                Universal Spine
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                Same Governance Logic Across Every Domain
              </h2>
            </div>
            <Link
              href="/system"
              className="rounded-2xl border border-cyan-400/40 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-400/20"
            >
              View System Spine
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {universalSpine.map((step, index) => (
              <div
                key={step}
                className="rounded-2xl border border-blue-900/60 bg-[#07111F] p-4"
              >
                <div className="text-xs font-semibold text-cyan-300">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="mt-2 text-sm font-semibold text-white">
                  {step}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Deployment Domains
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Domain Models Built on the Same Stabilization Infrastructure
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {domains.map((domain) => (
              <article
                key={domain.number}
                className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="rounded-2xl bg-[#07111F] px-3 py-2 text-sm font-bold text-cyan-300">
                    {domain.number}
                  </div>
                  <div className="rounded-full border border-blue-800/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                    {domain.status}
                  </div>
                </div>

                <h3 className="mt-5 text-2xl font-bold text-white">
                  {domain.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-300">
                  {domain.purpose}
                </p>

                <div className="mt-6 grid gap-3">
                  <DomainRow label="Intake Signal" value={domain.intake} />
                  <DomainRow label="Routing Logic" value={domain.routing} />
                  <DomainRow
                    label="Intervention Pathway"
                    value={domain.intervention}
                  />
                  <DomainRow label="Recovery Signal" value={domain.recovery} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Expansion Control
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Domain Admission Rule
            </h2>
            <p className="mt-4 leading-8 text-slate-300">
              A new domain should only be added when it can clearly use the same
              stabilization pathway: intake, case governance, routing,
              intervention, outcome, recovery, trajectory, pressure visibility,
              bottleneck detection, command oversight, and governance audit.
            </p>
          </div>

          <div className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Governance Safeguards
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Healthcare-First Expansion Must Stay Safe
            </h2>

            <div className="mt-6 space-y-3">
              {safeguards.map((rule) => (
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
            Next Infrastructure Layer
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Build Action Cue Registry Next
          </h2>

          <p className="mt-4 max-w-5xl leading-8 text-slate-200">
            After healthcare-first domain architecture is locked, the next
            required layer is a controlled action cue registry. Every
            stabilization status should automatically align with meaning, risk
            interpretation, action cue, escalation threshold, and governance
            note.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/system"
              className="rounded-2xl border border-cyan-400/40 bg-[#07111F] px-5 py-3 text-center text-sm font-semibold text-cyan-100 transition hover:border-cyan-300 hover:bg-[#102744]"
            >
              Return to System Spine
            </Link>
            <Link
              href="/command"
              className="rounded-2xl border border-blue-900/60 bg-[#07111F] px-5 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-cyan-300 hover:text-cyan-100"
            >
              View Command Center
            </Link>
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

function DomainRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-blue-900/60 bg-[#07111F] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-200">{value}</p>
    </div>
  );
}