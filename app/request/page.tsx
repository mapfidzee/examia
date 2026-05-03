'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function RequestPage() {
  const [subject, setSubject] = useState('Mathematics')
  const [problem, setProblem] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [message, setMessage] = useState('')

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('Submitting request...')

    const { error } = await supabase.from('lesson_requests').insert({
      subject: subject,
      problem: problem,
      preferred_time: preferredTime,
      status: 'NEW',
    })

    if (error) {
      setMessage('Something went wrong. Please try again.')
      console.error(error)
      return
    }

    setMessage('Request submitted successfully.')
    setProblem('')
    setPreferredTime('')
  }

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#020617',
      color: 'white',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '30px', marginBottom: '20px' }}>
        Request a Lesson
      </h1>

      <form onSubmit={submitRequest} style={{ maxWidth: '400px' }}>
        <label>Subject</label><br />
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '15px' }}
        >
          <option>Mathematics</option>
          <option>English</option>
          <option>General Paper</option>
        </select>

        <label>What is the problem?</label><br />
        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="Describe where the student is struggling"
          style={{ width: '100%', padding: '10px', marginBottom: '15px' }}
        />

        <label>Preferred Time</label><br />
        <input
          value={preferredTime}
          onChange={(e) => setPreferredTime(e.target.value)}
          type="text"
          placeholder="e.g. Today 5pm"
          style={{ width: '100%', padding: '10px', marginBottom: '15px' }}
        />

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#3b82f6',
            border: 'none',
            borderRadius: '10px',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          Submit Request
        </button>

        {message && (
          <p style={{ marginTop: '15px', color: '#93c5fd' }}>
            {message}
          </p>
        )}
      </form>
    </main>
  )
}