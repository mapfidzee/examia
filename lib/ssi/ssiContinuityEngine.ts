export type SSILoadModifier = 'LOWER' | 'BASELINE' | 'HIGHER'
export type SSIComplexityFlag = 'YES' | 'NO'
export type SSIComplexityStatus = 'ROUTINE' | 'COMPLEXITY_PRESENT'
export type SSIStartingStrainSignal =
  | 'STABLE_START'
  | 'HIDDEN_STRAIN_PRESENT'
  | 'VISIBLE_STARTING_STRAIN'
  | 'SEVERE_STARTING_STRAIN'

export type SSIDomain =
  | 'Coverage'
  | 'Flow'
  | 'Capacity'
  | 'Support'
  | 'Environment'
  | 'Staffing'

export type SSIEventIntensity = 'LOW' | 'MODERATE' | 'HIGH'

export type SSIAssignmentInput = {
  assignmentId?: string
  unit: string
  rolePool: string
  shiftType: string
  shiftBlock: string
  date: string
  baselineDesign: string
  startingAssignmentCount: number
  baselineCount: number
  loadReason?: string | null
  loadComplexity?: string | null
}

export type SSIAssignmentOutput = {
  load_modifier: SSILoadModifier
  load_modifier_score: number
  load_modifier_delta: number
  complexity_flag: SSIComplexityFlag
  complexity_status: SSIComplexityStatus
  starting_strain_signal: SSIStartingStrainSignal
  complexity_weight: number
  structural_strain_summary: string
}

export type SSIEventInput = {
  eventId?: string
  unit: string
  rolePool: string
  shiftType: string
  shiftBlock: string
  date: string
  timingCategory: string
  eventType: string
  bufferResponse?: string | null
}

export type SSIEventOutput = {
  stability_force: SSIDomain
  event_intensity: SSIEventIntensity
  coverage_impact: string
  buffer_cost_band: string
  buffer_response_definition: string
}

export type SSIAssignmentSnapshotRow = {
  loadReason: string
  loadComplexity: string
  output: SSIAssignmentOutput | null
}

export type SSIAssignmentStrainSnapshot = {
  assignment_load_skew: number
  hidden_strain_count: number
  visible_strain_count: number
  severe_strain_count: number
  dominant_load_reason: string
  dominant_load_complexity: string
  structural_strain_reading: string
  calculated_count: number
}

export const SSI_LOAD_REASON_OPTIONS = [
  'NONE',
  'High-acuity resident assigned',
  'New admission at shift start',
  'Hospice care resident assigned',
  'IV therapy resident assigned',
  'Complex wound care assigned',
  'Frequent monitoring required',
  'Multiple total-care residents',
  'Behavioral observation required',
  'High fall-risk cluster',
  'Two-person assist cluster',
  'Memory-care supervision density',
  'Medication workload pressure',
  'Missed medication risk',
  'Handoff pressure',
  'Admission/discharge pressure',
  'Monitoring burden',
  'Short staffing at shift start',
] as const

export const SSI_LOAD_COMPLEXITY_OPTIONS = [
  'NONE',
  'Dual high-acuity cluster',
  'High-acuity + wound/treatment cluster',
  'Frequent monitoring cluster',
  'Multiple total-care cluster',
  'Two-person assist cluster',
  'Behavior/fall-risk supervision cluster',
  'Memory-care supervision cluster',
  'Admission/startup complexity cluster',
  'Isolation/equipment complexity cluster',
  'Hospice/palliative intensity cluster',
  'High-acuity medication risk',
  'Medication pass complexity',
  'Missed medication risk cluster',
  'Handoff instability cluster',
  'Admission/discharge pressure cluster',
  'Continuous monitoring burden',
] as const

export const SSI_TIMING_CATEGORY_OPTIONS = [
  'AT_START',
  'EARLY',
  'MID_SHIFT',
  'LATE',
  'LAST_MINUTE',
  'END_OF_SHIFT',
] as const

export const SSI_EVENT_TYPE_OPTIONS = [
  'Late shift cancellation',
  'Scheduled shift converted to on-call',
  'On-call activation without use',
  'Delayed arrival',
  'Medication delayed',
  'Medication missed',
  'Admission spike',
  'Discharge pressure',
  'Transfer delay',
  'Late handoff',
  'Call-out',
  'No-show',
  'Coverage gap',
  'Assignment redistribution',
  'High-acuity deterioration',
  'Fall-risk escalation',
  'Behavioral escalation',
  'Monitoring burden',
  'Equipment or supply delay',
] as const

export const SSI_BUFFER_RESPONSE_OPTIONS = [
  'Overtime',
  'Agency staff',
  'Float staff',
  'Assignment redistribution',
  'Charge nurse coverage',
  'Extra shift creation',
  'Supervisor support',
  'Medication pass support',
  'Delayed non-urgent task',
  'Family communication deferred',
] as const

export const SSI_SHIFT_TYPE_OPTIONS = ['DAY', 'NIGHT'] as const

export const SSI_COMMON_SHIFT_BLOCK_OPTIONS = [
  '07:00-19:00',
  '19:00-07:00',
  '07:00-15:00',
  '15:00-23:00',
  '23:00-07:00',
  'CUSTOM',
] as const

function normalize(value?: string | null): string {
  return String(value ?? '').trim().toLowerCase()
}

function includesAny(value: string, terms: string[]): boolean {
  return terms.some((term) => value.includes(term))
}

function dominant(values: string[]): string {
  const useful = values.filter((value) => value && value !== 'NONE')
  if (!useful.length) return 'NONE'

  const counts = useful.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1
    return acc
  }, {})

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'NONE'
}

function eventSequence(index: number): string {
  return String(index).padStart(3, '0')
}

export function buildSSIShiftAssignmentId(
  date: string,
  shiftType: string,
  rolePool: string,
  entryNumber: number,
): string {
  const safeDate = date ? date.replaceAll('-', '_') : 'YYYY_MM_DD'
  const safeShift = shiftType.trim().toUpperCase() || 'SHIFT'
  const safeRole = rolePool.trim().toUpperCase().replaceAll(' ', '_') || 'ROLE'
  return `SSI_ASG_${safeDate}_${safeShift}_${safeRole}_${entryNumber}`
}

export function buildSSIEventId(date: string, sequenceNumber: number): string {
  const safeDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : 'YYYY-MM-DD'
  return `SSI_EVT_${safeDate}_${eventSequence(sequenceNumber)}`
}

export function calculateSSIAssignment(input: SSIAssignmentInput): SSIAssignmentOutput {
  const loadDelta = input.startingAssignmentCount - input.baselineCount
  const load_modifier: SSILoadModifier =
    loadDelta > 0 ? 'HIGHER' : loadDelta < 0 ? 'LOWER' : 'BASELINE'

  const load_modifier_score = load_modifier === 'HIGHER' ? 1 : load_modifier === 'LOWER' ? -1 : 0
  const combined = `${normalize(input.loadReason)} ${normalize(input.loadComplexity)}`

  const complexityPresent =
    !includesAny(combined, ['none']) &&
    includesAny(combined, [
      'acuity',
      'admission',
      'discharge',
      'hospice',
      'iv therapy',
      'wound',
      'monitoring',
      'total-care',
      'behavior',
      'fall-risk',
      'two-person',
      'memory-care',
      'supervision',
      'isolation',
      'equipment',
      'palliative',
      'cluster',
      'medication',
      'handoff',
      'missed medication',
      'short staffing',
    ])

  const complexity_flag: SSIComplexityFlag = complexityPresent ? 'YES' : 'NO'

  const complexity_weight =
    complexity_flag === 'NO'
      ? 0
      : includesAny(combined, [
          'dual',
          'multiple',
          'cluster',
          'high-acuity',
          'medication',
          'missed medication',
          'handoff',
          'short staffing',
          'continuous',
        ])
        ? 2
        : 1

  const complexity_status: SSIComplexityStatus =
    complexity_flag === 'YES' ? 'COMPLEXITY_PRESENT' : 'ROUTINE'

  let starting_strain_signal: SSIStartingStrainSignal = 'STABLE_START'

  if (load_modifier === 'HIGHER' && complexity_weight >= 2) {
    starting_strain_signal = 'SEVERE_STARTING_STRAIN'
  } else if (load_modifier === 'HIGHER') {
    starting_strain_signal = 'VISIBLE_STARTING_STRAIN'
  } else if (complexity_weight > 0) {
    starting_strain_signal = 'HIDDEN_STRAIN_PRESENT'
  }

  return {
    load_modifier,
    load_modifier_score,
    load_modifier_delta: loadDelta,
    complexity_flag,
    complexity_status,
    starting_strain_signal,
    complexity_weight,
    structural_strain_summary: buildStructuralStrainSummary(
      input.unit,
      input.rolePool,
      load_modifier,
      starting_strain_signal,
    ),
  }
}

function buildStructuralStrainSummary(
  unit: string,
  rolePool: string,
  loadModifier: SSILoadModifier,
  signal: SSIStartingStrainSignal,
): string {
  const unitLabel = unit || 'This unit'
  const roleLabel = rolePool || 'this role entry'

  if (signal === 'SEVERE_STARTING_STRAIN') {
    return `${unitLabel} starts above baseline with complexity attached to ${roleLabel}. Severe starting strain is present.`
  }

  if (signal === 'VISIBLE_STARTING_STRAIN') {
    return `${unitLabel} starts above baseline for ${roleLabel}. Workload strain is visible at shift start.`
  }

  if (signal === 'HIDDEN_STRAIN_PRESENT') {
    return `${unitLabel} may look numerically balanced, but complexity creates hidden strain in ${roleLabel}.`
  }

  if (loadModifier === 'LOWER') {
    return `${unitLabel} starts below baseline count for ${roleLabel}. No strain is visible in this row, but redistribution should be reviewed.`
  }

  return `${unitLabel} starts within baseline design for ${roleLabel}. No structural strain is visible in this row.`
}

export function calculateSSIAssignmentStrainSnapshot(
  rows: SSIAssignmentSnapshotRow[],
): SSIAssignmentStrainSnapshot {
  const outputs = rows.map((row) => row.output).filter(Boolean) as SSIAssignmentOutput[]

  const assignment_load_skew = outputs.reduce(
    (sum, output) => sum + output.load_modifier_delta,
    0,
  )

  const hidden_strain_count = outputs.filter(
    (output) => output.starting_strain_signal === 'HIDDEN_STRAIN_PRESENT',
  ).length

  const visible_strain_count = outputs.filter(
    (output) => output.starting_strain_signal === 'VISIBLE_STARTING_STRAIN',
  ).length

  const severe_strain_count = outputs.filter(
    (output) => output.starting_strain_signal === 'SEVERE_STARTING_STRAIN',
  ).length

  let structural_strain_reading = 'Not calculated yet'

  if (outputs.length > 0) {
    if (severe_strain_count > 0) {
      structural_strain_reading =
        'Severe shift-start strain is visible. At least one role entry starts above baseline with complexity attached.'
    } else if (visible_strain_count > 0) {
      structural_strain_reading =
        'Visible shift-start strain is present. At least one role entry starts above baseline.'
    } else if (hidden_strain_count > 0) {
      structural_strain_reading =
        'Hidden structural strain is present. The shift may look balanced while complexity is already attached.'
    } else {
      structural_strain_reading = 'Current shift-start structure appears stable across completed entries.'
    }
  }

  return {
    assignment_load_skew,
    hidden_strain_count,
    visible_strain_count,
    severe_strain_count,
    dominant_load_reason: dominant(rows.map((row) => row.loadReason)),
    dominant_load_complexity: dominant(rows.map((row) => row.loadComplexity)),
    structural_strain_reading,
    calculated_count: outputs.length,
  }
}

export function canCalculateSSIEvent(input: SSIEventInput): boolean {
  return (
    input.rolePool.trim().length > 0 &&
    input.timingCategory.trim().length > 0 &&
    input.eventType.trim().length > 0
  )
}

export function calculateSSIEvent(input: SSIEventInput): SSIEventOutput {
  const timing = normalize(input.timingCategory)
  const event = normalize(input.eventType)
  const buffer = normalize(input.bufferResponse)

  const stability_force = classifyStabilityForce(event)
  const highTiming = includesAny(timing, ['late', 'last_minute', 'last-minute'])
  const highEvent = includesAny(event, ['missed', 'no-show', 'call-out', 'cancellation', 'coverage gap', 'deterioration'])
  const moderateEvent = includesAny(event, ['delayed', 'delay', 'handoff', 'admission', 'discharge', 'transfer', 'monitoring'])
  const heavyBuffer = includesAny(buffer, ['agency', 'overtime', 'extra shift', 'charge nurse'])

  const event_intensity: SSIEventIntensity =
    (highTiming && (highEvent || moderateEvent)) || heavyBuffer || highEvent
      ? 'HIGH'
      : highTiming || moderateEvent
        ? 'MODERATE'
        : 'LOW'

  const coverage_impact =
    event_intensity === 'HIGH'
      ? 'COVERAGE_STABILITY_CONSUMED'
      : event_intensity === 'MODERATE'
        ? 'COVERAGE_STABILITY_PRESSURED'
        : 'COVERAGE_STABILITY_HELD'

  const buffer_cost_band =
    buffer === ''
      ? 'NO_BUFFER_RECORDED'
      : includesAny(buffer, ['agency', 'overtime', 'extra shift'])
        ? 'HIGH_BUFFER_COST'
        : includesAny(buffer, ['float', 'redistribution', 'charge nurse', 'supervisor', 'medication pass'])
          ? 'MODERATE_BUFFER_COST'
          : 'LOW_BUFFER_COST'

  return {
    stability_force,
    event_intensity,
    coverage_impact,
    buffer_cost_band,
    buffer_response_definition: defineBufferResponse(buffer),
  }
}

function classifyStabilityForce(event: string): SSIDomain {
  if (includesAny(event, ['call-out', 'no-show', 'coverage gap', 'cancellation', 'on-call', 'delayed arrival'])) {
    return 'Coverage'
  }

  if (includesAny(event, ['handoff', 'admission', 'discharge', 'transfer', 'delay'])) {
    return 'Flow'
  }

  if (includesAny(event, ['acuity', 'deterioration', 'monitoring', 'surge'])) {
    return 'Capacity'
  }

  if (includesAny(event, ['medication', 'supervisor', 'charge nurse', 'support'])) {
    return 'Support'
  }

  if (includesAny(event, ['equipment', 'supply'])) {
    return 'Environment'
  }

  return 'Staffing'
}

function defineBufferResponse(buffer: string): string {
  if (buffer === '') return 'No buffer response was recorded.'
  if (includesAny(buffer, ['overtime'])) return 'Stability was preserved by extending labor beyond normal design.'
  if (includesAny(buffer, ['agency'])) return 'Stability was preserved by external staffing support.'
  if (includesAny(buffer, ['float'])) return 'Stability was preserved by moving internal staff across units.'
  if (includesAny(buffer, ['redistribution'])) return 'Stability was preserved by redistributing assignments.'
  if (includesAny(buffer, ['charge nurse'])) return 'Stability was preserved by consuming charge nurse capacity.'
  if (includesAny(buffer, ['medication pass'])) return 'Stability was preserved by medication-pass support.'
  if (includesAny(buffer, ['supervisor'])) return 'Stability was preserved by supervisor support.'
  return 'Stability was preserved by a local buffer response.'
}