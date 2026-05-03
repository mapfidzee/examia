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
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#020617',
      color: 'white',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '30px', marginBottom: '10px' }}>
        Lesson Room
      </h1>

      <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
        Controlled low-data classroom. No phone numbers. No WhatsApp.
      </p>

      <section style={{
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '15px',
        backgroundColor: '#0f172a',
        maxWidth: '600px'
      }}>
        <p><strong>Subject:</strong> Mathematics</p>
        <p><strong>Teacher:</strong> Assigned Teacher</p>
        <p><strong>Status:</strong> Waiting to start</p>

        <div style={{
          marginTop: '20px',
          minHeight: '200px',
          border: '1px solid #475569',
          borderRadius: '10px',
          padding: '10px',
          backgroundColor: '#020617'
        }}>
          <p style={{ color: '#94a3b8' }}>Chat messages will appear here.</p>

          {messages.map((message, index) => (
            <p key={index} style={{
              backgroundColor: '#1e293b',
              padding: '8px',
              borderRadius: '8px'
            }}>
              {message}
            </p>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a lesson message"
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px'
            }}
          />

          <button
            onClick={sendMessage}
            style={{
              padding: '10px 15px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px'
            }}
          >
            Send
          </button>
        </div>
      </section>
    </main>
  )
}