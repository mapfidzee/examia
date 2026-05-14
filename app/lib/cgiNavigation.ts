export type CGINavigationItem = {
  label: string
  href: string
  description: string
  systemArea:
    | 'INTAKE'
    | 'COORDINATION'
    | 'GOVERNANCE'
    | 'STABILIZATION_INTELLIGENCE'
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
    title: 'Intake',
    purpose: 'Capture visible instability and open governed cases.',
    items: [
      {
        label: 'Need Intake',
        href: '/request',
        description: 'Capture visible operational needs entering the CGI pathway.',
        systemArea: 'INTAKE',
        status: 'ACTIVE',
      },
      {
        label: 'Case Governance',
        href: '/cases',
        description: 'Review, classify, and govern active instability cases.',
        systemArea: 'INTAKE',
        status: 'ACTIVE',
      },
    ],
  },
  {
    title: 'Coordination',
    purpose: 'Route cases and govern active intervention pathways.',
    items: [
      {
        label: 'Routing Intelligence',
        href: '/routing',
        description: 'Coordinate case routing and responder alignment.',
        systemArea: 'COORDINATION',
        status: 'ACTIVE',
      },
      {
        label: 'Controlled Interventions',
        href: '/interventions',
        description: 'Govern intervention activity and stabilization evidence.',
        systemArea: 'COORDINATION',
        status: 'ACTIVE',
      },
    ],
  },
  {
    title: 'Operational Governance',
    purpose: 'Maintain command visibility, governance control, and audit integrity.',
    items: [
      {
        label: 'Operations',
        href: '/operations',
        description: 'View operational workload, pressure, and continuity state.',
        systemArea: 'GOVERNANCE',
        status: 'ACTIVE',
      },
      {
        label: 'Command',
        href: '/command',
        description: 'Executive command view for active CGI oversight.',
        systemArea: 'GOVERNANCE',
        status: 'ACTIVE',
      },
      {
        label: 'Governance',
        href: '/governance',
        description: 'Manage governance decisions and role-based oversight.',
        systemArea: 'GOVERNANCE',
        status: 'ACTIVE',
      },
      {
        label: 'Audit',
        href: '/audit',
        description: 'Review audit trails, completion evidence, and governance integrity.',
        systemArea: 'GOVERNANCE',
        status: 'ACTIVE',
      },
    ],
  },
  {
    title: 'Stabilization Intelligence',
    purpose: 'Monitor pressure, recovery movement, and future RLI-facing signals.',
    items: [
      {
        label: 'Pressure',
        href: '/pressure',
        description: 'Track operational pressure and instability load.',
        systemArea: 'STABILIZATION_INTELLIGENCE',
        status: 'FUTURE_RLI',
      },
      {
        label: 'Bottlenecks',
        href: '/bottlenecks',
        description: 'Identify structural delays and pathway congestion.',
        systemArea: 'STABILIZATION_INTELLIGENCE',
        status: 'FUTURE_RLI',
      },
      {
        label: 'Predictive',
        href: '/predictive',
        description: 'View early predictive stabilization signals.',
        systemArea: 'STABILIZATION_INTELLIGENCE',
        status: 'FUTURE_RLI',
      },
      {
        label: 'Recovery',
        href: '/recovery',
        description: 'Monitor post-intervention recovery movement.',
        systemArea: 'STABILIZATION_INTELLIGENCE',
        status: 'FUTURE_RLI',
      },
      {
        label: 'Trajectory',
        href: '/trajectory',
        description: 'Review stabilization direction and risk movement.',
        systemArea: 'STABILIZATION_INTELLIGENCE',
        status: 'FUTURE_RLI',
      },
      {
        label: 'Reliability',
        href: '/reliability',
        description: 'Assess whether continuity patterns are becoming dependable.',
        systemArea: 'STABILIZATION_INTELLIGENCE',
        status: 'FUTURE_RLI',
      },
    ],
  },
  {
    title: 'Administration',
    purpose: 'Control institutional setup, responder governance, and assignments.',
    items: [
      {
        label: 'Admin Hub',
        href: '/admin',
        description: 'Administrative control center for CGI configuration.',
        systemArea: 'ADMINISTRATION',
        status: 'ACTIVE',
      },
      {
        label: 'Assignment Control',
        href: '/admin/assign',
        description: 'Assign responders and coordinate governed case ownership.',
        systemArea: 'ADMINISTRATION',
        status: 'ACTIVE',
      },
      {
        label: 'Responder Registry',
        href: '/admin/teachers',
        description: 'Legacy route for responder profile governance.',
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
  }))
)

export function getCGINavigationItemByHref(href: string) {
  return cgiFlatNavigation.find((item) => item.href === href)
}