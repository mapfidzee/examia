'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase'

const allowedRoles = ['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']
const allowedStatuses = ['ACTIVE']

const ACCESS_TIMEOUT_MS = 12000

async function withTimeout<T>(
  operation: PromiseLike<T>,
  timeoutMs = ACCESS_TIMEOUT_MS,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const timeout = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('SSI_ACCESS_TIMEOUT'))
    }, timeoutMs)
  })

  try {
    return await Promise.race([Promise.resolve(operation), timeout])
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

export default function SSILoginPage() {
  const router = useRouter()
  const mountedRef = useRef(true)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [accessFailure, setAccessFailure] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    mountedRef.current = true
    void verifyExistingSession()

    return () => {
      mountedRef.current = false
    }
  }, [])

  async function safeSignOut() {
    try {
      await withTimeout(supabase.auth.signOut())
    } catch {
      // The local login interface must remain available even if remote sign-out confirmation fails.
    }
  }

  async function readAuthorizedRole(userId: string) {
    const result = await withTimeout(
      supabase
        .from('user_roles')
        .select('role,status')
        .eq('user_id', userId)
        .maybeSingle(),
    )

    if (result.error) {
      throw new Error('SSI_ROLE_SERVICE_UNAVAILABLE')
    }

    return result.data
  }

  async function verifyExistingSession() {
    if (!mountedRef.current) return

    setCheckingAccess(true)
    setRedirecting(false)
    setAccessFailure(false)
    setMessage('')

    try {
      const {
        data: { session },
        error,
      } = await withTimeout(supabase.auth.getSession())

      if (error) {
        throw new Error('SSI_AUTH_SERVICE_UNAVAILABLE')
      }

      if (!mountedRef.current) return

      if (!session?.user) {
        return
      }

      if (!session.user.email_confirmed_at) {
        await safeSignOut()

        if (!mountedRef.current) return

        setMessage('Verify your email address before signing in.')
        return
      }

      const roleRecord = await readAuthorizedRole(session.user.id)

      if (!mountedRef.current) return

      const isAuthorized =
        roleRecord &&
        allowedRoles.includes(roleRecord.role) &&
        allowedStatuses.includes(roleRecord.status)

      if (!isAuthorized) {
        await safeSignOut()

        if (!mountedRef.current) return

        setMessage('This account is not authorized for TSINAXA SSI.')
        return
      }

      setRedirecting(true)
      router.replace('/ssi/assignments')
      router.refresh()
    } catch {
      if (!mountedRef.current) return

      setAccessFailure(true)
      setMessage('SSI could not verify access. Check the connection and try again.')
    } finally {
      if (mountedRef.current) {
        setCheckingAccess(false)
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedEmail = email.trim()

    if (!normalizedEmail || !password) {
      setMessage('Enter your email address and password.')
      return
    }

    setSubmitting(true)
    setRedirecting(false)
    setAccessFailure(false)
    setMessage('')

    try {
      const {
        data,
        error,
      } = await withTimeout(
        supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        }),
      )

      if (error || !data.user) {
        setMessage('The email address or password could not be verified.')
        return
      }

      if (!data.user.email_confirmed_at) {
        await safeSignOut()
        setPassword('')
        setMessage('Verify your email address before signing in.')
        return
      }

      const roleRecord = await readAuthorizedRole(data.user.id)

      const isAuthorized =
        roleRecord &&
        allowedRoles.includes(roleRecord.role) &&
        allowedStatuses.includes(roleRecord.status)

      if (!isAuthorized) {
        await safeSignOut()
        setPassword('')
        setMessage('This account is not authorized for TSINAXA SSI.')
        return
      }

      setRedirecting(true)
      router.replace('/ssi/assignments')
      router.refresh()
    } catch {
      setAccessFailure(true)
      setMessage('SSI could not verify access. Check the connection and try again.')
    } finally {
      if (mountedRef.current) {
        setSubmitting(false)
      }
    }
  }

  if (checkingAccess || redirecting) {
    return (
      <main style={styles.page}>
        <section style={styles.shell}>
          <div style={styles.accessCard}>
            <p style={styles.eyebrow}>TSINAXA SSI • SECURE ACCESS</p>
            <h1 style={styles.title}>
              {redirecting ? 'Opening SSI' : 'Verifying SSI Access'}
            </h1>
            <p style={styles.subtitle}>
              {redirecting
                ? 'Authorized access confirmed. Opening operational stability evidence...'
                : 'Checking authorized structural stability access...'}
            </p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <section style={styles.shell}>
        <div style={styles.loginCard}>
          <header style={styles.header}>
            <p style={styles.eyebrow}>TSINAXA SSI • SECURE ACCESS</p>
            <h1 style={styles.title}>Structural Stability Intelligence</h1>
            <p style={styles.subtitle}>
              Sign in with an authorized and verified account to access the SSI operational
              evidence workflow.
            </p>
          </header>

          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>
              <span>Email address</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@organization.org"
                disabled={submitting}
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              <span>Password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                disabled={submitting}
                style={styles.input}
              />
            </label>

            <button
              type="submit"
              disabled={submitting || !email.trim() || !password}
              style={{
                ...styles.button,
                ...(submitting || !email.trim() || !password
                  ? styles.buttonDisabled
                  : {}),
              }}
            >
              {submitting ? 'Verifying access...' : 'Sign in to SSI'}
            </button>

            {message ? (
              <div
                role="status"
                aria-live="polite"
                style={{
                  ...styles.message,
                  ...(accessFailure ? styles.failureMessage : {}),
                }}
              >
                <span>{message}</span>

                {accessFailure ? (
                  <button
                    type="button"
                    onClick={() => void verifyExistingSession()}
                    disabled={checkingAccess || submitting}
                    style={styles.retryButton}
                  >
                    Try again
                  </button>
                ) : null}
              </div>
            ) : null}
          </form>

          <footer style={styles.footer}>
            Authorized access only. SSI records structural and operational evidence without
            names, blame, or surveillance.
          </footer>
        </div>
      </section>
    </main>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at 50% -140px, rgba(214,178,94,0.10), transparent 460px), #050505',
    color: '#fff8e7',
    padding: '40px',
    display: 'grid',
    placeItems: 'center',
    fontFamily: 'Inter, Arial, sans-serif',
  },
  shell: {
    width: 'min(760px, 100%)',
    margin: '0 auto',
  },
  accessCard: {
    border: '1px solid rgba(214,178,94,0.30)',
    background: '#090807',
    borderRadius: '26px',
    padding: '34px',
    boxShadow: '0 24px 80px rgba(0,0,0,0.38)',
  },
  loginCard: {
    border: '1px solid rgba(214,178,94,0.30)',
    background: '#090807',
    borderRadius: '26px',
    padding: '34px',
    boxShadow: '0 24px 80px rgba(0,0,0,0.38)',
  },
  header: {
    marginBottom: '26px',
    paddingBottom: '22px',
    borderBottom: '1px solid rgba(214,178,94,0.20)',
  },
  eyebrow: {
    color: '#d6b25e',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    fontSize: '12px',
    fontWeight: 900,
    margin: 0,
  },
  title: {
    color: '#d6b25e',
    fontSize: '38px',
    lineHeight: 1.1,
    margin: '14px 0 12px',
  },
  subtitle: {
    color: '#cfc7b5',
    lineHeight: 1.6,
    margin: 0,
    maxWidth: '650px',
  },
  form: {
    display: 'grid',
    gap: '18px',
  },
  label: {
    display: 'grid',
    gap: '8px',
    color: '#cfc7b5',
    fontSize: '14px',
    fontWeight: 700,
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '14px 16px',
    borderRadius: '14px',
    border: '1px solid rgba(214,178,94,0.28)',
    background: '#11100d',
    color: '#fff8e7',
    fontSize: '16px',
    outline: 'none',
  },
  button: {
    marginTop: '4px',
    padding: '14px 18px',
    border: 'none',
    borderRadius: '14px',
    background: '#d6b25e',
    color: '#050505',
    fontSize: '15px',
    fontWeight: 900,
    cursor: 'pointer',
  },
  buttonDisabled: {
    opacity: 0.58,
    cursor: 'not-allowed',
  },
  message: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    border: '1px solid rgba(214,178,94,0.24)',
    background: 'rgba(214,178,94,0.07)',
    color: '#fff8e7',
    borderRadius: '14px',
    padding: '13px 14px',
    lineHeight: 1.5,
  },
  failureMessage: {
    border: '1px solid rgba(214,178,94,0.40)',
  },
  retryButton: {
    flexShrink: 0,
    border: '1px solid rgba(214,178,94,0.42)',
    background: '#11100d',
    color: '#d6b25e',
    borderRadius: '999px',
    padding: '8px 13px',
    fontWeight: 900,
    cursor: 'pointer',
  },
  footer: {
    marginTop: '26px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(214,178,94,0.20)',
    color: '#9f998b',
    fontSize: '13px',
    lineHeight: 1.6,
  },
}