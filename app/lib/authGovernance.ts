import { supabase } from './supabase'

export type GovernanceRole =
  | 'SUPER_ADMIN'
  | 'COMMAND_ADMIN'
  | 'GOVERNANCE_OFFICER'
  | 'INSTITUTION_COORDINATOR'
  | 'RESPONDER'
  | 'VIEWER'

export type GovernanceStatus =
  | 'ACTIVE'
  | 'RESTRICTED'
  | 'SUSPENDED'
  | 'REMOVED'

export type GovernanceUser = {
  id: string
  user_id: string
  email: string
  role: GovernanceRole
  status: GovernanceStatus
  governance_scope: string
}

export async function getCurrentGovernanceUser() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return null
  }

  return data as GovernanceUser
}

export async function hasGovernanceRole(
  allowedRoles: GovernanceRole[]
) {
  const governanceUser = await getCurrentGovernanceUser()

  if (!governanceUser) {
    return false
  }

  if (governanceUser.status !== 'ACTIVE') {
    return false
  }

  return allowedRoles.includes(governanceUser.role)
}

export async function requireGovernanceRole(
  allowedRoles: GovernanceRole[]
) {
  const governanceUser = await getCurrentGovernanceUser()

  if (!governanceUser) {
    return {
      allowed: false,
      reason: 'NO_GOVERNANCE_USER',
    }
  }

  if (governanceUser.status !== 'ACTIVE') {
    return {
      allowed: false,
      reason: 'GOVERNANCE_ACCESS_RESTRICTED',
    }
  }

  if (!allowedRoles.includes(governanceUser.role)) {
    return {
      allowed: false,
      reason: 'INSUFFICIENT_GOVERNANCE_ROLE',
    }
  }

  return {
    allowed: true,
    governanceUser,
  }
}