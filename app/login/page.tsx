'use client'

import { useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.trim() || !password.trim()) {
      setMessage('Enter email and password.')
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
        <p style={styles.kicker}>TSINAXA CGI • GOVERNED ACCESS</p>
        <h1 style={styles.title}>Sign in to TSINAXA</h1>
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

        {message ? <p style={styles.message}>{message}</p> : null}
      </section>
    </main>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at 50% -140px, rgba(214,178,94,0.12), transparent 430px), #050505',
    color: '#fff8e7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '520px',
    background: '#090807',
    border: '1px solid rgba(214,178,94,0.28)',
    borderRadius: '28px',
    padding: '32px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.50)',
  },
  kicker: {
    color: '#d6b25e',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    margin: 0,
  },
  title: {
    fontSize: '42px',
    lineHeight: 1.05,
    margin: '12px 0',
  },
  subtitle: {
    color: '#cfc7b5',
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
    color: '#cfc7b5',
  },
  input: {
    width: '100%',
    padding: '16px',
    borderRadius: '14px',
    border: '1px solid rgba(214,178,94,0.28)',
    background: '#11100d',
    color: '#fff8e7',
    fontSize: '16px',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '16px',
    borderRadius: '14px',
    border: 'none',
    background: '#d6b25e',
    color: '#050505',
    fontWeight: 900,
    cursor: 'pointer',
    fontSize: '16px',
  },
  message: {
    marginTop: '18px',
    background: '#11100d',
    border: '1px solid rgba(214,178,94,0.28)',
    color: '#fff8e7',
    padding: '14px',
    borderRadius: '14px',
    lineHeight: 1.5,
  },
}