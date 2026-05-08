import Link from "next/link";

type ActionCue = {
  code: string;
  category: string;
  severity: string;
  meaning: string;
  risk: string;
  actionCue: string;
  escalation: string;
  governanceNote: string;
};

const actionCues: ActionCue[] = [
  {
    code: "HIGH_ROUTING_PRESSURE",
    category: "Routing",
    severity: "High",
    meaning:
      "Visible needs are entering the system faster than the current routing pathway can smoothly absorb.",
    risk:
      "Delayed coordination, unresolved cases, responder overload, and rising stabilization backlog.",
    actionCue:
      "Review routing load, rebalance response pathways, and prioritize cases with continuity risk.",
    escalation:
      "Escalate when high routing pressure repeats across more than one monitoring window or affects critical continuity pathways.",
    governanceNote:
      "Interpret as system pressure, not individual delay or responder failure.",
  },
  {
    code: "HIGH_BOTTLENECK_PRESSURE",
    category: "Bottlenecks",
    severity: "High",
    meaning:
      "Coordination points are repeatedly slowing or blocking stabilization response.",
    risk:
      "Cases may remain stuck between intake, routing, intervention, outcome review, or recovery monitoring.",
    actionCue:
      "Identify the blocked pathway, inspect handoff friction, and assign a coordination repair action.",
    escalation:
      "Escalate when bottlenecks affect urgent cases, repeated handoffs, or cross-department coordination.",
    governanceNote:
      "Focus on blocked process points rather than blaming specific people or departments.",
  },
  {
    code: "FRAGMENTED_CONTINUITY",
    category: "Trajectory",
    severity: "Moderate-High",
    meaning:
      "The stabilization pathway is moving unevenly, with weak continuity between response stages.",
    risk:
      "Cases may appear active but fail to progress toward stable recovery or resolution.",
    actionCue:
      "Review handoff quality, follow-up visibility, unresolved outcomes, and recovery ownership.",
    escalation:
      "Escalate when fragmented continuity appears across multiple cases or high-risk pathways.",
    governanceNote:
      "Treat fragmentation as a continuity design issue, not a person-level performance label.",
  },
  {
    code: "RECOVERY_PRESSURE_VISIBLE",
    category: "Recovery",
    severity: "Moderate",
    meaning:
      "The system is carrying unresolved recovery burden after intervention activity.",
    risk:
      "Interventions may be occurring without enough recovery confirmation, continuity repair, or closure discipline.",
    actionCue:
      "Review unresolved recovery signals and confirm whether cases require follow-up, escalation, or closure.",
    escalation:
      "Escalate when recovery pressure increases while outcomes remain unresolved or delayed.",
    governanceNote:
      "Recovery pressure should guide support and continuity review, not punishment.",
  },
  {
    code: "MODERATE_FORECAST_PRESSURE",
    category: "Predictive",
    severity: "Moderate",
    meaning:
      "Current stabilization patterns suggest pressure may increase if capacity, routing, or coordination does not adjust.",
    risk:
      "A manageable pressure pattern may become a high-pressure stabilization burden.",
    actionCue:
      "Prepare response capacity, review likely bottlenecks, and watch early continuity signals.",
    escalation:
      "Escalate when forecast pressure combines with high routing pressure or visible bottlenecks.",
    governanceNote:
      "Predictive cues are early warnings for preparation, not certainty claims.",
  },
  {
    code: "CRITICAL_COMMAND_STATUS",
    category: "Command",
    severity: "Critical",
    meaning:
      "Multiple stabilization signals indicate serious pressure requiring leadership-level review.",
    risk:
      "The system may lose coordination reliability if leadership does not prioritize stabilization response.",
    actionCue:
      "Activate command review, prioritize urgent pathways, inspect bottlenecks, and assign response ownership.",
    escalation:
      "Escalate immediately when critical command status aligns with high pressure, recovery burden, and audit-confirmed traceability.",
    governanceNote:
      "Command status supports leadership response; it must not be used for blame, surveillance, or individual punishment.",
  },
  {
    code: "STRONG_AUDIT_INTEGRITY",
    category: "Audit",
    severity: "Positive",
    meaning:
      "The system has enough traceability to support trusted interpretation of stabilization signals.",
    risk:
      "Low immediate governance risk, but pressure signals must still be interpreted carefully.",
    actionCue:
      "Use audit strength to support structured response decisions while preserving safe interpretation rules.",
    escalation:
      "Escalate only if audit strength declines, records become incomplete, or signal traceability weakens.",
    governanceNote:
      "Strong audit integrity makes signals usable; it does not make them punitive.",
  },
  {
    code: "GOVERNANCE_ACTIVE",
    category: "Governance",
    severity: "Stable",
    meaning:
      "Safeguards, interpretation rules, and ethical boundaries are active within the stabilization system.",
    risk:
      "Governance drift may occur if new domains or routes introduce unclear meanings or unsafe language.",
    actionCue:
      "Keep interpretation structural, traceable, non-punitive, and aligned with stabilization response.",
    escalation:
      "Escalate when new pages, domains, or workflows weaken governance boundaries.",
    governanceNote:
      "Governance is the protection layer that keeps EXAMIA safe for institutional use.",
  },
];

const registryRules = [
  "Every status must map to a meaning, risk, action cue, escalation threshold, and governance note.",
  "Action cues must support stabilization response, not blame assignment.",
  "Predictive cues must be treated as preparation signals, not certainty claims.",
  "Critical status requires leadership review, not person-level punishment.",
  "Audit strength supports trust in signals, but does not authorize punitive interpretation.",
  "Healthcare-first use must remain operational and coordination-focused, not clinical decision-making.",
];

const severityStyles: Record<string, string> = {
  High: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  "Moderate-High": "border-orange-400/40 bg-orange-400/10 text-orange-200",
  Moderate: "border-cyan-400/40 bg-cyan-400/10 text-cyan-200",
  Critical: "border-red-400/40 bg-red-400/10 text-red-200",
  Positive: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  Stable: "border-blue-400/40 bg-blue-400/10 text-blue-200",
};

export default function ActionCuesPage() {
  return (
    <main className="min-h-screen bg-[#07111F] text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:px-8 lg:px-10">
        <header className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            EXAMIA Action Cue Registry
          </div>

          <h1 className="max-w-5xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Controlled Stabilization Interpretation Engine
          </h1>

          <p className="mt-5 max-w-4xl text-base leading-8 text-slate-300 sm:text-lg">
            The action cue registry standardizes how EXAMIA interprets pressure,
            bottlenecks, continuity, recovery, command, audit, and governance
            signals. Each status connects to meaning, risk, response guidance,
            escalation threshold, and governance-safe interpretation.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SignalCard label="Registry Type" value="CONTROLLED" />
            <SignalCard label="Primary Use" value="RESPONSE CUES" />
            <SignalCard label="Healthcare Role" value="OPERATIONAL" />
            <SignalCard label="Interpretation" value="NON-PUNITIVE" />
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8 lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Strategic Function
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              From Signal to Governed Response
            </h2>
            <p className="mt-4 leading-8 text-slate-300">
              EXAMIA should not merely display system pressure. It must help
              leadership understand what the signal means, what risk it points
              toward, what action cue is appropriate, when escalation is
              justified, and how the signal must be interpreted safely. This
              registry protects the system from vague dashboard language and
              keeps response logic consistent across healthcare and other
              domains.
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-400/25 bg-cyan-400/10 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
              Healthcare Boundary
            </p>
            <h2 className="mt-2 text-xl font-bold text-white">
              Coordination, Not Diagnosis
            </h2>
            <p className="mt-4 leading-7 text-slate-200">
              Action cues support operational coordination, continuity review,
              routing repair, recovery monitoring, and governance oversight.
              They do not diagnose, prescribe, replace clinical judgment, or
              rank individuals.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
                Registry Logic
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                Required Interpretation Fields
              </h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/system"
                className="rounded-2xl border border-cyan-400/40 bg-cyan-400/10 px-5 py-3 text-center text-sm font-semibold text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-400/20"
              >
                System Spine
              </Link>
              <Link
                href="/domains"
                className="rounded-2xl border border-blue-800/70 bg-[#07111F] px-5 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-cyan-300 hover:text-cyan-100"
              >
                Domains
              </Link>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-5">
            {["Status", "Meaning", "Risk", "Action Cue", "Governance Note"].map(
              (item, index) => (
                <div
                  key={item}
                  className="rounded-2xl border border-blue-900/60 bg-[#07111F] p-4"
                >
                  <div className="text-xs font-semibold text-cyan-300">
                    FIELD {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    {item}
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        <section>
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Signal Registry
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Stabilization Statuses and Leadership Action Cues
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {actionCues.map((cue) => (
              <article
                key={cue.code}
                className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                      {cue.category}
                    </p>
                    <h3 className="mt-2 break-words text-xl font-bold text-white">
                      {cue.code}
                    </h3>
                  </div>

                  <div
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                      severityStyles[cue.severity] ??
                      "border-blue-400/40 bg-blue-400/10 text-blue-200"
                    }`}
                  >
                    {cue.severity}
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  <CueRow label="Meaning" value={cue.meaning} />
                  <CueRow label="Risk" value={cue.risk} />
                  <CueRow label="Action Cue" value={cue.actionCue} />
                  <CueRow label="Escalation Threshold" value={cue.escalation} />
                  <CueRow label="Governance Note" value={cue.governanceNote} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Registry Control Rules
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Prevent Interpretation Drift
            </h2>

            <div className="mt-6 space-y-3">
              {registryRules.map((rule) => (
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
              Next Infrastructure Layer
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Build Case Flow Next
            </h2>

            <p className="mt-4 leading-8 text-slate-200">
              After action cues are locked, the next layer should show how one
              stabilization case moves through the full governed lifecycle:
              intake, case governance, routing, intervention, outcome, recovery,
              trajectory, pressure review, command oversight, and audit
              traceability.
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

function CueRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-blue-900/60 bg-[#07111F] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-200">{value}</p>
    </div>
  );
}