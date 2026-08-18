'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'

import {
SSI_COMMON_SHIFT_BLOCK_OPTIONS,
SSI_SHIFT_TYPE_OPTIONS,
buildSSIShiftAssignmentId,
calculateSSIAssignment,
calculateSSIAssignmentStrainSnapshot,
getSSIOperationalDiagnosticFindingsForRole,
} from '@/lib/ssi/ssiContinuityEngine'
import { supabase } from '@/lib/supabase'

type RolePool = 'RN' | 'LPN' | 'CNA'

type ShiftHeader = {
unit: string
date: string
shiftType: string
shiftBlock: string
}

type RoleRow = {
id: string
rolePool: RolePool
entryNumber: number
active: boolean
baselineDesign: string
startingAssignmentCount: string
baselineCount: string
operationalDiagnosticFindings: string[]
}

type FindingCategory =
| 'Clinical Intensity'
| 'Monitoring / Supervision'
| 'Medication / Licensed Workflow'
| 'Flow / Coordination'
| 'Staffing / Workforce'
| 'Environment / Equipment'

type FrozenAssignment = {
roleEntry: string
assignmentId: string
baselineDesign: string
startingAssignmentCount: number
baselineCount: number
functionalFindings: string[]
startingStrainSignal: string
functionalState: string
scientificInterpretation: string
functionalReserveEvidence: string
localizedFunctionalStrain: string
persistenceRow: Record<string, unknown>
}

type FrozenSnapshot = {
activeAssignmentCount: number
hiddenStrainCount: number
visibleStrainCount: number
severeStrainCount: number
concurrentDemandRowCount: number
mostFrequentTruthfulFinding: string
dominantFunctionalLoadPattern: string
functionalObservationReading: string
observationBoundary: string
}

type SavedObservation = {
id: string
observationCode: string
organizationId: string
unit: string
assignmentDate: string
shiftType: string
shiftBlock: string
observedAt: string
createdAt: string
engineVersion: string
doctrineVersion: string
instrumentVersion: string
recordStatus: string
assignments: FrozenAssignment[]
snapshot: FrozenSnapshot
}

type SavedObservationRpcRecord = Record<string, unknown>

type RetrievalFilters = {
unit: string
windowStart: string
windowEnd: string
shiftType: string
shiftBlock: string
}

type SavedObservationRecord = {
id: string
observation_code: string
organization_id: string
unit: string
assignment_date: string
shift_type: string
shift_block: string
observed_at: string
created_at: string
engine_version: string
doctrine_version: string
instrument_version: string
record_status: string
snapshot_payload: unknown
}

const OBSERVATION_BOUNDARY =
'This observation is limited to the current shift-start configuration. Functional Regulation and Functional Condition require integration with operational variation and longitudinal evidence.'

const allowedRoles = ['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']
const allowedStatuses = ['ACTIVE']

const ACCESS_TIMEOUT_MS = 12000
const SAVE_TIMEOUT_MS = 20000

const ACCESS_FAILURE_MESSAGE =
'SSI could not verify access. Check the connection and try again.'

const SAVE_FAILURE_MESSAGE =
'The functional observation could not be saved. No rows were added. Check the connection and try again.'

const roleSections: { rolePool: RolePool; count: number }[] = [
{ rolePool: 'RN', count: 6 },
{ rolePool: 'LPN', count: 6 },
{ rolePool: 'CNA', count: 8 },
]

const BASELINE_DESIGN_OPTIONS = [
'1:1',
'1:2',
'1:3',
'1:4',
'1:5',
'1:6',
'1:7',
'1:8',
'1:9',
'1:10',
'1:11',
'1:12',
'CUSTOM',
] as const

const findingCategoryOrder: FindingCategory[] = [
'Clinical Intensity',
'Monitoring / Supervision',
'Medication / Licensed Workflow',
'Flow / Coordination',
'Staffing / Workforce',
'Environment / Equipment',
]

const ssiFlow = [
{
label: 'Functional Observation',
href: '/ssi/assignments',
note: 'Shift-start truthful operational evidence',
active: true,
},
{
label: 'Operational Variation',
href: '/ssi/events',
note: 'Operational disruption evidence',
active: false,
},
{
label: 'Functional Assessment',
href: '/ssi/dashboard',
note: 'Longitudinal functional assessment',
active: false,
},
{
label: 'Executive Scientific Explanation',
href: '/ssi',
note: 'Transparent executive explanation',
active: false,
},
{
label: 'Weekly Stability Brief',
href: '/ssi/weekly-brief',
note: 'Weekly longitudinal clinical note',
active: false,
},
]

const initialHeader: ShiftHeader = {
unit: '',
date: '',
shiftType: 'DAY',
shiftBlock: '07:00-19:00',
}

const initialRetrievalFilters: RetrievalFilters = {
unit: '',
windowStart: '',
windowEnd: '',
shiftType: 'DAY',
shiftBlock: '07:00-19:00',
}

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

function makeInitialRows(): RoleRow[] {
return roleSections.flatMap(({ rolePool, count }) =>
Array.from({ length: count }, (_, index) => ({
id: `${rolePool}-${index + 1}`,
rolePool,
entryNumber: index + 1,
active: index === 0,
baselineDesign: '',
startingAssignmentCount: '',
baselineCount: '',
operationalDiagnosticFindings: [],
})),
)
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

function deriveBaselineCount(
baselineDesign: string,
manualBaselineCount: string,
) {
const normalizedDesign = baselineDesign.trim().toUpperCase()

if (normalizedDesign === 'CUSTOM') {
return manualBaselineCount.trim() === ''
? Number.NaN
: Number(manualBaselineCount)
}

const match = baselineDesign.trim().match(/^1\s*:\s*(\d+)$/)

if (!match) {
return Number.NaN
}

return Number(match[1])
}

function displayFindingCategory(category: string): FindingCategory {
if (category === 'Monitoring') return 'Monitoring / Supervision'
if (category === 'Medication') return 'Medication / Licensed Workflow'
if (category === 'Flow') return 'Flow / Coordination'
if (category === 'Staffing') return 'Staffing / Workforce'
if (category === 'Environment') return 'Environment / Equipment'
return 'Clinical Intensity'
}

function compactFindingLabel(label: string) {
return label
.replace(' care recipient assigned', '')
.replace(' care recipients assigned', '')
.replace(' assigned', '')
.replace(' required', '')
.replace(' cluster', '')
.replace('High-acuity', 'High acuity')
.replace('Complex wound care', 'Complex wound')
.replace('Medication workload pressure', 'Medication workload')
.replace('Missed medication risk', 'Missed medication')
.replace('Admission/discharge pressure', 'Admission/discharge')
.replace('Memory-care supervision density', 'Memory supervision')
.replace('Isolation/equipment burden', 'Isolation/equipment')
}

function displayStructuralDiagnosis(value?: string) {
if (value === 'STABLE_START') return 'Stable Shift-Start State'
if (value === 'HIDDEN_STRAIN_PRESENT') return 'Hidden Functional Strain'
if (value === 'VISIBLE_STARTING_STRAIN') {
return 'Visible Shift-Start Functional Strain'
}
if (value === 'SEVERE_STARTING_STRAIN') {
return 'Severe Shift-Start Functional Strain'
}

return 'Not calculated yet'
}

function escapeSavedText(value: unknown) {
return String(value ?? '')
.replace(/&/g, '&amp;')
.replace(/</g, '&lt;')
.replace(/>/g, '&gt;')
.replace(/"/g, '&quot;')
.replace(/'/g, '&#39;')
}

function readRpcString(
record: SavedObservationRpcRecord,
...keys: string[]
) {
for (const key of keys) {
const value = record[key]
if (value !== null && value !== undefined) {
return String(value)
}
}
return ''
}

function readRecordString(record: Record<string, unknown>, key: string) {
const value = record[key]
return value === null || value === undefined ? '' : String(value)
}

function readRecordNumber(record: Record<string, unknown>, key: string) {
const value = Number(record[key])
return Number.isFinite(value) ? value : 0
}

function reconstructSavedObservation(
record: SavedObservationRecord,
): SavedObservation | null {
if (
!record.snapshot_payload ||
typeof record.snapshot_payload !== 'object' ||
Array.isArray(record.snapshot_payload)
) {
return null
}

const payload = record.snapshot_payload as Record<string, unknown>
const snapshotValue = payload.snapshot
const assignmentsValue = payload.assignments

if (
!snapshotValue ||
typeof snapshotValue !== 'object' ||
Array.isArray(snapshotValue) ||
!Array.isArray(assignmentsValue)
) {
return null
}

const snapshotRecord = snapshotValue as Record<string, unknown>

const assignments: FrozenAssignment[] = assignmentsValue.map(
(value, index) => {
const assignment =
value && typeof value === 'object' && !Array.isArray(value)
? (value as Record<string, unknown>)
: {}

const findings = Array.isArray(assignment.functionalFindings)
? assignment.functionalFindings.map((finding) => String(finding))
: []

return {
roleEntry:
readRecordString(assignment, 'roleEntry') || `Assignment ${index + 1}`,
assignmentId: readRecordString(assignment, 'assignmentId'),
baselineDesign: readRecordString(assignment, 'baselineDesign'),
startingAssignmentCount: readRecordNumber(
assignment,
'startingAssignmentCount',
),
baselineCount: readRecordNumber(assignment, 'baselineCount'),
functionalFindings: findings,
startingStrainSignal: readRecordString(
assignment,
'startingStrainSignal',
),
functionalState: readRecordString(assignment, 'functionalState'),
scientificInterpretation: readRecordString(
assignment,
'scientificInterpretation',
),
functionalReserveEvidence: readRecordString(
assignment,
'functionalReserveEvidence',
),
localizedFunctionalStrain: readRecordString(
assignment,
'localizedFunctionalStrain',
),
persistenceRow: {},
}
},
)

const snapshot: FrozenSnapshot = {
activeAssignmentCount: readRecordNumber(
snapshotRecord,
'activeAssignmentCount',
),
hiddenStrainCount: readRecordNumber(snapshotRecord, 'hiddenStrainCount'),
visibleStrainCount: readRecordNumber(
snapshotRecord,
'visibleStrainCount',
),
severeStrainCount: readRecordNumber(snapshotRecord, 'severeStrainCount'),
concurrentDemandRowCount: readRecordNumber(
snapshotRecord,
'concurrentDemandRowCount',
),
mostFrequentTruthfulFinding: readRecordString(
snapshotRecord,
'mostFrequentTruthfulFinding',
),
dominantFunctionalLoadPattern: readRecordString(
snapshotRecord,
'dominantFunctionalLoadPattern',
),
functionalObservationReading: readRecordString(
snapshotRecord,
'functionalObservationReading',
),
observationBoundary:
readRecordString(snapshotRecord, 'observationBoundary') ||
OBSERVATION_BOUNDARY,
}

return {
id: record.id,
observationCode: record.observation_code,
organizationId: record.organization_id,
unit: record.unit,
assignmentDate: record.assignment_date,
shiftType: record.shift_type,
shiftBlock: record.shift_block,
observedAt: record.observed_at,
createdAt: record.created_at,
engineVersion: record.engine_version,
doctrineVersion: record.doctrine_version,
instrumentVersion: record.instrument_version,
recordStatus: record.record_status,
assignments,
snapshot,
}
}

function buildSavedObservationHtml(saved: SavedObservation) {
const e = escapeSavedText
const assignmentSections = saved.assignments
.map(
(assignment) => `
<section class="assignment">
<h2>${e(assignment.roleEntry)}</h2>
<div class="grid">
<div><strong>Role Entry</strong><span>${e(assignment.roleEntry)}</span></div>
<div><strong>Assignment ID</strong><span>${e(assignment.assignmentId)}</span></div>
<div><strong>Baseline Design</strong><span>${e(assignment.baselineDesign)}</span></div>
<div><strong>Starting Assignment Count</strong><span>${e(assignment.startingAssignmentCount)}</span></div>
<div><strong>Baseline Count</strong><span>${e(assignment.baselineCount)}</span></div>
</div>
<h3>Shift-Start Functional Findings</h3>
<ul>${assignment.functionalFindings.length > 0
? assignment.functionalFindings.map((finding) => `<li>${e(finding)}</li>`).join('')
: '<li>None recorded</li>'}</ul>
<div class="detail"><strong>Shift-Start Functional State</strong><p>${e(assignment.functionalState)}</p></div>
<div class="detail"><strong>Shift-Start Scientific Interpretation</strong><p>${e(assignment.scientificInterpretation)}</p></div>
<div class="detail"><strong>Functional Reserve Evidence</strong><p>${e(assignment.functionalReserveEvidence)}</p></div>
<div class="detail"><strong>Localized Functional Strain</strong><p>${e(assignment.localizedFunctionalStrain)}</p></div>
</section>`,
)
.join('')

return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>TSINAXA SSI — Functional Observation ${e(saved.observationCode)}</title>
<style>
body{font-family:Arial,sans-serif;background:#fff;color:#171717;margin:0;padding:32px;line-height:1.5}
main{max-width:980px;margin:0 auto}
header{border-bottom:3px solid #171717;padding-bottom:18px;margin-bottom:24px}
h1{margin:4px 0 0;font-size:30px} h2{font-size:20px;margin:0 0 14px} h3{font-size:15px;margin:18px 0 8px}
.eyebrow{font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.grid div,.detail,.snapshot div{border:1px solid #d7d7d7;border-radius:8px;padding:10px}
.grid strong,.snapshot strong{display:block;font-size:11px;text-transform:uppercase;margin-bottom:4px}
.grid span,.snapshot span{overflow-wrap:anywhere}
.assignment,.snapshot{page-break-inside:avoid;border:1px solid #bdbdbd;border-radius:10px;padding:18px;margin:0 0 18px}
.detail{margin-top:10px}.detail p{margin:5px 0 0}.snapshot-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.boundary{grid-column:1/-1}
@media print{body{padding:0}.assignment,.snapshot{break-inside:avoid}}
</style>
</head>
<body>
<main>
<header><div class="eyebrow">TSINAXA SSI</div><h1>Functional Observation</h1></header>
<section class="assignment">
<h2>Observation Identity</h2>
<div class="grid">
<div><strong>Observation Code</strong><span>${e(saved.observationCode)}</span></div>
<div><strong>Unit</strong><span>${e(saved.unit)}</span></div>
<div><strong>Date</strong><span>${e(saved.assignmentDate)}</span></div>
<div><strong>Shift Type</strong><span>${e(saved.shiftType)}</span></div>
<div><strong>Shift Block</strong><span>${e(saved.shiftBlock)}</span></div>
<div><strong>Saved At</strong><span>${e(saved.createdAt || saved.observedAt)}</span></div>
<div><strong>Engine Version</strong><span>${e(saved.engineVersion)}</span></div>
<div><strong>Doctrine Version</strong><span>${e(saved.doctrineVersion)}</span></div>
<div><strong>Instrument Version</strong><span>${e(saved.instrumentVersion)}</span></div>
<div><strong>Record Status</strong><span>${e(saved.recordStatus)}</span></div>
</div>
</section>
${assignmentSections}
<section class="snapshot">
<h2>Whole-Observation Snapshot</h2>
<div class="snapshot-grid">
<div><strong>Hidden Strain Rows</strong><span>${e(saved.snapshot.hiddenStrainCount)}</span></div>
<div><strong>Visible Strain Rows</strong><span>${e(saved.snapshot.visibleStrainCount)}</span></div>
<div><strong>Severe Strain Rows</strong><span>${e(saved.snapshot.severeStrainCount)}</span></div>
<div><strong>Most Frequent Truthful Finding</strong><span>${e(saved.snapshot.mostFrequentTruthfulFinding)}</span></div>
<div><strong>Dominant Functional Load Pattern</strong><span>${e(saved.snapshot.dominantFunctionalLoadPattern)}</span></div>
<div><strong>Shift-Start Functional Reading</strong><span>${e(saved.snapshot.functionalObservationReading)}</span></div>
<div class="boundary"><strong>Observation Boundary</strong><span>${e(saved.snapshot.observationBoundary)}</span></div>
</div>
</section>
</main>
</body>
</html>`
}

export default function SSIAssignmentsPage() {
const router = useRouter()
const mountedRef = useRef(false)
const accessAttemptRef = useRef(0)

const [authorized, setAuthorized] = useState(false)
const [organizationId, setOrganizationId] = useState<string | null>(null)
const [checkingAccess, setCheckingAccess] = useState(true)
const [accessFailure, setAccessFailure] = useState(false)
const [redirectingToLogin, setRedirectingToLogin] = useState(false)
const [loggingOut, setLoggingOut] = useState(false)

const [header, setHeader] = useState<ShiftHeader>(initialHeader)
const [rows, setRows] = useState<RoleRow[]>(makeInitialRows)
const [saving, setSaving] = useState(false)
const [message, setMessage] = useState('')
const [snapshotOpen, setSnapshotOpen] = useState(true)
const [savedObservation, setSavedObservation] =
useState<SavedObservation | null>(null)
const [retrievalFilters, setRetrievalFilters] =
useState<RetrievalFilters>(initialRetrievalFilters)
const [retrieving, setRetrieving] = useState(false)
const [retrievalMessage, setRetrievalMessage] = useState('')
const [retrievedObservations, setRetrievedObservations] = useState<
SavedObservation[]
>([])
const [retrievalOpen, setRetrievalOpen] = useState(true)
const [savedObservationOpen, setSavedObservationOpen] = useState(true)

const [expandedSections, setExpandedSections] = useState<
  Record<RolePool, boolean>
>({
RN: true,
LPN: false,
CNA: false,
})

const [expandedFindings, setExpandedFindings] = useState<
  Record<string, boolean>
>({})

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
const result = await withTimeout(
supabase.auth.signOut(),
ACCESS_TIMEOUT_MS,
)

  if (result.error) {
    console.error('SSI sign-out service error.', result.error)
  }
} catch (error) {
  console.error('SSI sign-out operation failed.', error)
} finally {
  // Navigation recovery is handled by the calling operation.
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
setOrganizationId(null)

try {
  const {
    data: { session },
    error: sessionError,
  } = await withTimeout(
    supabase.auth.getSession(),
    ACCESS_TIMEOUT_MS,
  )

  if (sessionError) {
    throw sessionError
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

  const { data: roleRecord, error: roleError } = await withTimeout(
    supabase
      .from('user_roles')
      .select('role,status,organization_id')
      .eq('user_id', session.user.id)
      .maybeSingle(),
    ACCESS_TIMEOUT_MS,
  )

  if (roleError) {
    throw roleError
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
   allowedStatuses.includes(roleRecord?.status ?? '') &&
   Boolean(roleRecord?.organization_id)

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

  setOrganizationId(roleRecord?.organization_id ?? null)
  setAuthorized(true)
} catch (error) {
  console.error('SSI assignment access verification failed.', error)

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

const activeRows = rows.filter((row) => row.active)

const calculatedRows = useMemo(() => {
return activeRows.map((row) => {
const startingCount = Number(row.startingAssignmentCount)
const baselineCount = deriveBaselineCount(
row.baselineDesign,
row.baselineCount,
)

  const assignmentId = buildSSIShiftAssignmentId(
    header.date,
    header.shiftType,
    row.rolePool,
    row.entryNumber,
  )

  const canCalculate =
    row.baselineDesign.trim() !== '' &&
    row.startingAssignmentCount.trim() !== '' &&
    Number.isFinite(startingCount) &&
    Number.isFinite(baselineCount) &&
    baselineCount > 0

  const output = canCalculate
    ? calculateSSIAssignment({
        assignmentId,
        unit: header.unit,
        rolePool: `${row.rolePool} ${row.entryNumber}`,
        shiftType: header.shiftType,
        shiftBlock: header.shiftBlock,
        date: header.date,
        baselineDesign: row.baselineDesign,
        startingAssignmentCount: startingCount,
        baselineCount,
        operationalDiagnosticFindings:
          row.operationalDiagnosticFindings,
      })
    : null

  return {
    row,
    assignmentId,
    baselineCount,
    canCalculate,
    output,
  }
})

}, [activeRows, header])

const snapshot = useMemo(
() =>
calculateSSIAssignmentStrainSnapshot(
calculatedRows.map((item) => ({
loadReason: item.output?.derived_load_reason ?? 'NONE',
loadComplexity:
item.output?.derived_load_complexity ?? 'NONE',
operationalDiagnosticFindings:
item.row.operationalDiagnosticFindings,
output: item.output,
})),
),
[calculatedRows],
)

function updateHeader(field: keyof ShiftHeader, value: string) {
setHeader((current) => ({
...current,
[field]: value,
}))
}

function updateRow(
id: string,
field: keyof RoleRow,
value: string | boolean | string[],
) {
setRows((current) =>
current.map((row) =>
row.id === id
? {
...row,
[field]: value,
}
: row,
),
)
}

function updateBaselineDesign(id: string, value: string) {
setRows((current) =>
current.map((row) =>
row.id === id
? {
...row,
baselineDesign: value,
baselineCount: value === 'CUSTOM' ? row.baselineCount : '',
}
: row,
),
)
}

function toggleFinding(row: RoleRow, finding: string) {
const selected = row.operationalDiagnosticFindings.includes(finding)
? row.operationalDiagnosticFindings.filter(
(item) => item !== finding,
)
: [...row.operationalDiagnosticFindings, finding]

updateRow(row.id, 'operationalDiagnosticFindings', selected)

}

function toggleSection(rolePool: RolePool) {
setExpandedSections((current) => ({
...current,
[rolePool]: !current[rolePool],
}))
}

function toggleFindingPanel(id: string) {
setExpandedFindings((current) => ({
...current,
[id]: !current[id],
}))
}

async function handleLogout() {
if (loggingOut) {
return
}

setLoggingOut(true)

try {
  const result = await withTimeout(
    supabase.auth.signOut(),
    ACCESS_TIMEOUT_MS,
  )

  if (result.error) {
    console.error('SSI logout service error.', result.error)
  }
} catch (error) {
  console.error('SSI logout operation failed.', error)
} finally {
  router.replace('/ssi/login')
  router.refresh()

  if (mountedRef.current) {
    setLoggingOut(false)
  }
}

}

function updateRetrievalFilter(
field: keyof RetrievalFilters,
value: string,
) {
setRetrievalFilters((current) => ({
...current,
[field]: value,
}))
}

async function handleRetrieveSavedObservations() {
if (retrieving) {
return
}

setRetrievalMessage('')
setRetrievedObservations([])

if (!organizationId) {
setRetrievalMessage(
'SSI could not verify the healthcare organization. Please sign in again.',
)
return
}

if (
!retrievalFilters.unit.trim() ||
!retrievalFilters.windowStart ||
!retrievalFilters.windowEnd ||
!retrievalFilters.shiftType ||
!retrievalFilters.shiftBlock
) {
setRetrievalMessage(
'Complete Unit, Window Start, Window End, Shift Type, and Shift Block.',
)
return
}

if (retrievalFilters.windowStart > retrievalFilters.windowEnd) {
setRetrievalMessage('Window Start cannot be later than Window End.')
return
}

setRetrieving(true)

try {
const { data, error } = await withTimeout(
supabase
.from('ssi_functional_observations')
.select(
'id,observation_code,organization_id,unit,assignment_date,shift_type,shift_block,observed_at,created_at,engine_version,doctrine_version,instrument_version,record_status,snapshot_payload',
)
.eq('organization_id', organizationId)
.eq('unit', retrievalFilters.unit.trim())
.gte('assignment_date', retrievalFilters.windowStart)
.lte('assignment_date', retrievalFilters.windowEnd)
.eq('shift_type', retrievalFilters.shiftType)
.eq('shift_block', retrievalFilters.shiftBlock)
.order('assignment_date', { ascending: false })
.order('created_at', { ascending: false }),
ACCESS_TIMEOUT_MS,
)

if (error) {
throw error
}

const observations = ((data ?? []) as SavedObservationRecord[])
.map(reconstructSavedObservation)
.filter(
(observation): observation is SavedObservation =>
observation !== null,
)

if (!mountedRef.current) {
return
}

setRetrievedObservations(observations)

if (observations.length === 0) {
setRetrievalMessage(
'No saved Functional Observations match this unit, date window, Shift Type, and Shift Block.',
)
return
}

if (observations.length === 1) {
setSavedObservation(observations[0])
setRetrievalOpen(false)
setSavedObservationOpen(true)
setRetrievalMessage(`Retrieved ${observations[0].observationCode}.`)
return
}

setRetrievalMessage(
`Retrieved ${observations.length} saved Functional Observations. Select the exact Observation Code to open.`,
)
} catch (error) {
console.error('SSI Functional Observation retrieval failed.', error)

if (mountedRef.current) {
setRetrievalMessage(
'SSI could not retrieve saved Functional Observations. Check the connection and try again.',
)
}
} finally {
if (mountedRef.current) {
setRetrieving(false)
}
}
}

function handleOpenRetrievedObservation(observation: SavedObservation) {
setSavedObservation(observation)
setRetrievalOpen(false)
setSavedObservationOpen(true)
setRetrievalMessage(`Opened ${observation.observationCode}.`)
}

function handlePrintSavedObservation() {
if (!savedObservation) {
return
}

const printWindow = window.open(
'',
'_blank',
'width=980,height=760,resizable=yes,scrollbars=yes',
)

if (!printWindow) {
setMessage('The saved Functional Observation could not be opened for printing.')
return
}

printWindow.opener = null

const closePrintWindow = () => {
if (!printWindow.closed) {
printWindow.close()
}
}

const openPrintDialog = () => {
if (printWindow.closed) {
return
}

printWindow.focus()
printWindow.print()
}

printWindow.addEventListener(
'afterprint',
() => {
if (mountedRef.current) {
setSavedObservationOpen(false)
}
closePrintWindow()
},
{ once: true },
)
printWindow.document.open()
printWindow.document.write(buildSavedObservationHtml(savedObservation))
printWindow.document.close()

if (printWindow.document.readyState === 'complete') {
printWindow.setTimeout(openPrintDialog, 250)
} else {
printWindow.addEventListener(
'load',
() => printWindow.setTimeout(openPrintDialog, 250),
{ once: true },
)
}
}

function handleDownloadSavedObservation() {
if (!savedObservation) {
return
}

const html = buildSavedObservationHtml(savedObservation)
const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
const objectUrl = URL.createObjectURL(blob)
const anchor = document.createElement('a')

anchor.href = objectUrl
anchor.download = `TSINAXA-Functional-Observation-${savedObservation.observationCode}.html`
document.body.appendChild(anchor)
anchor.click()
anchor.remove()
URL.revokeObjectURL(objectUrl)
}

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
event.preventDefault()

if (saving) {
  return
}

setMessage('')
if (!organizationId) {
  setMessage(
    'SSI could not verify the healthcare organization. Please sign in again.',
  )
  return
}

if (
  !header.unit.trim() ||
  !header.date.trim() ||
  !header.shiftType ||
  !header.shiftBlock
) {
  setMessage(
    'Complete the Unit, Date, Shift Type, and Shift Block before saving.',
  )
  return
}

if (!isValidCalendarDate(header.date)) {
  setMessage(
    'Enter a valid calendar date in YYYY-MM-DD format, for example 2026-03-06.',
  )
  return
}

if (calculatedRows.length === 0) {
  setMessage(
    'Activate and complete at least one role entry before saving.',
  )
  return
}

if (
  calculatedRows.some(
    (item) =>
      !item.row.baselineDesign.trim() ||
      !item.canCalculate ||
      !item.output,
  )
) {
  setMessage(
    'Every active row needs a Baseline Design, Starting Assignment Count, and a valid Custom Baseline Count when CUSTOM is selected.',
  )
  return
}

setSaving(true)

try {
  const payload = calculatedRows.map((item) => {
    if (!item.output) {
      throw new Error('SSI_ASSIGNMENT_OUTPUT_UNAVAILABLE')
    }

    
    return {
        
      organization_id: organizationId,
      assignment_id: item.assignmentId,
      unit: header.unit,
      role_pool: `${item.row.rolePool} ${item.row.entryNumber}`,
      shift_type: header.shiftType,
      shift_block: header.shiftBlock,
      assignment_date: header.date,
      baseline_design: item.row.baselineDesign,
      starting_assignment_count: Number(
        item.row.startingAssignmentCount,
      ),
      baseline_count: item.baselineCount,
      load_reason: item.output.derived_load_reason,
      load_complexity: item.output.derived_load_complexity,
      load_modifier: item.output.load_modifier_delta,
      complexity_flag: item.output.complexity_flag === 'YES',
      complexity_status: item.output.complexity_status,
      starting_strain_signal:
        item.output.starting_strain_signal,
      complexity_weight: item.output.complexity_weight,
      operational_diagnostic_findings:
        item.output.operational_diagnostic_findings,
      structural_drivers: item.output.structural_drivers,
      workload_composition: item.output.workload_composition,
      derived_strain_signals: item.output.derived_strain_signals,
      reserve_capacity_status:
        item.output.reserve_capacity_status,
      localized_overload_flag:
        item.output.localized_overload_flag,
      localized_strain_interpretation:
        item.output.localized_strain_interpretation,
      above_baseline_flag: item.output.above_baseline_flag,
      assignment_overload_delta:
        item.output.assignment_overload_delta,
    }
  })

  const frozenAssignments: FrozenAssignment[] = calculatedRows.map(
    (item, index) => {
      if (!item.output) {
        throw new Error('SSI_ASSIGNMENT_OUTPUT_UNAVAILABLE')
      }

      return {
        roleEntry: `${item.row.rolePool} ${item.row.entryNumber}`,
        assignmentId: item.assignmentId,
        baselineDesign: item.row.baselineDesign,
        startingAssignmentCount: Number(item.row.startingAssignmentCount),
        baselineCount: item.baselineCount,
        functionalFindings: [...item.row.operationalDiagnosticFindings],
        startingStrainSignal: item.output.starting_strain_signal,
        functionalState: displayStructuralDiagnosis(
          item.output.starting_strain_signal,
        ),
        scientificInterpretation: item.output.structural_strain_summary,
        functionalReserveEvidence:
          item.output.reserve_capacity_interpretation,
        localizedFunctionalStrain:
          item.output.localized_strain_interpretation,
        persistenceRow: { ...payload[index] },
      }
    },
  )

  const frozenSnapshot: FrozenSnapshot = {
    activeAssignmentCount: calculatedRows.length,
    hiddenStrainCount: snapshot.hidden_strain_count,
    visibleStrainCount: snapshot.visible_strain_count,
    severeStrainCount: snapshot.severe_strain_count,
    concurrentDemandRowCount: frozenAssignments.filter(
      (assignment) => assignment.functionalFindings.length > 1,
    ).length,
    mostFrequentTruthfulFinding: snapshot.dominant_load_reason,
    dominantFunctionalLoadPattern: snapshot.dominant_load_complexity,
    functionalObservationReading: snapshot.structural_strain_reading,
    observationBoundary: OBSERVATION_BOUNDARY,
  }

  const frozenObservation = {
    organizationId,
    unit: header.unit,
    assignmentDate: header.date,
    shiftType: header.shiftType,
    shiftBlock: header.shiftBlock,
    assignments: frozenAssignments,
    snapshot: frozenSnapshot,
  }

  const snapshotPayload = {
    observation: {
      unit: frozenObservation.unit,
      assignmentDate: frozenObservation.assignmentDate,
      shiftType: frozenObservation.shiftType,
      shiftBlock: frozenObservation.shiftBlock,
    },
    snapshot: frozenObservation.snapshot,
    assignments: frozenObservation.assignments.map(
      ({ persistenceRow: _persistenceRow, ...assignment }) => assignment,
    ),
  }

  const { data, error } = await withTimeout(
    supabase.rpc('save_ssi_functional_observation', {
      p_organization_id: frozenObservation.organizationId,
      p_unit: frozenObservation.unit,
      p_assignment_date: frozenObservation.assignmentDate,
      p_shift_type: frozenObservation.shiftType,
      p_shift_block: frozenObservation.shiftBlock,
      p_active_assignment_count:
        frozenObservation.snapshot.activeAssignmentCount,
      p_hidden_strain_count:
        frozenObservation.snapshot.hiddenStrainCount,
      p_visible_strain_count:
        frozenObservation.snapshot.visibleStrainCount,
      p_severe_strain_count:
        frozenObservation.snapshot.severeStrainCount,
      p_concurrent_demand_row_count:
        frozenObservation.snapshot.concurrentDemandRowCount,
      p_most_frequent_truthful_finding:
        frozenObservation.snapshot.mostFrequentTruthfulFinding,
      p_dominant_functional_load_pattern:
        frozenObservation.snapshot.dominantFunctionalLoadPattern,
      p_functional_observation_reading:
        frozenObservation.snapshot.functionalObservationReading,
      p_observation_boundary:
        frozenObservation.snapshot.observationBoundary,
      p_snapshot_payload: snapshotPayload,
      p_assignment_rows: payload,
    }),
    SAVE_TIMEOUT_MS,
  )

  if (error) {
    throw error
  }

  const rpcRecord = (
    Array.isArray(data) ? data[0] : data
  ) as SavedObservationRpcRecord | null

  if (!rpcRecord) {
    throw new Error('SSI_FUNCTIONAL_OBSERVATION_RPC_RETURN_MISSING')
  }

  const observationCode = readRpcString(
    rpcRecord,
    'observation_code',
    'observationCode',
  )

  const savedId = readRpcString(
    rpcRecord,
    'id',
    'functional_observation_id',
    'functionalObservationId',
  )

  if (!observationCode || !savedId) {
    throw new Error('SSI_FUNCTIONAL_OBSERVATION_RPC_RETURN_INVALID')
  }

  const nextSavedObservation: SavedObservation = {
    id: savedId,
    observationCode,
    organizationId: frozenObservation.organizationId,
    unit: frozenObservation.unit,
    assignmentDate: frozenObservation.assignmentDate,
    shiftType: frozenObservation.shiftType,
    shiftBlock: frozenObservation.shiftBlock,
    observedAt: readRpcString(rpcRecord, 'observed_at', 'observedAt'),
    createdAt: readRpcString(rpcRecord, 'created_at', 'createdAt'),
    engineVersion: readRpcString(
      rpcRecord,
      'engine_version',
      'engineVersion',
    ),
    doctrineVersion: readRpcString(
      rpcRecord,
      'doctrine_version',
      'doctrineVersion',
    ),
    instrumentVersion: readRpcString(
      rpcRecord,
      'instrument_version',
      'instrumentVersion',
    ),
    recordStatus: readRpcString(
      rpcRecord,
      'record_status',
      'recordStatus',
      'status',
    ),
    assignments: frozenObservation.assignments,
    snapshot: frozenObservation.snapshot,
  }

  if (!mountedRef.current) {
    return
  }

  setSavedObservation(nextSavedObservation)
  setSavedObservationOpen(true)
  setMessage(`Functional Observation saved: ${observationCode}`)
  setRows(makeInitialRows())
  setExpandedFindings({})
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
<h1 style={styles.title}>Verifying SSI Access</h1>
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
<h1 style={styles.title}>SSI Access Unavailable</h1>
<p style={styles.subtitle}>{ACCESS_FAILURE_MESSAGE}</p>

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
<h1 style={styles.title}>Opening SSI Login</h1>
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
<div style={styles.header}>
<div style={styles.headerTop}>
<div>
<p style={styles.eyebrow}>
TSINAXA SSI • ENHESTICS-INFORMED OBSERVATION
</p>

          <h1 style={styles.title}>
            Functional Observation
          </h1>

          <p style={styles.subtitle}>
            Capture truthful shift-start assignment evidence describing how
            functional work is distributed before the shift unfolds. SSI
            integrates this observation with operational variation and
            longitudinal evidence before broader Functional Regulation or
            Functional Condition determinations are made.
          </p>
        </div>

        <button
          type="button"
          style={{
            ...styles.logoutButton,
            ...(loggingOut ? styles.buttonDisabled : {}),
          }}
          onClick={() => void handleLogout()}
          disabled={loggingOut}
        >
          {loggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>

    <nav
      aria-label="TSINAXA SSI flow navigation"
      style={styles.flowNav}
    >
      <div style={styles.flowNavHeader}>
        <span style={styles.flowNavTitle}>SSI Flow</span>
        <span style={styles.flowNavRule} />
        <span style={styles.flowNavCaption}>
          Functional Observation → Operational Variation → Functional Assessment → Executive Scientific Explanation → Weekly Stability Brief
        </span>
      </div>

      <div style={styles.flowSteps}>
        {ssiFlow.map((item, index) => (
          <div key={item.href} style={styles.flowStepWrap}>
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
              <span style={styles.flowArrow}>→</span>
            ) : null}
          </div>
        ))}
      </div>
    </nav>

    <form onSubmit={handleSubmit}>
      <section style={styles.panel}>
        <h2 style={styles.panelTitle}>
          Shared Shift Header
        </h2>

        <Input
          label="Unit"
          value={header.unit}
          onChange={(value) =>
            updateHeader('unit', value)
          }
        />

        <Input
          label="Date"
          type="date"
          helper="Select the shift date from the calendar."
          value={header.date}
          onChange={(value) =>
            updateHeader('date', value)
          }
        />

        <Select
          label="Shift_Type"
          value={header.shiftType}
          options={SSI_SHIFT_TYPE_OPTIONS}
          onChange={(value) =>
            updateHeader('shiftType', value)
          }
        />

        <Select
          label="Shift_Block"
          value={header.shiftBlock}
          options={SSI_COMMON_SHIFT_BLOCK_OPTIONS}
          onChange={(value) =>
            updateHeader('shiftBlock', value)
          }
        />
      </section>

      <section style={styles.topSnapshot}>
        <div style={styles.stickyTitle}>
          Shift-Start Functional Observation
        </div>

        <MiniMetric
          label="Active Rows"
          value={String(activeRows.length)}
        />

        <MiniMetric
          label="Visible Strain Rows"
          value={String(snapshot.visible_strain_count)}
        />

        <MiniMetric
          label="Hidden Strain Rows"
          value={String(snapshot.hidden_strain_count)}
        />

        <MiniMetric
          label="Severe Strain Rows"
          value={String(snapshot.severe_strain_count)}
        />
      </section>

      <section style={styles.tablePanel}>
        <h2 style={styles.panelTitle}>
          Assignment Entries
        </h2>
        <p style={styles.evidenceCaption}>
          Truthful Operational Evidence
        </p>

        {roleSections.map(({ rolePool, count }) => {
          const sectionRows = rows.filter(
            (row) => row.rolePool === rolePool,
          )

          const sectionActive = sectionRows.filter(
            (row) => row.active,
          ).length

          const expanded = expandedSections[rolePool]

          return (
            <section key={rolePool} style={styles.roleSection}>
              <button
                type="button"
                style={styles.sectionToggle}
                onClick={() => toggleSection(rolePool)}
              >
                {expanded ? 'Hide' : 'Show'} {rolePool} entries •{' '}
                {sectionActive}/{count} active
              </button>

              {expanded
                ? sectionRows.map((row) => {
                    const item = calculatedRows.find(
                      (calculated) =>
                        calculated.row.id === row.id,
                    )

                    const findingsOpen =
                      expandedFindings[row.id] ?? true

                    const selectedCount =
                      row.operationalDiagnosticFindings.length

                    const availableFindings =
                      getSSIOperationalDiagnosticFindingsForRole(
                        row.rolePool,
                      )

                    const groupedFindings =
                      findingCategoryOrder.map((category) => ({
                        category,
                        findings: availableFindings.filter(
                          (finding) =>
                            displayFindingCategory(
                              finding.category,
                            ) === category,
                        ),
                      }))

                    return (
                      <div key={row.id} style={styles.rowCard}>
                        <div style={styles.assignmentIdBox}>
                          <span style={styles.roleEntry}>
                            {rolePool} Entry {row.entryNumber}
                          </span>

                          <code
                            style={styles.assignmentIdCode}
                          >
                            {buildSSIShiftAssignmentId(
                              header.date,
                              header.shiftType,
                              rolePool,
                              row.entryNumber,
                            )}
                          </code>
                        </div>

                        <label style={styles.checkLabel}>
                          <input
                            type="checkbox"
                            checked={row.active}
                            onChange={(event) =>
                              updateRow(
                                row.id,
                                'active',
                                event.target.checked,
                              )
                            }
                          />
                          Active row
                        </label>

                        {row.active ? (
                          <>
                            <Select
                              label="Baseline_Design"
                              value={row.baselineDesign}
                              options={BASELINE_DESIGN_OPTIONS}
                              optionalLabel="Select baseline design"
                              onChange={(value) =>
                                updateBaselineDesign(row.id, value)
                              }
                            />

                            <Input
                              label="Starting_Assignment_Count"
                              type="number"
                              min="0"
                              max="99"
                              step="1"
                              helper="Enter the number of care recipients assigned at shift start."
                              value={row.startingAssignmentCount}
                              onChange={(value) =>
                                updateRow(
                                  row.id,
                                  'startingAssignmentCount',
                                  value,
                                )
                              }
                            />

                            {row.baselineDesign === 'CUSTOM' ? (
                              <Input
                                label="Custom_Baseline_Count"
                                helper="Use only when the approved baseline is not listed above."
                                type="number"
                                min="1"
                                max="99"
                                step="1"
                                value={row.baselineCount}
                                onChange={(value) =>
                                  updateRow(
                                    row.id,
                                    'baselineCount',
                                    value,
                                  )
                                }
                              />
                            ) : (
                              <DerivedBaselineField
                                value={
                                  row.baselineDesign
                                    ? String(
                                        deriveBaselineCount(
                                          row.baselineDesign,
                                          '',
                                        ),
                                      )
                                    : 'Select a baseline design'
                                }
                              />
                            )}

                            <div style={styles.findingPanel}>
                              <button
                                type="button"
                                style={styles.findingPanelToggle}
                                onClick={() =>
                                  toggleFindingPanel(row.id)
                                }
                              >
                                <span
                                  style={styles.findingPanelTitle}
                                >
                                  Shift-Start Assignment Evidence
                                </span>

                                <span style={styles.findingCount}>
                                  {selectedCount === 0
                                    ? 'No evidence selected'
                                    : `${selectedCount} finding${
                                        selectedCount === 1
                                          ? ''
                                          : 's'
                                      } selected`}
                                </span>

                                <span
                                  style={
                                    styles.findingPanelAction
                                  }
                                >
                                  {findingsOpen
                                    ? 'Collapse'
                                    : 'Review / edit'}
                                </span>
                              </button>

                              {selectedCount > 0 ? (
                                <div style={styles.selectedFindings}>
                                  <span
                                    style={styles.selectedFindingsTitle}
                                  >
                                    Shift-Start Functional Findings
                                  </span>

                                  <div
                                    style={styles.selectedFindingList}
                                  >
                                    {row.operationalDiagnosticFindings.map(
                                      (finding) => (
                                        <span
                                          key={finding}
                                          style={styles.selectedFindingItem}
                                        >
                                          {finding}
                                        </span>
                                      ),
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <p
                                  style={styles.noEvidenceText}
                                >
                                  Capture truthful operational evidence
                                  before saving this assignment row.
                                </p>
                              )}

                              {findingsOpen ? (
                                <>
                                  <div
                                    style={
                                      styles.findingInstruction
                                    }
                                  >
                                    <strong>
                                      Select every operational finding
                                      truly present in this assignment.
                                    </strong>

                                    <span>
                                      Capture observable, truthful
                                      shift-start evidence.
                                    </span>

                                    <span>
                                      Do not summarize the
                                      assignment into one reason.
                                    </span>

                                    <span>
                                      SSI preserves the complete evidence
                                      set for downstream Scientific Assessment.
                                    </span>
                                  </div>

                                  <div
                                    style={styles.categoryGrid}
                                  >
                                    {groupedFindings.map(
                                      (group) =>
                                        group.findings.length >
                                        0 ? (
                                          <div
                                            key={group.category}
                                            style={
                                              styles.findingCategoryBox
                                            }
                                          >
                                            <h3
                                              style={
                                                styles.categoryTitle
                                              }
                                            >
                                              {group.category}
                                            </h3>

                                            <div
                                              style={
                                                styles.findingGrid
                                              }
                                            >
                                              {group.findings.map(
                                                (finding) => (
                                                  <label
                                                    key={
                                                      finding.label
                                                    }
                                                    style={
                                                      styles.findingOption
                                                    }
                                                  >
                                                    <input
                                                      type="checkbox"
                                                      checked={row.operationalDiagnosticFindings.includes(
                                                        finding.label,
                                                      )}
                                                      onChange={() =>
                                                        toggleFinding(
                                                          row,
                                                          finding.label,
                                                        )
                                                      }
                                                    />

                                                    <span>
                                                      {
                                                        finding.label
                                                      }
                                                    </span>
                                                  </label>
                                                ),
                                              )}
                                            </div>
                                          </div>
                                        ) : null,
                                    )}
                                  </div>
                                </>
                              ) : null}
                            </div>

                            <div
                              style={styles.primarySignalGrid}
                            >
                              <ReadOnly
                                label="Shift-Start Functional State"
                                value={displayStructuralDiagnosis(
                                  item?.output
                                    ?.starting_strain_signal,
                                )}
                              />

                              <ReadOnly
                                label="Shift-Start Scientific Interpretation"
                                value={
                                  item?.output
                                    ?.structural_strain_summary ??
                                  'Not calculated yet'
                                }
                                wrap
                              />

                              <ReadOnly
                                label="Functional Reserve Evidence"
                                value={
                                  item?.output
                                    ?.reserve_capacity_interpretation ??
                                  'Not calculated yet'
                                }
                                wrap
                              />

                              <ReadOnly
                                label="Localized Functional Strain"
                                value={
                                  item?.output
                                    ?.localized_strain_interpretation ??
                                  'Not calculated yet'
                                }
                                wrap
                              />
                            </div>

                            <div style={styles.observationBoundary}>
                              <strong>Observation Boundary</strong>
                              <span>
                                Shift-start evidence only. Broader Functional
                                Regulation and Functional Condition determinations
                                require integration with operational variation and
                                longitudinal evidence.
                              </span>
                            </div>

                          </>
                        ) : null}
                      </div>
                    )
                  })
                : null}
            </section>
          )
        })}
      </section>

      <div style={styles.actions}>
        <button
          type="submit"
          disabled={saving}
          style={{
            ...styles.button,
            ...(saving ? styles.buttonDisabled : {}),
          }}
        >
          {saving
            ? 'Saving...'
            : 'Save Functional Observation'}
        </button>

        {message ? (
          <p role="status" aria-live="polite" style={styles.message}>
            {message}
          </p>
        ) : null}
      </div>

      <section style={styles.retrievalPanel}>
        <button
          type="button"
          style={styles.snapshotToggle}
          onClick={() => setRetrievalOpen((current) => !current)}
        >
          {retrievalOpen ? 'Hide' : 'Show'} Saved Functional Observation Retrieval
        </button>

        {retrievalOpen ? (
          <>
        <div style={styles.retrievalHeader}>
          <div>
            <p style={styles.retrievalEyebrow}>Saved Evidence</p>
            <h2 style={styles.retrievalTitle}>
              Retrieve Saved Functional Observation
            </h2>
            <p style={styles.retrievalDescription}>
              Find immutable saved observations by unit, date window, Shift Type,
              and Shift Block. Open the exact Observation Code without
              recalculating historical evidence.
            </p>
          </div>
        </div>

        <div style={styles.retrievalGrid}>
          <Input
            label="Unit"
            value={retrievalFilters.unit}
            onChange={(value) => updateRetrievalFilter('unit', value)}
          />

          <Input
            label="Window Start"
            value={retrievalFilters.windowStart}
            onChange={(value) => updateRetrievalFilter('windowStart', value)}
            type="date"
          />

          <Input
            label="Window End"
            value={retrievalFilters.windowEnd}
            onChange={(value) => updateRetrievalFilter('windowEnd', value)}
            type="date"
          />

          <Select
            label="Shift Type"
            value={retrievalFilters.shiftType}
            options={SSI_SHIFT_TYPE_OPTIONS}
            onChange={(value) => updateRetrievalFilter('shiftType', value)}
          />

          <Select
            label="Shift Block"
            value={retrievalFilters.shiftBlock}
            options={SSI_COMMON_SHIFT_BLOCK_OPTIONS}
            onChange={(value) => updateRetrievalFilter('shiftBlock', value)}
          />
        </div>

        <div style={styles.retrievalActions}>
          <button
            type="button"
            style={{
              ...styles.secondaryButton,
              ...(retrieving ? styles.buttonDisabled : {}),
            }}
            disabled={retrieving}
            onClick={() => void handleRetrieveSavedObservations()}
          >
            {retrieving ? 'Retrieving...' : 'Retrieve Saved Observations'}
          </button>

          {retrievalMessage ? (
            <p
              role="status"
              aria-live="polite"
              style={styles.retrievalMessage}
            >
              {retrievalMessage}
            </p>
          ) : null}
        </div>

        {retrievedObservations.length > 1 ? (
          <div style={styles.retrievedList}>
            {retrievedObservations.map((observation) => (
              <div
                key={observation.id}
                style={styles.retrievedObservationRow}
              >
                <div style={styles.retrievedObservationIdentity}>
                  <strong style={styles.retrievedObservationCode}>
                    {observation.observationCode}
                  </strong>
                  <span style={styles.retrievedObservationMeta}>
                    {observation.assignmentDate} · {observation.shiftType} ·{' '}
                    {observation.shiftBlock}
                  </span>
                  <span style={styles.retrievedObservationMeta}>
                    Saved {observation.createdAt || observation.observedAt}
                  </span>
                </div>

                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={() =>
                    handleOpenRetrievedObservation(observation)
                  }
                >
                  Open Saved Observation
                </button>
              </div>
            ))}
          </div>
        ) : null}
          </>
        ) : null}
      </section>

      {savedObservation ? (
        <section style={styles.savedObservationPanel}>
          <button
            type="button"
            style={styles.snapshotToggle}
            onClick={() => setSavedObservationOpen((current) => !current)}
          >
            {savedObservationOpen ? 'Hide' : 'Show'} Functional Observation Saved
          </button>

          {savedObservationOpen ? (
            <>
          <div style={styles.savedObservationGrid}>
            <SavedMetadataField
              label="Observation Code"
              value={savedObservation.observationCode}
              prominent
            />
            <SavedMetadataField label="Unit" value={savedObservation.unit} />
            <SavedMetadataField
              label="Date"
              value={savedObservation.assignmentDate}
            />
            <SavedMetadataField
              label="Shift Type"
              value={savedObservation.shiftType}
            />
            <SavedMetadataField
              label="Shift Block"
              value={savedObservation.shiftBlock}
            />
            <SavedMetadataField
              label="Saved At"
              value={savedObservation.createdAt || savedObservation.observedAt}
            />
            <SavedMetadataField
              label="Engine Version"
              value={savedObservation.engineVersion}
            />
            <SavedMetadataField
              label="Instrument Version"
              value={savedObservation.instrumentVersion}
            />
            <SavedMetadataField
              label="Record Status"
              value={savedObservation.recordStatus}
            />
          </div>

          <div style={styles.savedObservationActions}>
            <button
              type="button"
              style={styles.button}
              onClick={handlePrintSavedObservation}
            >
              Print Saved Observation
            </button>

            <button
              type="button"
              style={styles.secondaryButton}
              onClick={handleDownloadSavedObservation}
            >
              Download Saved Observation
            </button>
          </div>
            </>
          ) : null}
        </section>
      ) : null}

      <section style={styles.snapshot}>
        <button
          type="button"
          style={styles.snapshotToggle}
          onClick={() =>
            setSnapshotOpen((current) => !current)
          }
        >
          {snapshotOpen ? 'Hide' : 'Show'} Shift-Start Functional Snapshot
        </button>

        {snapshotOpen ? (
          <div style={styles.snapshotGrid}>
            <ReadOnly
              label="Hidden Strain Rows"
              value={String(snapshot.hidden_strain_count)}
            />

            <ReadOnly
              label="Visible Strain Rows"
              value={String(snapshot.visible_strain_count)}
            />

            <ReadOnly
              label="Severe Strain Rows"
              value={String(snapshot.severe_strain_count)}
            />

            <ReadOnly
              label="Most Frequent Truthful Finding"
              value={snapshot.dominant_load_reason}
              wrap
            />

            <ReadOnly
              label="Dominant Functional Load Pattern"
              value={snapshot.dominant_load_complexity}
              wrap
            />

            <ReadOnly
              label="Shift-Start Functional Reading"
              value={snapshot.structural_strain_reading}
              wrap
            />

            <ReadOnly
              label="Observation Boundary"
              value="This observation is limited to the current shift-start configuration. Functional Regulation and Functional Condition require integration with operational variation and longitudinal evidence."
              wrap
            />
          </div>
        ) : null}
      </section>
    </form>
  </section>

  <footer style={styles.productFooter}>
    <strong>TSINAXA SSI</strong>
    <span>Truth First · Evidence Always · Explain Every Determination</span>
  </footer>
</main>

)
}

function Input({
label,
value,
onChange,
type = 'text',
placeholder,
helper,
min,
max,
step,
}: {
label: string
value: string
onChange: (value: string) => void
type?: string
placeholder?: string
helper?: string
min?: string
max?: string
step?: string
}) {
return (
<label style={styles.label}>
<span>{label}</span>

  <input
    type={type}
    placeholder={placeholder}
    min={min}
    max={max}
    step={step}
    value={value}
    onPointerDown={(event) => {
      if (type !== 'date') return

      try {
        event.currentTarget.showPicker?.()
      } catch {
        // Keep the native date input usable if the browser declines programmatic opening.
      }
    }}
    onChange={(event) => onChange(event.target.value)}
    style={styles.input}
  />

  {helper ? (
    <small style={styles.helper}>{helper}</small>
  ) : null}
</label>

)
}

function Select({
label,
value,
options,
onChange,
optionalLabel,
}: {
label: string
value: string
options: readonly string[]
onChange: (value: string) => void
optionalLabel?: string
}) {
return (
<label style={styles.label}>
<span>{label}</span>

  <select
    value={value}
    onChange={(event) => onChange(event.target.value)}
    style={styles.input}
  >
    {optionalLabel ? (
      <option value="">{optionalLabel}</option>
    ) : null}

    {options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
</label>

)
}

function DerivedBaselineField({
value,
}: {
value: string
}) {
return (
<div style={styles.derivedBaselineField}>
<span style={styles.derivedBaselineLabel}>Derived Baseline Count</span>
<span style={styles.derivedBaselineValue}>{value}</span>
</div>
)
}

function SavedMetadataField({
label,
value,
prominent = false,
}: {
label: string
value: string
prominent?: boolean
}) {
return (
<div style={styles.savedMetadataField}>
<span style={styles.savedMetadataLabel}>{label}</span>
<span
style={{
...styles.savedMetadataValue,
...(prominent ? styles.savedMetadataValueProminent : {}),
}}
>
{value}
</span>
</div>
)
}

function ReadOnly({
label,
value,
wrap = false,
}: {
label: string
value: string
wrap?: boolean
}) {
return (
<div style={styles.readOnlyBox}>
<span style={styles.readOnlyLabel}>{label}</span>

  <span
    style={
      wrap
        ? styles.readOnlyValueWrap
        : styles.readOnlyValue
    }
  >
    {value}
  </span>
</div>

)
}

function MiniMetric({
label,
value,
}: {
label: string
value: string
}) {
return (
<div style={styles.miniMetric}>
<span>{label}</span>
<strong>{value}</strong>
</div>
)
}

const styles: Record<string, CSSProperties> = {
productFooter: {
display: 'flex',
flexDirection: 'column',
alignItems: 'center',
gap: '6px',
padding: '12px 16px 4px',
color: '#8f7d50',
fontSize: '11px',
lineHeight: 1.5,
fontWeight: 500,
textAlign: 'center',
letterSpacing: '0.06em',
},
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
maxWidth: '920px',
},
accessActions: {
display: 'flex',
flexWrap: 'wrap',
gap: '12px',
marginTop: '22px',
},
secondaryButton: {
background: '#11100d',
color: '#d6b25e',
border: '1px solid rgba(214,178,94,0.42)',
borderRadius: '14px',
padding: '13px 18px',
fontWeight: 800,
cursor: 'pointer',
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
gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
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
gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
gap: '16px',
border: '1px solid rgba(214,178,94,0.28)',
background: '#090807',
borderRadius: '22px',
padding: '22px',
marginBottom: '18px',
},
topSnapshot: {
display: 'grid',
gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
gap: '10px',
border: '1px solid rgba(214,178,94,0.28)',
background: '#090807',
borderRadius: '18px',
padding: '12px',
marginBottom: '18px',
},
stickyTitle: {
gridColumn: '1 / -1',
color: '#d6b25e',
fontWeight: 900,
letterSpacing: '0.08em',
textTransform: 'uppercase',
fontSize: '12px',
},
miniMetric: {
background: '#11100d',
border: '1px solid rgba(214,178,94,0.18)',
borderRadius: '12px',
padding: '10px 12px',
display: 'flex',
justifyContent: 'space-between',
color: '#cfc7b5',
gap: '12px',
},
tablePanel: {
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
evidenceCaption: {
gridColumn: '1 / -1',
margin: '0 0 8px',
color: '#9f8142',
fontSize: '12px',
fontWeight: 700,
letterSpacing: '0.04em',
textTransform: 'uppercase',
},
roleSection: {
borderTop: '1px solid rgba(214,178,94,0.18)',
paddingTop: '14px',
marginTop: '14px',
},
sectionToggle: {
width: '100%',
background: '#11100d',
color: '#d6b25e',
border: '1px solid rgba(214,178,94,0.22)',
borderRadius: '12px',
padding: '12px',
textAlign: 'left',
fontWeight: 900,
cursor: 'pointer',
},
rowCard: {
display: 'grid',
gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
gap: '12px',
border: '1px solid rgba(214,178,94,0.16)',
borderRadius: '16px',
padding: '14px',
marginTop: '12px',
},
assignmentIdBox: {
border: '1px solid rgba(214,178,94,0.22)',
background: 'rgba(214,178,94,0.08)',
borderRadius: '14px',
padding: '12px 14px',
display: 'flex',
flexDirection: 'column',
gap: '8px',
minWidth: 0,
},
roleEntry: {
color: '#d6b25e',
fontWeight: 900,
fontSize: '16px',
},
assignmentIdCode: {
color: '#cfc7b5',
fontWeight: 700,
fontSize: '12px',
whiteSpace: 'normal',
overflowWrap: 'anywhere',
lineHeight: 1.35,
},
checkLabel: {
display: 'flex',
alignItems: 'center',
gap: '10px',
color: '#cfc7b5',
fontWeight: 700,
},
findingPanel: {
gridColumn: '1 / -1',
border: '1px solid rgba(214,178,94,0.18)',
background: '#0d0c0a',
borderRadius: '16px',
padding: '12px',
},
findingPanelToggle: {
width: '100%',
display: 'grid',
gridTemplateColumns: '1fr auto auto',
alignItems: 'center',
gap: '12px',
background: '#11100d',
color: '#fff8e7',
border: '1px solid rgba(214,178,94,0.18)',
borderRadius: '14px',
padding: '12px 14px',
cursor: 'pointer',
textAlign: 'left',
},
findingPanelTitle: {
color: '#d6b25e',
fontWeight: 900,
},
findingCount: {
color: '#cfc7b5',
fontSize: '12px',
fontWeight: 800,
border: '1px solid rgba(214,178,94,0.18)',
borderRadius: '999px',
padding: '6px 10px',
},
findingPanelAction: {
color: '#d6b25e',
fontSize: '12px',
fontWeight: 900,
},
badgeRow: {
display: 'flex',
flexWrap: 'wrap',
gap: '8px',
marginTop: '10px',
},
badge: {
border: '1px solid rgba(214,178,94,0.22)',
background: 'rgba(214,178,94,0.09)',
color: '#fff8e7',
borderRadius: '999px',
padding: '6px 10px',
fontSize: '12px',
fontWeight: 800,
},
selectedFindings: {
marginTop: '16px',
marginBottom: '18px',
display: 'flex',
flexDirection: 'column',
gap: '6px',
},
selectedFindingsTitle: {
color: '#bda66f',
fontSize: '12px',
fontWeight: 600,
letterSpacing: '0.035em',
marginBottom: '2px',
},
selectedFindingList: {
display: 'flex',
flexDirection: 'column',
gap: '8px',
paddingLeft: '8px',
},
selectedFindingItem: {
color: '#cfc7b5',
fontSize: '13px',
fontWeight: 500,
lineHeight: 1.6,
},
noEvidenceText: {
color: '#9f8142',
margin: '10px 0 0',
fontSize: '13px',
},
findingInstruction: {
marginTop: '12px',
border: '1px solid rgba(214,178,94,0.18)',
background: 'rgba(214,178,94,0.06)',
borderRadius: '14px',
padding: '12px',
display: 'grid',
gap: '4px',
color: '#cfc7b5',
fontSize: '13px',
},
categoryGrid: {
display: 'grid',
gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
gap: '12px',
marginTop: '12px',
},
findingCategoryBox: {
border: '1px solid rgba(214,178,94,0.14)',
background: '#11100d',
borderRadius: '14px',
padding: '12px',
},
categoryTitle: {
color: '#d6b25e',
margin: '0 0 10px',
fontSize: '13px',
letterSpacing: '0.04em',
textTransform: 'uppercase',
},
findingGrid: {
display: 'grid',
gridTemplateColumns: '1fr',
gap: '8px',
},
findingOption: {
display: 'flex',
alignItems: 'center',
gap: '10px',
color: '#cfc7b5',
background: '#0d0c0a',
border: '1px solid rgba(214,178,94,0.13)',
borderRadius: '12px',
padding: '10px 12px',
fontSize: '13px',
},
observationBoundary: {
gridColumn: '1 / -1',
display: 'flex',
flexDirection: 'column',
gap: '5px',
border: '1px solid rgba(214,178,94,0.14)',
background: 'rgba(214,178,94,0.035)',
borderRadius: '12px',
padding: '11px 13px',
color: '#9f9684',
fontSize: '12px',
lineHeight: 1.5,
},
primarySignalGrid: {
gridColumn: '1 / -1',
display: 'grid',
gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
gap: '10px',
},
label: {
display: 'flex',
flexDirection: 'column',
gap: '8px',
color: '#cfc7b5',
fontSize: '13px',
},
helper: {
color: '#9f8142',
fontSize: '12px',
},
input: {
background: '#11100d',
border: '1px solid rgba(214,178,94,0.28)',
borderRadius: '14px',
color: '#fff8e7',
padding: '12px 14px',
outline: 'none',
},
derivedBaselineField: {
border: '1px solid rgba(214,178,94,0.18)',
background: '#11100d',
borderRadius: '14px',
padding: '12px 14px',
display: 'flex',
flexDirection: 'column',
justifyContent: 'center',
gap: '6px',
minWidth: 0,
minHeight: '48px',
},
derivedBaselineLabel: {
color: '#bda66f',
fontSize: '12px',
fontWeight: 500,
lineHeight: 1.4,
},
derivedBaselineValue: {
color: '#d8cfbd',
fontSize: '14px',
fontWeight: 500,
lineHeight: 1.45,
textAlign: 'left',
overflowWrap: 'anywhere',
},
savedMetadataField: {
borderBottom: '1px solid rgba(214,178,94,0.12)',
padding: '4px 2px 12px',
display: 'flex',
flexDirection: 'column',
gap: '5px',
minWidth: 0,
},
savedMetadataLabel: {
color: '#aa9564',
fontSize: '11px',
fontWeight: 600,
lineHeight: 1.35,
letterSpacing: '0.045em',
textTransform: 'uppercase',
},
savedMetadataValue: {
color: '#d8cfbd',
fontSize: '13px',
fontWeight: 500,
lineHeight: 1.5,
textAlign: 'left',
whiteSpace: 'normal',
overflowWrap: 'anywhere',
},
savedMetadataValueProminent: {
color: '#eadfc8',
fontSize: '14px',
fontWeight: 600,
},
readOnlyBox: {
border: '1px solid rgba(214,178,94,0.18)',
background: '#11100d',
borderRadius: '14px',
padding: '12px 14px',
display: 'flex',
justifyContent: 'space-between',
gap: '16px',
minWidth: 0,
},
readOnlyLabel: {
color: '#cfc7b5',
flexShrink: 0,
fontSize: '12px',
fontWeight: 600,
lineHeight: 1.45,
},
readOnlyValue: {
color: '#e6dcc7',
textAlign: 'right',
fontWeight: 600,
lineHeight: 1.5,
},
readOnlyValueWrap: {
color: '#d8cfbd',
textAlign: 'left',
whiteSpace: 'normal',
overflowWrap: 'anywhere',
lineHeight: 1.6,
fontWeight: 500,
},
actions: {
display: 'flex',
alignItems: 'center',
gap: '16px',
marginBottom: '18px',
},
button: {
background: '#d6b25e',
color: '#050505',
border: 'none',
borderRadius: '14px',
padding: '13px 18px',
fontWeight: 800,
cursor: 'pointer',
},
buttonDisabled: {
opacity: 0.58,
cursor: 'not-allowed',
},
message: {
color: '#cfc7b5',
margin: 0,
},
retrievalPanel: {
border: '1px solid rgba(214,178,94,0.22)',
background: '#090807',
borderRadius: '22px',
padding: '22px',
marginBottom: '18px',
},
retrievalHeader: {
display: 'flex',
justifyContent: 'space-between',
alignItems: 'flex-start',
gap: '18px',
},
retrievalEyebrow: {
margin: 0,
color: '#a88d4e',
fontSize: '11px',
fontWeight: 700,
letterSpacing: '0.08em',
textTransform: 'uppercase',
},
retrievalTitle: {
margin: '5px 0 0',
color: '#e5dcc9',
fontSize: '17px',
fontWeight: 650,
},
retrievalDescription: {
margin: '7px 0 0',
maxWidth: '760px',
color: '#9f9684',
fontSize: '13px',
lineHeight: 1.6,
},
retrievalGrid: {
display: 'grid',
gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
gap: '12px',
marginTop: '18px',
},
retrievalActions: {
display: 'flex',
alignItems: 'center',
flexWrap: 'wrap',
gap: '14px',
marginTop: '16px',
},
retrievalMessage: {
margin: 0,
color: '#b9ae98',
fontSize: '13px',
lineHeight: 1.5,
},
retrievedList: {
display: 'flex',
flexDirection: 'column',
gap: '10px',
marginTop: '16px',
},
retrievedObservationRow: {
display: 'flex',
alignItems: 'center',
justifyContent: 'space-between',
gap: '18px',
borderTop: '1px solid rgba(214,178,94,0.14)',
paddingTop: '12px',
},
retrievedObservationIdentity: {
display: 'flex',
flexDirection: 'column',
gap: '4px',
minWidth: 0,
},
retrievedObservationCode: {
color: '#d9c58f',
fontSize: '13px',
fontWeight: 650,
overflowWrap: 'anywhere',
},
retrievedObservationMeta: {
color: '#948b7a',
fontSize: '12px',
lineHeight: 1.45,
},
savedObservationPanel: {
border: '1px solid rgba(214,178,94,0.28)',
background: '#090807',
borderRadius: '22px',
padding: '24px',
marginBottom: '18px',
},
savedObservationGrid: {
display: 'grid',
gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
columnGap: '28px',
rowGap: '12px',
marginTop: '14px',
},
savedObservationActions: {
display: 'flex',
flexWrap: 'wrap',
gap: '12px',
marginTop: '22px',
paddingTop: '4px',
},
snapshot: {
border: '1px solid rgba(214,178,94,0.28)',
background: '#090807',
borderRadius: '22px',
padding: '18px',
},
snapshotToggle: {
width: '100%',
background: '#11100d',
color: '#d6b25e',
border: '1px solid rgba(214,178,94,0.28)',
borderRadius: '14px',
padding: '12px 14px',
textAlign: 'left',
fontWeight: 800,
cursor: 'pointer',
},
snapshotGrid: {
display: 'grid',
gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
gap: '12px',
marginTop: '14px',
},
}