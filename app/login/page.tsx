'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CSSProperties } from 'react'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.trim() || !password.trim()) {
      alert('Enter email and password.')
      return
    }

    setLoading(true)
    setMessage('Signing in...')

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setMessage('Access confirmed. Redirecting to command center...')
    router.push('/command')
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <p style={styles.kicker}>EXAMIA LIS • GOVERNED ACCESS</p>
        <h1 style={styles.title}>Sign in to EXAMIA</h1>
        <p style={styles.subtitle}>
          Access is governed by role, status, and operational authorization.
        </p>

        <form onSubmit={signIn} style={styles.form}>
          <label style={styles.label}>
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="you@example.com"
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Password"
              style={styles.input}
            />
          </label>

          <button disabled={loading} style={styles.button}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {message && <p style={styles.message}>{message}</p>}
      </section>
    </main>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #020617 0%, #0f172a 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '520px',
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '28px',
    padding: '32px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.45)',
  },
  kicker: {
    color: '#67e8f9',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '2px',
  },
  title: {
    fontSize: '42px',
    lineHeight: 1.05,
    margin: '12px 0',
  },
  subtitle: {
    color: '#cbd5e1',
    lineHeight: 1.6,
    marginBottom: '24px',
  },
  form: {
    display: 'grid',
    gap: '18px',
  },
  label: {
    display: 'grid',
    gap: '8px',
    fontWeight: 800,
  },
  input: {
    width: '100%',
    padding: '16px',
    borderRadius: '14px',
    border: '1px solid #334155',
    background: '#111827',
    color: 'white',
    fontSize: '16px',
  },
  button: {
    width: '100%',
    padding: '16px',
    borderRadius: '14px',
    border: 'none',
    background: '#67e8f9',
    color: '#082f49',
    fontWeight: 900,
    cursor: 'pointer',
    fontSize: '16px',
  },
  message: {
    marginTop: '18px',
    background: '#0f172a',
    border: '1px solid #334155',
    color: '#dbeafe',
    padding: '14px',
    borderRadius: '14px',
    lineHeight: 1.5,
  },
}