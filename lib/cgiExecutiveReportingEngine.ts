import type {
  CGIContinuitySnapshot,
} from './cgiContinuitySnapshotEngine'
import {
  summarizeCGIContinuitySnapshot,
} from './cgiContinuitySnapshotEngine'
import type {
  CGIExecutiveHistoryReview,
} from './cgiExecutiveHistoryEngine'
import {
  summarizeCGIExecutiveHistory,
} from './cgiExecutiveHistoryEngine'

export type CGIExecutiveReportClassification =
  | 'DAILY_CONTINUITY_BRIEF'
  | 'BOARD_CONTINUITY_SUMMARY'
  | 'PILOT_REPORT'
  | 'CROSS_SITE_COORDINATION_REPORT'

export type CGIExecutiveReportPackage = {
  title: string
  classification: CGIExecutiveReportClassification
  generatedAt: string
  executiveSummary: string
  currentContinuityPosture: string
  dominantConcern: string
  requiredExecutiveAction: string
  requiredEvidence: string
  historyDirection: string
  continuityDriftDetected: boolean
  survivabilityConcernPersisting: boolean
  reportSections: {
    label: string
    content: string
  }[]
  copyReadyReport: string
}

export function buildCGIExecutiveReportPackage({
  classification,
  latestSnapshot,
  historyReview,
}: {
  classification: CGIExecutiveReportClassification
  latestSnapshot: CGIContinuitySnapshot
  historyReview: CGIExecutiveHistoryReview
}): CGIExecutiveReportPackage {
  const generatedAt = new Date().toISOString()

  const executiveSummary = `${latestSnapshot.executiveReading} ${historyReview.executiveMeaning}`

  const reportSections = [
    {
      label: 'Current Continuity Snapshot',
      content: summarizeCGIContinuitySnapshot(latestSnapshot),
    },
    {
      label: 'Executive History Review',
      content: summarizeCGIExecutiveHistory(historyReview),
    },
    {
      label: 'Required Executive Action',
      content: latestSnapshot.requiredExecutiveAction,
    },
    {
      label: 'Required Stabilization Evidence',
      content: latestSnapshot.requiredEvidence,
    },
    {
      label: 'Governance-Safe Meaning',
      content: latestSnapshot.governanceMeaning,
    },
  ]

  const copyReadyReport = `
TSINAXA CGI EXECUTIVE REPORT PACKAGE

Classification:
${classification}

Generated:
${generatedAt}

Executive Summary:
${executiveSummary}

Current Continuity Posture:
${latestSnapshot.synthesisPosture}

Dominant Concern:
${latestSnapshot.dominantConcern}

Required Executive Action:
${latestSnapshot.requiredExecutiveAction}

Required Stabilization Evidence:
${latestSnapshot.requiredEvidence}

History Direction:
${historyReview.direction}

Continuity Drift Detected:
${historyReview.continuityDriftDetected ? 'YES' : 'NO'}

Survivability Concern Persisting:
${historyReview.survivabilityConcernPersisting ? 'YES' : 'NO'}

Governance-Safe Meaning:
${latestSnapshot.governanceMeaning}
  `.trim()

  return {
    title: 'TSINAXA CGI Executive Report Package',
    classification,
    generatedAt,
    executiveSummary,
    currentContinuityPosture: latestSnapshot.synthesisPosture,
    dominantConcern: latestSnapshot.dominantConcern,
    requiredExecutiveAction: latestSnapshot.requiredExecutiveAction,
    requiredEvidence: latestSnapshot.requiredEvidence,
    historyDirection: historyReview.direction,
    continuityDriftDetected: historyReview.continuityDriftDetected,
    survivabilityConcernPersisting:
      historyReview.survivabilityConcernPersisting,
    reportSections,
    copyReadyReport,
  }
}