'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

type LessonRequest = {
  id: string
  subject: string
  problem: string
  preferred_time: string | null
  status: string
  assigned_teacher: string | null
}

const learningConcerns = [
  'Foundational concept gap',
  'Exam preparation pressure',
  'Homework or assignment blockage',
  'Low confidence or learning anxiety',
  'Repeated failure in one topic',
  'Language or explanation barrier',
  'No suitable teacher currently available',
  'Needs structured follow-up after lesson',
]

const stabilizationObjectives = [
  'Clarify the learner’s immediate difficulty',
  'Stabilize confidence before deeper teaching',
  'Route to the best available responder',
  'Prepare for exam-focused support',
  'Create a safe first learning response',
  'Escalate for institutional coordination',
  'Maintain continuity until a teacher is assigned',
]

const constraints = [
  'Low data access',
  'Limited device access',
  'Urgent exam timeline',
  'Needs Shona or local-language support',
  'Needs audio-first explanation',
  'Needs written step-by-step support',
  'Needs after-school availability',
  'Requires NGO or school coordination',
  'Requires ministry/district visibility',
]

const responseModes = [
  'Text-guided learning support',
  'Audio-first learning support',
  'Teacher-led live session',
  'Responder triage before teacher assignment',
  'School or NGO coordination pathway',
  'District escalation pathway',
  'Ministry visibility record',
]

export default function RoutingPage() {
  const [requests, setRequests] = useState<LessonRequest[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [primaryConcern, setPrimaryConcern] = useState('')
  const [objective, setObjective] = useState('')
  const [selectedConstraints, setSelectedConstraints] = useState<string[]>([])
  const [responseMode, setResponseMode] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadRequests()
  }, [])

  async function loadRequests() {
    const { data, error } = await supabase
      .from('lesson_requests')
      .select('id, subject, problem, preferred_time, status, assigned_teacher')
      .order('created_at', { ascending: false })

    if (error) {
      setMessage('Unable to load lesson requests. Check Supabase table access.')
      return
    }

    setRequests(data || [])
  }

  const selectedRequest = useMemo(() => {
    return requests.find((request) => request.id === selectedId) || null
  }, [requests, selectedId])

  function toggleConstraint(item: string) {
    setSelectedConstraints((current) =>
      current.includes(item)
        ? current.filter((constraint) => constraint !== item)
        : [...current, item]
    )
  }

  const routingSummary = useMemo(() => {
    if (!selectedRequest || !primaryConcern || !objective || !responseMode) {
      return ''
    }

    const constraintText =
      selectedConstraints.length > 0
        ? selectedConstraints.join(', ')
        : 'No major operational constraint recorded'

    return `Structured Routing Intelligence Record

Learner Request:
Subject: ${selectedRequest.subject}
Current Status: ${selectedRequest.status}
Preferred Time: ${selectedRequest.preferred_time || 'Not specified'}

Primary Learning Concern:
${primaryConcern}

Stabilization Objective:
${objective}

Operational Constraints:
${constraintText}

Recommended Response Mode:
${responseMode}

Governance-Safe Coordination Summary:
This learner request should be routed through a governed support pathway focused on ${primaryConcern.toLowerCase()}. The immediate objective is to ${objective.toLowerCase()}. The recommended response mode is ${responseMode.toLowerCase()}, while taking into account the recorded operational constraints. This routing decision does not assign blame, expose private learner details, or replace professional educational judgment. It creates a structured coordination record for schools, NGOs, districts, or ministries to support consistent learning response.

Additional Operational Notes:
${notes.trim() || 'No additional operational notes recorded.'}`
  }, [
    selectedRequest,
    primaryConcern,
    objective,
    responseMode,
    selectedConstraints,
    notes,
  ])

  async function saveRoutingRecord() {
    if (!selectedRequest || !routingSummary) {
      setMessage('Complete all required routing fields before saving.')
      return
    }

    setSaving(true)
    setMessage('')

    const { error } = await supabase.from('routing_intervention_records').insert({
      lesson_request_id: selectedRequest.id,
      primary_learning_concern: primaryConcern,
      stabilization_objective: objective,
      operational_constraints: selectedConstraints,
      recommended_response_mode: responseMode,
      routing_summary: routingSummary,
      additional_operational_notes: notes.trim() || null,
    })

    setSaving(false)

    if (error) {
      setMessage(
        'Routing summary generated. To save records, create the routing_intervention_records table in Supabase.'
      )
      return
    }

    setMessage('Governance-safe routing record saved successfully.')
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-cyan-300">
            EXAMIA Structured Routing Intelligence System
          </p>
          <h1 className="text-3xl font-bold">
            Governed Learning Coordination Routing
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Convert learner requests into standardized, governance-safe routing
            records for schools, NGOs, districts, ministries, and verified
            responders.
          </p>
        </div>

        {message && (
          <div className="mb-5 rounded-2xl border border-cyan-700 bg-cyan-950/50 p-4 text-cyan-100">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-bold">Routing Template</h2>

            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Select learner request
            </label>
            <select
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              className="mb-5 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
            >
              <option value="">Choose request</option>
              {requests.map((request) => (
                <option key={request.id} value={request.id}>
                  {request.subject} — {request.status}
                </option>
              ))}
            </select>

            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Primary Learning Concern
            </label>
            <select
              value={primaryConcern}
              onChange={(event) => setPrimaryConcern(event.target.value)}
              className="mb-5 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
            >
              <option value="">Choose concern</option>
              {learningConcerns.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Stabilization Objective
            </label>
            <select
              value={objective}
              onChange={(event) => setObjective(event.target.value)}
              className="mb-5 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
            >
              <option value="">Choose objective</option>
              {stabilizationObjectives.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Operational Constraints
            </label>
            <div className="mb-5 grid gap-2 sm:grid-cols-2">
              {constraints.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleConstraint(item)}
                  className={`rounded-xl border p-3 text-left text-sm ${
                    selectedConstraints.includes(item)
                      ? 'border-cyan-400 bg-cyan-950 text-cyan-100'
                      : 'border-slate-700 bg-slate-950 text-slate-300'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Recommended Response Mode
            </label>
            <select
              value={responseMode}
              onChange={(event) => setResponseMode(event.target.value)}
              className="mb-5 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
            >
              <option value="">Choose response mode</option>
              {responseModes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Optional Additional Operational Notes
            </label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add only coordination-relevant notes. Do not include private or sensitive learner information."
              className="mb-5 min-h-28 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
            />

            <button
              onClick={saveRoutingRecord}
              disabled={saving || !routingSummary}
              className="w-full rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Governance Routing Record'}
            </button>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-bold">
              Auto-Generated Routing Summary
            </h2>

            {selectedRequest ? (
              <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm text-slate-400">Selected Request</p>
                <p className="font-semibold">{selectedRequest.subject}</p>
                <p className="mt-2 text-sm text-slate-300">
                  {selectedRequest.problem}
                </p>
              </div>
            ) : (
              <p className="mb-4 text-slate-400">
                Select a learner request to generate routing intelligence.
              </p>
            )}

            <pre className="min-h-[420px] whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-200">
              {routingSummary ||
                'The governance-safe routing summary will appear here after the required fields are completed.'}
            </pre>
          </div>
        </div>
      </section>
    </main>
  )
}