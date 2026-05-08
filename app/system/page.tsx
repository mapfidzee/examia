import Link from "next/link";

type Layer = {
  number: string;
  title: string;
  route: string;
  status: string;
  meaning: string;
  actionCue: string;
};

const layers: Layer[] = [
  {
    number: "01",
    title: "Need Intake Infrastructure",
    route: "/request",
    status: "INTAKE_ACTIVE",
    meaning:
      "Receives visible needs, disruptions, requests, or stabilization signals into a governed intake pathway.",
    actionCue: "Capture need clearly before routing begins.",
  },
  {
    number: "02",
    title: "Beneficiary Case Governance",
    route: "/cases",
    status: "CASE_VISIBILITY_ACTIVE",
    meaning:
      "Converts intake signals into traceable stabilization cases that can be routed, monitored, and governed.",
    actionCue: "Review open cases and confirm stabilization priority.",
  },
  {
    number: "03",
    title: "Routing Intelligence",
    route: "/routing",
    status: "ROUTING_SIGNAL_ACTIVE",
    meaning:
      "Assesses how needs are directed toward responders, intervention pathways, or institutional support channels.",
    actionCue: "Check whether routing pressure is rising.",
  },
  {
    number: "04",
    title: "Controlled Intervention Governance",
    route: "/interventions",
    status: "INTERVENTION_LAYER_ACTIVE",
    meaning:
      "Tracks governed stabilization actions after a case has been routed for response.",
    actionCue: "Confirm that interventions are structured and traceable.",
  },
  {
    number: "05",
    title: "Outcome Intelligence",
    route: "/outcomes",
    status: "OUTCOME_REVIEW_ACTIVE",
    meaning:
      "Assesses whether the stabilization response produced resolution, partial resolution, escalation, or continued strain.",
    actionCue: "Review unresolved outcomes before closure.",
  },
  {
    number: "06",
    title: "Operational Intelligence",
    route: "/operations",
    status: "OPERATIONS_VISIBLE",
    meaning:
      "Provides visibility into system activity, operational movement, and active stabilization workload.",
    actionCue: "Review current operational burden.",
  },
  {
    number: "07",
    title: "Reliability Intelligence",
    route: "/reliability",
    status: "RELIABILITY_MONITORING_ACTIVE",
    meaning:
      "Assesses whether stabilization pathways remain dependable under pressure.",
    actionCue: "Watch for repeated continuity weakness.",
  },
  {
    number: "08",
    title: "Institutional Coordination",
    route: "/coordination",
    status: "COORDINATION_ACTIVE",
    meaning:
      "Shows how stabilization work connects across departments, institutions, responders, or programs.",
    actionCue: "Identify coordination gaps early.",
  },
  {
    number: "09",
    title: "Predictive Coordination Intelligence",
    route: "/predictive",
    status: "MODERATE_FORECAST_PRESSURE",
    meaning:
      "Forecasts where coordination pressure may increase based on visible stabilization patterns.",
    actionCue: "Prepare capacity before pressure escalates.",
  },
  {
    number: "10",
    title: "Stabilization Trajectory Intelligence",
    route: "/trajectory",
    status: "FRAGMENTED_CONTINUITY",
    meaning:
      "Tracks whether stabilization is improving, fragmenting, slowing, or failing across time.",
    actionCue: "Review handoff and continuity pathways.",
  },
  {
    number: "11",
    title: "Predictive Routing Pressure",
    route: "/pressure",
    status: "HIGH_ROUTING_PRESSURE",
    meaning:
      "Shows when routing demand is rising beyond smooth response capacity.",
    actionCue: "Activate routing review and capacity balancing.",
  },
  {
    number: "12",
    title: "Coordination Bottleneck Visibility",
    route: "/bottlenecks",
    status: "HIGH_BOTTLENECK_PRESSURE",
    meaning:
      "Identifies where stabilization response is delayed, stuck, or repeatedly slowed.",
    actionCue: "Inspect blocked coordination points.",
  },
  {
    number: "13",
    title: "Continuity Recovery Intelligence",
    route: "/recovery",
    status: "RECOVERY_PRESSURE_VISIBLE",
    meaning:
      "Tracks whether the system is recovering after intervention or carrying unresolved stabilization burden.",
    actionCue: "Review recovery load and unresolved cases.",
  },
  {
    number: "14",
    title: "Stabilization Command Center",
    route: "/command",
    status: "CRITICAL_COMMAND_STATUS",
    meaning:
      "Gives leadership a consolidated view of stabilization pressure, response urgency, and system action cues.",
    actionCue: "Prioritize executive stabilization response.",
  },
  {
    number: "15",
    title: "Governance Audit Intelligence",
    route: "/audit",
    status: "STRONG_AUDIT_INTEGRITY",
    meaning:
      "Checks whether stabilization signals remain traceable, governed, and safe for institutional interpretation.",
    actionCue: "Use audit strength to trust or challenge signals.",
  },
  {
    number: "16",
    title: "Governance Framework",
    route: "/governance",
    status: "GOVERNANCE_ACTIVE",
    meaning:
      "Defines the rules, safeguards, interpretation boundaries, and ethical limits of EXAMIA stabilization intelligence.",
    actionCue: "Keep all interpretation structural and non-punitive.",
  },
];

const operationalPortals = [
  { name: "Admin Control", route: "/admin" },
  { name: "Responder Assignment", route: "/admin/assign" },
  { name: "Responder Registry", route: "/admin/teachers" },
  { name: "Responder Portal", route: "/teacher-dashboard" },
  { name: "Beneficiary Portal", route: "/student-dashboard" },
  { name: "Controlled Intervention Room", route: "/lesson/demo" },
];

export default function SystemPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:px-8 lg:px-10">
        <header className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-2xl sm:p-8">
          <div className="mb-4 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
            EXAMIA System Spine
          </div>

          <h1 className="max-w-5xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Structural Stabilization Infrastructure Map
          </h1>

          <p className="mt-5 max-w-4xl text-base leading-8 text-neutral-300 sm:text-lg">
            EXAMIA is governed stabilization response infrastructure. It
            coordinates visible need, case governance, routing, intervention,
            continuity, recovery, pressure visibility, command oversight, and
            audit traceability across complex institutional environments.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatusPill label="Routing" value="HIGH PRESSURE" />
            <StatusPill label="Bottlenecks" value="HIGH PRESSURE" />
            <StatusPill label="Recovery" value="PRESSURE VISIBLE" />
            <StatusPill label="Audit" value="STRONG INTEGRITY" />
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 lg:col-span-2">
            <h2 className="text-2xl font-bold text-white">
              Current System Interpretation
            </h2>
            <p className="mt-4 leading-8 text-neutral-300">
              EXAMIA is detecting serious stabilization pressure across routing,
              bottlenecks, trajectory, and recovery pathways. Governance
              traceability remains strong, which means the signals are currently
              usable for structured leadership response rather than blame,
              surveillance, or person-level punishment.
            </p>
          </div>

          <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6">
            <h2 className="text-xl font-bold text-amber-200">
              Strategic Boundary
            </h2>
            <p className="mt-4 leading-7 text-amber-100/90">
              TSINAXA detects hidden structural strain. EXAMIA governs
              stabilization response after visible need, disruption, or
              institutional instability enters the response pathway.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
                Stabilization Lifecycle
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                Governed Response Flow
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-neutral-400">
              Every EXAMIA route must fit inside this lifecycle. If a future
              route cannot connect to this flow, it should not be built.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-5">
            {[
              "Need Intake",
              "Case Governance",
              "Routing",
              "Intervention",
              "Outcome",
              "Recovery",
              "Trajectory",
              "Pressure",
              "Bottlenecks",
              "Command",
            ].map((item, index) => (
              <div
                key={item}
                className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"
              >
                <div className="text-xs font-semibold text-emerald-300">
                  STEP {String(index + 1).padStart(2, "0")}
                </div>
                <div className="mt-2 text-sm font-semibold text-white">
                  {item}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
              Infrastructure Layers
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              EXAMIA Governed Stabilization Spine
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {layers.map((layer) => (
              <Link
                key={layer.number}
                href={layer.route}
                className="group rounded-3xl border border-neutral-800 bg-neutral-900 p-6 transition hover:border-emerald-500/60 hover:bg-neutral-900/80"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl bg-neutral-950 px-3 py-2 text-sm font-bold text-emerald-300">
                    {layer.number}
                  </div>
                  <div className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-300">
                    {layer.route}
                  </div>
                </div>

                <h3 className="mt-5 text-xl font-bold text-white group-hover:text-emerald-200">
                  {layer.title}
                </h3>

                <div className="mt-3 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                  {layer.status}
                </div>

                <p className="mt-4 text-sm leading-7 text-neutral-300">
                  {layer.meaning}
                </p>

                <div className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                    Action Cue
                  </p>
                  <p className="mt-2 text-sm leading-6 text-neutral-200">
                    {layer.actionCue}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
              Operational Portals
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Access Points
            </h2>
            <p className="mt-4 leading-7 text-neutral-300">
              These portals remain useful, but they no longer define EXAMIA.
              They are operational access points inside the larger stabilization
              infrastructure.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {operationalPortals.map((portal) => (
                <Link
                  key={portal.route}
                  href={portal.route}
                  className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-sm font-semibold text-neutral-200 transition hover:border-emerald-500/60 hover:text-emerald-200"
                >
                  {portal.name}
                  <div className="mt-1 text-xs font-normal text-neutral-500">
                    {portal.route}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
              Governance Commitments
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Safe Interpretation Rules
            </h2>

            <div className="mt-6 space-y-3">
              {[
                "No blame-based interpretation.",
                "No person-level punishment framing.",
                "No surveillance positioning.",
                "Structural signals must not be used as individual performance labels.",
                "Every pressure signal requires traceable governance context.",
                "Action cues must support stabilization, continuity, and fair response.",
              ].map((rule) => (
                <div
                  key={rule}
                  className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-sm leading-6 text-neutral-200"
                >
                  {rule}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
            Structural Stability Intelligence Ecosystem
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            TSINAXA and EXAMIA Remain Separate but Complementary
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-emerald-500/20 bg-neutral-950/70 p-6">
              <h3 className="text-xl font-bold text-emerald-200">TSINAXA</h3>
              <p className="mt-3 leading-7 text-neutral-300">
                Structural strain detection intelligence. It detects hidden
                strain across staffing, workload, flow, support, and operational
                fragility before instability becomes harder to manage.
              </p>
            </div>

            <div className="rounded-3xl border border-emerald-500/20 bg-neutral-950/70 p-6">
              <h3 className="text-xl font-bold text-emerald-200">EXAMIA</h3>
              <p className="mt-3 leading-7 text-neutral-300">
                Governed stabilization response intelligence. It coordinates
                visible need, routing, intervention, recovery, command oversight,
                and audit traceability after stabilization demand becomes
                visible.
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold text-emerald-300">{value}</p>
    </div>
  );
}