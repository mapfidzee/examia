export function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function interpretRoutingCongestion(load: number, unrouted: number) {
  if (load >= 4 || unrouted >= 3) return 'ROUTING CONSTRAINT CRITICAL'
  if (load >= 2 || unrouted >= 1) return 'ROUTING CONSTRAINT VISIBLE'
  return 'ROUTING FLOW CONTROLLED'
}

export function interpretStabilizationDelay(stalled: number) {
  if (stalled >= 3) return 'STABILIZATION CONSTRAINT CRITICAL'
  if (stalled >= 1) return 'STABILIZATION CONSTRAINT ACTIVE'
  return 'STABILIZATION FLOW ACTIVE'
}

export function interpretSafeguarding(flags: number) {
  if (flags >= 3) return 'SAFEGUARDING CONSTRAINT CRITICAL'
  if (flags >= 1) return 'SAFEGUARDING VISIBILITY ACTIVE'
  return 'SAFEGUARDING PRESSURE CONTAINED'
}

export function interpretResponderPressure(load: number) {
  if (load >= 4) return 'OWNERSHIP CONCENTRATION CRITICAL'
  if (load >= 2) return 'OWNERSHIP CONCENTRATION VISIBLE'
  return 'OWNERSHIP LOAD CONTROLLED'
}

export function interpretRegionalPressure(load: number) {
  if (load >= 5) return 'REGIONAL CONSTRAINT STRUCTURAL'
  if (load >= 3) return 'REGIONAL CONSTRAINT VISIBLE'
  return 'REGIONAL PRESSURE CONTROLLED'
}