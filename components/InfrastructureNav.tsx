'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  {
    label: 'System',
    href: '/system',
  },
  {
    label: 'Infrastructure',
    href: '/infrastructure',
  },
  {
    label: 'Operations',
    href: '/operations',
  },
  {
    label: 'Reliability',
    href: '/reliability',
  },
  {
    label: 'Predictive',
    href: '/predictive',
  },
  {
    label: 'Pressure',
    href: '/pressure',
  },
  {
    label: 'Trajectory',
    href: '/trajectory',
  },
  {
    label: 'Recovery',
    href: '/recovery',
  },
  {
    label: 'Command',
    href: '/command',
  },
  {
    label: 'Audit',
    href: '/audit',
  },
  {
    label: 'Governance',
    href: '/governance',
  },
]

export default function InfrastructureNav() {
  const pathname = usePathname()

  return (
    <nav style={styles.wrapper}>
      <div style={styles.identityBlock}>
        <p style={styles.kicker}>TSINAXA CGI</p>

        <h2 style={styles.title}>
          Continuity Governance Infrastructure
        </h2>

        <p style={styles.subtitle}>
          Executive Continuity Intelligence Infrastructure
        </p>
      </div>

      <div style={styles.navigationGrid}>
        {navigation.map((item) => {
          const active = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                ...styles.link,
                ...(active ? styles.activeLink : {}),
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    marginBottom: '28px',
    borderRadius: '28px',
    border: '1px solid #1e293b',
    background: '#020617',
    padding: '24px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.35)',
  },

  identityBlock: {
    marginBottom: '22px',
  },

  kicker: {
    margin: 0,
    color: '#67e8f9',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
  },

  title: {
    margin: '10px 0 6px',
    color: '#f8fafc',
    fontSize: 'clamp(24px, 4vw, 38px)',
    fontWeight: 900,
    letterSpacing: '-0.04em',
  },

  subtitle: {
    margin: 0,
    color: '#a7f3d0',
    fontSize: '15px',
    fontWeight: 700,
  },

  navigationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
  },

  link: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '52px',
    borderRadius: '16px',
    border: '1px solid #334155',
    background: '#0f172a',
    color: '#cbd5e1',
    textDecoration: 'none',
    fontWeight: 800,
    transition: 'all 0.2s ease',
  },

  activeLink: {
    background: '#082f49',
    border: '1px solid #06b6d4',
    color: '#cffafe',
    boxShadow: '0 0 0 1px rgba(103,232,249,0.25)',
  },
}