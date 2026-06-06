import {
  buildCGIInstitutionalPilotPackage,
} from '../../lib/cgiInstitutionalPilotPackageEngine'
import {
  buildCGIExecutiveBriefing,
} from '../../lib/cgiExecutiveBriefingGenerator'
import {
  formatCGIExecutivePosture,
  formatCGIEvidenceLanguage,
  formatCGISurvivabilityLanguage,
  formatCGIGovernanceSafeLanguage,
} from '../../lib/cgiExecutivePostureFormatter'

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
      <h2 className="mt-3 text-3xl font-bold tracking-tight">{title}</h2>
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

function BriefingCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-black p-6">
      <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
        {label}
      </p>
      <p className="mt-4 text-xl font-semibold leading-8 text-white">{value}</p>
    </div>
  )
}

export default function CGIBriefPage() {
  const pilotPackage = buildCGIInstitutionalPilotPackage('CONTROLLED_PILOT')
  const pilotThread = pilotPackage.pilotScenarioThread

  const briefing = buildCGIExecutiveBriefing({
    pressurePosture: 'ELEVATED',
    trajectoryPosture: 'WATCHED',
    predictivePosture: 'ELEVATED',
    recoveryPosture: 'WATCHED',
    reliabilityPosture: 'ELEVATED',
    evidenceVerified: false,
    accountabilityActive: true,
    structuralMemoryVisible: true,
  })

  const postureFormat = formatCGIExecutivePosture(
    briefing.synthesis.synthesisPosture,
  )

  const evidenceLanguage = formatCGIEvidenceLanguage(
    false,
    briefing.synthesis.synthesisPosture,
  )

  const survivabilityLanguage = formatCGISurvivabilityLanguage(
    briefing.synthesis.synthesisPosture,
  )

  const governanceSafeLanguage = formatCGIGovernanceSafeLanguage()

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
            CGI proves that visible instability can be governed from first
            report through recovery, command visibility, executive
            interpretation, institutional memory, and audit reconstruction.
          </p>

          <div className="mt-8 rounded-3xl border border-zinc-800 bg-black p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
              Core Executive Question
            </p>
            <p className="mt-3 text-3xl font-semibold leading-tight">
              {briefing.coreQuestion}
            </p>
          </div>
        </header>

        <Section
          eyebrow="Pilot Chain Proof"
          title={pilotThread.scenarioName}
        >
          <p>{pilotThread.scenarioSummary}</p>

          <div className="rounded-3xl border border-amber-800 bg-amber-950/20 p-6 text-2xl font-semibold leading-relaxed text-amber-100">
            {pilotThread.doctrine}
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-black p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
              Executive Thesis
            </p>
            <p className="mt-3 text-2xl font-semibold leading-relaxed text-white">
              {pilotThread.executiveThesis}
            </p>
          </div>
        </Section>

        <Section
          eyebrow="One Instability. One Chain."
          title="The full CGI lifecycle is now demonstrable."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {pilotThread.sites.map((site) => (
              <div
                key={site.siteName}
                className="rounded-3xl border border-zinc-800 bg-black p-6"
              >
                <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
                  {site.siteName}
                </p>
                <p className="mt-3 text-3xl font-bold text-amber-300">
                  {site.posture}
                </p>
                <p className="mt-4 text-base leading-7 text-zinc-400">
                  {site.finding}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Continuity Chain"
          title="Request to Audit Reconstruction"
        >
          <div className="space-y-4">
            {pilotThread.chain.map((stage, index) => (
              <article
                key={`${stage.stage}-${stage.title}`}
                className="rounded-3xl border border-zinc-800 bg-black p-6"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
                      Step {index + 1} • {stage.stage}
                    </p>
                    <h3 className="mt-2 text-2xl font-bold text-white">
                      {stage.title}
                    </h3>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                    Evidence Preserved
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                      Continuity Question
                    </p>
                    <p className="mt-2 leading-7 text-zinc-300">
                      {stage.continuityQuestion}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                      Executive Finding
                    </p>
                    <p className="mt-2 leading-7 text-zinc-300">
                      {stage.executiveFinding}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                      Evidence
                    </p>
                    <p className="mt-2 leading-7 text-zinc-300">
                      {stage.evidencePreserved}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Section>

        <section className="rounded-3xl border border-cyan-900 bg-cyan-950/30 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            Live Synthesis Reading
          </p>

          <h2 className="mt-3 text-4xl font-bold tracking-tight text-cyan-100">
            {postureFormat.label}
          </h2>

          <p className="mt-5 max-w-4xl text-2xl font-semibold leading-9 text-white">
            {postureFormat.headline}
          </p>

          <p className="mt-4 max-w-5xl text-lg leading-8 text-cyan-100">
            {briefing.executiveSummary}
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <BriefingCard
              label="Dominant Concern"
              value={briefing.dominantConcern}
            />
            <BriefingCard
              label="Synthesis Posture"
              value={briefing.synthesis.synthesisPosture}
            />
            <BriefingCard
              label="Required Executive Action"
              value={briefing.requiredExecutiveAction}
            />
            <BriefingCard
              label="Required Evidence"
              value={briefing.requiredEvidence}
            />
          </div>
        </section>

        <Section
          eyebrow="Executive Problem"
          title="Most institutions can see activity. Few can reconstruct continuity credibility."
        >
          <p>
            Events, tickets, dashboards, alerts, and workflows can show that
            something happened.
          </p>
          <p>
            They do not always prove whether stabilization held, whether the
            risk returned, whether evidence remained attached, or whether
            leadership can reconstruct the chain later.
          </p>
        </Section>

        <Section
          eyebrow="Standardized Executive Language"
          title="CGI uses shared synthesis, posture, evidence, and survivability language."
        >
          <BulletList
            items={[
              postureFormat.description,
              postureFormat.actionLanguage,
              evidenceLanguage,
              survivabilityLanguage,
              governanceSafeLanguage,
            ]}
          />
        </Section>

        <Section
          eyebrow="Pilot Structure"
          title="Controlled Institutional Pilot"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <BriefingCard
              label="Pilot Duration"
              value={pilotPackage.pilotDuration}
            />
            <BriefingCard
              label="Pilot Range"
              value={pilotPackage.pilotPriceRange}
            />
          </div>

          <p>{pilotPackage.pilotPromise}</p>
        </Section>

        <Section
          eyebrow="What CGI Demonstrates"
          title="The pilot is now chain-proof, not dashboard-proof."
        >
          <BulletList items={pilotPackage.whatCGIDemonstrates} />
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
          eyebrow="Institutional Memory"
          title="The lesson survives after visible pressure fades."
        >
          <div className="rounded-3xl border border-zinc-800 bg-black p-6 text-2xl font-semibold leading-relaxed text-white">
            {pilotThread.executiveMemory}
          </div>
        </Section>

        <Section
          eyebrow="Audit Reconstruction"
          title="The chain remains reconstructable."
        >
          <BulletList items={pilotThread.auditReconstruction} />
        </Section>

        <Section
          eyebrow="Generated Executive Brief"
          title="Standardized copy-ready continuity briefing"
        >
          <pre className="whitespace-pre-wrap rounded-3xl border border-zinc-800 bg-black p-6 text-base leading-8 text-zinc-300">
            {briefing.copyReadyBrief}
          </pre>
        </Section>

        <Section
          eyebrow="Closing Position"
          title="CGI is executive continuity intelligence infrastructure."
        >
          <p>CGI does not compete with ordinary operational dashboards.</p>
          <p>CGI governs continuity credibility under pressure.</p>
          <p>
            It helps institutions determine whether stabilization is truly
            holding, whether recurrence is returning, and whether the chain can
            still be reconstructed.
          </p>

          <div className="rounded-3xl border border-zinc-800 bg-black p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
              Closing Offer
            </p>
            <p className="mt-3 text-2xl font-semibold leading-relaxed">
              {pilotPackage.closingOffer}
            </p>
          </div>
        </Section>
      </div>
    </main>
  )
}