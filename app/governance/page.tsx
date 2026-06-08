'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { supabase } from '../../lib/supabase'

type TeacherProfile = {
  id: string
  full_name: string
  email: string
  subjects: string[] | null
  grade_levels: string[] | null
  province: string | null
  spoken_languages: string[] | null
  hourly_rate: number | null
  bio: string | null
  status: string
  created_at?: string
}

type GovernancePosture =
  | 'AUTHORITY CONTROLLED'
  | 'AUTHORITY UNDER REVIEW'
  | 'AUTHORITY CONDITIONAL'
  | 'AUTHORITY RESTRICTED'
  | 'AUTHORITY COMPROMISED'
  | 'AUTHORITY MEMORY ABSENT'

type AuthorityDecision =
  | 'ACTIVATE_WITH_EVIDENCE'
  | 'VERIFY_BEFORE_ACTIVATION'
  | 'RESTRICT_AUTHORITY'
  | 'SUSPEND_AUTHORITY'
  | 'REMOVE_AUTHORITY'
  | 'BUILD_GOVERNANCE_MEMORY'

type GovernanceIntelligence = {
  posture: GovernancePosture
  decision: AuthorityDecision
  question: string
  thesis: string
  authorityMeaning: string
  accessRisk: string
  responderTrust: string
  restrictionMeaning: string
  auditMeaning: string
  doctrineMeaning: string
  executiveAction: string
  evidenceRequirement: string
  memoryRequirement: string
  boardWarning: string
  generatedBrief: string
}

const STATUS_FLOW = [
  'PENDING',
  'UNDER_REVIEW',
  'VERIFIED',
  'ACTIVE',
  'RESTRICTED',
  'SUSPENDED',
  'REMOVED',
]

const GOVERNANCE_REASONS: Record<string, string[]> = {
  PENDING: ['Initial responder submission received', 'Awaiting governance review'],
  UNDER_REVIEW: [
    'Governance review initiated',
    'Verification evidence under assessment',
    'Safeguarding review in progress',
  ],
  VERIFIED: [
    'Identity reviewed',
    'Capability evidence accepted',
    'Safeguarding accepted',
    'Operational readiness confirmed',
    'Institutional recommendation accepted',
    'Regional approval completed',
  ],
  ACTIVE: [
    'Responder approved for assignment',
    'Governance activation completed',
    'District operational activation approved',
    'Institution-linked activation approved',
    'Responder cleared for intervention routing',
  ],
  RESTRICTED: [
    'Limited operational scope applied',
    'Temporary governance restriction',
    'Escalation monitoring active',
    'Operational visibility reduced',
  ],
  SUSPENDED: [
    'Safeguarding review pending',
    'Operational concern detected',
    'Repeated assignment non-response',
    'Institutional escalation pending',
    'Policy breach investigation',
  ],
  REMOVED: [
    'Governance removal approved',
    'Safeguarding violation confirmed',
    'Operational trust failure',
    'Institutional removal request',
    'Repeated governance breach',
  ],
}

const doctrineLocks = [
  {
    title: 'Continuity Authority Must Be Governed',
    text:
      'Access, responder activation, restriction, suspension, and removal must remain governed by role, trust state, evidence, and continuity purpose.',
  },
  {
    title: 'Non-Punitive Interpretation',
    text:
      'Governance signals must protect continuity and safeguarding. They must not become blame, ranking, humiliation, or uncontrolled surveillance.',
  },
  {
    title: 'Authority Requires Evidence',
    text:
      'A responder is not operationally trusted because a profile exists. Authority requires verification, scope clarity, safeguarding review, and audit memory.',
  },
  {
    title: 'Audit Must Reconstruct Authority',
    text:
      'Every governance action must be reconstructable: who changed authority, why, from what status, to what status, and with what evidence.',
  },
]

const deploymentHardening = [
  'Environment variables verified before deployment',
  'Supabase access and RLS policies reviewed',
  'Command route restricted to authorized leaders',
  'Audit route preserved as institutional memory layer',
  'Recovery protocol reviewed before pilot launch',
  'Access-denied pathway tested',
  'Responder suspension and restriction behavior tested',
  'Manual degraded-operations capture process defined',
  'Backup and export discipline scheduled',
  'Governance action logging verified',
]

export default function GovernanceConsolePage() {
  return (
    <GovernanceRouteGuard allowedRoles={['SUPER_ADMIN', 'GOVERNANCE_OFFICER']}>
      <CGIGovernanceShell>
        <GovernanceConsoleContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function GovernanceConsoleContent() {
  const [mounted, setMounted] = useState(false)
  const [profiles, setProfiles] = useState<TeacherProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const [selectedProfile, setSelectedProfile] = useState<TeacherProfile | null>(
    null,
  )
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedReason, setSelectedReason] = useState('')
  const [governanceNotes, setGovernanceNotes] = useState('')

  useEffect(() => {
    setMounted(true)
    loadProfiles()
  }, [])

  async function loadProfiles() {
    setLoading(true)
    setMessage('Loading enterprise governance authority memory...')

    const { data, error } = await supabase
      .from('teacher_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setMessage('Enterprise governance authority memory could not be loaded.')
      setLoading(false)
      return
    }

    setProfiles(data || [])
    setMessage('Enterprise governance authority memory loaded.')
    setLoading(false)
  }

  function openGovernanceAction(profile: TeacherProfile, nextStatus: string) {
    setSelectedProfile(profile)
    setSelectedStatus(nextStatus)
    setSelectedReason('')
    setGovernanceNotes('')
  }

  async function confirmGovernanceAction() {
    if (!selectedProfile || !selectedStatus || !selectedReason) {
      alert('Please select a governance reason.')
      return
    }

    setActionLoading(`${selectedProfile.id}-${selectedStatus}`)
    setMessage('')

    const previousStatus = normalizedStatus(selectedProfile.status)

    const { error: updateError } = await supabase
      .from('teacher_profiles')
      .update({ status: selectedStatus })
      .eq('id', selectedProfile.id)

    if (updateError) {
      console.error(updateError)
      alert(updateError.message)
      setActionLoading(null)
      return
    }

    const { data: responderData, error: responderError } = await supabase
      .from('responders')
      .upsert(
        {
          source_teacher_profile_id: selectedProfile.id,
          full_name: selectedProfile.full_name,
          email: selectedProfile.email,
          operational_status: selectedStatus,
          governance_status: selectedStatus,
          governance_reason: selectedReason,
          governance_role: 'RESPONDER',
          response_domains: selectedProfile.subjects || [],
          learner_levels: selectedProfile.grade_levels || [],
          languages: selectedProfile.spoken_languages || [],
          region: selectedProfile.province || '',
          trust_score: trustScoreForStatus(selectedStatus),
          safeguarding_status:
            selectedStatus === 'ACTIVE' || selectedStatus === 'VERIFIED'
              ? 'ACCEPTED'
              : 'PENDING',
          verification_summary: selectedProfile.bio || '',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' },
      )
      .select()
      .single()

    if (responderError) {
      console.error(responderError)
      alert(responderError.message)
      setActionLoading(null)
      return
    }

    const { error: actionError } = await supabase
      .from('governance_actions')
      .insert({
        responder_id: responderData.id,
        teacher_profile_id: selectedProfile.id,
        action_type: `STATUS_CHANGE_TO_${selectedStatus}`,
        previous_status: previousStatus,
        new_status: selectedStatus,
        governance_actor: 'TSINAXA CGI Governance Console',
        reason: selectedReason,
        notes: governanceNotes.trim() || null,
      })

    if (actionError) {
      console.error(actionError)
      alert(actionError.message)
      setActionLoading(null)
      return
    }

    setSelectedProfile(null)
    setSelectedStatus('')
    setSelectedReason('')
    setGovernanceNotes('')
    setActionLoading(null)
    setMessage(`Authority moved to ${selectedStatus}. Governance action logged.`)

    await loadProfiles()
  }

  const governance = useMemo(
    () => buildGovernanceIntelligence(profiles),
    [profiles],
  )

  if (!mounted) return null
    return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div>
            <p style={styles.kicker}>TSINAXA CGI • ENTERPRISE GOVERNANCE</p>

            <h1 style={styles.title}>Enterprise Governance Intelligence</h1>

            <p style={styles.subtitle}>
              Governance controls continuity authority, access, trust, activation,
              restriction, suspension, removal, doctrine, deployment discipline,
              and auditability. CGI does not allow authority to drift beyond
              evidence.
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>GOVERNANCE POSTURE</p>
            <p style={styles.statusValue}>{governance.posture}</p>
            <p style={styles.statusMeaning}>{governance.thesis}</p>
          </div>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.commandDeck}>
          <div style={styles.primaryCard}>
            <p style={styles.sectionKicker}>Executive Governance Question</p>

            <h2 style={styles.commandTitle}>{governance.question}</h2>

            <p style={styles.primaryText}>{governance.authorityMeaning}</p>

            <div style={styles.commandMetaGrid}>
              <MiniStat label="Authority Decision" value={governance.decision} />
              <MiniStat label="Responder Trust" value={governance.responderTrust} />
              <MiniStat label="Access Risk" value={governance.accessRisk} />
              <MiniStat label="Audit" value={governance.auditMeaning} />
            </div>
          </div>

          <div style={styles.consequenceCard}>
            <p style={styles.sectionKicker}>Board Warning</p>

            <h2 style={styles.consequenceTitle}>
              Authority without evidence becomes institutional risk.
            </h2>

            <p style={styles.bodyText}>{governance.boardWarning}</p>
          </div>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Total Profiles" value={profiles.length} />
          <Metric
            label="Pending Review"
            value={
              profiles.filter((item) => normalizedStatus(item.status) === 'PENDING')
                .length
            }
          />
          <Metric
            label="Under Review"
            value={
              profiles.filter(
                (item) => normalizedStatus(item.status) === 'UNDER_REVIEW',
              ).length
            }
          />
          <Metric
            label="Active"
            value={
              profiles.filter((item) => normalizedStatus(item.status) === 'ACTIVE')
                .length
            }
          />
          <Metric
            label="Restricted"
            value={
              profiles.filter((item) =>
                ['RESTRICTED', 'SUSPENDED'].includes(
                  normalizedStatus(item.status),
                ),
              ).length
            }
          />
          <Metric
            label="Removed"
            value={
              profiles.filter((item) => normalizedStatus(item.status) === 'REMOVED')
                .length
            }
          />
        </section>

        <section style={styles.gridFour}>
          <ExecutiveCard
            title="Access Risk"
            value={governance.accessRisk}
            body="Whether continuity authority may exceed evidence or role permission."
          />

          <ExecutiveCard
            title="Responder Trust"
            value={governance.responderTrust}
            body="Whether responders are sufficiently verified for operational authority."
          />

          <ExecutiveCard
            title="Restriction Meaning"
            value={governance.restrictionMeaning}
            body="Whether restrictions and suspensions are preserving continuity credibility."
          />

          <ExecutiveCard
            title="Doctrine Meaning"
            value={governance.doctrineMeaning}
            body="Whether governance is preventing blame, drift, weak closure, and uncontrolled authority."
          />
        </section>

        <section style={styles.memoryPanel}>
          <p style={styles.sectionKicker}>Governance Memory</p>

          <h2 style={styles.panelTitle}>
            Authority must be evidence-bound, role-bound, time-bound, and
            reconstructable.
          </h2>

          <div style={styles.memoryGrid}>
            <MiniStat label="Evidence" value={governance.evidenceRequirement} />
            <MiniStat label="Memory" value={governance.memoryRequirement} />
            <MiniStat label="Executive Action" value={governance.executiveAction} />
            <MiniStat label="Audit" value={governance.auditMeaning} />
          </div>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Governance Doctrine Locks">
            <p style={styles.bodyText}>
              These locks protect CGI from becoming surveillance, blame,
              uncontrolled access, weak authority, or non-reconstructable
              decisions.
            </p>

            <div style={styles.doctrineGrid}>
              {doctrineLocks.map((item) => (
                <article key={item.title} style={styles.doctrineItem}>
                  <h3 style={styles.cardValue}>{item.title}</h3>
                  <p style={styles.panelBody}>{item.text}</p>
                </article>
              ))}
            </div>
          </Panel>

          <Panel title="Deployment Hardening">
            <p style={styles.bodyText}>
              These checks protect serious institutional demonstration and pilot
              deployment.
            </p>

            <div style={styles.checkList}>
              {deploymentHardening.map((item) => (
                <div key={item} style={styles.checkItem}>
                  {item}
                </div>
              ))}
            </div>
          </Panel>
        </section>
                <section style={styles.panel}>
          <div style={styles.cardHeader}>
            <div>
              <p style={styles.sectionKicker}>Responder Authority Queue</p>

              <h2 style={styles.panelTitle}>
                Govern activation, restriction, suspension, and removal
              </h2>

              <p style={styles.bodyText}>
                These decisions affect route access, operational authority,
                trust scoring, assignment eligibility, safeguarding visibility,
                and audit memory.
              </p>
            </div>

            <button onClick={loadProfiles} style={styles.primaryButton}>
              Refresh Governance
            </button>
          </div>

          {loading ? (
            <p style={styles.emptyBox}>Loading governance authority queue...</p>
          ) : profiles.length === 0 ? (
            <p style={styles.emptyBox}>No responder authority profiles found.</p>
          ) : (
            <div style={styles.profileList}>
              {profiles.map((profile) => {
                const currentStatus = normalizedStatus(profile.status)

                return (
                  <article key={profile.id} style={styles.profileCard}>
                    <div style={styles.profileTop}>
                      <div>
                        <p style={styles.metricLabel}>Responder Authority</p>
                        <h3 style={styles.profileName}>{profile.full_name}</h3>
                        <p style={styles.email}>{profile.email}</p>
                      </div>

                      <span style={statusBadge(currentStatus)}>
                        {currentStatus}
                      </span>
                    </div>

                    <div style={styles.infoGrid}>
                      <Info label="Domains" value={arrayText(profile.subjects)} />
                      <Info
                        label="Operational Levels"
                        value={arrayText(profile.grade_levels)}
                      />
                      <Info
                        label="Languages"
                        value={arrayText(profile.spoken_languages)}
                      />
                      <Info label="Region" value={profile.province || 'Not provided'} />
                      <Info
                        label="Expected Rate"
                        value={
                          profile.hourly_rate !== null &&
                          profile.hourly_rate !== undefined
                            ? String(profile.hourly_rate)
                            : 'Not provided'
                        }
                      />
                      <Info
                        label="Trust Score"
                        value={String(trustScoreForStatus(currentStatus))}
                      />
                    </div>

                    <details style={styles.details}>
                      <summary style={styles.summary}>
                        View verification evidence
                      </summary>

                      <pre style={styles.bio}>
                        {profile.bio || 'No verification evidence submitted.'}
                      </pre>
                    </details>

                    <div style={styles.actionGrid}>
                      {STATUS_FLOW.map((status) => (
                        <button
                          key={status}
                          onClick={() => openGovernanceAction(profile, status)}
                          disabled={actionLoading === `${profile.id}-${status}`}
                          style={{
                            ...styles.actionButton,
                            opacity:
                              currentStatus === status ||
                              actionLoading === `${profile.id}-${status}`
                                ? 0.55
                                : 1,
                          }}
                        >
                          {actionLoading === `${profile.id}-${status}`
                            ? 'Saving...'
                            : status}
                        </button>
                      ))}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <section style={styles.orderPanel}>
          <p style={styles.sectionKicker}>Copy-Ready Governance Brief</p>

          <h2 style={styles.panelTitle}>
            Can continuity authority be trusted, controlled, and reconstructed?
          </h2>

          <pre style={styles.summaryBox}>{governance.generatedBrief}</pre>
        </section>

        <section style={styles.doctrineCard}>
          <strong>ENTERPRISE GOVERNANCE DOCTRINE</strong>

          <span>
            Governance is not administration. Governance is the control of
            authority, trust, access, restriction, activation, suspension,
            removal, doctrine, and audit memory before continuity authority can
            affect institutional survivability.
          </span>
        </section>
      </div>

      {selectedProfile && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <p style={styles.sectionKicker}>Governance Action</p>

            <h2 style={styles.modalTitle}>Change authority state</h2>

            <p style={styles.modalText}>
              Move <strong>{selectedProfile.full_name}</strong> to{' '}
              <strong>{selectedStatus}</strong>
            </p>

            <label style={styles.label}>Governance Reason</label>

            <select
              value={selectedReason}
              onChange={(event) => setSelectedReason(event.target.value)}
              style={styles.select}
            >
              <option value="">Select governance reason</option>

              {(GOVERNANCE_REASONS[selectedStatus] || []).map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>

            <label style={styles.label}>Governance Notes Optional</label>

            <textarea
              value={governanceNotes}
              onChange={(event) => setGovernanceNotes(event.target.value)}
              style={styles.textarea}
              placeholder="Additional governance notes..."
            />

            <div style={styles.modalActions}>
              <button
                onClick={() => {
                  setSelectedProfile(null)
                  setSelectedStatus('')
                  setSelectedReason('')
                  setGovernanceNotes('')
                }}
                style={styles.cancelButton}
              >
                Cancel
              </button>

              <button
                onClick={confirmGovernanceAction}
                style={styles.confirmButton}
              >
                Confirm Governance Action
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
function buildGovernanceIntelligence(
  profiles: TeacherProfile[],
): GovernanceIntelligence {
  const total = profiles.length

  const pending = profiles.filter(
    (item) => normalizedStatus(item.status) === 'PENDING',
  ).length

  const underReview = profiles.filter(
    (item) => normalizedStatus(item.status) === 'UNDER_REVIEW',
  ).length

  const verified = profiles.filter(
    (item) => normalizedStatus(item.status) === 'VERIFIED',
  ).length

  const active = profiles.filter(
    (item) => normalizedStatus(item.status) === 'ACTIVE',
  ).length

  const restricted = profiles.filter((item) =>
    ['RESTRICTED', 'SUSPENDED'].includes(normalizedStatus(item.status)),
  ).length

  const removed = profiles.filter(
    (item) => normalizedStatus(item.status) === 'REMOVED',
  ).length

  const posture = deriveGovernancePosture({
    total,
    pending,
    underReview,
    verified,
    active,
    restricted,
    removed,
  })

  const decision = deriveAuthorityDecision(posture)

  const question =
    'Can continuity authority be trusted, controlled, and reconstructed?'

  const accessRisk = deriveAccessRisk({
    total,
    pending,
    underReview,
    restricted,
    removed,
  })

  const responderTrust = deriveResponderTrust({
    total,
    verified,
    active,
    pending,
    underReview,
  })

  const restrictionMeaning = deriveRestrictionMeaning({
    restricted,
    removed,
  })

  const auditMeaning = deriveAuditMeaning(posture)

  const doctrineMeaning =
    'Governance protects authority from drifting beyond role, trust, evidence, safeguarding, and continuity purpose.'

  const authorityMeaning = deriveAuthorityMeaning(posture)

  const executiveAction = deriveExecutiveAction(posture)

  const evidenceRequirement =
    'Preserve profile identity, governance status, previous authority state, new authority state, reason, actor, trust score, safeguarding status, operational scope, and governance notes.'

  const memoryRequirement =
    'Preserve every authority change so activation, restriction, suspension, removal, and restoration remain reconstructable.'

  const boardWarning =
    'Do not allow operational authority to exceed evidence, role permission, safeguarding review, or audit memory.'

  const thesis = `${posture}: ${authorityMeaning}`

  const generatedBrief = [
    'TSINAXA CGI ENTERPRISE GOVERNANCE INTELLIGENCE BRIEF',
    '',
    `Executive Governance Question: ${question}`,
    '',
    `Governance Posture: ${posture}`,
    '',
    `Authority Decision: ${decision}`,
    '',
    `Enterprise Thesis: ${thesis}`,
    '',
    `Total Profiles: ${total}`,
    '',
    `Pending Review: ${pending}`,
    '',
    `Under Review: ${underReview}`,
    '',
    `Verified: ${verified}`,
    '',
    `Active: ${active}`,
    '',
    `Restricted / Suspended: ${restricted}`,
    '',
    `Removed: ${removed}`,
    '',
    `Access Risk: ${accessRisk}`,
    '',
    `Responder Trust: ${responderTrust}`,
    '',
    `Restriction Meaning: ${restrictionMeaning}`,
    '',
    `Audit Meaning: ${auditMeaning}`,
    '',
    `Doctrine Meaning: ${doctrineMeaning}`,
    '',
    `Evidence Requirement: ${evidenceRequirement}`,
    '',
    `Memory Requirement: ${memoryRequirement}`,
    '',
    `Board Warning: ${boardWarning}`,
    '',
    `Executive Action: ${executiveAction}`,
    '',
    'Governance-Safe Meaning:',
    'Governance controls authority without assigning blame. It protects continuity by ensuring that access, activation, restriction, suspension, and removal remain evidence-bound and reconstructable.',
  ].join('\n')

  return {
    posture,
    decision,
    question,
    thesis,
    authorityMeaning,
    accessRisk,
    responderTrust,
    restrictionMeaning,
    auditMeaning,
    doctrineMeaning,
    executiveAction,
    evidenceRequirement,
    memoryRequirement,
    boardWarning,
    generatedBrief,
  }
}

function deriveGovernancePosture(input: {
  total: number
  pending: number
  underReview: number
  verified: number
  active: number
  restricted: number
  removed: number
}): GovernancePosture {
  if (input.total === 0) return 'AUTHORITY MEMORY ABSENT'

  if (input.removed > 0 || input.restricted >= 3) {
    return 'AUTHORITY COMPROMISED'
  }

  if (input.restricted > 0) {
    return 'AUTHORITY RESTRICTED'
  }

  if (input.pending > 0 || input.underReview > 0) {
    return 'AUTHORITY UNDER REVIEW'
  }

  if (input.verified > 0 && input.active === 0) {
    return 'AUTHORITY CONDITIONAL'
  }

  return 'AUTHORITY CONTROLLED'
}

function deriveAuthorityDecision(
  posture: GovernancePosture,
): AuthorityDecision {
  if (posture === 'AUTHORITY CONTROLLED') return 'ACTIVATE_WITH_EVIDENCE'
  if (posture === 'AUTHORITY CONDITIONAL') return 'VERIFY_BEFORE_ACTIVATION'
  if (posture === 'AUTHORITY UNDER REVIEW') return 'VERIFY_BEFORE_ACTIVATION'
  if (posture === 'AUTHORITY RESTRICTED') return 'RESTRICT_AUTHORITY'
  if (posture === 'AUTHORITY COMPROMISED') return 'SUSPEND_AUTHORITY'
  return 'BUILD_GOVERNANCE_MEMORY'
}

function deriveAccessRisk(input: {
  total: number
  pending: number
  underReview: number
  restricted: number
  removed: number
}) {
  if (input.total === 0) {
    return 'Access risk cannot be interpreted because no authority memory exists.'
  }

  if (input.removed > 0 || input.restricted >= 3) {
    return 'Access risk is elevated because restriction, suspension, or removal is visible.'
  }

  if (input.pending > 0 || input.underReview > 0) {
    return 'Access risk is conditional because some authority states remain under review.'
  }

  return 'Access risk appears controlled under current governance memory.'
}

function deriveResponderTrust(input: {
  total: number
  verified: number
  active: number
  pending: number
  underReview: number
}) {
  if (input.total === 0) {
    return 'Responder trust cannot be established without governance memory.'
  }

  if (input.active > 0 && input.pending === 0 && input.underReview === 0) {
    return 'Responder trust is currently operationally usable with evidence preserved.'
  }

  if (input.verified > 0 || input.active > 0) {
    return 'Responder trust is partially established but remains conditional.'
  }

  return 'Responder trust requires further verification before operational authority expands.'
}

function deriveRestrictionMeaning(input: {
  restricted: number
  removed: number
}) {
  if (input.removed > 0) {
    return 'Removal is visible, meaning authority failure must remain preserved for audit.'
  }

  if (input.restricted > 0) {
    return 'Restriction or suspension is active, meaning authority has been narrowed to protect continuity.'
  }

  return 'No restriction or removal is currently visible.'
}

function deriveAuditMeaning(posture: GovernancePosture) {
  if (posture === 'AUTHORITY MEMORY ABSENT') {
    return 'Audit cannot reconstruct authority until governance memory exists.'
  }

  if (
    posture === 'AUTHORITY COMPROMISED' ||
    posture === 'AUTHORITY RESTRICTED'
  ) {
    return 'Audit must preserve why authority was narrowed, suspended, or removed.'
  }

  if (posture === 'AUTHORITY UNDER REVIEW') {
    return 'Audit must preserve why authority remains conditional before activation.'
  }

  return 'Audit can preserve the authority chain under current governance memory.'
}

function deriveAuthorityMeaning(posture: GovernancePosture) {
  if (posture === 'AUTHORITY CONTROLLED') {
    return 'Continuity authority appears controlled by role, verification, trust state, and governance memory.'
  }

  if (posture === 'AUTHORITY CONDITIONAL') {
    return 'Continuity authority is forming, but activation should remain evidence-bound.'
  }

  if (posture === 'AUTHORITY UNDER REVIEW') {
    return 'Continuity authority cannot be fully trusted until review and verification are completed.'
  }

  if (posture === 'AUTHORITY RESTRICTED') {
    return 'Continuity authority has been narrowed to protect trust, safeguarding, and institutional control.'
  }

  if (posture === 'AUTHORITY COMPROMISED') {
    return 'Continuity authority is compromised and requires executive governance visibility.'
  }

  return 'Continuity authority cannot be interpreted because governance memory is absent.'
}

function deriveExecutiveAction(posture: GovernancePosture) {
  if (posture === 'AUTHORITY CONTROLLED') {
    return 'Maintain authority monitoring and preserve governance action memory.'
  }

  if (posture === 'AUTHORITY CONDITIONAL') {
    return 'Complete verification before expanding operational authority.'
  }

  if (posture === 'AUTHORITY UNDER REVIEW') {
    return 'Hold authority under review and require evidence before activation.'
  }

  if (posture === 'AUTHORITY RESTRICTED') {
    return 'Maintain restricted authority until evidence supports restoration or escalation.'
  }

  if (posture === 'AUTHORITY COMPROMISED') {
    return 'Escalate governance review and preserve suspension, removal, or restriction evidence.'
  }

  return 'Build governance memory before authority decisions are trusted.'
}

function normalizedStatus(status: string) {
  if (status === 'APPROVED') return 'VERIFIED'
  return status || 'PENDING'
}

function arrayText(value: string[] | null | undefined) {
  if (!value || value.length === 0) return 'Not provided'
  return value.join(', ')
}

function trustScoreForStatus(status: string) {
  if (status === 'ACTIVE') return 75
  if (status === 'VERIFIED') return 65
  if (status === 'UNDER_REVIEW') return 50
  if (status === 'RESTRICTED') return 35
  if (status === 'SUSPENDED') return 20
  if (status === 'REMOVED') return 0
  return 45
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.metricValue}>{String(value)}</p>
    </article>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.miniStat}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.miniValue}>{value}</p>
    </article>
  )
}
function ExecutiveCard({
  title,
  value,
  body,
}: {
  title: string
  value: string
  body: string
}) {
  return (
    <article style={styles.panelCard}>
      <p style={styles.sectionKicker}>{title}</p>
      <h3 style={styles.cardValue}>{value}</h3>
      <p style={styles.panelBody}>{body}</p>
    </article>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={styles.panel}>
      <p style={styles.sectionKicker}>{title}</p>
      <div style={styles.infoList}>{children}</div>
    </section>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <strong style={styles.infoValue}>{value}</strong>
    </div>
  )
}

function statusBadge(status: string): CSSProperties {
  const base: CSSProperties = {
    padding: '8px 12px',
    borderRadius: '999px',
    fontSize: 12,
    fontWeight: 950,
    letterSpacing: '0.08em',
    border: '1px solid rgba(201,162,39,0.28)',
    textTransform: 'uppercase',
    background: 'rgba(201,162,39,0.12)',
    color: '#D7B84C',
  }

  if (status === 'ACTIVE') {
    return {
      ...base,
      background: 'rgba(255,255,255,0.12)',
      color: '#FFFFFF',
    }
  }

  if (status === 'RESTRICTED' || status === 'SUSPENDED') {
    return {
      ...base,
      background: 'rgba(201,162,39,0.18)',
      color: '#F4D36A',
    }
  }

  if (status === 'REMOVED') {
    return {
      ...base,
      background: 'rgba(255,255,255,0.08)',
      color: '#AEB6C2',
      border: '1px solid rgba(255,255,255,0.18)',
    }
  }

  return base
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at top left, rgba(201, 162, 39, 0.14), transparent 34%), linear-gradient(135deg, #050505 0%, #0B0B0B 45%, #111111 100%)',
    color: '#FFFFFF',
    padding: '40px 24px 72px',
  },
  container: {
    width: 'min(1440px, 100%)',
    margin: '0 auto',
    display: 'grid',
    gap: 24,
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.45fr) minmax(320px, 0.75fr)',
    gap: 24,
    padding: 32,
    border: '1px solid rgba(201, 162, 39, 0.34)',
    borderRadius: 28,
    background:
      'linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))',
    boxShadow: '0 28px 80px rgba(0,0,0,0.38)',
  },
  kicker: {
    margin: 0,
    color: '#C9A227',
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
  },
  title: {
    margin: '14px 0 0',
    fontSize: 'clamp(2.3rem, 5vw, 5rem)',
    lineHeight: 0.95,
    letterSpacing: '-0.07em',
    fontWeight: 950,
  },
  subtitle: {
    maxWidth: 880,
    margin: '18px 0 0',
    color: '#C8CDD4',
    fontSize: 17,
    lineHeight: 1.8,
  },
  statusBox: {
    border: '1px solid rgba(201, 162, 39, 0.5)',
    borderRadius: 24,
    padding: 24,
    background:
      'linear-gradient(180deg, rgba(201,162,39,0.18), rgba(0,0,0,0.38))',
  },
  statusLabel: {
    margin: 0,
    color: '#D7B84C',
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: '0.2em',
  },
  statusValue: {
    margin: '16px 0 0',
    fontSize: 30,
    fontWeight: 950,
    letterSpacing: '-0.04em',
    lineHeight: 1.05,
  },
  statusMeaning: {
    margin: '12px 0 0',
    color: '#ECE7D7',
    fontSize: 14,
    lineHeight: 1.7,
  },
  message: {
    padding: '14px 18px',
    borderRadius: 16,
    color: '#D7B84C',
    background: 'rgba(201,162,39,0.1)',
    border: '1px solid rgba(201,162,39,0.22)',
    fontWeight: 800,
  },
  commandDeck: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 0.8fr',
    gap: 24,
  },
  primaryCard: {
    padding: 30,
    borderRadius: 28,
    background: '#FFFFFF',
    color: '#0B0B0B',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  consequenceCard: {
    padding: 30,
    borderRadius: 28,
    background: 'rgba(0,0,0,0.38)',
    border: '1px solid rgba(201,162,39,0.28)',
  },
  sectionKicker: {
    margin: 0,
    color: '#C9A227',
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
  commandTitle: {
    margin: '14px 0',
    fontSize: 'clamp(1.8rem, 3vw, 3.2rem)',
    lineHeight: 1.05,
    letterSpacing: '-0.05em',
    fontWeight: 950,
  },
  primaryText: {
    margin: 0,
    color: '#4A4A4A',
    lineHeight: 1.7,
    fontSize: 14,
  },
  consequenceTitle: {
    margin: '14px 0',
    fontSize: 28,
    lineHeight: 1.1,
    letterSpacing: '-0.04em',
  },
  bodyText: {
    margin: '8px 0 0',
    color: '#AEB6C2',
    lineHeight: 1.7,
    fontSize: 14,
  },
  commandMetaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
    marginTop: 24,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    gap: 14,
  },
  metricCard: {
    padding: 18,
    borderRadius: 20,
    background: 'rgba(255,255,255,0.055)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  metricLabel: {
    margin: 0,
    color: '#858D98',
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  metricValue: {
    margin: '10px 0 0',
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 950,
    lineHeight: 1.15,
    overflowWrap: 'anywhere',
  },
  miniStat: {
    padding: 14,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.055)',
    border: '1px solid rgba(255,255,255,0.09)',
  },
  miniValue: {
    margin: '8px 0 0',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 850,
    lineHeight: 1.45,
    overflowWrap: 'anywhere',
  },
  gridFour: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 16,
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 16,
  },
  panel: {
    padding: 28,
    borderRadius: 28,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  panelCard: {
    padding: 22,
    borderRadius: 22,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.09)',
    minHeight: 150,
  },
  panelTitle: {
    margin: '12px 0 0',
    fontSize: 26,
    lineHeight: 1.15,
    letterSpacing: '-0.045em',
  },
  cardValue: {
    margin: '12px 0 0',
    color: '#FFFFFF',
    fontSize: 19,
    lineHeight: 1.25,
    overflowWrap: 'anywhere',
  },
  panelBody: {
    marginTop: 10,
    color: '#AEB6C2',
    fontSize: 14,
    lineHeight: 1.65,
  },
  memoryPanel: {
    padding: 28,
    borderRadius: 28,
    background:
      'linear-gradient(135deg, rgba(201,162,39,0.13), rgba(255,255,255,0.035))',
    border: '1px solid rgba(201,162,39,0.32)',
  },
  memoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
    marginTop: 20,
  },
  infoList: {
    display: 'grid',
    gap: 10,
    marginTop: 18,
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: '170px minmax(0, 1fr)',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    background: 'rgba(0,0,0,0.22)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  infoLabel: {
    color: '#858D98',
    fontWeight: 900,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  infoValue: {
    color: '#FFFFFF',
    lineHeight: 1.5,
    overflowWrap: 'anywhere',
  },
  doctrineGrid: {
    display: 'grid',
    gap: 14,
    marginTop: 18,
  },
  doctrineItem: {
    padding: 18,
    borderRadius: 18,
    background: 'rgba(0,0,0,0.22)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  checkList: {
    display: 'grid',
    gap: 10,
    marginTop: 18,
  },
  checkItem: {
    padding: 14,
    borderRadius: 14,
    background: 'rgba(0,0,0,0.22)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#DCE1E8',
    fontWeight: 800,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start',
  },
  primaryButton: {
    border: 'none',
    borderRadius: 999,
    padding: '14px 22px',
    background: '#C9A227',
    color: '#090909',
    fontWeight: 950,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  emptyBox: {
    margin: 0,
    color: '#DCE1E8',
    padding: 18,
    borderRadius: 18,
    border: '1px dashed rgba(255,255,255,0.18)',
    background: 'rgba(0,0,0,0.22)',
  },
  profileList: {
    display: 'grid',
    gap: 18,
    marginTop: 20,
  },
  profileCard: {
    padding: 22,
    borderRadius: 22,
    background: 'rgba(0,0,0,0.24)',
    border: '1px solid rgba(255,255,255,0.09)',
  },
  profileTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 14,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  profileName: {
    margin: '8px 0 0',
    fontSize: 24,
    lineHeight: 1.15,
    color: '#FFFFFF',
  },
  email: {
    color: '#D7B84C',
    marginTop: 6,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: 12,
    marginTop: 16,
  },
  details: {
    marginTop: 16,
    background: 'rgba(0,0,0,0.28)',
    borderRadius: 14,
    padding: 14,
    border: '1px solid rgba(255,255,255,0.08)',
  },
  summary: {
    cursor: 'pointer',
    fontWeight: 950,
    color: '#D7B84C',
  },
  bio: {
    whiteSpace: 'pre-wrap',
    color: '#DCE1E8',
    lineHeight: 1.5,
    marginTop: 12,
    fontFamily: 'inherit',
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    padding: 12,
    borderRadius: 12,
    border: '1px solid rgba(201,162,39,0.24)',
    background: 'rgba(201,162,39,0.1)',
    color: '#FFFFFF',
    fontWeight: 950,
    cursor: 'pointer',
  },
  orderPanel: {
    padding: 28,
    borderRadius: 28,
    background: '#FFFFFF',
    color: '#0B0B0B',
  },
  summaryBox: {
    marginTop: 20,
    padding: 22,
    borderRadius: 20,
    background: '#0A0A0A',
    color: '#F8F6F1',
    whiteSpace: 'pre-wrap',
    fontSize: 13,
    lineHeight: 1.7,
    overflowX: 'auto',
  },
  doctrineCard: {
    display: 'grid',
    gap: 10,
    padding: 24,
    borderRadius: 24,
    background: '#050505',
    border: '1px solid rgba(201,162,39,0.42)',
    color: '#FFFFFF',
    lineHeight: 1.7,
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.78)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 620,
    background: '#050505',
    borderRadius: 24,
    padding: 26,
    border: '1px solid rgba(201,162,39,0.36)',
    boxShadow: '0 28px 90px rgba(0,0,0,0.62)',
  },
  modalTitle: {
    fontSize: 30,
    margin: '10px 0',
    letterSpacing: '-0.04em',
  },
  modalText: {
    color: '#C8CDD4',
    marginBottom: 20,
    lineHeight: 1.5,
  },
  label: {
    display: 'block',
    marginBottom: 8,
    marginTop: 16,
    fontWeight: 900,
    color: '#DCE1E8',
  },
  select: {
    width: '100%',
    padding: 14,
    borderRadius: 14,
    background: '#0D0D0D',
    color: '#FFFFFF',
    border: '1px solid rgba(201,162,39,0.24)',
  },
  textarea: {
    width: '100%',
    minHeight: 120,
    padding: 14,
    borderRadius: 14,
    background: '#0D0D0D',
    color: '#FFFFFF',
    border: '1px solid rgba(201,162,39,0.24)',
    resize: 'vertical',
  },
  modalActions: {
    display: 'flex',
    gap: 12,
    marginTop: 24,
    flexWrap: 'wrap',
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    background: 'rgba(255,255,255,0.08)',
    color: '#FFFFFF',
    border: '1px solid rgba(255,255,255,0.12)',
    fontWeight: 900,
    cursor: 'pointer',
  },
  confirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    background: '#C9A227',
    color: '#090909',
    border: 'none',
    fontWeight: 950,
    cursor: 'pointer',
  },
}