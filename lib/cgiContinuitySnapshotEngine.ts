import {
  buildCGIExecutiveBriefing,
  type CGIExecutiveBriefing,
} from './cgiExecutiveBriefingGenerator'
import type {
  CGIRouteSynthesisInput,
  CGIRouteSynthesisPosture,
} from './cgiCrossRouteContinuitySynthesisEngine'

export type CGIContinuitySnapshot = {
  snapshotId: string
  createdAt: string
  classification: string
  synthesisPosture: CGIRouteSynthesisPosture
  executiveReading: string
  dominantConcern: string
  requiredExecutiveAction: string
  requiredEvidence: string
  survivabilityStatus: string
  governanceMeaning: string
  briefing: CGIExecutiveBriefing
}

export function buildCGIContinuitySnapshot(
  input: CGIRouteSynthesisInput
): CGIContinuitySnapshot {
  const briefing = buildCGIExecutiveBriefing(input)

  return {
    snapshotId: `CGI-SNAPSHOT-${Date.now()}`,
    createdAt: new Date().toISOString(),
    classification: 'Executive Continuity Snapshot',
    synthesisPosture: briefing.synthesis.synthesisPosture,
    executiveReading: briefing.continuityReading,
    dominantConcern: briefing.dominantConcern,
    requiredExecutiveAction: briefing.requiredExecutiveAction,
    requiredEvidence: briefing.requiredEvidence,
    survivabilityStatus:
      briefing.synthesis.synthesisPosture === 'CRITICAL'
        ? 'Survivability protection must remain visible.'
        : briefing.synthesis.synthesisPosture === 'ELEVATED'
          ? 'Survivability requires active executive monitoring.'
          : briefing.synthesis.synthesisPosture === 'WATCHED'
            ? 'Survivability is holding under observation.'
            : 'Survivability appears stable under reviewed conditions.',
    governanceMeaning: briefing.governanceSafeMeaning,
    briefing,
  }
}

export function summarizeCGIContinuitySnapshot(
  snapshot: CGIContinuitySnapshot
): string {
  return `
TSINAXA CGI CONTINUITY SNAPSHOT

Snapshot:
${snapshot.snapshotId}

Created:
${snapshot.createdAt}

Classification:
${snapshot.classification}

Synthesis Posture:
${snapshot.synthesisPosture}

Executive Reading:
${snapshot.executiveReading}

Dominant Concern:
${snapshot.dominantConcern}

Required Executive Action:
${snapshot.requiredExecutiveAction}

Required Evidence:
${snapshot.requiredEvidence}

Survivability Status:
${snapshot.survivabilityStatus}

Governance Meaning:
${snapshot.governanceMeaning}
  `.trim()
}