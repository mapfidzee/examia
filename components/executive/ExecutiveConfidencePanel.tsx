'use client'

import type { CSSProperties } from 'react'

import type { CGIExecutiveConfidenceReading } from '@/lib/cgiExecutiveConfidenceEngine'
import { cgiVisualStyles } from '@/lib/cgiVisualSystem'

type ExecutiveConfidencePanelProps = {
  confidence: CGIExecutiveConfidenceReading
}

export default function ExecutiveConfidencePanel({
  confidence,
}: ExecutiveConfidencePanelProps) {
  return (
    <section style={cgiVisualStyles.memoryPanel}>
      <div>
        <p style={cgiVisualStyles.sectionKicker}>Executive Confidence</p>

        <h2 style={cgiVisualStyles.executivePanelTitle}>
          {confidence.confidenceScore}% • {confidence.confidenceLevel}
        </h2>

        <p style={cgiVisualStyles.executiveBodyText}>
          {confidence.boardSentence}
        </p>
      </div>

      <div style={gridFour}>
        <MetricCard
          label="Data Sufficiency"
          value={confidence.dataSufficiency}
        />
        <MetricCard
          label="Evidence"
          value={confidence.evidenceConfidence}
        />
        <MetricCard label="Memory" value={confidence.memoryCoverage} />
        <MetricCard
          label="Conclusion"
          value={confidence.conclusionConfidence}
        />
      </div>

      <div style={gridThree}>
        <TextCard
          title="Confidence Rationale"
          body={confidence.confidenceRationale}
        />
        <TextCard
          title="Recovery Confidence"
          body={confidence.recoveryConfidence}
        />
        <TextCard
          title="Recommendation Confidence"
          body={confidence.recommendationConfidence}
        />
      </div>

      <div style={cgiVisualStyles.darkPanel}>
        <p style={cgiVisualStyles.metricLabel}>Confidence Gaps</p>

        <div style={gridFourCompact}>
          {confidence.confidenceGaps.map((gap, index) => (
            <article key={`${gap}-${index}`} style={cgiVisualStyles.quietCard}>
              <span style={numberStyle}>
                {String(index + 1).padStart(2, '0')}
              </span>

              <span style={textStyle}>{gap}</span>
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

const gridThree: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
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

const textStyle: CSSProperties = {
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