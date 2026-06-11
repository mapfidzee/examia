export type CGISituationRoomOperatingPicture = {
  posture: string
  operatingQuestion: string
  pressureReading: string
  trajectoryReading: string
  predictiveReading: string
  recoveryReading: string
  reliabilityReading: string
  commandReading: string
  coordinationReading: string
  crossSiteReading: string
  executiveMeaning: string
  nextDestination: string
  evidenceStandard: string
  boardWarning: string
  requiredAction: string
  watchNext: string
}

type SituationRoomDoctrineInput = {
  pilotThread: {
    scenarioName?: string
    executiveThesis?: string
  }
  briefing: {
    dominantConcern?: string
    synthesis?: {
      synthesisPosture?: string
    }
  }
  trajectory: {
    trajectory?: string
    momentum?: string
    trajectoryDirection?: string
    trajectoryRecommendation?: string
    watchNext?: string
  }
  historyReview: {
    direction?: string
    continuityDriftDetected?: boolean
  }
  report?: {
    classification?: string
  }
}

export function buildCGISituationRoomOperatingPicture(
  input: SituationRoomDoctrineInput,
): CGISituationRoomOperatingPicture {
  return {
    posture: 'ENTERPRISE CONTINUITY WATCH',
    operatingQuestion:
      'What operating condition is the institution currently under?',
    pressureReading:
      'Operational pressure remains elevated because fuel logistics disruption has affected multiple sites.',
    trajectoryReading:
      input.trajectory.trajectoryDirection ??
      'Continuity movement is not yet fully explainable.',
    predictiveReading:
      'Predictive warning remains elevated because supplier concentration can produce recurrence before recovery durability is proven.',
    recoveryReading:
      'Recovery is visible but uneven. North is stabilizing, South remains under watch, and East still carries recurrence exposure.',
    reliabilityReading:
      'Reliability remains provisional until supplier alternatives, recovery evidence, and cross-site durability are confirmed.',
    commandReading:
      'Command visibility remains justified because recovery credibility is not yet fully proven.',
    coordinationReading:
      'Coordination must synchronize ownership, routing, supplier alternatives, evidence, and site-level recovery proof.',
    crossSiteReading:
      'Cross-site intelligence shows shared supplier dependency and enterprise continuity exposure.',
    executiveMeaning:
      input.pilotThread.executiveThesis ??
      'The institution has a visible continuity condition that requires executive interpretation before confidence is restored.',
    nextDestination: 'Executive Center',
    evidenceStandard:
      'Preserve pressure reading, trajectory direction, predictive warning, recovery status, reliability posture, command posture, coordination need, cross-site pattern, executive meaning, required action, and audit reconstruction trail.',
    boardWarning:
      'Do not separate pressure, trajectory, prediction, recovery, reliability, command, coordination, and cross-site exposure when they are converging into one institutional condition.',
    requiredAction:
      input.trajectory.trajectoryRecommendation ??
      'Maintain executive watch until continuity movement is explainable and recovery credibility is proven.',
    watchNext:
      input.trajectory.watchNext ??
      'Watch for recurrence, drift, coordination delay, and unverified recovery claims.',
  }
}

export function buildCGISituationRoomBriefingReport(input: {
  operatingPicture: CGISituationRoomOperatingPicture
  pilotThread: {
    scenarioName?: string
  }
  trajectory: {
    trajectory?: string
    momentum?: string
    trajectoryDirection?: string
  }
  briefing: {
    dominantConcern?: string
    synthesis?: {
      synthesisPosture?: string
    }
  }
  historyReview: {
    direction?: string
    continuityDriftDetected?: boolean
  }
  report: {
    classification?: string
  }
}) {
  return [
    'TSINAXA CGI ENTERPRISE SITUATION ROOM BRIEF',
    '',
    `Pilot Scenario: ${input.pilotThread.scenarioName ?? 'Not recorded'}`,
    '',
    `Continuity Condition: ${input.operatingPicture.posture}`,
    '',
    `Executive Situation Question: ${input.operatingPicture.operatingQuestion}`,
    '',
    `Pressure Reading: ${input.operatingPicture.pressureReading}`,
    '',
    `Trajectory: ${input.trajectory.trajectory ?? 'Not recorded'}`,
    '',
    `Momentum: ${input.trajectory.momentum ?? 'Not recorded'}`,
    '',
    `Direction: ${input.trajectory.trajectoryDirection ?? 'Not recorded'}`,
    '',
    `Predictive Reading: ${input.operatingPicture.predictiveReading}`,
    '',
    `Recovery Reading: ${input.operatingPicture.recoveryReading}`,
    '',
    `Reliability Reading: ${input.operatingPicture.reliabilityReading}`,
    '',
    `Command Reading: ${input.operatingPicture.commandReading}`,
    '',
    `Coordination Reading: ${input.operatingPicture.coordinationReading}`,
    '',
    `Cross-Site Reading: ${input.operatingPicture.crossSiteReading}`,
    '',
    `Required Action: ${input.operatingPicture.requiredAction}`,
    '',
    `Watch Next: ${input.operatingPicture.watchNext}`,
    '',
    `Executive Meaning: ${input.operatingPicture.executiveMeaning}`,
    '',
    `Continuity Posture: ${
      input.briefing.synthesis?.synthesisPosture ?? 'Not recorded'
    }`,
    '',
    `Dominant Concern: ${input.briefing.dominantConcern ?? 'Not recorded'}`,
    '',
    `History Direction: ${input.historyReview.direction ?? 'Not recorded'}`,
    '',
    `Continuity Drift Detected: ${
      input.historyReview.continuityDriftDetected ? 'YES' : 'NO'
    }`,
    '',
    `Evidence Standard: ${input.operatingPicture.evidenceStandard}`,
    '',
    `Board Warning: ${input.operatingPicture.boardWarning}`,
    '',
    `Report Classification: ${input.report.classification ?? 'Not recorded'}`,
  ].join('\n')
}