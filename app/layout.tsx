import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "EXAMIA | Governed Continuity Infrastructure",
  description:
    "EXAMIA prevents operational disruption from disappearing after it is noticed.",
};

const commandLinks = [
  { label: "Command", href: "/command" },
  { label: "Audit", href: "/audit" },
  { label: "Governance", href: "/governance" },
  { label: "Timeline", href: "/timeline" },
];

const operationLinks = [
  { label: "Cases", href: "/cases" },
  { label: "Routing", href: "/routing" },
  { label: "Interventions", href: "/interventions" },
  { label: "Outcomes", href: "/outcomes" },
  { label: "Recovery", href: "/recovery" },
];

const intelligenceLinks = [
  { label: "Pressure", href: "/pressure" },
  { label: "Bottlenecks", href: "/bottlenecks" },
  { label: "Trajectory", href: "/trajectory" },
  { label: "Predictive", href: "/predictive" },
  { label: "Reliability", href: "/reliability" },
];

const systemLinks = [
  { label: "System", href: "/system" },
  { label: "Infrastructure", href: "/infrastructure" },
  { label: "Domains", href: "/domains" },
  { label: "Case Flow", href: "/case-flow" },
  { label: "Action Cues", href: "/action-cues" },
];

function LinkGroup({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">
        {title}
      </p>

      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-300 hover:bg-cyan-950 hover:text-cyan-100"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function ExecutiveShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050B14] text-slate-100">
      <header className="border-b border-slate-800 bg-[#07111F]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">
                EXAMIA LIS
              </p>

              <h1 className="mt-2 text-2xl font-black tracking-tight text-white md:text-3xl">
                Governed Continuity Infrastructure
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                Prevents operational disruption from disappearing after it is
                noticed. TSINAXA detects hidden structural strain. EXAMIA
                governs the response after visible disruption enters the
                pathway.
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-200">
                Current Phase
              </p>
              <p className="mt-2 text-sm font-bold text-white">
                World-Class Hardening
              </p>
              <p className="mt-1 text-xs text-slate-300">
                Governance • Continuity • Recovery • Auditability
              </p>
            </div>
          </div>

          <nav className="grid gap-5 rounded-3xl border border-slate-800 bg-[#0B1B30] p-5 shadow-2xl shadow-black/20 lg:grid-cols-4">
            <LinkGroup title="Command" links={commandLinks} />
            <LinkGroup title="Operations" links={operationLinks} />
            <LinkGroup title="Intelligence" links={intelligenceLinks} />
            <LinkGroup title="System" links={systemLinks} />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8">
        {children}
      </main>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full font-sans">
        <ExecutiveShell>{children}</ExecutiveShell>
      </body>
    </html>
  );
}