'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const ACCESS_TIMEOUT_MS = 10000

function withTimeout<T>(
  promise: PromiseLike<T>,
  timeoutMs: number,
): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      window.setTimeout(() => {
        reject(new Error('SSI organization lookup timed out.'))
      }, timeoutMs)
    }),
  ])
}

type SSIOrganizationLayoutProps = {
  children: ReactNode
}

export default function SSIOrganizationLayout({
  children,
}: SSIOrganizationLayoutProps) {
  const pathname = usePathname()

  const [organizationName, setOrganizationName] =
    useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadOrganization() {
      setOrganizationName(null)

      try {
        const {
          data: { session },
          error: sessionError,
        } = await withTimeout(
          supabase.auth.getSession(),
          ACCESS_TIMEOUT_MS,
        )

        if (sessionError) {
          throw sessionError
        }

        if (!active || !session?.user) {
          return
        }

        const { data: roleRecord, error: roleError } =
          await withTimeout(
            supabase
              .from('user_roles')
              .select('organization_id')
              .eq('user_id', session.user.id)
              .maybeSingle(),
            ACCESS_TIMEOUT_MS,
          )

        if (roleError) {
          throw roleError
        }

        if (!active || !roleRecord?.organization_id) {
          return
        }

        const {
          data: organizationRecord,
          error: organizationError,
        } = await withTimeout(
          supabase
            .from('ssi_organizations')
            .select('organization_name')
            .eq('id', roleRecord.organization_id)
            .maybeSingle(),
          ACCESS_TIMEOUT_MS,
        )

        if (organizationError) {
          throw organizationError
        }

        if (active) {
          setOrganizationName(
            organizationRecord?.organization_name ?? null,
          )
        }
      } catch (error) {
        console.error(
          'SSI organization identity lookup failed.',
          error,
        )
      }
    }

    if (pathname !== '/ssi/login') {
      void loadOrganization()
    } else {
      setOrganizationName(null)
    }

    return () => {
      active = false
    }
  }, [pathname])

  const showOrganizationShell = pathname !== '/ssi/login'

  return (
    <>
      {showOrganizationShell ? (
        <header style={styles.organizationShell}>
          <div style={styles.organizationIdentity}>
            <span style={styles.productName}>TSINAXA SSI</span>

            {organizationName ? (
              <>
                <span aria-hidden="true" style={styles.separator}>
                  •
                </span>

                <span style={styles.organizationName}>
                  {organizationName}
                </span>
              </>
            ) : null}
          </div>
        </header>
      ) : null}

      {children}
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  organizationShell: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '9px 24px',
    background: '#090806',
    borderBottom: '1px solid rgba(181, 145, 65, 0.32)',
  },

  organizationIdentity: {
    width: 'calc(100% - 32px)',
    maxWidth: '1320px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '7px',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  productName: {
    color: '#d8b65a',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.08em',
    lineHeight: 1.2,
  },

  separator: {
    color: 'rgba(181, 145, 65, 0.55)',
    fontSize: '11px',
    lineHeight: 1.2,
  },

  organizationName: {
    color: '#e8ddc2',
    fontSize: '11px',
    fontWeight: 500,
    lineHeight: 1.2,
  },
}