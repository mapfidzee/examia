'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function ResponderVerificationPortal() {
  const [mounted, setMounted] = useState(false)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [subjects, setSubjects] = useState('')
  const [gradeLevels, setGradeLevels] = useState('')
  const [province, setProvince] = useState('')
  const [spokenLanguages, setSpokenLanguages] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [bio, setBio] = useState('')

  const [qualificationSummary, setQualificationSummary] = useState('')
  const [teachingExperience, setTeachingExperience] = useState('')
  const [availability, setAvailability] = useState('')
  const [internetAccess, setInternetAccess] = useState('')
  const [studentSafetyAgreement, setStudentSafetyAgreement] = useState(false)
  const [platformGovernanceAgreement, setPlatformGovernanceAgreement] = useState(false)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  function splitList(value: string) {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  async function submitResponderProfile() {
    if (!fullName.trim() || !email.trim() || !subjects.trim()) {
      alert('Please enter your full name, email, and teaching subjects.')
      return
    }

    if (!studentSafetyAgreement || !platformGovernanceAgreement) {
      alert('Please confirm the safety and platform governance agreements.')
      return
    }

    setLoading(true)
    setMessage('')

    const completeBio = `
Teaching Strength:
${bio.trim() || 'Not provided'}

Qualification Summary:
${qualificationSummary.trim() || 'Not provided'}

Teaching Experience:
${teachingExperience.trim() || 'Not provided'}

Availability:
${availability.trim() || 'Not provided'}

Internet / Device Access:
${internetAccess.trim() || 'Not provided'}

Governance Confirmations:
- Student safety agreement accepted
- Platform governance agreement accepted
    `.trim()

    const { error } = await supabase.from('teacher_profiles').insert({
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      subjects: splitList(subjects),
      grade_levels: splitList(gradeLevels),
      province: province.trim(),
      spoken_languages: splitList(spokenLanguages),
      hourly_rate: hourlyRate ? Number(hourlyRate) : null,
      bio: completeBio,
      status: 'PENDING',
    })

    if (error) {
      console.error(error)
      alert('Responder verification profile could not be submitted.')
      setLoading(false)
      return
    }

    setMessage('Verification profile submitted. EXAMIA will review before activation.')

    setFullName('')
    setEmail('')
    setSubjects('')
    setGradeLevels('')
    setProvince('')
    setSpokenLanguages('')
    setHourlyRate('')
    setBio('')
    setQualificationSummary('')
    setTeachingExperience('')
    setAvailability('')
    setInternetAccess('')
    setStudentSafetyAgreement(false)
    setPlatformGovernanceAgreement(false)
    setLoading(false)
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>EXAMIA RESPONDER VERIFICATION PORTAL</p>

          <h1 style={styles.title}>Apply to Become a Verified Learning Responder</h1>

          <p style={styles.subtitle}>
            EXAMIA is building a governed learning support network for students.
            Responders are reviewed before they can support learners inside controlled
            lesson rooms.
          </p>

          <div style={styles.notice}>
            <strong>Verification-first model:</strong> this is not an instant signup.
            EXAMIA reviews identity, teaching fit, safety readiness, availability,
            and platform discipline before activation.
          </div>
        </section>

        <section style={styles.card}>
          <Section title="1. Identity">
            <Input label="Full Name *" value={fullName} setValue={setFullName} />
            <Input label="Email *" value={email} setValue={setEmail} />
            <Input label="Province / Location" value={province} setValue={setProvince} />
          </Section>

          <Section title="2. Learning Support Fit">
            <Input
              label="Subjects You Can Support *"
              value={subjects}
              setValue={setSubjects}
              placeholder="Mathematics, Science, History, Shona"
            />

            <Input
              label="Grade / Level Range"
              value={gradeLevels}
              setValue={setGradeLevels}
              placeholder="Grade 7, Form 2, O Level, A Level"
            />

            <Input
              label="Languages You Can Teach In"
              value={spokenLanguages}
              setValue={setSpokenLanguages}
              placeholder="English, Shona, Ndebele"
            />
          </Section>

          <Section title="3. Verification Information">
            <TextArea
              label="Qualification Summary"
              value={qualificationSummary}
              setValue={setQualificationSummary}
              placeholder="Briefly describe your education, training, certificates, or subject strength."
            />

            <TextArea
              label="Teaching / Tutoring Experience"
              value={teachingExperience}
              setValue={setTeachingExperience}
              placeholder="Describe your experience helping learners, even if informal."
            />

            <TextArea
              label="Teaching Strength"
              value={bio}
              setValue={setBio}
              placeholder="Describe how you explain difficult concepts and support struggling students."
            />
          </Section>

          <Section title="4. Availability and Access">
            <Input
              label="Expected Hourly Rate"
              value={hourlyRate}
              setValue={setHourlyRate}
              placeholder="Example: 5"
            />

            <Input
              label="Availability"
              value={availability}
              setValue={setAvailability}
              placeholder="Example: Weekdays 6pm–9pm, Saturdays morning"
            />

            <Input
              label="Internet / Device Access"
              value={internetAccess}
              setValue={setInternetAccess}
              placeholder="Example: Android phone, laptop, stable data, WiFi"
            />
          </Section>

          <section style={styles.governanceBox}>
            <h3 style={styles.sectionTitle}>5. Safety and Platform Governance</h3>

            <CheckBox
              checked={studentSafetyAgreement}
              setChecked={setStudentSafetyAgreement}
              label="I understand that learners must be treated respectfully, safely, and professionally at all times."
            />

            <CheckBox
              checked={platformGovernanceAgreement}
              setChecked={setPlatformGovernanceAgreement}
              label="I understand that EXAMIA lessons must remain inside the controlled platform unless EXAMIA authorizes otherwise."
            />
          </section>

          <button
            onClick={submitResponderProfile}
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Submitting Verification Profile...' : 'Submit for Verification'}
          </button>

          {message && <p style={styles.success}>{message}</p>}
        </section>
      </div>
    </main>
  )
}

function Section({ title, children }: any) {
  return (
    <section style={styles.section}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      <div style={styles.grid}>{children}</div>
    </section>
  )
}

function Input({ label, value, setValue, placeholder = '' }: any) {
  return (
    <label style={styles.label}>
      {label}
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />
    </label>
  )
}

function TextArea({ label, value, setValue, placeholder = '' }: any) {
  return (
    <label style={styles.label}>
      {label}
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        style={styles.textarea}
      />
    </label>
  )
}

function CheckBox({ checked, setChecked, label }: any) {
  return (
    <label style={styles.checkboxRow}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        style={styles.checkbox}
      />
      <span>{label}</span>
    </label>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #082f49 0%, #0f172a 100%)',
    padding: '64px 18px',
    color: 'white',
  },
  container: {
    maxWidth: '1040px',
    margin: '0 auto',
  },
  hero: {
    marginBottom: '32px',
  },
  kicker: {
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '2px',
    color: '#bae6fd',
  },
  title: {
    fontSize: 'clamp(34px, 6vw, 58px)',
    lineHeight: 1.05,
    margin: '12px 0',
  },
  subtitle: {
    fontSize: '18px',
    maxWidth: '760px',
    color: '#e0f2fe',
    lineHeight: 1.6,
  },
  notice: {
    marginTop: '22px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.18)',
    padding: '18px',
    borderRadius: '16px',
    maxWidth: '820px',
    color: '#f8fafc',
    lineHeight: 1.5,
  },
  card: {
    background: '#020617',
    borderRadius: '24px',
    padding: 'clamp(22px, 5vw, 44px)',
    boxShadow: '0 24px 70px rgba(0,0,0,0.45)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  section: {
    marginBottom: '28px',
  },
  sectionTitle: {
    fontSize: '20px',
    marginBottom: '14px',
  },
  grid: {
    display: 'grid',
    gap: '16px',
  },
  label: {
    display: 'grid',
    gap: '8px',
    fontWeight: 700,
    color: '#f8fafc',
  },
  input: {
    width: '100%',
    padding: '15px',
    borderRadius: '12px',
    border: '1px solid #334155',
    background: '#0f172a',
    color: 'white',
    fontSize: '16px',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    minHeight: '140px',
    padding: '15px',
    borderRadius: '12px',
    border: '1px solid #334155',
    background: '#0f172a',
    color: 'white',
    fontSize: '16px',
    outline: 'none',
    resize: 'vertical',
  },
  governanceBox: {
    background: '#0b3b8f',
    padding: '24px',
    borderRadius: '18px',
    marginBottom: '28px',
  },
  checkboxRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    marginTop: '14px',
    lineHeight: 1.45,
    color: '#e0f2fe',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    marginTop: '2px',
  },
  button: {
    width: '100%',
    padding: '18px',
    fontSize: '18px',
    fontWeight: 900,
    background: 'white',
    color: '#0b3b8f',
    border: 'none',
    borderRadius: '14px',
  },
  success: {
    marginTop: '20px',
    color: '#bbf7d0',
    fontWeight: 700,
  },
}