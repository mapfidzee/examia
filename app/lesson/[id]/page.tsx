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
  signal_type: 'offer' | 'answer' | 'candidate' | 'decline' | 'end'
  payload: any
  created_at: string
}

type CallState =
  | 'idle'
  | 'calling'
  | 'incoming'
  | 'connecting'
  | 'connected'
  | 'declined'
  | 'ended'

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

  const [wakeLockSupported, setWakeLockSupported] = useState(false)
  const [wakeLockActive, setWakeLockActive] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const peerRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null)
  const processedSignalsRef = useRef<Set<string>>(new Set())
  const wakeLockRef = useRef<any>(null)

  const callStateRef = useRef<CallState>('idle')
  const currentCallIdRef = useRef<string | null>(null)
  const incomingCallRef = useRef<LessonAudioSignal | null>(null)

  const isPaid = lesson?.status === 'PAID'
  const isActive = lesson?.status === 'ACTIVE'
  const isClosed =
    lesson?.status === 'COMPLETED' ||
    lesson?.status === 'CANCELLED' ||
    lesson?.status === 'FAILED'

  const liveToolsEnabled = isActive
  const prepMode = isPaid

  useEffect(() => {
    callStateRef.current = callState
  }, [callState])

  useEffect(() => {
    currentCallIdRef.current = currentCallId
  }, [currentCallId])

  useEffect(() => {
    incomingCallRef.current = incomingCall
  }, [incomingCall])

  useEffect(() => {
    loadEverything()
  }, [id])

  useEffect(() => {
    setWakeLockSupported('wakeLock' in navigator)

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && wakeLockActive) {
        await requestWakeLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [wakeLockActive])

  useEffect(() => {
    if (!entered || !name) return

    const interval = window.setInterval(async () => {
      await scanForRecentIncomingOffer()
    }, 2500)

    scanForRecentIncomingOffer()

    return () => {
      window.clearInterval(interval)
    }
  }, [entered, name, role, id])

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
        const users = Object.values(state).flat()
        setOnlineUsers(users)
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lesson_requests',
          filter: `id=eq.${id}`,
        },
        payload => {
          setLesson(payload.new as LessonRequest)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lesson_messages',
          filter: `lesson_request_id=eq.${id}`,
        },
        payload => {
          setMessages(prev => [...prev, payload.new as LessonMessage])
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
        payload => {
          setFiles(prev => [payload.new as LessonFile, ...prev])
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
        payload => {
          setAudioNotes(prev => [payload.new as LessonAudioNote, ...prev])
        }
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

          await scanForRecentIncomingOffer()
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [entered, name, role, id])

  async function scanForRecentIncomingOffer() {
    if (!entered || !name) return

    const state = callStateRef.current

    if (
      state !== 'idle' &&
      state !== 'ended' &&
      state !== 'declined'
    ) {
      return
    }

    if (incomingCallRef.current) return

    const recentCutoff = new Date(Date.now() - 90 * 1000).toISOString()

    const { data, error } = await supabase
      .from('lesson_audio_signals')
      .select('*')
      .eq('lesson_id', id)
      .eq('signal_type', 'offer')
      .gte('created_at', recentCutoff)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error || !data || data.length === 0) return

    const offer = data.find(signal => {
      return !(
        signal.sender_name === name &&
        signal.sender_role === role
      )
    }) as LessonAudioSignal | undefined

    if (!offer) return

    const { data: closingSignals } = await supabase
      .from('lesson_audio_signals')
      .select('*')
      .eq('lesson_id', id)
      .eq('call_id', offer.call_id)
      .in('signal_type', ['answer', 'decline', 'end'])
      .order('created_at', { ascending: false })
      .limit(1)

    if (closingSignals && closingSignals.length > 0) return

    setIncomingCall(offer)
    setCurrentCallId(offer.call_id)
    setRemoteCaller(offer.sender_name)
    setCallState('incoming')
  }

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
    await supabase
      .from('lesson_requests')
      .update({ status: 'ACTIVE' })
      .eq('id', id)
  }

  async function completeLesson() {
    await endCall()

    await supabase
      .from('lesson_requests')
      .update({ status: 'COMPLETED' })
      .eq('id', id)
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

    const { error: uploadError } = await supabase.storage
      .from('lesson-files')
      .upload(filePath, file)

    if (!uploadError) {
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

    if (!error && data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
  }

  async function startRecording() {
    if (isClosed) return

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)

    audioChunksRef.current = []

    recorder.ondataavailable = event => {
      audioChunksRef.current.push(event.data)
    }

    recorder.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })

      if (blob.size > 5 * 1024 * 1024) {
        alert('Audio note too large. Keep it short.')
        return
      }

      const audioName = `voice-note-${Date.now()}.webm`
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

  async function requestWakeLock() {
    try {
      if (!('wakeLock' in navigator)) {
        setWakeLockSupported(false)
        return
      }

      wakeLockRef.current = await (navigator as any).wakeLock.request('screen')
      setWakeLockActive(true)

      wakeLockRef.current.addEventListener('release', () => {
        setWakeLockActive(false)
      })
    } catch {
      setWakeLockActive(false)
    }
  }

  async function releaseWakeLock() {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release()
        wakeLockRef.current = null
      }
    } catch {
      // Ignore release errors
    }

    setWakeLockActive(false)
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
      setCallState('connected')
    }

    peer.onconnectionstatechange = () => {
      if (
        peer.connectionState === 'connected' ||
        peer.iceConnectionState === 'connected'
      ) {
        setCallState('connected')
      }

      if (
        peer.connectionState === 'failed' ||
        peer.connectionState === 'disconnected' ||
        peer.connectionState === 'closed'
      ) {
        if (callStateRef.current !== 'ended') setCallState('ended')
      }
    }

    peerRef.current = peer
    return peer
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

    await requestWakeLock()

    const callId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`

    setCurrentCallId(callId)
    setCallState('calling')

    const peer = createPeerConnection(callId)
    await addLocalTracks(peer)

    const offer = await peer.createOffer()
    await peer.setLocalDescription(offer)

    await insertSignal(callId, 'offer', offer)
  }

  async function acceptCall() {
    if (!incomingCall) return

    await requestWakeLock()

    setCallState('connecting')
    setCurrentCallId(incomingCall.call_id)
    setRemoteCaller(incomingCall.sender_name)

    const peer = createPeerConnection(incomingCall.call_id)
    await addLocalTracks(peer)

    await peer.setRemoteDescription(
      new RTCSessionDescription(incomingCall.payload)
    )

    const answer = await peer.createAnswer()
    await peer.setLocalDescription(answer)

    await insertSignal(incomingCall.call_id, 'answer', answer)
    setIncomingCall(null)
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
    if (currentCallIdRef.current) {
      await insertSignal(currentCallIdRef.current, 'end', {
        reason: 'Call ended',
      })
    }

    cleanupCall()
    setCallState('ended')
    await releaseWakeLock()
  }

  function cleanupCall() {
    peerRef.current?.close()
    peerRef.current = null

    localStreamRef.current?.getTracks().forEach(track => track.stop())
    localStreamRef.current = null

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null
    }

    setIncomingCall(null)
    setCurrentCallId(null)
    setRemoteCaller(null)
  }

  async function handleAudioSignal(signal: LessonAudioSignal) {
    if (processedSignalsRef.current.has(signal.id)) return
    processedSignalsRef.current.add(signal.id)

    if (signal.sender_name === name && signal.sender_role === role) return

    if (signal.signal_type === 'offer') {
      if (
        callStateRef.current === 'idle' ||
        callStateRef.current === 'ended' ||
        callStateRef.current === 'declined'
      ) {
        setIncomingCall(signal)
        setCurrentCallId(signal.call_id)
        setRemoteCaller(signal.sender_name)
        setCallState('incoming')
      }
      return
    }

    if (!currentCallIdRef.current || signal.call_id !== currentCallIdRef.current) return

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
          await peerRef.current.addIceCandidate(
            new RTCIceCandidate(signal.payload)
          )
        } catch {
          // Ignore candidates that arrive before remote description settles.
        }
      }
      return
    }

    if (signal.signal_type === 'decline') {
      cleanupCall()
      setCallState('declined')
      await releaseWakeLock()
      return
    }

    if (signal.signal_type === 'end') {
      cleanupCall()
      setCallState('ended')
      await releaseWakeLock()
    }
  }

  if (!entered) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-4">
        <div className="max-w-xl mx-auto mt-10 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <p className="text-sm text-blue-300 font-semibold">
            EXAMIA CONTROLLED LESSON SPACE
          </p>
          <h1 className="text-2xl font-bold mt-2">Join Lesson Room</h1>
          <p className="text-slate-300 mt-2">
            Enter your name and role to join this governed learning room.
          </p>

          <input
            className="w-full mt-6 p-3 rounded-xl bg-slate-800 border border-slate-700"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <select
            className="w-full mt-3 p-3 rounded-xl bg-slate-800 border border-slate-700"
            value={role}
            onChange={e => setRole(e.target.value as any)}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={enterRoom}
            className="w-full mt-5 bg-blue-600 hover:bg-blue-700 rounded-xl p-3 font-semibold"
          >
            Enter Lesson Room
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-6xl mx-auto space-y-5">
        <header className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <p className="text-sm text-blue-300 font-semibold">
            EXAMIA CONTROLLED LESSON SPACE
          </p>

          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Lesson Room</h1>
              <p className="text-slate-300 mt-2 max-w-3xl">
                A governed learning room for preparation, live teaching, files,
                voice explanations, audio support, and locked lesson completion.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusPill text={lesson?.status || 'Loading'} />
              <StatusPill text={`${onlineUsers.length} online`} />
              <StatusPill text={callStateLabel(callState)} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {prepMode && <StatusPill text="Preparation Mode" tone="yellow" />}
            {isActive && <StatusPill text="Live Session Active" tone="green" />}
            {isClosed && <StatusPill text="Lesson Locked" tone="red" />}
          </div>
        </header>

        {isActive && (
          <section className="rounded-2xl border border-green-700 bg-green-950/40 p-4">
            <p className="font-bold text-green-100">Live Session Active</p>
            <p className="mt-1 text-sm text-green-100/80">
              Live audio, files, chat, and voice notes are enabled.
            </p>
          </section>
        )}

        <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Info label="Subject" value={lesson?.subject} />
          <Info label="Level" value={lesson?.level || 'Not set'} />
          <Info label="Teacher" value={lesson?.assigned_teacher || 'Not assigned'} />
          <Info label="Preferred Time" value={lesson?.preferred_time} />
          <Info label="Scheduled Time" value={lesson?.scheduled_time || 'Not scheduled'} />
          <Info label="Learning Problem" value={lesson?.problem} />
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-xl font-bold">Live Presence</h2>
          <p className="text-slate-400 text-sm mt-1">
            Who is currently inside the room.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {onlineUsers.map((user, index) => (
              <span
                key={index}
                className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm"
              >
                <span className="font-semibold">{user.name}</span>{' '}
                <span className="text-slate-400">{user.role}</span>
              </span>
            ))}
          </div>
        </section>

        <section className="grid lg:grid-cols-[360px_1fr] gap-5">
          <div className="space-y-5">
            <Panel title="Lesson Control" subtitle="Start, monitor, and close the session.">
              <div className="grid gap-3">
                <button
                  onClick={markActive}
                  disabled={isClosed || isActive}
                  className="bg-green-600 disabled:bg-slate-700 hover:bg-green-700 rounded-xl px-4 py-3 font-semibold"
                >
                  Mark Lesson Active
                </button>

                <button
                  onClick={completeLesson}
                  disabled={isClosed}
                  className="bg-red-600 disabled:bg-slate-700 hover:bg-red-700 rounded-xl px-4 py-3 font-semibold"
                >
                  Complete Lesson
                </button>
              </div>
            </Panel>

            <Panel title="Live Audio" subtitle="Low-data real-time voice support.">
              <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                <p className="font-semibold">Connection</p>
                <p className="text-slate-300 mt-1">{callStateLabel(callState)}</p>
              </div>

              <div className="mt-4 rounded-xl border border-yellow-700 bg-yellow-900/30 p-4">
                <p className="font-semibold text-yellow-100">
                  Keep screen awake during live audio
                </p>
                <p className="mt-1 text-sm text-yellow-100/80">
                  If the phone screen sleeps, the browser may weaken or stop the audio connection.
                </p>

                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    onClick={requestWakeLock}
                    disabled={!wakeLockSupported || wakeLockActive}
                    className="rounded-xl bg-yellow-600 px-4 py-2 font-semibold hover:bg-yellow-700 disabled:bg-slate-700"
                  >
                    {wakeLockActive ? 'Screen Awake Active' : 'Keep Screen Awake'}
                  </button>

                  <button
                    onClick={releaseWakeLock}
                    disabled={!wakeLockActive}
                    className="rounded-xl bg-slate-700 px-4 py-2 font-semibold hover:bg-slate-600 disabled:bg-slate-800"
                  >
                    Release
                  </button>
                </div>

                {!wakeLockSupported && (
                  <p className="mt-2 text-sm text-red-200">
                    This browser may not support screen wake lock. Keep the phone screen on manually.
                  </p>
                )}
              </div>

              {callState === 'incoming' && (
                <div className="mt-4 p-4 rounded-xl bg-blue-950 border border-blue-700">
                  <h3 className="font-bold">Incoming Audio Call</h3>
                  <p className="text-blue-100 mt-1">
                    {remoteCaller} is calling.
                  </p>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={acceptCall}
                      className="bg-green-600 hover:bg-green-700 rounded-xl px-4 py-3 font-semibold"
                    >
                      Accept Call
                    </button>

                    <button
                      onClick={declineCall}
                      className="bg-red-600 hover:bg-red-700 rounded-xl px-4 py-3 font-semibold"
                    >
                      Decline Call
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4 grid gap-3">
                <button
                  onClick={startCall}
                  disabled={
                    !liveToolsEnabled ||
                    callState === 'calling' ||
                    callState === 'incoming' ||
                    callState === 'connecting' ||
                    callState === 'connected'
                  }
                  className="bg-blue-600 disabled:bg-slate-700 hover:bg-blue-700 rounded-xl px-4 py-3 font-semibold"
                >
                  Start Live Audio
                </button>

                <button
                  onClick={endCall}
                  disabled={callState === 'idle' || callState === 'ended'}
                  className="bg-red-600 disabled:bg-slate-700 hover:bg-red-700 rounded-xl px-4 py-3 font-semibold"
                >
                  End Call
                </button>
              </div>

              <audio ref={remoteAudioRef} autoPlay playsInline />
            </Panel>

            <Panel title="Voice Notes" subtitle="Record short explanations for low-data learning.">
              {!recording ? (
                <button
                  onClick={startRecording}
                  disabled={isClosed}
                  className="bg-purple-600 disabled:bg-slate-700 hover:bg-purple-700 rounded-xl px-4 py-3 font-semibold w-full"
                >
                  Record Voice Note
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="bg-red-600 hover:bg-red-700 rounded-xl px-4 py-3 font-semibold w-full"
                >
                  Stop Recording
                </button>
              )}
            </Panel>

            <Panel title="Audio Notes" subtitle="Replay recorded explanations.">
              <div className="space-y-3">
                {audioNotes.length === 0 && (
                  <p className="text-sm text-slate-400">No audio notes yet.</p>
                )}

                {audioNotes.map(note => (
                  <div
                    key={note.id}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-3"
                  >
                    <p className="font-semibold break-all">{note.audio_name}</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Recorded by {note.uploaded_by_name} ({note.uploaded_by_role})
                    </p>

                    <button
                      onClick={() => playAudioNote(note)}
                      className="mt-3 bg-slate-700 hover:bg-slate-600 rounded-xl px-4 py-2"
                    >
                      Play
                    </button>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="space-y-5">
            <Panel title="Lesson Chat" subtitle="Shared conversation between student, teacher, and admin.">
              <div className="h-[520px] overflow-y-auto space-y-3 bg-slate-950 border border-slate-800 rounded-xl p-4">
                {messages.map(msg => (
                  <div key={msg.id} className="bg-slate-800 rounded-xl p-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-blue-300 font-semibold">
                        {msg.sender}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                    <p className="mt-1">{msg.message}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  className="flex-1 p-3 rounded-xl bg-slate-800 border border-slate-700 min-w-0"
                  placeholder={isClosed ? 'Lesson is locked' : 'Type a lesson message...'}
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
                  className="bg-blue-600 disabled:bg-slate-700 hover:bg-blue-700 rounded-xl px-5 font-semibold"
                >
                  Send
                </button>
              </div>
            </Panel>

            <Panel title="Files" subtitle="Upload and download learning materials.">
              <input
                type="file"
                disabled={isClosed}
                onChange={uploadFile}
                className="block w-full text-sm"
              />

              {uploadingFile && (
                <p className="text-blue-300 mt-2">Uploading file...</p>
              )}

              <div className="mt-4 grid md:grid-cols-2 gap-3">
                {files.length === 0 && (
                  <p className="text-sm text-slate-400">No files uploaded yet.</p>
                )}

                {files.map(file => (
                  <div
                    key={file.id}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-3"
                  >
                    <p className="font-semibold break-all">{file.file_name}</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Uploaded by {file.uploaded_by_name} ({file.uploaded_by_role})
                    </p>

                    <button
                      onClick={() => downloadFile(file)}
                      className="mt-3 bg-slate-700 hover:bg-slate-600 rounded-xl px-4 py-2"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </section>
      </div>
    </main>
  )
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="font-semibold mt-1">{value || 'Not set'}</p>
    </div>
  )
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="text-slate-400 text-sm mt-1">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function StatusPill({
  text,
  tone = 'slate',
}: {
  text: string
  tone?: 'slate' | 'green' | 'yellow' | 'red'
}) {
  const toneClass =
    tone === 'green'
      ? 'bg-green-900/50 border-green-700 text-green-100'
      : tone === 'yellow'
        ? 'bg-yellow-900/50 border-yellow-700 text-yellow-100'
        : tone === 'red'
          ? 'bg-red-900/50 border-red-700 text-red-100'
          : 'bg-slate-800 border-slate-700 text-slate-100'

  return (
    <span className={`px-3 py-1 rounded-full border text-sm ${toneClass}`}>
      {text}
    </span>
  )
}

function callStateLabel(callState: CallState) {
  if (callState === 'idle') return 'Audio idle'
  if (callState === 'calling') return 'Calling...'
  if (callState === 'incoming') return 'Incoming call'
  if (callState === 'connecting') return 'Connecting...'
  if (callState === 'connected') return 'Audio connected'
  if (callState === 'declined') return 'Call declined'
  if (callState === 'ended') return 'Call ended'
  return 'Audio idle'
}