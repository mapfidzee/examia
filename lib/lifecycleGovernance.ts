export type CaseLifecycleStatus =
  | 'CASE_CREATED'
  | 'NEED_DETECTED'
  | 'UNDER_ASSESSMENT'
  | 'ROUTED'
  | 'INTERVENTION_ACTIVE'
  | 'INTERVENTION_RECORDED'
  | 'OUTCOME_RECORDED'
  | 'RECOVERY_MONITORING'
  | 'PARTIAL_STABILIZATION'
  | 'STABILIZED'
  | 'ESCALATED'
  | 'CLOSED'

export type ContinuityRisk = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'

export type StabilizationConfidence =
  | 'UNKNOWN'
  | 'WEAK'
  | 'EMERGING'
  | 'PARTIAL'
  | 'STRONG'
  | 'STABILIZED'

export type LifecycleDecision = {
  nextStatus: CaseLifecycleStatus
  continuityRisk: ContinuityRisk
  stabilizationConfidence: StabilizationConfidence
  shouldEscalate: boolean
  shouldMonitorRecovery: boolean
  commandVisibility: boolean
  timelineEventType: string
  timelineSummary: string
}

export function evaluateRoutingLifecycle(): LifecycleDecision {
  return {
    nextStatus: 'ROUTED',
    continuityRisk: 'MODERATE',
    stabilizationConfidence: 'EMERGING',
    shouldEscalate: false,
    shouldMonitorRecovery: true,
    commandVisibility: true,
    timelineEventType: 'RESPONDER_ASSIGNED',
    timelineSummary:
      'Case routed into governed response ownership. Recovery continuity monitoring should begin.',
  }
}

export function evaluateInterventionLifecycle(params: {
  completionStatus: string
  continuityRisk: ContinuityRisk
}): LifecycleDecision {
  const { completionStatus, continuityRisk } = params

  const highRisk = continuityRisk === 'HIGH' || continuityRisk === 'CRITICAL'

  if (completionStatus === 'COMPLETED' && !highRisk) {
    return {
      nextStatus: 'INTERVENTION_RECORDED',
      continuityRisk,
      stabilizationConfidence: 'PARTIAL',
      shouldEscalate: false,
      shouldMonitorRecovery: true,
      commandVisibility: true,
      timelineEventType: 'INTERVENTION_EVIDENCE_RECORDED',
      timelineSummary:
        'Controlled intervention evidence recorded. Recovery must still be confirmed before stabilization is assumed.',
    }
  }

  if (highRisk) {
    return {
      nextStatus: 'ESCALATED',
      continuityRisk,
      stabilizationConfidence: 'WEAK',
      shouldEscalate: true,
      shouldMonitorRecovery: true,
      commandVisibility: true,
      timelineEventType: 'INTERVENTION_RISK_ESCALATED',
      timelineSummary:
        'Intervention evidence recorded with elevated continuity risk. Escalation visibility is required.',
    }
  }

  return {
    nextStatus: 'INTERVENTION_ACTIVE',
    continuityRisk,
    stabilizationConfidence: 'EMERGING',
    shouldEscalate: false,
    shouldMonitorRecovery: true,
    commandVisibility: true,
    timelineEventType: 'INTERVENTION_CONTINUITY_MONITORING',
    timelineSummary:
      'Intervention activity recorded. Continuity monitoring remains active because recovery is not yet proven.',
  }
}

export function evaluateOutcomeLifecycle(params: {
  outcomeStatus: string
  continuityOutlook: string
}): LifecycleDecision {
  const { outcomeStatus, continuityOutlook } = params

  const unstableOutlook =
    continuityOutlook === 'ESCALATE' ||
    continuityOutlook === 'HIGH_RISK' ||
    continuityOutlook === 'UNSTABLE'

  if (outcomeStatus === 'STABILIZED' && !unstableOutlook) {
    return {
      nextStatus: 'STABILIZED',
      continuityRisk: 'LOW',
      stabilizationConfidence: 'STABILIZED',
      shouldEscalate: false,
      shouldMonitorRecovery: false,
      commandVisibility: true,
      timelineEventType: 'STABILIZATION_CONFIRMED',
      timelineSummary:
        'Outcome recorded with stabilization confirmed. Case may move toward closure if no recovery risk reappears.',
    }
  }

  if (outcomeStatus === 'PARTIAL_STABILIZATION') {
    return {
      nextStatus: 'RECOVERY_MONITORING',
      continuityRisk: unstableOutlook ? 'HIGH' : 'MODERATE',
      stabilizationConfidence: 'PARTIAL',
      shouldEscalate: unstableOutlook,
      shouldMonitorRecovery: true,
      commandVisibility: true,
      timelineEventType: 'PARTIAL_STABILIZATION_RECORDED',
      timelineSummary:
        'Partial stabilization recorded. Recovery monitoring remains required because outcome is not full stabilization.',
    }
  }

  return {
    nextStatus: unstableOutlook ? 'ESCALATED' : 'RECOVERY_MONITORING',
    continuityRisk: unstableOutlook ? 'HIGH' : 'MODERATE',
    stabilizationConfidence: 'WEAK',
    shouldEscalate: unstableOutlook,
    shouldMonitorRecovery: true,
    commandVisibility: true,
    timelineEventType: unstableOutlook
      ? 'OUTCOME_ESCALATION_REQUIRED'
      : 'OUTCOME_MONITORING_REQUIRED',
    timelineSummary:
      'Outcome recorded without confirmed stabilization. Continued monitoring or escalation is required.',
  }
}

export function explainLifecyclePrinciple() {
  return 'Routing is not resolution. Intervention is not recovery. Outcome is not stabilization. EXAMIA governs the gap until stabilization is confirmed.'
}