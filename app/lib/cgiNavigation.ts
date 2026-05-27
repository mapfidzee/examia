export type CGINavigationItem = {
  label: string
  href: string
  description: string
  systemArea:
    | 'INTAKE'
    | 'COORDINATION'
    | 'GOVERNANCE'
    | 'CONTINUITY_INTELLIGENCE'
    | 'ADMINISTRATION'
  status: 'ACTIVE' | 'LEGACY_ALIAS' | 'FUTURE_RLI'
}

export type CGINavigationGroup = {
  title: string
  purpose: string
  items: CGINavigationItem[]
}

export const cgiNavigationGroups: CGINavigationGroup[] = [
  {
    title: 'Continuity Entry',
    purpose: 'Capture visible instability and open governed continuity visibility.',
    items: [
      {
        label: 'Need Intake',
        href: '/request',
        description:
          'Capture visible operational instability entering the TSINAXA CGI pathway.',
        systemArea: 'INTAKE',
        status: 'ACTIVE',
      },
      {
        label: 'Case Governance',
        href: '/cases',
        description:
          'Classify, govern, and preserve visibility over active instability cases.',
        systemArea: 'INTAKE',
        status: 'ACTIVE',
      },
    ],
  },
  {
    title: 'Governed Response',
    purpose:
      'Route instability, govern stabilization action evidence, verify action impact, and preserve continuity before recovery monitoring begins.',
    items: [
      {
        label: 'Routing Intelligence',
        href: '/routing',
        description:
          'Coordinate routing ownership, owner alignment, and stabilization direction.',
        systemArea: 'COORDINATION',
        status: 'ACTIVE',
      },
      {
        label: 'Stabilization Action Governance',
        href: '/interventions',
        description:
          'Govern stabilization action evidence, continuity movement, residual risk, and executive visibility before outcome verification begins.',
        systemArea: 'COORDINATION',
        status: 'ACTIVE',
      },
      {
        label: 'Stabilization Verification Intelligence',
        href: '/outcomes',
        description:
          'Verify action impact, recurrence signals, recovery readiness, and executive meaning before recovery monitoring begins.',
        systemArea: 'COORDINATION',
        status: 'ACTIVE',
      },
    ],
  },
  {
    title: 'Executive Governance',
    purpose:
      'Maintain executive visibility, governance control, audit integrity, and stability command.',
    items: [
      {
        label: 'Executive Stability Board',
        href: '/system',
        description:
          'Executive continuity board showing stability, pressure, trajectory, recovery, memory, and survivability posture.',
        systemArea: 'GOVERNANCE',
        status: 'ACTIVE',
      },
      {
        label: 'Operations Intelligence',
        href: '/operations',
        description:
          'View operational continuity scores, pressure signals, trajectory movement, and snapshot persistence.',
        systemArea: 'GOVERNANCE',
        status: 'ACTIVE',
      },
      {
        label: 'Command Intelligence',
        href: '/command',
        description:
          'Executive command view for active continuity governance and action prioritization.',
        systemArea: 'GOVERNANCE',
        status: 'ACTIVE',
      },
      {
        label: 'Governance Framework',
        href: '/governance',
        description:
          'Manage governance decisions, role boundaries, and non-punitive interpretation rules.',
        systemArea: 'GOVERNANCE',
        status: 'ACTIVE',
      },
      {
        label: 'Audit Intelligence',
        href: '/audit',
        description:
          'Review audit trails, completion evidence, and governance integrity.',
        systemArea: 'GOVERNANCE',
        status: 'ACTIVE',
      },
      {
        label: 'Infrastructure Doctrine',
        href: '/infrastructure',
        description:
          'Review TSINAXA CGI identity, adoption pathway, doctrine, readiness, and deployment guardrails.',
        systemArea: 'GOVERNANCE',
        status: 'ACTIVE',
      },
    ],
  },
  {
    title: 'Continuity Intelligence',
    purpose:
      'Read persisted CGI metrics to evaluate pressure, prediction, recovery, reliability, and trajectory over time.',
    items: [
      {
        label: 'Pressure Intelligence',
        href: '/pressure',
        description:
          'Track pressure load, pressure spread, pressure containment, and dominant pressure drivers.',
        systemArea: 'CONTINUITY_INTELLIGENCE',
        status: 'ACTIVE',
      },
      {
        label: 'Predictive Intelligence',
        href: '/predictive',
        description:
          'Forecast near-term continuity instability using persisted historical CGI metrics.',
        systemArea: 'CONTINUITY_INTELLIGENCE',
        status: 'ACTIVE',
      },
      {
        label: 'Recovery Intelligence',
        href: '/recovery',
        description:
          'Assess whether stabilization signals are converting into durable recovery.',
        systemArea: 'CONTINUITY_INTELLIGENCE',
        status: 'ACTIVE',
      },
      {
        label: 'Trajectory Intelligence',
        href: '/trajectory',
        description:
          'Review continuity direction, drift, deterioration, and stabilization movement.',
        systemArea: 'CONTINUITY_INTELLIGENCE',
        status: 'ACTIVE',
      },
      {
        label: 'Reliability Intelligence',
        href: '/reliability',
        description:
          'Assess whether continuity patterns are becoming dependable across snapshots.',
        systemArea: 'CONTINUITY_INTELLIGENCE',
        status: 'ACTIVE',
      },
      {
        label: 'Bottleneck Intelligence',
        href: '/bottlenecks',
        description:
          'Identify structural delays, pathway congestion, and repeated stabilization blockage.',
        systemArea: 'CONTINUITY_INTELLIGENCE',
        status: 'FUTURE_RLI',
      },
    ],
  },
  {
    title: 'Administration',
    purpose:
      'Control institutional setup, assignment governance, and owner accountability pathways.',
    items: [
      {
        label: 'Admin Hub',
        href: '/admin',
        description: 'Administrative control center for TSINAXA CGI configuration.',
        systemArea: 'ADMINISTRATION',
        status: 'ACTIVE',
      },
      {
        label: 'Assignment Control',
        href: '/admin/assign',
        description:
          'Assign owners and coordinate governed continuity ownership.',
        systemArea: 'ADMINISTRATION',
        status: 'ACTIVE',
      },
      {
        label: 'Responder Registry',
        href: '/admin/teachers',
        description:
          'Legacy route currently used for responder profile governance.',
        systemArea: 'ADMINISTRATION',
        status: 'LEGACY_ALIAS',
      },
    ],
  },
]

export const cgiFlatNavigation = cgiNavigationGroups.flatMap((group) =>
  group.items.map((item) => ({
    ...item,
    groupTitle: group.title,
    groupPurpose: group.purpose,
  })),
)

export function getCGINavigationItemByHref(href: string) {
  return cgiFlatNavigation.find((item) => item.href === href)
}