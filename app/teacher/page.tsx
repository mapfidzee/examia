'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function ResponderVerificationPortal() {
  const [mounted, setMounted] = useState(false)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [province, setProvince] = useState('')
  const [languages, setLanguages] = useState('')
  const [supportDomains, setSupportDomains] = useState('')
  const [beneficiaryLevels, setBeneficiaryLevels] = useState('')
  const [responseRole, setResponseRole] = useState('')
  const [availability, setAvailability] = useState('')
  const [accessCapacity, setAccessCapacity] = useState('')
  const [rate, setRate] = useState('')
  const [competenceSummary, setCompetenceSummary] = useState('')
  const [supportApproach, setSupportApproach] = useState('')
  const [safeguardingReadiness, setSafeguardingReadiness] = useState('')
  const [systemDiscipline, setSystemDiscipline] = useState('')

  const [beneficiaryProtectionAgreement, setBeneficiaryProtectionAgreement] = useState(false)
  const [platformContainmentAgreement, setPlatformContainmentAgreement] = useState(false)
  const [noBypassAgreement, setNoBypassAgreement] = useState(false)

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
    if (!fullName.trim() || !email.trim() || !supportDomains.trim()) {
      alert('Please enter your name, email, and support domains.')
      return
    }

    if (!beneficiaryProtectionAgreement || !platformContainmentAgreement || !noBypassAgreement) {
      alert('Please accept all governance agreements before submitting.')
      return
    }

    setLoading(true)
    setMessage('')

    const responderProfile = `
EXAMIA RESPONDER VERIFICATION PROFILE

Responder Role:
${responseRole.trim() || 'Not provided'}

Competence Summary:
${competenceSummary.trim() || 'Not provided'}

Beneficiary Support Approach:
${supportApproach.trim() || 'Not provided'}

Safeguarding Readiness:
${safeguardingReadiness.trim() || 'Not provided'}

System Discipline:
${systemDiscipline.trim() || 'Not provided'}

Availability:
${availability.trim() || 'Not provided'}

Access Capacity:
${accessCapacity.trim() || 'Not provided'}

Governance Agreements:
- Beneficiary protection accepted
- Platform containment accepted
- No off-platform bypass accepted
    `.trim()

    const { error } = await supabase.from('teacher_profiles').insert({
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      subjects: splitList(supportDomains),
      grade_levels: splitList(beneficiaryLevels),
      province: province.trim(),
      spoken_languages: splitList(languages),
      hourly_rate: rate ? Number(rate) : null,
      bio: responderProfile,
      status: 'PENDING',
    })

    if (error) {
      console.error(error)
      alert('Responder verification could not be submitted.')
      setLoading(false)
      return
    }

    setMessage('Verification submitted. EXAMIA will review before activation.')

    setFullName('')
    setEmail('')
    setProvince('')
    setLanguages('')
    setSupportDomains('')
    setBeneficiaryLevels('')
    setResponseRole('')
    setAvailability('')
    setAccessCapacity('')
    setRate('')
    setCompetenceSummary('')
    setSupportApproach('')
    setSafeguardingReadiness('')
    setSystemDiscipline('')
    setBeneficiaryProtectionAgreement(false)
    setPlatformContainmentAgreement(false)
    setNoBypassAgreement(false)
    setLoading(false)
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>EXAMIA • RESPONDER VERIFICATION</p>

          <h1 style={styles.title}>Verified Response Network</h1>

          <p style={styles.subtitle}>
            EXAMIA is building a governed responder network for continuity support,
            stabilization assistance, safe beneficiary interaction, and controlled
            intervention delivery inside traceable institutional pathways.
          </p>

          <div style={styles.principleGrid}>
            <div style={styles.principleCard}>Need Intake</div>
            <div style={styles.principleCard}>Responder Verification</div>
            <div style={styles.principleCard}>Controlled Intervention Space</div>
            <div style={styles.principleCard}>Beneficiary Visibility</div>
          </div>
        </section>

        <section style={styles.card}>
          <Section title="1. Responder Identity">
            <Input label="Full Name *" value={fullName} setValue={setFullName} />
            <Input label="Email *" value={email} setValue={setEmail} />
            <Input label="Province / Operating Location" value={province} setValue={setProvince} />
            <Input
              label="Languages of Support"
              value={languages}
              setValue={setLanguages}
              placeholder="English, Shona, Ndebele"
            />
          </Section>

          <Section title="2. Response Capability">
            <Input
              label="Support Domains *"
              value={supportDomains}
              setValue={setSupportDomains}
              placeholder="Math recovery, science support, reading support, exam preparation, family support"
            />

            <Input
              label="Beneficiary Levels You Can Support"
              value={beneficiaryLevels}
              setValue={setBeneficiaryLevels}
              placeholder="Grade 7, Form 1, O Level, A Level, adult support"
            />

            <Input
              label="Preferred Responder Role"
              value={responseRole}
              setValue={setResponseRole}
              placeholder="Academic responder, exam coach, continuity support responder, STEM responder"
            />
          </Section>

          <Section title="3. Verification Evidence">
            <TextArea
              label="Competence Summary"
              value={competenceSummary}
              setValue={setCompetenceSummary}
              placeholder="Describe what you can confidently support and why EXAMIA should trust your capability."
            />

            <TextArea
              label="Beneficiary Support Approach"
              value={supportApproach}
              setValue={setSupportApproach}
              placeholder="Describe how you identify support needs, guide the beneficiary step by step, and confirm progress."
            />

            <TextArea
              label="Safeguarding Readiness"
              value={safeguardingReadiness}
              setValue={setSafeguardingReadiness}
              placeholder="Describe how you will keep beneficiary interaction respectful, safe, age-appropriate, and professional."
            />

            <TextArea
              label="System Discipline"
              value={systemDiscipline}
              setValue={setSystemDiscipline}
              placeholder="Describe how you will follow EXAMIA rules, keep interventions inside the platform, and avoid informal side arrangements."
            />
          </Section>

          <Section title="4. Operational Readiness">
            <Input
              label="Availability"
              value={availability}
              setValue={setAvailability}
              placeholder="Example: Weekdays 6pm–9pm, Saturday morning"
            />

            <Input
              label="Device / Internet Capacity"
              value={accessCapacity}
              setValue={setAccessCapacity}
              placeholder="Example: Android phone, laptop, stable data, WiFi"
            />

            <Input
              label="Expected Rate"
              value={rate}
              setValue={setRate}
              placeholder="Example: 5"
            />
          </Section>

          <section style={styles.governanceBox}>
            <h3 style={styles.sectionTitle}>5. EXAMIA Governance Lock</h3>

            <CheckBox
              checked={beneficiaryProtectionAgreement}
              setChecked={setBeneficiaryProtectionAgreement}
              label="I understand that EXAMIA may serve vulnerable beneficiaries, and every interaction must protect dignity, safety, and trust."
            />

            <CheckBox
              checked={platformContainmentAgreement}
              setChecked={setPlatformContainmentAgreement}
              label="I understand that support must remain inside the controlled EXAMIA intervention space unless authorized."
            />

            <CheckBox
              checked={noBypassAgreement}
              setChecked={setNoBypassAgreement}
              label="I understand that bypassing the platform, soliciting beneficiaries privately, or moving interventions off-system can lead to removal."
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
            {loading ? 'Submitting Verification...' : 'Submit Responder Verification'}
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
    background: 'linear-gradient(180deg, #061826 0%, #0f172a 55%, #111827 100%)',
    padding: '64px 18px',
    color: 'white',
  },
  container: {
    maxWidth: '1080px',
    margin: '0 auto',
  },
  hero: {
    marginBottom: '34px',
  },
  kicker: {
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '2px',
    color: '#67e8f9',
  },
  title: {
    fontSize: 'clamp(34px, 6vw, 60px)',
    lineHeight: 1.02,
    margin: '12px 0',
  },
  subtitle: {
    fontSize: '18px',
    maxWidth: '820px',
    color: '#dbeafe',
    lineHeight: 1.65,
  },
  principleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '12px',
    marginTop: '24px',
    maxWidth: '920px',
  },
  principleCard: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.14)',
    padding: '16px',
    borderRadius: '16px',
    fontWeight: 800,
    color: '#f8fafc',
  },
  card: {
    background: '#020617',
    borderRadius: '24px',
    padding: 'clamp(22px, 5vw, 44px)',
    boxShadow: '0 24px 70px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  section: {
    marginBottom: '30px',
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
    fontWeight: 800,
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
    background: '#12304f',
    padding: '24px',
    borderRadius: '18px',
    marginBottom: '28px',
    border: '1px solid rgba(103,232,249,0.25)',
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
    background: '#67e8f9',
    color: '#082f49',
    border: 'none',
    borderRadius: '14px',
  },
  success: {
    marginTop: '20px',
    color: '#bbf7d0',
    fontWeight: 800,
  },
}