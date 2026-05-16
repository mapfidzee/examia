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

    const roleResult = await requireGovernanceRole(
      allowedRoles
    )

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

      setMessage(
        'Governance access is currently suspended.'
      )

      router.replace('/access-denied')
      return
    }

    if (operationalStatus === 'RESTRICTED') {
      setAccessState('RESTRICTED')

      setMessage(
        'Governance access is currently restricted.'
      )

      router.replace('/access-denied')
      return
    }

    if (operationalStatus !== 'ACTIVE') {
      setAccessState('INACTIVE')

      setMessage(
        'Governance activation is not yet complete.'
      )

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
    <main
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #020617 0%, #0f172a 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: '720px',
          background: '#020617',
          border: '1px solid #1e293b',
          borderRadius: '28px',
          padding: '36px',
          boxShadow: '0 25px 80px rgba(0,0,0,0.45)',
        }}
      >
        <p
          style={{
            color: '#67e8f9',
            fontWeight: 900,
            letterSpacing: '2px',
            fontSize: '12px',
            margin: 0,
          }}
        >
          TSINAXA CGI • GOVERNANCE ACCESS CONTROL
        </p>

        <h1
          style={{
            fontSize: 'clamp(32px, 6vw, 52px)',
            lineHeight: 1.05,
            marginTop: '16px',
            marginBottom: '18px',
          }}
        >
          {title}
        </h1>

        <div
          style={{
            display: 'inline-flex',
            padding: '10px 14px',
            borderRadius: '999px',
            background: '#082f49',
            border: '1px solid #155e75',
            color: '#bae6fd',
            fontSize: '12px',
            fontWeight: 900,
            letterSpacing: '0.12em',
            marginBottom: '24px',
          }}
        >
          {status}
        </div>

        <p
          style={{
            color: '#cbd5e1',
            lineHeight: 1.8,
            fontSize: '16px',
            margin: 0,
          }}
        >
          {message}
        </p>

        <div
          style={{
            marginTop: '28px',
            padding: '18px',
            borderRadius: '18px',
            background: '#0f172a',
            border: '1px solid #334155',
          }}
        >
          <p
            style={{
              color: '#67e8f9',
              fontWeight: 800,
              marginTop: 0,
            }}
          >
            Governance Boundary
          </p>

          <p
            style={{
              color: '#cbd5e1',
              lineHeight: 1.7,
              marginBottom: 0,
            }}
          >
            TSINAXA CGI protects continuity governance,
            operational traceability, recovery visibility,
            structural memory, executive survivability interpretation,
            and audit integrity. Access is governed according to
            operational authorization and governance role.
          </p>
        </div>
      </section>
    </main>
  )
}