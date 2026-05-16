import { supabase } from './supabase'

export type CGIGovernanceMembership = {
  id: string
  user_id: string
  email: string
  governance_role: string
  governance_institution: string
  executive_visibility_level: string
  governance_status: string
}

export async function getCurrentCGIMembership() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data, error } = await supabase
    .from('cgi_governance_memberships')
    .select('*')
    .eq('user_id', user.id)
    .eq('governance_status', 'ACTIVE')
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return data as CGIGovernanceMembership
}