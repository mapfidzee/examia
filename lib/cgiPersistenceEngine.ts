import { supabase } from './supabase'

export type CGIContinuitySnapshotRecord = {
  snapshotLabel?: string
  sourceRoute?: string
  continuityPosture: string
  continuityConfidence?: string
  survivabilityPressure?: string
  recoveryCredibility?: string
  recurrenceSeverity?: string
  dominantConcern?: string
  executiveReading?: string
  requiredAction?: string
  requiredEvidence?: string
  evidenceVerified?: boolean
  accountabilityActive?: boolean
  structuralMemoryVisible?: boolean
  rawPayload?: Record<string, unknown>
}

export type CGIExecutiveReportRecord = {
  reportClassification: string
  reportTitle: string
  currentContinuityPosture: string
  historyDirection?: string
  continuityDriftDetected?: boolean
  survivabilityConcernPersisting?: boolean
  dominantConcern?: string
  requiredExecutiveAction?: string
  requiredEvidence?: string
  executiveSummary?: string
  copyReadyReport?: string
  rawPayload?: Record<string, unknown>
}

export type CGISituationReviewRecord = {
  situationTitle: string
  situationPosture: string
  commandQuestion?: string
  executiveSummary?: string
  dominantConcern?: string
  historyDirection?: string
  continuityDriftDetected?: boolean
  reportClassification?: string
  requiredExecutiveAction?: string
  requiredEvidence?: string
  copyReadySituationReport?: string
  rawPayload?: Record<string, unknown>
}

export async function saveCGIContinuitySnapshot(
  record: CGIContinuitySnapshotRecord
) {
  const { data, error } = await supabase
    .from('cgi_continuity_snapshots')
    .insert({
      snapshot_label: record.snapshotLabel ?? null,
      source_route: record.sourceRoute ?? 'CGI',
      continuity_posture: record.continuityPosture,
      continuity_confidence: record.continuityConfidence ?? null,
      survivability_pressure: record.survivabilityPressure ?? null,
      recovery_credibility: record.recoveryCredibility ?? null,
      recurrence_severity: record.recurrenceSeverity ?? null,
      dominant_concern: record.dominantConcern ?? null,
      executive_reading: record.executiveReading ?? null,
      required_action: record.requiredAction ?? null,
      required_evidence: record.requiredEvidence ?? null,
      evidence_verified: record.evidenceVerified ?? false,
      accountability_active: record.accountabilityActive ?? false,
      structural_memory_visible: record.structuralMemoryVisible ?? false,
      raw_payload: record.rawPayload ?? {},
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save CGI continuity snapshot: ${error.message}`)
  }

  return data
}

export async function saveCGIExecutiveReport(
  record: CGIExecutiveReportRecord
) {
  const { data, error } = await supabase
    .from('cgi_executive_reports')
    .insert({
      report_classification: record.reportClassification,
      report_title: record.reportTitle,
      current_continuity_posture: record.currentContinuityPosture,
      history_direction: record.historyDirection ?? null,
      continuity_drift_detected: record.continuityDriftDetected ?? false,
      survivability_concern_persisting:
        record.survivabilityConcernPersisting ?? false,
      dominant_concern: record.dominantConcern ?? null,
      required_executive_action: record.requiredExecutiveAction ?? null,
      required_evidence: record.requiredEvidence ?? null,
      executive_summary: record.executiveSummary ?? null,
      copy_ready_report: record.copyReadyReport ?? null,
      raw_payload: record.rawPayload ?? {},
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save CGI executive report: ${error.message}`)
  }

  return data
}

export async function saveCGISituationReview(
  record: CGISituationReviewRecord
) {
  const { data, error } = await supabase
    .from('cgi_situation_reviews')
    .insert({
      situation_title: record.situationTitle,
      situation_posture: record.situationPosture,
      command_question: record.commandQuestion ?? null,
      executive_summary: record.executiveSummary ?? null,
      dominant_concern: record.dominantConcern ?? null,
      history_direction: record.historyDirection ?? null,
      continuity_drift_detected: record.continuityDriftDetected ?? false,
      report_classification: record.reportClassification ?? null,
      required_executive_action: record.requiredExecutiveAction ?? null,
      required_evidence: record.requiredEvidence ?? null,
      copy_ready_situation_report: record.copyReadySituationReport ?? null,
      raw_payload: record.rawPayload ?? {},
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save CGI situation review: ${error.message}`)
  }

  return data
}

export async function loadCGIContinuitySnapshots(limit = 20) {
  const { data, error } = await supabase
    .from('cgi_continuity_snapshots')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to load CGI continuity snapshots: ${error.message}`)
  }

  return data ?? []
}

export async function loadCGIExecutiveReports(limit = 20) {
  const { data, error } = await supabase
    .from('cgi_executive_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to load CGI executive reports: ${error.message}`)
  }

  return data ?? []
}

export async function loadCGISituationReviews(limit = 20) {
  const { data, error } = await supabase
    .from('cgi_situation_reviews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to load CGI situation reviews: ${error.message}`)
  }

  return data ?? []
}

export async function fetchCGIExecutiveReports() {
  return loadCGIExecutiveReports(100)
}

export async function fetchCGISituationReviews() {
  return loadCGISituationReviews(100)
}

export async function fetchCGIContinuitySnapshots() {
  return loadCGIContinuitySnapshots(100)
}