export type CGISecurityBoundary =
  | 'INSTITUTION_ISOLATION'
  | 'ROLE_ENFORCEMENT'
  | 'AUDIT_INTEGRITY'
  | 'SENSITIVE_OPERATION'
  | 'GOVERNANCE_SCOPE'
  | 'ENVIRONMENT_DISCIPLINE'

export type CGISecurityRiskLevel =
  | 'LOW'
  | 'WATCH'
  | 'ELEVATED'
  | 'HIGH'
  | 'CRITICAL'

export type CGIGovernanceAccessRole =
  | 'PUBLIC'
  | 'STUDENT'
  | 'TEACHER'
  | 'CASE_COORDINATOR'
  | 'GOVERNANCE_USER'
  | 'ADMIN'
  | 'EXECUTIVE'

export type CGIGovernanceOperation =
  | 'VIEW_PUBLIC_PAGE'
  | 'VIEW_CASE'
  | 'UPDATE_CASE'
  | 'ASSIGN_OWNER'
  | 'VERIFY_EVIDENCE'
  | 'ESCALATE_COMMAND'
  | 'VIEW_EXECUTIVE_COMMAND'
  | 'VIEW_AUDIT_LEDGER'
  | 'EXPORT_GOVERNANCE_DATA'
  | 'MANAGE_USERS'
  | 'MANAGE_ROLES'

export type CGISecurityGovernanceInput = {
  role: CGIGovernanceAccessRole
  operation: CGIGovernanceOperation
  hasInstitutionScope: boolean
  hasAuditLogging: boolean
  hasVerifiedIdentity: boolean
  isProductionEnvironment: boolean
  containsSensitiveContinuityData: boolean
  attemptsCrossInstitutionAccess: boolean
}

export type CGISecurityGovernanceOutput = {
  accessAllowed: boolean
  securityRiskLevel: CGISecurityRiskLevel
  activeBoundaries: CGISecurityBoundary[]
  denialReason: string | null
  requiredSafeguard: string
  auditRequirement: string
  governanceInterpretation: string
}

const EXECUTIVE_OPERATIONS: CGIGovernanceOperation[] = [
  'VIEW_EXECUTIVE_COMMAND',
  'ESCALATE_COMMAND',
  'EXPORT_GOVERNANCE_DATA',
]

const ADMIN_OPERATIONS: CGIGovernanceOperation[] = [
  'MANAGE_USERS',
  'MANAGE_ROLES',
  'EXPORT_GOVERNANCE_DATA',
]

const GOVERNANCE_OPERATIONS: CGIGovernanceOperation[] = [
  'VIEW_CASE',
  'UPDATE_CASE',
  'ASSIGN_OWNER',
  'VERIFY_EVIDENCE',
  'ESCALATE_COMMAND',
  'VIEW_EXECUTIVE_COMMAND',
  'VIEW_AUDIT_LEDGER',
]

function roleCanPerformOperation(
  role: CGIGovernanceAccessRole,
  operation: CGIGovernanceOperation
): boolean {
  if (operation === 'VIEW_PUBLIC_PAGE') return true

  if (role === 'ADMIN') return true

  if (role === 'EXECUTIVE') {
    return (
      EXECUTIVE_OPERATIONS.includes(operation) ||
      operation === 'VIEW_CASE' ||
      operation === 'VIEW_AUDIT_LEDGER'
    )
  }

  if (role === 'GOVERNANCE_USER') {
    return GOVERNANCE_OPERATIONS.includes(operation)
  }

  if (role === 'CASE_COORDINATOR') {
    return (
      operation === 'VIEW_CASE' ||
      operation === 'UPDATE_CASE' ||
      operation === 'ASSIGN_OWNER' ||
      operation === 'VERIFY_EVIDENCE'
    )
  }

  if (role === 'TEACHER') {
    return operation === 'VIEW_CASE' || operation === 'UPDATE_CASE'
  }

  if (role === 'STUDENT') {
    return operation === 'VIEW_CASE'
  }

  return false
}

function deriveActiveBoundaries(
  input: CGISecurityGovernanceInput
): CGISecurityBoundary[] {
  const boundaries: CGISecurityBoundary[] = []

  if (
    input.containsSensitiveContinuityData ||
    input.attemptsCrossInstitutionAccess
  ) {
    boundaries.push('INSTITUTION_ISOLATION')
  }

  if (input.operation !== 'VIEW_PUBLIC_PAGE') {
    boundaries.push('ROLE_ENFORCEMENT')
  }

  if (
    input.operation === 'VERIFY_EVIDENCE' ||
    input.operation === 'ESCALATE_COMMAND' ||
    input.operation === 'VIEW_AUDIT_LEDGER' ||
    input.operation === 'EXPORT_GOVERNANCE_DATA'
  ) {
    boundaries.push('AUDIT_INTEGRITY')
  }

  if (
    input.operation === 'MANAGE_USERS' ||
    input.operation === 'MANAGE_ROLES' ||
    input.operation === 'EXPORT_GOVERNANCE_DATA' ||
    input.operation === 'ESCALATE_COMMAND'
  ) {
    boundaries.push('SENSITIVE_OPERATION')
  }

  if (input.containsSensitiveContinuityData) {
    boundaries.push('GOVERNANCE_SCOPE')
  }

  if (input.isProductionEnvironment) {
    boundaries.push('ENVIRONMENT_DISCIPLINE')
  }

  return [...new Set(boundaries)]
}

function deriveSecurityRiskLevel(
  input: CGISecurityGovernanceInput,
  accessAllowed: boolean
): CGISecurityRiskLevel {
  if (input.attemptsCrossInstitutionAccess) {
    return 'CRITICAL'
  }

  if (!accessAllowed) {
    return 'HIGH'
  }

  if (
    input.isProductionEnvironment &&
    input.containsSensitiveContinuityData &&
    !input.hasAuditLogging
  ) {
    return 'HIGH'
  }

  if (
    input.containsSensitiveContinuityData &&
    (!input.hasInstitutionScope || !input.hasVerifiedIdentity)
  ) {
    return 'HIGH'
  }

  if (
    input.operation === 'EXPORT_GOVERNANCE_DATA' ||
    input.operation === 'MANAGE_USERS' ||
    input.operation === 'MANAGE_ROLES'
  ) {
    return 'ELEVATED'
  }

  if (input.operation !== 'VIEW_PUBLIC_PAGE') {
    return 'WATCH'
  }

  return 'LOW'
}

function buildDenialReason(
  input: CGISecurityGovernanceInput,
  roleAllowed: boolean
): string | null {
  if (input.attemptsCrossInstitutionAccess) {
    return 'Access denied because cross-institution access is not allowed.'
  }

  if (!input.hasVerifiedIdentity && input.operation !== 'VIEW_PUBLIC_PAGE') {
    return 'Access denied because verified identity is required.'
  }

  if (
    input.containsSensitiveContinuityData &&
    !input.hasInstitutionScope
  ) {
    return 'Access denied because institution scope is required.'
  }

  if (!roleAllowed) {
    return 'Access denied because this role is not authorized for the requested governance operation.'
  }

  return null
}

function buildRequiredSafeguard(
  input: CGISecurityGovernanceInput,
  riskLevel: CGISecurityRiskLevel
): string {
  if (riskLevel === 'CRITICAL') {
    return 'Block operation, log event, review institution isolation, and verify RLS enforcement.'
  }

  if (riskLevel === 'HIGH') {
    return 'Require verified identity, institution scope, role authorization, and audit logging before allowing operation.'
  }

  if (riskLevel === 'ELEVATED') {
    return 'Require privileged role verification and complete audit trail.'
  }

  if (riskLevel === 'WATCH') {
    return 'Maintain role checks and audit visibility.'
  }

  return 'No elevated safeguard required beyond standard application controls.'
}

function buildAuditRequirement(
  input: CGISecurityGovernanceInput
): string {
  if (
    input.operation === 'VERIFY_EVIDENCE' ||
    input.operation === 'ESCALATE_COMMAND' ||
    input.operation === 'EXPORT_GOVERNANCE_DATA' ||
    input.operation === 'MANAGE_USERS' ||
    input.operation === 'MANAGE_ROLES'
  ) {
    return 'Audit log required with actor, role, institution scope, operation, timestamp, and outcome.'
  }

  if (input.operation !== 'VIEW_PUBLIC_PAGE') {
    return 'Audit visibility recommended for governance traceability.'
  }

  return 'No governance audit required for public page access.'
}

function buildGovernanceInterpretation(input: {
  accessAllowed: boolean
  riskLevel: CGISecurityRiskLevel
  denialReason: string | null
  boundaries: CGISecurityBoundary[]
}): string {
  if (!input.accessAllowed) {
    return `Operation blocked. ${input.denialReason ?? 'Governance boundary was not satisfied.'}`
  }

  return `Operation allowed under CGI governance controls. Security risk level is ${input.riskLevel}. Active boundaries: ${input.boundaries.join(', ') || 'NONE'}.`
}

export function evaluateCGISecurityGovernance(
  input: CGISecurityGovernanceInput
): CGISecurityGovernanceOutput {
  const roleAllowed = roleCanPerformOperation(input.role, input.operation)

  const accessAllowed =
    roleAllowed &&
    !input.attemptsCrossInstitutionAccess &&
    input.hasVerifiedIdentity &&
    (!input.containsSensitiveContinuityData || input.hasInstitutionScope)

  const activeBoundaries = deriveActiveBoundaries(input)
  const securityRiskLevel = deriveSecurityRiskLevel(input, accessAllowed)
  const denialReason = buildDenialReason(input, roleAllowed)
  const requiredSafeguard = buildRequiredSafeguard(
    input,
    securityRiskLevel
  )
  const auditRequirement = buildAuditRequirement(input)

  return {
    accessAllowed,
    securityRiskLevel,
    activeBoundaries,
    denialReason,
    requiredSafeguard,
    auditRequirement,
    governanceInterpretation: buildGovernanceInterpretation({
      accessAllowed,
      riskLevel: securityRiskLevel,
      denialReason,
      boundaries: activeBoundaries,
    }),
  }
}