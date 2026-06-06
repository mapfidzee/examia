import {
  buildCGIDemoScenario,
  cgiDemoScenarioKeys,
} from '../../lib/cgiDemoScenarioEngine'
import { buildCGIExecutiveWalkthrough } from '../../lib/cgiExecutiveWalkthroughEngine'

function formatLabel(value: string): string {
  return value.replaceAll('_', ' ')
}

function Panel({
  title,
  value,
  children,
}: {
  title: string
  value?: string
  children?: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        {title}
      </p>
      {value ? (
        <h3 className="mt-2 text-xl font-semibold text-white">{value}</h3>
      ) : null}
      {children ? (
        <div className="mt-3 text-sm leading-6 text-zinc-300">
          {children}
        </div>
      ) : null}
    </section>
  )
}

export default function CGIDemoPage() {
  const scenarios = cgiDemoScenarioKeys.map((key) => buildCGIDemoScenario(key))

  const featured = buildCGIDemoScenario('FUEL_LOGISTICS_CHAIN_PROOF')
  const walkthrough = buildCGIExecutiveWalkthrough(
    'FUEL_LOGISTICS_CHAIN_PROOF',
  )
  const pilotThread = featured.pilotThread

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            TSINAXA CGI
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight">
            Executive Continuity Intelligence Demo
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-300">
            CGI now demonstrates one visible instability moving through the full
            continuity chain: request, triage, case governance, routing,
            intervention, outcomes, recovery, command, coordination, cross-site
            interpretation, situation room, executive center, executive report,
            memory board, and audit reconstruction.
          </p>
        </header>

        <section className="rounded-3xl border border-amber-900 bg-amber-950/20 p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-amber-300">
                Featured Pilot Scenario
              </p>
              <h2 className="mt-3 text-3xl font-bold">
                {featured.scenarioTitle}
              </h2>
              <p className="mt-3 max-w-4xl text-zinc-200">
                {pilotThread.scenarioSummary}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-800 bg-black px-5 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Case ID
              </p>
              <p className="mt-1 text-xl font-bold text-amber-300">
                {pilotThread.caseId}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-amber-800 bg-black p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
              Executive Thesis
            </p>
            <p className="mt-3 text-2xl font-semibold leading-relaxed text-white">
              {pilotThread.executiveThesis}
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {pilotThread.sites.map((site) => (
              <Panel
                key={site.siteName}
                title={site.siteName}
                value={site.posture}
              >
                {site.finding}
              </Panel>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Full Chain Demonstration
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            One instability remains visible from Request to Audit.
          </h2>

          <div className="mt-8 space-y-5">
            {pilotThread.chain.map((stage, index) => (
              <article
                key={`${stage.stage}-${stage.title}`}
                className="rounded-2xl border border-zinc-800 bg-black p-6"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                      Step {index + 1} · {formatLabel(stage.stage)}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold">
                      {stage.title}
                    </h3>
                  </div>
                  <p className="max-w-md rounded-xl border border-zinc-800 px-4 py-3 text-sm text-zinc-300">
                    {stage.continuityQuestion}
                  </p>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                      Executive Finding
                    </p>
                    <p className="mt-2 leading-7 text-zinc-200">
                      {stage.executiveFinding}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                      Evidence Preserved
                    </p>
                    <p className="mt-2 leading-7 text-zinc-300">
                      {stage.evidencePreserved}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                Intelligence Reading
              </p>
              <h2 className="mt-3 text-3xl font-bold">
                CGI still derives executive continuity intelligence.
              </h2>
            </div>
            <div className="rounded-2xl border border-zinc-700 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Shell Tone
              </p>
              <p className="mt-1 text-2xl font-bold">
                {featured.shell.severityTone}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <Panel
              title="Dominant Truth"
              value={featured.command.dominantTruth}
            />
            <Panel
              title="Continuity Condition"
              value={formatLabel(featured.derivation.continuityCondition)}
            >
              {featured.shell.continuityPanel.interpretation}
            </Panel>
            <Panel
              title="Executive Posture"
              value={formatLabel(featured.derivation.executivePosture)}
            >
              {featured.shell.commandPanel.interpretation}
            </Panel>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <Panel
              title="Recovery Credibility"
              value={formatLabel(featured.derivation.recoveryCredibility)}
            >
              {featured.shell.recoveryPanel.interpretation}
            </Panel>
            <Panel
              title="Structural Memory"
              value={formatLabel(featured.memory.primaryMemorySignal)}
            >
              {featured.memory.executiveMemoryWarning}
            </Panel>
            <Panel
              title="Accountability"
              value={formatLabel(
                featured.accountability.accountabilityStatus,
              )}
            >
              {featured.accountability.escalationRule}
            </Panel>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Panel title="Required Action">
              {featured.command.requiredAction}
            </Panel>
            <Panel title="Required Evidence">
              {featured.command.requiredEvidence}
            </Panel>
          </div>

          <Panel title="Executive Summary">
            {featured.shell.executiveSummary}
          </Panel>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Executive Walkthrough
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            {walkthrough.walkthroughTitle}
          </h2>
          <p className="mt-4 max-w-4xl leading-8 text-zinc-300">
            {walkthrough.walkthroughPurpose}
          </p>

          <div className="mt-8 space-y-5">
            {walkthrough.steps.map((step) => (
              <article
                key={step.stepNumber}
                className="rounded-2xl border border-zinc-800 bg-black p-6"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                      Step {step.stepNumber} · {formatLabel(step.stepType)}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold">
                      {step.title}
                    </h3>
                  </div>
                  <p className="max-w-md rounded-xl border border-zinc-800 px-4 py-3 text-sm text-zinc-300">
                    {step.executiveQuestion}
                  </p>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                      System Answer
                    </p>
                    <p className="mt-2 leading-7 text-zinc-200">
                      {step.systemAnswer}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                      Why It Matters
                    </p>
                    <p className="mt-2 leading-7 text-zinc-300">
                      {step.whyItMatters}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <Panel title="Closing Doctrine">
              {walkthrough.closingDoctrine}
            </Panel>
            <Panel title="Executive Takeaway">
              {walkthrough.executiveTakeaway}
            </Panel>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Institutional Memory
          </p>
          <h2 className="mt-3 text-2xl font-bold">
            The lesson survives after visible pressure fades.
          </h2>
          <p className="mt-4 max-w-4xl leading-8 text-zinc-300">
            {pilotThread.executiveMemory}
          </p>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Audit Reconstruction
          </p>
          <h2 className="mt-3 text-2xl font-bold">
            The continuity chain remains reconstructable.
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pilotThread.auditReconstruction.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-zinc-800 bg-black p-5 text-sm leading-6 text-zinc-300"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Scenario Library
          </p>
          <h2 className="mt-3 text-2xl font-bold">
            CGI Continuity Demonstration Set
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {scenarios.map((scenario) => (
              <article
                key={scenario.scenarioKey}
                className="rounded-2xl border border-zinc-800 bg-black p-5"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  {formatLabel(scenario.scenarioKey)}
                </p>
                <h3 className="mt-3 text-xl font-semibold">
                  {scenario.scenarioTitle}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-300">
                  {scenario.scenarioPurpose}
                </p>

                <div className="mt-5 space-y-2 text-sm text-zinc-300">
                  <p>
                    <span className="text-zinc-500">Condition:</span>{' '}
                    {formatLabel(scenario.derivation.continuityCondition)}
                  </p>
                  <p>
                    <span className="text-zinc-500">Posture:</span>{' '}
                    {formatLabel(scenario.derivation.executivePosture)}
                  </p>
                  <p>
                    <span className="text-zinc-500">Memory:</span>{' '}
                    {formatLabel(scenario.memory.primaryMemorySignal)}
                  </p>
                  <p>
                    <span className="text-zinc-500">Pilot readiness:</span>{' '}
                    {formatLabel(scenario.pilotReadiness.readinessLevel)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Doctrine Lock
          </p>
          <h2 className="mt-3 text-2xl font-bold">
            Visible recovery is not durable stabilization.
          </h2>
          <p className="mt-4 max-w-4xl leading-8 text-zinc-300">
            CGI does not govern events. It governs continuity credibility. The
            executive question is not simply what happened. The executive
            question is whether the institution can still stabilize itself
            reliably under pressure.
          </p>
        </section>
      </div>
    </main>
  )
}