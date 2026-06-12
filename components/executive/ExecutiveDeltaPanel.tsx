'use client'

import type { CSSProperties } from 'react'

import type { CGIExecutiveDeltaReading } from '@/lib/cgiExecutiveDeltaEngine'
import {
  cgiVisualStyles,
  mergeCGIStyles,
} from '@/lib/cgiVisualSystem'

type ExecutiveDeltaPanelProps = {
  delta: CGIExecutiveDeltaReading
}

export default function ExecutiveDeltaPanel({
  delta,
}: ExecutiveDeltaPanelProps) {
  return (
    <section style={mergeCGIStyles(cgiVisualStyles.decisionPanel)}>
      <div>
        <p style={cgiVisualStyles.sectionKicker}>
          Executive Delta Intelligence
        </p>

        <h2 style={cgiVisualStyles.executivePanelTitle}>
          {delta.executiveChange}
        </h2>

        <p style={cgiVisualStyles.executiveBodyText}>
          {delta.boardSentence}
        </p>
      </div>

      <div style={gridFour}>
        <MetricCard
          label="Previous Reading"
          value={delta.previousReading}
        />
        <MetricCard
          label="Current Reading"
          value={delta.currentReading}
        />
        <MetricCard label="Direction" value={delta.direction} />
        <MetricCard label="Confidence" value={delta.confidence} />
      </div>

      <div style={gridFour}>
        <TextCard title="Why It Changed" body={delta.whyItChanged} />
        <TextCard title="What Improved" body={delta.whatImproved} />
        <TextCard title="What Worsened" body={delta.whatWorsened} />
        <TextCard
          title="What Could Break It Again"
          body={delta.whatCouldBreakItAgain}
        />
      </div>

      <div style={cgiVisualStyles.darkPanel}>
        <p style={cgiVisualStyles.metricLabel}>
          Institutional Threat Stack
        </p>

        <div style={gridFourCompact}>
          {delta.threatStack.map((threat, index) => (
            <article key={`${threat}-${index}`} style={cgiVisualStyles.quietCard}>
              <span style={numberStyle}>
                {String(index + 1).padStart(2, '0')}
              </span>

              <span style={threatTextStyle}>{threat}</span>
            </article>
          ))}
        </div>
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

const gridFourCompact: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 12,
  marginTop: 14,
}

const metricValueStyle: CSSProperties = {
  margin: '10px 0 0',
  color: '#fff8e7',
  fontSize: 18,
  fontWeight: 950,
  lineHeight: 1.1,
}

const numberStyle: CSSProperties = {
  display: 'block',
  color: '#d6b25e',
  fontSize: 12,
  fontWeight: 950,
  letterSpacing: '0.14em',
  marginBottom: 8,
}

const threatTextStyle: CSSProperties = {
  display: 'block',
  color: '#fff8e7',
  fontSize: 13,
  fontWeight: 900,
  lineHeight: 1.4,
}

const bodyStyle: CSSProperties = {
  color: '#fff8e7',
  lineHeight: 1.5,
  fontSize: 12,
  margin: '8px 0 0',
  fontWeight: 700,
}