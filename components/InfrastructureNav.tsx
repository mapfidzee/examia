'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { CSSProperties } from 'react'

const lifecycleOrder = [
  { label: 'Request', href: '/request' },
  { label: 'Triage', href: '/triage' },
  { label: 'Cases', href: '/cases' },
  { label: 'Routing', href: '/routing' },
  { label: 'Interventions', href: '/interventions' },
  { label: 'Outcomes', href: '/outcomes' },
  { label: 'Recovery', href: '/recovery' },
]

function isLifecycleRoute(pathname: string) {
  return lifecycleOrder.some((item) => item.href === pathname)
}

export default function InfrastructureQuickNav() {
  const pathname = usePathname()
  const lifecycleVisible = isLifecycleRoute(pathname)

  return (
    <nav style={styles.wrapper}>
      <div style={styles.row}>
        <div>
          <p style={styles.kicker}>TSINAXA CGI</p>
          <p style={styles.title}>
            {lifecycleVisible
              ? 'Continuity Lifecycle'
              : 'Executive Continuity Intelligence'}
          </p>
        </div>

        <div style={styles.links}>
          {lifecycleVisible ? (
            lifecycleOrder.map((item, index) => {
              const active = pathname === item.href

              return (
                <span key={item.href} style={styles.stepWrap}>
                  <Link
                    href={item.href}
                    style={{
                      ...styles.link,
                      ...(active ? styles.activeLink : {}),
                    }}
                  >
                    {item.label}
                  </Link>

                  {index < lifecycleOrder.length - 1 && (
                    <span style={styles.arrow}>→</span>
                  )}
                </span>
              )
            })
          ) : (
            <>
              <Link
                href="/command"
                style={{
                  ...styles.link,
                  ...(pathname === '/command' ? styles.activeLink : {}),
                }}
              >
                Command
              </Link>

              <Link
                href="/pressure"
                style={{
                  ...styles.link,
                  ...(pathname === '/pressure' ? styles.activeLink : {}),
                }}
              >
                Pressure
              </Link>

              <Link
                href="/trajectory"
                style={{
                  ...styles.link,
                  ...(pathname === '/trajectory' ? styles.activeLink : {}),
                }}
              >
                Trajectory
              </Link>

              <Link
                href="/reliability"
                style={{
                  ...styles.link,
                  ...(pathname === '/reliability' ? styles.activeLink : {}),
                }}
              >
                Reliability
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

const styles: Record<string, CSSProperties> = {
  wrapper: {
    marginBottom: '18px',
    borderRadius: '18px',
    border: '1px solid #1e293b',
    background: '#020617',
    padding: '14px 16px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '18px',
    flexWrap: 'wrap',
  },
  kicker: {
    margin: 0,
    color: '#67e8f9',
    fontSize: '10px',
    fontWeight: 900,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
  },
  title: {
    margin: '4px 0 0',
    color: '#f8fafc',
    fontSize: '15px',
    fontWeight: 900,
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  stepWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  arrow: {
    color: '#475569',
    fontSize: '13px',
    fontWeight: 900,
  },
  link: {
    borderRadius: '999px',
    border: '1px solid #334155',
    background: '#0f172a',
    color: '#cbd5e1',
    padding: '7px 10px',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: 850,
    lineHeight: 1,
  },
  activeLink: {
    background: '#083344',
    border: '1px solid #06b6d4',
    color: '#cffafe',
  },
}