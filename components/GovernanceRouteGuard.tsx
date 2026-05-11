'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { GovernanceRole } from '@/lib/authGovernance'
import { requireGovernanceRole } from '@/lib/authGovernance'
import { supabase } from '@/lib/supabase'

export default function GovernanceRouteGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: GovernanceRole[]
  children: ReactNode
}) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)

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

    const result = await requireGovernanceRole(allowedRoles)

    if (!result.allowed) {
      router.replace('/access-denied')
      return
    }

    setAllowed(true)
    setChecking(false)
  }

  if (checking) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #020617 0%, #0f172a 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <section>
          <p
            style={{
              color: '#67e8f9',
              fontWeight: 900,
              letterSpacing: '2px',
              fontSize: '12px',
            }}
          >
            EXAMIA LIS • GOVERNANCE ACCESS CHECK
          </p>

          <h1 style={{ fontSize: '34px', marginTop: '12px' }}>
            Checking governed access...
          </h1>

          <p style={{ color: '#cbd5e1', marginTop: '12px' }}>
            Verifying your role, status, and command permissions.
          </p>
        </section>
      </main>
    )
  }

  if (!allowed) return null

  return <>{children}</>
}