'use client'

import { useEffect, useRef, useState, use } from 'react'
import { supabase } from '../../../lib/supabase'

type LessonRequest = {
  id: string
  subject: string
  problem: string
  preferred_time: string
  scheduled_time: string | null
  status: string
  assigned_teacher: string | null
}

type LessonMessage = {
  id: string
  lesson_request_id: string
  sender: string
  message: string
  created_at: string
}

type LessonFile = {
  id: string
  lesson_id: string
  file_name: string
  file_path: string
  file_size: number
  file_type: string
  uploaded_by_name: string
  uploaded_by_role: string
  created_at: string
}

type LessonAudioNote = {
  id: string
  lesson_id: string
  audio_name: string
  audio_path: string
  audio_size: number
  uploaded_by_name: string
  uploaded_by_role: string
  created_at: string
}

type LessonAudioSignal = {
  id: string
  lesson_id: string
  sender_name: string
  sender_role: string
  signal_type: string
  signal_data: any
  created_at: string
}

export default function LessonRoom({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)

  const [request, setRequest] = useState<LessonRequest | null>(null)
  const [messages, setMessages] = useState<LessonMessage[]>([])
  const [files, setFiles] = useState<LessonFile[]>([])
  const [audioNotes, setAudioNotes] = useState<LessonAudioNote[]>([])

  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('Student')
  const [hasEntered, setHasEntered] = useState(false)

  const [newMessage, setNewMessage] = useState('')
  const [message, setMessage] = useState('Loading lesson room...')
  const [uploading, setUploading] = useState(false)

  const [isRecording, setIsRecording] = useState(false)
  const [recordingMessage, setRecordingMessage] = useState(
    'Voice explanation is ready. Tap Start Recording to speak.'
  )
  const [uploadingAudio, setUploadingAudio] = useState(false)

  const [liveAudioStatus, setLiveAudioStatus] = useState('Live audio call is ready.')
  const [callActive, setCallActive] = useState(false)
  const [incomingCall, setIncomingCall] = useState<any | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const currentCallIdRef = useRef<string>('')
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null)

  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([])
  const remoteDescriptionReadyRef = useRef(false)

  async function loadLesson() {
    const { data, error } = await supabase
      .from('lesson_requests')
      .select('*')
      .eq('id', resolvedParams.id)
      .single()

    if (error) {
      setMessage('Lesson room not found.')
      console.error(error)
      return
    }

    setRequest(data)
    setMessage('')
  }

  async function loadMessages() {
    const { data, error } = await supabase
      .from('lesson_messages')
      .select('*')
      .eq('lesson_request_id', resolvedParams.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error(error)
      return
    }

    setMessages(data || [])
  }

  async function loadFiles() {
    const { data, error } = await supabase
      .from('lesson_files')
      .select('*')
      .eq('lesson_id', resolvedParams.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setFiles(data || [])
  }

  async function loadAudioNotes() {
    const { data, error } = await supabase
      .from('lesson_audio_notes')
      .select('*')
      .eq('lesson_id', resolvedParams.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setAudioNotes(data || [])
  }

  function enterRoom() {
    if (!userName.trim()) {
      alert('Please enter your name')
      return
    }

    setHasEntered(true)
  }

  async function sendMessage() {
    if (!newMessage.trim()) return

    const { error } = await supabase.from('lesson_messages').insert({
      lesson_request_id: resolvedParams.id,
      sender: `${userName} (${userRole})`,
      message: newMessage,
    })

    if (error) {
      alert('Message failed to send.')
      console.error(error)
      return
    }

    setNewMessage('')
  }

  async function uploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    const maximumFileSize = 10 * 1024 * 1024

    if (selectedFile.size > maximumFileSize) {
      alert('This file is too large. Please upload a file smaller than 10MB.')
      event.target.value = ''
      return
    }

    setUploading(true)

    const safeFileName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath = `${resolvedParams.id}/${Date.now()}-${safeFileName}`

    const { error: uploadError } = await supabase.storage
      .from('lesson-files')
      .upload(filePath, selectedFile)

    if (uploadError) {
      alert('File upload failed.')
      console.error(uploadError)
      setUploading(false)
      return
    }

    const { error: databaseError } = await supabase.from('lesson_files').insert({
      lesson_id: resolvedParams.id,
      file_name: selectedFile.name,
      file_path: filePath,
      file_size: selectedFile.size,
      file_type: selectedFile.type || 'unknown',
      uploaded_by_name: userName,
      uploaded_by_role: userRole,
    })

    if (databaseError) {
      alert('File uploaded, but the file record was not saved.')
      console.error(databaseError)
      setUploading(false)
      return
    }

    event.target.value = ''
    setUploading(false)
  }

  async function downloadFile(file: LessonFile) {
    const { data, error } = await supabase.storage
      .from('lesson-files')
      .createSignedUrl(file.file_path, 60)

    if (error || !data?.signedUrl) {
      alert('Download failed.')
      console.error(error)
      return
    }

    const link = document.createElement('a')
    link.href = data.signedUrl
    link.download = file.file_name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      audioChunksRef.current = []

      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = async () => {
        const recordedBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        })

        stream.getTracks().forEach((track) => track.stop())

        const maximumAudioSize = 5 * 1024 * 1024

        if (recordedBlob.size > maximumAudioSize) {
          alert('Voice explanation is too large. Please keep it shorter.')
          setRecordingMessage('Voice explanation was too long. Please try a shorter explanation.')
          return
        }

        await uploadVoiceExplanation(recordedBlob)
      }

      recorder.start()
      setIsRecording(true)
      setRecordingMessage('Recording voice explanation... Tap Stop & Send when finished.')
    } catch (error) {
      alert('Microphone access failed. Please allow microphone permission.')
      console.error(error)
    }
  }

  function stopAndSendRecording() {
    if (!mediaRecorderRef.current) return

    setIsRecording(false)
    setRecordingMessage('Sending voice explanation...')
    mediaRecorderRef.current.stop()
  }

  async function uploadVoiceExplanation(audioBlob: Blob) {
    setUploadingAudio(true)

    const audioName = `Voice explanation from ${userName} (${userRole})`
    const audioPath = `${resolvedParams.id}/${Date.now()}-voice-explanation.webm`

    const { error: uploadError } = await supabase.storage
      .from('lesson-audio')
      .upload(audioPath, audioBlob, {
        contentType: 'audio/webm',
      })

    if (uploadError) {
      alert('Voice explanation upload failed.')
      console.error(uploadError)
      setUploadingAudio(false)
      setRecordingMessage('Voice explanation upload failed. Please try again.')
      return
    }

    const { error: databaseError } = await supabase.from('lesson_audio_notes').insert({
      lesson_id: resolvedParams.id,
      audio_name: audioName,
      audio_path: audioPath,
      audio_size: audioBlob.size,
      uploaded_by_name: userName,
      uploaded_by_role: userRole,
    })

    if (databaseError) {
      alert('Voice explanation uploaded, but the record was not saved.')
      console.error(databaseError)
      setUploadingAudio(false)
      setRecordingMessage('Voice explanation record failed. Please try again.')
      return
    }

    setUploadingAudio(false)
    setRecordingMessage('Voice explanation sent. You can record another one.')
  }

  async function getAudioUrl(audio: LessonAudioNote) {
    const { data, error } = await supabase.storage
      .from('lesson-audio')
      .createSignedUrl(audio.audio_path, 300)

    if (error || !data?.signedUrl) {
      console.error(error)
      return ''
    }

    return data.signedUrl
  }

  async function sendLiveSignal(signalType: string, signalData: any) {
    const { error } = await supabase.from('lesson_audio_signals').insert({
      lesson_id: resolvedParams.id,
      sender_name: userName,
      sender_role: userRole,
      signal_type: signalType,
      signal_data: signalData,
    })

    if (error) {
      console.error(error)
      setLiveAudioStatus('Live audio signal failed.')
    }
  }

  async function addBufferedCandidates() {
    if (!peerConnectionRef.current) return
    if (!remoteDescriptionReadyRef.current) return

    const candidates = [...pendingCandidatesRef.current]
    pendingCandidatesRef.current = []

    for (const candidate of candidates) {
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate))
      } catch (error) {
        console.error(error)
      }
    }
  }

  function createPeerConnection(callId: string) {
    pendingCandidatesRef.current = []
    remoteDescriptionReadyRef.current = false

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    })

    peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        await sendLiveSignal('candidate', {
          callId,
          candidate: event.candidate.toJSON(),
        })
      }
    }

    peerConnection.ontrack = (event) => {
      const remoteStream = event.streams[0]

      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream
        remoteAudioRef.current.play().catch((error) => {
          console.error(error)
          setLiveAudioStatus('Remote audio is ready. Tap play if the browser blocks autoplay.')
        })
      }

      setLiveAudioStatus('Connected. You should hear the other person now.')
    }

    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === 'connected') {
        setLiveAudioStatus('Live audio connected.')
        setCallActive(true)
      }

      if (
        peerConnection.connectionState === 'disconnected' ||
        peerConnection.connectionState === 'failed' ||
        peerConnection.connectionState === 'closed'
      ) {
        setLiveAudioStatus('Live audio ended or disconnected.')
        setCallActive(false)
      }
    }

    peerConnectionRef.current = peerConnection
    return peerConnection
  }

  async function startLiveAudioCall() {
    try {
      const callId = `${resolvedParams.id}-${Date.now()}`
      currentCallIdRef.current = callId

      setIncomingCall(null)
      setLiveAudioStatus('Starting live audio call...')

      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      })

      localStreamRef.current = localStream

      const peerConnection = createPeerConnection(callId)

      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
      })

      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)

      await sendLiveSignal('offer', {
        callId,
        offer,
      })

      setCallActive(true)
      setLiveAudioStatus('Calling... Ask the other person to click Accept Call.')
    } catch (error) {
      alert('Could not start live audio. Please allow microphone permission.')
      console.error(error)
      setLiveAudioStatus('Could not start live audio.')
    }
  }

  async function acceptLiveAudioCall() {
    if (!incomingCall) return

    try {
      const callId = incomingCall.callId
      currentCallIdRef.current = callId

      setLiveAudioStatus('Accepting live audio call...')

      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      })

      localStreamRef.current = localStream

      const peerConnection = createPeerConnection(callId)

      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
      })

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer)
      )

      remoteDescriptionReadyRef.current = true
      await addBufferedCandidates()

      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)

      await sendLiveSignal('answer', {
        callId,
        answer,
      })

      setIncomingCall(null)
      setCallActive(true)
      setLiveAudioStatus('Call accepted. Connecting audio...')
    } catch (error) {
      alert('Could not accept live audio. Please allow microphone permission.')
      console.error(error)
      setLiveAudioStatus('Could not accept live audio.')
    }
  }

  async function handleLiveAudioSignal(signal: LessonAudioSignal) {
    if (!hasEntered) return

    if (signal.sender_name === userName && signal.sender_role === userRole) {
      return
    }

    const signalData = signal.signal_data

    if (signal.signal_type === 'offer') {
      setIncomingCall({
        callId: signalData.callId,
        offer: signalData.offer,
      })

      setLiveAudioStatus(`${signal.sender_name} is calling. Click Accept Call.`)
      return
    }

    if (signal.signal_type === 'answer') {
      if (!peerConnectionRef.current) return
      if (signalData.callId !== currentCallIdRef.current) return

      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(signalData.answer)
      )

      remoteDescriptionReadyRef.current = true
      await addBufferedCandidates()

      setLiveAudioStatus('Answer received. Connecting live audio...')
      return
    }

    if (signal.signal_type === 'candidate') {
      if (signalData.callId !== currentCallIdRef.current) return

      if (!peerConnectionRef.current || !remoteDescriptionReadyRef.current) {
        pendingCandidatesRef.current.push(signalData.candidate)
        return
      }

      try {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(signalData.candidate)
        )
      } catch (error) {
        console.error(error)
      }

      return
    }

    if (signal.signal_type === 'end') {
      if (signalData.callId !== currentCallIdRef.current) return

      closeLiveAudio(false)
      setLiveAudioStatus(`${signal.sender_name || 'The other person'} ended the call.`)
    }
  }

  async function endLiveAudioCall() {
    await sendLiveSignal('end', {
      callId: currentCallIdRef.current,
      sender_name: userName,
    })

    closeLiveAudio(true)
  }

  function closeLiveAudio(showMessage: boolean) {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null
    }

    pendingCandidatesRef.current = []
    remoteDescriptionReadyRef.current = false
    currentCallIdRef.current = ''

    setIncomingCall(null)
    setCallActive(false)

    if (showMessage) {
      setLiveAudioStatus('Live audio call ended.')
    }
  }

  function formatFileSize(size: number) {
    if (!size) return 'Unknown size'

    const sizeInKb = size / 1024
    const sizeInMb = sizeInKb / 1024

    if (sizeInMb >= 1) {
      return `${sizeInMb.toFixed(1)} MB`
    }

    return `${sizeInKb.toFixed(1)} KB`
  }

  useEffect(() => {
    loadLesson()
    loadMessages()
    loadFiles()
    loadAudioNotes()

    const messageChannel = supabase
      .channel(`lesson-room-messages-${resolvedParams.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lesson_messages',
          filter: `lesson_request_id=eq.${resolvedParams.id}`,
        },
        (payload) => {
          const newMsg = payload.new as LessonMessage
          setMessages((currentMessages) => [...currentMessages, newMsg])
        }
      )
      .subscribe()

    const fileChannel = supabase
      .channel(`lesson-room-files-${resolvedParams.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lesson_files',
          filter: `lesson_id=eq.${resolvedParams.id}`,
        },
        (payload) => {
          const newFile = payload.new as LessonFile
          setFiles((currentFiles) => [newFile, ...currentFiles])
        }
      )
      .subscribe()

    const audioChannel = supabase
      .channel(`lesson-room-audio-${resolvedParams.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lesson_audio_notes',
          filter: `lesson_id=eq.${resolvedParams.id}`,
        },
        (payload) => {
          const newAudio = payload.new as LessonAudioNote
          setAudioNotes((currentAudioNotes) => [newAudio, ...currentAudioNotes])
        }
      )
      .subscribe()

    const liveAudioChannel = supabase
      .channel(`lesson-live-audio-${resolvedParams.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lesson_audio_signals',
          filter: `lesson_id=eq.${resolvedParams.id}`,
        },
        (payload) => {
          handleLiveAudioSignal(payload.new as LessonAudioSignal)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messageChannel)
      supabase.removeChannel(fileChannel)
      supabase.removeChannel(audioChannel)
      supabase.removeChannel(liveAudioChannel)
      closeLiveAudio(false)
    }
  }, [resolvedParams.id, hasEntered, userName, userRole])

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#020617',
      color: 'white',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '30px', marginBottom: '10px' }}>
        EXAMIA Lesson Room
      </h1>

      <p style={{ color: '#94a3b8', maxWidth: '760px' }}>
        A controlled learning space for chat, files, quick voice explanations, live audio, and guided teaching.
      </p>

      {message && <p>{message}</p>}

      {request && request.status !== 'PAID' && (
        <section style={{
          maxWidth: '420px',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '15px',
          backgroundColor: '#0f172a'
        }}>
          <h2>Lesson Locked</h2>
          <p style={{ color: '#cbd5e1' }}>
            This lesson room is locked until payment is confirmed.
          </p>
          <p>
            Current status: <strong>{request.status}</strong>
          </p>
        </section>
      )}

      {request && request.status === 'PAID' && !hasEntered && (
        <section style={{
          maxWidth: '420px',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '15px',
          backgroundColor: '#0f172a'
        }}>
          <h2>Enter Lesson Room</h2>

          <p style={{ color: '#cbd5e1' }}>
            This is a controlled room. No phone numbers. No WhatsApp.
          </p>

          <input
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '10px',
              borderRadius: '8px'
            }}
          />

          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '10px',
              borderRadius: '8px'
            }}
          >
            <option>Student</option>
            <option>Teacher</option>
          </select>

          <button
            onClick={enterRoom}
            style={{
              marginTop: '15px',
              width: '100%',
              padding: '12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold'
            }}
          >
            Enter Room
          </button>
        </section>
      )}

      {request && request.status === 'PAID' && hasEntered && (
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)',
          gap: '20px',
          alignItems: 'start',
          maxWidth: '1180px'
        }}>
          <div style={{
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '15px',
            backgroundColor: '#0f172a'
          }}>
            <p><strong>Subject:</strong> {request.subject}</p>
            <p><strong>Problem:</strong> {request.problem}</p>
            <p><strong>Teacher:</strong> {request.assigned_teacher || 'Not assigned'}</p>
            <p><strong>Scheduled Time:</strong> {request.scheduled_time || 'Not scheduled'}</p>
            <p><strong>Status:</strong> {request.status}</p>
            <p><strong>You entered as:</strong> {userName} ({userRole})</p>

            <div style={{
              marginTop: '18px',
              marginBottom: '15px',
              padding: '12px',
              border: '1px solid #334155',
              borderRadius: '10px',
              backgroundColor: '#020617'
            }}>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '15px' }}>
                Lesson Flow
              </p>

              <div style={{ display: 'grid', gap: '8px', marginTop: '10px' }}>
                <div style={{ color: '#cbd5e1', fontSize: '14px' }}>
                  <strong>1. Question:</strong> Student states the exact problem clearly.
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '14px' }}>
                  <strong>2. Evidence:</strong> Student uploads worksheet, picture, or answer attempt if needed.
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '14px' }}>
                  <strong>3. Teaching:</strong> Teacher explains by chat, file, quick voice explanation, or live audio.
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '14px' }}>
                  <strong>4. Check:</strong> Student confirms understanding or asks a follow-up.
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '14px' }}>
                  <strong>5. Summary:</strong> Teacher gives final short summary or next practice task.
                </div>
              </div>
            </div>

            <div style={{
              minHeight: '250px',
              border: '1px solid #475569',
              borderRadius: '10px',
              padding: '10px',
              backgroundColor: '#020617'
            }}>
              {messages.length === 0 && (
                <p style={{ color: '#94a3b8' }}>
                  No messages yet. Start the lesson conversation here.
                </p>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    marginBottom: '10px',
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: msg.sender.includes('Teacher') ? '#1e40af' : '#1e293b'
                  }}
                >
                  <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1' }}>
                    {msg.sender}
                  </p>
                  <p style={{ margin: 0 }}>{msg.message}</p>
                </div>
              ))}
            </div>

            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type lesson message here."
              style={{
                width: '100%',
                padding: '10px',
                minHeight: '80px',
                borderRadius: '8px',
                marginTop: '15px',
                marginBottom: '10px'
              }}
            />

            <button
              onClick={sendMessage}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold'
              }}
            >
              Send Message
            </button>
          </div>

          <div>
            <div style={{
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '15px',
              backgroundColor: '#0f172a',
              marginBottom: '20px'
            }}>
              <h2 style={{ marginTop: 0 }}>Live Audio Call</h2>

              <p style={{ color: '#cbd5e1', fontSize: '14px' }}>
                Real-time voice call inside EXAMIA. Best for paid audio lessons.
              </p>

              <p style={{ color: callActive ? '#22c55e' : '#94a3b8', fontSize: '14px' }}>
                {liveAudioStatus}
              </p>

              <audio
                ref={remoteAudioRef}
                controls
                autoPlay
                style={{ width: '100%', marginBottom: '10px' }}
              />

              {incomingCall && !callActive && (
                <button
                  onClick={acceptLiveAudioCall}
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    marginBottom: '10px'
                  }}
                >
                  Accept Call
                </button>
              )}

              {!callActive && !incomingCall && (
                <button
                  onClick={startLiveAudioCall}
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    marginBottom: '10px'
                  }}
                >
                  Start Live Audio Call
                </button>
              )}

              {callActive && (
                <button
                  onClick={endLiveAudioCall}
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    marginBottom: '10px'
                  }}
                >
                  End Call
                </button>
              )}
            </div>

            <div style={{
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '15px',
              backgroundColor: '#0f172a',
              marginBottom: '20px'
            }}>
              <h2 style={{ marginTop: 0 }}>Quick Voice Explanation</h2>

              <p style={{ color: '#cbd5e1', fontSize: '14px' }}>
                Mobile-friendly voice teaching. Tap Start Recording, speak clearly, then tap Stop & Send.
              </p>

              <p style={{ color: isRecording ? '#22c55e' : '#94a3b8', fontSize: '14px' }}>
                {recordingMessage}
              </p>

              {!isRecording && (
                <button
                  onClick={startRecording}
                  disabled={uploadingAudio}
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    marginBottom: '10px'
                  }}
                >
                  {uploadingAudio ? 'Sending...' : 'Start Recording'}
                </button>
              )}

              {isRecording && (
                <button
                  onClick={stopAndSendRecording}
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    marginBottom: '10px'
                  }}
                >
                  Stop & Send
                </button>
              )}
            </div>

            <div style={{
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '15px',
              backgroundColor: '#0f172a',
              marginBottom: '20px'
            }}>
              <h2 style={{ marginTop: 0 }}>Lesson Files</h2>

              <label style={{
                display: 'block',
                border: '1px dashed #64748b',
                borderRadius: '10px',
                padding: '15px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: '#020617',
                marginTop: '12px',
                marginBottom: '15px'
              }}>
                <input
                  type="file"
                  onChange={uploadFile}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />

                {uploading ? 'Uploading file...' : 'Click to upload file'}
              </label>

              {files.map((file) => (
                <div
                  key={file.id}
                  style={{
                    border: '1px solid #475569',
                    borderRadius: '10px',
                    padding: '10px',
                    marginBottom: '10px',
                    backgroundColor: '#020617'
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 'bold', wordBreak: 'break-word' }}>
                    {file.file_name}
                  </p>

                  <p style={{ margin: '5px 0', color: '#94a3b8', fontSize: '13px' }}>
                    {formatFileSize(file.file_size)}
                  </p>

                  <button
                    onClick={() => downloadFile(file)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      marginTop: '8px'
                    }}
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>

            <div style={{
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '15px',
              backgroundColor: '#0f172a'
            }}>
              <h2 style={{ marginTop: 0 }}>Voice Explanations</h2>

              {audioNotes.length === 0 && (
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                  No voice explanations yet.
                </p>
              )}

              {audioNotes.map((audio) => (
                <AudioNoteCard
                  key={audio.id}
                  audio={audio}
                  getAudioUrl={getAudioUrl}
                  formatFileSize={formatFileSize}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

function AudioNoteCard({
  audio,
  getAudioUrl,
  formatFileSize,
}: {
  audio: LessonAudioNote
  getAudioUrl: (audio: LessonAudioNote) => Promise<string>
  formatFileSize: (size: number) => string
}) {
  const [audioUrl, setAudioUrl] = useState('')

  useEffect(() => {
    async function loadUrl() {
      const url = await getAudioUrl(audio)
      setAudioUrl(url)
    }

    loadUrl()
  }, [audio, getAudioUrl])

  return (
    <div style={{
      border: '1px solid #475569',
      borderRadius: '10px',
      padding: '10px',
      marginBottom: '10px',
      backgroundColor: '#020617'
    }}>
      <p style={{ margin: 0, fontWeight: 'bold' }}>
        {audio.audio_name}
      </p>

      <p style={{ margin: '5px 0', color: '#94a3b8', fontSize: '13px' }}>
        {formatFileSize(audio.audio_size)}
      </p>

      {audioUrl ? (
        <audio controls src={audioUrl} style={{ width: '100%', marginTop: '8px' }} />
      ) : (
        <p style={{ color: '#94a3b8', fontSize: '13px' }}>
          Preparing audio...
        </p>
      )}
    </div>
  )
}