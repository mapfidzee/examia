'use client'

import { usePathname } from 'next/navigation'
import { getCGINavigationItemByHref } from '@/app/lib/cgiNavigation'

function getOperatingLayer(pathname: string) {
  if (
    [
      '/request',
      '/triage',
      '/cases',
      '/routing',
      '/interventions',
      '/outcomes',
      '/recovery',
    ].includes(pathname)
  ) {
    return 'Continuity Lifecycle'
  }

  if (
    [
      '/pressure',
      '/trajectory',
      '/predictive',
      '/reliability',
      '/operations',
      '/cross-site',
      '/coordination-center',
      '/bottlenecks',
      '/coordination',
    ].includes(pathname)
  ) {
    return 'Operational Intelligence'
  }

  if (
    [
      '/situation-room',
      '/executive-center',
      '/command',
      '/executive-report',
      '/cgi-brief',
      '/cgi-demo',
    ].includes(pathname)
  ) {
    return 'Executive Oversight'
  }

  if (
    [
      '/audit',
      '/governance',
      '/continuity-history',
      '/cgi-memory-board',
      '/timeline',
      '/action-cues',
    ].includes(pathname)
  ) {
    return 'Governance & Memory'
  }

  if (['/infrastructure', '/system', '/domains'].includes(pathname)) {
    return 'Infrastructure'
  }

  if (
    ['/admin', '/admin/assign', '/admin/roles', '/admin/teachers'].includes(
      pathname,
    )
  ) {
    return 'Administration'
  }

  return 'Continuity Intelligence'
}

function getExecutiveMeaning(pathname: string) {
  if (pathname === '/request') return 'Visibility Opening'
  if (pathname === '/triage') return 'Eligibility Judgment'
  if (pathname === '/cases') return 'Instability Custody'
  if (pathname === '/routing') return 'Ownership Direction'
  if (pathname === '/interventions') return 'Action Evidence'
  if (pathname === '/outcomes') return 'Stabilization Verification'
  if (pathname === '/recovery') return 'Durability Verification'

  if (pathname === '/pressure') return 'Pressure Visibility'
  if (pathname === '/trajectory') return 'Direction Reading'
  if (pathname === '/predictive') return 'Forward Risk Reading'
  if (pathname === '/reliability') return 'Continuity Dependability'
  if (pathname === '/operations') return 'Live Operational Integration'
  if (pathname === '/cross-site') return 'Distributed Exposure'
  if (pathname === '/coordination-center') return 'Synchronization Requirement'
  if (pathname === '/bottlenecks') return 'Constraint Exposure'
  if (pathname === '/coordination') return 'Legacy Coordination Reference'

  if (pathname === '/situation-room') return 'Operating Condition'
  if (pathname === '/executive-center') return 'Institutional Interpretation'
  if (pathname === '/command') return 'Leadership Action'
  if (pathname === '/executive-report') return 'Executive Briefing'
  if (pathname === '/cgi-brief') return 'Legacy Briefing Surface'
  if (pathname === '/cgi-demo') return 'Executive Proof Flow'

  if (pathname === '/audit') return 'Trust Reconstruction'
  if (pathname === '/governance') return 'Governance Integrity'
  if (pathname === '/continuity-history') return 'Continuity Movement Memory'
  if (pathname === '/cgi-memory-board') return 'Institutional Memory'
  if (pathname === '/timeline') return 'Legacy Timeline Memory'
  if (pathname === '/action-cues') return 'Action Meaning'

  if (pathname === '/infrastructure') return 'Doctrine & Deployment'
  if (pathname === '/system') return 'Institutional Stability Posture'
  if (pathname === '/domains') return 'Operating Boundaries'

  if (pathname === '/admin') return 'Administrative Control'
  if (pathname === '/admin/assign') return 'Ownership Assignment'
  if (pathname === '/admin/roles') return 'Authorization Boundary'
  if (pathname === '/admin/teachers') return 'Legacy Responder Governance'

  return 'Governed Review'
}

function getNextMovement(pathname: string) {
  if (pathname === '/request') return 'Triage'
  if (pathname === '/triage') return 'Cases or Command'
  if (pathname === '/cases') return 'Routing'
  if (pathname === '/routing') return 'Interventions'
  if (pathname === '/interventions') return 'Outcomes'
  if (pathname === '/outcomes') return 'Recovery'
  if (pathname === '/recovery') return 'Executive Center / Memory'

  if (pathname === '/pressure') return 'Trajectory'
  if (pathname === '/trajectory') return 'Predictive'
  if (pathname === '/predictive') return 'Reliability'
  if (pathname === '/reliability') return 'Command Watch'
  if (pathname === '/operations') return 'Executive Oversight'
  if (pathname === '/cross-site') return 'Coordination Center'
  if (pathname === '/coordination-center') return 'Command'
  if (pathname === '/bottlenecks') return 'Governance / Command'
  if (pathname === '/coordination') return 'Coordination Center'

  if (pathname === '/situation-room') return 'Executive Center'
  if (pathname === '/executive-center') return 'Command / Executive Report'
  if (pathname === '/command') return 'Executive Decision'
  if (pathname === '/executive-report') return 'Audit / Memory'
  if (pathname === '/cgi-brief') return 'Executive Report'
  if (pathname === '/cgi-demo') return 'Executive Proof Review'

  if (pathname === '/audit') return 'Governance / Memory'
  if (pathname === '/governance') return 'Audit / History'
  if (pathname === '/continuity-history') return 'Memory Board'
  if (pathname === '/cgi-memory-board') return 'Executive Oversight'
  if (pathname === '/timeline') return 'Continuity History'
  if (pathname === '/action-cues') return 'Governance'

  if (pathname === '/infrastructure') return 'System'
  if (pathname === '/system') return 'Executive Oversight'
  if (pathname === '/domains') return 'Operational Intelligence'

  if (pathname === '/admin') return 'Assignment / Roles'
  if (pathname === '/admin/assign') return 'Lifecycle Ownership'
  if (pathname === '/admin/roles') return 'Governance Access'
  if (pathname === '/admin/teachers') return 'Administration Review'

  return 'Governed Review'
}

export default function CGITopbar() {
  const pathname = usePathname()
  const currentItem = getCGINavigationItemByHref(pathname)

  return (
    <header className="border-b border-[#3b2f16] bg-[#050505]/95 px-6 py-4 text-neutral-100 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#d6b25e]">
            TSINAXA CGI
          </p>

          <h1 className="mt-1 text-2xl font-black tracking-tight text-[#fff8e7]">
            {currentItem?.label ?? 'Continuity Intelligence'}
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#cfc7b5]/80">
            {currentItem?.description ??
              'Govern visible operational instability until stabilization becomes credible, traceable, and survivable.'}
          </p>
        </div>

        <div className="grid gap-2 text-sm sm:grid-cols-3 xl:min-w-[560px]">
          <TopbarSignal
            label="Operating Layer"
            value={getOperatingLayer(pathname)}
          />

          <TopbarSignal
            label="Executive Meaning"
            value={getExecutiveMeaning(pathname)}
            emphasized
          />

          <TopbarSignal label="Movement" value={getNextMovement(pathname)} />
        </div>
      </div>
    </header>
  )
}

function TopbarSignal({
  label,
  value,
  emphasized,
}: {
  label: string
  value: string
  emphasized?: boolean
}) {
  return (
    <div
      className={[
        'rounded-xl border px-4 py-3',
        emphasized
          ? 'border-[#d6b25e]/45 bg-[#d6b25e]/12'
          : 'border-[#3b2f16] bg-[#11100d]/75',
      ].join(' ')}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9f8142]">
        {label}
      </p>

      <p
        className={[
          'mt-1 font-semibold leading-5',
          emphasized ? 'text-[#fff8e7]' : 'text-neutral-100',
        ].join(' ')}
      >
        {value}
      </p>
    </div>
  )
}