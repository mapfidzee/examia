'use client'

import { use, useEffect, useRef, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type PageProps = {
  params: Promise<{ id: string }>
}

type LessonRequest = {
  id: string
  subject: string
  level: string | null
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
  call_id: string
  sender_name: string
  sender_role: string
  signal_type:
    | 'offer'
    | 'answer'
    | 'candidate'
    | 'decline'
    | 'end'
    | 'restart-offer'
    | 'restart-answer'
  payload: any
  created_at: string
}

type CallState =
  | 'idle'
  | 'calling'
  | 'incoming'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'declined'
  | 'ended'
  | 'failed'

export default function LessonRoomPage({ params }: PageProps) {
  const { id } = use(params)

  const [lesson, setLesson] = useState<LessonRequest | null>(null)
  const [messages, setMessages] = useState<LessonMessage[]>([])
  const [files, setFiles] = useState<LessonFile[]>([])
  const [audioNotes, setAudioNotes] = useState<LessonAudioNote[]>([])
  const [onlineUsers, setOnlineUsers] = useState<any[]>([])

  const [name, setName] = useState('')
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student')
  const [entered, setEntered] = useState(false)

  const [message, setMessage] = useState('')
  const [uploadingFile, setUploadingFile] = useState(false)
  const [recording, setRecording] = useState(false)

  const [callState, setCallState] = useState<CallState>('idle')
  const [incomingCall, setIncomingCall] = useState<LessonAudioSignal | null>(null)
  const [currentCallId, setCurrentCallId] = useState<string | null>(null)
  const [remoteCaller, setRemoteCaller] = useState<string | null>(null)
  const [muted, setMuted] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const peerRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null)
  const processedSignalsRef = useRef<Set<string>>(new Set())
  const reconnectAttemptedRef = useRef(false)

  const isPaid = lesson?.status === 'PAID'
  const isActive = lesson?.status === 'ACTIVE'
  const isClosed =
    lesson?.status === 'COMPLETED' ||
    lesson?.status === 'CANCELLED' ||
    lesson?.status === 'FAILED'

  const liveToolsEnabled = isActive

  useEffect(() => {
    loadEverything()
  }, [id])

  async function loadEverything() {
    const { data: lessonData } = await supabase
      .from('lesson_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (lessonData) setLesson(lessonData)

    const { data: messageData } = await supabase
      .from('lesson_messages')
      .select('*')
      .eq('lesson_request_id', id)
      .order('created_at', { ascending: true })

    setMessages(messageData || [])

    const { data: fileData } = await supabase
      .from('lesson_files')
      .select('*')
      .eq('lesson_id', id)
      .order('created_at', { ascending: false })

    setFiles(fileData || [])

    const { data: audioData } = await supabase
      .from('lesson_audio_notes')
      .select('*')
      .eq('lesson_id', id)
      .order('created_at', { ascending: false })

    setAudioNotes(audioData || [])
  }

  useEffect(() => {
    if (!entered || !name) return

    const channel = supabase.channel(`lesson-room-${id}`, {
      config: {
        presence: { key: `${name}-${role}` },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setOnlineUsers(Object.values(state).flat())
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lesson_requests',
          filter: `id=eq.${id}`,
        },
        payload => setLesson(payload.new as LessonRequest)
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lesson_messages',
          filter: `lesson_request_id=eq.${id}`,
        },
        payload => setMessages(prev => [...prev, payload.new as LessonMessage])
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lesson_files',
          filter: `lesson_id=eq.${id}`,
        },
        payload => setFiles(prev => [payload.new as LessonFile, ...prev])
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lesson_audio_notes',
          filter: `lesson_id=eq.${id}`,
        },
        payload => setAudioNotes(prev => [payload.new as LessonAudioNote, ...prev])
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lesson_audio_signals',
          filter: `lesson_id=eq.${id}`,
        },
        async payload => {
          await handleAudioSignal(payload.new as LessonAudioSignal)
        }
      )
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            name,
            role,
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [entered, name, role, id, currentCallId, callState])

  async function enterRoom() {
    if (!name.trim()) return
    setEntered(true)
  }

  async function sendMessage() {
    if (!message.trim() || !name.trim() || isClosed) return

    await supabase.from('lesson_messages').insert({
      lesson_request_id: id,
      sender: `${name} (${role})`,
      message,
    })

    setMessage('')
  }

  async function markActive() {
    await supabase.from('lesson_requests').update({ status: 'ACTIVE' }).eq('id', id)
  }

  async function completeLesson() {
    await supabase.from('lesson_requests').update({ status: 'COMPLETED' }).eq('id', id)
    await endCall()
  }

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !name || isClosed) return

    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum size is 10MB.')
      return
    }

    setUploadingFile(true)

    const filePath = `${id}/${Date.now()}-${file.name}`

    const { error } = await supabase.storage.from('lesson-files').upload(filePath, file)

    if (!error) {
      await supabase.from('lesson_files').insert({
        lesson_id: id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        uploaded_by_name: name,
        uploaded_by_role: role,
      })
    }

    setUploadingFile(false)
    e.target.value = ''
  }

  async function downloadFile(file: LessonFile) {
    const { data, error } = await supabase.storage
      .from('lesson-files')
      .createSignedUrl(file.file_path, 60)

    if (!error && data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  async function startRecording() {
    if (isClosed) return

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)

    audioChunksRef.current = []

    recorder.ondataavailable = event => audioChunksRef.current.push(event.data)

    recorder.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })

      if (blob.size > 5 * 1024 * 1024) {
        alert('Audio note too large. Keep it short.')
        return
      }

      const audioName = `audio-note-${Date.now()}.webm`
      const audioPath = `${id}/${audioName}`

      const { error } = await supabase.storage
        .from('lesson-audio')
        .upload(audioPath, blob)

      if (!error) {
        await supabase.from('lesson_audio_notes').insert({
          lesson_id: id,
          audio_name: audioName,
          audio_path: audioPath,
          audio_size: blob.size,
          uploaded_by_name: name,
          uploaded_by_role: role,
        })
      }

      stream.getTracks().forEach(track => track.stop())
    }

    mediaRecorderRef.current = recorder
    recorder.start()
    setRecording(true)
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  async function playAudioNote(note: LessonAudioNote) {
    const { data, error } = await supabase.storage
      .from('lesson-audio')
      .createSignedUrl(note.audio_path, 60)

    if (!error && data?.signedUrl) {
      const audio = new Audio(data.signedUrl)
      audio.play()
    }
  }

  async function getLocalAudioStream() {
    if (localStreamRef.current) return localStreamRef.current

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    localStreamRef.current = stream
    return stream
  }

  async function addLocalTracks(peer: RTCPeerConnection) {
    const stream = await getLocalAudioStream()
    stream.getTracks().forEach(track => {
      peer.addTrack(track, stream)
    })
  }

  function createPeerConnection(callId: string) {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })

    peer.onicecandidate = async event => {
      if (event.candidate) {
        await insertSignal(callId, 'candidate', event.candidate)
      }
    }

    peer.ontrack = event => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0]
      }
      reconnectAttemptedRef.current = false
      setCallState('connected')
    }

    peer.oniceconnectionstatechange = async () => {
      const state = peer.iceConnectionState

      if (state === 'connected' || state === 'completed') {
        reconnectAttemptedRef.current = false
        setCallState('connected')
      }

      if (state === 'disconnected') {
        setCallState('reconnecting')

        if (!reconnectAttemptedRef.current && currentCallId) {
          reconnectAttemptedRef.current = true
          await restartIce(currentCallId)
        }
      }

      if (state === 'failed') {
        setCallState('failed')
      }

      if (state === 'closed') {
        setCallState('ended')
      }
    }

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'connected') {
        reconnectAttemptedRef.current = false
        setCallState('connected')
      }

      if (peer.connectionState === 'failed') {
        setCallState('failed')
      }

      if (peer.connectionState === 'disconnected') {
        setCallState('reconnecting')
      }

      if (peer.connectionState === 'closed') {
        setCallState('ended')
      }
    }

    peerRef.current = peer
    return peer
  }

  async function insertSignal(
    callId: string,
    signalType: LessonAudioSignal['signal_type'],
    payload: any
  ) {
    await supabase.from('lesson_audio_signals').insert({
      lesson_id: id,
      call_id: callId,
      sender_name: name,
      sender_role: role,
      signal_type: signalType,
      payload,
    })
  }

  async function startCall() {
    if (!liveToolsEnabled || !name) return

    const callId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`

    cleanupPeerOnly()

    setCurrentCallId(callId)
    setCallState('calling')
    reconnectAttemptedRef.current = false

    const peer = createPeerConnection(callId)
    await addLocalTracks(peer)

    const offer = await peer.createOffer()
    await peer.setLocalDescription(offer)

    await insertSignal(callId, 'offer', offer)
  }

  async function acceptCall() {
    if (!incomingCall) return

    cleanupPeerOnly()

    setCallState('connecting')
    setCurrentCallId(incomingCall.call_id)
    setRemoteCaller(incomingCall.sender_name)

    const peer = createPeerConnection(incomingCall.call_id)
    await addLocalTracks(peer)

    await peer.setRemoteDescription(new RTCSessionDescription(incomingCall.payload))

    const answer = await peer.createAnswer()
    await peer.setLocalDescription(answer)

    await insertSignal(incomingCall.call_id, 'answer', answer)

    setIncomingCall(null)
  }

  async function restartIce(callId: string) {
    if (!peerRef.current) return

    try {
      const offer = await peerRef.current.createOffer({ iceRestart: true })
      await peerRef.current.setLocalDescription(offer)
      await insertSignal(callId, 'restart-offer', offer)
    } catch {
      setCallState('failed')
    }
  }

  async function declineCall() {
    if (!incomingCall) return

    await insertSignal(incomingCall.call_id, 'decline', {
      reason: 'Call declined',
    })

    setIncomingCall(null)
    setCallState('idle')
  }

  async function endCall() {
    if (currentCallId) {
      await insertSignal(currentCallId, 'end', {
        reason: 'Call ended',
      })
    }

    cleanupCall()
    setCallState('ended')
  }

  function cleanupPeerOnly() {
    peerRef.current?.close()
    peerRef.current = null

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null
    }
  }

  function cleanupCall() {
    cleanupPeerOnly()

    localStreamRef.current?.getTracks().forEach(track => track.stop())
    localStreamRef.current = null

    setIncomingCall(null)
    setCurrentCallId(null)
    setRemoteCaller(null)
    reconnectAttemptedRef.current = false
  }

  function toggleMute() {
    const stream = localStreamRef.current
    if (!stream) return

    const nextMuted = !muted
    stream.getAudioTracks().forEach(track => {
      track.enabled = !nextMuted
    })

    setMuted(nextMuted)
  }

  async function handleAudioSignal(signal: LessonAudioSignal) {
    if (processedSignalsRef.current.has(signal.id)) return
    processedSignalsRef.current.add(signal.id)

    if (signal.sender_name === name && signal.sender_role === role) return

    if (signal.signal_type === 'offer') {
      if (
        callState === 'idle' ||
        callState === 'ended' ||
        callState === 'declined' ||
        callState === 'failed'
      ) {
        setIncomingCall(signal)
        setCurrentCallId(signal.call_id)
        setRemoteCaller(signal.sender_name)
        setCallState('incoming')
      }
      return
    }

    if (!currentCallId || signal.call_id !== currentCallId) return

    if (signal.signal_type === 'answer') {
      if (peerRef.current) {
        setCallState('connecting')
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(signal.payload)
        )
      }
      return
    }

    if (signal.signal_type === 'candidate') {
      if (peerRef.current && signal.payload) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(signal.payload))
        } catch {
          // Candidate arrived before connection was ready.
        }
      }
      return
    }

    if (signal.signal_type === 'restart-offer') {
      if (!peerRef.current) return

      setCallState('reconnecting')

      try {
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(signal.payload)
        )

        const answer = await peerRef.current.createAnswer()
        await peerRef.current.setLocalDescription(answer)

        await insertSignal(signal.call_id, 'restart-answer', answer)
      } catch {
        setCallState('failed')
      }

      return
    }

    if (signal.signal_type === 'restart-answer') {
      if (!peerRef.current) return

      try {
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(signal.payload)
        )
      } catch {
        setCallState('failed')
      }

      return
    }

    if (signal.signal_type === 'decline') {
      cleanupCall()
      setCallState('declined')
      return
    }

    if (signal.signal_type === 'end') {
      cleanupCall()
      setCallState('ended')
    }
  }

  if (!entered) {
    return (
      <main className="min-h-screen bg-[#0B1120] text-white px-4 py-8">
        <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
          <div className="rounded-2xl bg-blue-600/15 px-4 py-3 text-sm font-semibold text-blue-200">
            EXAMIA Controlled Lesson Space
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight">Join Lesson Room</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Enter as student, teacher, or admin to access the governed lesson space.
          </p>

          <input
            className="mt-6 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-blue-400"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <select
            className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-blue-400"
            value={role}
            onChange={e => setRole(e.target.value as any)}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={enterRoom}
            className="mt-5 w-full rounded-2xl bg-blue-600 px-4 py-3 font-bold hover:bg-blue-500"
          >
            Enter Room
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0B1120] text-white">
      <div className="mx-auto max-w-7xl px-4 py-5">
        <header className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-5 shadow-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-300">
                EXAMIA Controlled Lesson Space
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Lesson Room
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Governed learning room for preparation, live teaching, chat,
                files, voice explanations, audio support, and locked completion.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge label={lesson?.status || 'Loading'} tone={statusTone(lesson?.status)} />
              <Badge label={`${onlineUsers.length} online`} tone="blue" />
              <Badge label={callStatusText(callState)} tone={callTone(callState)} />
            </div>
          </div>
        </header>

        {isActive && (
          <div className="mt-4 rounded-3xl border border-green-500/30 bg-green-500/10 p-4">
            <p className="font-bold text-green-200">Live Session Active</p>
            <p className="mt-1 text-sm text-green-100/80">
              Live audio, files, chat, and voice notes are enabled.
            </p>
          </div>
        )}

        {isPaid && (
          <div className="mt-4 rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-4">
            <p className="font-bold text-yellow-200">Preparation Mode</p>
            <p className="mt-1 text-sm text-yellow-100/80">
              The room is paid and ready. Mark the lesson active when teaching begins.
            </p>
          </div>
        )}

        {isClosed && (
          <div className="mt-4 rounded-3xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="font-bold text-red-200">Lesson Locked</p>
            <p className="mt-1 text-sm text-red-100/80">
              This lesson has been closed. Normal teaching tools are locked.
            </p>
          </div>
        )}

        <section className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard title="Subject" value={lesson?.subject || 'Not set'} helper={lesson?.level || 'Level not set'} />
          <SummaryCard title="Teacher" value={lesson?.assigned_teacher || 'Not assigned'} helper="Assigned learning support" />
          <SummaryCard title="Preferred Time" value={lesson?.preferred_time || 'Not set'} helper="Student requested time" />
          <SummaryCard title="Scheduled Time" value={lesson?.scheduled_time || 'Not scheduled'} helper="Confirmed lesson time" />
        </section>

        <section className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-semibold text-slate-400">Learning Problem</p>
          <p className="mt-2 text-lg font-semibold">{lesson?.problem || 'Not set'}</p>
        </section>

        <section className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-bold">Live Presence</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {onlineUsers.map((user, index) => (
              <span
                key={index}
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-2 text-sm"
              >
                <span className="font-bold">{user.name}</span>{' '}
                <span className="text-slate-400">{user.role}</span>
              </span>
            ))}
          </div>
        </section>

        <div className="mt-5 grid gap-5 xl:grid-cols-[420px_1fr]">
          <div className="space-y-5">
            <Panel title="Lesson Control" description="Start, monitor, and close the session.">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <button
                  onClick={markActive}
                  disabled={isClosed || isActive}
                  className="rounded-2xl bg-green-600 px-4 py-3 font-bold hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-400"
                >
                  Mark Lesson Active
                </button>

                <button
                  onClick={completeLesson}
                  disabled={isClosed}
                  className="rounded-2xl bg-red-600 px-4 py-3 font-bold hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-400"
                >
                  Complete Lesson
                </button>
              </div>
            </Panel>

            <Panel title="Live Audio" description="Low-data real-time voice support.">
              <div className="rounded-3xl border border-white/10 bg-slate-950 p-4">
                <p className="text-sm font-semibold text-slate-400">Connection</p>
                <p className="mt-1 text-2xl font-bold">{callStatusText(callState)}</p>
                <p className="mt-2 text-sm text-slate-400">
                  {callHelpText(callState, remoteCaller)}
                </p>
              </div>

              {callState === 'incoming' && (
                <div className="mt-4 rounded-3xl border border-blue-400/40 bg-blue-500/10 p-4">
                  <p className="font-bold text-blue-100">Incoming Audio Call</p>
                  <p className="mt-1 text-sm text-blue-100/80">
                    {remoteCaller} is calling.
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={acceptCall}
                      className="rounded-2xl bg-green-600 px-4 py-3 font-bold hover:bg-green-500"
                    >
                      Accept
                    </button>

                    <button
                      onClick={declineCall}
                      className="rounded-2xl bg-red-600 px-4 py-3 font-bold hover:bg-red-500"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <button
                  onClick={startCall}
                  disabled={
                    !liveToolsEnabled ||
                    callState === 'calling' ||
                    callState === 'incoming' ||
                    callState === 'connecting' ||
                    callState === 'connected' ||
                    callState === 'reconnecting'
                  }
                  className="rounded-2xl bg-blue-600 px-4 py-3 font-bold hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400"
                >
                  Start Live Audio
                </button>

                <button
                  onClick={toggleMute}
                  disabled={!localStreamRef.current || callState === 'idle'}
                  className="rounded-2xl bg-slate-700 px-4 py-3 font-bold hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500"
                >
                  {muted ? 'Unmute' : 'Mute'}
                </button>

                <button
                  onClick={endCall}
                  disabled={callState === 'idle' || callState === 'ended'}
                  className="rounded-2xl bg-red-600 px-4 py-3 font-bold hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-400"
                >
                  End Live Audio
                </button>
              </div>

              {callState === 'failed' && (
                <button
                  onClick={startCall}
                  className="mt-3 w-full rounded-2xl bg-yellow-600 px-4 py-3 font-bold hover:bg-yellow-500"
                >
                  Restart Audio
                </button>
              )}

              <audio ref={remoteAudioRef} autoPlay playsInline />
            </Panel>

            <Panel title="Voice Notes" description="Record short explanations for replay.">
              {!recording ? (
                <button
                  onClick={startRecording}
                  disabled={isClosed}
                  className="w-full rounded-2xl bg-purple-600 px-4 py-3 font-bold hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-400"
                >
                  Record Voice Note
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="w-full rounded-2xl bg-red-600 px-4 py-3 font-bold hover:bg-red-500"
                >
                  Stop Recording
                </button>
              )}

              <p className="mt-3 text-sm text-slate-400">
                {recording ? 'Recording now...' : 'Ready for short audio explanations.'}
              </p>
            </Panel>

            <Panel title="Audio Notes" description="Replay recorded explanations.">
              <div className="space-y-3">
                {audioNotes.length === 0 && (
                  <p className="text-sm text-slate-400">No audio notes yet.</p>
                )}

                {audioNotes.map(note => (
                  <div
                    key={note.id}
                    className="rounded-2xl border border-white/10 bg-slate-950 p-3"
                  >
                    <p className="break-all font-semibold">{note.audio_name}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatBytes(note.audio_size)} · {note.uploaded_by_name} ({note.uploaded_by_role})
                    </p>
                    <button
                      onClick={() => playAudioNote(note)}
                      className="mt-3 rounded-xl bg-slate-700 px-4 py-2 text-sm font-bold hover:bg-slate-600"
                    >
                      Play
                    </button>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="space-y-5">
            <Panel title="Lesson Chat" description="Shared conversation between student, teacher, and admin.">
              <div className="h-[520px] overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 p-4">
                <div className="space-y-3">
                  {messages.map(msg => (
                    <div key={msg.id} className="rounded-2xl bg-slate-900 p-4">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-bold text-blue-200">{msg.sender}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(msg.created_at).toLocaleString()}
                        </p>
                      </div>
                      <p className="mt-2 leading-6 text-slate-100">{msg.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-blue-400 disabled:text-slate-500"
                  placeholder={isClosed ? 'Lesson is locked' : 'Type your message...'}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  disabled={isClosed}
                  onKeyDown={e => {
                    if (e.key === 'Enter') sendMessage()
                  }}
                />

                <button
                  onClick={sendMessage}
                  disabled={isClosed}
                  className="rounded-2xl bg-blue-600 px-5 py-3 font-bold hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400"
                >
                  Send
                </button>
              </div>
            </Panel>

            <Panel title="Files" description="Upload and download learning materials.">
              <div className="rounded-3xl border border-dashed border-white/15 bg-slate-950 p-4">
                <input
                  type="file"
                  disabled={isClosed}
                  onChange={uploadFile}
                  className="w-full text-sm"
                />
                {uploadingFile && (
                  <p className="mt-2 text-sm text-blue-300">Uploading file...</p>
                )}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {files.length === 0 && (
                  <p className="text-sm text-slate-400">No files uploaded yet.</p>
                )}

                {files.map(file => (
                  <div
                    key={file.id}
                    className="rounded-2xl border border-white/10 bg-slate-950 p-4"
                  >
                    <p className="break-all font-bold">{file.file_name}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatBytes(file.file_size)} · {file.uploaded_by_name} ({file.uploaded_by_role})
                    </p>
                    <button
                      onClick={() => downloadFile(file)}
                      className="mt-3 rounded-xl bg-slate-700 px-4 py-2 text-sm font-bold hover:bg-slate-600"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </main>
  )
}

function Panel({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function SummaryCard({
  title,
  value,
  helper,
}: {
  title: string
  value: string
  helper: string
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm font-semibold text-slate-400">{title}</p>
      <p className="mt-2 text-xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </div>
  )
}

function Badge({
  label,
  tone,
}: {
  label: string
  tone: 'blue' | 'green' | 'yellow' | 'red' | 'slate'
}) {
  const tones = {
    blue: 'border-blue-400/30 bg-blue-500/10 text-blue-200',
    green: 'border-green-400/30 bg-green-500/10 text-green-200',
    yellow: 'border-yellow-400/30 bg-yellow-500/10 text-yellow-200',
    red: 'border-red-400/30 bg-red-500/10 text-red-200',
    slate: 'border-white/10 bg-white/5 text-slate-200',
  }

  return (
    <span className={`rounded-full border px-3 py-1 text-sm font-bold ${tones[tone]}`}>
      {label}
    </span>
  )
}

function statusTone(status?: string): 'blue' | 'green' | 'yellow' | 'red' | 'slate' {
  if (status === 'ACTIVE') return 'green'
  if (status === 'PAID') return 'yellow'
  if (status === 'COMPLETED') return 'blue'
  if (status === 'CANCELLED' || status === 'FAILED') return 'red'
  return 'slate'
}

function callTone(state: CallState): 'blue' | 'green' | 'yellow' | 'red' | 'slate' {
  if (state === 'connected') return 'green'
  if (state === 'calling' || state === 'incoming' || state === 'connecting') return 'blue'
  if (state === 'reconnecting') return 'yellow'
  if (state === 'failed' || state === 'declined') return 'red'
  return 'slate'
}

function callStatusText(state: CallState) {
  if (state === 'idle') return 'Audio idle'
  if (state === 'calling') return 'Calling'
  if (state === 'incoming') return 'Incoming call'
  if (state === 'connecting') return 'Connecting'
  if (state === 'connected') return 'Audio connected'
  if (state === 'reconnecting') return 'Reconnecting'
  if (state === 'declined') return 'Call declined'
  if (state === 'ended') return 'Call ended'
  if (state === 'failed') return 'Connection failed'
  return 'Audio idle'
}

function callHelpText(state: CallState, remoteCaller: string | null) {
  if (state === 'idle') return 'Start live audio when the lesson is active.'
  if (state === 'calling') return 'Waiting for the other person to accept.'
  if (state === 'incoming') return `${remoteCaller || 'Someone'} is requesting live audio.`
  if (state === 'connecting') return 'Audio is negotiating a secure peer connection.'
  if (state === 'connected') return 'Live audio is currently connected.'
  if (state === 'reconnecting') return 'The connection weakened. EXAMIA is trying to recover it.'
  if (state === 'declined') return 'The call was declined.'
  if (state === 'ended') return 'The live audio session ended.'
  if (state === 'failed') return 'The connection failed. Restart audio if needed.'
  return ''
}

function formatBytes(bytes: number) {
  if (!bytes) return '0 KB'

  const kb = bytes / 1024
  if (kb < 1024) return `${Math.round(kb)} KB`

  return `${(kb / 1024).toFixed(1)} MB`
}