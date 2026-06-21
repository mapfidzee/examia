'use client'

import { useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase'

export default function SSILoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setMessage('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    const user = data.user

    if (!user) {
      await supabase.auth.signOut()
      setMessage('Unable to verify user access.')
      setLoading(false)
      return
    }

    if (!user.email_confirmed_at) {
      await supabase.auth.signOut()
      setMessage('Email address has not been verified.')
      setLoading(false)
      return
    }

    const { data: roleRecord, error: roleError } = await supabase
      .from('user_roles')
      .select('role,status')
      .eq('user_id', user.id)
      .single()

    if (roleError || !roleRecord) {
      await supabase.auth.signOut()
      setMessage('Access denied. No SSI authorization found.')
      setLoading(false)
      return
    }

    const allowedRoles = ['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']
    const allowedStatuses = ['ACTIVE']

    const hasRole = allowedRoles.includes(roleRecord.role)
    const hasStatus = allowedStatuses.includes(roleRecord.status)

    if (!hasRole || !hasStatus) {
      await supabase.auth.signOut()
      setMessage('Access denied. Your account is not authorized for SSI.')
      setLoading(false)
      return
    }

    router.replace('/ssi')
  }

  async function handleLogout() {
    setLoading(true)
    setMessage('')

    await supabase.auth.signOut()

    setEmail('')
    setPassword('')
    setLoading(false)
    setMessage('Signed out. Enter authorized SSI credentials to continue.')
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <p style={styles.eyebrow}>TSINAXA SSI • SECURE ACCESS</p>

        <h1 style={styles.title}>Sign in to TSINAXA SSI</h1>

        <p style={styles.subtitle}>
          Access is restricted to authorized structural stability personnel.
          Hidden strain intelligence is protected by role-based access controls.
        </p>

        <form style={styles.form} onSubmit={handleSubmit}>
          <label style={styles.label}>
            Email

            <input
              type="email"
              autoComplete="email"
              placeholder="name@organization.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              style={styles.input}
              required
            />
          </label>

          <label style={styles.label}>
            Password

            <input
              type="password"
              autoComplete="current-password"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={styles.input}
              required
            />
          </label>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Verifying access...' : 'Sign In'}
          </button>

          <button type="button" style={styles.secondaryButton} onClick={handleLogout} disabled={loading}>
            Clear Session / Sign Out
          </button>
        </form>

        {message ? <div style={styles.message}>{message}</div> : null}

        <div style={styles.divider} />

        <section style={styles.identityPanel}>
          <h2 style={styles.identityTitle}>Structural Stability Intelligence System</h2>

          <p style={styles.identityText}>
            SSI detects hidden structural strain before visible instability emerges.
          </p>

          <div style={styles.boundary}>
            <strong>SSI Boundary</strong>

            <p style={styles.boundaryText}>
              SSI identifies structural pressure signals. It does not govern visible instability,
              manage interventions, or perform continuity oversight.
            </p>
          </div>
        </section>

        <div style={styles.footer}>
          <Link href="/ssi" style={styles.link}>
            Executive Dashboard
          </Link>

          <span style={styles.separator}>•</span>

          <Link href="/ssi/weekly-brief" style={styles.link}>
            Weekly Brief
          </Link>
        </div>
      </section>
    </main>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: '32px',
    background:
      'radial-gradient(circle at top, rgba(214,178,94,0.08), transparent 40%), #050505',
  },
  card: {
    width: '100%',
    maxWidth: '620px',
    padding: '40px',
    borderRadius: '28px',
    border: '1px solid rgba(214,178,94,0.18)',
    background: '#090807',
    boxShadow: '0 0 80px rgba(0,0,0,0.55)',
  },
  eyebrow: {
    margin: 0,
    color: '#d6b25e',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
  title: {
    margin: '18px 0 12px',
    color: '#fff8e7',
    fontSize: '58px',
    lineHeight: 1,
    letterSpacing: '-0.04em',
  },
  subtitle: {
    margin: 0,
    color: '#cfc7b5',
    fontSize: '18px',
    lineHeight: 1.6,
  },
  form: {
    display: 'grid',
    gap: '22px',
    marginTop: '36px',
  },
  label: {
    display: 'grid',
    gap: '10px',
    color: '#cfc7b5',
    fontSize: '14px',
    fontWeight: 700,
  },
  input: {
    width: '100%',
    padding: '18px 20px',
    borderRadius: '18px',
    border: '1px solid rgba(214,178,94,0.22)',
    background: '#d7dde8',
    color: '#111827',
    fontSize: '18px',
    outline: 'none',
  },
  button: {
    marginTop: '6px',
    padding: '18px',
    border: 'none',
    borderRadius: '18px',
    background: '#d6b25e',
    color: '#050505',
    fontSize: '18px',
    fontWeight: 900,
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '15px',
    borderRadius: '18px',
    border: '1px solid rgba(214,178,94,0.28)',
    background: '#11100d',
    color: '#d6b25e',
    fontSize: '15px',
    fontWeight: 900,
    cursor: 'pointer',
  },
  message: {
    marginTop: '18px',
    padding: '14px 16px',
    borderRadius: '14px',
    border: '1px solid rgba(214,178,94,0.18)',
    background: '#11100d',
    color: '#d6b25e',
    fontSize: '14px',
  },
  divider: {
    height: '1px',
    background: 'rgba(214,178,94,0.14)',
    margin: '32px 0',
  },
  identityPanel: {
    display: 'grid',
    gap: '14px',
  },
  identityTitle: {
    margin: 0,
    color: '#d6b25e',
    fontSize: '20px',
  },
  identityText: {
    margin: 0,
    color: '#cfc7b5',
    lineHeight: 1.6,
  },
  boundary: {
    padding: '18px',
    borderRadius: '18px',
    border: '1px solid rgba(214,178,94,0.16)',
    background: '#11100d',
  },
  boundaryText: {
    margin: '10px 0 0',
    color: '#cfc7b5',
    lineHeight: 1.6,
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    marginTop: '28px',
  },
  link: {
    color: '#d6b25e',
    textDecoration: 'none',
    fontWeight: 700,
  },
  separator: {
    color: '#9f8142',
  },
}