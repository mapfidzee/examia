'use client'

import { useState } from 'react'

export default function LessonRoomDemo() {
  const [messages, setMessages] = useState<string[]>([])
  const [newMessage, setNewMessage] = useState('')

  function sendMessage() {
    if (!newMessage.trim()) return

    setMessages([...messages, newMessage])
    setNewMessage('')
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#020617',
        color: 'white',
        padding: '20px',
      }}
    >
      <h1
        style={{
          fontSize: '34px',
          marginBottom: '10px',
          lineHeight: 1.1,
        }}
      >
        Controlled Intervention Room
      </h1>

      <p
        style={{
          color: '#cbd5e1',
          marginBottom: '20px',
          maxWidth: '760px',
          lineHeight: 1.6,
        }}
      >
        Governed low-bandwidth stabilization coordination space for controlled
        intervention communication, continuity support, operational guidance,
        and structured responder collaboration.
      </p>

      <section
        style={{
          border: '1px solid #334155',
          borderRadius: '18px',
          padding: '18px',
          backgroundColor: '#0f172a',
          maxWidth: '760px',
          boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gap: '10px',
            marginBottom: '18px',
          }}
        >
          <p>
            <strong>Support Domain:</strong> Mathematics Support
          </p>

          <p>
            <strong>Assigned Responder:</strong> Verified Operational Responder
          </p>

          <p>
            <strong>Operational Status:</strong> Awaiting Controlled Activation
          </p>
        </div>

        <div
          style={{
            marginTop: '20px',
            minHeight: '220px',
            border: '1px solid #475569',
            borderRadius: '14px',
            padding: '12px',
            backgroundColor: '#020617',
          }}
        >
          <p
            style={{
              color: '#94a3b8',
              marginBottom: '12px',
            }}
          >
            Governed intervention coordination messages will appear here.
          </p>

          {messages.map((message, index) => (
            <p
              key={index}
              style={{
                backgroundColor: '#1e293b',
                padding: '10px',
                borderRadius: '10px',
                marginBottom: '10px',
                lineHeight: 1.5,
              }}
            >
              {message}
            </p>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginTop: '18px',
          }}
        >
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Enter governed intervention message"
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid #334155',
              backgroundColor: '#111827',
              color: 'white',
            }}
          />

          <button
            onClick={sendMessage}
            style={{
              padding: '12px 18px',
              backgroundColor: '#67e8f9',
              color: '#082f49',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            Send
          </button>
        </div>
      </section>
    </main>
  )
}