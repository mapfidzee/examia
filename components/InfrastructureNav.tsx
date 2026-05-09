import Link from "next/link";

type NavGroup = {
  title: string;
  items: {
    label: string;
    href: string;
  }[];
};

const navGroups: NavGroup[] = [
  {
    title: "Core Infrastructure",
    items: [
      { label: "System Spine", href: "/system" },
      { label: "Domains", href: "/domains" },
      { label: "Case Flow", href: "/case-flow" },
      { label: "Action Cues", href: "/action-cues" },
    ],
  },
  {
    title: "Governance & Command",
    items: [
      { label: "Command", href: "/command" },
      { label: "Audit", href: "/audit" },
      { label: "Governance", href: "/governance" },
    ],
  },
  {
    title: "Pressure & Recovery",
    items: [
      { label: "Pressure", href: "/pressure" },
      { label: "Bottlenecks", href: "/bottlenecks" },
      { label: "Recovery", href: "/recovery" },
      { label: "Trajectory", href: "/trajectory" },
      { label: "Predictive", href: "/predictive" },
    ],
  },
  {
    title: "Operational Coordination",
    items: [
      { label: "Cases", href: "/cases" },
      { label: "Routing", href: "/routing" },
      { label: "Interventions", href: "/interventions" },
      { label: "Outcomes", href: "/outcomes" },
      { label: "Operations", href: "/operations" },
      { label: "Reliability", href: "/reliability" },
      { label: "Coordination", href: "/coordination" },
    ],
  },
];

export default function InfrastructureNav() {
  return (
    <nav className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-5 shadow-2xl shadow-black/20">
      <div className="flex flex-col gap-6">
        <div>
          <div className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
            EXAMIA Infrastructure Navigation Spine
          </div>

          <h2 className="mt-4 text-2xl font-bold text-white">
            Governed Stabilization Infrastructure
          </h2>

          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
            Unified navigation across healthcare-first stabilization
            infrastructure. Each route supports visible need coordination,
            continuity review, pressure visibility, recovery intelligence,
            command oversight, and governance-safe interpretation.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {navGroups.map((group) => (
            <section
              key={group.title}
              className="rounded-2xl border border-blue-900/60 bg-[#07111F] p-5"
            >
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                {group.title}
              </h3>

              <div className="mt-4 flex flex-wrap gap-3">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-2xl border border-blue-800/70 bg-[#0B1B30] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300 hover:bg-[#102744] hover:text-cyan-100"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
            Governance Reminder
          </p>

          <p className="mt-3 text-sm leading-7 text-slate-200">
            EXAMIA routes must remain operational, traceable, structural,
            healthcare-first, and non-punitive. Navigation cohesion should
            strengthen stabilization visibility rather than create dashboard
            sprawl or surveillance framing.
          </p>
        </div>
      </div>
    </nav>
  );
}