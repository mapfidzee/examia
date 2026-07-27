'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase'

type TrendRecord = {
  id: string
  unit: string
  window_start: string
  window_end: string
  assignment_load_skew: number | null
  total_stability_events: number | null
  high_intensity_event_count: number | null
  late_or_last_minute_event_count: number | null
  buffer_use_profile: string | null
  repeated_buffer_depletion_flag: boolean | null
  dominant_stability_forces: string[] | string | null
  trend_status: string | null
  leadership_action_cue: string | null
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
  workforce_event_counts: Record<string, number> | null
  organizational_adaptation_counts: Record<string, number> | null
  staffing_instability_event_count: number | null
  buffer_response_count: number | null
  high_cost_buffer_response_count: number | null
  dominant_workforce_event_type: string | null
  dominant_organizational_adaptation: string | null
  repeated_workforce_event_type: string | null
  repeated_organizational_adaptation: string | null
  workforce_reliability_status: string | null
  reliability_pattern_direction: string | null
  repeated_workforce_reliability_flag: boolean | null
  repeated_adaptation_flag: boolean | null
  consecutive_affected_windows: number | null
  workforce_reliability_summary: string | null
  workforce_consequence_outlook: string | null
  created_at: string
  updated_at: string
}

type ExecutiveCommunicationOutput = {
  identity: {
    unit: string
    reportingPeriod: string
    preparedBy: string
  }
  situationAssessment: string
  conditionStatement: string
  executiveAssessment: Array<{ label: string; value: string }>
  structuralStory: {
    narrative: string
  }
  consequences: Array<{ title: string; narrative: string }>
  leadershipPriorities: Array<{
    rank: number
    action: string
    benefit: string
  }>
  executiveImplication: string
  stabilityOutlook: string
  confidence: {
    level: string
    rationale: string
    evidenceBasis: string[]
  }
  evidence: {
    coreMetrics: Array<{ label: string; value: string }>
    structuralContext: Array<{ label: string; value: string }>
    workforceProfile: Array<{ label: string; value: string }>
    economicDrivers: string[]
    organizationalLearning: {
      action: string
      outcome: string
      lesson: string
    }
    history: Array<{ label: string; value: string }>
    workforceEventCounts: Record<string, number> | null
    adaptationCounts: Record<string, number> | null
  }
}


const allowedRoles = ['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']
const allowedStatuses = ['ACTIVE']

const MISSING = 'Not persisted in current buffer.'
const NO_RECORDS = 'No persisted SSI reporting window is available.'
const ACCESS_FAILURE = 'SSI could not verify access. Check the connection and try again.'
const INITIAL_LOAD_FAILURE =
  'The weekly stability record could not be loaded. Check the connection and try again.'
const REFRESH_LOAD_FAILURE =
  'The weekly stability record could not be loaded. The last valid display has not been changed. Check the connection and try again.'
const PDF_FAILURE = 'The PDF could not be generated. Check the browser and try again.'
const REQUEST_TIMEOUT_MS = 12000

const TREND_BUFFER_SELECT = `
  id,
  unit,
  window_start,
  window_end,
  assignment_load_skew,
  total_stability_events,
  high_intensity_event_count,
  late_or_last_minute_event_count,
  buffer_use_profile,
  repeated_buffer_depletion_flag,
  dominant_stability_forces,
  trend_status,
  leadership_action_cue,
  stability_score,
  predictability_insight,
  most_affected_role_pool,
  most_affected_shift,
  fragility_level,
  cost_pressure_signal,
  leadership_interpretation,
  immediate_action_1,
  immediate_action_2,
  short_term_action_1,
  short_term_action_2,
  risk_outlook,
  last_action_taken,
  observed_outcome,
  workforce_event_counts,
  organizational_adaptation_counts,
  staffing_instability_event_count,
  buffer_response_count,
  high_cost_buffer_response_count,
  dominant_workforce_event_type,
  dominant_organizational_adaptation,
  repeated_workforce_event_type,
  repeated_organizational_adaptation,
  workforce_reliability_status,
  reliability_pattern_direction,
  repeated_workforce_reliability_flag,
  repeated_adaptation_flag,
  consecutive_affected_windows,
  workforce_reliability_summary,
  workforce_consequence_outlook,
  created_at,
  updated_at
`

const ssiFlow = [
  {
    label: 'Assignments',
    href: '/ssi/assignments',
    note: 'Shift-start load capture',
    active: false,
  },
  {
    label: 'Events',
    href: '/ssi/events',
    note: 'Stability event capture',
    active: false,
  },
  {
    label: 'Trend Buffer',
    href: '/ssi/dashboard',
    note: 'Persisted structural signals',
    active: false,
  },
  {
    label: 'Executive Dashboard',
    href: '/ssi',
    note: 'Leadership interpretation',
    active: false,
  },
  {
    label: 'Weekly Brief',
    href: '/ssi/weekly-brief',
    note: 'Printable executive summary',
    active: true,
  },
]

function hasValue(value: unknown) {
  if (value === undefined || value === null || value === '') return false
  if (Array.isArray(value)) return value.length > 0
  return String(value).trim().length > 0
}

function display(value: unknown) {
  if (!hasValue(value)) return MISSING
  if (typeof value === 'boolean') return value ? 'YES' : 'NO'
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : MISSING
  return String(value).trim()
}

function cleanText(value: unknown) {
  return hasValue(value) ? display(value) : ''
}

function uniqueValues(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))),
  )
}

function includesAny(value: unknown, terms: string[]) {
  const normalized = cleanText(value).toLowerCase()
  return terms.some((term) => normalized.includes(term))
}

function numericalValue(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function normalizedStatus(value: unknown) {
  return cleanText(value).toUpperCase() || 'NOT CLASSIFIED'
}

function sentence(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`
}

function lowerLead(value: string) {
  if (!value) return value
  return `${value.charAt(0).toLowerCase()}${value.slice(1)}`
}

function deriveDirection(record: TrendRecord) {
  const persisted = normalizedStatus(record.reliability_pattern_direction)

  if (persisted === 'NEW') return 'EMERGING'
  if (persisted !== 'NOT CLASSIFIED' && persisted !== MISSING.toUpperCase()) return persisted
  if (record.repeated_workforce_reliability_flag || record.repeated_adaptation_flag) return 'DETERIORATING'
  if (includesAny(record.trend_status, ['recover', 'improv', 'strength'])) return 'IMPROVING'
  if (includesAny(record.trend_status, ['strain', 'fragile', 'escalat'])) return 'DECLINING'
  return 'STABLE'
}

function deriveWorkforceSustainability(record: TrendRecord) {
  const status = cleanText(record.workforce_reliability_status)
  if (includesAny(status, ['critical', 'unstable', 'deteriorating'])) return 'HIGH CONCERN'
  if (record.repeated_workforce_reliability_flag || numericalValue(record.staffing_instability_event_count) >= 2) return 'ELEVATED CONCERN'
  if (status) return status.toUpperCase()
  if (numericalValue(record.staffing_instability_event_count) > 0) return 'MODERATE CONCERN'
  return 'LOW CURRENT CONCERN'
}

function deriveTurnoverOutlook(record: TrendRecord) {
  const combined = [
    record.workforce_consequence_outlook,
    record.workforce_reliability_summary,
    record.risk_outlook,
    record.fragility_level,
  ].map(cleanText).join(' ').toLowerCase()
  if (combined.includes('critical') || combined.includes('severe')) return 'CRITICAL RETENTION RISK'
  if (
    record.repeated_workforce_reliability_flag ||
    combined.includes('fatigue') ||
    combined.includes('turnover') ||
    combined.includes('burnout') ||
    numericalValue(record.staffing_instability_event_count) >= 2
  ) return 'ELEVATED RETENTION RISK'
  if (numericalValue(record.staffing_instability_event_count) > 0 || includesAny(record.trend_status, ['strain', 'fragile'])) {
    return 'MODERATE RETENTION RISK'
  }
  return 'LOW CURRENT RETENTION RISK'
}

function deriveEconomicExposure(record: TrendRecord) {
  const persisted = cleanText(record.cost_pressure_signal)
  if (persisted) return persisted.toUpperCase()
  if (numericalValue(record.high_cost_buffer_response_count) > 0) return 'ELEVATED'
  if (numericalValue(record.buffer_response_count) > 0 || numericalValue(record.staffing_instability_event_count) > 0) return 'MODERATE'
  return 'LOW CURRENT EXPOSURE'
}

function deriveConfidence(record: TrendRecord) {
  let score = 0
  const basis: string[] = []
  if (hasValue(record.assignment_load_skew) || hasValue(record.most_affected_role_pool)) {
    score += 1
    basis.push('Assignment evidence')
  }
  if (numericalValue(record.total_stability_events) > 0) {
    score += 1
    basis.push('Stability-event evidence')
  }
  if (hasValue(record.workforce_reliability_status) || numericalValue(record.staffing_instability_event_count) > 0) {
    score += 1
    basis.push('Workforce reliability evidence')
  }
  if (numericalValue(record.buffer_response_count) > 0 || hasValue(record.dominant_organizational_adaptation)) {
    score += 1
    basis.push('Organizational adaptation evidence')
  }
  if (numericalValue(record.consecutive_affected_windows) > 1 || record.repeated_workforce_reliability_flag || record.repeated_adaptation_flag) {
    score += 1
    basis.push('Longitudinal pattern evidence')
  }
  const level = score >= 4 ? 'HIGH' : score >= 2 ? 'MODERATE' : 'LIMITED'
  const rationale = level === 'HIGH'
    ? 'The assessment is supported by multiple independent persisted evidence layers and a repeated or longitudinal pattern.'
    : level === 'MODERATE'
      ? 'The assessment is supported by more than one persisted evidence layer, but longitudinal confirmation remains incomplete.'
      : 'The assessment is based on a limited evidence set and should be treated as an early structural signal rather than a settled conclusion.'
  return { level, rationale, basis: basis.length ? basis : ['Current trend-buffer record'] }
}

function buildPriorityList(record: TrendRecord) {
  const actions = uniqueValues([
    record.leadership_action_cue,
    record.immediate_action_1,
    record.immediate_action_2,
    record.short_term_action_1,
    record.short_term_action_2,
  ])
  const role = cleanText(record.most_affected_role_pool)
  const shift = cleanText(record.most_affected_shift)
  const defaults = [
    `Restore baseline staffing reliability${role ? ` across the ${role.replace(/\s+role pools?/gi, '').trim()} workforce` : ''}${shift ? ` during the ${shift} shift` : ''}.`,
    'Reduce dependence on assignment redistribution and other temporary adaptations.',
    'Review the same structural signals in the next reporting window to confirm whether stability is improving.',
  ]
  const selected = [...actions, ...defaults].slice(0, 3)
  const benefits = [
    'Improves baseline reliability and reduces hidden workload concentration.',
    'Restores operational predictability and protects reserve workforce capacity.',
    'Creates early confirmation that leadership action is producing measurable structural improvement.',
  ]
  return selected.map((action, index) => ({ rank: index + 1, action: sentence(action), benefit: benefits[index] }))
}

function buildEconomicDrivers(record: TrendRecord) {
  const drivers = uniqueValues([
    numericalValue(record.staffing_instability_event_count) > 0 ? 'Overtime, premium-pay, and replacement-staffing exposure' : null,
    numericalValue(record.buffer_response_count) > 0 ? 'Repeated operational workarounds that consume productive capacity' : null,
    numericalValue(record.high_cost_buffer_response_count) > 0 ? 'High-cost buffer and agency-utilization exposure' : null,
    deriveTurnoverOutlook(record).includes('ELEVATED') || deriveTurnoverOutlook(record).includes('CRITICAL')
      ? 'Recruitment, onboarding, orientation, and lost-experience costs if retention deteriorates'
      : null,
    includesAny(record.workforce_consequence_outlook, ['fatigue', 'productivity']) ? 'Productivity loss associated with fatigue and declining reserve capacity' : null,
    'Leadership time redirected from planned improvement to recurring operational stabilization',
  ])
  return drivers.length ? drivers : ['No material economic exposure driver was persisted for this reporting window.']
}

function buildCommunication(record: TrendRecord): ExecutiveCommunicationOutput {
  const status = normalizedStatus(record.trend_status)
  const direction = deriveDirection(record)
  const workforce = deriveWorkforceSustainability(record)
  const turnover = deriveTurnoverOutlook(record)
  const economic = deriveEconomicExposure(record)
  const role = display(record.most_affected_role_pool)
  const workforceScope = role === MISSING
    ? 'affected nursing workforce'
    : `${role.replace(/\s+role pools?/gi, '').trim()} workforce`
  const shift = display(record.most_affected_shift)
  const force = display(record.dominant_stability_forces)
  const event = cleanText(record.dominant_workforce_event_type)
  const adaptation = cleanText(record.dominant_organizational_adaptation)
  const reliability = cleanText(record.workforce_reliability_summary)
  const predictability = cleanText(record.predictability_insight)
  const confidence = deriveConfidence(record)
  const persistedPriority = cleanText(record.leadership_action_cue)
  const executivePriority = includesAny(persistedPriority, ['hidden strain'])
    ? 'REVIEW HIDDEN RN & LPN STRAIN'
    : persistedPriority || 'RESTORE BASELINE RELIABILITY'

  const conditionStatement = `Continuity was maintained, but organizational resilience was ${status.toLowerCase()} and moving in a ${direction.toLowerCase()} direction because operations depended more heavily on workforce adaptation than dependable baseline capacity.`

  const situationAssessment = [
    `Continuity of care was maintained, but operations relied more heavily on workforce adaptation than dependable baseline capacity.`,
    `Pressure was concentrated in ${display(record.unit)} during the ${shift} shift, affected the ${workforceScope}, and reflected ${reliability ? lowerLead(sentence(reliability)) : 'an emerging reliability concern.'}`,
    `Leadership attention is required before recurring workarounds further reduce reserve capacity and become normal operating practice.`,
  ].join(' ')

  const initiatingPressure = event || (force !== MISSING ? force : 'The recorded structural pressure')
  const responseNarrative = adaptation
    ? `${adaptation} preserved immediate continuity`
    : 'Available staff preserved immediate continuity'
  const structuralNarrative = `${sentence(initiatingPressure)} created staffing pressure during the ${shift} shift. ${sentence(responseNarrative)} but concentrated hidden workload within the ${workforceScope}. As reserve capacity declined, operational predictability weakened and ${lowerLead(turnover)} increased.`

  const operationalConsequence = predictability
    ? `${sentence(predictability)} Recurring disruption is reducing flexibility for the next demand surge.`
    : 'Care remained supportable, but recurring disruption reduced predictability and the capacity to absorb additional demand.'
  const workforceConsequence = cleanText(record.workforce_consequence_outlook)
    ? `${sentence(cleanText(record.workforce_consequence_outlook))} Continued reliance on the same workforce response may increase fatigue.`
    : 'Hidden workload and recurring adaptation are reducing reserve capacity and increasing fatigue and retention exposure.'
  const economicNarrative = `The pattern creates ${economic.toLowerCase()} exposure through premium staffing, repeated workarounds, productivity loss, and potential replacement costs.`
  const organizationalConsequence = 'Dependence on temporary adaptation is weakening resilience and redirecting leadership attention from planned improvement to recurring stabilization.'

  const executiveImplication = `Immediate operational continuity remains intact, but organizational resilience is weakening. If the current pattern persists, leadership should expect rising workforce fatigue, retention exposure, and labor expenditure despite continued day-to-day functionality.`

  const outlook = includesAny(direction, ['declining', 'deteriorating']) || status.includes('STRAIN') || status.includes('FRAGILE')
    ? `The next reporting window is likely to remain strained unless staffing reliability improves or assignment pressure is reduced. Improvement should be demonstrated through fewer late disruptions, less assignment redistribution, stronger reserve capacity, and reduced dependence on temporary workforce adaptation.`
    : `The next reporting window is expected to remain manageable if current staffing reliability is preserved. Continued stability should be demonstrated through sustained reserve capacity, limited disruption, and low dependence on temporary workforce adaptation.`

  const lesson = cleanText(record.last_action_taken) && cleanText(record.observed_outcome)
    ? 'Review the leadership response and observed result together to determine whether structural pressure was reduced or only short-term continuity was protected. The evidence supports learning, but does not establish causation by itself.'
    : 'No reliable organizational learning can yet be established because both a leadership response and its observed result have not been persisted.'

  return {
    identity: {
      unit: display(record.unit),
      reportingPeriod: `${display(record.window_start)} – ${display(record.window_end)}`,
      preparedBy: 'TSINAXA',
    },
    situationAssessment,
    conditionStatement,
    executiveAssessment: [
      { label: 'Operational Condition', value: status },
      { label: 'Direction', value: direction },
      { label: 'Workforce Sustainability', value: workforce },
      { label: 'Turnover Outlook', value: turnover },
      { label: 'Economic Exposure', value: economic },
      { label: 'Executive Priority', value: executivePriority },
    ],
    structuralStory: { narrative: structuralNarrative },
    consequences: [
      { title: 'Operational', narrative: operationalConsequence },
      { title: 'Workforce', narrative: workforceConsequence },
      { title: 'Economic', narrative: economicNarrative },
      { title: 'Organizational', narrative: organizationalConsequence },
    ],
    leadershipPriorities: buildPriorityList(record),
    executiveImplication,
    stabilityOutlook: outlook,
    confidence: { level: confidence.level, rationale: confidence.rationale, evidenceBasis: confidence.basis },
    evidence: {
      coreMetrics: [
        { label: 'Total stability events', value: display(record.total_stability_events) },
        { label: 'High-intensity events', value: display(record.high_intensity_event_count) },
        { label: 'Late or last-minute events', value: display(record.late_or_last_minute_event_count) },
        { label: 'Staffing-instability events', value: display(record.staffing_instability_event_count) },
        { label: 'Buffer responses', value: display(record.buffer_response_count) },
        { label: 'High-cost responses', value: display(record.high_cost_buffer_response_count) },
        { label: 'Assignment load skew', value: display(record.assignment_load_skew) },
        { label: 'Fragility', value: display(record.fragility_level) },
      ],
      structuralContext: [
        { label: 'Dominant stability forces', value: display(record.dominant_stability_forces) },
        { label: 'Most affected workforce', value: workforceScope },
        { label: 'Most affected shift', value: shift },
        { label: 'Buffer use profile', value: display(record.buffer_use_profile) },
        { label: 'Predictability insight', value: display(record.predictability_insight) },
        { label: 'Risk outlook', value: display(record.risk_outlook) },
      ],
      workforceProfile: [
        { label: 'Reliability status', value: display(record.workforce_reliability_status) },
        { label: 'Pattern direction', value: direction },
        { label: 'Dominant workforce event', value: display(record.dominant_workforce_event_type) },
        { label: 'Repeated workforce event', value: display(record.repeated_workforce_event_type) },
        { label: 'Dominant organizational adaptation', value: display(record.dominant_organizational_adaptation) },
        { label: 'Consecutive affected windows', value: display(record.consecutive_affected_windows) },
      ],
      economicDrivers: buildEconomicDrivers(record),
      organizationalLearning: {
        action: display(record.last_action_taken),
        outcome: display(record.observed_outcome),
        lesson,
      },
      history: [
        { label: 'Trend status', value: status },
        { label: 'Stability score', value: hasValue(record.stability_score) ? `${display(record.stability_score)}%` : MISSING },
        { label: 'Repeated reliability pattern', value: display(record.repeated_workforce_reliability_flag) },
        { label: 'Repeated adaptation pattern', value: display(record.repeated_adaptation_flag) },
        { label: 'Record updated', value: display(record.updated_at) },
      ],
      workforceEventCounts: record.workforce_event_counts,
      adaptationCounts: record.organizational_adaptation_counts,
    },
  }
}

function withTimeout<T>(
  operation: PromiseLike<T>,
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let settled = false

    const timeoutId = window.setTimeout(() => {
      if (settled) return
      settled = true
      reject(new Error('REQUEST_TIMEOUT'))
    }, timeoutMs)

    Promise.resolve(operation).then(
      (value) => {
        if (settled) return
        settled = true
        window.clearTimeout(timeoutId)
        resolve(value)
      },
      () => {
        if (settled) return
        settled = true
        window.clearTimeout(timeoutId)
        reject(new Error('REQUEST_FAILED'))
      },
    )
  })
}

async function safelySignOut() {
  try {
    await withTimeout(supabase.auth.signOut())
  } catch {
    return
  }
}

export default function SSIWeeklyBriefPage() {
  const router = useRouter()
  const briefRef = useRef<HTMLElement | null>(null)
  const mountedRef = useRef(false)
  const recordRef = useRef<TrendRecord | null>(null)
  const printTimerRef = useRef<number | null>(null)

  const [authorized, setAuthorized] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [accessError, setAccessError] = useState<string | null>(null)
  const [accessAttempt, setAccessAttempt] = useState(0)

  const [unit, setUnit] = useState('Wing B')
  const [weekStart, setWeekStart] = useState('2026-03-01')
  const [weekEnd, setWeekEnd] = useState('2026-03-07')

  const [record, setRecord] = useState<TrendRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const [downloading, setDownloading] = useState(false)
  const [logoutInProgress, setLogoutInProgress] = useState(false)
  const [hideControlsForPrint, setHideControlsForPrint] = useState(false)

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false

      if (printTimerRef.current !== null) {
        window.clearTimeout(printTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    recordRef.current = record
  }, [record])

  const verifyAccess = useCallback(async () => {
    if (mountedRef.current) {
      setCheckingAccess(true)
      setAccessError(null)
      setAuthorized(false)
    }

    try {
      const sessionResult = await withTimeout(supabase.auth.getSession())

      if (!mountedRef.current) return

      if (sessionResult.error) {
        setAccessError(ACCESS_FAILURE)
        return
      }

      const session = sessionResult.data.session

      if (!session?.user) {
        router.replace('/ssi/login')
        return
      }

      if (!session.user.email_confirmed_at) {
        await safelySignOut()

        if (mountedRef.current) {
          router.replace('/ssi/login')
        }

        return
      }

      const roleResult = await withTimeout(
        supabase
          .from('user_roles')
          .select('role,status')
          .eq('user_id', session.user.id)
          .maybeSingle(),
      )

      if (!mountedRef.current) return

      if (roleResult.error) {
        setAccessError(ACCESS_FAILURE)
        return
      }

      const roleRecord = roleResult.data

      if (
        !roleRecord ||
        !allowedRoles.includes(roleRecord.role) ||
        !allowedStatuses.includes(roleRecord.status)
      ) {
        await safelySignOut()

        if (mountedRef.current) {
          router.replace('/ssi/login')
        }

        return
      }

      setAuthorized(true)
      setAccessError(null)
    } catch {
      if (mountedRef.current) {
        setAuthorized(false)
        setAccessError(ACCESS_FAILURE)
      }
    } finally {
      if (mountedRef.current) {
        setCheckingAccess(false)
      }
    }
  }, [router])

  useEffect(() => {
    void verifyAccess()
  }, [accessAttempt, verifyAccess])

  useEffect(() => {
    function beforePrint() {
      if (mountedRef.current) {
        setHideControlsForPrint(true)
      }
    }

    function afterPrint() {
      if (mountedRef.current) {
        setHideControlsForPrint(false)
      }
    }

    window.addEventListener('beforeprint', beforePrint)
    window.addEventListener('afterprint', afterPrint)

    return () => {
      window.removeEventListener('beforeprint', beforePrint)
      window.removeEventListener('afterprint', afterPrint)
    }
  }, [])

  async function handleLogout() {
    if (logoutInProgress) return

    setLogoutInProgress(true)

    try {
      await withTimeout(supabase.auth.signOut())
    } catch {
      return
    } finally {
      if (mountedRef.current) {
        setAuthorized(false)
        setCheckingAccess(false)
        setLogoutInProgress(false)
        router.replace('/ssi/login')
      }
    }
  }

  async function loadBrief() {
    if (loading) return

    if (!unit.trim() || !weekStart.trim() || !weekEnd.trim()) {
      setMessage('Enter Unit, Week Start, and Week End.')
      return
    }

    if (mountedRef.current) {
      setLoading(true)
      setMessage('')
      setLoadError(null)
    }

    try {
      const result = await withTimeout(
        supabase
          .from('ssi_trend_buffer')
          .select(TREND_BUFFER_SELECT)
          .eq('unit', unit.trim())
          .eq('window_start', weekStart.trim())
          .eq('window_end', weekEnd.trim())
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      )

      if (!mountedRef.current) return

      if (result.error) {
        setLoadError(
          recordRef.current ? REFRESH_LOAD_FAILURE : INITIAL_LOAD_FAILURE,
        )
        return
      }

      if (!result.data) {
        setRecord(null)
        setLoadError(null)
        setMessage(NO_RECORDS)
        return
      }

      setRecord(result.data as unknown as TrendRecord)
      setLoadError(null)
      setMessage('')
    } catch {
      if (mountedRef.current) {
        setLoadError(
          recordRef.current ? REFRESH_LOAD_FAILURE : INITIAL_LOAD_FAILURE,
        )
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }

  function retryAccess() {
    if (checkingAccess) return
    setAccessAttempt((current) => current + 1)
  }

  function returnToLogin() {
    router.replace('/ssi/login')
  }

  function printBrief() {
    if (!record || printTimerRef.current !== null) return

    setHideControlsForPrint(true)

    printTimerRef.current = window.setTimeout(() => {
      printTimerRef.current = null

      try {
        window.print()
      } finally {
        if (mountedRef.current) {
          setHideControlsForPrint(false)
        }
      }
    }, 50)
  }

  async function downloadPdf() {
    if (!briefRef.current || !record || downloading) return

    setDownloading(true)
    setMessage('Preparing PDF download...')

    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      if (!briefRef.current) {
        throw new Error('BRIEF_NOT_AVAILABLE')
      }

      const pageElements = Array.from(
        briefRef.current.querySelectorAll<HTMLElement>('.ssi-brief-page'),
      )

      if (pageElements.length === 0) {
        throw new Error('BRIEF_PAGES_NOT_AVAILABLE')
      }

      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      for (let index = 0; index < pageElements.length; index += 1) {
        const canvas = await html2canvas(pageElements[index], {
          scale: 2,
          backgroundColor: '#070707',
          useCORS: true,
        })

        const imageData = canvas.toDataURL('image/png')
        const imageRatio = canvas.width / canvas.height
        const pageRatio = pageWidth / pageHeight

        let imageWidth = pageWidth
        let imageHeight = pageHeight
        let x = 0
        let y = 0

        if (imageRatio > pageRatio) {
          imageHeight = pageWidth / imageRatio
          y = (pageHeight - imageHeight) / 2
        } else {
          imageWidth = pageHeight * imageRatio
          x = (pageWidth - imageWidth) / 2
        }

        if (index > 0) pdf.addPage()
        pdf.addImage(imageData, 'PNG', x, y, imageWidth, imageHeight)
      }

      pdf.save(
        `TSINAXA-Weekly-Stability-Brief-${unit.trim()}-${weekStart.trim()}-to-${weekEnd.trim()}.pdf`,
      )

      if (mountedRef.current) {
        setMessage('PDF downloaded.')
      }
    } catch {
      if (mountedRef.current) {
        setMessage(PDF_FAILURE)
      }
    } finally {
      if (mountedRef.current) {
        setDownloading(false)
      }
    }
  }

  const reportingStart = record?.window_start ?? weekStart
  const reportingEnd = record?.window_end ?? weekEnd

  const communication = useMemo(
    () => (record ? buildCommunication(record) : null),
    [record],
  )

  if (checkingAccess) {
    return (
    <>
      <style>{`
        @media print {
          html,
          body {
            background: #050505 !important;
            color: #fff8e7 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .ssi-weekly-brief-print,
          .ssi-weekly-brief-print * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          @page {
            size: A4 portrait;
            margin: 8mm;
          }

          .ssi-weekly-brief-print {
            background: #050505 !important;
            color: #fff8e7 !important;
          }

          .ssi-brief-page {
            width: 194mm !important;
            min-height: 277mm !important;
            margin: 0 auto !important;
            padding: 8mm !important;
            border-radius: 0 !important;
            box-sizing: border-box !important;
            break-after: page !important;
            page-break-after: always !important;
          }

          .ssi-brief-page:last-child {
            break-after: auto !important;
            page-break-after: auto !important;
          }
        }
      `}</style>

      <main style={styles.page}>
        <section style={styles.controls}>
          <p style={styles.eyebrow}>TSINAXA SSI • SECURE ACCESS</p>
          <h1 style={styles.title}>Verifying SSI Access</h1>
          <p style={styles.sub}>
            Checking authorized structural stability access...
          </p>
        </section>
           </main>
    </>
  )
}

  if (accessError || !authorized) {
    return (
      <main style={styles.page}>
        <section style={styles.controls}>
          <p style={styles.eyebrow}>TSINAXA SSI • SECURE ACCESS</p>
          <h1 style={styles.title}>SSI Access Verification</h1>
          <p style={styles.message}>{accessError ?? ACCESS_FAILURE}</p>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={retryAccess}
              disabled={checkingAccess}
              style={styles.button}
            >
              {checkingAccess ? 'Trying Again...' : 'Try Again'}
            </button>

            <button
              type="button"
              onClick={returnToLogin}
              disabled={checkingAccess}
              style={styles.secondaryButton}
            >
              Return to Login
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 8mm; }
          html, body {
            background: #050505 !important;
            color: #fff8e7 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .ssi-weekly-brief-print,
          .ssi-weekly-brief-print * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .ssi-brief-page {
            width: 194mm !important;
            min-height: 277mm !important;
            margin: 0 auto !important;
            padding: 8mm !important;
            border-radius: 0 !important;
            box-sizing: border-box !important;
            break-after: page !important;
            page-break-after: always !important;
          }
          .ssi-brief-page:last-child {
            break-after: auto !important;
            page-break-after: auto !important;
          }
        }
      `}</style>
      <section
        style={{
          ...styles.controls,
          display: hideControlsForPrint ? 'none' : 'block',
        }}
      >
        <div style={styles.topbar}>
          <div>
            <p style={styles.eyebrow}>
              TSINAXA SSI — Structural Stability Intelligence System
            </p>
            <h1 style={styles.title}>Weekly Stability Brief</h1>
            <p style={styles.sub}>
              Executive communication generated exclusively from persisted SSI
              trend-buffer intelligence.
            </p>
          </div>

          <button
            type="button"
            style={{
              ...styles.logoutButton,
              ...(logoutInProgress ? styles.disabledButton : {}),
            }}
            onClick={handleLogout}
            disabled={logoutInProgress}
          >
            {logoutInProgress ? 'Logging out...' : 'Logout'}
          </button>
        </div>

        <nav aria-label="TSINAXA SSI flow navigation" style={styles.flowNav}>
          <div style={styles.flowNavHeader}>
            <span style={styles.flowNavTitle}>SSI Flow</span>
            <span style={styles.flowNavRule} />
            <span style={styles.flowNavCaption}>
              Assignments → Events → Trend Buffer → Executive Dashboard → Weekly
              Brief
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

                {index < ssiFlow.length - 1 ? (
                  <span style={styles.flowArrow}>→</span>
                ) : null}
              </div>
            ))}
          </div>
        </nav>

        <div style={styles.grid}>
          <Input
            label="Unit"
            value={unit}
            onChange={setUnit}
            placeholder="Wing B"
          />
          <Input
            label="Week Start"
            value={weekStart}
            onChange={setWeekStart}
            placeholder="2026-03-01"
          />
          <Input
            label="Week End"
            value={weekEnd}
            onChange={setWeekEnd}
            placeholder="2026-03-07"
          />
        </div>

        <div style={styles.actions}>
          <button
            type="button"
            onClick={loadBrief}
            disabled={
              loading ||
              !unit.trim() ||
              !weekStart.trim() ||
              !weekEnd.trim()
            }
            style={styles.button}
          >
            {loading ? 'Loading...' : 'Generate Brief'}
          </button>

          <button
            type="button"
            onClick={printBrief}
            disabled={!record || loading}
            style={styles.button}
          >
            Print
          </button>

          <button
            type="button"
            onClick={downloadPdf}
            disabled={!record || downloading || loading}
            style={styles.button}
          >
            {downloading ? 'Preparing PDF...' : 'Download PDF'}
          </button>
        </div>

        {loadError ? (
          <div style={styles.statusPanel}>
            <p style={styles.message}>{loadError}</p>

            <button
              type="button"
              onClick={loadBrief}
              disabled={loading}
              style={styles.secondaryButton}
            >
              {loading ? 'Trying Again...' : 'Try Again'}
            </button>
          </div>
        ) : null}

        {message ? <p style={styles.message}>{message}</p> : null}
      </section>

      {record && communication ? (
        <article className="ssi-weekly-brief-print" style={styles.brief} ref={briefRef}>
          <section className="ssi-brief-page ssi-brief-page-one" style={styles.briefPage}>
            <header style={styles.header}>
              <p style={styles.eyebrow}>TSINAXA™ EXECUTIVE SUMMARY</p>
              <h2 style={styles.heading}>Weekly Structural Stability Brief</h2>
              <div style={styles.identityGrid}>
                <DataLine label="Unit" value={communication.identity.unit} />
                <DataLine label="Reporting Period" value={communication.identity.reportingPeriod} />
                <DataLine label="Prepared by" value={communication.identity.preparedBy} />
              </div>
            </header>

            <section style={styles.narrativeSection}>
              <p style={styles.sectionKicker}>Executive Summary</p>
              <p style={styles.leadNarrative}>{communication.situationAssessment}</p>
            </section>

            <section style={styles.conditionStatement}>
              <p style={styles.sectionKicker}>Organizational Condition Statement</p>
              <p style={styles.conditionText}>{communication.conditionStatement}</p>
            </section>

            <section style={styles.openSection}>
              <h3 style={styles.openSectionTitle}>Executive Assessment</h3>
              <div style={styles.assessmentTable}>
                {communication.executiveAssessment.map((item) => (
                  <div key={item.label} style={styles.assessmentRow}>
                    <span style={styles.assessmentLabel}>{item.label}</span>
                    <strong style={styles.assessmentValue}>{item.value}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section style={styles.openSection}>
              <h3 style={styles.openSectionTitle}>Structural Story</h3>
              <p style={styles.structuralStoryNarrative}>
                {communication.structuralStory.narrative}
              </p>
            </section>

            <section style={styles.openSection}>
              <h3 style={styles.openSectionTitle}>Organizational Consequences</h3>
              <div style={styles.consequenceList}>
                {communication.consequences.map((item) => (
                  <div key={item.title} style={styles.consequenceItem}>
                    <h4 style={styles.consequenceLabel}>{item.title}</h4>
                    <p style={styles.consequenceLine}>{item.narrative}</p>
                  </div>
                ))}
              </div>
            </section>

            <section style={styles.openSection}>
              <h3 style={styles.openSectionTitle}>Leadership Priorities</h3>
              <div style={styles.priorityList}>
                {communication.leadershipPriorities.map((priority) => (
                  <div key={priority.rank} style={styles.priorityRow}>
                    <span style={styles.priorityNumber}>{priority.rank}</span>
                    <div>
                      <p style={styles.priorityAction}>{priority.action}</p>
                      <p style={styles.priorityBenefit}><strong>Expected benefit:</strong> {priority.benefit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={styles.implicationSection}>
              <p style={styles.sectionKicker}>Executive Implication</p>
              <p style={styles.implicationText}>{communication.executiveImplication}</p>
            </section>

            <section style={styles.outlookSection}>
              <h3 style={styles.openSectionTitle}>Organizational Stability Outlook</h3>
              <p style={styles.bodyNarrative}>{communication.stabilityOutlook}</p>
            </section>

            <section style={styles.confidenceSection}>
              <div>
                <span style={styles.confidenceLabel}>Executive Confidence</span>
                <strong style={styles.confidenceValue}>{communication.confidence.level}</strong>
              </div>
              <p style={styles.confidenceRationale}>{communication.confidence.rationale}</p>
            </section>
          </section>

          <section className="ssi-brief-page ssi-brief-page-two" style={styles.briefPage}>
            <header style={styles.pageTwoHeader}>
              <p style={styles.eyebrow}>TSINAXA SSI • SUPPORTING EVIDENCE</p>
              <h2 style={styles.pageTwoTitle}>Evidence Behind the Executive Assessment</h2>
              <p style={styles.pageTwoMeta}>{communication.identity.unit} • {communication.identity.reportingPeriod}</p>
            </header>

            <section style={styles.evidenceSection}>
              <h3 style={styles.openSectionTitle}>Core Evidence</h3>
              <div style={styles.evidenceTable}>
                {communication.evidence.coreMetrics.map((item) => (
                  <div key={item.label} style={styles.evidenceRow}>
                    <span>{item.label}</span><strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section style={styles.evidenceSection}>
              <h3 style={styles.openSectionTitle}>Structural Context</h3>
              <div style={styles.twoColumnEvidence}>
                {communication.evidence.structuralContext.map((item) => (
                  <DataLine key={item.label} label={item.label} value={item.value} />
                ))}
              </div>
            </section>

            <section style={styles.evidenceSection}>
              <h3 style={styles.openSectionTitle}>Workforce Sustainability Profile</h3>
              <div style={styles.twoColumnEvidence}>
                {communication.evidence.workforceProfile.map((item) => (
                  <DataLine key={item.label} label={item.label} value={item.value} />
                ))}
              </div>
              <div style={styles.profileColumns}>
                <ProfileTable title="Workforce Events" values={communication.evidence.workforceEventCounts} emptyMessage="No workforce event profile was persisted." />
                <ProfileTable title="Organizational Adaptations" values={communication.evidence.adaptationCounts} emptyMessage="No organizational adaptation profile was persisted." />
              </div>
            </section>

            <section style={styles.evidenceSection}>
              <h3 style={styles.openSectionTitle}>Economic Exposure Drivers</h3>
              <ul style={styles.economicList}>
                {communication.evidence.economicDrivers.map((driver) => <li key={driver}>{driver}</li>)}
              </ul>
            </section>

            <section style={styles.evidenceSection}>
              <h3 style={styles.openSectionTitle}>Organizational Learning Assessment</h3>
              <DataLine label="Leadership response" value={communication.evidence.organizationalLearning.action} />
              <DataLine label="Observed result" value={communication.evidence.organizationalLearning.outcome} />
              <p style={styles.learningStatement}>{communication.evidence.organizationalLearning.lesson}</p>
            </section>

            <section style={styles.evidenceSection}>
              <h3 style={styles.openSectionTitle}>Historical and Evidence Context</h3>
              <div style={styles.twoColumnEvidence}>
                {communication.evidence.history.map((item) => (
                  <DataLine key={item.label} label={item.label} value={item.value} />
                ))}
              </div>
              <p style={styles.evidenceBasis}><strong>Assessment basis:</strong> {communication.confidence.evidenceBasis.join(' • ')}</p>
            </section>

            <footer style={styles.footer}>No Names. No Blame. No Surveillance. Only Structural Signals.</footer>
          </section>
        </article>
      ) : null}
    </main>
  )
}
function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label style={styles.label}>
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />
    </label>
  )
}

function BriefSection({
  title,
  children,
  featured = false,
}: {
  title: string
  children: ReactNode
  featured?: boolean
}) {
  return (
    <section
      style={{
        ...styles.briefSection,
        ...(featured ? styles.featuredSection : {}),
      }}
    >
      <h3 style={styles.sectionTitle}>{title}</h3>
      {children}
    </section>
  )
}

function DataLine({ label, value }: { label: string; value: unknown }) {
  return (
    <p style={styles.text}>
      <strong style={styles.dataLabel}>{label}:</strong> {display(value)}
    </p>
  )
}

function StatusTile({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.statusTile}>
      <span style={styles.tileLabel}>{label}</span>
      <strong style={styles.statusValue}>{value}</strong>
    </div>
  )
}

function ConditionCard({ title, text }: { title: string; text: string }) {
  return (
    <div style={styles.conditionCard}>
      <h4 style={styles.cardTitle}>{title}</h4>
      <p style={styles.cardText}>{text}</p>
    </div>
  )
}


function ProfileTable({
  title,
  values,
  emptyMessage,
}: {
  title: string
  values: Record<string, number> | null
  emptyMessage: string
}) {
  const entries = values
    ? Object.entries(values).sort(([, left], [, right]) => right - left)
    : []

  return (
    <div style={styles.profilePanel}>
      <h4 style={styles.smallHeading}>{title}</h4>
      {entries.length > 0 ? (
        <div style={styles.profileTable}>
          {entries.map(([label, count]) => (
            <div key={label} style={styles.profileRow}>
              <span style={styles.profileLabel}>{label}</span>
              <strong style={styles.profileValue}>{count}</strong>
            </div>
          ))}
        </div>
      ) : (
        <p style={styles.missingText}>{emptyMessage}</p>
      )}
    </div>
  )
}

function ActionList({
  title,
  actions,
  emptyText,
}: {
  title: string
  actions: string[]
  emptyText: string
}) {
  return (
    <div style={styles.actionPanel}>
      <h4 style={styles.smallHeading}>{title}</h4>
      {actions.length > 0 ? (
        <ol style={styles.list}>
          {actions.map((action) => (
            <li key={action} style={styles.actionItem}>
              {action}
            </li>
          ))}
        </ol>
      ) : (
        <p style={styles.missingText}>{emptyText}</p>
      )}
    </div>
  )
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.metricTile}>
      <span style={styles.tileLabel}>{label}</span>
      <strong style={styles.metricValue}>{value}</strong>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: '100vh', background: '#050505', color: '#fff8e7', padding: '28px', fontFamily: 'Inter, Arial, sans-serif' },
  controls: { maxWidth: '980px', margin: '0 auto 20px', padding: '24px', borderRadius: '20px', background: '#090807', border: '1px solid rgba(214,178,94,0.28)' },
  brief: { maxWidth: '980px', margin: '0 auto 20px', background: '#050505' },
  briefPage: { minHeight: '1120px', padding: '28px', borderRadius: '20px', background: '#070707', border: '1px solid rgba(214,178,94,0.28)', marginBottom: '18px', boxSizing: 'border-box' },
  topbar: { display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'start' },
  logoutButton: { border: '1px solid rgba(214,178,94,0.42)', background: '#11100d', color: '#d6b25e', borderRadius: '999px', padding: '10px 18px', fontWeight: 900, cursor: 'pointer' },
  disabledButton: { cursor: 'not-allowed', opacity: 0.58 },
  eyebrow: { color: '#d6b25e', fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 },
  title: { color: '#d6b25e', margin: '8px 0', fontSize: '32px' },
  heading: { color: '#d6b25e', margin: '7px 0 14px', fontSize: '28px', lineHeight: 1.18 },
  smallHeading: { color: '#d6b25e', margin: '0 0 8px', fontSize: '14px' },
  sub: { color: '#cfc7b5', margin: 0, lineHeight: 1.5 },
  flowNav: { border: '1px solid rgba(214,178,94,0.28)', background: '#090807', borderRadius: '18px', padding: '14px', margin: '18px 0 8px' },
  flowNavHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' },
  flowNavTitle: { color: '#d6b25e', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: '12px' },
  flowNavRule: { height: '1px', flex: 1, background: 'rgba(214,178,94,0.22)' },
  flowNavCaption: { color: '#cfc7b5', fontSize: '12px', fontWeight: 700 },
  flowSteps: { display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '10px' },
  flowStepWrap: { display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 },
  flowStep: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#cfc7b5', border: '1px solid rgba(214,178,94,0.18)', background: '#11100d', borderRadius: '14px', padding: '12px', minWidth: 0 },
  flowStepActive: { border: '1px solid rgba(214,178,94,0.58)', background: 'rgba(214,178,94,0.14)', color: '#fff8e7', boxShadow: 'inset 3px 0 0 #d6b25e' },
  flowStepIndex: { display: 'grid', placeItems: 'center', width: '26px', height: '26px', borderRadius: '999px', background: 'rgba(214,178,94,0.16)', color: '#d6b25e', fontWeight: 900, flexShrink: 0 },
  flowStepText: { display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 },
  flowArrow: { color: '#9f8142', fontWeight: 900, flexShrink: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginTop: '20px' },
  label: { display: 'grid', gap: '8px', fontSize: '13px', color: '#cfc7b5' },
  input: { padding: '13px', borderRadius: '12px', border: '1px solid rgba(214,178,94,0.28)', background: '#111827', color: '#fff8e7', fontSize: '15px' },
  actions: { display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '18px' },
  button: { padding: '11px 18px', border: 0, borderRadius: '999px', background: '#d6b25e', color: '#050505', fontWeight: 800, cursor: 'pointer' },
  secondaryButton: { padding: '11px 18px', border: '1px solid rgba(214,178,94,0.42)', borderRadius: '999px', background: '#11100d', color: '#d6b25e', fontWeight: 800, cursor: 'pointer' },
  message: { marginTop: '14px', color: '#d6b25e', lineHeight: 1.5 },
  statusPanel: { marginTop: '14px', padding: '14px', borderRadius: '14px', border: '1px solid rgba(214,178,94,0.28)', background: '#11100d' },
  header: { marginBottom: '18px', paddingBottom: '16px', borderBottom: '1px solid rgba(214,178,94,0.28)' },
  identityGrid: { display: 'grid', gridTemplateColumns: '1fr 1.35fr 1fr', gap: '10px' },
  briefSection: { marginBottom: '10px', padding: '14px', borderRadius: '14px', background: '#11100d', border: '1px solid rgba(214,178,94,0.18)', breakInside: 'avoid' },
  featuredSection: { border: '1px solid rgba(214,178,94,0.46)', background: 'linear-gradient(180deg, rgba(214,178,94,0.11), #11100d 34%)' },
  sectionTitle: { color: '#d6b25e', margin: '0 0 9px', fontSize: '15px', letterSpacing: '0.03em' },
  text: { color: '#cfc7b5', lineHeight: 1.58, margin: '4px 0', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontSize: '12.5px' },
  dataLabel: { color: '#fff8e7' },
  statusGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  statusTile: { border: '1px solid rgba(214,178,94,0.24)', borderRadius: '12px', padding: '11px', background: '#0b0b0a' },
  tileLabel: { display: 'block', color: '#9f8142', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '9.5px', fontWeight: 900, marginBottom: '5px' },
  statusValue: { color: '#fff8e7', fontSize: '18px' },
  executiveHeadline: { color: '#fff8e7', fontSize: '20px', lineHeight: 1.3, margin: '13px 0 7px' },
  executiveSummary: { color: '#cfc7b5', lineHeight: 1.5, margin: 0, fontSize: '13px' },
  conditionGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' },
  conditionCard: { borderLeft: '3px solid #d6b25e', borderRadius: '10px', padding: '10px 11px', background: '#0b0b0a' },
  cardTitle: { color: '#fff8e7', margin: 0, fontSize: '12.5px' },
  cardText: { color: '#cfc7b5', margin: '5px 0 0', lineHeight: 1.42, fontSize: '11.5px' },
  riskGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '9px' },
  riskCard: { border: '1px solid rgba(214,178,94,0.22)', borderRadius: '12px', padding: '11px', background: '#0b0b0a' },
  riskHeader: { display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'start' },
  priorityBadge: { color: '#050505', background: '#d6b25e', borderRadius: '999px', padding: '3px 7px', fontSize: '8px', fontWeight: 900, whiteSpace: 'nowrap' },
  evidenceText: { color: '#9f9a90', margin: '7px 0 0', lineHeight: 1.35, fontSize: '10.5px' },
  actionColumns: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' },
  actionPanel: { border: '1px solid rgba(214,178,94,0.2)', borderRadius: '12px', padding: '11px', background: '#0b0b0a' },
  list: { color: '#cfc7b5', paddingLeft: '19px', margin: '4px 0 0', lineHeight: 1.4, fontSize: '11.5px' },
  actionItem: { marginBottom: '5px' },
  missingText: { color: '#9f9a90', fontSize: '11px', lineHeight: 1.4, margin: 0 },
  pageTwoHeader: { marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(214,178,94,0.28)' },
  pageTwoTitle: { color: '#d6b25e', fontSize: '21px', margin: '5px 0 3px' },
  pageTwoMeta: { color: '#cfc7b5', margin: 0, fontSize: '11px' },
  outlookGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '9px' },
  learningStatement: { color: '#fff8e7', borderLeft: '3px solid #d6b25e', paddingLeft: '10px', lineHeight: 1.45, margin: '9px 0 0', fontSize: '12px' },
  metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' },
  metricTile: { border: '1px solid rgba(214,178,94,0.2)', borderRadius: '10px', padding: '9px', background: '#0b0b0a' },
  metricValue: { color: '#fff8e7', fontSize: '14px', overflowWrap: 'anywhere' },
  contextGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '16px', rowGap: '2px' },
  profileColumns: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' },
  profilePanel: { border: '1px solid rgba(214,178,94,0.2)', borderRadius: '12px', padding: '11px', background: '#0b0b0a' },
  profileTable: { display: 'grid', gap: '5px' },
  profileRow: { display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'center', paddingBottom: '5px', borderBottom: '1px solid rgba(214,178,94,0.12)' },
  profileLabel: { color: '#cfc7b5', fontSize: '10.5px', overflowWrap: 'anywhere' },
  profileValue: { color: '#fff8e7', fontSize: '11.5px' },
  footer: { marginTop: '36px', paddingTop: '18px', borderTop: '1px solid rgba(214,178,94,0.28)', textAlign: 'center', color: '#d6b25e', fontWeight: 800, fontSize: '12px' },
  narrativeSection: { marginBottom: '16px', padding: '17px 18px', borderLeft: '4px solid #d6b25e', borderRadius: '10px', background: 'rgba(214,178,94,0.055)', breakInside: 'avoid' },
  sectionKicker: { margin: '0 0 8px', color: '#d6b25e', fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' },
  leadNarrative: { margin: 0, color: '#fff8e7', fontSize: '14.5px', lineHeight: 1.62, fontWeight: 500, maxWidth: '900px' },
  conditionStatement: { margin: '0 0 18px', padding: '13px 16px', border: '1px solid rgba(214,178,94,0.28)', borderLeft: '4px solid #d6b25e', borderRadius: '10px', background: '#0b0b0a', breakInside: 'avoid' },
  conditionText: { margin: 0, color: '#fff8e7', fontSize: '13px', lineHeight: 1.5, fontWeight: 700 },
  openSection: { marginBottom: '18px', paddingBottom: '17px', borderBottom: '1px solid rgba(214,178,94,0.18)', breakInside: 'avoid' },
  openSectionTitle: { margin: '0 0 11px', color: '#d6b25e', fontSize: '17px', letterSpacing: '0.02em' },
  bodyNarrative: { margin: 0, color: '#cfc7b5', fontSize: '12.5px', lineHeight: 1.6, maxWidth: '900px' },
  assessmentTable: { display: 'grid', borderTop: '1px solid rgba(214,178,94,0.22)' },
  assessmentRow: { display: 'grid', gridTemplateColumns: 'minmax(190px, 0.8fr) 1.4fr', gap: '20px', alignItems: 'center', minHeight: '34px', padding: '12px 0', borderBottom: '1px solid rgba(214,178,94,0.15)' },
  assessmentLabel: { color: '#d6b25e', fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.025em' },
  assessmentValue: { color: '#fff8e7', fontSize: '11.5px', lineHeight: 1.4, textAlign: 'right', overflowWrap: 'anywhere' },
  structuralStoryNarrative: { margin: 0, color: '#fff8e7', fontSize: '13.5px', lineHeight: 1.62, maxWidth: '900px' },
  consequenceList: { display: 'grid', gap: '15px' },
  consequenceItem: { display: 'grid', gap: '5px' },
  consequenceLine: { margin: 0, color: '#cfc7b5', fontSize: '12.5px', lineHeight: 1.58 },
  consequenceLabel: { margin: 0, color: '#d6b25e', fontSize: '12px', fontWeight: 900, letterSpacing: '0.025em' },
  priorityList: { display: 'grid', gap: '12px', padding: '13px 14px', border: '1px solid rgba(214,178,94,0.2)', borderRadius: '12px', background: '#0b0b0a' },
  priorityRow: { display: 'grid', gridTemplateColumns: '30px 1fr', gap: '12px', alignItems: 'start' },
  priorityNumber: { display: 'grid', placeItems: 'center', width: '28px', height: '28px', borderRadius: '999px', border: '1px solid rgba(214,178,94,0.55)', color: '#d6b25e', fontWeight: 900, fontSize: '12px' },
  priorityAction: { margin: '0 0 3px', color: '#fff8e7', fontSize: '12.5px', lineHeight: 1.4, fontWeight: 700 },
  priorityBenefit: { margin: 0, color: '#cfc7b5', fontSize: '11px', lineHeight: 1.4 },
  implicationSection: { marginBottom: '19px', padding: '21px 22px', borderLeft: '5px solid #d6b25e', background: 'rgba(214,178,94,0.075)', breakInside: 'avoid' },
  implicationText: { margin: 0, color: '#fff8e7', fontSize: '15.5px', lineHeight: 1.62, fontWeight: 800 },
  outlookSection: { marginBottom: '16px', padding: '14px 16px', background: '#0b0b0a', border: '1px solid rgba(214,178,94,0.2)', borderLeft: '3px solid rgba(214,178,94,0.5)', borderRadius: '10px', breakInside: 'avoid' },
  confidenceSection: { display: 'grid', gridTemplateColumns: '220px 1fr', gap: '32px', alignItems: 'center', padding: '22px 24px', border: '1px solid rgba(214,178,94,0.26)', borderRadius: '10px', background: '#0b0b0a', breakInside: 'avoid' },
  confidenceLabel: { display: 'block', color: '#9f8142', fontSize: '10px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' },
  confidenceValue: { display: 'block', marginTop: '12px', color: '#fff8e7', fontSize: '38px', lineHeight: 0.98, fontWeight: 900, letterSpacing: '0.035em' },
  confidenceRationale: { margin: '4px 0 0', color: '#aaa395', fontSize: '10.75px', lineHeight: 1.58 },
  evidenceSection: { marginBottom: '18px', paddingBottom: '16px', borderBottom: '1px solid rgba(214,178,94,0.18)', breakInside: 'avoid' },
  evidenceTable: { display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '26px' },
  evidenceRow: { display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', padding: '8px 0', borderBottom: '1px solid rgba(214,178,94,0.12)', color: '#cfc7b5', fontSize: '11.5px' },
  twoColumnEvidence: { display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '24px', rowGap: '2px' },
  economicList: { margin: 0, paddingLeft: '20px', color: '#cfc7b5', fontSize: '11.5px', lineHeight: 1.55 },
  evidenceBasis: { margin: '10px 0 0', paddingTop: '8px', borderTop: '1px solid rgba(214,178,94,0.14)', color: '#cfc7b5', fontSize: '11px', lineHeight: 1.45 },

}