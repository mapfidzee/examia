'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { CSSProperties } from 'react'

type NavigationItem = {
  label: string
  href: string
  group: 'Command' | 'Continuity' | 'Coordination' | 'Infrastructure'
}

const navigation: NavigationItem[] = [
  {
    label: 'Command',
    href: '/command',
    group: 'Command',
  },
  {
    label: 'Situation Room',
    href: '/situation-room',
    group: 'Command',
  },
  {
    label: 'Executive Center',
    href: '/executive-center',
    group: 'Command',
  },
  {
    label: 'Executive Report',
    href: '/executive-report',
    group: 'Command',
  },
  {
    label: 'Continuity History',
    href: '/continuity-history',
    group: 'Continuity',
  },
  {
    label: 'Reliability',
    href: '/reliability',
    group: 'Continuity',
  },
  {
    label: 'Pressure',
    href: '/pressure',
    group: 'Continuity',
  },
  {
    label: 'Trajectory',
    href: '/trajectory',
    group: 'Continuity',
  },
  {
    label: 'Recovery',
    href: '/recovery',
    group: 'Continuity',
  },
  {
    label: 'Predictive',
    href: '/predictive',
    group: 'Continuity',
  },
  {
    label: 'Coordination Center',
    href: '/coordination-center',
    group: 'Coordination',
  },
  {
    label: 'Cross-Site',
    href: '/cross-site',
    group: 'Coordination',
  },
  {
    label: 'Operations',
    href: '/operations',
    group: 'Infrastructure',
  },
  {
    label: 'System',
    href: '/system',
    group: 'Infrastructure',
  },
  {
    label: 'Infrastructure',
    href: '/infrastructure',
    group: 'Infrastructure',
  },
  {
    label: 'Audit',
    href: '/audit',
    group: 'Infrastructure',
  },
  {
    label: 'Governance',
    href: '/governance',
    group: 'Infrastructure',
  },
]

const groups: NavigationItem['group'][] = [
  'Command',
  'Continuity',
  'Coordination',
  'Infrastructure',
]

export default function InfrastructureQuickNav() {
  const pathname = usePathname()

  return (
    <nav style={styles.wrapper}>
      <div style={styles.identityBlock}>
        <p style={styles.kicker}>TSINAXA CGI</p>

        <h2 style={styles.title}>
          Continuity Governance Infrastructure
        </h2>

        <p style={styles.subtitle}>
          Executive continuity intelligence for pressure, recovery,
          reliability, coordination, and institutional survivability.
        </p>

        <p style={styles.doctrine}>
          Visible recovery is not the same as durable stabilization.
        </p>
      </div>

      <div style={styles.groupGrid}>
        {groups.map((group) => {
          const groupItems = navigation.filter((item) => item.group === group)

          return (
            <section key={group} style={styles.groupPanel}>
              <p style={styles.groupLabel}>{group}</p>

              <div style={styles.navigationGrid}>
                {groupItems.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`)

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
            </section>
          )
        })}
      </div>
    </nav>
  )
}

const styles: Record<string, CSSProperties> = {
  wrapper: {
    marginBottom: '28px',
    borderRadius: '28px',
    border: '1px solid #1e293b',
    background: '#020617',
    padding: '24px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.35)',
  },

  identityBlock: {
    marginBottom: '24px',
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
    maxWidth: '920px',
    margin: 0,
    color: '#a7f3d0',
    fontSize: '15px',
    fontWeight: 700,
    lineHeight: 1.6,
  },

  doctrine: {
    margin: '14px 0 0',
    color: '#fef3c7',
    fontSize: '13px',
    fontWeight: 800,
    letterSpacing: '0.02em',
  },

  groupGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '14px',
  },

  groupPanel: {
    borderRadius: '20px',
    border: '1px solid #1e293b',
    background: '#0f172a',
    padding: '14px',
  },

  groupLabel: {
    margin: '0 0 12px',
    color: '#94a3b8',
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },

  navigationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '10px',
  },

  link: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '48px',
    borderRadius: '15px',
    border: '1px solid #334155',
    background: '#020617',
    color: '#cbd5e1',
    textAlign: 'center',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 850,
    lineHeight: 1.25,
    transition: 'all 0.2s ease',
  },

  activeLink: {
    background: '#082f49',
    border: '1px solid #06b6d4',
    color: '#cffafe',
    boxShadow: '0 0 0 1px rgba(103,232,249,0.25)',
  },
}