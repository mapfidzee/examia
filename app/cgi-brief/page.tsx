import {
  buildCGIInstitutionalPilotPackage,
} from '../../lib/cgiInstitutionalPilotPackageEngine'

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-3xl font-bold tracking-tight">
        {title}
      </h2>

      <div className="mt-5 space-y-4 text-lg leading-8 text-zinc-300">
        {children}
      </div>
    </section>
  )
}

function BulletList({
  items,
}: {
  items: string[]
}) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-2xl border border-zinc-800 bg-black px-5 py-4"
        >
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function CGIBriefPage() {
  const pilotPackage =
    buildCGIInstitutionalPilotPackage('CONTROLLED_PILOT')

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10">
          <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
            TSINAXA CGI
          </p>

          <h1 className="mt-5 max-w-5xl text-5xl font-bold tracking-tight">
            Continuity Governance Intelligence
          </h1>

          <p className="mt-6 max-w-4xl text-xl leading-9 text-zinc-300">
            CGI governs visible instability until stabilization credibility
            exists.
          </p>

          <div className="mt-8 rounded-3xl border border-zinc-800 bg-black p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
              Core Doctrine
            </p>

            <p className="mt-3 text-3xl font-semibold leading-tight">
              Visible recovery is not the same as durable stabilization.
            </p>
          </div>
        </header>

        <Section
          eyebrow="Executive Problem"
          title="Most institutions can see incidents. Few can see continuity credibility."
        >
          <p>
            Most operational systems show events, tickets, staffing,
            dashboards, alerts, and workflows.
          </p>

          <p>
            But leadership still struggles to answer one critical question:
          </p>

          <div className="rounded-3xl border border-zinc-800 bg-black p-6 text-2xl font-semibold leading-relaxed text-white">
            Can the institution still stabilize itself reliably under pressure?
          </div>

          <p>
            CGI was built to answer that question.
          </p>
        </Section>

        <Section
          eyebrow="What CGI Does"
          title="CGI converts instability into governed executive meaning."
        >
          <p>
            CGI does not simply display operational activity.
          </p>

          <p>
            It derives continuity condition, recovery credibility,
            survivability pressure, recurrence severity, accountability,
            executive posture, and stabilization confidence.
          </p>

          <p>
            The system is designed to help executives understand whether
            visible recovery is truly holding — or whether instability is
            quietly returning underneath apparent resolution.
          </p>
        </Section>

        <Section
          eyebrow="Why CGI Is Different"
          title="CGI remembers structurally."
        >
          <p>
            Most systems forget instability once a ticket is closed or a
            workflow appears resolved.
          </p>

          <p>
            CGI tracks recurrence, reburn, fragile recovery, escalation
            accumulation, unresolved pressure, and continuity degradation
            across time.
          </p>

          <div className="rounded-3xl border border-zinc-800 bg-black p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
              CGI Principle
            </p>

            <p className="mt-3 text-2xl font-semibold leading-relaxed">
              Repeated instability is often structural weakness —
              not temporary difficulty.
            </p>
          </div>
        </Section>

        <Section
          eyebrow="Executive Outputs"
          title="CGI compresses operational instability into calm command visibility."
        >
          <BulletList
            items={[
              'Continuity condition',
              'Recovery credibility',
              'Survivability pressure',
              'Executive posture',
              'Required action',
              'Required evidence',
              'Structural memory signals',
              'Accountability status',
              'Stabilization confidence',
            ]}
          />
        </Section>

        <Section
          eyebrow="Pilot Structure"
          title="Controlled Institutional Pilot"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-zinc-800 bg-black p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
                Pilot Duration
              </p>

              <p className="mt-3 text-3xl font-semibold">
                {pilotPackage.pilotDuration}
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
                Pilot Range
              </p>

              <p className="mt-3 text-3xl font-semibold">
                {pilotPackage.pilotPriceRange}
              </p>
            </div>
          </div>

          <p>
            The pilot is designed to evaluate how CGI interprets visible
            instability, recovery credibility, recurrence, accountability,
            and executive stabilization pressure inside a continuity-sensitive
            environment.
          </p>
        </Section>

        <Section
          eyebrow="Pilot Deliverables"
          title="Institutional demonstration outputs"
        >
          <BulletList items={pilotPackage.pilotDeliverables} />
        </Section>

        <Section
          eyebrow="Institutional Onboarding"
          title="How CGI enters an organization"
        >
          <BulletList items={pilotPackage.onboardingSequence} />
        </Section>

        <Section
          eyebrow="Success Evidence"
          title="What successful continuity interpretation looks like"
        >
          <BulletList items={pilotPackage.successEvidence} />
        </Section>

        <Section
          eyebrow="Closing Position"
          title="CGI is continuity intelligence infrastructure."
        >
          <p>
            CGI does not compete with ordinary operational dashboards.
          </p>

          <p>
            CGI governs continuity credibility under pressure.
          </p>

          <p>
            It helps institutions determine whether stabilization is truly
            holding — or whether instability is returning beneath apparent
            recovery.
          </p>

          <div className="rounded-3xl border border-zinc-800 bg-black p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
              Executive Positioning
            </p>

            <p className="mt-3 text-2xl font-semibold leading-relaxed">
              TSINAXA CGI is becoming a continuity governance intelligence
              infrastructure for institutions operating under pressure.
            </p>
          </div>
        </Section>
      </div>
    </main>
  )
}