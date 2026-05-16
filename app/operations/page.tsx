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

import { calculateExecutivePrioritization } from '../lib/executivePrioritization'

type SaveState = 'IDLE' | 'SAVING' | 'SAVED' | 'ERROR'

const GOVERNANCE_INSTITUTION = 'TSINAXA CGI'

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
    'Snapshot preserved for continuity posture review, historical comparison, executive visibility, and action prioritization.'
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
    const baseMetrics = {
      scope: 'CGI_CONTINUITY_OPERATIONS',
      region: 'GLOBAL',
      institution_id: null,
      governance_institution: GOVERNANCE_INSTITUTION,

      continuity_integrity_score: 86,
      stabilization_confidence_score: 78,
      escalation_pressure_index: 42,
      recovery_reliability_score: 74,
      operational_survivability_score: 81,

      continuity_state: 'STABILIZING',

      propagation_risk: 42,
      routing_friction: 21,
      responder_pressure: 48,
      escalation_velocity: 36,
      coordination_instability: 24,
      stabilization_drag: 44,

      pressure_propagation_state: 'CONTAINED_PRESSURE',

      trajectory_risk: 39,
      continuity_drift: 18,
      escalation_momentum: 32,
      recovery_direction: 71,
      stabilization_trend: 76,
      unresolved_momentum: 46,

      trajectory_direction: 'STABILIZING',

      structural_memory_risk: 38,
      routing_failure_recurrence: 22,
      escalation_corridor_recurrence: 49,
      institutional_fragility_signature: 35,
      intervention_failure_pattern: 19,
      responder_strain_recurrence: 43,
      continuity_collapse_recurrence: 16,

      structural_memory_state: 'ACTIVE_MEMORY',

      dominant_pressure_source:
        'Coordination load and unresolved continuity drag',

      dominant_trajectory_signal:
        'Improving recovery with moderate unresolved momentum',

      dominant_memory_pattern:
        'Recurring pressure corridors require executive review',
    }

    const prioritization = calculateExecutivePrioritization({
      escalationPressureIndex:
        baseMetrics.escalation_pressure_index,
      operationalSurvivabilityScore:
        baseMetrics.operational_survivability_score,
      recoveryReliabilityScore:
        baseMetrics.recovery_reliability_score,
      unresolvedMomentum:
        baseMetrics.unresolved_momentum,
      continuityCollapseRecurrence:
        baseMetrics.continuity_collapse_recurrence,
      escalationCorridorRecurrence:
        baseMetrics.escalation_corridor_recurrence,
      responderStrainRecurrence:
        baseMetrics.responder_strain_recurrence,
    })

    return {
      ...baseMetrics,

      executive_priority_score:
        prioritization.executivePriorityScore,

      survivability_threat_level:
        prioritization.survivabilityThreatLevel,

      executive_action_urgency:
        prioritization.executiveActionUrgency,

      structural_deterioration_state:
        prioritization.structuralDeteriorationState,

      executive_action_deadline:
        prioritization.executiveActionDeadline,

      executive_summary:
        `CGI continuity posture is ${baseMetrics.continuity_state.toLowerCase()}, with ${prioritization.survivabilityThreatLevel.toLowerCase()} survivability threat and ${prioritization.executiveActionUrgency.toLowerCase()} executive action urgency. Recurring pressure corridors and unresolved momentum require governed review before stabilization can be considered durable.`,

      action_cue:
        `Priority score ${prioritization.executivePriorityScore}/100. Review pressure corridor recurrence, verify recovery durability, and complete executive action ${prioritization.executiveActionDeadline.toLowerCase()}.`,
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
      recoveryStatus: String(metrics.recovery_direction),
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
      governanceInstitution: GOVERNANCE_INSTITUTION,
      performedBy: user?.id ?? null,
      performedByEmail: user?.email ?? null,
      continuityPosture: metrics.continuity_state,
      trajectoryState: metrics.trajectory_direction,
      pressureClassification: metrics.pressure_propagation_state,
      recoveryStatus: String(metrics.recovery_direction),
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
              maxWidth: '900px',
              lineHeight: 1.7,
            }}
          >
            This surface preserves operational continuity snapshots as governed
            evidence. Each snapshot now carries institution ownership, audit
            traceability, executive visibility, survivability threat level, and
            action prioritization.
          </p>

          <div style={metricGridStyle}>
            <div style={cardStyle}>
              <p style={{ color: '#94a3b8' }}>
                Executive Priority Score
              </p>

              <h2>
                {metrics.executive_priority_score}/100
              </h2>

              <p>{metrics.executive_action_urgency}</p>
            </div>

            <div style={cardStyle}>
              <p style={{ color: '#94a3b8' }}>
                Survivability Threat
              </p>

              <h2>
                {metrics.survivability_threat_level}
              </h2>

              <p>
                {metrics.executive_action_deadline}
              </p>
            </div>

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
                Structural Deterioration
              </p>

              <h2>
                {metrics.structural_deterioration_state}
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
                Governed snapshot saved. Historical continuity intelligence,
                prioritization signal, and audit trail preserved.
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