'use client'

import { use, useEffect, useRef, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type LessonRequest = {
  id: string
  subject: string
  problem: string
  preferred_time: string | null
  scheduled_time: string | null
  status: string
  assigned_teacher: string | null
  started_at: string | null
  completed_at: string | null
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

export default function LessonRoom({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)

  const [mounted, setMounted] = useState(false)
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
  const [recordingMessage, setRecordingMessage] = useState('Voice explanation is ready.')
  const [uploadingAudio, setUploadingAudio] = useState(false)

  const [liveAudioStatus, setLiveAudioStatus] = useState('Live audio call is ready.')
  const [callActive, setCallActive] = useState(false)
  const [incomingCall, setIncomingCall] = useState<any | null>(null)

  const [timerSeconds, setTimerSeconds] = useState(30 * 60)
  const [timerRunning, setTimerRunning] = useState(false)
  const [completingLesson, setCompletingLesson] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const currentCallIdRef = useRef('')
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null)

  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([])
  const remoteDescriptionReadyRef = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!timerRunning) return

    const timer = window.setInterval(() => {
      setTimerSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          setTimerRunning(false)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [timerRunning])

  async function loadLesson() {
    const { data, error } = await supabase
      .from('lesson_requests')
      .select('*')
      .eq('id', resolvedParams.id)
      .single()

    if (error || !data) {
      console.error(error)
      setMessage('Lesson room not found.')
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

    if (!error) setMessages(data || [])
  }

  async function loadFiles() {
    const { data, error } = await supabase
      .from('lesson_files')
      .select('*')
      .eq('lesson_id', resolvedParams.id)
      .order('created_at', { ascending: false })

    if (!error) setFiles(data || [])
  }

  async function loadAudioNotes() {
    const { data, error } = await supabase
      .from('lesson_audio_notes')
      .select('*')
      .eq('lesson_id', resolvedParams.id)
      .order('created_at', { ascending: false })

    if (!error) setAudioNotes(data || [])
  }

  async function enterRoom() {
    if (!userName.trim()) {
      alert('Please enter your name.')
      return
    }

    if (!request) return

    if (!request.started_at) {
      const startedAt = new Date().toISOString()

      const { error } = await supabase
        .from('lesson_requests')
        .update({ started_at: startedAt })
        .eq('id', resolvedParams.id)

      if (error) {
        console.error(error)
        alert('Could not record lesson start time.')
        return
      }

      setRequest((current) =>
        current ? { ...current, started_at: startedAt } : current
      )
    }

    setHasEntered(true)
  }

  async function sendMessage() {
    if (!newMessage.trim()) return

    const { error } = await supabase.from('lesson_messages').insert({
      lesson_request_id: resolvedParams.id,
      sender: `${userName} (${userRole})`,
      message: newMessage.trim(),
    })

    if (error) {
      console.error(error)
      alert('Message failed to send.')
      return
    }

    setNewMessage('')
  }

  async function markLessonCompleted() {
    if (userRole !== 'Teacher') {
      alert('Only the teacher should mark the lesson as completed.')
      return
    }

    const confirmed = window.confirm(
      'Mark this lesson as COMPLETED? The room will close for normal teaching.'
    )

    if (!confirmed) return

    setCompletingLesson(true)

    const completedAt = new Date().toISOString()

    const { error } = await supabase
      .from('lesson_requests')
      .update({
        status: 'COMPLETED',
        completed_at: completedAt,
      })
      .eq('id', resolvedParams.id)

    if (error) {
      console.error(error)
      alert('Could not mark lesson as completed.')
      setCompletingLesson(false)
      return
    }

    setTimerRunning(false)
    closeLiveAudio(false)

    setRequest((current) =>
      current
        ? {
            ...current,
            status: 'COMPLETED',
            completed_at: completedAt,
          }
        : current
    )

    setMessage('Lesson marked as completed.')
    setCompletingLesson(false)
  }

  function setThirtyMinuteTimer() {
    setTimerRunning(false)
    setTimerSeconds(30 * 60)
  }

  function setOneHourTimer() {
    setTimerRunning(false)
    setTimerSeconds(60 * 60)
  }

  function resetTimer() {
    setTimerRunning(false)
    setTimerSeconds(30 * 60)
  }

  function formatTimer(seconds: number) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  }

  function formatDateTime(value: string | null) {
    if (!value) return 'Not recorded'
    return new Date(value).toLocaleString()
  }

  async function uploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    const maximumFileSize = 10 * 1024 * 1024

    if (selectedFile.size > maximumFileSize) {
      alert('File too large. Please upload a file smaller than 10MB.')
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
      console.error(uploadError)
      alert('File upload failed.')
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
      console.error(databaseError)
      alert('File uploaded, but the file record was not saved.')
    }

    event.target.value = ''
    setUploading(false)
  }

  async function downloadFile(file: LessonFile) {
    const { data, error } = await supabase.storage
      .from('lesson-files')
      .createSignedUrl(file.file_path, 60)

    if (error || !data?.signedUrl) {
      console.error(error)
      alert('Download failed.')
      return
    }

    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []

      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      recorder.onstop = async () => {
        const recordedBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach((track) => track.stop())

        const maximumAudioSize = 5 * 1024 * 1024

        if (recordedBlob.size > maximumAudioSize) {
          alert('Voice note too large. Please keep it shorter.')
          setRecordingMessage('Voice note was too long. Try again.')
          return
        }

        await uploadVoiceExplanation(recordedBlob)
      }

      recorder.start()
      setIsRecording(true)
      setRecordingMessage('Recording... tap Stop & Send when finished.')
    } catch (error) {
      console.error(error)
      alert('Microphone access failed. Please allow microphone permission.')
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
      .upload(audioPath, audioBlob, { contentType: 'audio/webm' })

    if (uploadError) {
      console.error(uploadError)
      alert('Voice explanation upload failed.')
      setUploadingAudio(false)
      setRecordingMessage('Voice upload failed. Please try again.')
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
      console.error(databaseError)
      alert('Voice uploaded, but the record was not saved.')
      setUploadingAudio(false)
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
        remoteAudioRef.current.play().catch(() => {
          setLiveAudioStatus('Remote audio is ready. Tap the audio player if needed.')
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

      await sendLiveSignal('offer', { callId, offer })

      setCallActive(true)
      setLiveAudioStatus('Calling... ask the other person to accept.')
    } catch (error) {
      console.error(error)
      alert('Could not start live audio. Please allow microphone permission.')
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

      await peerConnection.setRemoteDescription(new RTCSessionDescription(incomingCall.offer))

      remoteDescriptionReadyRef.current = true
      await addBufferedCandidates()

      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)

      await sendLiveSignal('answer', { callId, answer })

      setIncomingCall(null)
      setCallActive(true)
      setLiveAudioStatus('Call accepted. Connecting audio...')
    } catch (error) {
      console.error(error)
      alert('Could not accept live audio. Please allow microphone permission.')
      setLiveAudioStatus('Could not accept live audio.')
    }
  }

  async function handleLiveAudioSignal(signal: LessonAudioSignal) {
    if (!hasEntered) return
    if (signal.sender_name === userName && signal.sender_role === userRole) return

    const signalData = signal.signal_data

    if (signal.signal_type === 'offer') {
      setIncomingCall({
        callId: signalData.callId,
        offer: signalData.offer,
      })
      setLiveAudioStatus(`${signal.sender_name} is calling.`)
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

    if (sizeInMb >= 1) return `${sizeInMb.toFixed(1)} MB`
    return `${sizeInKb.toFixed(1)} KB`
  }

  useEffect(() => {
    if (!mounted) return

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
          setMessages((current) => [...current, payload.new as LessonMessage])
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
          setFiles((current) => [payload.new as LessonFile, ...current])
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
          setAudioNotes((current) => [payload.new as LessonAudioNote, ...current])
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
  }, [mounted, resolvedParams.id, hasEntered, userName, userRole])

  if (!mounted) return null

  return (
    <main className="examia-page">
      <div className="pageShell">
        <header className="hero">
          <div>
            <p className="eyebrow">EXAMIA CONTROLLED LESSON SPACE</p>
            <h1>Lesson Room</h1>
            <p className="heroText">
              A guided learning room for chat, files, voice explanations, live
              audio, timed sessions, and clean lesson completion.
            </p>
          </div>

          <div className="heroBadge">
            <span className="heroBadgeDot" />
            Phase 2 Active
          </div>
        </header>

        {message && <p className="statusMessage">{message}</p>}

        {request && request.status === 'COMPLETED' && (
          <section className="card narrow completedCard">
            <p className="sectionKicker">Lesson closed</p>
            <h2>Lesson Completed</h2>
            <p className="muted">
              This lesson has been marked as completed. The teaching room is now
              closed for normal use.
            </p>
            <p className="lockedStatus">
              Started at: <strong>{formatDateTime(request.started_at)}</strong>
            </p>
            <p className="lockedStatus">
              Completed at: <strong>{formatDateTime(request.completed_at)}</strong>
            </p>
            <p className="lockedStatus">
              Current status: <strong>{request.status}</strong>
            </p>
          </section>
        )}

        {request && request.status !== 'PAID' && request.status !== 'COMPLETED' && (
          <section className="card narrow lockedCard">
            <p className="sectionKicker">Access control</p>
            <h2>Lesson Locked</h2>
            <p className="muted">
              This lesson room is locked until payment is confirmed.
            </p>
            <p className="lockedStatus">
              Current status: <strong>{request.status}</strong>
            </p>
          </section>
        )}

        {request && request.status === 'PAID' && !hasEntered && (
          <section className="card narrow entryCard">
            <p className="sectionKicker">Secure entry</p>
            <h2>Enter Lesson Room</h2>
            <p className="muted">
              This room keeps the learning interaction inside EXAMIA.
            </p>

            <input
              className="input"
              placeholder="Enter your name"
              value={userName}
              onChange={(event) => setUserName(event.target.value)}
            />

            <select
              className="input"
              value={userRole}
              onChange={(event) => setUserRole(event.target.value)}
            >
              <option>Student</option>
              <option>Teacher</option>
            </select>

            <button className="primaryBtn" onClick={enterRoom}>
              Enter Room
            </button>
          </section>
        )}

        {request && request.status === 'PAID' && hasEntered && (
          <section className="roomGrid">
            <div className="mainColumn">
              <section className="lessonOverview">
                <div className="overviewHeader">
                  <div>
                    <p className="sectionKicker">Current lesson</p>
                    <h2>{request.subject}</h2>
                  </div>
                  <span className="paidBadge">{request.status}</span>
                </div>

                <div className="infoGrid">
                  <Info label="Problem" value={request.problem} />
                  <Info label="Teacher" value={request.assigned_teacher || 'Not assigned'} />
                  <Info label="Scheduled" value={request.scheduled_time || 'Not scheduled'} />
                  <Info label="Started At" value={formatDateTime(request.started_at)} />
                  <Info label="You entered as" value={`${userName} (${userRole})`} />
                </div>
              </section>

              <section className="card timerCard">
                <div className="cardHeader">
                  <div>
                    <p className="sectionKicker">Session control</p>
                    <h2>Lesson Timer</h2>
                  </div>
                  <span className={timerSeconds === 0 ? 'timerDone' : 'timerPill'}>
                    {timerSeconds === 0 ? 'Time Done' : 'Active Timer'}
                  </span>
                </div>

                <div className="timerDisplay">{formatTimer(timerSeconds)}</div>

                <div className="timerButtons">
                  <button className="secondaryBtn" onClick={setThirtyMinuteTimer}>
                    30 Minutes
                  </button>

                  <button className="secondaryBtn" onClick={setOneHourTimer}>
                    1 Hour
                  </button>

                  <button
                    className="successBtn"
                    onClick={() => setTimerRunning(true)}
                    disabled={timerSeconds === 0 || timerRunning}
                  >
                    Start
                  </button>

                  <button
                    className="secondaryBtn"
                    onClick={() => setTimerRunning(false)}
                    disabled={!timerRunning}
                  >
                    Pause
                  </button>

                  <button className="secondaryBtn" onClick={resetTimer}>
                    Reset
                  </button>
                </div>

                {userRole === 'Teacher' ? (
                  <button
                    className="completeBtn"
                    onClick={markLessonCompleted}
                    disabled={completingLesson}
                  >
                    {completingLesson ? 'Completing Lesson...' : 'Mark Lesson Completed'}
                  </button>
                ) : (
                  <p className="teacherOnlyNote">
                    Only the teacher can mark this lesson as completed.
                  </p>
                )}
              </section>

              <section className="card flowCard">
                <div className="cardHeader">
                  <div>
                    <p className="sectionKicker">Learning path</p>
                    <h2>Lesson Flow</h2>
                  </div>
                </div>

                <div className="flowList">
                  <Flow number="1" title="Question" text="Student states the exact problem clearly." />
                  <Flow number="2" title="Evidence" text="Upload worksheet, image, PDF, or answer attempt." />
                  <Flow number="3" title="Teaching" text="Teacher explains through chat, voice, file, or live audio." />
                  <Flow number="4" title="Check" text="Student confirms understanding or asks a follow-up." />
                  <Flow number="5" title="Summary" text="Teacher closes with a short recap or next practice task." />
                </div>
              </section>

              <section className="chatPanel">
                <div className="cardHeader">
                  <div>
                    <p className="sectionKicker">Written guidance</p>
                    <h2>Lesson Chat</h2>
                  </div>
                  <span className="modePill chatPill">Text</span>
                </div>

                <div className="messagesBox">
                  {messages.length === 0 && (
                    <p className="emptyText">
                      No messages yet. Start the lesson conversation here.
                    </p>
                  )}

                  {messages.map((msg) => {
                    const isTeacher = msg.sender.includes('Teacher')

                    return (
                      <div
                        key={msg.id}
                        className={isTeacher ? 'bubble teacherBubble' : 'bubble studentBubble'}
                      >
                        <p className="sender">{msg.sender}</p>
                        <p className="bubbleText">{msg.message}</p>
                      </div>
                    )
                  })}

                  <div ref={messagesEndRef} />
                </div>

                <div className="composer">
                  <textarea
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    placeholder="Type lesson message..."
                    className="textarea"
                  />

                  <button className="primaryBtn" onClick={sendMessage}>
                    Send Message
                  </button>
                </div>
              </section>
            </div>

            <aside className="sideColumn">
              <section className="modeCard liveMode">
                <div className="modeHeader">
                  <div className="modeIcon liveIcon">☎</div>
                  <div>
                    <p className="sectionKicker">Real-time mode</p>
                    <h2>Live Audio</h2>
                  </div>
                </div>

                <p className="modeText">
                  Use this when the learner needs immediate spoken guidance.
                </p>

                <div className="statusBox">
                  <span className={callActive ? 'statusDot activeDot' : 'statusDot'} />
                  <p className={callActive ? 'greenText' : 'muted'}>
                    {liveAudioStatus}
                  </p>
                </div>

                <audio ref={remoteAudioRef} controls autoPlay className="audioPlayer" />

                {incomingCall && !callActive && (
                  <button className="successBtn" onClick={acceptLiveAudioCall}>
                    Accept Call
                  </button>
                )}

                {!callActive && !incomingCall && (
                  <button className="successBtn" onClick={startLiveAudioCall}>
                    Start Live Audio
                  </button>
                )}

                {callActive && (
                  <button className="dangerBtn" onClick={endLiveAudioCall}>
                    End Call
                  </button>
                )}
              </section>

              <section className="modeCard voiceMode">
                <div className="modeHeader">
                  <div className="modeIcon voiceIcon">🎙</div>
                  <div>
                    <p className="sectionKicker">Voice-note mode</p>
                    <h2>Quick Voice</h2>
                  </div>
                </div>

                <p className="modeText">
                  Record short teaching explanations that stay attached to this lesson.
                </p>

                <div className="statusBox voiceStatusBox">
                  <span className={isRecording ? 'statusDot recordingDot' : 'statusDot'} />
                  <p className={isRecording ? 'recordingText' : 'muted'}>
                    {recordingMessage}
                  </p>
                </div>

                {!isRecording && (
                  <button className="voiceBtn" onClick={startRecording} disabled={uploadingAudio}>
                    {uploadingAudio ? 'Sending...' : 'Start Recording'}
                  </button>
                )}

                {isRecording && (
                  <button className="dangerBtn" onClick={stopAndSendRecording}>
                    Stop & Send
                  </button>
                )}

                <div className="subSection">
                  <div className="subHeader">
                    <h3>Voice Explanations</h3>
                    <span className="countBadge">{audioNotes.length}</span>
                  </div>

                  <div className="listStack">
                    {audioNotes.length === 0 && (
                      <p className="emptyText">
                        No voice explanations yet. Recorded explanations will appear here.
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

              <section className="modeCard fileMode">
                <div className="modeHeader">
                  <div className="modeIcon fileIcon">⇧</div>
                  <div>
                    <p className="sectionKicker">Evidence mode</p>
                    <h2>Lesson Files</h2>
                  </div>
                </div>

                <p className="modeText">
                  Upload worksheets, pictures, PDFs, or solution attempts.
                </p>

                <label className="uploadBox">
                  <input type="file" onChange={uploadFile} disabled={uploading} hidden />
                  <span>{uploading ? 'Uploading file...' : 'Tap to upload file'}</span>
                  <small>Maximum file size: 10MB</small>
                </label>

                <div className="subSection">
                  <div className="subHeader">
                    <h3>Uploaded Files</h3>
                    <span className="countBadge">{files.length}</span>
                  </div>

                  <div className="listStack">
                    {files.length === 0 && (
                      <p className="emptyText">
                        No files uploaded yet. Files will appear here.
                      </p>
                    )}

                    {files.map((file) => (
                      <div className="miniCard fileMiniCard" key={file.id}>
                        <p className="fileName">{file.file_name}</p>
                        <p className="smallMuted">{formatFileSize(file.file_size)}</p>

                        <button className="secondaryBtn" onClick={() => downloadFile(file)}>
                          Open / Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </aside>
          </section>
        )}
      </div>

      <style jsx>{`
        .examia-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(59, 130, 246, 0.28), transparent 28%),
            radial-gradient(circle at top right, rgba(20, 184, 166, 0.16), transparent 26%),
            linear-gradient(180deg, #020617 0%, #07111f 45%, #020617 100%);
          color: #f8fafc;
          padding: 14px;
          overflow-x: hidden;
        }

        .pageShell {
          max-width: 1220px;
          margin: 0 auto;
        }

        .hero {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
          margin-bottom: 18px;
          padding: 12px 2px 4px;
        }

        .eyebrow,
        .sectionKicker {
          margin: 0 0 7px;
          color: #93c5fd;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          color: #ffffff;
          font-size: clamp(34px, 10vw, 56px);
          line-height: 0.95;
          letter-spacing: -0.05em;
        }

        h2 {
          margin: 0;
          color: #ffffff;
          font-size: 22px;
          line-height: 1.15;
          letter-spacing: -0.03em;
        }

        h3 {
          margin: 0;
          color: #ffffff;
          font-size: 16px;
          letter-spacing: -0.02em;
        }

        .heroText {
          margin: 12px 0 0;
          color: #dbeafe;
          max-width: 760px;
          font-size: 15px;
          line-height: 1.6;
        }

        .heroBadge {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(34, 197, 94, 0.35);
          background: rgba(34, 197, 94, 0.12);
          color: #bbf7d0;
          padding: 9px 12px;
          border-radius: 999px;
          font-weight: 900;
          font-size: 13px;
        }

        .heroBadgeDot {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: #22c55e;
          box-shadow: 0 0 18px rgba(34, 197, 94, 0.95);
        }

        .statusMessage {
          margin: 0 0 14px;
          color: #e2e8f0;
        }

        .roomGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          align-items: start;
        }

        .mainColumn,
        .sideColumn {
          display: grid;
          gap: 16px;
          min-width: 0;
        }

        .card,
        .lessonOverview,
        .chatPanel,
        .modeCard {
          border: 1px solid rgba(148, 163, 184, 0.22);
          border-radius: 24px;
          background: rgba(15, 23, 42, 0.86);
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.32),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(14px);
          min-width: 0;
        }

        .card,
        .lessonOverview,
        .modeCard {
          padding: 18px;
        }

        .narrow {
          max-width: 460px;
          margin: 0 auto;
        }

        .entryCard,
        .lockedCard,
        .completedCard {
          margin-top: 10px;
        }

        .completedCard {
          border-color: rgba(34, 197, 94, 0.42);
          background: linear-gradient(135deg, rgba(22, 163, 74, 0.2), rgba(15, 23, 42, 0.92));
        }

        .lockedStatus {
          color: #ffffff;
          margin-bottom: 0;
          line-height: 1.5;
        }

        .lessonOverview {
          background:
            linear-gradient(135deg, rgba(37, 99, 235, 0.22), rgba(15, 23, 42, 0.92)),
            rgba(15, 23, 42, 0.9);
        }

        .overviewHeader,
        .cardHeader,
        .modeHeader,
        .subHeader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .paidBadge,
        .modePill,
        .countBadge,
        .timerPill,
        .timerDone {
          flex: 0 0 auto;
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 900;
        }

        .paidBadge {
          background: rgba(34, 197, 94, 0.18);
          color: #bbf7d0;
          border: 1px solid rgba(34, 197, 94, 0.4);
        }

        .timerPill {
          background: rgba(96, 165, 250, 0.16);
          color: #bfdbfe;
          border: 1px solid rgba(96, 165, 250, 0.32);
        }

        .timerDone {
          background: rgba(245, 158, 11, 0.18);
          color: #fde68a;
          border: 1px solid rgba(245, 158, 11, 0.38);
        }

        .chatPill {
          background: rgba(96, 165, 250, 0.16);
          color: #bfdbfe;
          border: 1px solid rgba(96, 165, 250, 0.32);
        }

        .countBadge {
          background: rgba(15, 23, 42, 0.9);
          color: #e2e8f0;
          border: 1px solid rgba(148, 163, 184, 0.28);
        }

        .infoGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin-top: 16px;
        }

        .infoItem {
          border: 1px solid rgba(148, 163, 184, 0.22);
          background: rgba(2, 6, 23, 0.66);
          border-radius: 18px;
          padding: 13px;
          min-width: 0;
        }

        .infoLabel {
          margin: 0 0 6px;
          color: #bfdbfe;
          font-size: 12px;
          font-weight: 900;
        }

        .infoValue {
          margin: 0;
          color: #ffffff;
          font-size: 14px;
          line-height: 1.45;
          word-break: break-word;
        }

        .timerCard {
          background:
            linear-gradient(135deg, rgba(20, 184, 166, 0.14), rgba(15, 23, 42, 0.92));
        }

        .timerDisplay {
          margin: 18px 0;
          font-size: clamp(46px, 16vw, 78px);
          line-height: 1;
          font-weight: 900;
          letter-spacing: -0.06em;
          color: #ffffff;
          text-align: center;
        }

        .timerButtons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 10px;
          margin-bottom: 12px;
        }

        .completeBtn {
          width: 100%;
          border: none;
          border-radius: 16px;
          padding: 15px 16px;
          color: #ffffff;
          font-weight: 900;
          font-size: 15px;
          cursor: pointer;
          min-height: 52px;
          background: linear-gradient(135deg, #f97316, #dc2626);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22);
        }

        .teacherOnlyNote {
          margin: 0;
          color: #fde68a;
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: 16px;
          padding: 14px;
          font-weight: 800;
          line-height: 1.45;
        }

        .flowCard {
          background:
            linear-gradient(135deg, rgba(99, 102, 241, 0.13), rgba(15, 23, 42, 0.92));
        }

        .flowList {
          display: grid;
          gap: 10px;
          margin-top: 16px;
        }

        .flowItem {
          display: grid;
          grid-template-columns: 38px 1fr;
          gap: 11px;
          align-items: start;
          padding: 10px;
          border-radius: 18px;
          background: rgba(2, 6, 23, 0.45);
          border: 1px solid rgba(148, 163, 184, 0.14);
        }

        .flowNumber {
          width: 38px;
          height: 38px;
          border-radius: 14px;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: #ffffff;
          display: grid;
          place-items: center;
          font-weight: 900;
        }

        .flowTitle {
          margin: 0;
          color: #ffffff;
          font-weight: 900;
        }

        .flowText {
          margin: 3px 0 0;
          color: #e2e8f0;
          font-size: 14px;
          line-height: 1.45;
        }

        .chatPanel {
          overflow: hidden;
          background:
            linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(15, 23, 42, 0.92));
        }

        .chatPanel > .cardHeader {
          padding: 18px 18px 0;
        }

        .messagesBox {
          height: 48vh;
          min-height: 330px;
          overflow-y: auto;
          border: 1px solid rgba(148, 163, 184, 0.22);
          background: rgba(2, 6, 23, 0.7);
          border-radius: 20px;
          padding: 13px 13px 90px;
          margin: 16px 18px 0;
          scroll-behavior: smooth;
        }

        .emptyText {
          color: #cbd5e1;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }

        .bubble {
          max-width: 92%;
          border-radius: 18px;
          padding: 11px 13px;
          margin-bottom: 11px;
          word-break: break-word;
        }

        .studentBubble {
          background: rgba(30, 41, 59, 0.96);
          border: 1px solid rgba(148, 163, 184, 0.22);
        }

        .teacherBubble {
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          border: 1px solid rgba(147, 197, 253, 0.35);
          margin-left: auto;
        }

        .sender {
          margin: 0 0 4px;
          color: #dbeafe;
          font-size: 12px;
          font-weight: 900;
        }

        .bubbleText {
          margin: 0;
          color: #ffffff;
          font-size: 15px;
          line-height: 1.45;
        }

        .composer {
          position: sticky;
          bottom: 0;
          padding: 14px 18px 18px;
          background: rgba(15, 23, 42, 0.98);
          border-top: 1px solid rgba(148, 163, 184, 0.16);
          margin-top: 12px;
        }

        .input,
        .textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #64748b;
          border-radius: 16px;
          background: #ffffff;
          color: #0f172a;
          padding: 14px;
          font-size: 16px;
          outline: none;
          margin-top: 10px;
        }

        .input::placeholder,
        .textarea::placeholder {
          color: #64748b;
        }

        .textarea {
          min-height: 98px;
          resize: vertical;
          margin-top: 0;
          margin-bottom: 10px;
        }

        .modeCard {
          position: relative;
          overflow: hidden;
        }

        .liveMode {
          background:
            linear-gradient(135deg, rgba(22, 163, 74, 0.18), rgba(15, 23, 42, 0.92));
        }

        .voiceMode {
          background:
            linear-gradient(135deg, rgba(168, 85, 247, 0.18), rgba(15, 23, 42, 0.92));
        }

        .fileMode {
          background:
            linear-gradient(135deg, rgba(245, 158, 11, 0.16), rgba(15, 23, 42, 0.92));
        }

        .modeHeader {
          justify-content: flex-start;
          align-items: center;
        }

        .modeIcon {
          width: 46px;
          height: 46px;
          flex: 0 0 auto;
          border-radius: 18px;
          display: grid;
          place-items: center;
          color: #ffffff;
          font-size: 22px;
          font-weight: 900;
        }

        .liveIcon {
          background: linear-gradient(135deg, #16a34a, #22c55e);
        }

        .voiceIcon {
          background: linear-gradient(135deg, #7c3aed, #a855f7);
        }

        .fileIcon {
          background: linear-gradient(135deg, #d97706, #f59e0b);
        }

        .modeText {
          color: #e2e8f0;
          font-size: 14px;
          line-height: 1.5;
          margin: 14px 0;
        }

        .statusBox {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          background: rgba(2, 6, 23, 0.44);
          border-radius: 18px;
          padding: 12px;
          margin: 12px 0;
        }

        .statusDot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #94a3b8;
          margin-top: 5px;
          flex: 0 0 auto;
        }

        .activeDot {
          background: #22c55e;
          box-shadow: 0 0 14px rgba(34, 197, 94, 0.9);
        }

        .recordingDot {
          background: #ef4444;
          box-shadow: 0 0 14px rgba(239, 68, 68, 0.9);
        }

        .muted {
          color: #e2e8f0;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }

        .greenText {
          color: #86efac;
          font-size: 14px;
          line-height: 1.5;
          font-weight: 800;
          margin: 0;
        }

        .recordingText {
          color: #fecaca;
          font-size: 14px;
          line-height: 1.5;
          font-weight: 800;
          margin: 0;
        }

        .audioPlayer {
          width: 100%;
          margin: 2px 0 12px;
        }

        .primaryBtn,
        .secondaryBtn,
        .successBtn,
        .dangerBtn,
        .voiceBtn {
          width: 100%;
          border: none;
          border-radius: 16px;
          padding: 14px 16px;
          color: #ffffff;
          font-weight: 900;
          font-size: 15px;
          cursor: pointer;
          min-height: 50px;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22);
        }

        .primaryBtn {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
        }

        .secondaryBtn {
          background: linear-gradient(135deg, #475569, #334155);
        }

        .successBtn {
          background: linear-gradient(135deg, #16a34a, #15803d);
        }

        .dangerBtn {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
        }

        .voiceBtn {
          background: linear-gradient(135deg, #7c3aed, #9333ea);
        }

        button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .uploadBox {
          display: grid;
          gap: 5px;
          border: 1px dashed rgba(251, 191, 36, 0.8);
          border-radius: 20px;
          background: rgba(2, 6, 23, 0.48);
          padding: 20px;
          text-align: center;
          cursor: pointer;
          color: #ffffff;
          font-weight: 900;
          margin: 14px 0;
        }

        .uploadBox small {
          color: #fde68a;
          font-size: 12px;
          font-weight: 700;
        }

        .subSection {
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid rgba(148, 163, 184, 0.18);
        }

        .listStack {
          display: grid;
          gap: 10px;
          margin-top: 12px;
        }

        .miniCard {
          border: 1px solid rgba(148, 163, 184, 0.22);
          background: rgba(2, 6, 23, 0.54);
          border-radius: 18px;
          padding: 13px;
          min-width: 0;
        }

        .fileMiniCard {
          border-color: rgba(251, 191, 36, 0.24);
        }

        .fileName {
          margin: 0;
          color: #ffffff;
          font-weight: 900;
          word-break: break-word;
          line-height: 1.35;
        }

        .smallMuted {
          margin: 6px 0 10px;
          color: #cbd5e1;
          font-size: 13px;
        }

        @media (min-width: 720px) {
          .examia-page {
            padding: 24px;
          }

          .hero {
            grid-template-columns: 1fr auto;
            align-items: start;
          }

          .infoGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .messagesBox {
            height: 54vh;
          }
        }

        @media (min-width: 980px) {
          .roomGrid {
            grid-template-columns: minmax(0, 1.65fr) minmax(340px, 0.9fr);
          }

          .sideColumn {
            position: sticky;
            top: 18px;
          }

          .composer {
            position: static;
          }
        }
      `}</style>
    </main>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="infoItem">
      <p className="infoLabel">{label}</p>
      <p className="infoValue">{value}</p>
    </div>
  )
}

function Flow({
  number,
  title,
  text,
}: {
  number: string
  title: string
  text: string
}) {
  return (
    <div className="flowItem">
      <div className="flowNumber">{number}</div>
      <div>
        <p className="flowTitle">{title}</p>
        <p className="flowText">{text}</p>
      </div>
    </div>
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
    <div className="miniCard">
      <p className="fileName">{audio.audio_name}</p>
      <p className="smallMuted">{formatFileSize(audio.audio_size)}</p>

      {audioUrl ? (
        <audio controls src={audioUrl} style={{ width: '100%' }} />
      ) : (
        <p className="smallMuted">Preparing audio...</p>
      )}
    </div>
  )
}