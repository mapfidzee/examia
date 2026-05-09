import Link from "next/link";

const quickLinks = [
  { label: "System", href: "/system" },
  { label: "Domains", href: "/domains" },
  { label: "Case Flow", href: "/case-flow" },
  { label: "Action Cues", href: "/action-cues" },
  { label: "Command", href: "/command" },
  { label: "Audit", href: "/audit" },
  { label: "Governance", href: "/governance" },
  { label: "Pressure", href: "/pressure" },
  { label: "Bottlenecks", href: "/bottlenecks" },
  { label: "Recovery", href: "/recovery" },
  { label: "Predictive", href: "/predictive" },
  { label: "Reliability", href: "/reliability" },
  { label: "Operations", href: "/operations" },
  { label: "Coordination", href: "/coordination" },
  { label: "Interventions", href: "/interventions" },
  { label: "Outcomes", href: "/outcomes" },
  { label: "Trajectory", href: "/trajectory" },
];

export default function InfrastructureQuickNav() {
  return (
    <nav className="rounded-3xl border border-blue-900/60 bg-[#0B1B30] p-4 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              EXAMIA Quick Navigation
            </p>
            <h2 className="mt-1 text-lg font-bold text-white">
              Governed Stabilization Routes
            </h2>
          </div>

          <Link
            href="/system"
            className="rounded-2xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-3 text-center text-sm font-semibold text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-400/20"
          >
            Full System Map
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-blue-800/70 bg-[#07111F] px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-300 hover:bg-[#102744] hover:text-cyan-100"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}