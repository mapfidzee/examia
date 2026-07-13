'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase'

type ShiftTypeFilter = 'ALL' | 'DAY' | 'NIGHT'
type FragilityLevel = 'LOW' | 'MODERATE' | 'HIGH'

type ReliabilityPatternDirection =
  | 'NEW'
  | 'REPEATING'
  | 'INCREASING'
  | 'UNCHANGED'
  | 'DECREASING'
  | 'NOT_PRESENT'

type WorkforceReliabilityStatus =
  | 'STABLE'
  | 'WATCH'
  | 'STRAINING'
  | 'DETERIORATING'
  | 'RECOVERING'
  | 'NO_DATA'

type AssignmentRow = {
  unit: string
  role_pool: string
  shift_type: string
  assignment_date: string
  baseline_design: string
  load_modifier: number | null
  complexity_flag: boolean | null
  starting_strain_signal: string | null
}

type EventRow = {
  unit: string
  role_pool: string
  shift_type: string
  event_date: string
  timing_category: string
  event_type: string
  buffer_response: string | null
  stability_force: string | null
  event_intensity: string | null
  buffer_cost_band: string | null
}

type TrendRow = {
  trendWindow: string
  unit: string
  rolePool: string
  shiftType: string
  baselineDesign: string
  assignmentLoadSkew: number
  pctHigher: number
  totalStabilityEvents: number
  highIntensityEventCount: number
  lateOrLastMinuteEventCount: number
  bufferUseProfile: string
  repeatedBufferDepletionFlag: boolean
  dominantStabilityForces: string
  trendStatus: string
  trendStatusRule: string
  leadershipActionCue: string
}

type HistoricalTrendRecord = {
  id: string
  unit: string
  window_start: string
  window_end: string
  trend_status: string | null
  stability_score: number | null
  cost_pressure_signal: string | null
  fragility_level: string | null
  last_action_taken: string | null
  observed_outcome: string | null
  updated_at: string | null
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
}

type LoadedWindow = {
  unit: string
  windowStart: string
  windowEnd: string
  shiftType: ShiftTypeFilter
}

type WorkforceReliabilityOutput = {
  workforce_event_counts: Record<string, number>
  organizational_adaptation_counts: Record<string, number>
  staffing_instability_event_count: number
  buffer_response_count: number
  high_cost_buffer_response_count: number
  dominant_workforce_event_type: string | null
  dominant_organizational_adaptation: string | null
  repeated_workforce_event_type: string | null
  repeated_organizational_adaptation: string | null
  workforce_reliability_status: WorkforceReliabilityStatus
  reliability_pattern_direction: ReliabilityPatternDirection
  repeated_workforce_reliability_flag: boolean
  repeated_adaptation_flag: boolean
  consecutive_affected_windows: number
  workforce_reliability_summary: string | null
  workforce_consequence_outlook: string | null
}

const allowedRoles = ['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']
const allowedStatuses = ['ACTIVE']

const ACCESS_TIMEOUT_MS = 12000
const LOAD_TIMEOUT_MS = 20000
const SAVE_TIMEOUT_MS = 20000

const ACCESS_FAILURE_MESSAGE =
  'SSI could not verify access. Check the connection and try again.'

const LOAD_FAILURE_MESSAGE =
  'The reporting window could not be loaded. Previously loaded evidence has not been changed. Check the connection and try again.'

const SAVE_FAILURE_MESSAGE =
  'The trend buffer could not be saved. No persisted reporting window was changed. Check the connection and try again.'

const DEFAULT_ACTION = 'No leadership action persisted.'
const DEFAULT_OUTCOME = 'No observed outcome persisted.'
const NOT_CAPTURED = 'Not captured in current trend buffer.'

const leadershipActionOptions = [
  DEFAULT_ACTION,
  'Reviewed recurring late movement.',
  'Adjusted coverage design.',
  'Added contingency coverage.',
  'Modified assignment design.',
  'Escalated to leadership review.',
  'Reviewed buffer dependence.',
  'Protected affected role pool.',
  'Monitored next reporting window.',
  'Maintained current posture.',
]

const observedOutcomeOptions = [
  DEFAULT_OUTCOME,
  'Event frequency reduced.',
  'Event frequency unchanged.',
  'Event frequency increased.',
  'Buffer use reduced.',
  'Buffer use unchanged.',
  'Fragility reduced.',
  'Fragility shifted to another role pool.',
  'Fragility shifted to another shift.',
  'Instability recurrence observed.',
  'No observable change.',
]

const ssiFlow = [
  {
    label: 'Assignments',
    href: '/ssi/assignments',
    note: 'ODM evidence acquisition',
    active: false,
  },
  {
    label: 'Events',
    href: '/ssi/events',
    note: 'Operational stability evidence',
    active: false,
  },
  {
    label: 'Trend Buffer',
    href: '/ssi/dashboard',
    note: 'Longitudinal aggregation',
    active: true,
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
    active: false,
  },
]

const initialFilters = {
  unit: 'Wing B',
  windowStart: '2026-04-06',
  windowEnd: '2026-04-06',
  shiftType: 'DAY' as ShiftTypeFilter,
}

const staffingInstabilityEventTypes = new Set([
  'Late shift cancellation',
  'Short-notice absence',
  'Scheduled shift converted to on-call',
  'On-call activation without use',
  'Delayed arrival',
  'Call-out',
  'No-show',
  'Coverage gap',
  'Unable to secure replacement',
  'Late replacement secured',
  'Mandatory overtime',
  'Agency staffing required',
  'Float staff required',
  'Assignment redistribution',
])

const absenceOrCancellationEvents = new Set([
  'Short-notice absence',
  'Late shift cancellation',
  'Call-out',
  'No-show',
])

const replacementOrCoverageEvents = new Set([
  'Unable to secure replacement',
  'Coverage gap',
])

const redistributionEvents = new Set(['Assignment redistribution'])

const contingencyAdaptations = new Set([
  'Overtime used',
  'Mandatory overtime used',
  'Agency staff deployed',
  'Float staff deployed',
])

const localSupportAdaptations = new Set([
  'Peer-to-peer support',
  'Charge nurse coverage',
  'Supervisor support provided',
])

async function withTimeout<T>(
  operation: PromiseLike<T>,
  timeoutMs: number,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const timeout = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('SSI_OPERATION_TIMEOUT'))
    }, timeoutMs)
  })

  try {
    return await Promise.race([Promise.resolve(operation), timeout])
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}

function isValidCalendarDate(value: string) {
  const normalized = value.trim()
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (!match) {
    return false
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    year < 1 ||
    month < 1 ||
    month > 12 ||
    day < 1
  ) {
    return false
  }

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()

  if (day > daysInMonth) {
    return false
  }

  const reconstructed = new Date(Date.UTC(year, month - 1, day))

  return (
    reconstructed.getUTCFullYear() === year &&
    reconstructed.getUTCMonth() === month - 1 &&
    reconstructed.getUTCDate() === day
  )
}

function normalizeBaselineDesign(value: string) {
  return String(value ?? '').trim()
}

function normalizeRolePool(value: string | null | undefined) {
  const text = String(value ?? '').trim().toUpperCase()

  if (text.startsWith('CNA')) return 'CNA'
  if (text.startsWith('LPN')) return 'LPN'
  if (text.startsWith('RN')) return 'RN'

  return text || NOT_CAPTURED
}

function skewStatus(value: number) {
  return value > 0 ? 'SKEWED' : 'NOT SKEWED'
}

function isLate(value: string | null) {
  const text = String(value ?? '').toUpperCase()

  return (
    text.includes('PRE_SHIFT') ||
    text.includes('PRE-SHIFT') ||
    text.includes('LATE') ||
    text.includes('LAST_MINUTE') ||
    text.includes('LAST MINUTE')
  )
}

function bufferUsed(value: string | null) {
  const text = String(value ?? '').trim().toUpperCase()

  if (!text) return false
  if (text === 'NONE') return false
  if (text.includes('NO RESPONSE')) return false
  if (text.includes('NO BUFFER')) return false
  if (text.includes('NOT USED')) return false

  return true
}

function dominant(values: string[]) {
  const counts = values
    .filter(Boolean)
    .reduce<Record<string, number>>((accumulator, value) => {
      const cleaned = value.trim()
      accumulator[cleaned] = (accumulator[cleaned] ?? 0) + 1
      return accumulator
    }, {})

  return (
    Object.entries(counts).sort(
      (first, second) =>
        second[1] - first[1] || first[0].localeCompare(second[0]),
    )[0]?.[0] ?? 'NONE'
  )
}

function dominantFromCounts(
  counts: Record<string, number>,
): string | null {
  return (
    Object.entries(counts)
      .filter(([, count]) => count > 0)
      .sort(
        (first, second) =>
          second[1] - first[1] || first[0].localeCompare(second[0]),
      )[0]?.[0] ?? null
  )
}

function countValues(values: Array<string | null | undefined>) {
  return values.reduce<Record<string, number>>((accumulator, value) => {
    const normalized = String(value ?? '').trim()

    if (!normalized) {
      return accumulator
    }

    accumulator[normalized] = (accumulator[normalized] ?? 0) + 1
    return accumulator
  }, {})
}

function sumCounts(counts: Record<string, number>) {
  return Object.values(counts).reduce((sum, count) => sum + count, 0)
}

function filterCounts(
  counts: Record<string, number>,
  allowed: Set<string>,
) {
  return Object.entries(counts).reduce<Record<string, number>>(
    (accumulator, [key, value]) => {
      if (allowed.has(key) && value > 0) {
        accumulator[key] = value
      }

      return accumulator
    },
    {},
  )
}

function bufferProfile(bufferCount: number, highCostCount: number) {
  if (highCostCount >= 2 || bufferCount >= 4) return 'HIGH'
  if (highCostCount >= 1 || bufferCount >= 2) return 'MODERATE'
  if (bufferCount >= 1) return 'LOW'
  return 'NONE'
}

function costPressureSignal(bufferCount: number, highCostCount: number) {
  if (highCostCount >= 2 || bufferCount >= 4) return 'HIGH'
  if (highCostCount >= 1 || bufferCount >= 1) return 'MODERATE'
  return 'NONE'
}

function repeatedBufferDepletion(bufferCount: number, highCostCount: number) {
  return bufferCount >= 3 || highCostCount >= 2
}

function eventStats(events: EventRow[]) {
  const highIntensityEventCount = events.filter(
    (row) =>
      String(row.event_intensity ?? '').toUpperCase() === 'HIGH',
  ).length

  const lateOrLastMinuteEventCount = events.filter((row) =>
    isLate(row.timing_category),
  ).length

  const bufferCount = events.filter((row) =>
    bufferUsed(row.buffer_response),
  ).length

  const highCostCount = events.filter(
    (row) => row.buffer_cost_band === 'HIGH_BUFFER_COST',
  ).length

  const profile = bufferProfile(bufferCount, highCostCount)
  const repeatedFlag = repeatedBufferDepletion(
    bufferCount,
    highCostCount,
  )

  return {
    totalStabilityEvents: events.length,
    highIntensityEventCount,
    lateOrLastMinuteEventCount,
    bufferCount,
    highCostCount,
    bufferUseProfile: profile,
    costPressureSignal: costPressureSignal(
      bufferCount,
      highCostCount,
    ),
    repeatedBufferDepletionFlag: repeatedFlag,
    dominantStabilityForces: dominant(
      events.map((row) => row.stability_force ?? ''),
    ),
    affectedRole: dominant(
      events.map((row) => normalizeRolePool(row.role_pool)),
    ),
    affectedShift: dominant(
      events.map((row) => row.shift_type),
    ),
  }
}

function trendStatus(
  row: Omit<
    TrendRow,
    'trendStatus' | 'trendStatusRule' | 'leadershipActionCue'
  >,
) {
  if (
    row.bufferUseProfile === 'HIGH' ||
    row.repeatedBufferDepletionFlag
  ) {
    return 'UNSTABLE'
  }

  if (
    row.totalStabilityEvents >= 2 ||
    row.highIntensityEventCount >= 1 ||
    row.bufferUseProfile === 'MODERATE' ||
    row.bufferUseProfile === 'LOW' ||
    row.assignmentLoadSkew >= 2 ||
    row.pctHigher >= 50
  ) {
    return 'STRAINING'
  }

  return 'STABLE'
}

function trendRule(
  row: Omit<
    TrendRow,
    'trendStatus' | 'trendStatusRule' | 'leadershipActionCue'
  >,
  status: string,
) {
  if (row.repeatedBufferDepletionFlag) {
    return 'Repeated buffer depletion rule: three or more buffer responses, or two or more high-cost buffer responses.'
  }

  if (row.bufferUseProfile === 'HIGH') {
    return 'High buffer dependence rule: two or more high-cost buffer responses, or four or more total buffer responses.'
  }

  if (row.highIntensityEventCount >= 1) {
    return 'High-intensity event rule: one or more high-intensity events in the reporting window.'
  }

  if (status === 'UNSTABLE') {
    return 'Unstable rule: high buffer dependence or repeated buffer depletion.'
  }

  if (status === 'STRAINING') {
    return 'Straining rule: visible events, high-intensity events, buffer use, assignment skew, or above-baseline concentration.'
  }

  return 'Stable rule: no recurrence, no high buffer dependence, and no above-threshold assignment strain.'
}

function leadershipCue(
  status: string,
  row: Omit<
    TrendRow,
    'trendStatus' | 'trendStatusRule' | 'leadershipActionCue'
  >,
) {
  if (row.repeatedBufferDepletionFlag) {
    return 'Review repeated buffer depletion before it becomes normalized operating design.'
  }

  if (row.dominantStabilityForces === 'Coverage') {
    return 'Review coverage instability and staffing resilience before recurrence escalates.'
  }

  if (row.bufferUseProfile === 'HIGH') {
    return 'Review high buffer dependence and determine whether current staffing design is absorbing repeated instability.'
  }

  if (status === 'UNSTABLE') {
    return 'Immediate leadership intervention required.'
  }

  if (status === 'STRAINING') {
    return 'Review recurring pressure before instability escalates.'
  }

  return 'Maintain current operating posture and continue monitoring.'
}

function fragilityLevel(summary: {
  trend_status: string
  repeated_buffer_depletion_flag: boolean
  high_intensity_event_count: number
  buffer_use_profile: string
}): FragilityLevel {
  if (
    summary.trend_status === 'UNSTABLE' ||
    summary.repeated_buffer_depletion_flag ||
    summary.buffer_use_profile === 'HIGH'
  ) {
    return 'HIGH'
  }

  if (
    summary.trend_status === 'STRAINING' ||
    summary.high_intensity_event_count >= 1 ||
    summary.buffer_use_profile === 'MODERATE' ||
    summary.buffer_use_profile === 'LOW'
  ) {
    return 'MODERATE'
  }

  return 'LOW'
}

function predictabilityInsight(summary: {
  trend_status: string
  late_or_last_minute_event_count: number
  assignment_load_skew: number
  repeated_buffer_depletion_flag: boolean
  buffer_use_profile: string
}) {
  if (summary.trend_status === 'UNSTABLE') {
    return 'Leaders cannot reliably anticipate operational conditions because instability, recurrence, or buffer-dependence thresholds were crossed in the reporting window.'
  }

  if (
    summary.trend_status === 'STRAINING' ||
    summary.late_or_last_minute_event_count > 0 ||
    summary.assignment_load_skew > 0 ||
    summary.buffer_use_profile === 'MODERATE' ||
    summary.buffer_use_profile === 'LOW'
  ) {
    return 'Leaders can anticipate some pressure, but predictability is weakened by event recurrence, uneven assignment load, or buffer use.'
  }

  return 'Leaders can reasonably anticipate operational conditions based on the persisted structural signals for this window.'
}

function leadershipInterpretation(summary: {
  trend_status: string
  leadership_action_cue: string
  repeated_buffer_depletion_flag: boolean
  buffer_use_profile: string
}) {
  if (summary.repeated_buffer_depletion_flag) {
    return 'Leadership should treat this window as structurally fragile because repeated buffer depletion indicates that backup capacity is being used as part of normal operations.'
  }

  if (summary.trend_status === 'UNSTABLE') {
    return 'Leadership should treat this window as structurally unstable. The concern is not individual performance, but whether recurring pressure is overwhelming predictable staffing design.'
  }

  if (summary.trend_status === 'STRAINING') {
    return 'Leadership should treat this window as an early warning period. The system is still functioning, but recurring pressure may reduce reliability if not reviewed.'
  }

  if (summary.trend_status === 'STABLE') {
    return 'Leadership should maintain the current posture while preserving visibility of structural signals before pressure becomes harder to detect.'
  }

  return summary.leadership_action_cue
}

function riskOutlook(summary: {
  trend_status: string
  buffer_use_profile: string
  repeated_buffer_depletion_flag: boolean
}) {
  if (summary.repeated_buffer_depletion_flag) {
    return 'cost pressure, staff fatigue, turnover exposure, and instability recurrence may increase because the window crossed repeated buffer-depletion thresholds.'
  }

  if (
    summary.trend_status === 'UNSTABLE' ||
    summary.buffer_use_profile === 'HIGH'
  ) {
    return 'cost pressure, staff fatigue, turnover exposure, and instability recurrence may increase.'
  }

  if (
    summary.trend_status === 'STRAINING' ||
    summary.buffer_use_profile === 'MODERATE' ||
    summary.buffer_use_profile === 'LOW'
  ) {
    return 'fatigue and instability recurrence may increase if structural pressure is not reviewed.'
  }

  return 'cost, fatigue, turnover, and instability recurrence risk are expected to remain contained.'
}

function actionSet(summary: {
  trend_status: string
  buffer_use_profile: string
  repeated_buffer_depletion_flag: boolean
  leadership_action_cue: string
}) {
  if (summary.repeated_buffer_depletion_flag) {
    return {
      immediate1:
        'Review repeated buffer depletion and determine whether backup capacity is being normalized.',
      immediate2:
        'Escalate recurring buffer dependence to leadership review.',
      short1:
        'Compare the next reporting window against this depletion pattern.',
      short2:
        'Stabilize staffing patterns before recurrence becomes embedded.',
    }
  }

  if (summary.trend_status === 'UNSTABLE') {
    return {
      immediate1:
        'Review current coverage design for the affected unit.',
      immediate2:
        'Escalate recurring instability signals to leadership review.',
      short1:
        'Compare the next reporting window against this persisted buffer.',
      short2:
        'Stabilize staffing patterns before recurrence becomes normalized.',
    }
  }

  if (
    summary.trend_status === 'STRAINING' ||
    summary.buffer_use_profile === 'MODERATE' ||
    summary.buffer_use_profile === 'LOW'
  ) {
    return {
      immediate1: summary.leadership_action_cue,
      immediate2:
        'Review staffing instability within the reporting window.',
      short1:
        'Monitor whether the same pressure pattern repeats next week.',
      short2:
        'Protect role-pool reliability before the strain becomes structural.',
    }
  }

  return {
    immediate1: 'Maintain current staffing posture.',
    immediate2:
      'Continue weekly structural signal monitoring.',
    short1:
      'Preserve the trend-buffer record for comparison.',
    short2:
      'Review only if recurrence appears in the next window.',
  }
}

function cleanAction(value: string) {
  return value === DEFAULT_ACTION ? null : value
}

function cleanOutcome(value: string) {
  return value === DEFAULT_OUTCOME ? null : value
}

function buildTrendRows(
  assignments: AssignmentRow[],
  events: EventRow[],
  windowStart: string,
  windowEnd: string,
): TrendRow[] {
  const groups = new Map<string, AssignmentRow[]>()

  assignments.forEach((row) => {
    const normalizedBaselineDesign = normalizeBaselineDesign(
      row.baseline_design,
    )

    const normalizedRolePool = normalizeRolePool(row.role_pool)

    const key = `${row.unit}::${normalizedRolePool}::${row.shift_type}::${normalizedBaselineDesign}`

    groups.set(key, [...(groups.get(key) ?? []), row])
  })

  return Array.from(groups.entries()).map(([key, group]) => {
    const [unit, rolePool, shiftType, baselineDesign] =
      key.split('::')

    const matchedEvents = events.filter(
      (event) =>
        event.unit === unit &&
        normalizeRolePool(event.role_pool) === rolePool &&
        event.shift_type === shiftType &&
        event.event_date >= windowStart &&
        event.event_date <= windowEnd,
    )

    const higherCount = group.filter(
      (row) => Number(row.load_modifier ?? 0) > 0,
    ).length

    const assignmentLoadSkew = group.reduce(
      (sum, row) => sum + Number(row.load_modifier ?? 0),
      0,
    )

    const stats = eventStats(matchedEvents)

    const base = {
      trendWindow: `${windowStart} → ${windowEnd}`,
      unit,
      rolePool,
      shiftType,
      baselineDesign,
      assignmentLoadSkew,
      pctHigher: group.length
        ? Math.round((higherCount / group.length) * 100)
        : 0,
      totalStabilityEvents: stats.totalStabilityEvents,
      highIntensityEventCount: stats.highIntensityEventCount,
      lateOrLastMinuteEventCount:
        stats.lateOrLastMinuteEventCount,
      bufferUseProfile: stats.bufferUseProfile,
      repeatedBufferDepletionFlag:
        stats.repeatedBufferDepletionFlag,
      dominantStabilityForces:
        stats.dominantStabilityForces,
    }

    const status = trendStatus(base)
    const rule = trendRule(base, status)

    return {
      ...base,
      trendStatus: status,
      trendStatusRule: rule,
      leadershipActionCue: leadershipCue(status, base),
    }
  })
}

function summarizeForPersistence(
  rows: TrendRow[],
  events: EventRow[],
  unit: string,
  windowStart: string,
  windowEnd: string,
  lastActionTaken: string,
  observedOutcome: string,
) {
  const assignmentLoadSkew = rows.reduce(
    (sum, row) => sum + row.assignmentLoadSkew,
    0,
  )

  const eventSummary = eventStats(events)
  const totalStabilityEvents = eventSummary.totalStabilityEvents
  const highIntensityEventCount =
    eventSummary.highIntensityEventCount

  const lateOrLastMinuteEventCount =
    eventSummary.lateOrLastMinuteEventCount

  const repeatedBufferDepletionFlag =
    eventSummary.repeatedBufferDepletionFlag

  const bufferUseProfile = eventSummary.bufferUseProfile

  const trendStatusValue =
    repeatedBufferDepletionFlag || bufferUseProfile === 'HIGH'
      ? 'UNSTABLE'
      : totalStabilityEvents > 0 ||
          highIntensityEventCount > 0 ||
          bufferUseProfile === 'LOW' ||
          bufferUseProfile === 'MODERATE' ||
          assignmentLoadSkew > 0
        ? 'STRAINING'
        : rows.length
          ? 'STABLE'
          : 'NO DATA'

  const baseSummary = {
    unit,
    window_start: windowStart,
    window_end: windowEnd,
    assignment_load_skew: assignmentLoadSkew,
    total_stability_events: totalStabilityEvents,
    high_intensity_event_count: highIntensityEventCount,
    late_or_last_minute_event_count:
      lateOrLastMinuteEventCount,
    buffer_use_profile: bufferUseProfile,
    repeated_buffer_depletion_flag:
      repeatedBufferDepletionFlag,
    dominant_stability_forces:
      eventSummary.dominantStabilityForces !== 'NONE'
        ? [eventSummary.dominantStabilityForces]
        : ['NONE'],
    trend_status: trendStatusValue,
    leadership_action_cue:
      eventSummary.dominantStabilityForces === 'Coverage'
        ? 'Review coverage instability and staffing resilience before recurrence escalates.'
        : rows.find(
              (row) => row.trendStatus === 'UNSTABLE',
            )?.leadershipActionCue ??
          rows.find(
            (row) => row.trendStatus === 'STRAINING',
          )?.leadershipActionCue ??
          rows[0]?.leadershipActionCue ??
          'No trend-buffer output available.',
  }

  const actions = actionSet(baseSummary)

  return {
    ...baseSummary,
    stability_score: null,
    predictability_insight:
      predictabilityInsight(baseSummary),
    most_affected_role_pool:
      eventSummary.affectedRole !== 'NONE'
        ? eventSummary.affectedRole
        : rows[0]?.rolePool ?? NOT_CAPTURED,
    most_affected_shift:
      eventSummary.affectedShift !== 'NONE'
        ? eventSummary.affectedShift
        : rows[0]?.shiftType ?? NOT_CAPTURED,
    fragility_level: fragilityLevel(baseSummary),
    cost_pressure_signal:
      eventSummary.costPressureSignal,
    leadership_interpretation:
      leadershipInterpretation(baseSummary),
    immediate_action_1: actions.immediate1,
    immediate_action_2: actions.immediate2,
    short_term_action_1: actions.short1,
    short_term_action_2: actions.short2,
    risk_outlook: riskOutlook(baseSummary),
    last_action_taken: cleanAction(lastActionTaken),
    observed_outcome: cleanOutcome(observedOutcome),
  }
}

function historicalHasWorkforceEvidence(
  row: HistoricalTrendRecord,
) {
  return (
    Number(row.staffing_instability_event_count ?? 0) > 0 ||
    Object.keys(row.workforce_event_counts ?? {}).length > 0 ||
    Object.keys(
      row.organizational_adaptation_counts ?? {},
    ).length > 0 ||
    (row.workforce_reliability_status !== null &&
      row.workforce_reliability_status !== 'NO_DATA') ||
    (row.reliability_pattern_direction !== null &&
      row.reliability_pattern_direction !== 'NOT_PRESENT')
  )
}

function selectPreviousEligibleWindow(
  historicalRows: HistoricalTrendRecord[],
  currentWindow: LoadedWindow,
) {
  return (
    historicalRows
      .filter(
        (row) =>
          !(
            row.window_start === currentWindow.windowStart &&
            row.window_end === currentWindow.windowEnd
          ) &&
          row.window_end < currentWindow.windowStart &&
          historicalHasWorkforceEvidence(row),
      )
      .sort(
        (first, second) =>
          second.window_end.localeCompare(first.window_end) ||
          second.window_start.localeCompare(
            first.window_start,
          ),
      )[0] ?? null
  )
}

function repeatedType(
  current: Record<string, number>,
  previous: Record<string, number>,
  allowed?: Set<string>,
) {
  const candidates = Object.keys(current).filter((key) => {
    if (allowed && !allowed.has(key)) {
      return false
    }

    return (
      Number(current[key] ?? 0) > 0 &&
      Number(previous[key] ?? 0) > 0
    )
  })

  return (
    candidates.sort(
      (first, second) =>
        Number(current[second] ?? 0) -
          Number(current[first] ?? 0) ||
        Number(previous[second] ?? 0) -
          Number(previous[first] ?? 0) ||
        first.localeCompare(second),
    )[0] ?? null
  )
}

function buildWorkforceReliabilityOutput(
  assignments: AssignmentRow[],
  events: EventRow[],
  trendRows: TrendRow[],
  historicalRows: HistoricalTrendRecord[],
  loadedWindow: LoadedWindow,
  baseSummary: ReturnType<typeof summarizeForPersistence>,
): WorkforceReliabilityOutput {
  if (
    assignments.length === 0 &&
    events.length === 0 &&
    trendRows.length === 0
  ) {
    return {
      workforce_event_counts: {},
      organizational_adaptation_counts: {},
      staffing_instability_event_count: 0,
      buffer_response_count: 0,
      high_cost_buffer_response_count: 0,
      dominant_workforce_event_type: null,
      dominant_organizational_adaptation: null,
      repeated_workforce_event_type: null,
      repeated_organizational_adaptation: null,
      workforce_reliability_status: 'NO_DATA',
      reliability_pattern_direction: 'NOT_PRESENT',
      repeated_workforce_reliability_flag: false,
      repeated_adaptation_flag: false,
      consecutive_affected_windows: 0,
      workforce_reliability_summary: null,
      workforce_consequence_outlook: null,
    }
  }

  const workforceEventCounts = countValues(
    events.map((row) => row.event_type),
  )

  const workforceOnlyCounts = events.reduce<
    Record<string, number>
  >((accumulator, row) => {
    const eventType = String(row.event_type ?? '').trim()
    const force = String(row.stability_force ?? '').trim()

    if (
      eventType &&
      (staffingInstabilityEventTypes.has(eventType) ||
        force === 'Coverage')
    ) {
      accumulator[eventType] =
        (accumulator[eventType] ?? 0) + 1
    }

    return accumulator
  }, {})

  const actualAdaptations = events
    .filter((row) => bufferUsed(row.buffer_response))
    .map((row) => row.buffer_response)

  const adaptationCounts = countValues(actualAdaptations)

  const staffingInstabilityEventCount =
    sumCounts(workforceOnlyCounts)

  const bufferResponseCount = actualAdaptations.length

  const highCostBufferResponseCount = events.filter(
    (row) => row.buffer_cost_band === 'HIGH_BUFFER_COST',
  ).length

  const dominantWorkforceEventType =
    dominantFromCounts(workforceOnlyCounts)

  const dominantOrganizationalAdaptation =
    dominantFromCounts(adaptationCounts)

  const previousWindow = selectPreviousEligibleWindow(
    historicalRows,
    loadedWindow,
  )

  const previousEventCounts =
    previousWindow?.workforce_event_counts ?? {}

  const previousAdaptationCounts =
    previousWindow?.organizational_adaptation_counts ?? {}

  const repeatedWorkforceEventType = previousWindow
    ? repeatedType(
        workforceOnlyCounts,
        previousEventCounts,
        staffingInstabilityEventTypes,
      )
    : null

  const repeatedOrganizationalAdaptation = previousWindow
    ? repeatedType(
        adaptationCounts,
        previousAdaptationCounts,
      )
    : null

  const repeatedWorkforceReliabilityFlag = Boolean(
    repeatedWorkforceEventType ||
      (dominantWorkforceEventType &&
        previousWindow?.dominant_workforce_event_type ===
          dominantWorkforceEventType),
  )

  const repeatedAdaptationFlag = Boolean(
    repeatedOrganizationalAdaptation ||
      (dominantOrganizationalAdaptation &&
        previousWindow?.dominant_organizational_adaptation ===
          dominantOrganizationalAdaptation),
  )

  const previousStaffingCount = Number(
    previousWindow?.staffing_instability_event_count ?? 0,
  )

  let reliabilityPatternDirection: ReliabilityPatternDirection =
    'NOT_PRESENT'

  if (staffingInstabilityEventCount === 0) {
    reliabilityPatternDirection =
      previousStaffingCount > 0
        ? 'DECREASING'
        : 'NOT_PRESENT'
  } else if (!previousWindow) {
    reliabilityPatternDirection = 'NEW'
  } else if (
    staffingInstabilityEventCount > previousStaffingCount
  ) {
    reliabilityPatternDirection = 'INCREASING'
  } else if (
    staffingInstabilityEventCount < previousStaffingCount
  ) {
    reliabilityPatternDirection = 'DECREASING'
  } else if (repeatedWorkforceReliabilityFlag) {
    reliabilityPatternDirection = 'REPEATING'
  } else {
    reliabilityPatternDirection = 'UNCHANGED'
  }

  let consecutiveAffectedWindows = 0

  if (staffingInstabilityEventCount > 0) {
    if (
      previousWindow &&
      Number(
        previousWindow.staffing_instability_event_count ?? 0,
      ) > 0
    ) {
      consecutiveAffectedWindows =
        Number(
          previousWindow.consecutive_affected_windows ?? 0,
        ) + 1
    } else {
      consecutiveAffectedWindows = 1
    }
  }

  let workforceReliabilityStatus: WorkforceReliabilityStatus =
    'STABLE'

  const assignmentLoadSkew =
    baseSummary.assignment_load_skew

  const highIntensityEventCount =
    baseSummary.high_intensity_event_count

  const lateEventCount =
    baseSummary.late_or_last_minute_event_count

  const bufferUseProfile =
    baseSummary.buffer_use_profile

  const repeatedBufferFlag =
    baseSummary.repeated_buffer_depletion_flag

  if (
    reliabilityPatternDirection === 'DECREASING' &&
    staffingInstabilityEventCount < previousStaffingCount &&
    baseSummary.trend_status !== 'UNSTABLE'
  ) {
    workforceReliabilityStatus = 'RECOVERING'
  } else if (
    reliabilityPatternDirection === 'INCREASING' ||
    (consecutiveAffectedWindows >= 2 &&
      repeatedWorkforceReliabilityFlag) ||
    (baseSummary.trend_status === 'UNSTABLE' &&
      staffingInstabilityEventCount > 0) ||
    (repeatedBufferFlag &&
      staffingInstabilityEventCount > 0)
  ) {
    workforceReliabilityStatus = 'DETERIORATING'
  } else if (
    staffingInstabilityEventCount >= 2 ||
    repeatedWorkforceReliabilityFlag ||
    repeatedAdaptationFlag ||
    bufferUseProfile === 'MODERATE' ||
    assignmentLoadSkew > 0
  ) {
    workforceReliabilityStatus = 'STRAINING'
  } else if (
    staffingInstabilityEventCount === 1 ||
    bufferResponseCount === 1 ||
    lateEventCount === 1
  ) {
    workforceReliabilityStatus = 'WATCH'
  } else if (
    assignments.length > 0 &&
    staffingInstabilityEventCount === 0 &&
    !repeatedWorkforceReliabilityFlag &&
    !repeatedAdaptationFlag &&
    bufferResponseCount === 0 &&
    assignmentLoadSkew === 0 &&
    highIntensityEventCount === 0
  ) {
    workforceReliabilityStatus = 'STABLE'
  }

  const affectedRole =
    baseSummary.most_affected_role_pool

  const affectedShift =
    baseSummary.most_affected_shift

  const summaryParts = [
    `Workforce reliability status is ${workforceReliabilityStatus}.`,
    `${staffingInstabilityEventCount} staffing-instability event(s) were recorded in the loaded window.`,
    dominantWorkforceEventType
      ? `The dominant workforce event was ${dominantWorkforceEventType}.`
      : null,
    `The longitudinal pattern direction is ${reliabilityPatternDirection}.`,
    repeatedWorkforceEventType
      ? `${repeatedWorkforceEventType} repeated across the current and preceding eligible windows.`
      : null,
    affectedRole &&
    affectedRole !== NOT_CAPTURED
      ? `The most affected role pool was ${affectedRole}.`
      : null,
    affectedShift &&
    affectedShift !== NOT_CAPTURED
      ? `The most affected shift was ${affectedShift}.`
      : null,
    dominantOrganizationalAdaptation
      ? `The dominant organizational adaptation was ${dominantOrganizationalAdaptation}.`
      : null,
  ].filter(Boolean)

  const consequenceParts: string[] = []

  const repeatedOrIncreasing =
    reliabilityPatternDirection === 'INCREASING' ||
    reliabilityPatternDirection === 'REPEATING' ||
    repeatedWorkforceReliabilityFlag

  const absenceCounts = sumCounts(
    filterCounts(
      workforceOnlyCounts,
      absenceOrCancellationEvents,
    ),
  )

  const coverageFailureCounts = sumCounts(
    filterCounts(
      workforceOnlyCounts,
      replacementOrCoverageEvents,
    ),
  )

  const redistributionCounts = sumCounts(
    filterCounts(
      workforceOnlyCounts,
      redistributionEvents,
    ),
  )

  const contingencyCounts = sumCounts(
    filterCounts(
      adaptationCounts,
      contingencyAdaptations,
    ),
  )

  const localSupportCounts = sumCounts(
    filterCounts(
      adaptationCounts,
      localSupportAdaptations,
    ),
  )

  if (
    repeatedOrIncreasing &&
    absenceCounts > 0
  ) {
    consequenceParts.push(
      'Repeated or increasing absence and cancellation patterns may weaken staffing predictability, increase overtime and replacement pressure, and increase fatigue and turnover exposure.',
    )
  }

  if (
    repeatedOrIncreasing &&
    coverageFailureCounts > 0
  ) {
    consequenceParts.push(
      'Repeated replacement failure or coverage gaps may increase unresolved coverage exposure, assignment redistribution, continuity disruption, and missed-care risk.',
    )
  }

  if (
    repeatedOrIncreasing &&
    redistributionCounts > 0
  ) {
    consequenceParts.push(
      'Repeated assignment redistribution may increase workload inequity, fatigue, continuity disruption, and retention pressure.',
    )
  }

  if (
    contingencyCounts > 0 &&
    (repeatedAdaptationFlag ||
      reliabilityPatternDirection === 'INCREASING')
  ) {
    consequenceParts.push(
      'Repeated reliance on overtime, mandatory overtime, agency, or float coverage may increase labor-cost pressure, fatigue, continuity disruption, and dependence on contingency staffing.',
    )
  }

  if (
    localSupportCounts > 0 &&
    repeatedAdaptationFlag
  ) {
    consequenceParts.push(
      'Repeated peer, charge-nurse, or supervisor support demonstrates local resilience but may deplete support capacity if reliance continues.',
    )
  }

  if (
    workforceReliabilityStatus === 'RECOVERING' ||
    reliabilityPatternDirection === 'DECREASING'
  ) {
    consequenceParts.push(
      'Workforce reliability pressure is easing relative to the preceding eligible window, but continued monitoring is required to confirm sustained recovery.',
    )
  }

  if (workforceReliabilityStatus === 'STABLE') {
    consequenceParts.push(
      'Current workforce reliability exposure is contained for this loaded reporting window.',
    )
  }

  if (consequenceParts.length === 0) {
    consequenceParts.push(
      'Current workforce reliability evidence should continue to be monitored because recurring staffing instability may weaken predictability, increase fatigue, and place pressure on continuity if the pattern persists.',
    )
  }

  return {
    workforce_event_counts: workforceEventCounts,
    organizational_adaptation_counts:
      adaptationCounts,
    staffing_instability_event_count:
      staffingInstabilityEventCount,
    buffer_response_count: bufferResponseCount,
    high_cost_buffer_response_count:
      highCostBufferResponseCount,
    dominant_workforce_event_type:
      dominantWorkforceEventType,
    dominant_organizational_adaptation:
      dominantOrganizationalAdaptation,
    repeated_workforce_event_type:
      repeatedWorkforceEventType,
    repeated_organizational_adaptation:
      repeatedOrganizationalAdaptation,
    workforce_reliability_status:
      workforceReliabilityStatus,
    reliability_pattern_direction:
      reliabilityPatternDirection,
    repeated_workforce_reliability_flag:
      repeatedWorkforceReliabilityFlag,
    repeated_adaptation_flag:
      repeatedAdaptationFlag,
    consecutive_affected_windows:
      consecutiveAffectedWindows,
    workforce_reliability_summary:
      summaryParts.join(' '),
    workforce_consequence_outlook:
      consequenceParts.join(' '),
  }
}

export default function SSITrendBufferPage() {
  const router = useRouter()
  const mountedRef = useRef(false)
  const accessAttemptRef = useRef(0)

  const [authorized, setAuthorized] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [accessFailure, setAccessFailure] = useState(false)
  const [redirectingToLogin, setRedirectingToLogin] =
    useState(false)
  const [logoutInProgress, setLogoutInProgress] =
    useState(false)

  const [filters, setFilters] = useState(initialFilters)
  const [loadedWindow, setLoadedWindow] =
    useState<LoadedWindow | null>(null)

  const [assignments, setAssignments] = useState<
    AssignmentRow[]
  >([])

  const [events, setEvents] = useState<EventRow[]>([])

  const [historicalRows, setHistoricalRows] = useState<
    HistoricalTrendRecord[]
  >([])

  const [lastActionTaken, setLastActionTaken] = useState(
    DEFAULT_ACTION,
  )

  const [observedOutcome, setObservedOutcome] = useState(
    DEFAULT_OUTCOME,
  )

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [message, setMessage] = useState(
    'Load a window to calculate the stability trend buffer.',
  )

  useEffect(() => {
    mountedRef.current = true
    void verifyAccess()

    return () => {
      mountedRef.current = false
      accessAttemptRef.current += 1
    }
  }, [])

  async function safeSignOut() {
    try {
      await withTimeout(
        supabase.auth.signOut(),
        ACCESS_TIMEOUT_MS,
      )
    } catch {
      // Navigation recovery is controlled by the caller.
    } finally {
      // Sign-out must never block navigation.
    }
  }

  async function verifyAccess() {
    const attemptId = accessAttemptRef.current + 1
    accessAttemptRef.current = attemptId

    if (!mountedRef.current) {
      return
    }

    setCheckingAccess(true)
    setAccessFailure(false)
    setRedirectingToLogin(false)
    setAuthorized(false)

    try {
      const {
        data: { session },
        error: sessionError,
      } = await withTimeout(
        supabase.auth.getSession(),
        ACCESS_TIMEOUT_MS,
      )

      if (sessionError) {
        throw new Error('SSI_AUTH_SERVICE_UNAVAILABLE')
      }

      if (
        !mountedRef.current ||
        accessAttemptRef.current !== attemptId
      ) {
        return
      }

      if (!session?.user) {
        setRedirectingToLogin(true)
        router.replace('/ssi/login')
        router.refresh()
        return
      }

      if (!session.user.email_confirmed_at) {
        await safeSignOut()

        if (
          !mountedRef.current ||
          accessAttemptRef.current !== attemptId
        ) {
          return
        }

        setRedirectingToLogin(true)
        router.replace('/ssi/login')
        router.refresh()
        return
      }

      const { data: roleRecord, error: roleError } =
        await withTimeout(
          supabase
            .from('user_roles')
            .select('role,status')
            .eq('user_id', session.user.id)
            .maybeSingle(),
          ACCESS_TIMEOUT_MS,
        )

      if (roleError) {
        throw new Error('SSI_ROLE_SERVICE_UNAVAILABLE')
      }

      if (
        !mountedRef.current ||
        accessAttemptRef.current !== attemptId
      ) {
        return
      }

      const isAuthorized =
        Boolean(roleRecord) &&
        allowedRoles.includes(roleRecord?.role ?? '') &&
        allowedStatuses.includes(
          roleRecord?.status ?? '',
        )

      if (!isAuthorized) {
        await safeSignOut()

        if (
          !mountedRef.current ||
          accessAttemptRef.current !== attemptId
        ) {
          return
        }

        setRedirectingToLogin(true)
        router.replace('/ssi/login')
        router.refresh()
        return
      }

      setAuthorized(true)
    } catch {
      if (
        mountedRef.current &&
        accessAttemptRef.current === attemptId
      ) {
        setAuthorized(false)
        setAccessFailure(true)
      }
    } finally {
      if (
        mountedRef.current &&
        accessAttemptRef.current === attemptId
      ) {
        setCheckingAccess(false)
      }
    }
  }

  const trendRows = useMemo(() => {
    if (!loadedWindow) {
      return []
    }

    return buildTrendRows(
      assignments,
      events,
      loadedWindow.windowStart,
      loadedWindow.windowEnd,
    )
  }, [assignments, events, loadedWindow])

  const persistedSummary = useMemo(() => {
    const sourceWindow = loadedWindow ?? {
      unit: filters.unit,
      windowStart: filters.windowStart,
      windowEnd: filters.windowEnd,
      shiftType: filters.shiftType,
    }

    return summarizeForPersistence(
      trendRows,
      events,
      sourceWindow.unit,
      sourceWindow.windowStart,
      sourceWindow.windowEnd,
      lastActionTaken,
      observedOutcome,
    )
  }, [
    trendRows,
    events,
    loadedWindow,
    filters,
    lastActionTaken,
    observedOutcome,
  ])

  const workforceReliability = useMemo(() => {
    if (!loadedWindow) {
      return {
        workforce_event_counts: {},
        organizational_adaptation_counts: {},
        staffing_instability_event_count: 0,
        buffer_response_count: 0,
        high_cost_buffer_response_count: 0,
        dominant_workforce_event_type: null,
        dominant_organizational_adaptation: null,
        repeated_workforce_event_type: null,
        repeated_organizational_adaptation: null,
        workforce_reliability_status:
          'NO_DATA' as WorkforceReliabilityStatus,
        reliability_pattern_direction:
          'NOT_PRESENT' as ReliabilityPatternDirection,
        repeated_workforce_reliability_flag: false,
        repeated_adaptation_flag: false,
        consecutive_affected_windows: 0,
        workforce_reliability_summary: null,
        workforce_consequence_outlook: null,
      }
    }

    return buildWorkforceReliabilityOutput(
      assignments,
      events,
      trendRows,
      historicalRows,
      loadedWindow,
      persistedSummary,
    )
  }, [
    assignments,
    events,
    trendRows,
    historicalRows,
    loadedWindow,
    persistedSummary,
  ])

  const topSummary = useMemo(() => {
    const unstable = trendRows.filter(
      (row) => row.trendStatus === 'UNSTABLE',
    ).length

    const straining = trendRows.filter(
      (row) => row.trendStatus === 'STRAINING',
    ).length

    return {
      rows: trendRows.length,
      unstable,
      straining,
      stable: trendRows.filter(
        (row) => row.trendStatus === 'STABLE',
      ).length,
      posture: persistedSummary.trend_status,
    }
  }, [trendRows, persistedSummary.trend_status])

  function updateFilter(
    field: keyof typeof initialFilters,
    value: string,
  ) {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleLogout() {
    if (logoutInProgress) {
      return
    }

    setLogoutInProgress(true)

    try {
      await withTimeout(
        supabase.auth.signOut(),
        ACCESS_TIMEOUT_MS,
      )
    } catch {
      // Logout navigation remains deterministic.
    } finally {
      router.replace('/ssi/login')
      router.refresh()

      if (mountedRef.current) {
        setLogoutInProgress(false)
      }
    }
  }

  function validateWindow(
    unit: string,
    windowStart: string,
    windowEnd: string,
    action: 'calculate' | 'save',
  ) {
    if (!unit.trim() || !windowStart.trim() || !windowEnd.trim()) {
      setMessage(
        action === 'calculate'
          ? 'Complete the Unit, Window Start, and Window End before calculating.'
          : 'Complete the Unit, Window Start, and Window End before saving.',
      )
      return false
    }

    if (
      !isValidCalendarDate(windowStart) ||
      !isValidCalendarDate(windowEnd)
    ) {
      setMessage(
        'Enter valid calendar dates in YYYY-MM-DD format for both Window Start and Window End.',
      )
      return false
    }

    if (windowEnd < windowStart) {
      setMessage(
        'Window End cannot be earlier than Window Start.',
      )
      return false
    }

    return true
  }

  async function loadTrend(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (loading) {
      return
    }

    if (
      !validateWindow(
        filters.unit,
        filters.windowStart,
        filters.windowEnd,
        'calculate',
      )
    ) {
      return
    }

    setLoading(true)

    try {
      let assignmentQuery = supabase
        .from('ssi_assignment_instances')
        .select(
          'unit, role_pool, shift_type, assignment_date, baseline_design, load_modifier, complexity_flag, starting_strain_signal',
        )
        .eq('unit', filters.unit.trim())
        .gte('assignment_date', filters.windowStart)
        .lte('assignment_date', filters.windowEnd)

      let eventQuery = supabase
        .from('ssi_stability_events')
        .select(
          'unit, role_pool, shift_type, event_date, timing_category, event_type, buffer_response, stability_force, event_intensity, buffer_cost_band',
        )
        .eq('unit', filters.unit.trim())
        .gte('event_date', filters.windowStart)
        .lte('event_date', filters.windowEnd)

      if (filters.shiftType !== 'ALL') {
        assignmentQuery = assignmentQuery.eq(
          'shift_type',
          filters.shiftType,
        )

        eventQuery = eventQuery.eq(
          'shift_type',
          filters.shiftType,
        )
      }

      const historicalQuery = supabase
        .from('ssi_trend_buffer')
        .select(
          'id, unit, window_start, window_end, trend_status, stability_score, cost_pressure_signal, fragility_level, last_action_taken, observed_outcome, updated_at, workforce_event_counts, organizational_adaptation_counts, staffing_instability_event_count, buffer_response_count, high_cost_buffer_response_count, dominant_workforce_event_type, dominant_organizational_adaptation, repeated_workforce_event_type, repeated_organizational_adaptation, workforce_reliability_status, reliability_pattern_direction, repeated_workforce_reliability_flag, repeated_adaptation_flag, consecutive_affected_windows, workforce_reliability_summary, workforce_consequence_outlook',
        )
        .eq('unit', filters.unit.trim())
        .order('window_start', { ascending: false })
        .limit(12)

      const [
        assignmentResult,
        eventResult,
        historicalResult,
      ] = await withTimeout(
        Promise.all([
          assignmentQuery,
          eventQuery,
          historicalQuery,
        ]),
        LOAD_TIMEOUT_MS,
      )

      if (
        assignmentResult.error ||
        eventResult.error ||
        historicalResult.error
      ) {
        throw new Error('SSI_TREND_LOAD_FAILED')
      }

      if (!mountedRef.current) {
        return
      }

      const loadedAssignments =
        (assignmentResult.data ?? []) as AssignmentRow[]

      const loadedEvents =
        (eventResult.data ?? []) as EventRow[]

      const loadedHistory =
        (historicalResult.data ??
          []) as HistoricalTrendRecord[]

      const nextLoadedWindow: LoadedWindow = {
        unit: filters.unit.trim(),
        windowStart: filters.windowStart,
        windowEnd: filters.windowEnd,
        shiftType: filters.shiftType,
      }

      setAssignments(loadedAssignments)
      setEvents(loadedEvents)
      setHistoricalRows(loadedHistory)
      setLoadedWindow(nextLoadedWindow)

      const currentWindow = loadedHistory.find(
        (row) =>
          row.window_start === filters.windowStart &&
          row.window_end === filters.windowEnd,
      )

      setLastActionTaken(
        currentWindow?.last_action_taken ??
          DEFAULT_ACTION,
      )

      setObservedOutcome(
        currentWindow?.observed_outcome ??
          DEFAULT_OUTCOME,
      )

      if (
        loadedAssignments.length === 0 &&
        loadedEvents.length === 0
      ) {
        setMessage(
          'No assignment or stability-event evidence was found for this reporting window.',
        )
      } else if (
        loadedAssignments.length === 0 &&
        loadedEvents.length > 0
      ) {
        setMessage(
          'Stability events were found, but no matching assignment evidence was available for this reporting window.',
        )
      } else if (
        loadedAssignments.length > 0 &&
        loadedEvents.length === 0
      ) {
        setMessage(
          'No stability events were recorded for this reporting window. Assignment evidence remains available for review.',
        )
      } else {
        setMessage(
          'Stability trend buffer calculated. Review the window, then save action memory if needed.',
        )
      }
    } catch {
      if (mountedRef.current) {
        setMessage(LOAD_FAILURE_MESSAGE)
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }

  async function saveTrendBufferOutput() {
    if (saving) {
      return
    }

    if (!loadedWindow) {
      setMessage(
        'Calculate a valid reporting window before saving.',
      )
      return
    }

    if (
      !validateWindow(
        loadedWindow.unit,
        loadedWindow.windowStart,
        loadedWindow.windowEnd,
        'save',
      )
    ) {
      return
    }

    if (!trendRows.length) {
      setMessage(
        assignments.length === 0 && events.length > 0
          ? 'Stability events were found, but no matching assignment evidence was available for this reporting window. No trend output has been saved.'
          : 'No assignment evidence was found for this reporting window. No trend output has been saved.',
      )
      return
    }

    setSaving(true)

    try {
      const memoryLastActionTaken =
        cleanAction(lastActionTaken)

      const memoryObservedOutcome =
        cleanOutcome(observedOutcome)

      const payload = {
        ...persistedSummary,
        ...workforceReliability,
        last_action_taken: memoryLastActionTaken,
        observed_outcome: memoryObservedOutcome,
      }

      const { data, error } = await withTimeout(
        supabase
          .from('ssi_trend_buffer')
          .upsert(payload, {
            onConflict: 'unit,window_start,window_end',
          })
          .select(
            'id, unit, window_start, window_end, trend_status, stability_score, cost_pressure_signal, fragility_level, last_action_taken, observed_outcome, updated_at, workforce_event_counts, organizational_adaptation_counts, staffing_instability_event_count, buffer_response_count, high_cost_buffer_response_count, dominant_workforce_event_type, dominant_organizational_adaptation, repeated_workforce_event_type, repeated_organizational_adaptation, workforce_reliability_status, reliability_pattern_direction, repeated_workforce_reliability_flag, repeated_adaptation_flag, consecutive_affected_windows, workforce_reliability_summary, workforce_consequence_outlook',
          )
          .maybeSingle(),
        SAVE_TIMEOUT_MS,
      )

      if (error) {
        throw new Error('SSI_TREND_SAVE_FAILED')
      }

      if (!mountedRef.current) {
        return
      }

      if (data) {
        const savedRecord =
          data as HistoricalTrendRecord

        setHistoricalRows((current) => {
          const remaining = current.filter(
            (row) => row.id !== savedRecord.id,
          )

          return [savedRecord, ...remaining]
            .sort(
              (first, second) =>
                second.window_start.localeCompare(
                  first.window_start,
                ),
            )
            .slice(0, 12)
        })

        setLastActionTaken(
          savedRecord.last_action_taken ??
            DEFAULT_ACTION,
        )

        setObservedOutcome(
          savedRecord.observed_outcome ??
            DEFAULT_OUTCOME,
        )
      }

      setMessage(
        'The trend-buffer record and leadership action memory were saved.',
      )
    } catch {
      if (mountedRef.current) {
        setMessage(SAVE_FAILURE_MESSAGE)
      }
    } finally {
      if (mountedRef.current) {
        setSaving(false)
      }
    }
  }

  if (checkingAccess) {
    return (
      <main style={styles.page}>
        <section style={styles.shell}>
          <div style={styles.header}>
            <p style={styles.eyebrow}>
              TSINAXA SSI • SECURE ACCESS
            </p>

            <h1 style={styles.title}>
              Verifying SSI Access
            </h1>

            <p style={styles.subtitle}>
              Checking authorized structural stability access...
            </p>
          </div>
        </section>
      </main>
    )
  }

  if (accessFailure) {
    return (
      <main style={styles.page}>
        <section style={styles.shell}>
          <div style={styles.header}>
            <p style={styles.eyebrow}>
              TSINAXA SSI • SECURE ACCESS
            </p>

            <h1 style={styles.title}>
              SSI Access Unavailable
            </h1>

            <p style={styles.subtitle}>
              {ACCESS_FAILURE_MESSAGE}
            </p>

            <div style={styles.accessActions}>
              <button
                type="button"
                onClick={() => void verifyAccess()}
                style={styles.button}
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={() => {
                  router.replace('/ssi/login')
                  router.refresh()
                }}
                style={styles.secondaryButton}
              >
                Return to Login
              </button>
            </div>
          </div>
        </section>
      </main>
    )
  }

  if (redirectingToLogin || !authorized) {
    return (
      <main style={styles.page}>
        <section style={styles.shell}>
          <div style={styles.header}>
            <p style={styles.eyebrow}>
              TSINAXA SSI • SECURE ACCESS
            </p>

            <h1 style={styles.title}>
              Opening SSI Login
            </h1>

            <p style={styles.subtitle}>
              Returning to the secure SSI login page...
            </p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <section style={styles.shell}>
        <header style={styles.header}>
          <div style={styles.headerTop}>
            <div>
              <p style={styles.eyebrow}>
                TSINAXA SSI • STABILITY TREND BUFFER
              </p>

              <h1 style={styles.title}>
                Stability Trend Buffer
              </h1>

              <p style={styles.subtitle}>
                Calculate a reporting window from persisted
                Assignments and Stability Events, preserve
                Workforce Reliability Intelligence, and save the
                controlled longitudinal output and leadership
                action memory.
              </p>
            </div>

            <button
              type="button"
              style={{
                ...styles.logoutButton,
                ...(logoutInProgress
                  ? styles.buttonDisabled
                  : {}),
              }}
              onClick={() => void handleLogout()}
              disabled={logoutInProgress}
            >
              {logoutInProgress
                ? 'Logging out...'
                : 'Logout'}
            </button>
          </div>
        </header>

        <nav
          aria-label="TSINAXA SSI flow navigation"
          style={styles.flowNav}
        >
          <div style={styles.flowNavHeader}>
            <span style={styles.flowNavTitle}>
              SSI Flow
            </span>

            <span style={styles.flowNavRule} />

            <span style={styles.flowNavCaption}>
              Assignments → Events → Trend Buffer →
              Executive Dashboard → Weekly Brief
            </span>
          </div>

          <div style={styles.flowSteps}>
            {ssiFlow.map((item, index) => (
              <div
                key={item.href}
                style={styles.flowStepWrap}
              >
                <a
                  href={item.href}
                  style={{
                    ...styles.flowStep,
                    ...(item.active
                      ? styles.flowStepActive
                      : {}),
                  }}
                >
                  <span style={styles.flowStepIndex}>
                    {index + 1}
                  </span>

                  <span style={styles.flowStepText}>
                    <strong>{item.label}</strong>
                    <small>{item.note}</small>
                  </span>
                </a>

                {index < ssiFlow.length - 1 ? (
                  <span style={styles.flowArrow}>
                    →
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </nav>

        <form onSubmit={loadTrend} style={styles.panel}>
          <h2 style={styles.panelTitle}>
            Window Controls
          </h2>

          <Input
            label="Unit"
            value={filters.unit}
            onChange={(value) =>
              updateFilter('unit', value)
            }
          />

          <Input
            label="Window Start"
            value={filters.windowStart}
            onChange={(value) =>
              updateFilter('windowStart', value)
            }
          />

          <Input
            label="Window End"
            value={filters.windowEnd}
            onChange={(value) =>
              updateFilter('windowEnd', value)
            }
          />

          <label style={styles.label}>
            <span>Shift Type</span>

            <select
              value={filters.shiftType}
              onChange={(event) =>
                updateFilter(
                  'shiftType',
                  event.target.value,
                )
              }
              style={styles.input}
            >
              <option value="ALL">ALL</option>
              <option value="DAY">DAY</option>
              <option value="NIGHT">NIGHT</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
          >
            {loading
              ? 'Calculating...'
              : 'Calculate Trend Buffer'}
          </button>

          <button
            type="button"
            disabled={
              saving ||
              !loadedWindow ||
              !trendRows.length
            }
            style={{
              ...styles.secondaryButton,
              ...(saving ||
              !loadedWindow ||
              !trendRows.length
                ? styles.buttonDisabled
                : {}),
            }}
            onClick={() =>
              void saveTrendBufferOutput()
            }
          >
            {saving
              ? 'Saving...'
              : 'Save Action Memory'}
          </button>

          <p
            role="status"
            aria-live="polite"
            style={styles.message}
          >
            {message}
          </p>

          {loadedWindow ? (
            <p style={styles.loadedWindowNote}>
              Loaded evidence: {loadedWindow.unit} •{' '}
              {loadedWindow.windowStart} →{' '}
              {loadedWindow.windowEnd} •{' '}
              {loadedWindow.shiftType}
            </p>
          ) : null}
        </form>

        <section style={styles.panelWide}>
          <h2 style={styles.panelTitle}>
            Leadership Action Memory
          </h2>

          <p style={styles.sectionNote}>
            Controlled leadership memory. These selections are
            persisted directly and are not inferred by downstream
            SSI pages.
          </p>

          <div style={styles.actionGrid}>
            <SelectInput
              label="Leadership Action Taken"
              value={lastActionTaken}
              options={leadershipActionOptions}
              onChange={setLastActionTaken}
            />

            <SelectInput
              label="Observed Outcome"
              value={observedOutcome}
              options={observedOutcomeOptions}
              onChange={setObservedOutcome}
            />
          </div>
        </section>

        <section style={styles.summaryGrid}>
          <Metric
            label="Trend Rows"
            value={String(topSummary.rows)}
          />

          <Metric
            label="Stable"
            value={String(topSummary.stable)}
          />

          <Metric
            label="Straining"
            value={String(topSummary.straining)}
          />

          <Metric
            label="Unstable"
            value={String(topSummary.unstable)}
          />

          <Metric
            label="Overall Posture"
            value={topSummary.posture}
          />
        </section>

        <section style={styles.panelWide}>
          <h2 style={styles.panelTitle}>
            Persisted Executive Summary Preview
          </h2>

          <p style={styles.sectionNote}>
            Assignment Load Skew reflects persisted assignment
            count variance. Week 3 Operational Load Burden remains
            visible in Assignments.
          </p>

          <div style={styles.previewGrid}>
            <Metric
              label="Assignment Load Skew"
              value={skewStatus(
                persistedSummary.assignment_load_skew,
              )}
            />

            <Metric
              label="Total Stability Events"
              value={String(
                persistedSummary.total_stability_events,
              )}
            />

            <Metric
              label="High Intensity Events"
              value={String(
                persistedSummary.high_intensity_event_count,
              )}
            />

            <Metric
              label="Buffer Use Profile"
              value={persistedSummary.buffer_use_profile}
            />

            <Metric
              label="Trend Status"
              value={persistedSummary.trend_status}
            />

            <Metric
              label="Stability Risk Gauge"
              value={persistedSummary.fragility_level}
            />

            <Metric
              label="Fragility Level"
              value={persistedSummary.fragility_level}
            />

            <Metric
              label="Cost Pressure"
              value={
                persistedSummary.cost_pressure_signal
              }
            />

            <Metric
              label="Affected Role"
              value={
                persistedSummary.most_affected_role_pool
              }
            />

            <Metric
              label="Affected Shift"
              value={
                persistedSummary.most_affected_shift
              }
            />
          </div>
        </section>

        <section style={styles.panelWide}>
          <h2 style={styles.panelTitle}>
            Workforce Reliability Intelligence
          </h2>

          <p style={styles.sectionNote}>
            Structured workforce recurrence and organizational
            adaptation evidence calculated only from the loaded
            Assignments, Stability Events, and eligible persisted
            historical windows.
          </p>

          <div style={styles.previewGrid}>
            <Metric
              label="Workforce Reliability Status"
              value={
                workforceReliability.workforce_reliability_status
              }
            />

            <Metric
              label="Pattern Direction"
              value={
                workforceReliability.reliability_pattern_direction
              }
            />

            <Metric
              label="Staffing Instability Events"
              value={String(
                workforceReliability.staffing_instability_event_count,
              )}
            />

            <Metric
              label="Dominant Workforce Event"
              value={
                workforceReliability.dominant_workforce_event_type ??
                'Not present'
              }
            />

            <Metric
              label="Repeated Workforce Event"
              value={
                workforceReliability.repeated_workforce_event_type ??
                'Not present'
              }
            />

            <Metric
              label="Buffer Responses"
              value={String(
                workforceReliability.buffer_response_count,
              )}
            />

            <Metric
              label="High-Cost Buffer Responses"
              value={String(
                workforceReliability.high_cost_buffer_response_count,
              )}
            />

            <Metric
              label="Dominant Organizational Adaptation"
              value={
                workforceReliability.dominant_organizational_adaptation ??
                'Not present'
              }
            />

            <Metric
              label="Repeated Organizational Adaptation"
              value={
                workforceReliability.repeated_organizational_adaptation ??
                'Not present'
              }
            />

            <Metric
              label="Consecutive Affected Windows"
              value={String(
                workforceReliability.consecutive_affected_windows,
              )}
            />
          </div>

          <div style={styles.narrativeGrid}>
            <ReadOnlyNarrative
              label="Workforce Reliability Summary"
              value={
                workforceReliability.workforce_reliability_summary ??
                'No Workforce Reliability Intelligence is available for the loaded window.'
              }
            />

            <ReadOnlyNarrative
              label="Workforce Consequence Outlook"
              value={
                workforceReliability.workforce_consequence_outlook ??
                'No consequence outlook is available for the loaded window.'
              }
            />
          </div>

          <ProfileTable
            title="Workforce Event Profile"
            counts={
              workforceReliability.workforce_event_counts
            }
            emptyMessage="No workforce event profile is available for the loaded window."
          />

          <ProfileTable
            title="Organizational Adaptation Profile"
            counts={
              workforceReliability.organizational_adaptation_counts
            }
            emptyMessage="No organizational adaptation was recorded for the loaded window."
          />
        </section>

        <section style={styles.panelWide}>
          <h2 style={styles.panelTitle}>
            Threshold Defense Reference
          </h2>

          <p style={styles.sectionNote}>
            These rules are intentionally threshold-based, not
            numeric score-based. They defend executive
            classifications using observable recurrence, buffer
            consumption, and structural strain signals.
          </p>

          <div style={styles.defenseGrid}>
            <DefenseCard
              title="Buffer Use Profile"
              body="HIGH = 2+ high-cost buffer responses or 4+ total buffer responses. MODERATE = 1 high-cost response or 2+ total responses. LOW = 1 response. NONE = no response recorded."
            />

            <DefenseCard
              title="Repeated Buffer Depletion"
              body="TRUE = 3+ buffer responses or 2+ high-cost buffer responses. This protects the system from normalizing backup capacity as routine staffing design."
            />

            <DefenseCard
              title="Trend Status"
              body="UNSTABLE = high buffer dependence or repeated depletion. STRAINING = visible events, high-intensity events, buffer use, assignment skew, or above-baseline concentration."
            />

            <DefenseCard
              title="Risk Gauge / Fragility"
              body="HIGH = unstable trend, repeated depletion, or high buffer use. MODERATE = straining trend, one or more high-intensity events, or low/moderate buffer use. LOW = no threshold crossed."
            />

            <DefenseCard
              title="Cost Pressure Signal"
              body="Cost pressure reflects operational buffer consumption, not audited dollars. MODERATE means a documented buffer response was required to preserve stability."
            />

            <DefenseCard
              title="Governance Boundary"
              body="Trend Buffer classifies. Downstream pages read persisted outputs. No downstream page recalculates SSI thresholds."
            />
          </div>
        </section>

        <section style={styles.panelWide}>
          <h2 style={styles.panelTitle}>
            Historical Trend Windows
          </h2>

          <HistoricalTrendTable
            rows={historicalRows}
          />
        </section>

        <section style={styles.panelWide}>
          <h2 style={styles.panelTitle}>
            Stability Trend Buffer Rows
          </h2>

          <TrendTable rows={trendRows} />
        </section>

        <section style={styles.footerPanel}>
          <h2 style={styles.panelTitle}>
            Doctrine Boundary
          </h2>

          <p style={styles.footerText}>
            This page aggregates persisted Assignments and
            Stability Events into a controlled longitudinal
            signal. Downstream pages read the persisted output
            and do not recalculate SSI thresholds.
          </p>
        </section>
      </section>
    </main>
  )
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label style={styles.label}>
      <span>{label}</span>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        style={styles.input}
      />
    </label>
  )
}

function SelectInput({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <label style={styles.label}>
      <span>{label}</span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        style={styles.input}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function Metric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div style={styles.metric}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function ReadOnlyNarrative({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div style={styles.narrativeCard}>
      <strong>{label}</strong>
      <p>{value}</p>
    </div>
  )
}

function DefenseCard({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <div style={styles.defenseCard}>
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  )
}

function ProfileTable({
  title,
  counts,
  emptyMessage,
}: {
  title: string
  counts: Record<string, number>
  emptyMessage: string
}) {
  const entries = Object.entries(counts).sort(
    (first, second) =>
      second[1] - first[1] ||
      first[0].localeCompare(second[0]),
  )

  return (
    <div style={styles.profileSection}>
      <h3 style={styles.profileTitle}>{title}</h3>

      {!entries.length ? (
        <p style={styles.message}>{emptyMessage}</p>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.profileTable}>
            <thead>
              <tr>
                <th style={styles.th}>Evidence Type</th>
                <th style={styles.th}>Count</th>
              </tr>
            </thead>

            <tbody>
              {entries.map(([label, count]) => (
                <tr key={label}>
                  <td style={styles.td}>{label}</td>
                  <td style={styles.td}>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function HistoricalTrendTable({
  rows,
}: {
  rows: HistoricalTrendRecord[]
}) {
  if (!rows.length) {
    return (
      <p style={styles.message}>
        No historical trend windows loaded for this unit.
      </p>
    )
  }

  return (
    <div style={styles.tableWrap}>
      <table style={styles.historyTable}>
        <thead>
          <tr>
            <th style={styles.th}>Window</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Risk Gauge</th>
            <th style={styles.th}>Fragility</th>
            <th style={styles.th}>Cost</th>
            <th style={styles.th}>
              Workforce Reliability
            </th>
            <th style={styles.th}>
              Pattern Direction
            </th>
            <th style={styles.th}>
              Dominant Workforce Event
            </th>
            <th style={styles.th}>
              Repeated Workforce Event
            </th>
            <th style={styles.th}>
              Dominant Adaptation
            </th>
            <th style={styles.th}>
              Consecutive Affected Windows
            </th>
            <th style={styles.th}>
              Last Action Taken
            </th>
            <th style={styles.th}>
              Observed Outcome
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td style={styles.td}>
                {row.window_start} → {row.window_end}
              </td>

              <td style={styles.td}>
                {row.trend_status ?? 'Not persisted'}
              </td>

              <td style={styles.td}>
                {row.fragility_level ??
                  'Not persisted'}
              </td>

              <td style={styles.td}>
                {row.fragility_level ??
                  'Not persisted'}
              </td>

              <td style={styles.td}>
                {row.cost_pressure_signal ??
                  'Not persisted'}
              </td>

              <td style={styles.td}>
                {row.workforce_reliability_status ??
                  'Not persisted'}
              </td>

              <td style={styles.td}>
                {row.reliability_pattern_direction ??
                  'Not persisted'}
              </td>

              <td style={styles.td}>
                {row.dominant_workforce_event_type ??
                  'Not persisted'}
              </td>

              <td style={styles.td}>
                {row.repeated_workforce_event_type ??
                  'Not persisted'}
              </td>

              <td style={styles.td}>
                {row.dominant_organizational_adaptation ??
                  'Not persisted'}
              </td>

              <td style={styles.td}>
                {String(
                  row.consecutive_affected_windows ??
                    0,
                )}
              </td>

              <td style={styles.td}>
                {row.last_action_taken ??
                  DEFAULT_ACTION}
              </td>

              <td style={styles.td}>
                {row.observed_outcome ??
                  DEFAULT_OUTCOME}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TrendTable({
  rows,
}: {
  rows: TrendRow[]
}) {
  if (!rows.length) {
    return (
      <p style={styles.message}>
        No trend rows calculated for this window.
      </p>
    )
  }

  const headers = [
    'Trend Window',
    'Unit',
    'Role Pool',
    'Shift Type',
    'Baseline Design',
    'Assignment Load Skew',
    'Pct Higher',
    'Total Stability Events',
    'High Intensity Events',
    'Late / Pre-Shift Events',
    'Buffer Use Profile',
    'Repeated Buffer Depletion',
    'Dominant Stability Forces',
    'Trend Status',
    'Trend Status Rule',
    'Leadership Action Cue',
  ]

  return (
    <div style={styles.tableWrap}>
      <table style={styles.table}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} style={styles.th}>
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr
              key={`${row.unit}-${row.rolePool}-${row.shiftType}-${row.baselineDesign}`}
            >
              <td style={styles.td}>
                {row.trendWindow}
              </td>

              <td style={styles.td}>{row.unit}</td>

              <td style={styles.td}>
                {row.rolePool}
              </td>

              <td style={styles.td}>
                {row.shiftType}
              </td>

              <td style={styles.td}>
                {row.baselineDesign}
              </td>

              <td style={styles.td}>
                {skewStatus(
                  row.assignmentLoadSkew,
                )}
              </td>

              <td style={styles.td}>
                {row.pctHigher}%
              </td>

              <td style={styles.td}>
                {row.totalStabilityEvents}
              </td>

              <td style={styles.td}>
                {row.highIntensityEventCount}
              </td>

              <td style={styles.td}>
                {row.lateOrLastMinuteEventCount}
              </td>

              <td style={styles.td}>
                {row.bufferUseProfile}
              </td>

              <td style={styles.td}>
                {row.repeatedBufferDepletionFlag
                  ? 'TRUE'
                  : 'FALSE'}
              </td>

              <td style={styles.td}>
                {row.dominantStabilityForces}
              </td>

              <td style={styles.td}>
                {row.trendStatus}
              </td>

              <td style={styles.td}>
                {row.trendStatusRule}
              </td>

              <td style={styles.td}>
                {row.leadershipActionCue}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#050505',
    color: '#fff8e7',
    padding: '40px',
  },
  shell: {
    maxWidth: '1280px',
    margin: '0 auto',
  },
  header: {
    border: '1px solid rgba(214,178,94,0.28)',
    background: '#090807',
    borderRadius: '24px',
    padding: '28px',
    marginBottom: '16px',
  },
  headerTop: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '24px',
    alignItems: 'start',
  },
  logoutButton: {
    border: '1px solid rgba(214,178,94,0.42)',
    background: '#11100d',
    color: '#d6b25e',
    borderRadius: '999px',
    padding: '10px 18px',
    fontWeight: 900,
    cursor: 'pointer',
  },
  eyebrow: {
    color: '#d6b25e',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    fontSize: '12px',
    margin: 0,
  },
  title: {
    fontSize: '38px',
    margin: '12px 0',
  },
  subtitle: {
    color: '#cfc7b5',
    margin: 0,
    maxWidth: '900px',
    lineHeight: 1.6,
  },
  accessActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '22px',
  },
  flowNav: {
    border: '1px solid rgba(214,178,94,0.28)',
    background: '#090807',
    borderRadius: '20px',
    padding: '16px',
    marginBottom: '18px',
  },
  flowNavHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  flowNavTitle: {
    color: '#d6b25e',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    fontSize: '12px',
  },
  flowNavRule: {
    height: '1px',
    flex: 1,
    background: 'rgba(214,178,94,0.22)',
  },
  flowNavCaption: {
    color: '#cfc7b5',
    fontSize: '12px',
    fontWeight: 700,
  },
  flowSteps: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(5, minmax(0, 1fr))',
    gap: '10px',
  },
  flowStepWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: 0,
  },
  flowStep: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    color: '#cfc7b5',
    border: '1px solid rgba(214,178,94,0.18)',
    background: '#11100d',
    borderRadius: '14px',
    padding: '12px',
    minWidth: 0,
  },
  flowStepActive: {
    border: '1px solid rgba(214,178,94,0.58)',
    background: 'rgba(214,178,94,0.14)',
    color: '#fff8e7',
    boxShadow: 'inset 3px 0 0 #d6b25e',
  },
  flowStepIndex: {
    display: 'grid',
    placeItems: 'center',
    width: '26px',
    height: '26px',
    borderRadius: '999px',
    background: 'rgba(214,178,94,0.16)',
    color: '#d6b25e',
    fontWeight: 900,
    flexShrink: 0,
  },
  flowStepText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    minWidth: 0,
  },
  flowArrow: {
    color: '#9f8142',
    fontWeight: 900,
    flexShrink: 0,
  },
  panel: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    border: '1px solid rgba(214,178,94,0.28)',
    background: '#090807',
    borderRadius: '22px',
    padding: '22px',
    marginBottom: '18px',
  },
  panelWide: {
    border: '1px solid rgba(214,178,94,0.28)',
    background: '#090807',
    borderRadius: '22px',
    padding: '22px',
    marginBottom: '18px',
  },
  panelTitle: {
    gridColumn: '1 / -1',
    color: '#d6b25e',
    margin: '0 0 8px',
  },
  sectionNote: {
    color: '#cfc7b5',
    margin: '0 0 16px',
    lineHeight: 1.6,
  },
  loadedWindowNote: {
    gridColumn: '1 / -1',
    color: '#9f8142',
    margin: 0,
    fontSize: '13px',
    fontWeight: 700,
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(2, minmax(0, 1fr))',
    gap: '16px',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    color: '#cfc7b5',
    fontSize: '13px',
  },
  input: {
    background: '#11100d',
    border: '1px solid rgba(214,178,94,0.28)',
    borderRadius: '14px',
    color: '#fff8e7',
    padding: '12px 14px',
    outline: 'none',
  },
  button: {
    background: '#d6b25e',
    color: '#050505',
    border: 'none',
    borderRadius: '14px',
    padding: '13px 18px',
    fontWeight: 800,
    cursor: 'pointer',
    alignSelf: 'end',
  },
  secondaryButton: {
    background: '#11100d',
    color: '#d6b25e',
    border: '1px solid rgba(214,178,94,0.38)',
    borderRadius: '14px',
    padding: '13px 18px',
    fontWeight: 800,
    cursor: 'pointer',
    alignSelf: 'end',
  },
  buttonDisabled: {
    opacity: 0.58,
    cursor: 'not-allowed',
  },
  message: {
    color: '#cfc7b5',
    margin: 0,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(5, minmax(0, 1fr))',
    gap: '12px',
    marginBottom: '18px',
  },
  previewGrid: {
    gridColumn: '1 / -1',
    display: 'grid',
    gridTemplateColumns:
      'repeat(5, minmax(0, 1fr))',
    gap: '12px',
  },
  metric: {
    border: '1px solid rgba(214,178,94,0.22)',
    background: '#11100d',
    borderRadius: '16px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    color: '#cfc7b5',
    minWidth: 0,
  },
  narrativeGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(2, minmax(0, 1fr))',
    gap: '12px',
    marginTop: '16px',
  },
  narrativeCard: {
    border: '1px solid rgba(214,178,94,0.22)',
    background: '#11100d',
    borderRadius: '16px',
    padding: '16px',
    color: '#cfc7b5',
    lineHeight: 1.6,
  },
  profileSection: {
    marginTop: '18px',
    borderTop:
      '1px solid rgba(214,178,94,0.18)',
    paddingTop: '16px',
  },
  profileTitle: {
    color: '#d6b25e',
    margin: '0 0 12px',
  },
  profileTable: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '520px',
  },
  defenseGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(3, minmax(0, 1fr))',
    gap: '12px',
  },
  defenseCard: {
    border: '1px solid rgba(214,178,94,0.22)',
    background: '#11100d',
    borderRadius: '16px',
    padding: '14px',
    color: '#cfc7b5',
    lineHeight: 1.55,
  },
  tableWrap: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '1800px',
  },
  historyTable: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '2200px',
  },
  th: {
    textAlign: 'left',
    color: '#d6b25e',
    borderBottom:
      '1px solid rgba(214,178,94,0.28)',
    padding: '10px',
    whiteSpace: 'nowrap',
  },
  td: {
    color: '#fff8e7',
    borderBottom:
      '1px solid rgba(214,178,94,0.12)',
    padding: '10px',
    verticalAlign: 'top',
  },
  footerPanel: {
    border: '1px solid rgba(214,178,94,0.28)',
    background: '#090807',
    borderRadius: '22px',
    padding: '22px',
  },
  footerText: {
    color: '#cfc7b5',
    lineHeight: 1.6,
    margin: 0,
  },
}