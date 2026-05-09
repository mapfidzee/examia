import Link from "next/link";
import InfrastructureNav from "@/components/InfrastructureNav";

const signals = [
  { label: "Routing Pressure", value: "HIGH", cue: "Review routing load" },
  { label: "Bottleneck Pressure", value: "HIGH", cue: "Inspect blocked pathways" },
  { label: "Recovery Signal", value: "VISIBLE", cue: "Review unresolved recovery burden" },
  { label: "Audit Integrity", value: "STRONG", cue: "Signals remain traceable" },
];

const futureLocks = [
  "Role-based access",
  "Institution profiles",
  "Facility-level views",
  "Responder permissions",
  "Governed case ownership",
  "Multi-site command visibility",
];

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
            Healthcare-First Stabilization Operating Environment
          </h1>

          <p className="mt-5 max-w-4xl text-base leading-8 text-slate-300 sm:text-lg">
            This gateway connects the EXAMIA infrastructure spine: system
            mapping, domains, case flow, action cues, command oversight, audit
            traceability, pressure visibility, recovery monitoring, and governed
            operational coordination.
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {signals.map((signal) => (
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

        <section className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8 lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Infrastructure Interpretation
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Stabilization Pressure Is Visible and Governed
            </h2>
            <p className="mt-4 leading-8 text-slate-300">
              EXAMIA is currently organized to show when visible needs, routing
              pressure, bottlenecks, fragmented continuity, and recovery burden
              require structured leadership attention. The system is not
              designed to blame individuals. It is designed to make stabilization
              pathways visible, traceable, and governable.
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-400/25 bg-cyan-400/10 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
              Healthcare Boundary
            </p>
            <h2 className="mt-2 text-xl font-bold text-white">
              Operational Coordination Layer
            </h2>
            <p className="mt-4 leading-7 text-slate-200">
              EXAMIA supports coordination, routing, continuity, recovery, and
              governance visibility. It does not diagnose, prescribe, replace
              clinical judgment, or rank individuals.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
            Core Entry Routes
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            Stabilization Infrastructure Access
          </h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <GatewayLink label="System Spine" href="/system" />
            <GatewayLink label="Domains" href="/domains" />
            <GatewayLink label="Case Flow" href="/case-flow" />
            <GatewayLink label="Action Cues" href="/action-cues" />
            <GatewayLink label="Command" href="/command" />
            <GatewayLink label="Audit" href="/audit" />
            <GatewayLink label="Pressure" href="/pressure" />
            <GatewayLink label="Recovery" href="/recovery" />
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Future Infrastructure Locks
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Reserved Governance Expansion Areas
            </h2>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {futureLocks.map((item) => (
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
              Ecosystem Boundary
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Separate Systems, Shared Stability Mission
            </h2>

            <p className="mt-4 leading-8 text-slate-200">
              TSINAXA detects hidden structural strain. EXAMIA governs
              stabilization response after visible need, disruption, or
              institutional instability enters the response pathway. They remain
              separate but complementary systems inside a broader structural
              stability intelligence ecosystem.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
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
  );
}