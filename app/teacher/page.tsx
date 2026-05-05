'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function TeacherSignupPage() {
  const [mounted, setMounted] = useState(false)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [subjects, setSubjects] = useState('')
  const [gradeLevels, setGradeLevels] = useState('')
  const [province, setProvince] = useState('')
  const [spokenLanguages, setSpokenLanguages] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [bio, setBio] = useState('')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  async function submitTeacherProfile() {
    if (!fullName.trim() || !email.trim() || !subjects.trim()) {
      alert('Please enter your full name, email, and subjects.')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.from('teacher_profiles').insert({
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      subjects: subjects.split(',').map((item) => item.trim()).filter(Boolean),
      grade_levels: gradeLevels.split(',').map((item) => item.trim()).filter(Boolean),
      province: province.trim(),
      spoken_languages: spokenLanguages.split(',').map((item) => item.trim()).filter(Boolean),
      hourly_rate: hourlyRate ? Number(hourlyRate) : null,
      bio: bio.trim(),
      status: 'PENDING',
    })

    if (error) {
      console.error(error)
      alert('Teacher profile could not be submitted.')
      setLoading(false)
      return
    }

    setMessage('Profile submitted successfully. Awaiting approval.')

    setFullName('')
    setEmail('')
    setSubjects('')
    setGradeLevels('')
    setProvince('')
    setSpokenLanguages('')
    setHourlyRate('')
    setBio('')
    setLoading(false)
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0b3b8f',
      padding: '80px 20px',
      color: 'white'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto'
      }}>

        {/* HEADER */}
        <div style={{ marginBottom: '40px' }}>
          <p style={{
            fontSize: '12px',
            fontWeight: 'bold',
            letterSpacing: '2px',
            color: '#dbeafe'
          }}>
            EXAMIA TEACHER NETWORK
          </p>

          <h1 style={{
            fontSize: '52px',
            margin: '10px 0'
          }}>
            Teach with EXAMIA
          </h1>

          <p style={{
            fontSize: '18px',
            maxWidth: '700px',
            color: '#e0f2fe'
          }}>
            Join a structured platform where teachers support students through
            controlled lesson rooms, chat, files, voice, and live audio.
          </p>
        </div>

        {/* FORM CARD */}
        <div style={{
          background: '#0f172a',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
        }}>

          {/* SECTION 1 */}
          <Section title="Identity">
            <Input label="Full Name *" value={fullName} setValue={setFullName} />
            <Input label="Email *" value={email} setValue={setEmail} />
          </Section>

          {/* SECTION 2 */}
          <Section title="Teaching Fit">
            <Input label="Subjects *" value={subjects} setValue={setSubjects} placeholder="Math, Biology" />
            <Input label="Grade Levels" value={gradeLevels} setValue={setGradeLevels} placeholder="Grade 7, A Level" />
          </Section>

          {/* SECTION 3 */}
          <Section title="Local Matching">
            <Input label="Province" value={province} setValue={setProvince} />
            <Input label="Languages" value={spokenLanguages} setValue={setSpokenLanguages} placeholder="English, Shona" />
            <Input label="Hourly Rate" value={hourlyRate} setValue={setHourlyRate} />
          </Section>

          {/* SECTION 4 */}
          <div style={{
            background: '#1d4ed8',
            padding: '30px',
            borderRadius: '16px',
            marginBottom: '30px'
          }}>
            <h3>Teaching Strength</h3>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe how you teach and help students understand."
              style={{
                width: '100%',
                marginTop: '10px',
                padding: '16px',
                borderRadius: '10px',
                border: 'none',
                minHeight: '200px'
              }}
            />
          </div>

          {/* BUTTON */}
          <button
            onClick={submitTeacherProfile}
            disabled={loading}
            style={{
              width: '100%',
              padding: '18px',
              fontSize: '18px',
              fontWeight: 'bold',
              background: 'white',
              color: '#0b3b8f',
              border: 'none',
              borderRadius: '12px'
            }}
          >
            {loading ? 'Submitting...' : 'Submit Teacher Profile'}
          </button>

          {message && (
            <p style={{ marginTop: '20px', color: '#bbf7d0' }}>
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

/* COMPONENTS */

function Section({ title, children }: any) {
  return (
    <div style={{ marginBottom: '25px' }}>
      <h3 style={{ marginBottom: '10px' }}>{title}</h3>
      <div style={{
        display: 'grid',
        gap: '15px'
      }}>
        {children}
      </div>
    </div>
  )
}

function Input({ label, value, setValue, placeholder = '' }: any) {
  return (
    <div>
      <label style={{ fontWeight: 'bold' }}>{label}</label>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '14px',
          marginTop: '5px',
          borderRadius: '10px',
          border: 'none'
        }}
      />
    </div>
  )
}