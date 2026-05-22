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

function BulletList({ items }: { items: string[] }) {
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

function IntelligenceCard({
  title,
  question,
  meaning,
}: {
  title: string
  question: string
  meaning: string
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-black p-6">
      <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
        {title}
      </p>

      <h3 className="mt-4 text-2xl font-semibold leading-tight">
        {question}
      </h3>

      <p className="mt-4 text-base leading-7 text-zinc-400">
        {meaning}
      </p>
    </div>
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
            Executive Continuity Intelligence Brief
          </h1>

          <p className="mt-6 max-w-4xl text-xl leading-9 text-zinc-300">
            CGI compresses pressure, trajectory, predictive warning,
            recovery credibility, and trustworthiness into one executive
            continuity reading.
          </p>

          <div className="mt-8 rounded-3xl border border-zinc-800 bg-black p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
              Core Executive Question
            </p>

            <p className="mt-3 text-3xl font-semibold leading-tight">
              Can continuity still be trusted under operational pressure?
            </p>
          </div>
        </header>

        <Section
          eyebrow="Executive Problem"
          title="Most institutions can see activity. Few can interpret continuity credibility."
        >
          <p>
            Events, tickets, dashboards, alerts, and workflows can show that
            something happened.
          </p>

          <p>
            They do not always show whether the institution is still capable of
            stabilizing itself reliably under pressure.
          </p>

          <div className="rounded-3xl border border-zinc-800 bg-black p-6 text-2xl font-semibold leading-relaxed text-white">
            CGI exists to interpret whether visible recovery is becoming
            durable continuity — or whether instability is returning beneath
            apparent resolution.
          </div>
        </Section>

        <Section
          eyebrow="Synthesis Layer"
          title="CGI turns separate intelligence surfaces into one executive continuity posture."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <IntelligenceCard
              title="Pressure"
              question="Is operational pressure weakening survivability?"
              meaning="Pressure intelligence shows whether accumulated strain is beginning to threaten continuity protection."
            />

            <IntelligenceCard
              title="Trajectory"
              question="Is continuity stabilizing, holding, or degrading?"
              meaning="Trajectory intelligence shows the direction of continuity movement across persisted memory."
            />

            <IntelligenceCard
              title="Predictive Warning"
              question="What pressure may become visible next?"
              meaning="Early-warning intelligence identifies continuity risk before disruption becomes fully visible."
            />

            <IntelligenceCard
              title="Recovery"
              question="Is recovery credible or only temporarily contained?"
              meaning="Recovery governance checks whether visible improvement is becoming durable stabilization."
            />

            <IntelligenceCard
              title="Reliability"
              question="Can stabilization still be trusted?"
              meaning="Trustworthiness intelligence evaluates whether continuity credibility can hold under sustained pressure."
            />

            <IntelligenceCard
              title="Executive Action"
              question="What must leadership protect now?"
              meaning="Command intelligence compresses the condition into executive posture, required action, and evidence need."
            />
          </div>
        </Section>

        <Section
          eyebrow="Core Doctrine"
          title="Visible recovery is not the same as durable stabilization."
        >
          <p>
            CGI does not govern events alone.
          </p>

          <p>
            CGI governs continuity credibility after instability becomes
            visible.
          </p>

          <p>
            The system tracks whether recovery is holding, whether pressure is
            accumulating, whether recurrence is returning, and whether
            leadership has enough evidence to trust stabilization.
          </p>
        </Section>

        <Section
          eyebrow="Executive Outputs"
          title="CGI compresses operational instability into calm command visibility."
        >
          <BulletList
            items={[
              'Continuity condition',
              'Pressure posture',
              'Trajectory direction',
              'Predictive early-warning posture',
              'Recovery credibility',
              'Continuity trustworthiness',
              'Survivability pressure',
              'Structural memory signals',
              'Accountability status',
              'Required executive action',
              'Required stabilization evidence',
            ]}
          />
        </Section>

        <Section
          eyebrow="Structural Memory"
          title="CGI remembers what ordinary dashboards often forget."
        >
          <p>
            Most systems move on when an item appears closed.
          </p>

          <p>
            CGI preserves recurrence, reburn, fragile recovery, unresolved
            pressure, repeated escalation, and survivability strain across
            time.
          </p>

          <div className="rounded-3xl border border-zinc-800 bg-black p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
              CGI Principle
            </p>

            <p className="mt-3 text-2xl font-semibold leading-relaxed">
              Repeated instability is often structural weakness — not temporary
              difficulty.
            </p>
          </div>
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
            The pilot evaluates how CGI interprets visible instability,
            recovery credibility, recurrence, pressure, accountability,
            trajectory, and executive stabilization risk inside a
            continuity-sensitive environment.
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
          title="CGI is executive continuity intelligence infrastructure."
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
              TSINAXA CGI is an Executive Continuity Intelligence
              Infrastructure for institutions operating under pressure.
            </p>
          </div>
        </Section>
      </div>
    </main>
  )
}