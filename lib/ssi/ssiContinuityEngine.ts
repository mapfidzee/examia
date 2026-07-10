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
export type SSIRolePool = 'RN' | 'LPN' | 'CNA'

export type SSIOperationalDiagnosticFinding = {
  label: string
  category:
    | 'Clinical Intensity'
    | 'Monitoring'
    | 'Medication'
    | 'Flow'
    | 'Staffing'
    | 'Environment'
  weight: number
  legacyReason: string
  legacyComplexity: string
  allowedRoles: SSIRolePool[]
}

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
  operationalDiagnosticFindings?: string[]
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
  derived_load_reason: string
  derived_load_complexity: string
  reserve_capacity_interpretation: string
  localized_strain_interpretation: string
  odf_count: number
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
  operationalDiagnosticFindings?: string[]
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

export const SSI_OPERATIONAL_DIAGNOSTIC_FINDINGS: readonly SSIOperationalDiagnosticFinding[] = [
  {
    label: 'High-acuity care recipient assigned',
    category: 'Clinical Intensity',
    weight: 2,
    legacyReason: 'High-acuity care recipient assigned',
    legacyComplexity: 'High-acuity cluster',
    allowedRoles: ['RN', 'LPN'],
  },
  {
    label: 'New admission at shift start',
    category: 'Flow',
    weight: 1,
    legacyReason: 'New admission at shift start',
    legacyComplexity: 'Admission/startup complexity cluster',
    allowedRoles: ['RN', 'LPN'],
  },
  {
    label: 'Hospice/palliative care recipient assigned',
    category: 'Clinical Intensity',
    weight: 2,
    legacyReason: 'Hospice/palliative care recipient assigned',
    legacyComplexity: 'Hospice/palliative intensity cluster',
    allowedRoles: ['RN', 'LPN'],
  },
  {
    label: 'IV therapy care recipient assigned',
    category: 'Clinical Intensity',
    weight: 2,
    legacyReason: 'IV therapy care recipient assigned',
    legacyComplexity: 'High-acuity medication risk',
    allowedRoles: ['RN', 'LPN'],
  },
  {
    label: 'Complex wound care assigned',
    category: 'Clinical Intensity',
    weight: 2,
    legacyReason: 'Complex wound care assigned',
    legacyComplexity: 'High-acuity + wound/treatment cluster',
    allowedRoles: ['RN', 'LPN'],
  },
  {
    label: 'Multiple total-care care recipients assigned',
    category: 'Clinical Intensity',
    weight: 2,
    legacyReason: 'Multiple total-care care recipients assigned',
    legacyComplexity: 'Multiple total-care cluster',
    allowedRoles: ['RN', 'LPN', 'CNA'],
  },
  {
    label: 'Frequent monitoring required',
    category: 'Monitoring',
    weight: 2,
    legacyReason: 'Frequent monitoring required',
    legacyComplexity: 'Frequent monitoring cluster',
    allowedRoles: ['RN', 'LPN', 'CNA'],
  },
  {
    label: 'Behavioral monitoring required',
    category: 'Monitoring',
    weight: 2,
    legacyReason: 'Behavioral monitoring required',
    legacyComplexity: 'Behavior/fall-risk supervision cluster',
    allowedRoles: ['RN', 'LPN', 'CNA'],
  },
  {
    label: 'High fall-risk cluster',
    category: 'Monitoring',
    weight: 2,
    legacyReason: 'High fall-risk cluster',
    legacyComplexity: 'Behavior/fall-risk supervision cluster',
    allowedRoles: ['RN', 'LPN', 'CNA'],
  },
  {
    label: 'Two-person assist cluster',
    category: 'Monitoring',
    weight: 2,
    legacyReason: 'Two-person assist cluster',
    legacyComplexity: 'Two-person assist cluster',
    allowedRoles: ['RN', 'LPN', 'CNA'],
  },
  {
    label: 'Memory-care supervision density',
    category: 'Monitoring',
    weight: 2,
    legacyReason: 'Memory-care supervision density',
    legacyComplexity: 'Memory-care supervision cluster',
    allowedRoles: ['RN', 'LPN', 'CNA'],
  },
  {
    label: 'Medication workload pressure',
    category: 'Medication',
    weight: 2,
    legacyReason: 'Medication workload pressure',
    legacyComplexity: 'Medication pass complexity',
    allowedRoles: ['RN', 'LPN'],
  },
  {
    label: 'Missed medication risk',
    category: 'Medication',
    weight: 2,
    legacyReason: 'Missed medication risk',
    legacyComplexity: 'Missed medication risk cluster',
    allowedRoles: ['RN', 'LPN'],
  },
  {
    label: 'Handoff pressure',
    category: 'Flow',
    weight: 1,
    legacyReason: 'Handoff pressure',
    legacyComplexity: 'Handoff instability cluster',
    allowedRoles: ['RN', 'LPN', 'CNA'],
  },
  {
    label: 'Admission/discharge pressure',
    category: 'Flow',
    weight: 1,
    legacyReason: 'Admission/discharge pressure',
    legacyComplexity: 'Admission/discharge pressure cluster',
    allowedRoles: ['RN', 'LPN'],
  },
  {
    label: 'Monitoring burden',
    category: 'Monitoring',
    weight: 2,
    legacyReason: 'Monitoring burden',
    legacyComplexity: 'Continuous monitoring burden',
    allowedRoles: ['RN', 'LPN', 'CNA'],
  },
  {
    label: 'Short staffing at shift start',
    category: 'Staffing',
    weight: 2,
    legacyReason: 'Short staffing at shift start',
    legacyComplexity: 'Handoff instability cluster',
    allowedRoles: ['RN', 'LPN', 'CNA'],
  },
  {
    label: 'Isolation/equipment burden',
    category: 'Environment',
    weight: 1,
    legacyReason: 'Isolation/equipment burden',
    legacyComplexity: 'Isolation/equipment complexity cluster',
    allowedRoles: ['RN', 'LPN', 'CNA'],
  },
  {
    label: 'Post-procedure monitoring',
    category: 'Monitoring',
    weight: 2,
    legacyReason: 'Post-procedure monitoring',
    legacyComplexity: 'Post-procedure monitoring cluster',
    allowedRoles: ['RN', 'LPN'],
  },
  {
    label: 'Coverage gap',
    category: 'Staffing',
    weight: 2,
    legacyReason: 'Coverage gap',
    legacyComplexity: 'Handoff instability cluster',
    allowedRoles: ['RN', 'LPN', 'CNA'],
  },
] as const

export const SSI_LOAD_REASON_OPTIONS = [
  'NONE',
  ...SSI_OPERATIONAL_DIAGNOSTIC_FINDINGS.map((finding) => finding.legacyReason),
] as const

export const SSI_LOAD_COMPLEXITY_OPTIONS = [
  'NONE',
  ...Array.from(new Set(SSI_OPERATIONAL_DIAGNOSTIC_FINDINGS.map((finding) => finding.legacyComplexity))),
] as const

export const SSI_TIMING_CATEGORY_OPTIONS = [
  'PRE_SHIFT',
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

function getRolePoolFromLabel(rolePool: string): SSIRolePool {
  const normalized = rolePool.trim().toUpperCase()
  if (normalized.startsWith('CNA')) return 'CNA'
  if (normalized.startsWith('LPN')) return 'LPN'
  return 'RN'
}

function getFindingsForInput(input: SSIAssignmentInput): SSIOperationalDiagnosticFinding[] {
  const role = getRolePoolFromLabel(input.rolePool)
  const selected = input.operationalDiagnosticFindings ?? []

  return selected
    .map((label) => SSI_OPERATIONAL_DIAGNOSTIC_FINDINGS.find((finding) => finding.label === label))
    .filter((finding): finding is SSIOperationalDiagnosticFinding => Boolean(finding))
    .filter((finding) => finding.allowedRoles.includes(role))
}

function deriveLegacyReason(findings: SSIOperationalDiagnosticFinding[]): string {
  if (!findings.length) return 'NONE'
  return [...findings].sort((a, b) => b.weight - a.weight)[0]?.legacyReason ?? 'NONE'
}

function deriveLegacyComplexity(findings: SSIOperationalDiagnosticFinding[]): string {
  if (!findings.length) return 'NONE'
  return [...findings].sort((a, b) => b.weight - a.weight)[0]?.legacyComplexity ?? 'NONE'
}

export function getSSIOperationalDiagnosticFindingsForRole(
  rolePool: SSIRolePool,
): SSIOperationalDiagnosticFinding[] {
  return SSI_OPERATIONAL_DIAGNOSTIC_FINDINGS.filter((finding) =>
    finding.allowedRoles.includes(rolePool),
  )
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

  const findings = getFindingsForInput(input)
  const derived_load_reason =
    findings.length > 0 ? deriveLegacyReason(findings) : input.loadReason || 'NONE'
  const derived_load_complexity =
    findings.length > 0 ? deriveLegacyComplexity(findings) : input.loadComplexity || 'NONE'

  const legacyCombined = `${normalize(derived_load_reason)} ${normalize(derived_load_complexity)}`
  const legacyComplexity =
    derived_load_reason !== 'NONE' &&
    derived_load_complexity !== 'NONE' &&
    !includesAny(legacyCombined, ['none'])

  const complexityPresent = findings.length > 0 || legacyComplexity

  const complexity_flag: SSIComplexityFlag = complexityPresent ? 'YES' : 'NO'

  const complexity_weight =
    findings.length > 0
      ? Math.min(3, Math.max(...findings.map((finding) => finding.weight)) + (findings.length >= 3 ? 1 : 0))
      : complexity_flag === 'NO'
        ? 0
        : includesAny(legacyCombined, [
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

  if (load_modifier === 'HIGHER' && complexity_weight >= 1) {
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
      input.startingAssignmentCount,
      input.baselineCount,
      load_modifier,
      starting_strain_signal,
      findings,
    ),
    derived_load_reason,
    derived_load_complexity,
    reserve_capacity_interpretation: buildReserveCapacityInterpretation(
      input.startingAssignmentCount,
      input.baselineCount,
      findings.length,
    ),
    localized_strain_interpretation: buildLocalizedStrainInterpretation(
      input.rolePool,
      loadDelta,
      findings.length,
    ),
    odf_count: findings.length,
  }
}

function buildReserveCapacityInterpretation(
  startingCount: number,
  baselineCount: number,
  findingCount: number,
): string {
  if (findingCount === 0 && startingCount <= baselineCount) {
    return 'No reserve-capacity concern is identified from this assignment row.'
  }

  if (startingCount < baselineCount && findingCount > 0) {
    return 'Hidden care-intensity strain is present while assignment count remains below baseline. Reserve capacity remains available, but it is already being consumed by operational complexity.'
  }

  if (startingCount === baselineCount && findingCount > 0) {
    return 'Hidden care-intensity strain is present at full baseline utilization. Reserve capacity is exhausted if additional disruption occurs.'
  }

  if (startingCount > baselineCount && findingCount > 0) {
    return 'Visible and hidden strain are both present. Assignment count is above baseline while operational diagnostic findings add care intensity.'
  }

  if (startingCount > baselineCount) {
    return 'Visible strain is present because assignment count is above baseline design.'
  }

  return 'Reserve capacity remains stable from the current evidence.'
}

function buildLocalizedStrainInterpretation(rolePool: string, loadDelta: number, findingCount: number): string {
  if (loadDelta > 0 && findingCount > 0) {
    return `${rolePool} shows localized role-pool strain from both assignment count and operational diagnostic findings.`
  }

  if (loadDelta > 0) {
    return `${rolePool} shows localized visible strain from assignment count above baseline.`
  }

  if (findingCount > 0) {
    return `${rolePool} shows localized hidden care-intensity strain from operational diagnostic findings.`
  }

  return `${rolePool} does not show localized strain in this row.`
}

function buildStructuralStrainSummary(
  unit: string,
  rolePool: string,
  startingCount: number,
  baselineCount: number,
  loadModifier: SSILoadModifier,
  signal: SSIStartingStrainSignal,
  findings: SSIOperationalDiagnosticFinding[],
): string {
  const unitLabel = unit || 'This unit'
  const roleLabel = rolePool || 'this role entry'
  const findingCount = findings.length
  const findingText =
    findingCount > 0
      ? findings.map((finding) => finding.label).join(', ')
      : 'no operational diagnostic findings selected'

  if (signal === 'SEVERE_STARTING_STRAIN') {
    return `${unitLabel} starts above baseline for ${roleLabel}. Operational diagnostic findings indicate ${findingText}. Severe starting strain is present because visible workload and hidden care intensity coexist.`
  }

  if (signal === 'VISIBLE_STARTING_STRAIN') {
    return `${unitLabel} starts above baseline for ${roleLabel}. Workload strain is visible at shift start.`
  }

  if (signal === 'HIDDEN_STRAIN_PRESENT') {
    if (startingCount < baselineCount) {
      return `${unitLabel} starts below baseline count for ${roleLabel}, but operational diagnostic findings indicate ${findingText}. Hidden care-intensity strain is present with remaining reserve capacity.`
    }

    if (startingCount === baselineCount) {
      return `${unitLabel} starts at full baseline for ${roleLabel}, and operational diagnostic findings indicate ${findingText}. Hidden care-intensity strain is present with exhausted reserve capacity.`
    }

    return `${unitLabel} shows hidden care-intensity strain in ${roleLabel}. Operational diagnostic findings indicate ${findingText}.`
  }

  if (loadModifier === 'LOWER') {
    return `${unitLabel} starts below baseline count for ${roleLabel}. No structural strain is identified from current evidence, but redistribution should remain visible to leadership.`
  }

  return `${unitLabel} starts within baseline design for ${roleLabel}. No structural strain is identified from current operational evidence.`
}

export function calculateSSIAssignmentStrainSnapshot(
  rows: SSIAssignmentSnapshotRow[],
): SSIAssignmentStrainSnapshot {
  const outputs = rows.map((row) => row.output).filter(Boolean) as SSIAssignmentOutput[]

  const hidden_strain_count = outputs.filter(
    (output) => output.starting_strain_signal === 'HIDDEN_STRAIN_PRESENT',
  ).length

  const visible_strain_count = outputs.filter(
    (output) => output.starting_strain_signal === 'VISIBLE_STARTING_STRAIN',
  ).length

  const severe_strain_count = outputs.filter(
    (output) => output.starting_strain_signal === 'SEVERE_STARTING_STRAIN',
  ).length

  const assignment_load_skew = outputs.reduce((sum, output) => {
    const visibleBurden = Math.max(0, output.load_modifier_delta)
    const hiddenBurden = output.odf_count > 0 ? Math.max(1, output.complexity_weight) : 0
    return sum + visibleBurden + hiddenBurden
  }, 0)

  const odfRows = outputs.filter((output) => output.odf_count > 0).length

  let structural_strain_reading = 'Not calculated yet'

  if (outputs.length > 0) {
    if (severe_strain_count > 0) {
      structural_strain_reading =
        'Severe shift-start strain is visible. At least one role entry starts above baseline while operational diagnostic findings add hidden care intensity.'
    } else if (visible_strain_count > 0) {
      structural_strain_reading =
        'Visible shift-start strain is present. At least one role entry starts above baseline.'
    } else if (hidden_strain_count > 0) {
      structural_strain_reading =
        'Hidden structural strain is present. The shift may look numerically balanced or below baseline, but operational diagnostic findings show localized care-intensity burden.'
    } else if (odfRows > 0) {
      structural_strain_reading =
        'Operational diagnostic findings are present, but current strain thresholds do not classify the shift as strained.'
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
  const highTiming = includesAny(timing, ['pre_shift', 'pre-shift', 'late', 'last_minute', 'last-minute'])
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
  if (buffer === '') return 'No operational buffer response was recorded.'
  if (includesAny(buffer, ['overtime'])) return 'Stability was preserved by extending labor beyond normal design.'
  if (includesAny(buffer, ['agency'])) return 'Stability was preserved by external staffing support.'
  if (includesAny(buffer, ['float'])) return 'Stability was preserved by moving internal staff across units.'
  if (includesAny(buffer, ['redistribution'])) return 'Stability was preserved by redistributing assignments.'
  if (includesAny(buffer, ['charge nurse'])) return 'Stability was preserved by consuming charge nurse capacity.'
  if (includesAny(buffer, ['medication pass'])) return 'Stability was preserved by medication-pass support.'
  if (includesAny(buffer, ['supervisor'])) return 'Stability was preserved by supervisor support.'
  return 'Stability was preserved by a local buffer response.'
}