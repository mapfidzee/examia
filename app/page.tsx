import Link from "next/link";

const entryPoints = [
  {
    label: "Infrastructure Gateway",
    href: "/infrastructure",
    description: "Enter the full stabilization operating environment.",
  },
  {
    label: "System Spine",
    href: "/system",
    description: "View the structural stabilization infrastructure map.",
  },
  {
    label: "Healthcare Domains",
    href: "/domains",
    description: "Review the healthcare-first cross-domain model.",
  },
  {
    label: "Case Flow",
    href: "/case-flow",
    description: "Trace one governed stabilization case lifecycle.",
  },
];

const signals = [
  { label: "Primary Domain", value: "Healthcare" },
  { label: "Core Function", value: "Stabilization Response" },
  { label: "Governance", value: "Traceable" },
  { label: "Interpretation", value: "Non-Punitive" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#07111F] text-slate-100">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center gap-10 px-5 py-10 sm:px-8 lg:px-10">
        <header className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 shadow-2xl shadow-black/30 sm:p-10">
          <div className="mb-5 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            EXAMIA Stabilization Infrastructure
          </div>

          <h1 className="max-w-6xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Healthcare-First Governed Stabilization Response Infrastructure
          </h1>

          <p className="mt-6 max-w-4xl text-base leading-8 text-slate-300 sm:text-lg">
            EXAMIA coordinates visible need intake, case governance, routing,
            intervention, continuity, recovery, pressure visibility, command
            oversight, and audit traceability across complex operational
            environments.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/infrastructure"
              className="rounded-2xl border border-cyan-400/40 bg-cyan-400/10 px-6 py-4 text-center text-sm font-bold text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-400/20"
            >
              Enter Infrastructure Gateway
            </Link>

            <Link
              href="/system"
              className="rounded-2xl border border-blue-800/70 bg-[#07111F] px-6 py-4 text-center text-sm font-semibold text-slate-200 transition hover:border-cyan-300 hover:text-cyan-100"
            >
              View System Spine
            </Link>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {signals.map((signal) => (
            <div
              key={signal.label}
              className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {signal.label}
              </p>
              <p className="mt-3 text-lg font-bold text-cyan-300">
                {signal.value}
              </p>
            </div>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Infrastructure Purpose
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              From Visible Need to Governed Stabilization
            </h2>
            <p className="mt-4 leading-8 text-slate-300">
              EXAMIA is designed to help leaders see whether visible needs are
              captured, routed, addressed, reviewed, monitored for recovery, and
              protected by governance audit. It turns stabilization response into
              a traceable operating pathway.
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-400/25 bg-cyan-400/10 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
              Healthcare Boundary
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Operational, Not Clinical
            </h2>
            <p className="mt-4 leading-8 text-slate-200">
              EXAMIA supports coordination, routing, continuity, recovery, and
              governance visibility. It does not diagnose, prescribe, replace
              clinical judgment, store clinical conclusions, or rank
              individuals.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
            Entry Points
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Stabilization Infrastructure Access
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {entryPoints.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-blue-900/60 bg-[#07111F] p-5 transition hover:border-cyan-300 hover:bg-[#102744]"
              >
                <p className="text-base font-bold text-white">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {item.description}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                  {item.href}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
            Governance Commitment
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Structural Visibility Without Blame
          </h2>

          <p className="mt-4 max-w-5xl leading-8 text-slate-300">
            EXAMIA routes and signals must remain operational, traceable,
            structural, healthcare-first, and non-punitive. The system is built
            to strengthen stabilization visibility, not surveillance,
            individual punishment, or dashboard sprawl.
          </p>
        </section>
      </section>
    </main>
  );
}