'use client'

import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import InfrastructureQuickNav from '@/components/InfrastructureQuickNav'
import { createSnapshotAuditLog } from '@/lib/snapshotAudit'

import { supabase } from '../lib/supabase'

import {
  buildSnapshotGovernancePayload,
  type ExecutiveVisibilityLevel,
  type SnapshotType,
  type StabilizationConfidence,
} from '../lib/snapshotGovernance'

type SaveState = 'IDLE' | 'SAVING' | 'SAVED' | 'ERROR'

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background: '#020617',
  color: '#f8fafc',
  padding: '32px',
}

const containerStyle: CSSProperties = {
  maxWidth: '1180px',
  margin: '0 auto',
}

const cardStyle: CSSProperties = {
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '18px',
  padding: '18px',
  background: 'rgba(255,255,255,0.04)',
}

const metricGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '16px',
  marginTop: '28px',
}

const formGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '16px',
}

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '13px',
  color: '#cbd5e1',
  marginBottom: '6px',
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.16)',
  background: '#111827',
  color: '#f9fafb',
}

export default function OperationsPage() {
  const [saveState, setSaveState] = useState<SaveState>('IDLE')
  const [errorMessage, setErrorMessage] = useState('')

  const [snapshotReason, setSnapshotReason] = useState(
    'Scheduled executive continuity review'
  )

  const [snapshotScope, setSnapshotScope] = useState(
    'Institution-wide CGI operations'
  )

  const [snapshotType, setSnapshotType] =
    useState<SnapshotType>('DAILY_CONTINUITY_REVIEW')

  const [governanceNote, setGovernanceNote] = useState(
    'Snapshot preserved for continuity posture review, historical comparison, and executive visibility.'
  )

  const [reviewPeriod, setReviewPeriod] = useState(
    'Current operational cycle'
  )

  const [reviewOwner, setReviewOwner] = useState(
    'Continuity Governance Lead'
  )

  const [executiveVisibilityLevel, setExecutiveVisibilityLevel] =
    useState<ExecutiveVisibilityLevel>('EXECUTIVE')

  const [stabilizationConfidence, setStabilizationConfidence] =
    useState<StabilizationConfidence>('MODERATE')

  const metrics = useMemo(() => {
    return {
      scope: 'CGI_CONTINUITY_OPERATIONS',
      region: 'GLOBAL',
      institution_id: null,

      continuity_integrity_score: 86,
      stabilization_confidence_score: 78,
      escalation_pressure_index: 42,
      recovery_reliability_score: 74,
      operational_survivability_score: 81,

      continuity_state: 'STABILIZING',
      propagation_risk: 'MODERATE',
      routing_friction: 'LOW',
      responder_pressure: 'MODERATE',
      escalation_velocity: 'CONTROLLED',
      coordination_instability: 'LOW',
      stabilization_drag: 'MODERATE',

      pressure_propagation_state: 'CONTAINED_PRESSURE',
      trajectory_risk: 'WATCH',
      continuity_drift: 'LOW',
      escalation_momentum: 'SLOWING',
      recovery_direction: 'IMPROVING',
      stabilization_trend: 'POSITIVE',
      unresolved_momentum: 'MODERATE',
      trajectory_direction: 'STABILIZING',

      structural_memory_risk: 'WATCH',
      routing_failure_recurrence: 'LOW',
      escalation_corridor_recurrence: 'MODERATE',
      institutional_fragility_signature: 'CONTAINED',
      intervention_failure_pattern: 'LIMITED',
      responder_strain_recurrence: 'MODERATE',
      continuity_collapse_recurrence: 'LOW',
      structural_memory_state: 'ACTIVE_MEMORY',

      dominant_pressure_source:
        'Coordination load and unresolved continuity drag',

      dominant_trajectory_signal:
        'Improving recovery with moderate unresolved momentum',

      dominant_memory_pattern:
        'Recurring pressure corridors require executive review',

      executive_summary:
        'CGI continuity posture is stabilizing, but unresolved momentum and recurring pressure corridors require governed review before survivability can be considered credible.',

      action_cue:
        'Preserve snapshot, review pressure corridor recurrence, and verify whether recovery is durable before declaring stabilization credible.',
    }
  }, [])

  async function saveGovernedSnapshot() {
    setSaveState('SAVING')
    setErrorMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const governancePayload = buildSnapshotGovernancePayload({
      snapshotReason,
      snapshotScope,
      snapshotType,
      governanceNote,
      reviewPeriod,
      continuityPosture: metrics.continuity_state,
      pressureClassification: metrics.pressure_propagation_state,
      trajectoryState: metrics.trajectory_direction,
      recoveryStatus: metrics.recovery_direction,
      stabilizationConfidence,
      executiveVisibilityLevel,
      snapshotTrigger:
        'Manual governed snapshot from CGI operations page',
      reviewOwner,
      savedBy: user?.id ?? null,
      savedByEmail: user?.email ?? null,
    })

    const { data: snapshot, error: snapshotError } = await supabase
      .from('cgi_operational_metrics')
      .insert({
        ...metrics,
        ...governancePayload,
      })
      .select('id')
      .single()

    if (snapshotError || !snapshot?.id) {
      setSaveState('ERROR')
      setErrorMessage(
        snapshotError?.message ||
          'Snapshot was not returned after save.'
      )
      return
    }

    const auditResult = await createSnapshotAuditLog({
      snapshotId: snapshot.id,
      auditAction: 'GOVERNED_SNAPSHOT_CREATED',
      auditReason: snapshotReason,
      governanceScope: snapshotScope,
      performedBy: user?.id ?? null,
      performedByEmail: user?.email ?? null,
      continuityPosture: metrics.continuity_state,
      trajectoryState: metrics.trajectory_direction,
      pressureClassification: metrics.pressure_propagation_state,
      recoveryStatus: metrics.recovery_direction,
      executiveVisibilityLevel,
    })

    if (!auditResult.success) {
      setSaveState('ERROR')
      setErrorMessage(
        'Snapshot saved, but audit logging failed. Review audit trail before relying on this snapshot.'
      )
      return
    }

    setSaveState('SAVED')
  }

  return (
    <GovernanceRouteGuard
      allowedRoles={[
        'SUPER_ADMIN',
        'COMMAND_ADMIN',
        'GOVERNANCE_OFFICER',
        'INSTITUTION_COORDINATOR',
      ]}
    >
      <main style={pageStyle}>
        <InfrastructureQuickNav />

        <section style={containerStyle}>
          <p style={{ color: '#94a3b8', marginBottom: '8px' }}>
            TSINAXA CGI · Continuity Governance Infrastructure
          </p>

          <h1 style={{ fontSize: '38px', marginBottom: '10px' }}>
            Operations Snapshot Governance
          </h1>

          <p
            style={{
              color: '#cbd5e1',
              maxWidth: '860px',
              lineHeight: 1.7,
            }}
          >
            This surface preserves operational continuity snapshots as governed
            evidence. A snapshot is not just saved data. It is historical
            continuity intelligence with scope, reason, review period,
            visibility level, executive interpretation, and audit traceability.
          </p>

          <div style={metricGridStyle}>
            <div style={cardStyle}>
              <p style={{ color: '#94a3b8' }}>
                Continuity Integrity
              </p>

              <h2>
                {metrics.continuity_integrity_score}%
              </h2>

              <p>{metrics.continuity_state}</p>
            </div>

            <div style={cardStyle}>
              <p style={{ color: '#94a3b8' }}>
                Stabilization Confidence
              </p>

              <h2>
                {metrics.stabilization_confidence_score}%
              </h2>

              <p>{stabilizationConfidence}</p>
            </div>

            <div style={cardStyle}>
              <p style={{ color: '#94a3b8' }}>
                Pressure Index
              </p>

              <h2>
                {metrics.escalation_pressure_index}
              </h2>

              <p>
                {metrics.pressure_propagation_state}
              </p>
            </div>

            <div style={cardStyle}>
              <p style={{ color: '#94a3b8' }}>
                Survivability Score
              </p>

              <h2>
                {metrics.operational_survivability_score}%
              </h2>

              <p>
                Not closure. Survivability review required.
              </p>
            </div>
          </div>

          <section
            style={{
              ...cardStyle,
              marginTop: '28px',
            }}
          >
            <h2 style={{ marginBottom: '16px' }}>
              Snapshot Governance Protocol
            </h2>

            <div style={formGridStyle}>
              <div>
                <label style={labelStyle}>
                  Snapshot Reason
                </label>

                <input
                  style={inputStyle}
                  value={snapshotReason}
                  onChange={(event) =>
                    setSnapshotReason(event.target.value)
                  }
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Snapshot Scope
                </label>

                <input
                  style={inputStyle}
                  value={snapshotScope}
                  onChange={(event) =>
                    setSnapshotScope(event.target.value)
                  }
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Snapshot Type
                </label>

                <select
                  style={inputStyle}
                  value={snapshotType}
                  onChange={(event) =>
                    setSnapshotType(
                      event.target.value as SnapshotType
                    )
                  }
                >
                  <option value="DAILY_CONTINUITY_REVIEW">
                    Daily Continuity Review
                  </option>

                  <option value="WEEKLY_EXECUTIVE_REVIEW">
                    Weekly Executive Review
                  </option>

                  <option value="PRESSURE_ESCALATION_REVIEW">
                    Pressure Escalation Review
                  </option>

                  <option value="RECOVERY_REVIEW">
                    Recovery Review
                  </option>

                  <option value="RELIABILITY_REVIEW">
                    Reliability Review
                  </option>

                  <option value="MANUAL_GOVERNANCE_SNAPSHOT">
                    Manual Governance Snapshot
                  </option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  Review Period
                </label>

                <input
                  style={inputStyle}
                  value={reviewPeriod}
                  onChange={(event) =>
                    setReviewPeriod(event.target.value)
                  }
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Executive Visibility
                </label>

                <select
                  style={inputStyle}
                  value={executiveVisibilityLevel}
                  onChange={(event) =>
                    setExecutiveVisibilityLevel(
                      event.target.value as ExecutiveVisibilityLevel
                    )
                  }
                >
                  <option value="OPERATIONAL">
                    Operational
                  </option>

                  <option value="GOVERNANCE">
                    Governance
                  </option>

                  <option value="EXECUTIVE">
                    Executive
                  </option>

                  <option value="BOARD_LEVEL">
                    Board Level
                  </option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  Stabilization Confidence
                </label>

                <select
                  style={inputStyle}
                  value={stabilizationConfidence}
                  onChange={(event) =>
                    setStabilizationConfidence(
                      event.target.value as StabilizationConfidence
                    )
                  }
                >
                  <option value="LOW">
                    Low
                  </option>

                  <option value="MODERATE">
                    Moderate
                  </option>

                  <option value="HIGH">
                    High
                  </option>

                  <option value="NOT_YET_CREDIBLE">
                    Not Yet Credible
                  </option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  Review Owner
                </label>

                <input
                  style={inputStyle}
                  value={reviewOwner}
                  onChange={(event) =>
                    setReviewOwner(event.target.value)
                  }
                />
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={labelStyle}>
                Governance Note
              </label>

              <textarea
                style={{
                  ...inputStyle,
                  minHeight: '110px',
                }}
                value={governanceNote}
                onChange={(event) =>
                  setGovernanceNote(event.target.value)
                }
              />
            </div>

            <button
              onClick={saveGovernedSnapshot}
              disabled={saveState === 'SAVING'}
              style={{
                marginTop: '18px',
                padding: '13px 18px',
                borderRadius: '14px',
                border: 'none',
                background:
                  saveState === 'SAVING'
                    ? '#475569'
                    : '#f8fafc',
                color: '#020617',
                fontWeight: 700,
                cursor:
                  saveState === 'SAVING'
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >
              {saveState === 'SAVING'
                ? 'Saving governed snapshot...'
                : 'Save Governed Snapshot'}
            </button>

            {saveState === 'SAVED' && (
              <p
                style={{
                  color: '#86efac',
                  marginTop: '12px',
                }}
              >
                Governed snapshot saved. Historical continuity intelligence and audit trail preserved.
              </p>
            )}

            {saveState === 'ERROR' && (
              <p
                style={{
                  color: '#fca5a5',
                  marginTop: '12px',
                }}
              >
                Snapshot save failed: {errorMessage}
              </p>
            )}
          </section>

          <section
            style={{
              ...cardStyle,
              marginTop: '28px',
            }}
          >
            <h2>
              Executive Interpretation
            </h2>

            <p
              style={{
                color: '#cbd5e1',
                lineHeight: 1.7,
              }}
            >
              {metrics.executive_summary}
            </p>

            <p
              style={{
                color: '#f8fafc',
                lineHeight: 1.7,
              }}
            >
              <strong>Action Cue:</strong>{' '}
              {metrics.action_cue}
            </p>
          </section>
        </section>
      </main>
    </GovernanceRouteGuard>
  )
}