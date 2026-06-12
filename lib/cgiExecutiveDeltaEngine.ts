export type CGIExecutiveDeltaDirection =
  | 'IMPROVING'
  | 'STABLE'
  | 'WATCH'
  | 'DEGRADING'
  | 'INSUFFICIENT_HISTORY'

export type CGIExecutiveDeltaConfidence = 'HIGH' | 'MODERATE' | 'LOW'

export type CGIExecutiveDeltaInput = {
  current: {
    activeInstability: number
    recoveryRecords: number
    commandPressure: number
    historicalMemory: number
    coordinationPressure: number
    crossSitePressure: number
    auditPressure: number
    safeguardingVisible: number
    recurrenceVisible: number
    fragileRecovery: number
  }
  previous?: {
    activeInstability: number
    recoveryRecords: number
    commandPressure: number
    historicalMemory: number
    coordinationPressure: number
    crossSitePressure: number
    auditPressure: number
    safeguardingVisible: number
    recurrenceVisible: number
    fragileRecovery: number
  } | null
}

export type CGIExecutiveDeltaReading = {
  direction: CGIExecutiveDeltaDirection
  confidence: CGIExecutiveDeltaConfidence
  previousReading: string
  currentReading: string
  executiveChange: string
  whyItChanged: string
  whatImproved: string
  whatWorsened: string
  whatCouldBreakItAgain: string
  threatStack: string[]
  boardSentence: string
}

function pressureScore(input: CGIExecutiveDeltaInput['current']) {
  return (
    input.activeInstability * 2 +
    input.commandPressure * 3 +
    input.coordinationPressure * 2 +
    input.crossSitePressure * 2 +
    input.auditPressure +
    input.safeguardingVisible * 3 +
    input.recurrenceVisible * 3 +
    input.fragileRecovery * 2
  )
}

function postureFromScore(score: number) {
  if (score >= 18) return 'CRITICAL'
  if (score >= 10) return 'ELEVATED'
  if (score >= 4) return 'WATCH'
  return 'CLEAR'
}

function differenceLabel(delta: number) {
  if (delta <= -6) return 'materially reduced'
  if (delta < 0) return 'reduced'
  if (delta === 0) return 'unchanged'
  if (delta <= 5) return 'increased'
  return 'materially increased'
}

function deriveDirection(delta: number): CGIExecutiveDeltaDirection {
  if (delta <= -6) return 'IMPROVING'
  if (delta < 0) return 'STABLE'
  if (delta === 0) return 'WATCH'
  if (delta <= 5) return 'WATCH'
  return 'DEGRADING'
}

function deriveConfidence(input: {
  previousAvailable: boolean
  absoluteDelta: number
  currentScore: number
}): CGIExecutiveDeltaConfidence {
  if (!input.previousAvailable) return 'LOW'
  if (input.absoluteDelta >= 6) return 'HIGH'
  if (input.absoluteDelta >= 2) return 'MODERATE'
  if (input.currentScore <= 3) return 'MODERATE'
  return 'LOW'
}

function buildThreatStack(current: CGIExecutiveDeltaInput['current']) {
  const threats = [
    {
      label: 'Command pressure',
      value: current.commandPressure,
    },
    {
      label: 'Recurrence',
      value: current.recurrenceVisible,
    },
    {
      label: 'Cross-site exposure',
      value: current.crossSitePressure,
    },
    {
      label: 'Coordination pressure',
      value: current.coordinationPressure,
    },
    {
      label: 'Fragile recovery',
      value: current.fragileRecovery,
    },
    {
      label: 'Safeguarding visibility',
      value: current.safeguardingVisible,
    },
    {
      label: 'Audit pressure',
      value: current.auditPressure,
    },
  ]

  const ranked = threats
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 4)
    .map((item) => item.label)

  return ranked.length > 0 ? ranked : ['No active enterprise threat dominant']
}

function buildImprovementText(input: {
  current: CGIExecutiveDeltaInput['current']
  previous: CGIExecutiveDeltaInput['current']
}) {
  const improvements: string[] = []

  if (input.current.commandPressure < input.previous.commandPressure) {
    improvements.push('command pressure decreased')
  }

  if (input.current.activeInstability < input.previous.activeInstability) {
    improvements.push('active instability decreased')
  }

  if (input.current.recurrenceVisible < input.previous.recurrenceVisible) {
    improvements.push('recurrence visibility decreased')
  }

  if (input.current.fragileRecovery < input.previous.fragileRecovery) {
    improvements.push('fragile recovery exposure decreased')
  }

  if (input.current.coordinationPressure < input.previous.coordinationPressure) {
    improvements.push('coordination pressure decreased')
  }

  if (input.current.crossSitePressure < input.previous.crossSitePressure) {
    improvements.push('cross-site exposure decreased')
  }

  return improvements.length > 0
    ? improvements.join(', ')
    : 'no major improvement signal is visible'
}

function buildWorseningText(input: {
  current: CGIExecutiveDeltaInput['current']
  previous: CGIExecutiveDeltaInput['current']
}) {
  const worsening: string[] = []

  if (input.current.commandPressure > input.previous.commandPressure) {
    worsening.push('command pressure increased')
  }

  if (input.current.activeInstability > input.previous.activeInstability) {
    worsening.push('active instability increased')
  }

  if (input.current.recurrenceVisible > input.previous.recurrenceVisible) {
    worsening.push('recurrence visibility increased')
  }

  if (input.current.fragileRecovery > input.previous.fragileRecovery) {
    worsening.push('fragile recovery exposure increased')
  }

  if (input.current.coordinationPressure > input.previous.coordinationPressure) {
    worsening.push('coordination pressure increased')
  }

  if (input.current.crossSitePressure > input.previous.crossSitePressure) {
    worsening.push('cross-site exposure increased')
  }

  return worsening.length > 0
    ? worsening.join(', ')
    : 'no major deterioration signal is visible'
}

export function buildCGIExecutiveDeltaReading(
  input: CGIExecutiveDeltaInput,
): CGIExecutiveDeltaReading {
  const currentScore = pressureScore(input.current)

  if (!input.previous) {
    const currentReading = postureFromScore(currentScore)

    return {
      direction: 'INSUFFICIENT_HISTORY',
      confidence: 'LOW',
      previousReading: 'NO PRIOR EXECUTIVE READING',
      currentReading,
      executiveChange:
        'Executive Center has a current reading, but no prior comparison is available.',
      whyItChanged:
        'No previous executive continuity snapshot is available for delta comparison.',
      whatImproved: 'Improvement cannot yet be confirmed.',
      whatWorsened: 'Deterioration cannot yet be confirmed.',
      whatCouldBreakItAgain:
        'Recurrence, command pressure, cross-site exposure, fragile recovery, or coordination drift could weaken the current posture.',
      threatStack: buildThreatStack(input.current),
      boardSentence:
        'Current executive posture is visible, but movement over time cannot yet be verified.',
    }
  }

  const previousScore = pressureScore(input.previous)
  const delta = currentScore - previousScore
  const previousReading = postureFromScore(previousScore)
  const currentReading = postureFromScore(currentScore)
  const direction = deriveDirection(delta)
  const confidence = deriveConfidence({
    previousAvailable: true,
    absoluteDelta: Math.abs(delta),
    currentScore,
  })

  const changeLabel = differenceLabel(delta)
  const threatStack = buildThreatStack(input.current)

  const whatImproved = buildImprovementText({
    current: input.current,
    previous: input.previous,
  })

  const whatWorsened = buildWorseningText({
    current: input.current,
    previous: input.previous,
  })

  const executiveChange =
    previousReading === currentReading
      ? `Executive reading remains ${currentReading}.`
      : `Executive reading moved from ${previousReading} to ${currentReading}.`

  const whyItChanged =
    delta === 0
      ? 'The executive pressure score is unchanged from the prior reading.'
      : `The executive pressure score ${changeLabel} from ${previousScore} to ${currentScore}.`

  const whatCouldBreakItAgain =
    threatStack[0] === 'No active enterprise threat dominant'
      ? 'The current posture could weaken if recurrence, command pressure, coordination drift, or fragile recovery reappears.'
      : `${threatStack[0]} is the leading threat that could weaken the current posture.`

  const boardSentence =
    direction === 'IMPROVING'
      ? `Executive continuity is improving with ${confidence.toLowerCase()} confidence; ${whatImproved}.`
      : direction === 'DEGRADING'
        ? `Executive continuity is degrading with ${confidence.toLowerCase()} confidence; ${whatWorsened}.`
        : direction === 'STABLE'
          ? `Executive continuity is stable with ${confidence.toLowerCase()} confidence; pressure has reduced but still requires interpretation.`
          : `Executive continuity remains under watch with ${confidence.toLowerCase()} confidence; ${whatCouldBreakItAgain}`

  return {
    direction,
    confidence,
    previousReading,
    currentReading,
    executiveChange,
    whyItChanged,
    whatImproved,
    whatWorsened,
    whatCouldBreakItAgain,
    threatStack,
    boardSentence,
  }
}