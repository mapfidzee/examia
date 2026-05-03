'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type LessonRequest = {
  id: string
  subject: string
  problem: string
  preferred_time: string
  scheduled_time: string | null
  status: string
  assigned_teacher: string | null
}

export default function AdminPage() {
  const [requests, setRequests] = useState<LessonRequest[]>([])
  const [message, setMessage] = useState('Loading requests...')

  async function loadRequests() {
    const { data, error } = await supabase
      .from('lesson_requests')
      .select('*')

    if (error) {
      setMessage('Could not load requests.')
      console.error(error)
      return
    }

    setRequests(data || [])
    setMessage('')
  }

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from('lesson_requests')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      alert('Status update failed.')
      console.error(error)
      return
    }

    loadRequests()
  }

  async function updateTeacher(id: string, teacher: string) {
    const { error } = await supabase
      .from('lesson_requests')
      .update({ assigned_teacher: teacher })
      .eq('id', id)

    if (error) {
      alert('Teacher assignment failed.')
      console.error(error)
      return
    }

    loadRequests()
  }

  async function updateScheduledTime(id: string, scheduledTime: string) {
    const { error } = await supabase
      .from('lesson_requests')
      .update({ scheduled_time: scheduledTime })
      .eq('id', id)

    if (error) {
      alert('Scheduling failed.')
      console.error(error)
      return
    }

    loadRequests()
  }

  async function copyComputerLessonLink(id: string) {
    const link = `http://localhost:3000/lesson/${id}`
    await navigator.clipboard.writeText(link)
    alert('Computer lesson link copied.')
  }

  async function copyPhoneLessonLink(id: string) {
    const link = `http://192.168.1.228:3000/lesson/${id}`
    await navigator.clipboard.writeText(link)
    alert('Phone lesson link copied.')
  }

  useEffect(() => {
    loadRequests()
  }, [])

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#020617',
      color: 'white',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '30px', marginBottom: '10px' }}>
        Admin Dashboard
      </h1>

      <p style={{ color: '#cbd5e1', marginBottom: '25px' }}>
        Manage lesson requests, teacher assignment, scheduling, payment status, and lesson links.
      </p>

      {message && <p>{message}</p>}

      <div style={{ display: 'grid', gap: '15px' }}>
        {requests.map((request) => (
          <div
            key={request.id}
            style={{
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '15px',
              backgroundColor: '#0f172a'
            }}
          >
            <p><strong>Subject:</strong> {request.subject}</p>
            <p><strong>Problem:</strong> {request.problem}</p>
            <p><strong>Preferred Time:</strong> {request.preferred_time}</p>
            <p><strong>Scheduled Time:</strong> {request.scheduled_time || 'Not scheduled'}</p>
            <p><strong>Status:</strong> {request.status}</p>
            <p><strong>Teacher:</strong> {request.assigned_teacher || 'Not assigned'}</p>

            <input
              type="text"
              placeholder="Enter teacher name"
              defaultValue={request.assigned_teacher || ''}
              onBlur={(e) => updateTeacher(request.id, e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '10px',
                borderRadius: '6px'
              }}
            />

            <input
              type="text"
              placeholder="Enter scheduled time e.g. Saturday 10am"
              defaultValue={request.scheduled_time || ''}
              onBlur={(e) => updateScheduledTime(request.id, e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '10px',
                borderRadius: '6px'
              }}
            />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '15px' }}>
              <button
                onClick={() => updateStatus(request.id, 'MATCHED')}
                style={{
                  padding: '10px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px'
                }}
              >
                Mark MATCHED
              </button>

              <button
                onClick={() => updateStatus(request.id, 'PAID')}
                style={{
                  padding: '10px',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px'
                }}
              >
                Mark PAID
              </button>

              <button
                onClick={() => copyComputerLessonLink(request.id)}
                style={{
                  padding: '10px',
                  backgroundColor: '#7c3aed',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px'
                }}
              >
                Copy Computer Link
              </button>

              <button
                onClick={() => copyPhoneLessonLink(request.id)}
                style={{
                  padding: '10px',
                  backgroundColor: '#9333ea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px'
                }}
              >
                Copy Phone Link
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}