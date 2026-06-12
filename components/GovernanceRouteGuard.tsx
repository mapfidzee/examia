'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import type { GovernanceRole } from '@/lib/authGovernance'
import { requireGovernanceRole } from '@/lib/authGovernance'
import { supabase } from '@/lib/supabase'

type GovernanceAccessState =
  | 'CHECKING'
  | 'ALLOWED'
  | 'DENIED'
  | 'RESTRICTED'
  | 'SUSPENDED'
  | 'INACTIVE'

export default function GovernanceRouteGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: GovernanceRole[]
  children: ReactNode
}) {
  const router = useRouter()

  const [accessState, setAccessState] =
    useState<GovernanceAccessState>('CHECKING')

  const [message, setMessage] = useState(
    'Verifying governance access...'
  )

  useEffect(() => {
    checkAccess()
  }, [])

  async function checkAccess() {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      router.replace('/login')
      return
    }

    const roleResult = await requireGovernanceRole(allowedRoles)

    if (!roleResult.allowed) {
      setAccessState('DENIED')

      setMessage(
        'Your governance role does not currently permit access to this infrastructure area.'
      )

      router.replace('/access-denied')
      return
    }

    const { data: responder, error: responderError } =
      await supabase
        .from('responders')
        .select(`
          operational_status,
          governance_role,
          full_name,
          email
        `)
        .eq('email', user.email)
        .maybeSingle()

    if (responderError) {
      console.error(responderError)

      setAccessState('DENIED')

      setMessage(
        'Governance verification could not be completed.'
      )

      router.replace('/access-denied')
      return
    }

    if (!responder) {
      setAccessState('INACTIVE')

      setMessage(
        'No governed responder profile is currently linked to this account.'
      )

      router.replace('/access-denied')
      return
    }

    const operationalStatus =
      responder.operational_status || 'INACTIVE'

    if (operationalStatus === 'SUSPENDED') {
      setAccessState('SUSPENDED')

      setMessage('Governance access is currently suspended.')

      router.replace('/access-denied')
      return
    }

    if (operationalStatus === 'RESTRICTED') {
      setAccessState('RESTRICTED')

      setMessage('Governance access is currently restricted.')

      router.replace('/access-denied')
      return
    }

    if (operationalStatus !== 'ACTIVE') {
      setAccessState('INACTIVE')

      setMessage('Governance activation is not yet complete.')

      router.replace('/access-denied')
      return
    }

    setAccessState('ALLOWED')
  }

  if (accessState === 'CHECKING') {
    return (
      <InfrastructureAccessScreen
        title="Checking governed access..."
        message={message}
        status="ACCESS_VERIFICATION_ACTIVE"
      />
    )
  }

  if (accessState === 'DENIED') {
    return (
      <InfrastructureAccessScreen
        title="Governance access denied"
        message={message}
        status="ROLE_ACCESS_DENIED"
      />
    )
  }

  if (accessState === 'RESTRICTED') {
    return (
      <InfrastructureAccessScreen
        title="Governance access restricted"
        message={message}
        status="RESTRICTED_ACCESS_STATE"
      />
    )
  }

  if (accessState === 'SUSPENDED') {
    return (
      <InfrastructureAccessScreen
        title="Governance access suspended"
        message={message}
        status="SUSPENDED_ACCESS_STATE"
      />
    )
  }

  if (accessState === 'INACTIVE') {
    return (
      <InfrastructureAccessScreen
        title="Governance activation incomplete"
        message={message}
        status="INACTIVE_GOVERNANCE_STATE"
      />
    )
  }

  return <>{children}</>
}

function InfrastructureAccessScreen({
  title,
  message,
  status,
}: {
  title: string
  message: string
  status: string
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.1),transparent_34%),linear-gradient(180deg,#050505_0%,#0b0b0b_50%,#111827_100%)] px-6 py-10 text-neutral-100">
      <section className="w-full max-w-3xl rounded-[28px] border border-[#2a2418] bg-[#070707]/95 p-8 shadow-[0_25px_90px_rgba(0,0,0,0.55)] sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-400">
          TSINAXA CGI • GOVERNANCE ACCESS CONTROL
        </p>

        <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
          {title}
        </h1>

        <div className="mt-6 inline-flex rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-amber-200">
          {status}
        </div>

        <p className="mt-6 text-base leading-8 text-neutral-300">
          {message}
        </p>

        <div className="mt-8 rounded-2xl border border-[#2a2418] bg-[#111827]/45 p-5">
          <p className="font-black text-amber-300">
            Governance Boundary
          </p>

          <p className="mt-3 text-sm leading-7 text-neutral-300">
            TSINAXA CGI protects continuity governance,
            operational traceability, recovery visibility, structural
            memory, executive survivability interpretation, and audit
            integrity. Access is governed according to operational
            authorization and governance role.
          </p>
        </div>
      </section>
    </main>
  )
}