export type CGINavigationItem = {
  label: string
  href: string
  description: string
  systemArea:
    | 'LIFECYCLE'
    | 'OPERATIONAL_INTELLIGENCE'
    | 'EXECUTIVE_OVERSIGHT'
    | 'GOVERNANCE_MEMORY'
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
    purpose: 'Govern visible instability from intake through recovery durability.',
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
    title: 'Operational Intelligence',
    purpose:
      'Read pressure, direction, prediction, reliability, operations, cross-site movement, coordination, and constraints.',
    items: [
      {
        label: 'Pressure',
        href: '/pressure',
        description: 'Track pressure load, spread, and containment.',
        systemArea: 'OPERATIONAL_INTELLIGENCE',
        status: 'ACTIVE',
      },
      {
        label: 'Trajectory',
        href: '/trajectory',
        description: 'Review continuity direction and drift.',
        systemArea: 'OPERATIONAL_INTELLIGENCE',
        status: 'ACTIVE',
      },
      {
        label: 'Predictive',
        href: '/predictive',
        description: 'Forecast near-term continuity instability.',
        systemArea: 'OPERATIONAL_INTELLIGENCE',
        status: 'ACTIVE',
      },
      {
        label: 'Reliability',
        href: '/reliability',
        description: 'Assess whether continuity patterns are dependable.',
        systemArea: 'OPERATIONAL_INTELLIGENCE',
        status: 'ACTIVE',
      },
      {
        label: 'Operations',
        href: '/operations',
        description: 'Read live operational integration from continuity records.',
        systemArea: 'OPERATIONAL_INTELLIGENCE',
        status: 'ACTIVE',
      },
      {
        label: 'Cross-Site',
        href: '/cross-site',
        description: 'Review site-level continuity posture and structural memory.',
        systemArea: 'OPERATIONAL_INTELLIGENCE',
        status: 'ACTIVE',
      },
      {
        label: 'Coordination Center',
        href: '/coordination-center',
        description: 'Identify what must synchronize before continuity can move.',
        systemArea: 'OPERATIONAL_INTELLIGENCE',
        status: 'ACTIVE',
      },
      {
        label: 'Bottlenecks',
        href: '/bottlenecks',
        description: 'Identify repeated stabilization blockage.',
        systemArea: 'OPERATIONAL_INTELLIGENCE',
        status: 'ACTIVE',
      },
      {
        label: 'Coordination',
        href: '/coordination',
        description: 'Legacy coordination route retained for continuity reference.',
        systemArea: 'OPERATIONAL_INTELLIGENCE',
        status: 'LEGACY_ALIAS',
      },
    ],
  },
  {
    title: 'Executive Oversight',
    purpose:
      'Translate continuity movement into executive condition, meaning, command, and reporting.',
    items: [
      {
        label: 'Situation Room',
        href: '/situation-room',
        description: 'Read the current operating condition under CGI.',
        systemArea: 'EXECUTIVE_OVERSIGHT',
        status: 'ACTIVE',
      },
      {
        label: 'Executive Center',
        href: '/executive-center',
        description: 'Interpret institutional meaning and survivability posture.',
        systemArea: 'EXECUTIVE_OVERSIGHT',
        status: 'ACTIVE',
      },
      {
        label: 'Command',
        href: '/command',
        description: 'Decide what leadership must do next.',
        systemArea: 'EXECUTIVE_OVERSIGHT',
        status: 'ACTIVE',
      },
      {
        label: 'Executive Report',
        href: '/executive-report',
        description: 'Generate what leadership must be told.',
        systemArea: 'EXECUTIVE_OVERSIGHT',
        status: 'ACTIVE',
      },
      {
        label: 'CGI Brief',
        href: '/cgi-brief',
        description: 'Legacy executive briefing surface retained for reference.',
        systemArea: 'EXECUTIVE_OVERSIGHT',
        status: 'LEGACY_ALIAS',
      },
      {
        label: 'CGI Demo',
        href: '/cgi-demo',
        description: 'Demonstration route retained for future executive proof flow.',
        systemArea: 'EXECUTIVE_OVERSIGHT',
        status: 'LEGACY_ALIAS',
      },
    ],
  },
  {
    title: 'Governance & Memory',
    purpose:
      'Preserve auditability, governance integrity, continuity history, institutional memory, and action meaning.',
    items: [
      {
        label: 'Audit',
        href: '/audit',
        description: 'Review evidence, audit trails, and governance integrity.',
        systemArea: 'GOVERNANCE_MEMORY',
        status: 'ACTIVE',
      },
      {
        label: 'Governance',
        href: '/governance',
        description: 'Manage governance decisions and role boundaries.',
        systemArea: 'GOVERNANCE_MEMORY',
        status: 'ACTIVE',
      },
      {
        label: 'Continuity History',
        href: '/continuity-history',
        description: 'Read continuity movement across time.',
        systemArea: 'GOVERNANCE_MEMORY',
        status: 'ACTIVE',
      },
      {
        label: 'Memory Board',
        href: '/cgi-memory-board',
        description: 'Preserve what must never disappear from institutional memory.',
        systemArea: 'GOVERNANCE_MEMORY',
        status: 'ACTIVE',
      },
      {
        label: 'Timeline',
        href: '/timeline',
        description: 'Legacy timeline route retained for continuity reference.',
        systemArea: 'GOVERNANCE_MEMORY',
        status: 'LEGACY_ALIAS',
      },
      {
        label: 'Action Cues',
        href: '/action-cues',
        description: 'Review standardized action meanings.',
        systemArea: 'GOVERNANCE_MEMORY',
        status: 'ACTIVE',
      },
    ],
  },
  {
    title: 'Infrastructure',
    purpose: 'Review doctrine, deployment guardrails, system posture, and domains.',
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
    purpose: 'Control setup, assignments, role boundaries, and owner accountability.',
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