import type { CSSProperties } from 'react'
import Link from 'next/link'

export default function AccessDeniedPage() {
  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <p style={styles.kicker}>EXAMIA LIS • GOVERNANCE ACCESS CONTROL</p>

        <h1 style={styles.title}>Access Denied</h1>

        <p style={styles.subtitle}>
          This area is protected by EXAMIA governance rules. Your account may be
          missing an active role, or your current role may not allow access to this
          infrastructure route.
        </p>

        <div style={styles.actions}>
          <Link href="/login" style={styles.button}>
            Return to Login
          </Link>

          <Link href="/" style={styles.secondaryButton}>
            Return Home
          </Link>
        </div>
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
    maxWidth: '620px',
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '28px',
    padding: '32px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.45)',
  },
  kicker: {
    color: '#fca5a5',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '2px',
  },
  title: {
    fontSize: '48px',
    lineHeight: 1.05,
    margin: '12px 0',
  },
  subtitle: {
    color: '#cbd5e1',
    lineHeight: 1.7,
    marginBottom: '24px',
  },
  actions: {
    display: 'grid',
    gap: '12px',
  },
  button: {
    textAlign: 'center',
    textDecoration: 'none',
    padding: '16px',
    borderRadius: '14px',
    background: '#67e8f9',
    color: '#082f49',
    fontWeight: 900,
  },
  secondaryButton: {
    textAlign: 'center',
    textDecoration: 'none',
    padding: '16px',
    borderRadius: '14px',
    background: '#111827',
    color: 'white',
    border: '1px solid #334155',
    fontWeight: 900,
  },
}