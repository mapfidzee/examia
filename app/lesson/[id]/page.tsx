'use client'

import { use, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type PageProps = {
  params: Promise<{ id: string }>
}

type LessonStatus =
  | 'NEW'
  | 'MATCHED'
  | 'PAID'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED'
  | string

type LessonRequest = {
  id: string
  subject: string
  subject_other?: string | null
  grade_level?: string | null
  problem: string
  preferred_time: string
  scheduled_time: string | null
  status: LessonStatus
  assigned_teacher: string | null
  student_name?: string | null
  created_at?: string
  started_at?: string | null
  completed_at?: string | null
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
  call_id: string
  signal_type: 'offer' | 'answer' | 'candidate' | 'end'
  sender_name: string
  sender_role: string
  payload: any
  created_at: string
}

type PresenceUser = {
  name: string
  role: string
  online_at: string
}

const BUCKET_FILES = 'lesson-files'
const BUCKET_AUDIO = 'lesson-audio'

export default function LessonRoomPage({ params }: PageProps) {
  const { id } = use(params)

  const [lesson, setLesson] = useState<LessonRequest | null>(null)
  const [messages, setMessages] = useState<LessonMessage[]>([])
  const [files, setFiles] = useState<LessonFile[]>([])
  const [audioNotes, setAudioNotes] = useState<LessonAudioNote[]>([])
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([])

  const [name, setName] = useState('')
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student')
  const [entered, setEntered] = useState(false)

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [systemNote, setSystemNote] = useState('')

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)

  const [recording, setRecording] = useState(false)
  const [uploadingAudio, setUploadingAudio] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const [callActive, setCallActive] = useState(false)
  const [callStatus, setCallStatus] = useState('Not connected')
  const [muted, setMuted] = useState(false)

  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null)
  const peerRef = useRef<RTCPeerConnection | null>(null)
  const callIdRef = useRef<string>('')

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const lessonStatus = lesson?.status || 'NEW'

  const isPaid = lessonStatus === 'PAID'
  const isActive = lessonStatus === 'ACTIVE'
  const isCompleted = lessonStatus === 'COMPLETED'
  const isCancelled = lessonStatus === 'CANCELLED'
  const isFailed = lessonStatus === 'FAILED'
  const isLocked = isCompleted || isCancelled || isFailed

  const canEnterRoom = lessonStatus === 'PAID' || lessonStatus === 'ACTIVE' || isLocked
  const canChat = entered && (isPaid || isActive) && !isLocked
  const canUseLiveTools = entered && isActive && !isLocked

  const sessionLabel = useMemo(() => {
    if (isPaid) return 'Waiting / Preparation'
    if (isActive) return 'Live Session Active'
    if (isCompleted) return 'Completed'
    if (isCancelled) return 'Cancelled'
    if (isFailed) return 'Failed'
    return 'Locked Until Paid'
  }, [isPaid, isActive, isCompleted, isCancelled, isFailed])

  const displaySubject = useMemo(() => {
    if (!lesson) return ''
    if (lesson.subject === 'Other' && lesson.subject_other) return lesson.subject_other
    return lesson.subject
  }, [lesson])

  useEffect(() => {
    loadRoom()
  }, [id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!entered || !name) return

    const presenceChannel = supabase.channel(`presence-lesson-${id}`, {
      config: {
        presence: {
          key: `${role}-${name}`,
        },
      },
    })

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()

        const users = Object.values(state)
          .flat()
          .map((entry: any) => ({
            name: entry.name,
            role: entry.role,
            online_at: entry.online_at,
          }))

        setPresenceUsers(users)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            name,
            role,
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      presenceChannel.unsubscribe()
    }
  }, [entered, name, role, id])

  useEffect(() => {
    if (!entered) return

    const roomChannel = supabase
      .channel(`lesson-room-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lesson_messages',
          filter: `lesson_request_id=eq.${id}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as LessonMessage])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lesson_files',
          filter: `lesson_id=eq.${id}`,
        },
        (payload) => {
          setFiles((current) => [payload.new as LessonFile, ...current])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lesson_audio_notes',
          filter: `lesson_id=eq.${id}`,
        },
        (payload) => {
          setAudioNotes((current) => [payload.new as LessonAudioNote, ...current])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'lesson_requests',
          filter: `id=eq.${id}`,
        },
        async (payload) => {
          const updatedLesson = payload.new as LessonRequest
          setLesson(updatedLesson)

          if (
            updatedLesson.status === 'COMPLETED' ||
            updatedLesson.status === 'CANCELLED' ||
            updatedLesson.status === 'FAILED' ||
            updatedLesson.status === 'PAID'
          ) {
            await endLiveAudio(false)
          }
        }
      )
      .subscribe()

    const signalChannel = supabase
      .channel(`lesson-audio-signals-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lesson_audio_signals',
          filter: `lesson_id=eq.${id}`,
        },
        async (payload) => {
          await handleIncomingSignal(payload.new as LessonAudioSignal)
        }
      )
      .subscribe()

    return () => {
      roomChannel.unsubscribe()
      signalChannel.unsubscribe()
    }
  }, [entered, id, name, role])

  async function loadRoom() {
    setLoading(true)
    setSystemNote('')

    const { data: lessonData, error: lessonError } = await supabase
      .from('lesson_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (lessonError) {
      setSystemNote('Lesson not found or could not be loaded.')
      setLoading(false)
      return
    }

    setLesson(lessonData)

    const { data: messageData } = await supabase
      .from('lesson_messages')
      .select('*')
      .eq('lesson_request_id', id)
      .order('created_at', { ascending: true })

    const { data: fileData } = await supabase
      .from('lesson_files')
      .select('*')
      .eq('lesson_id', id)
      .order('created_at', { ascending: false })

    const { data: audioData } = await supabase
      .from('lesson_audio_notes')
      .select('*')
      .eq('lesson_id', id)
      .order('created_at', { ascending: false })

    setMessages(messageData || [])
    setFiles(fileData || [])
    setAudioNotes(audioData || [])
    setLoading(false)
  }

  function enterRoom() {
    if (!name.trim()) {
      setSystemNote('Please enter your name before joining the lesson room.')
      return
    }

    setEntered(true)
    setSystemNote('')
  }

  async function sendMessage() {
    if (!message.trim() || !canChat) return

    const text = message.trim()
    setMessage('')

    const { error } = await supabase.from('lesson_messages').insert({
      lesson_request_id: id,
      sender: `${name} (${role})`,
      message: text,
    })

    if (error) {
      setSystemNote('Message could not be sent.')
      setMessage(text)
    }
  }

  async function uploadFile() {
    if (!selectedFile || !canUseLiveTools) return

    if (selectedFile.size > 10 * 1024 * 1024) {
      setSystemNote('File too large. Maximum file size is 10MB.')
      return
    }

    setUploadingFile(true)
    setSystemNote('')

    const safeName = selectedFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
    const path = `${id}/${Date.now()}-${safeName}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_FILES)
      .upload(path, selectedFile)

    if (uploadError) {
      setSystemNote('File upload failed.')
      setUploadingFile(false)
      return
    }

    const { error: insertError } = await supabase.from('lesson_files').insert({
      lesson_id: id,
      file_name: selectedFile.name,
      file_path: path,
      file_size: selectedFile.size,
      file_type: selectedFile.type || 'unknown',
      uploaded_by_name: name,
      uploaded_by_role: role,
    })

    if (insertError) {
      setSystemNote('File uploaded, but record could not be saved.')
    }

    setSelectedFile(null)
    setUploadingFile(false)
  }

  async function downloadFile(file: LessonFile) {
    const { data, error } = await supabase.storage
      .from(BUCKET_FILES)
      .createSignedUrl(file.file_path, 60)

    if (error || !data?.signedUrl) {
      setSystemNote('Could not create download link.')
      return
    }

    window.open(data.signedUrl, '_blank')
  }

  async function startRecording() {
    if (!canUseLiveTools) return

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
        stream.getTracks().forEach((track) => track.stop())
        await uploadRecordedAudio()
      }

      recorder.start()
      setRecording(true)
      setSystemNote('Recording started.')
    } catch {
      setSystemNote('Microphone permission was denied or unavailable.')
    }
  }

  function stopRecording() {
    if (!mediaRecorderRef.current) return

    mediaRecorderRef.current.stop()
    setRecording(false)
    setSystemNote('Recording stopped. Uploading audio note...')
  }

  async function uploadRecordedAudio() {
    setUploadingAudio(true)

    const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })

    if (blob.size > 5 * 1024 * 1024) {
      setSystemNote('Audio note is too large. Keep voice notes short for low-data learning.')
      setUploadingAudio(false)
      return
    }

    const fileName = `audio-note-${Date.now()}.webm`
    const path = `${id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_AUDIO)
      .upload(path, blob, {
        contentType: 'audio/webm',
      })

    if (uploadError) {
      setSystemNote('Audio upload failed.')
      setUploadingAudio(false)
      return
    }

    const { error: insertError } = await supabase.from('lesson_audio_notes').insert({
      lesson_id: id,
      audio_name: fileName,
      audio_path: path,
      audio_size: blob.size,
      uploaded_by_name: name,
      uploaded_by_role: role,
    })

    if (insertError) {
      setSystemNote('Audio uploaded, but record could not be saved.')
    } else {
      setSystemNote('Audio note uploaded.')
    }

    setUploadingAudio(false)
  }

  async function playAudio(note: LessonAudioNote) {
    const { data, error } = await supabase.storage
      .from(BUCKET_AUDIO)
      .createSignedUrl(note.audio_path, 60)

    if (error || !data?.signedUrl) {
      setSystemNote('Could not open audio note.')
      return
    }

    const audio = new Audio(data.signedUrl)
    audio.play()
  }

  function createPeerConnection() {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })

    peer.onicecandidate = async (event) => {
      if (event.candidate && callIdRef.current) {
        await sendSignal('candidate', event.candidate)
      }
    }

    peer.ontrack = (event) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0]
      }
    }

    peer.onconnectionstatechange = () => {
      setCallStatus(peer.connectionState)
    }

    peerRef.current = peer
    return peer
  }

  async function startLiveAudio() {
    if (!canUseLiveTools) return

    try {
      callIdRef.current = `${id}-${Date.now()}`

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      localStreamRef.current = stream

      const peer = createPeerConnection()

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream)
      })

      const offer = await peer.createOffer()
      await peer.setLocalDescription(offer)
      await sendSignal('offer', offer)

      setCallActive(true)
      setCallStatus('Calling...')
    } catch {
      setSystemNote('Could not start live audio. Check microphone permissions.')
    }
  }

  async function handleIncomingSignal(signal: LessonAudioSignal) {
    if (!entered) return
    if (!isActive) return
    if (signal.sender_name === name && signal.sender_role === role) return
    if (signal.lesson_id !== id) return

    if (!callIdRef.current) {
      callIdRef.current = signal.call_id
    }

    if (signal.signal_type === 'offer') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        localStreamRef.current = stream

        const peer = createPeerConnection()

        stream.getTracks().forEach((track) => {
          peer.addTrack(track, stream)
        })

        await peer.setRemoteDescription(new RTCSessionDescription(signal.payload))

        const answer = await peer.createAnswer()
        await peer.setLocalDescription(answer)
        await sendSignal('answer', answer)

        setCallActive(true)
        setCallStatus('Connected')
      } catch {
        setSystemNote('Incoming audio call could not be answered.')
      }
    }

    if (signal.signal_type === 'answer' && peerRef.current) {
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(signal.payload))
      setCallStatus('Connected')
    }

    if (signal.signal_type === 'candidate' && peerRef.current) {
      try {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(signal.payload))
      } catch {
        // Candidate can safely fail during early negotiation.
      }
    }

    if (signal.signal_type === 'end') {
      endLiveAudio(false)
    }
  }

  async function sendSignal(signalType: LessonAudioSignal['signal_type'], payload: any) {
    await supabase.from('lesson_audio_signals').insert({
      lesson_id: id,
      call_id: callIdRef.current || `${id}-${Date.now()}`,
      signal_type: signalType,
      sender_name: name,
      sender_role: role,
      payload,
    })
  }

  async function endLiveAudio(sendEndSignal = true) {
    if (sendEndSignal && callIdRef.current) {
      await sendSignal('end', { ended: true })
    }

    localStreamRef.current?.getTracks().forEach((track) => track.stop())
    localStreamRef.current = null

    peerRef.current?.close()
    peerRef.current = null

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null
    }

    callIdRef.current = ''
    setCallActive(false)
    setCallStatus('Not connected')
    setMuted(false)
  }

  function toggleMute() {
    const stream = localStreamRef.current
    if (!stream) return

    stream.getAudioTracks().forEach((track) => {
      track.enabled = muted
    })

    setMuted(!muted)
  }

  async function markLessonStarted() {
    if (!lesson || busy || isLocked) return

    setBusy(true)

    const { error } = await supabase
      .from('lesson_requests')
      .update({
        status: 'ACTIVE',
        started_at: lesson.started_at || new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      setSystemNote('Could not start lesson.')
    } else {
      setSystemNote('Lesson is now ACTIVE. Live teaching tools are enabled.')
    }

    setBusy(false)
  }

  async function completeLesson() {
    if (!lesson || busy || isLocked) return

    setBusy(true)

    const { error } = await supabase
      .from('lesson_requests')
      .update({
        status: 'COMPLETED',
        started_at: lesson.started_at || new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      setSystemNote('Could not complete lesson.')
    } else {
      await endLiveAudio(false)
      setSystemNote('Lesson completed. The room is now closed.')
    }

    setBusy(false)
  }

  function formatDate(value?: string | null, fallback = 'Not set') {
    if (!value) return fallback

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return fallback
    }

    return date.toLocaleString()
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
          <p className="text-sm text-slate-300">Loading controlled lesson space...</p>
        </div>
      </main>
    )
  }

  if (!lesson) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md rounded-3xl border border-red-400/20 bg-red-500/10 p-8 shadow-2xl">
          <h1 className="text-2xl font-bold">Lesson not found</h1>
          <p className="mt-3 text-sm text-red-100">{systemNote}</p>
        </div>
      </main>
    )
  }

  if (!entered) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-4 sm:p-6">
        <section className="mx-auto max-w-3xl pt-10">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 sm:p-8 shadow-2xl backdrop-blur">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                EXAMIA Controlled Lesson Space
              </p>

              <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
                Join Lesson Room
              </h1>

              <p className="mt-3 text-slate-300">
                Enter your name and role to open the guided learning room.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <p className="text-xs text-slate-400">Subject</p>
                <p className="mt-1 font-semibold">{displaySubject}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <p className="text-xs text-slate-400">Level</p>
                <p className="mt-1 font-semibold">{lesson.grade_level || 'Not provided'}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <p className="text-xs text-slate-400">Status</p>
                <p className="mt-1 font-semibold">{lesson.status}</p>
              </div>
            </div>

            {!canEnterRoom && (
              <div className="mt-5 rounded-2xl border border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100">
                This room is not open yet. The lesson must be marked PAID or ACTIVE before normal entry.
              </div>
            )}

            <div className="mt-6 space-y-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300"
              />

              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'student' | 'teacher' | 'admin')}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>

              {systemNote && (
                <p className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-3 text-sm text-amber-100">
                  {systemNote}
                </p>
              )}

              <button
                onClick={enterRoom}
                disabled={!canEnterRoom}
                className="w-full rounded-2xl bg-cyan-300 px-5 py-3 font-bold text-slate-950 shadow-lg shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Enter Lesson Room
              </button>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <audio ref={remoteAudioRef} autoPlay />

      <section className="mx-auto max-w-7xl p-4 sm:p-6">
        <header className="mb-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-5 sm:p-7 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                EXAMIA Controlled Lesson Space
              </p>

              <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
                Lesson Room
              </h1>

              <p className="mt-3 max-w-3xl text-slate-300">
                A governed learning room for preparation, live teaching, files,
                voice explanations, audio support, and locked lesson completion.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
                {lesson.status}
              </span>

              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-100">
                {sessionLabel}
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                {presenceUsers.length} online
              </span>
            </div>
          </div>

          {systemNote && (
            <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              {systemNote}
            </div>
          )}
        </header>

        {isPaid && (
          <div className="mb-6 rounded-[2rem] border border-blue-300/20 bg-blue-400/10 p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-blue-100">Waiting / Preparation Mode</h2>
            <p className="mt-2 text-blue-50">
              Chat and presence are available. Live audio, uploads, and voice recording unlock only when the lesson becomes ACTIVE.
            </p>
          </div>
        )}

        {isActive && (
          <div className="mb-6 rounded-[2rem] border border-emerald-300/20 bg-emerald-400/10 p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-emerald-100">Live Session Active</h2>
            <p className="mt-2 text-emerald-50">
              The session is active. Live audio, files, and voice notes are enabled.
            </p>
          </div>
        )}

        {isLocked && (
          <div className="mb-6 rounded-[2rem] border border-red-300/20 bg-red-500/10 p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-red-100">Lesson {lesson.status}</h2>
            <p className="mt-2 text-red-50">
              This lesson is closed for normal activity. History remains visible, but live tools are locked.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <p className="rounded-2xl bg-slate-950/40 p-3 text-sm">
                Started at: {formatDate(lesson.started_at)}
              </p>

              <p className="rounded-2xl bg-slate-950/40 p-3 text-sm">
                Completed at: {formatDate(lesson.completed_at)}
              </p>
            </div>
          </div>
        )}

        {!canEnterRoom && (
          <div className="mb-6 rounded-[2rem] border border-red-300/20 bg-red-500/10 p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-red-100">Room Locked</h2>
            <p className="mt-2 text-red-50">
              This lesson room opens only when the lesson is PAID or ACTIVE.
            </p>
          </div>
        )}

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Panel title="Subject" value={displaySubject} note={lesson.grade_level || 'Level not provided'} />
          <Panel title="Teacher" value={lesson.assigned_teacher || 'Not assigned'} note="Assigned learning support" />
          <Panel title="Preferred Time" value={lesson.preferred_time || 'Not provided'} note="Student requested time" />
          <Panel title="Scheduled Time" value={formatDate(lesson.scheduled_time, 'Not scheduled')} note="Confirmed lesson time" />
        </section>

        <section className="mb-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl">
            <div className="mb-4">
              <h2 className="text-xl font-bold">Learning Problem</h2>
              <p className="text-sm text-slate-400">The core issue this lesson is solving.</p>
            </div>

            <p className="rounded-2xl bg-slate-950/60 p-4 text-slate-100 leading-relaxed">
              {lesson.problem}
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl">
            <h2 className="text-xl font-bold">Live Presence</h2>
            <p className="mt-1 text-sm text-slate-400">Who is currently inside the room.</p>

            <div className="mt-4 space-y-3">
              {presenceUsers.length === 0 ? (
                <p className="rounded-2xl bg-slate-950/60 p-4 text-sm text-slate-400">
                  No active users detected.
                </p>
              ) : (
                presenceUsers.map((user, index) => (
                  <div
                    key={`${user.name}-${user.role}-${index}`}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-3"
                  >
                    <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/40" />

                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs uppercase tracking-wide text-slate-400">{user.role}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl">
            <h2 className="text-xl font-bold">Lesson Control</h2>
            <p className="mt-1 text-sm text-slate-400">Start, monitor, and close the session.</p>

            <div className="mt-4 space-y-3">
              <button
                onClick={markLessonStarted}
                disabled={busy || isLocked || isActive}
                className="w-full rounded-2xl bg-emerald-300 px-4 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Mark Lesson Active
              </button>

              <button
                onClick={completeLesson}
                disabled={busy || isLocked}
                className="w-full rounded-2xl bg-rose-300 px-4 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Complete Lesson
              </button>

              <div className="rounded-2xl bg-slate-950/60 p-4 text-sm text-slate-300">
                <p>Started: {formatDate(lesson.started_at)}</p>
                <p className="mt-1">Completed: {formatDate(lesson.completed_at)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl">
            <h2 className="text-xl font-bold">Live Audio</h2>
            <p className="mt-1 text-sm text-slate-400">Low-data real-time voice support.</p>

            <div className="mt-4 rounded-2xl bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Connection</p>
              <p className="mt-1 text-lg font-bold">{callStatus}</p>
            </div>

            <div className="mt-4 grid gap-3">
              {!callActive ? (
                <button
                  onClick={startLiveAudio}
                  disabled={!canUseLiveTools}
                  className="rounded-2xl bg-cyan-300 px-4 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Start Live Audio
                </button>
              ) : (
                <>
                  <button
                    onClick={toggleMute}
                    className="rounded-2xl bg-white px-4 py-3 font-bold text-slate-950"
                  >
                    {muted ? 'Unmute' : 'Mute'}
                  </button>

                  <button
                    onClick={() => endLiveAudio(true)}
                    className="rounded-2xl bg-rose-300 px-4 py-3 font-bold text-slate-950"
                  >
                    End Live Audio
                  </button>
                </>
              )}

              {!canUseLiveTools && (
                <p className="rounded-2xl bg-slate-950/60 p-4 text-sm text-slate-400">
                  Live audio unlocks when the lesson status is ACTIVE.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl">
            <h2 className="text-xl font-bold">Voice Notes</h2>
            <p className="mt-1 text-sm text-slate-400">Record short explanations for replay.</p>

            <div className="mt-4 grid gap-3">
              {!recording ? (
                <button
                  onClick={startRecording}
                  disabled={!canUseLiveTools || uploadingAudio}
                  className="rounded-2xl bg-violet-300 px-4 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Record Voice Note
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="rounded-2xl bg-amber-300 px-4 py-3 font-bold text-slate-950"
                >
                  Stop Recording
                </button>
              )}

              <p className="rounded-2xl bg-slate-950/60 p-4 text-sm text-slate-300">
                {uploadingAudio
                  ? 'Uploading audio note...'
                  : recording
                    ? 'Recording now...'
                    : canUseLiveTools
                      ? 'Ready for short audio explanations.'
                      : 'Voice notes unlock when the lesson is ACTIVE.'}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl">
            <div className="mb-4">
              <h2 className="text-xl font-bold">Lesson Chat</h2>
              <p className="text-sm text-slate-400">
                Shared conversation between student, teacher, and admin.
              </p>
            </div>

            <div className="h-[430px] overflow-y-auto rounded-2xl bg-slate-950/70 p-4">
              {messages.length === 0 ? (
                <p className="text-sm text-slate-400">No messages yet.</p>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.05] p-3"
                    >
                      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-cyan-100">{msg.sender}</p>
                        <p className="text-xs text-slate-500">{formatDate(msg.created_at)}</p>
                      </div>

                      <p className="text-slate-100">{msg.message}</p>
                    </div>
                  ))}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage()
                }}
                disabled={!canChat}
                placeholder={canChat ? 'Type your message...' : 'Chat is locked'}
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300 disabled:opacity-50"
              />

              <button
                onClick={sendMessage}
                disabled={!canChat || !message.trim()}
                className="rounded-2xl bg-cyan-300 px-6 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl">
              <h2 className="text-xl font-bold">Files</h2>
              <p className="mt-1 text-sm text-slate-400">Upload and download learning materials.</p>

              <div className="mt-4 space-y-3">
                <input
                  type="file"
                  disabled={!canUseLiveTools}
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 p-3 text-sm text-slate-200 disabled:opacity-50"
                />

                <button
                  onClick={uploadFile}
                  disabled={!canUseLiveTools || !selectedFile || uploadingFile}
                  className="w-full rounded-2xl bg-cyan-300 px-4 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {uploadingFile ? 'Uploading...' : 'Upload File'}
                </button>

                {!canUseLiveTools && (
                  <p className="rounded-2xl bg-slate-950/60 p-4 text-sm text-slate-400">
                    File upload unlocks when the lesson is ACTIVE.
                  </p>
                )}
              </div>

              <div className="mt-5 space-y-3">
                {files.length === 0 ? (
                  <p className="rounded-2xl bg-slate-950/60 p-4 text-sm text-slate-400">
                    No files uploaded yet.
                  </p>
                ) : (
                  files.map((file) => (
                    <div
                      key={file.id}
                      className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                    >
                      <p className="font-semibold">{file.file_name}</p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatSize(file.file_size)} · {file.uploaded_by_name} ({file.uploaded_by_role})
                      </p>

                      <button
                        onClick={() => downloadFile(file)}
                        className="mt-3 rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-950"
                      >
                        Download
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl">
              <h2 className="text-xl font-bold">Audio Notes</h2>
              <p className="mt-1 text-sm text-slate-400">Replay recorded explanations.</p>

              <div className="mt-5 space-y-3">
                {audioNotes.length === 0 ? (
                  <p className="rounded-2xl bg-slate-950/60 p-4 text-sm text-slate-400">
                    No audio notes yet.
                  </p>
                ) : (
                  audioNotes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                    >
                      <p className="font-semibold">{note.audio_name}</p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatSize(note.audio_size)} · {note.uploaded_by_name} ({note.uploaded_by_role})
                      </p>

                      <button
                        onClick={() => playAudio(note)}
                        className="mt-3 rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-950"
                      >
                        Play
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}

function Panel({
  title,
  value,
  note,
}: {
  title: string
  value: string
  note: string
}) {
  return (
    <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.05] p-5 shadow-xl backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {title}
      </p>

      <p className="mt-3 text-lg font-bold text-white break-words">
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-400">
        {note}
      </p>
    </div>
  )
}