'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

import { supabase } from '../../lib/supabase'

type TrendBufferRow = {
  id: string
  unit: string
  window_start: string
  window_end: string
  assignment_load_skew: number
  operational_diagnostic_finding_counts: Record<string, number> | null
  structural_driver_counts: Record<string, number> | null
  workload_composition_counts: Record<string, number> | null
  derived_strain_signal_counts: Record<string, number> | null
  reserve_capacity_status_counts: Record<string, number> | null
  above_baseline_assignment_count: number | null
  above_baseline_assignment_percentage: number | null
  maximum_assignment_overload: number | null
  localized_overload_assignment_count: number | null
  total_stability_events: number
  high_intensity_event_count: number
  late_or_last_minute_event_count: number
  buffer_use_profile: string
  repeated_buffer_depletion_flag: boolean
  dominant_stability_forces: string[] | string
  trend_status: string
  leadership_action_cue: string
  stability_score: number | null
  predictability_insight: string | null
  most_affected_role_pool: string | null
  most_affected_shift: string | null
  fragility_level: string | null
  cost_pressure_signal: string | null
  leadership_interpretation: string | null
  immediate_action_1: string | null
  immediate_action_2: string | null
  short_term_action_1: string | null
  short_term_action_2: string | null
  risk_outlook: string | null
  last_action_taken: string | null
  observed_outcome: string | null
  created_at: string
  updated_at: string
}

type LayerTone = 'leadership' | 'evidence' | 'reference'

const MISSING = 'Not persisted in the current Structural Stability Assessment.'

const ssiFlow = [
  { label: 'Operational Diagnostic Assignment Set', href: '/ssi/assignments', note: 'Shift-start structural evidence', active: false },
  { label: 'Operational Stability Events', href: '/ssi/events', note: 'Operational disruption evidence', active: false },
  { label: 'Structural Stability Assessment', href: '/ssi/dashboard', note: 'Persisted structural findings', active: false },
  { label: 'Executive Structural Interpretation', href: '/ssi', note: 'Executive intelligence', active: true },
  { label: 'Weekly Stability Brief', href: '/ssi/weekly-brief', note: 'Longitudinal executive summary', active: false },
]

const allowedRoles = ['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']
const allowedStatuses = ['ACTIVE']

const colors = {
  page: '#050505',
  shell: '#080807',
  panel: '#0b0b0a',
  section: '#0d0d0c',
  slate: '#11161d',
  slateSoft: 'rgba(17,24,39,0.58)',
  gold: '#d6b25e',
  goldMuted: '#9f8142',
  text: '#e8e4dc',
  muted: '#b9b5ad',
  quiet: '#938d84',
  line: 'rgba(214,178,94,0.20)',
  lineStrong: 'rgba(214,178,94,0.42)',
  lineSoft: 'rgba(214,178,94,0.12)',
}

function display(value: unknown) {
  if (value === null || value === undefined || value === '') return MISSING
  if (typeof value === 'boolean') return value ? 'YES' : 'NO'
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : MISSING
  return String(value)
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? display(value) : date.toLocaleString()
}

function sentenceCase(value: unknown) {
  const text = display(value).trim()

  if (!text || text === MISSING) {
    return text
  }

  return text.charAt(0).toUpperCase() + text.slice(1)
}

function normalizeHealthcareRoles(value: string) {
  return value
    .replace(/\bCna\b/g, 'CNA')
    .replace(/\bRn\b/g, 'RN')
    .replace(/\bLpn\b/g, 'LPN')
}

function humanize(value: unknown) {
  if (!value) return MISSING

  return normalizeHealthcareRoles(
    String(value)
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (character) => character.toUpperCase()),
  )
}

function numberWord(value: number) {
  const words: Record<number, string> = {
    0: 'no',
    1: 'one',
    2: 'two',
    3: 'three',
    4: 'four',
    5: 'five',
    6: 'six',
    7: 'seven',
    8: 'eight',
    9: 'nine',
    10: 'ten',
  }

  return words[value] ?? String(value)
}

function executiveReservePhrase(value: unknown) {
  const normalized = String(value ?? '').trim().toLowerCase()

  const phrases: Record<string, string> = {
    reserve_available_but_consumed:
      'reserve capacity was available but fully consumed',
    reserve_exhausted:
      'reserve capacity was exhausted',
    baseline_exceeded:
      'workload exceeded baseline operating capacity',
    reserve_available:
      'reserve capacity remained available',
    reserve_preserved:
      'reserve capacity remained preserved',
    no_reserve_required:
      'reserve capacity was not required',
    no_reserve_available:
      'no reserve capacity was available',
    none:
      'no reserve-capacity concern was identified',
  }

  if (!normalized) {
    return MISSING
  }

  return (
    phrases[normalized] ??
    normalizeHealthcareRoles(
      normalized
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase()),
    ).toLowerCase()
  )
}

function executiveReserveStatement(value: unknown) {
  const phrase = executiveReservePhrase(value)

  if (!phrase || phrase === MISSING) {
    return MISSING
  }

  return `${phrase.charAt(0).toUpperCase()}${phrase.slice(1)}.`
}

function executiveCountPhrase(
  count: number,
  singular: string,
  plural: string,
) {
  return `${numberWord(count)} ${count === 1 ? singular : plural}`
}

function polishPersistedNarrative(value: unknown) {
  const source = sentenceCase(value)

  if (!source || source === MISSING) {
    return source
  }

  return source
    .replace(
      /Leadership should treat this window as an early warning period\. The system is still functioning, but recurring pressure may reduce reliability if not reviewed\./gi,
      'Leadership should regard this reporting window as an early indication of emerging structural pressure. Current operations remain functional; however, recurring patterns should be addressed before they become embedded in routine practice.',
    )
    .replace(
      /Leadership should treat this reporting window as an early warning period\. Operations remain functional; however, recurring structural pressure should be addressed before it becomes normalized and reduces workforce reliability\./gi,
      'Leadership should regard this reporting window as an early indication of emerging structural pressure. Current operations remain functional; however, recurring patterns should be addressed before they become embedded in routine practice.',
    )
    .replace(
      /\bRN showed hidden strain in (\d+) assignments?\./gi,
      (_, count: string) =>
        `Hidden structural strain was identified across ${executiveCountPhrase(
          Number(count),
          'RN assignment',
          'RN assignments',
        )}.`,
    )
    .replace(
      /\bLPN showed hidden strain in (\d+) assignments?\./gi,
      (_, count: string) =>
        `Hidden structural strain was identified across ${executiveCountPhrase(
          Number(count),
          'LPN assignment',
          'LPN assignments',
        )}.`,
    )
    .replace(
      /\bCNA showed hidden strain in (\d+) assignments?\./gi,
      (_, count: string) =>
        `Hidden structural strain was identified across ${executiveCountPhrase(
          Number(count),
          'CNA assignment',
          'CNA assignments',
        )}.`,
    )
    .replace(
      /\b(RN|LPN|CNA) started with severe strain (\d+) times?\./gi,
      (_, role: string, count: string) =>
        `${numberWord(Number(count)).replace(/^./, (character) =>
          character.toUpperCase(),
        )} ${role.toUpperCase()} assignment${
          Number(count) === 1 ? '' : 's'
        } began under severe structural strain.`,
    )
    .replace(
      /\b(\d+) (RN|LPN|CNA) assignments? exceeded baseline design\./gi,
      (_, count: string, role: string) =>
        `${numberWord(Number(count)).replace(/^./, (character) =>
          character.toUpperCase(),
        )} ${role.toUpperCase()} assignment${
          Number(count) === 1 ? '' : 's'
        } exceeded ${
          Number(count) === 1 ? 'its' : 'their'
        } intended baseline design.`,
    )
    .replace(
      /\b(\d+) localized overload assignments? affected (RN|LPN|CNA)\./gi,
      (_, count: string, role: string) =>
        `Localized workload concentration was identified across ${executiveCountPhrase(
          Number(count),
          `${role.toUpperCase()} assignment`,
          `${role.toUpperCase()} assignments`,
        )}.`,
    )
    .replace(
      /\b(RN|LPN|CNA) reserve capacity was reserve_available_but_consumed\./gi,
      (_, role: string) =>
        `${role.toUpperCase()} reserve capacity was available but fully consumed.`,
    )
    .replace(
      /\b(RN|LPN|CNA) reserve capacity was reserve_exhausted\./gi,
      (_, role: string) =>
        `${role.toUpperCase()} reserve capacity was exhausted.`,
    )
    .replace(
      /\b(RN|LPN|CNA) reserve capacity was baseline_exceeded\./gi,
      (_, role: string) =>
        `${role.toUpperCase()} workload exceeded baseline operating capacity.`,
    )
    .replace(/\breserve_available_but_consumed\b/gi, 'available but fully consumed')
    .replace(/\breserve_exhausted\b/gi, 'exhausted')
    .replace(/\bbaseline_exceeded\b/gi, 'baseline operating capacity was exceeded')
    .replace(/\breserve_available\b/gi, 'available')
    .replace(/\bno_reserve_required\b/gi, 'not required')
    .replace(/Structural pressure was driven primarily by/gi, 'Structural pressure originated primarily from')
    .replace(/This pattern should be interpreted/gi, 'This pattern indicates')
}

function primaryDominantForce(value: string[] | string) {
  if (Array.isArray(value)) return value.length > 0 ? humanize(value[0]) : MISSING
  return humanize(value)
}

function dominantPersistedKey(
  counts: Record<string, number> | null | undefined,
) {
  if (!counts) return null

  const dominantEntry = Object.entries(counts)
    .filter(([, count]) => Number(count) > 0)
    .sort(
      (first, second) =>
        Number(second[1]) - Number(first[1]) ||
        first[0].localeCompare(second[0]),
    )[0]

  return dominantEntry?.[0] ?? null
}

function dominantPersistedCount(counts: Record<string, number> | null | undefined) {
  if (!counts) return MISSING

  const dominantEntry = Object.entries(counts)
    .filter(([, count]) => Number(count) > 0)
    .sort(
      (first, second) =>
        Number(second[1]) - Number(first[1]) ||
        first[0].localeCompare(second[0]),
    )[0]

  return dominantEntry ? humanize(dominantEntry[0]) : MISSING
}

function hasValue(value: unknown) {
  if (value === null || value === undefined) return false
  if (Array.isArray(value)) return value.length > 0
  return String(value).trim().length > 0
}

function countStatement(count: number | null, singular: string, plural: string) {
  if (count === null || count === undefined) return MISSING
  return `${count} ${count === 1 ? singular : plural}`
}

function indefiniteArticle(value: unknown) {
  const word = String(value ?? '').trim().toLowerCase()
  return /^[aeiou]/.test(word) ? 'an' : 'a'
}

function narrativeRoleScope(value: unknown) {
  return humanize(value)
    .replace(/Role Pools/g, 'role pools')
    .replace(/\bAnd\b/g, 'and')
}

function hasNarrativeValue(value: unknown) {
  return hasValue(value) && display(value) !== MISSING
}


function reportingWindowComplete(row: TrendBufferRow) {
  return Boolean(
    hasValue(row.unit) &&
      hasValue(row.window_start) &&
      hasValue(row.window_end) &&
      hasValue(row.trend_status),
  )
}

function persistedAssessmentEvidenceAvailable(row: TrendBufferRow) {
  return Boolean(
    row.operational_diagnostic_finding_counts &&
      row.structural_driver_counts &&
      row.workload_composition_counts &&
      row.derived_strain_signal_counts &&
      row.reserve_capacity_status_counts,
  )
}

function assessmentConfidence(row: TrendBufferRow) {
  const checks = [
    reportingWindowComplete(row),
    persistedAssessmentEvidenceAvailable(row),
    hasValue(row.leadership_interpretation),
    hasValue(row.predictability_insight),
    hasValue(row.most_affected_role_pool),
    hasValue(row.most_affected_shift),
  ]

  const completed = checks.filter(Boolean).length

  if (completed >= 5) return 'High'
  if (completed >= 3) return 'Moderate'
  return 'Limited'
}

function buildExecutiveSummary(row: TrendBufferRow) {
  const status = humanize(row.trend_status)
  const driver = dominantPersistedCount(row.structural_driver_counts)
  const roleScope = hasValue(row.most_affected_role_pool)
    ? narrativeRoleScope(row.most_affected_role_pool)
    : 'the affected workforce'
  const late = row.late_or_last_minute_event_count ?? 0
  const reliability =
    late > 0
      ? 'Workforce reliability was vulnerable to late or last-minute disruption.'
      : 'Workforce reliability remained stable, although continued stability depended on active leadership attention rather than surplus operational capacity.'

  const opening = `The reporting window indicates ${indefiniteArticle(status)} ${status} structural condition.`

  const driverStatement = hasNarrativeValue(driver)
    ? `The condition originated primarily from ${driver.toLowerCase()}.`
    : 'A principal structural driver was not identified for this reporting window.'

  return `${opening} ${driverStatement} Multiple total-care recipient assignments drove demand across ${roleScope}. ${reliability} Early action is recommended before recurring pressure becomes normalized.`
}

function buildExecutiveObservation(row: TrendBufferRow) {
  const status = humanize(row.trend_status)
  const roleScope = hasValue(row.most_affected_role_pool)
    ? narrativeRoleScope(row.most_affected_role_pool)
    : 'the affected workforce'
  const fragility = humanize(row.fragility_level)
  const predictability = polishPersistedNarrative(
    row.predictability_insight,
  )

  return `SSI observed ${indefiniteArticle(status)} ${status.toLowerCase()} structural condition across ${roleScope}, with fragility assessed as ${fragility.toLowerCase()}. ${predictability}`
}

function buildStructuralDiagnosis(row: TrendBufferRow) {
  if (hasValue(row.leadership_interpretation)) {
    return polishPersistedNarrative(row.leadership_interpretation)
  }

  const status = humanize(row.trend_status)
  const above = row.above_baseline_assignment_count ?? 0
  const localized = row.localized_overload_assignment_count ?? 0
  const reserveKey = dominantPersistedKey(
    row.reserve_capacity_status_counts,
  )
  const reserveStatement = executiveReserveStatement(reserveKey)

  return `The current structural assessment is ${status.toLowerCase()}. ${numberWord(
    above,
  ).replace(/^./, (character) => character.toUpperCase())} assignment${
    above === 1 ? '' : 's'
  } exceeded ${
    above === 1 ? 'its' : 'their'
  } intended baseline design, including ${numberWord(
    localized,
  )} localized overload assignment${
    localized === 1 ? '' : 's'
  }. ${reserveStatement}`
}

function buildStructuralDrivers(row: TrendBufferRow) {
  const driver = dominantPersistedCount(row.structural_driver_counts)
  const workload = dominantPersistedCount(
    row.workload_composition_counts,
  )
  const signal = dominantPersistedCount(
    row.derived_strain_signal_counts,
  )
  const role = hasValue(row.most_affected_role_pool)
    ? narrativeRoleScope(row.most_affected_role_pool)
    : 'the affected workforce'
  const shift = hasValue(row.most_affected_shift)
    ? humanize(row.most_affected_shift)
    : 'the assessed shift'

  const statements: string[] = []

  if (hasNarrativeValue(driver)) {
    statements.push(
      `Structural pressure originated primarily from ${driver.toLowerCase()}.`,
    )
  } else {
    statements.push(
      'A principal structural driver was not identified for this reporting window.',
    )
  }

  if (hasNarrativeValue(workload)) {
    statements.push(
      `${workload} shaped workload demand.`,
    )
  } else {
    statements.push(
      'A principal workload-composition pattern was not identified for this reporting window.',
    )
  }

  if (hasNarrativeValue(signal)) {
    statements.push(
      `The principal structural strain indicator was ${signal.toLowerCase()}.`,
    )
  } else {
    statements.push(
      'A principal structural strain indicator was not identified for this reporting window.',
    )
  }

  statements.push(
    `Material pressure was concentrated across ${role} during ${shift}.`,
  )

  return statements.join(' ')
}

function buildWorkforceReliability(row: TrendBufferRow) {
  const late = row.late_or_last_minute_event_count ?? 0
  const role = hasValue(row.most_affected_role_pool)
    ? humanize(row.most_affected_role_pool)
    : 'the materially affected role pools'
  const reserveKey = dominantPersistedKey(
    row.reserve_capacity_status_counts,
  )
  const reservePhrase = executiveReservePhrase(reserveKey)

  if (late > 0) {
    return `Workforce reliability was vulnerable during this reporting window. ${numberWord(
      late,
    ).replace(/^./, (character) => character.toUpperCase())} late or last-minute event${
      late === 1 ? ' was' : 's were'
    } observed, increasing dependence on reactive operational adjustment. Structural pressure was concentrated across ${role}, while ${reservePhrase}.`
  }

  return `No late or last-minute workforce disruption was observed during this reporting window. However, structural pressure remained present across ${role}, and ${reservePhrase}. Workforce reliability remained stable, but the assignment evidence indicates that continued stability depended on active leadership attention rather than excess operational capacity.`
}

function buildEventInterpretation(row: TrendBufferRow) {
  const total = row.total_stability_events ?? 0
  const high = row.high_intensity_event_count ?? 0
  const late = row.late_or_last_minute_event_count ?? 0
  const force = primaryDominantForce(row.dominant_stability_forces)

  if (total === 0) {
    return 'No active Stability Events were observed during this assessment window. This confirms the absence of recorded operational disruptions, but it does not establish structural stability on its own. Assignment design, reserve capacity, and workforce reliability findings remain essential to the interpretation.'
  }

  return `${numberWord(total).replace(/^./, (character) =>
    character.toUpperCase(),
  )} Stability Event${
    total === 1 ? ' was' : 's were'
  } observed, including ${numberWord(high)} high-intensity event${
    high === 1 ? '' : 's'
  } and ${numberWord(late)} late or last-minute event${
    late === 1 ? '' : 's'
  }. ${force} was the principal system force. This pattern indicates a broader structural condition when considered together with assignment and workforce evidence, rather than an isolated event count.`
}

function buildCostInterpretation(row: TrendBufferRow) {
  const repeated = row.repeated_buffer_depletion_flag
    ? 'Repeated buffer depletion was present.'
    : 'Repeated buffer depletion was not present.'
  const reserveKey = dominantPersistedKey(
    row.reserve_capacity_status_counts,
  )
  const reserveStatement = executiveReserveStatement(reserveKey)

  return `The persisted buffer-use profile was ${humanize(
    row.buffer_use_profile,
  ).toLowerCase()}, while cost pressure remained ${humanize(
    row.cost_pressure_signal,
  ).toLowerCase()}. ${repeated} ${reserveStatement} Together, these findings show whether continuity was supported by genuine structural resilience or preserved through increasing operational adaptation.`
}

function buildOutlook(row: TrendBufferRow) {
  if (hasValue(row.risk_outlook)) {
    return polishPersistedNarrative(row.risk_outlook)
  }

  if (hasValue(row.predictability_insight)) {
    return polishPersistedNarrative(row.predictability_insight)
  }

  return 'The current evidence is not yet sufficient to establish a reliable longitudinal trajectory. Additional validated assessments are required before SSI can determine whether the condition is improving, recurring, or deteriorating.'
}

function buildHistoryInterpretation(records: TrendBufferRow[]) {
  if (records.length < 2) {
    return 'The available assessment history is not yet sufficient to establish a reliable longitudinal trajectory.'
  }

  const statuses = records.map((record) => String(record.trend_status).toUpperCase())
  const latestStatus = statuses[0]
  const sameAsLatest = statuses.filter((status) => status === latestStatus).length

  if (sameAsLatest >= 2) {
    return `Recent validated assessments show repeated ${humanize(
      latestStatus,
    ).toLowerCase()} conditions. The current finding therefore indicates a recurring pattern rather than an isolated result.`
  }

  return 'Recent validated assessments show variation across reporting windows. More evidence is required before SSI can establish a stable direction of travel.'
}

function Layer({ title, tone, children }: { title: string; tone: LayerTone; children: ReactNode }) {
  const toneStyle: CSSProperties =
    tone === 'leadership'
      ? {
          borderColor: colors.lineStrong,
          background: 'linear-gradient(180deg, rgba(214,178,94,0.045), rgba(255,255,255,0.01))',
        }
      : tone === 'evidence'
        ? { borderColor: colors.line }
        : {
            borderColor: colors.lineSoft,
            background: 'rgba(255,255,255,0.008)',
          }

  return (
    <div style={{ ...styles.layer, ...toneStyle }}>
      <div style={styles.layerHeader}>
        <h2 style={styles.layerTitle}>{title}</h2>
        <span style={styles.layerRule} />
      </div>
      {children}
    </div>
  )
}

function Section({
  title,
  children,
  emphasis = false,
  quiet = false,
  diagnosis = false,
}: {
  title: string
  children: ReactNode
  emphasis?: boolean
  quiet?: boolean
  diagnosis?: boolean
}) {
  return (
    <section
      style={{
        ...styles.section,
        borderColor: diagnosis
          ? 'rgba(214,178,94,0.52)'
          : emphasis
            ? colors.lineStrong
            : quiet
              ? colors.lineSoft
              : colors.line,
        boxShadow: diagnosis
          ? `inset 4px 0 0 ${colors.gold}, 0 10px 34px rgba(0,0,0,0.14)`
          : emphasis
            ? `inset 3px 0 0 ${colors.gold}`
            : undefined,
        background: diagnosis
          ? 'linear-gradient(180deg, rgba(214,178,94,0.055), rgba(255,255,255,0.010))'
          : quiet
            ? 'rgba(11,11,10,0.82)'
            : colors.panel,
      }}
    >
      <header
        style={{
          ...styles.sectionHeader,
          minHeight: quiet ? 32 : styles.sectionHeader.minHeight,
          background: quiet ? '#0a0a09' : colors.section,
        }}
      >
        <span
          style={{
            ...styles.sectionLine,
            background: quiet ? colors.goldMuted : colors.gold,
          }}
        />
        <h2 style={{ ...styles.sectionTitle, color: quiet ? colors.goldMuted : colors.gold }}>
          {title}
        </h2>
      </header>
      <div
        style={{
          ...styles.sectionContent,
          ...(diagnosis ? styles.diagnosisContent : {}),
        }}
      >
        {children}
      </div>
    </section>
  )
}

function Tile({
  label,
  value,
  strong = false,
  quiet = false,
}: {
  label: string
  value: unknown
  strong?: boolean
  quiet?: boolean
}) {
  return (
    <div style={{ ...styles.dataTile, borderColor: quiet ? colors.lineSoft : colors.line }}>
      <div style={{ ...styles.dataLabel, background: quiet ? colors.slateSoft : colors.slate }}>
        {label}
      </div>
      <div
        style={{
          ...styles.dataValue,
          color: quiet ? colors.quiet : colors.text,
          ...(strong ? styles.dataValueStrong : {}),
        }}
      >
        {display(value)}
      </div>
    </div>
  )
}

function Interpretation({
  conclusion,
}: {
  conclusion: ReactNode
  evidence?: ReactNode[]
}) {
  return (
    <div style={styles.interpretation}>
      <div style={styles.interpretationText}>{conclusion}</div>
    </div>
  )
}

function EvidenceGrid({
  metrics,
}: {
  metrics: Array<{ label: string; value: unknown }>
}) {
  return (
    <div style={styles.verificationPanel}>
      <div style={styles.verificationTitle}>Persisted Verification Evidence</div>
      <div style={styles.verificationGrid}>
        {metrics.map((metric) => (
          <div key={metric.label} style={styles.verificationMetric}>
            <span style={styles.verificationMetricLabel}>{metric.label}</span>
            <strong style={styles.verificationMetricValue}>
              {display(metric.value)}
            </strong>
          </div>
        ))}
      </div>
    </div>
  )
}

function MissingBand({ children = MISSING }: { children?: ReactNode }) {
  return <div style={styles.missingBand}>{children}</div>
}

export default function SSIExecutiveDashboardPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [records, setRecords] = useState<TrendBufferRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function verifyAccess() {
      setCheckingAccess(true)

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError || !session?.user) {
          router.replace('/ssi/login')
          return
        }

        if (!session.user.email_confirmed_at) {
          await supabase.auth.signOut()
          router.replace('/ssi/login')
          return
        }

        const { data: roleRecord, error: roleError } = await supabase
          .from('user_roles')
          .select('role,status')
          .eq('user_id', session.user.id)
          .single()

        if (
          roleError ||
          !roleRecord ||
          !allowedRoles.includes(roleRecord.role) ||
          !allowedStatuses.includes(roleRecord.status)
        ) {
          await supabase.auth.signOut()
          router.replace('/ssi/login')
          return
        }

        setAuthorized(true)
      } catch {
        router.replace('/ssi/login')
      } finally {
        setCheckingAccess(false)
      }
    }

    verifyAccess()
  }, [router])

  useEffect(() => {
    async function loadDashboard() {
      if (!authorized) return

      setLoading(true)
      setError(null)

      try {
        const { data, error: loadError } = await supabase
          .from('ssi_trend_buffer')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(4)

        if (loadError) {
          setError('SSI could not load the persisted Structural Stability Assessment.')
          setRecords([])
        } else {
          setRecords((data ?? []) as unknown as TrendBufferRow[])
        }
      } catch {
        setError('SSI could not load the persisted Structural Stability Assessment.')
        setRecords([])
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [authorized])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/ssi/login')
  }

  const latest = records[0] ?? null
  const historyRecords = useMemo(() => [...records].reverse(), [records])

  if (checkingAccess) {
    return (
      <main style={styles.page}>
        <div style={styles.shell}>
          <Section title="SSI Secure Access">
            <MissingBand>Verifying authorized SSI access...</MissingBand>
          </Section>
        </div>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.hero}>
          <div>
            <div style={styles.eyebrow}>TSINAXA SSI — Structural Stability Intelligence System</div>
            <h1 style={styles.title}>Executive Structural Interpretation</h1>
            <p style={styles.subtitle}>
              Leadership interpretation of validated Structural Stability Assessment findings,
              supported by persisted structural evidence and strategic reference intelligence.
            </p>
          </div>

          <div style={styles.updated}>
            <span style={styles.updatedLabel}>Latest persisted update</span>
            <strong style={styles.updatedValue}>
              {latest ? formatDate(latest.updated_at) : '—'}
            </strong>
            <button type="button" style={styles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <nav aria-label="TSINAXA SSI flow navigation" style={styles.flowNav}>
          <div style={styles.flowNavHeader}>
            <span style={styles.flowNavTitle}>SSI Flow</span>
            <span style={styles.flowNavRule} />
            <span style={styles.flowNavCaption}>
              Operational Diagnostic Assignment Set → Operational Stability Events → Structural Stability Assessment → Executive Structural Interpretation → Weekly Stability Brief
            </span>
          </div>

          <div style={styles.flowSteps}>
            {ssiFlow.map((item, index) => (
              <div key={item.href} style={styles.flowStepWrap}>
                <a
                  href={item.href}
                  style={{
                    ...styles.flowStep,
                    ...(item.active ? styles.flowStepActive : {}),
                  }}
                >
                  <span style={styles.flowStepIndex}>{index + 1}</span>
                  <span style={styles.flowStepText}>
                    <strong>{item.label}</strong>
                    <small>{item.note}</small>
                  </span>
                </a>
                {index < ssiFlow.length - 1 ? <span style={styles.flowArrow}>→</span> : null}
              </div>
            ))}
          </div>
        </nav>

        {loading ? (
          <Section title="Current Structural Stability Assessment">
            <MissingBand>Loading persisted Structural Stability Assessment...</MissingBand>
          </Section>
        ) : error ? (
          <Section title="Data Access Issue">
            <MissingBand>{error}</MissingBand>
          </Section>
        ) : !latest ? (
          <Section title="Executive Structural Interpretation">
            <MissingBand>No persisted Structural Stability Assessment was found.</MissingBand>
          </Section>
        ) : (
          <div style={styles.dashboard}>
            <Layer title="Executive Structural Interpretation" tone="leadership">
              <Section title="Assessment Identification">
                <div style={styles.compactGrid4}>
                  <Tile label="Unit" value={latest.unit} strong />
                  <Tile label="Window Start" value={latest.window_start} />
                  <Tile label="Window End" value={latest.window_end} />
                  <Tile label="Structural Status" value={humanize(latest.trend_status)} strong />
                </div>
              </Section>

              <Section title="Executive Summary" emphasis>
                <div style={styles.executiveSummaryCard}>
                  <div style={styles.executiveSummaryText}>
                    {buildExecutiveSummary(latest)}
                  </div>
                </div>
              </Section>

              <Section title="Assessment Confidence">
                <div style={styles.confidenceLayout}>
                  <div style={styles.confidencePrimary}>
                    <span style={styles.confidenceLabel}>
                      Evidence Completeness
                    </span>
                    <strong style={styles.confidenceValue}>
                      {assessmentConfidence(latest)}
                    </strong>
                    <span style={styles.confidenceNote}>
                      Confidence reflects the completeness of persisted
                      evidence, not confidence in the SSI methodology.
                    </span>
                  </div>

                  <div style={styles.confidenceEvidence}>
                    <div style={styles.confidenceEvidenceItem}>
                      <span>Reporting window</span>
                      <strong>
                        {reportingWindowComplete(latest)
                          ? 'Complete'
                          : 'Incomplete'}
                      </strong>
                    </div>
                    <div style={styles.confidenceEvidenceItem}>
                      <span>Persisted assignment evidence</span>
                      <strong>
                        {persistedAssessmentEvidenceAvailable(latest)
                          ? 'Available'
                          : 'Limited'}
                      </strong>
                    </div>
                    <div style={styles.confidenceEvidenceItem}>
                      <span>Stability Events</span>
                      <strong>{latest.total_stability_events}</strong>
                    </div>
                    <div style={styles.confidenceEvidenceItem}>
                      <span>Trend Buffer evidence</span>
                      <strong>Persisted</strong>
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="Structural Diagnosis" emphasis diagnosis>
                <Interpretation
                  conclusion={buildStructuralDiagnosis(latest)}
                  evidence={[
                    countStatement(latest.above_baseline_assignment_count, 'assignment exceeded baseline design.', 'assignments exceeded baseline design.'),
                    countStatement(latest.localized_overload_assignment_count, 'localized overload assignment was identified.', 'localized overload assignments were identified.'),
                    latest.maximum_assignment_overload === null ||
                    latest.maximum_assignment_overload === undefined
                      ? MISSING
                      : `The greatest observed overload was ${latest.maximum_assignment_overload} additional care recipient${latest.maximum_assignment_overload === 1 ? '' : 's'} above baseline.`,
                    `${executiveReserveStatement(dominantPersistedKey(latest.reserve_capacity_status_counts))}`,
                  ]}
                />
              </Section>

              <Section title="Structural Drivers">
                <Interpretation
                  conclusion={buildStructuralDrivers(latest)}
                  evidence={[
                    `Principal structural driver: ${dominantPersistedCount(latest.structural_driver_counts)}.`,
                    `Principal workload composition: ${dominantPersistedCount(latest.workload_composition_counts)}.`,
                    `Principal operational finding: ${dominantPersistedCount(latest.operational_diagnostic_finding_counts)}.`,
                    `Principal structural strain indicator: ${dominantPersistedCount(latest.derived_strain_signal_counts)}.`,
                  ]}
                />
              </Section>

              <Section title="Workforce Reliability Intelligence" emphasis>
                <Interpretation
                  conclusion={buildWorkforceReliability(latest)}
                  evidence={[
                    countStatement(latest.late_or_last_minute_event_count, 'late or last-minute event was recorded.', 'late or last-minute events were recorded.'),
                    `Materially affected role-pool scope: ${humanize(latest.most_affected_role_pool)}.`,
                    `Most affected shift: ${humanize(latest.most_affected_shift)}.`,
                    `Predictability insight: ${polishPersistedNarrative(latest.predictability_insight)}`,
                  ]}
                />
              </Section>

              <Section title="Stability Events Interpretation">
                <Interpretation
                  conclusion={buildEventInterpretation(latest)}
                  evidence={[
                    countStatement(latest.total_stability_events, 'Stability Event was recorded.', 'Stability Events were recorded.'),
                    countStatement(latest.high_intensity_event_count, 'high-intensity event was recorded.', 'high-intensity events were recorded.'),
                    `Dominant system force: ${primaryDominantForce(latest.dominant_stability_forces)}.`,
                  ]}
                />
              </Section>

              <Section title="Buffer and Cost Pressure Interpretation">
                <Interpretation
                  conclusion={buildCostInterpretation(latest)}
                  evidence={[
                    `Buffer-use profile: ${humanize(latest.buffer_use_profile)}.`,
                    `Repeated buffer depletion: ${latest.repeated_buffer_depletion_flag ? 'Present' : 'Not present'}.`,
                    `Cost-pressure signal: ${humanize(latest.cost_pressure_signal)}.`,
                    `Fragility level: ${humanize(latest.fragility_level)}.`,
                  ]}
                />
              </Section>

              <Section title="Organizational Outlook">
                <Interpretation
                  conclusion={buildOutlook(latest)}
                  evidence={[
                    `Persisted trend status: ${humanize(latest.trend_status)}.`,
                    `Predictability insight: ${polishPersistedNarrative(latest.predictability_insight)}`,
                    `Fragility level: ${humanize(latest.fragility_level)}.`,
                    `Cost-pressure signal: ${humanize(latest.cost_pressure_signal)}.`,
                  ]}
                />
              </Section>

              <Section title="Leadership Guidance" emphasis>
                <div style={styles.guidanceUnderstanding}>
                  <div style={styles.guidanceLabel}>
                    Executive Observation
                  </div>
                  <div style={styles.guidanceText}>
                    {buildExecutiveObservation(latest)}
                  </div>
                </div>

                <div style={styles.guidanceRecommendation}>
                  <div style={styles.guidanceLabel}>
                    Leadership Recommendation
                  </div>
                  <div style={styles.guidanceText}>
                    {polishPersistedNarrative(
                      latest.leadership_action_cue,
                    )}
                  </div>
                </div>

                <div style={styles.guidanceActions}>
                  <div style={styles.guidanceBlock}>
                    <div style={styles.guidanceLabel}>
                      Immediate Action 1
                    </div>
                    <div style={styles.guidanceText}>
                      {polishPersistedNarrative(
                        latest.immediate_action_1,
                      )}
                    </div>
                  </div>
                  <div style={styles.guidanceBlock}>
                    <div style={styles.guidanceLabel}>
                      Immediate Action 2
                    </div>
                    <div style={styles.guidanceText}>
                      {polishPersistedNarrative(
                        latest.immediate_action_2,
                      )}
                    </div>
                  </div>
                  <div style={styles.guidanceBlock}>
                    <div style={styles.guidanceLabel}>
                      Short-Term Action 1
                    </div>
                    <div style={styles.guidanceText}>
                      {polishPersistedNarrative(
                        latest.short_term_action_1,
                      )}
                    </div>
                  </div>
                  <div style={styles.guidanceBlock}>
                    <div style={styles.guidanceLabel}>
                      Short-Term Action 2
                    </div>
                    <div style={styles.guidanceText}>
                      {polishPersistedNarrative(
                        latest.short_term_action_2,
                      )}
                    </div>
                  </div>
                </div>
              </Section>
            </Layer>

            <Layer title="Supporting Structural Evidence" tone="evidence">
              <Section title="Assignment Evidence">
                <EvidenceGrid
                  metrics={[
                    {
                      label: 'Assignments above baseline',
                      value: latest.above_baseline_assignment_count,
                    },
                    {
                      label: 'Share above baseline',
                      value:
                        latest.above_baseline_assignment_percentage === null ||
                        latest.above_baseline_assignment_percentage === undefined
                          ? null
                          : `${latest.above_baseline_assignment_percentage}%`,
                    },
                    {
                      label: 'Greatest assignment variance',
                      value: latest.maximum_assignment_overload,
                    },
                    {
                      label: 'Localized overload assignments',
                      value: latest.localized_overload_assignment_count,
                    },
                    {
                      label: 'Reserve-capacity condition',
                      value: executiveReservePhrase(
                        dominantPersistedKey(
                          latest.reserve_capacity_status_counts,
                        ),
                      ),
                    },
                  ]}
                />
              </Section>

              <Section title="Stability Event Evidence">
                <EvidenceGrid
                  metrics={[
                    {
                      label: 'Total Stability Events',
                      value: latest.total_stability_events,
                    },
                    {
                      label: 'High-intensity events',
                      value: latest.high_intensity_event_count,
                    },
                    {
                      label: 'Late or last-minute events',
                      value: latest.late_or_last_minute_event_count,
                    },
                    {
                      label: 'Principal system force',
                      value: primaryDominantForce(
                        latest.dominant_stability_forces,
                      ),
                    },
                  ]}
                />
              </Section>

              <Section title="Workforce Reliability Evidence">
                <EvidenceGrid
                  metrics={[
                    {
                      label: 'Late reliability events',
                      value: latest.late_or_last_minute_event_count,
                    },
                    {
                      label: 'Affected role-pool scope',
                      value: humanize(latest.most_affected_role_pool),
                    },
                    {
                      label: 'Most affected shift',
                      value: humanize(latest.most_affected_shift),
                    },
                    {
                      label: 'Predictability insight',
                      value: polishPersistedNarrative(
                        latest.predictability_insight,
                      ),
                    },
                  ]}
                />
              </Section>

              <Section title="Cost and Fragility Evidence">
                <EvidenceGrid
                  metrics={[
                    {
                      label: 'Buffer-use profile',
                      value: humanize(latest.buffer_use_profile),
                    },
                    {
                      label: 'Repeated buffer depletion',
                      value: latest.repeated_buffer_depletion_flag,
                    },
                    {
                      label: 'Cost-pressure signal',
                      value: humanize(latest.cost_pressure_signal),
                    },
                    {
                      label: 'Fragility level',
                      value: humanize(latest.fragility_level),
                    },
                  ]}
                />
              </Section>
            </Layer>

            <Layer title="Strategic Reference Intelligence" tone="reference">
              <Section title="Stability Cost Matrix" quiet>
                <div style={styles.compactGrid3}>
                  <Tile label="Stable + Low Cost" value="Continuity is supported by available structural resilience with minimal adaptive cost." quiet />
                  <Tile label="Straining + Moderate Cost" value="Continuity is being preserved through increasing adaptation. Repetition is likely to increase workforce and operating costs." quiet />
                  <Tile label="Unstable + High Cost" value="Structural instability is producing sustained adaptive demand with significant workforce, financial and continuity consequences." quiet />
                </div>
                <div style={styles.currentMatrix}>
                  Current assessment position: {humanize(latest.trend_status)} + {humanize(latest.cost_pressure_signal)}
                </div>
              </Section>

              <Section title="Recent Validated Structural Assessments" quiet>
                <div style={styles.historyInterpretation}>{buildHistoryInterpretation(records)}</div>
                <div style={styles.tableScroll}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Assessment</th>
                        <th style={styles.th}>Unit</th>
                        <th style={styles.th}>Window Start</th>
                        <th style={styles.th}>Window End</th>
                        <th style={styles.th}>Validated Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyRecords.map((record, index) => (
                        <tr key={record.id}>
                          <th scope="row" style={styles.rowHeader}>
                            {index === historyRecords.length - 1
                              ? 'Latest'
                              : index === historyRecords.length - 2
                                ? 'Previous'
                                : `Earlier ${index + 1}`}
                          </th>
                          <td style={styles.td}>{display(record.unit)}</td>
                          <td style={styles.td}>{display(record.window_start)}</td>
                          <td style={styles.td}>{display(record.window_end)}</td>
                          <td style={{ ...styles.td, color: colors.text, fontWeight: 700 }}>{humanize(record.trend_status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>

              <Section title="Leadership Action Memory" quiet>
                <div style={styles.compactGrid3}>
                  <Tile label="Last Action Taken" value={latest.last_action_taken} quiet />
                  <Tile label="Observed Outcome" value={latest.observed_outcome} quiet />
                  <Tile
                    label="Organizational Learning Status"
                    value={
                      hasValue(latest.last_action_taken) && hasValue(latest.observed_outcome)
                        ? 'A persisted action-and-outcome pair is available for leadership review.'
                        : 'No sufficiently validated prior intervention outcome is available for this assessment window.'
                    }
                    quiet
                  />
                </div>
              </Section>

              <Section title="Doctrine Boundary" quiet>
                <div style={styles.doctrine}>
                  The Executive Structural Interpretation reads persisted ssi_trend_buffer findings only.
                  Assignment calculation, Stability Event calculation and Structural Stability Assessment
                  generation remain locked upstream. This page performs no recalculation. It interprets
                  validated evidence and preserves supporting traceability.
                </div>
              </Section>

              <Section title="Executive Interpretation Version" quiet>
                <div style={styles.versionSignature}>
                  <strong>
                    Structural Stability Intelligence (SSI) Executive
                    Structural Interpretation v1.0
                  </strong>
                  <span>
                    Interpretation generated exclusively from validated
                    Assignment, Stability Event, and Structural Stability
                    Assessment evidence.
                  </span>
                  <span>
                    Generated from persisted assessment evidence: {latest ? formatDate(latest.updated_at) : '—'}
                  </span>
                </div>
              </Section>
            </Layer>
          </div>
        )}
      </div>
    </main>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at 50% -140px, rgba(214,178,94,0.07), transparent 480px), #070707',
    color: colors.text,
    fontFamily:
      "'Segoe UI', Arial, Helvetica, sans-serif",
    WebkitFontSmoothing: 'auto',
    textRendering: 'auto',
    fontKerning: 'normal',
    textShadow: 'none',
    padding: '34px 28px 76px',
  },
  shell: {
    width: 'min(1360px, calc(100vw - 48px))',
    margin: '0 auto',
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: 36,
    alignItems: 'center',
    marginBottom: 22,
    padding: '24px 26px',
    border: `1px solid ${colors.line}`,
    borderRadius: 16,
    background: colors.shell,
    boxShadow: '0 18px 60px rgba(0,0,0,0.24)',
  },
  eyebrow: {
    marginBottom: 8,
    color: colors.goldMuted,
    fontSize: 11,
    fontWeight: 650,
    letterSpacing: '0.13em',
    textTransform: 'uppercase',
  },
  title: {
    margin: 0,
    color: '#d9d2c6',
    fontSize: 30,
    fontWeight: 500,
    lineHeight: 1.22,
    letterSpacing: 0,
    textShadow: 'none',
  },
  subtitle: {
    maxWidth: 760,
    margin: '10px 0 0',
    color: '#bcb5aa',
    fontSize: 15,
    fontWeight: 400,
    lineHeight: 1.62,
    letterSpacing: 0,
    textShadow: 'none',
  },
  updated: {
    minWidth: 230,
    paddingLeft: 24,
    borderLeft: `1px solid ${colors.lineSoft}`,
    textAlign: 'right',
  },
  updatedLabel: {
    display: 'block',
    marginBottom: 7,
    color: colors.goldMuted,
    fontSize: 10,
    fontWeight: 650,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  updatedValue: {
    color: '#d5cec2',
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: 0,
    textShadow: 'none',
  },
  logoutButton: {
    marginTop: 14,
    width: '100%',
    border: `1px solid ${colors.lineStrong}`,
    borderRadius: 999,
    background: '#11100d',
    color: colors.gold,
    padding: '10px 14px',
    fontSize: 12,
    fontWeight: 650,
    cursor: 'pointer',
  },
  flowNav: {
    border: `1px solid ${colors.line}`,
    background: colors.shell,
    borderRadius: 16,
    padding: 18,
    marginBottom: 22,
  },
  flowNavHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  flowNavTitle: {
    color: colors.gold,
    fontWeight: 650,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontSize: 11,
  },
  flowNavRule: {
    height: 1,
    flex: 1,
    background: colors.lineSoft,
  },
  flowNavCaption: {
    color: colors.quiet,
    fontSize: 11,
    fontWeight: 450,
  },
  flowSteps: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: 12,
  },
  flowStepWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  flowStep: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 11,
    minHeight: 58,
    textDecoration: 'none',
    color: colors.muted,
    border: `1px solid ${colors.lineSoft}`,
    background: '#0d0d0c',
    borderRadius: 12,
    padding: '11px 12px',
    minWidth: 0,
  },
  flowStepActive: {
    border: `1px solid ${colors.lineStrong}`,
    background: 'rgba(214,178,94,0.10)',
    color: colors.text,
    boxShadow: `inset 3px 0 0 ${colors.gold}`,
  },
  flowStepIndex: {
    display: 'grid',
    placeItems: 'center',
    width: 27,
    height: 27,
    borderRadius: 999,
    background: 'rgba(214,178,94,0.13)',
    color: colors.gold,
    fontSize: 12,
    fontWeight: 650,
    flexShrink: 0,
  },
  flowStepText: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    minWidth: 0,
    fontSize: 12,
    lineHeight: 1.35,
  },
  flowArrow: {
    color: colors.goldMuted,
    fontWeight: 600,
    flexShrink: 0,
  },
  dashboard: {
    display: 'grid',
    gap: 40,
  },
  layer: {
    display: 'grid',
    gap: 28,
    padding: '26px 26px 28px',
    border: `1px solid rgba(214,178,94,0.11)`,
    borderRadius: 18,
    background: 'rgba(255,255,255,0.006)',
  },
  layerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
    padding: '2px 3px 3px',
  },
  layerTitle: {
    margin: 0,
    color: colors.gold,
    fontSize: 11,
    fontWeight: 660,
    letterSpacing: '0.145em',
    textTransform: 'uppercase',
  },
  layerRule: {
    flex: 1,
    height: 1,
    background: colors.lineSoft,
  },
  section: {
    overflow: 'hidden',
    border: `1px solid rgba(214,178,94,0.10)`,
    borderRadius: 14,
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.010), rgba(255,255,255,0.003))',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    minHeight: 43,
    padding: '0 18px',
    borderBottom: `1px solid rgba(214,178,94,0.09)`,
    background: 'rgba(10,10,9,0.62)',
  },
  sectionLine: {
    width: 2,
    height: 15,
    borderRadius: 999,
    background: colors.gold,
  },
  sectionTitle: {
    margin: 0,
    color: colors.goldMuted,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.075em',
    textTransform: 'uppercase',
    textShadow: 'none',
  },
  sectionContent: {
    padding: '26px 27px 30px',
  },
  diagnosisContent: {
    padding: '34px 34px 38px',
  },
  compactGrid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 10,
  },
  compactGrid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 10,
  },
  guidanceUnderstanding: {
    marginBottom: 18,
    padding: '22px 23px',
    borderLeft: `3px solid ${colors.gold}`,
    borderRadius: 9,
    background: 'rgba(214,178,94,0.042)',
  },
  executiveSummaryCard: {
    padding: '24px 25px',
    borderLeft: `4px solid ${colors.gold}`,
    borderRadius: 10,
    background:
      'linear-gradient(180deg, rgba(214,178,94,0.075), rgba(214,178,94,0.025))',
  },
  executiveSummaryText: {
    maxWidth: 900,
    color: '#ddd6ca',
    fontSize: 17,
    fontWeight: 600,
    lineHeight: 1.78,
    letterSpacing: 0,
  },
  confidenceLayout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(220px, 0.8fr) minmax(0, 2fr)',
    gap: 18,
    alignItems: 'stretch',
  },
  confidencePrimary: {
    display: 'grid',
    alignContent: 'center',
    gap: 8,
    padding: '22px 23px',
    borderLeft: `3px solid ${colors.gold}`,
    borderRadius: 9,
    background: 'rgba(214,178,94,0.042)',
  },
  confidenceLabel: {
    color: colors.goldMuted,
    fontSize: 10,
    fontWeight: 650,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  confidenceValue: {
    color: '#ddd6ca',
    fontSize: 24,
    fontWeight: 650,
    lineHeight: 1.2,
  },
  confidenceNote: {
    color: colors.quiet,
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.55,
  },
  confidenceEvidence: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 10,
  },
  confidenceEvidenceItem: {
    display: 'grid',
    alignContent: 'center',
    gap: 8,
    minHeight: 92,
    padding: '16px 17px',
    border: `1px solid ${colors.lineSoft}`,
    borderRadius: 9,
    background: 'rgba(18,22,27,0.26)',
    color: '#a9a298',
    fontSize: 12,
    lineHeight: 1.45,
  },
  guidanceRecommendation: {
    marginBottom: 18,
    padding: '22px 23px',
    borderLeft: `3px solid ${colors.goldMuted}`,
    borderRadius: 9,
    background: 'rgba(255,255,255,0.012)',
  },
  guidanceActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
  },
  guidanceBlock: {
    borderLeft: `1px solid rgba(214,178,94,0.18)`,
    background: 'rgba(255,255,255,0.008)',
    padding: '20px 20px 22px',
  },
  guidanceLabel: {
    color: colors.goldMuted,
    fontSize: 10,
    fontWeight: 650,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  guidanceText: {
    maxWidth: 580,
    color: '#c7c0b5',
    fontSize: 15,
    fontWeight: 500,
    lineHeight: 1.7,
    letterSpacing: 0,
    textShadow: 'none',
  },
  interpretation: {
    display: 'grid',
    gap: 26,
    padding: '4px 1px',
  },
  interpretationText: {
    maxWidth: 760,
    color: '#d7d0c4',
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 1.76,
    letterSpacing: 0,
    textShadow: 'none',
  },
  interpretationEvidence: {
    maxWidth: 800,
    padding: '17px 20px',
    borderLeft: `2px solid rgba(214,178,94,0.24)`,
    borderRadius: 0,
    background: 'rgba(255,255,255,0.006)',
  },
  evidenceLabel: {
    color: '#8e8062',
    fontSize: 10,
    fontWeight: 560,
    letterSpacing: '0.075em',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  evidenceList: {
    maxWidth: 800,
    margin: 0,
    paddingLeft: 21,
    display: 'grid',
    gap: 10,
  },
  evidenceItem: {
    color: '#b2aba1',
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.7,
    letterSpacing: 0,
    textShadow: 'none',
  },
  findingsLayout: {
    display: 'grid',
    gap: 28,
  },
  findingsNarrative: {
    maxWidth: 790,
  },
  findingsLabel: {
    color: '#8e8062',
    fontSize: 10,
    fontWeight: 560,
    letterSpacing: '0.075em',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  findingsList: {
    margin: 0,
    paddingLeft: 21,
    display: 'grid',
    gap: 11,
  },
  findingsItem: {
    color: '#c1baaf',
    fontSize: 15,
    fontWeight: 500,
    lineHeight: 1.74,
    letterSpacing: 0,
    textShadow: 'none',
  },
  verificationPanel: {
    paddingTop: 19,
    borderTop: `1px solid rgba(214,178,94,0.10)`,
  },
  verificationTitle: {
    marginBottom: 11,
    color: '#8e8062',
    fontSize: 10,
    fontWeight: 560,
    letterSpacing: '0.075em',
    textTransform: 'uppercase',
  },
  verificationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 9,
  },
  verificationMetric: {
    display: 'grid',
    gap: 6,
    minHeight: 62,
    padding: '12px 14px',
    border: `1px solid rgba(214,178,94,0.08)`,
    borderRadius: 9,
    background: 'rgba(18,22,27,0.26)',
  },
  verificationMetricLabel: {
    color: '#9f998f',
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.45,
    letterSpacing: 0,
    textShadow: 'none',
  },
  verificationMetricValue: {
    color: '#d6cfc3',
    fontSize: 15,
    fontWeight: 600,
    lineHeight: 1.48,
    letterSpacing: 0,
    textShadow: 'none',
  },
  verificationTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  dataTile: {
    border: `1px solid ${colors.lineSoft}`,
    borderRadius: 8,
    overflow: 'hidden',
    background: '#090909',
  },
  dataLabel: {
    minHeight: 32,
    display: 'flex',
    alignItems: 'center',
    padding: '8px 11px',
    color: '#aaa49b',
    background: colors.slate,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0,
    textShadow: 'none',
  },
  dataValue: {
    minHeight: 38,
    display: 'flex',
    alignItems: 'center',
    padding: '10px 11px',
    color: '#cec7bc',
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.52,
    letterSpacing: 0,
    textShadow: 'none',
  },
  dataValueStrong: {
    color: '#ddd6ca',
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: 0,
    textShadow: 'none',
  },
  missingBand: {
    padding: '12px 15px',
    color: colors.quiet,
    border: `1px dashed ${colors.line}`,
    background: 'rgba(214,178,94,0.025)',
    fontSize: 12,
    fontWeight: 450,
    lineHeight: 1.55,
    textAlign: 'center',
  },
  currentMatrix: {
    marginTop: 13,
    padding: '12px 14px',
    border: `1px solid rgba(214,178,94,0.22)`,
    borderRadius: 8,
    background: 'rgba(214,178,94,0.045)',
    color: colors.goldMuted,
    fontSize: 12,
    fontWeight: 560,
    textAlign: 'center',
  },
  historyInterpretation: {
    maxWidth: 860,
    marginBottom: 22,
    padding: '17px 19px',
    borderLeft: `2px solid rgba(214,178,94,0.24)`,
    borderRadius: 0,
    background: 'rgba(255,255,255,0.006)',
    color: '#c1baaf',
    fontSize: 15,
    fontWeight: 500,
    lineHeight: 1.72,
    letterSpacing: 0,
    textShadow: 'none',
  },
  tableScroll: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 3px',
    tableLayout: 'fixed',
  },
  th: {
    padding: '14px 14px',
    borderBottom: `1px solid rgba(214,178,94,0.12)`,
    color: '#c4bdb2',
    background: 'rgba(17,22,29,0.68)',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
    textAlign: 'left',
    verticalAlign: 'middle',
    textShadow: 'none',
  },
  td: {
    padding: '14px 14px',
    borderBottom: `1px solid rgba(214,178,94,0.08)`,
    color: '#bbb4a9',
    fontSize: 13,
    fontWeight: 500,
    lineHeight: 1.52,
    letterSpacing: 0,
    textAlign: 'left',
    verticalAlign: 'middle',
    textShadow: 'none',
  },
  rowHeader: {
    padding: '14px 14px',
    borderBottom: `1px solid rgba(214,178,94,0.08)`,
    color: colors.goldMuted,
    background: 'rgba(11,11,10,0.72)',
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 0,
    textAlign: 'left',
    verticalAlign: 'middle',
    textShadow: 'none',
  },
  doctrine: {
    maxWidth: 1000,
    padding: '7px 2px',
    color: '#aaa399',
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.7,
    letterSpacing: 0,
    textShadow: 'none',
  },
  versionSignature: {
    display: 'grid',
    gap: 8,
    maxWidth: 1000,
    padding: '7px 2px',
    color: '#aaa399',
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.7,
    letterSpacing: 0,
    textShadow: 'none',
  },
}