'use client'

import type { CSSProperties } from 'react'

import type { CGIExecutiveRiskReading } from '@/lib/cgiExecutiveRiskEngine'
import { cgiVisualStyles } from '@/lib/cgiVisualSystem'

type ExecutiveRiskPanelProps = {
  risk: CGIExecutiveRiskReading
}

export default function ExecutiveRiskPanel({ risk }: ExecutiveRiskPanelProps) {
  return (
    <section style={cgiVisualStyles.warningPanel}>
      <div>
        <p style={cgiVisualStyles.sectionKicker}>Executive Risk</p>

        <h2 style={cgiVisualStyles.executivePanelTitle}>{risk.topRisk}</h2>

        <p style={cgiVisualStyles.executiveBodyText}>
          {risk.boardSentence}
        </p>
      </div>

      <div style={gridFour}>
        <MetricCard label="Risk Level" value={risk.riskLevel} />
        <MetricCard label="Trend" value={risk.riskTrend} />
        <MetricCard label="Probability" value={risk.probability} />
        <MetricCard label="Impact" value={risk.impact} />
      </div>

      <div style={gridThree}>
        <TextCard title="Risk Rationale" body={risk.riskRationale} />
        <TextCard title="Protection Move" body={risk.protectionMove} />
        <TextCard
          title="Survivability Risk"
          body={risk.survivabilityRisk}
        />
        <TextCard title="Coordination Risk" body={risk.coordinationRisk} />
        <TextCard title="Recurrence Risk" body={risk.recurrenceRisk} />
        <TextCard title="Evidence Risk" body={risk.evidenceRisk} />
      </div>
    </section>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article style={cgiVisualStyles.goldCard}>
      <p style={cgiVisualStyles.metricLabel}>{label}</p>
      <p style={metricValueStyle}>{value}</p>
    </article>
  )
}

function TextCard({ title, body }: { title: string; body: string }) {
  return (
    <article style={cgiVisualStyles.goldCard}>
      <p style={cgiVisualStyles.sectionKicker}>{title}</p>
      <p style={bodyStyle}>{body}</p>
    </article>
  )
}

const gridFour: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 16,
}

const gridThree: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: 16,
}

const metricValueStyle: CSSProperties = {
  margin: '10px 0 0',
  color: '#fff8e7',
  fontSize: 18,
  fontWeight: 950,
  lineHeight: 1.1,
}

const bodyStyle: CSSProperties = {
  color: '#fff8e7',
  lineHeight: 1.5,
  fontSize: 12,
  margin: '8px 0 0',
  fontWeight: 700,
}