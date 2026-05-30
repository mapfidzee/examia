export type CGINavigationItem = {
  label: string
  href: string
  description: string
  systemArea:
    | 'LIFECYCLE'
    | 'EXECUTIVE_INTELLIGENCE'
    | 'GOVERNANCE'
    | 'INFRASTRUCTURE'
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
    title: 'Continuity Lifecycle',
    purpose: 'Follow visible instability from intake to recovery durability.',
    items: [
      {
        label: 'Request',
        href: '/request',
        description: 'Open visible instability before triage begins.',
        systemArea: 'LIFECYCLE',
        status: 'ACTIVE',
      },
      {
        label: 'Triage',
        href: '/triage',
        description: 'Judge eligibility before case governance begins.',
        systemArea: 'LIFECYCLE',
        status: 'ACTIVE',
      },
      {
        label: 'Cases',
        href: '/cases',
        description: 'Preserve accepted instability under case governance.',
        systemArea: 'LIFECYCLE',
        status: 'ACTIVE',
      },
      {
        label: 'Routing',
        href: '/routing',
        description: 'Direct stabilization ownership before action begins.',
        systemArea: 'LIFECYCLE',
        status: 'ACTIVE',
      },
      {
        label: 'Interventions',
        href: '/interventions',
        description: 'Preserve stabilization action evidence.',
        systemArea: 'LIFECYCLE',
        status: 'ACTIVE',
      },
      {
        label: 'Outcomes',
        href: '/outcomes',
        description: 'Verify stabilization credibility before recovery.',
        systemArea: 'LIFECYCLE',
        status: 'ACTIVE',
      },
      {
        label: 'Recovery',
        href: '/recovery',
        description: 'Test whether stabilization is holding over time.',
        systemArea: 'LIFECYCLE',
        status: 'ACTIVE',
      },
    ],
  },
  {
    title: 'Executive Intelligence',
    purpose: 'Read pressure, reliability, trajectory, prediction, and command exposure.',
    items: [
      {
        label: 'Command',
        href: '/command',
        description: 'Executive command view for active continuity pressure.',
        systemArea: 'EXECUTIVE_INTELLIGENCE',
        status: 'ACTIVE',
      },
      {
        label: 'Pressure',
        href: '/pressure',
        description: 'Track pressure load, spread, and containment.',
        systemArea: 'EXECUTIVE_INTELLIGENCE',
        status: 'ACTIVE',
      },
      {
        label: 'Trajectory',
        href: '/trajectory',
        description: 'Review continuity direction and drift.',
        systemArea: 'EXECUTIVE_INTELLIGENCE',
        status: 'ACTIVE',
      },
      {
        label: 'Predictive',
        href: '/predictive',
        description: 'Forecast near-term continuity instability.',
        systemArea: 'EXECUTIVE_INTELLIGENCE',
        status: 'ACTIVE',
      },
      {
        label: 'Reliability',
        href: '/reliability',
        description: 'Assess whether continuity patterns are dependable.',
        systemArea: 'EXECUTIVE_INTELLIGENCE',
        status: 'ACTIVE',
      },
    ],
  },
  {
    title: 'Governance',
    purpose: 'Preserve governance integrity, auditability, and action meaning.',
    items: [
      {
        label: 'Audit',
        href: '/audit',
        description: 'Review evidence, audit trails, and governance integrity.',
        systemArea: 'GOVERNANCE',
        status: 'ACTIVE',
      },
      {
        label: 'Governance',
        href: '/governance',
        description: 'Manage governance decisions and role boundaries.',
        systemArea: 'GOVERNANCE',
        status: 'ACTIVE',
      },
      {
        label: 'Timeline',
        href: '/timeline',
        description: 'View continuity memory across lifecycle movement.',
        systemArea: 'GOVERNANCE',
        status: 'ACTIVE',
      },
      {
        label: 'Action Cues',
        href: '/action-cues',
        description: 'Review standardized action meanings.',
        systemArea: 'GOVERNANCE',
        status: 'ACTIVE',
      },
    ],
  },
  {
    title: 'Infrastructure',
    purpose: 'Review system structure, doctrine, domains, and bottlenecks.',
    items: [
      {
        label: 'System',
        href: '/system',
        description: 'Executive stability board and system posture.',
        systemArea: 'INFRASTRUCTURE',
        status: 'ACTIVE',
      },
      {
        label: 'Infrastructure',
        href: '/infrastructure',
        description: 'CGI identity, doctrine, and deployment guardrails.',
        systemArea: 'INFRASTRUCTURE',
        status: 'ACTIVE',
      },
      {
        label: 'Domains',
        href: '/domains',
        description: 'Review continuity domains and operating boundaries.',
        systemArea: 'INFRASTRUCTURE',
        status: 'ACTIVE',
      },
      {
        label: 'Bottlenecks',
        href: '/bottlenecks',
        description: 'Identify repeated stabilization blockage.',
        systemArea: 'INFRASTRUCTURE',
        status: 'FUTURE_RLI',
      },
    ],
  },
  {
    title: 'Administration',
    purpose: 'Control setup, assignments, and owner accountability.',
    items: [
      {
        label: 'Admin',
        href: '/admin',
        description: 'Administrative control center.',
        systemArea: 'ADMINISTRATION',
        status: 'ACTIVE',
      },
      {
        label: 'Assignment',
        href: '/admin/assign',
        description: 'Assign continuity ownership.',
        systemArea: 'ADMINISTRATION',
        status: 'ACTIVE',
      },
      {
        label: 'Responders',
        href: '/admin/teachers',
        description: 'Legacy responder profile governance.',
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