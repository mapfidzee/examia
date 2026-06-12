export type CGINavigationItem = {
  label: string
  href: string
  description: string
  systemArea:
    | 'LIFECYCLE'
    | 'INTELLIGENCE'
    | 'OPERATIONS'
    | 'EXECUTIVE'
    | 'TRUST_GOVERNANCE'
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
    title: 'Lifecycle',
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
    title: 'Intelligence',
    purpose:
      'Read pressure, trajectory, prediction, reliability, and bottleneck exposure.',
    items: [
      {
        label: 'Pressure',
        href: '/pressure',
        description: 'Track pressure load, spread, and containment.',
        systemArea: 'INTELLIGENCE',
        status: 'ACTIVE',
      },
      {
        label: 'Trajectory',
        href: '/trajectory',
        description: 'Review continuity direction and drift.',
        systemArea: 'INTELLIGENCE',
        status: 'ACTIVE',
      },
      {
        label: 'Predictive',
        href: '/predictive',
        description: 'Forecast near-term continuity instability.',
        systemArea: 'INTELLIGENCE',
        status: 'ACTIVE',
      },
      {
        label: 'Reliability',
        href: '/reliability',
        description: 'Assess whether continuity patterns are dependable.',
        systemArea: 'INTELLIGENCE',
        status: 'ACTIVE',
      },
      {
        label: 'Bottlenecks',
        href: '/bottlenecks',
        description: 'Identify repeated stabilization blockage.',
        systemArea: 'INTELLIGENCE',
        status: 'ACTIVE',
      },
    ],
  },
  {
    title: 'Operations',
    purpose:
      'Coordinate live records, cross-site movement, and synchronization requirements.',
    items: [
      {
        label: 'Operations',
        href: '/operations',
        description: 'Read live operational integration from continuity records.',
        systemArea: 'OPERATIONS',
        status: 'ACTIVE',
      },
      {
        label: 'Cross-Site',
        href: '/cross-site',
        description: 'Review site-level continuity posture and structural memory.',
        systemArea: 'OPERATIONS',
        status: 'ACTIVE',
      },
      {
        label: 'Coordination Center',
        href: '/coordination-center',
        description: 'Identify what must synchronize before continuity can move.',
        systemArea: 'OPERATIONS',
        status: 'ACTIVE',
      },
      {
        label: 'Coordination',
        href: '/coordination',
        description: 'Legacy coordination route retained for continuity reference.',
        systemArea: 'OPERATIONS',
        status: 'LEGACY_ALIAS',
      },
    ],
  },
  {
    title: 'Executive',
    purpose:
      'Translate continuity movement into executive meaning, command, and reporting.',
    items: [
      {
        label: 'Situation Room',
        href: '/situation-room',
        description: 'Read the current operating condition under CGI.',
        systemArea: 'EXECUTIVE',
        status: 'ACTIVE',
      },
      {
        label: 'Executive Center',
        href: '/executive-center',
        description: 'Interpret institutional meaning and survivability posture.',
        systemArea: 'EXECUTIVE',
        status: 'ACTIVE',
      },
      {
        label: 'Command',
        href: '/command',
        description: 'Decide what leadership must do next.',
        systemArea: 'EXECUTIVE',
        status: 'ACTIVE',
      },
      {
        label: 'Executive Report',
        href: '/executive-report',
        description: 'Generate what leadership must be told.',
        systemArea: 'EXECUTIVE',
        status: 'ACTIVE',
      },
      {
        label: 'CGI Brief',
        href: '/cgi-brief',
        description: 'Legacy executive briefing surface retained for reference.',
        systemArea: 'EXECUTIVE',
        status: 'LEGACY_ALIAS',
      },
      {
        label: 'CGI Demo',
        href: '/cgi-demo',
        description: 'Demonstration route retained for future executive proof flow.',
        systemArea: 'EXECUTIVE',
        status: 'LEGACY_ALIAS',
      },
    ],
  },
  {
    title: 'Trust & Governance',
    purpose:
      'Preserve auditability, governance integrity, institutional memory, and action meaning.',
    items: [
      {
        label: 'Audit',
        href: '/audit',
        description: 'Review evidence, audit trails, and governance integrity.',
        systemArea: 'TRUST_GOVERNANCE',
        status: 'ACTIVE',
      },
      {
        label: 'Governance',
        href: '/governance',
        description: 'Manage governance decisions and role boundaries.',
        systemArea: 'TRUST_GOVERNANCE',
        status: 'ACTIVE',
      },
      {
        label: 'Continuity History',
        href: '/continuity-history',
        description: 'Read continuity movement across time.',
        systemArea: 'TRUST_GOVERNANCE',
        status: 'ACTIVE',
      },
      {
        label: 'Memory Board',
        href: '/cgi-memory-board',
        description: 'Preserve what must never disappear from institutional memory.',
        systemArea: 'TRUST_GOVERNANCE',
        status: 'ACTIVE',
      },
      {
        label: 'Timeline',
        href: '/timeline',
        description: 'Legacy timeline route retained for continuity reference.',
        systemArea: 'TRUST_GOVERNANCE',
        status: 'LEGACY_ALIAS',
      },
      {
        label: 'Action Cues',
        href: '/action-cues',
        description: 'Review standardized action meanings.',
        systemArea: 'TRUST_GOVERNANCE',
        status: 'ACTIVE',
      },
    ],
  },
  {
    title: 'Infrastructure',
    purpose: 'Review system structure, doctrine, domains, and stability posture.',
    items: [
      {
        label: 'Infrastructure',
        href: '/infrastructure',
        description: 'CGI identity, doctrine, and deployment guardrails.',
        systemArea: 'INFRASTRUCTURE',
        status: 'ACTIVE',
      },
      {
        label: 'System',
        href: '/system',
        description: 'Executive stability board and system posture.',
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
        label: 'Roles',
        href: '/admin/roles',
        description: 'Govern role authorization boundaries.',
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