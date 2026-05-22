import {
  buildCGICrossRouteContinuitySynthesis,
  type CGICrossRouteContinuitySynthesis,
  type CGIRouteSynthesisInput,
} from './cgiCrossRouteContinuitySynthesisEngine'

export type CGIExecutiveBriefing = {
  title: string
  classification: string
  coreQuestion: string
  executiveSummary: string
  synthesis: CGICrossRouteContinuitySynthesis
  continuityReading: string
  dominantConcern: string
  executiveMeaning: string
  requiredExecutiveAction: string
  requiredEvidence: string
  governanceSafeMeaning: string
  briefingSections: {
    label: string
    content: string
  }[]
  copyReadyBrief: string
}

export function buildCGIExecutiveBriefing(
  input: CGIRouteSynthesisInput
): CGIExecutiveBriefing {
  const synthesis = buildCGICrossRouteContinuitySynthesis(input)

  const executiveSummary = `${synthesis.executiveContinuityReading} ${synthesis.executiveMeaning}`

  const briefingSections = [
    {
      label: 'Continuity Reading',
      content: synthesis.executiveContinuityReading,
    },
    {
      label: 'Dominant Concern',
      content: synthesis.dominantConcern,
    },
    {
      label: 'Executive Meaning',
      content: synthesis.executiveMeaning,
    },
    {
      label: 'Required Executive Action',
      content: synthesis.requiredExecutiveAction,
    },
    {
      label: 'Required Stabilization Evidence',
      content: synthesis.requiredEvidence,
    },
    {
      label: 'Governance-Safe Interpretation',
      content: synthesis.governanceSafeInterpretation,
    },
  ]

  const copyReadyBrief = `
TSINAXA CGI EXECUTIVE CONTINUITY BRIEF

Classification:
Executive Continuity Intelligence

Core Question:
${synthesis.continuityTrustQuestion}

Continuity Reading:
${synthesis.executiveContinuityReading}

Dominant Concern:
${synthesis.dominantConcern}

Executive Meaning:
${synthesis.executiveMeaning}

Required Executive Action:
${synthesis.requiredExecutiveAction}

Required Stabilization Evidence:
${synthesis.requiredEvidence}

Governance-Safe Meaning:
${synthesis.governanceSafeInterpretation}

Synthesis Posture:
${synthesis.synthesisPosture}
  `.trim()

  return {
    title: 'TSINAXA CGI Executive Continuity Brief',
    classification: 'Executive Continuity Intelligence',
    coreQuestion: synthesis.continuityTrustQuestion,
    executiveSummary,
    synthesis,
    continuityReading: synthesis.executiveContinuityReading,
    dominantConcern: synthesis.dominantConcern,
    executiveMeaning: synthesis.executiveMeaning,
    requiredExecutiveAction: synthesis.requiredExecutiveAction,
    requiredEvidence: synthesis.requiredEvidence,
    governanceSafeMeaning: synthesis.governanceSafeInterpretation,
    briefingSections,
    copyReadyBrief,
  }
}