'use client'

import { FormEvent, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import {
  SSI_BUFFER_RESPONSE_OPTIONS,
  SSI_COMMON_SHIFT_BLOCK_OPTIONS,
  SSI_EVENT_TYPE_OPTIONS,
  SSI_SHIFT_TYPE_OPTIONS,
  SSI_TIMING_CATEGORY_OPTIONS,
  buildSSIEventId,
  calculateSSIEvent,
  canCalculateSSIEvent,
} from '@/lib/ssi/ssiContinuityEngine'
import { supabase } from '@/lib/supabase'

type Header = {
  unit: string
  date: string
  shiftType: string
  shiftBlock: string
}

type EventRow = {
  id: string
  active: boolean
  rolePool: string
  timingCategory: string
  eventType: string
  bufferResponse: string
}

const initialHeader: Header = {
  unit: '',
  date: '',
  shiftType: 'DAY',
  shiftBlock: '07:00-19:00',
}

function makeRows(): EventRow[] {
  return Array.from({ length: 12 }, (_, index) => ({
    id: `event-${index + 1}`,
    active: false,
    rolePool: '',
    timingCategory: '',
    eventType: '',
    bufferResponse: '',
  }))
}

function isValidDateText(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim())
}

function sequenceLabel(index: number) {
  return String(index + 1).padStart(3, '0')
}

export default function SSIEventsPage() {
  const [header, setHeader] = useState<Header>(initialHeader)
  const [rows, setRows] = useState<EventRow[]>(makeRows)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [boundaryOpen, setBoundaryOpen] = useState(true)

  const calculatedRows = useMemo(() => {
    return rows.map((row, index) => {
      const sequenceNumber = index + 1
      const eventId = buildSSIEventId(header.date, sequenceNumber)

      const input = {
        eventId,
        unit: header.unit,
        rolePool: row.rolePool,
        shiftType: header.shiftType,
        shiftBlock: header.shiftBlock,
        date: header.date,
        timingCategory: row.timingCategory,
        eventType: row.eventType,
        bufferResponse: row.bufferResponse,
      }

      const isComplete = row.active && canCalculateSSIEvent(input)
      const output = isComplete ? calculateSSIEvent(input) : null

      return {
        row,
        eventId,
        sequence: sequenceLabel(index),
        isComplete,
        output,
      }
    })
  }, [header, rows])

  const activeRows = calculatedRows.filter((item) => item.row.active)
  const completeRows = calculatedRows.filter((item) => item.isComplete && item.output)

  const snapshot = useMemo(() => {
    return {
      activeEvents: activeRows.length,
      calculatedEvents: completeRows.length,
      highIntensity: completeRows.filter((item) => item.output?.event_intensity === 'HIGH').length,
      moderateIntensity: completeRows.filter((item) => item.output?.event_intensity === 'MODERATE').length,
      buffersConsumed: completeRows.filter((item) =>
        ['HIGH_BUFFER_COST', 'MODERATE_BUFFER_COST'].includes(item.output?.buffer_cost_band ?? ''),
      ).length,
    }
  }, [activeRows.length, completeRows])

  function updateHeader(field: keyof Header, value: string) {
    setHeader((current) => ({ ...current, [field]: value }))
  }

  function updateRow(id: string, field: keyof EventRow, value: string | boolean) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    if (!header.unit || !header.date || !header.shiftType || !header.shiftBlock) {
      setMessage('Complete Unit, Date, Shift_Type, and Shift_Block.')
      return
    }

    if (!isValidDateText(header.date)) {
      setMessage('Date must be entered as YYYY-MM-DD.')
      return
    }

    if (!activeRows.length) {
      setMessage('No event rows are active. This shift may have zero events.')
      return
    }

    if (activeRows.some((item) => !item.isComplete || !item.output)) {
      setMessage('Each active event needs Role_Pool, Timing_Category, and Event_Type. Buffer_Response is optional.')
      return
    }

    const payload = completeRows.map((item) => {
      if (!item.output) throw new Error('Missing event output.')

      return {
        event_id: item.eventId,
        unit: header.unit,
        role_pool: item.row.rolePool,
        shift_type: header.shiftType,
        shift_block: header.shiftBlock,
        event_date: header.date,
        timing_category: item.row.timingCategory,
        event_type: item.row.eventType,
        buffer_response: item.row.bufferResponse,
        stability_force: item.output.stability_force,
        event_intensity: item.output.event_intensity,
        coverage_impact: item.output.coverage_impact,
        buffer_cost_band: item.output.buffer_cost_band,
        buffer_response_definition: item.output.buffer_response_definition,
      }
    })

    setSaving(true)
    const { error } = await supabase.from('ssi_stability_events').insert(payload)
    setSaving(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage(`Saved ${payload.length} stability event row(s).`)
    setRows(makeRows())
  }

  return (
    <main style={styles.page}>
      <section style={styles.shell}>
        <div style={styles.header}>
          <p style={styles.eyebrow}>TSINAXA SSI • STABILITY_EVENTS</p>
          <h1 style={styles.title}>Visible Stability Events</h1>
          <p style={styles.subtitle}>
            Events are per shift, not per day. Activate only real events that happened. One row equals
            one disruption or one buffer response.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>Shared Event Header</h2>
            <Input label="Unit" value={header.unit} onChange={(value) => updateHeader('unit', value)} />
            <Input label="Date" placeholder="2026-03-06" value={header.date} onChange={(value) => updateHeader('date', value)} />
            <Select label="Shift_Type" value={header.shiftType} options={SSI_SHIFT_TYPE_OPTIONS} onChange={(value) => updateHeader('shiftType', value)} />
            <Select label="Shift_Block" value={header.shiftBlock} options={SSI_COMMON_SHIFT_BLOCK_OPTIONS} onChange={(value) => updateHeader('shiftBlock', value)} />
          </section>

          <section style={styles.snapshot}>
            <MiniMetric label="Active_Events" value={String(snapshot.activeEvents)} />
            <MiniMetric label="Calculated_Events" value={String(snapshot.calculatedEvents)} />
            <MiniMetric label="High_Intensity" value={String(snapshot.highIntensity)} />
            <MiniMetric label="Buffers_Consumed" value={String(snapshot.buffersConsumed)} />
          </section>

          <section style={styles.tablePanel}>
            <h2 style={styles.panelTitle}>Shift Event Rows</h2>

            {calculatedRows.map((item) => (
              <div key={item.row.id} style={styles.rowCard}>
                <div style={styles.idBox}>
                  <strong>Event Row {item.sequence}</strong>
                  <code>{item.eventId}</code>
                </div>

                <label style={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={item.row.active}
                    onChange={(event) => updateRow(item.row.id, 'active', event.target.checked)}
                  />
                  Active event row
                </label>

                {item.row.active ? (
                  <>
                    <Input label="Role_Pool" placeholder="RN 1" value={item.row.rolePool} onChange={(value) => updateRow(item.row.id, 'rolePool', value)} />
                    <Select label="Timing_Category" value={item.row.timingCategory} options={SSI_TIMING_CATEGORY_OPTIONS} onChange={(value) => updateRow(item.row.id, 'timingCategory', value)} />
                    <Select label="Event_Type" value={item.row.eventType} options={SSI_EVENT_TYPE_OPTIONS} onChange={(value) => updateRow(item.row.id, 'eventType', value)} />
                    <Select
                      label="Buffer_Response"
                      value={item.row.bufferResponse}
                      options={SSI_BUFFER_RESPONSE_OPTIONS}
                      optionalLabel="No response recorded"
                      onChange={(value) => updateRow(item.row.id, 'bufferResponse', value)}
                    />

                    <div style={styles.calculatedGrid}>
                      <ReadOnly label="Stability_Force" value={item.output?.stability_force ?? 'Waiting for active event details'} />
                      <ReadOnly label="Event_Intensity" value={item.output?.event_intensity ?? 'Waiting for active event details'} />
                      <ReadOnly label="Coverage_Impact" value={item.output?.coverage_impact ?? 'Waiting for active event details'} />
                      <ReadOnly label="Buffer_Cost_Band" value={item.output?.buffer_cost_band ?? 'Waiting for active event details'} />
                      <ReadOnly label="Buffer_Response_Definition" value={item.output?.buffer_response_definition ?? 'Waiting for active event details'} wrap />
                    </div>
                  </>
                ) : null}
              </div>
            ))}
          </section>

          <div style={styles.actions}>
            <button type="submit" disabled={saving} style={styles.button}>
              {saving ? 'Saving...' : 'Save Stability Events'}
            </button>
            {message ? <p style={styles.message}>{message}</p> : null}
          </div>

          <section style={styles.footerPanel}>
            <button type="button" style={styles.snapshotToggle} onClick={() => setBoundaryOpen((value) => !value)}>
              {boundaryOpen ? 'Hide' : 'Show'} Event Doctrine Boundary
            </button>
            {boundaryOpen ? (
              <p style={styles.footerText}>
                Assignment strain exists before events occur. Events record real disruptions or
                buffer responses during the shift. CGI handoff happens later only if visible instability
                requires governed review.
              </p>
            ) : null}
          </section>
        </form>
      </section>
    </main>
  )
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label style={styles.label}>
      <span>{label}</span>
      <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} style={styles.input} />
    </label>
  )
}

function Select({
  label,
  value,
  options,
  onChange,
  optionalLabel = 'Select...',
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
  optionalLabel?: string
}) {
  return (
    <label style={styles.label}>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} style={styles.input}>
        <option value="">{optionalLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function ReadOnly({ label, value, wrap = false }: { label: string; value: string; wrap?: boolean }) {
  return (
    <div style={styles.readOnlyBox}>
      <span>{label}</span>
      <strong style={wrap ? styles.wrap : undefined}>{value}</strong>
    </div>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.miniMetric}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: '100vh', background: '#050505', color: '#fff8e7', padding: '40px' },
  shell: { maxWidth: '1280px', margin: '0 auto' },
  header: { border: '1px solid rgba(214,178,94,0.28)', background: '#090807', borderRadius: '24px', padding: '28px', marginBottom: '24px' },
  eyebrow: { color: '#d6b25e', letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: '12px', margin: 0 },
  title: { fontSize: '38px', margin: '12px 0' },
  subtitle: { color: '#cfc7b5', margin: 0, maxWidth: '900px' },
  panel: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px', border: '1px solid rgba(214,178,94,0.28)', background: '#090807', borderRadius: '22px', padding: '22px', marginBottom: '18px' },
  snapshot: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '10px', border: '1px solid rgba(214,178,94,0.28)', background: '#090807', borderRadius: '18px', padding: '12px', marginBottom: '18px' },
  miniMetric: { background: '#11100d', border: '1px solid rgba(214,178,94,0.18)', borderRadius: '12px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', color: '#cfc7b5' },
  tablePanel: { border: '1px solid rgba(214,178,94,0.28)', background: '#090807', borderRadius: '22px', padding: '22px', marginBottom: '18px' },
  panelTitle: { gridColumn: '1 / -1', color: '#d6b25e', margin: '0 0 8px' },
  rowCard: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', border: '1px solid rgba(214,178,94,0.16)', borderRadius: '16px', padding: '14px', marginTop: '12px' },
  idBox: { border: '1px solid rgba(214,178,94,0.22)', background: 'rgba(214,178,94,0.08)', borderRadius: '14px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#d6b25e' },
  checkLabel: { display: 'flex', alignItems: 'center', gap: '10px', color: '#cfc7b5', fontWeight: 700 },
  calculatedGrid: { gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' },
  label: { display: 'flex', flexDirection: 'column', gap: '8px', color: '#cfc7b5', fontSize: '13px' },
  input: { background: '#11100d', border: '1px solid rgba(214,178,94,0.28)', borderRadius: '14px', color: '#fff8e7', padding: '12px 14px', outline: 'none' },
  readOnlyBox: { border: '1px solid rgba(214,178,94,0.18)', background: '#11100d', borderRadius: '14px', padding: '12px', display: 'flex', justifyContent: 'space-between', gap: '16px' },
  wrap: { whiteSpace: 'normal', overflowWrap: 'anywhere', textAlign: 'right' },
  actions: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' },
  button: { background: '#d6b25e', color: '#050505', border: 'none', borderRadius: '14px', padding: '13px 18px', fontWeight: 800, cursor: 'pointer' },
  message: { color: '#cfc7b5', margin: 0 },
  footerPanel: { border: '1px solid rgba(214,178,94,0.28)', background: '#090807', borderRadius: '22px', padding: '18px' },
  snapshotToggle: { width: '100%', background: '#11100d', color: '#d6b25e', border: '1px solid rgba(214,178,94,0.28)', borderRadius: '14px', padding: '12px', textAlign: 'left', fontWeight: 800, cursor: 'pointer' },
  footerText: { color: '#cfc7b5', lineHeight: 1.6 },
}