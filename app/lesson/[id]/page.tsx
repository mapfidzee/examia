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

type RoomRole = 'beneficiary' | 'responder' | 'admin'

type CallState =
  | 'idle'
  | 'calling'
  | 'incoming'
  | 'connecting'
  | 'connected'
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
  const [role, setRole] = useState<RoomRole>('beneficiary')
  const [entered, setEntered] = useState(false)

  const [message, setMessage] = useState('')
  const [uploadingFile, setUploadingFile] = useState(false)
  const [recording, setRecording] = useState(false)

  const [callState, setCallState] = useState<CallState>('idle')
  const [incomingCall, setIncomingCall] = useState<LessonAudioSignal | null>(null)
  const [currentCallId, setCurrentCallId] = useState<string | null>(null)
  const [remoteCaller, setRemoteCaller] = useState<string | null>(null)
  const [audioError, setAudioError] = useState<string | null>(null)

  const [wakeLockSupported, setWakeLockSupported] = useState(false)
  const [wakeLockActive, setWakeLockActive] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const peerRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null)
  const processedSignalsRef = useRef<Set<string>>(new Set())
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([])
  const wakeLockRef = useRef<any>(null)

  const callStateRef = useRef<CallState>('idle')
  const currentCallIdRef = useRef<string | null>(null)
  const incomingCallRef = useRef<LessonAudioSignal | null>(null)

  const isReady = lesson?.status === 'PAID'
  const isActive = lesson?.status === 'ACTIVE'
  const isClosed =
    lesson?.status === 'COMPLETED' ||
    lesson?.status === 'CANCELLED' ||
    lesson?.status === 'FAILED'

  const liveToolsEnabled = isActive
  const prepMode = isReady

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
        }
      })

    return () => {
      supabase.removeChannel(channel)
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
    await endCall()
    await supabase.from('lesson_requests').update({ status: 'COMPLETED' }).eq('id', id)
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

      const { error } = await supabase.storage.from('lesson-audio').upload(audioPath, blob)

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
      // Ignore wake lock release errors.
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
        remoteAudioRef.current.play().catch(() => {
          // Browser may require user interaction.
        })
      }

      setAudioError(null)
      setCallState('connected')
    }

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'connected' || peer.iceConnectionState === 'connected') {
        setAudioError(null)
        setCallState('connected')
      }

      if (peer.connectionState === 'failed') {
        setAudioError('Audio connection failed. End the call and start again.')
        setCallState('failed')
      }

      if (peer.connectionState === 'disconnected' || peer.connectionState === 'closed') {
        if (callStateRef.current !== 'ended') {
          setCallState('ended')
        }
      }
    }

    peerRef.current = peer
    return peer
  }

  async function getLocalAudioStream() {
    if (localStreamRef.current) return localStreamRef.current

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      })

      localStreamRef.current = stream
      setAudioError(null)
      return stream
    } catch {
      setAudioError(
        'Microphone access failed. Allow microphone permission and keep the browser tab open.'
      )
      throw new Error('Microphone access failed')
    }
  }

  async function addLocalTracks(peer: RTCPeerConnection) {
    const stream = await getLocalAudioStream()

    stream.getTracks().forEach(track => {
      peer.addTrack(track, stream)
    })
  }

  async function flushPendingCandidates() {
    if (!peerRef.current) return
    if (!peerRef.current.remoteDescription) return

    const queued = [...pendingCandidatesRef.current]
    pendingCandidatesRef.current = []

    for (const candidate of queued) {
      try {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate))
      } catch {
        // Ignore unusable stale candidates.
      }
    }
  }

  async function insertSignal(
    callId: string,
    signalType: LessonAudioSignal['signal_type'],
    payload: any
  ) {
    const { error } = await supabase.from('lesson_audio_signals').insert({
      lesson_id: id,
      call_id: callId,
      sender_name: name,
      sender_role: role,
      signal_type: signalType,
      payload,
    })

    if (error) {
      setAudioError(`Signal failed: ${error.message}`)
    }
  }

  async function startCall() {
    if (!liveToolsEnabled || !name) return

    setAudioError(null)
    await requestWakeLock()

    cleanupCall(false)

    const callId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`

    setCurrentCallId(callId)
    currentCallIdRef.current = callId

    setCallState('calling')
    callStateRef.current = 'calling'

    try {
      const peer = createPeerConnection(callId)
      await addLocalTracks(peer)

      const offer = await peer.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      })

      await peer.setLocalDescription(offer)
      await insertSignal(callId, 'offer', offer)
    } catch {
      setCallState('failed')
      callStateRef.current = 'failed'
    }
  }

  async function acceptCall() {
    const call = incomingCallRef.current || incomingCall
    if (!call) return

    setAudioError(null)
    await requestWakeLock()

    setCallState('connecting')
    callStateRef.current = 'connecting'

    setCurrentCallId(call.call_id)
    currentCallIdRef.current = call.call_id
    setRemoteCaller(call.sender_name)

    try {
      const peer = createPeerConnection(call.call_id)
      await addLocalTracks(peer)

      await peer.setRemoteDescription(new RTCSessionDescription(call.payload))
      await flushPendingCandidates()

      const answer = await peer.createAnswer()
      await peer.setLocalDescription(answer)

      await insertSignal(call.call_id, 'answer', answer)

      setIncomingCall(null)
      incomingCallRef.current = null
    } catch {
      setAudioError('Could not accept the call. Check microphone permission and try again.')
      setCallState('failed')
      callStateRef.current = 'failed'
    }
  }

  async function declineCall() {
    const call = incomingCallRef.current || incomingCall
    if (!call) return

    await insertSignal(call.call_id, 'decline', {
      reason: 'Call declined',
    })

    setIncomingCall(null)
    incomingCallRef.current = null
    setCallState('idle')
    callStateRef.current = 'idle'
  }

  async function endCall() {
    if (currentCallIdRef.current) {
      await insertSignal(currentCallIdRef.current, 'end', {
        reason: 'Call ended',
      })
    }

    cleanupCall(true)
    await releaseWakeLock()
  }

  function cleanupCall(updateState: boolean) {
    peerRef.current?.close()
    peerRef.current = null

    localStreamRef.current?.getTracks().forEach(track => track.stop())
    localStreamRef.current = null

    pendingCandidatesRef.current = []

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null
    }

    setIncomingCall(null)
    incomingCallRef.current = null

    setCurrentCallId(null)
    currentCallIdRef.current = null

    setRemoteCaller(null)

    if (updateState) {
      setCallState('ended')
      callStateRef.current = 'ended'
    }
  }

  async function handleAudioSignal(signal: LessonAudioSignal) {
    if (processedSignalsRef.current.has(signal.id)) return
    processedSignalsRef.current.add(signal.id)

    if (signal.sender_name === name && signal.sender_role === role) return

    if (signal.signal_type === 'offer') {
      if (
        callStateRef.current === 'idle' ||
        callStateRef.current === 'ended' ||
        callStateRef.current === 'declined' ||
        callStateRef.current === 'failed'
      ) {
        setIncomingCall(signal)
        incomingCallRef.current = signal

        setCurrentCallId(signal.call_id)
        currentCallIdRef.current = signal.call_id
        setRemoteCaller(signal.sender_name)

        setCallState('incoming')
        callStateRef.current = 'incoming'
      }
      return
    }

    if (!currentCallIdRef.current || signal.call_id !== currentCallIdRef.current) {
      return
    }

    if (signal.signal_type === 'answer') {
      if (peerRef.current) {
        try {
          setCallState('connecting')
          callStateRef.current = 'connecting'

          await peerRef.current.setRemoteDescription(new RTCSessionDescription(signal.payload))
          await flushPendingCandidates()
        } catch {
          setAudioError('Could not complete audio answer handshake.')
          setCallState('failed')
          callStateRef.current = 'failed'
        }
      }
      return
    }

    if (signal.signal_type === 'candidate') {
      if (!signal.payload) return

      if (!peerRef.current || !peerRef.current.remoteDescription) {
        pendingCandidatesRef.current.push(signal.payload)
        return
      }

      try {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(signal.payload))
      } catch {
        // Ignore candidate errors from stale/mobile network changes.
      }
      return
    }

    if (signal.signal_type === 'decline') {
      cleanupCall(false)
      setCallState('declined')
      callStateRef.current = 'declined'
      await releaseWakeLock()
      return
    }

    if (signal.signal_type === 'end') {
      cleanupCall(true)
      await releaseWakeLock()
    }
  }

  if (!entered) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-4">
        <div className="max-w-xl mx-auto mt-10 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h1 className="text-2xl font-bold">EXAMIA Controlled Intervention Room</h1>
          <p className="text-slate-300 mt-2">
            Enter your name and role to join this governed intervention space.
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
            onChange={e => setRole(e.target.value as RoomRole)}
          >
            <option value="beneficiary">Beneficiary</option>
            <option value="responder">Responder</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={enterRoom}
            className="w-full mt-5 bg-blue-600 hover:bg-blue-700 rounded-xl p-3 font-semibold"
          >
            Enter Intervention Room
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4">
      {callState === 'incoming' && (
        <div className="fixed inset-x-0 top-0 z-50 border-b border-blue-500 bg-blue-950 p-4 shadow-2xl">
          <div className="mx-auto max-w-5xl">
            <p className="text-sm font-semibold text-blue-200">Incoming Audio Call</p>
            <h2 className="mt-1 text-xl font-bold">
              {remoteCaller || 'Someone'} is calling.
            </h2>

            <div className="mt-3 flex gap-3">
              <button
                onClick={acceptCall}
                className="rounded-xl bg-green-600 px-5 py-3 font-semibold hover:bg-green-700"
              >
                Accept Call
              </button>

              <button
                onClick={declineCall}
                className="rounded-xl bg-red-600 px-5 py-3 font-semibold hover:bg-red-700"
              >
                Decline Call
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-5 pt-2">
        <header className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-sm text-blue-300 font-semibold">
            EXAMIA CONTROLLED INTERVENTION SPACE
          </p>

          <h1 className="text-2xl font-bold mt-1">Controlled Intervention Room</h1>

          <p className="text-slate-300 mt-2">
            A governed low-bandwidth coordination room for intervention communication,
            files, voice notes, live audio support, and locked completion.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-sm">
              Status: {lesson?.status || 'Loading'}
            </span>

            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-sm">
              {onlineUsers.length} online
            </span>

            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-sm">
              {callStateText(callState)}
            </span>

            {prepMode && (
              <span className="px-3 py-1 rounded-full bg-yellow-900/50 border border-yellow-700 text-sm">
                Readiness Mode
              </span>
            )}

            {isActive && (
              <span className="px-3 py-1 rounded-full bg-green-900/50 border border-green-700 text-sm">
                Intervention Active
              </span>
            )}

            {isClosed && (
              <span className="px-3 py-1 rounded-full bg-red-900/50 border border-red-700 text-sm">
                Intervention Locked
              </span>
            )}
          </div>
        </header>

        <section className="grid md:grid-cols-2 gap-4">
          <Info label="Support Domain" value={lesson?.subject} />
          <Info label="Beneficiary Level" value={lesson?.level || 'Not set'} />
          <Info label="Assigned Responder" value={lesson?.assigned_teacher || 'Not assigned'} />
          <Info label="Preferred Time" value={lesson?.preferred_time} />
          <Info label="Scheduled Time" value={lesson?.scheduled_time || 'Not scheduled'} />
          <Info label="Support Need" value={lesson?.problem} />
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-xl font-bold">Live Presence</h2>
          <p className="text-slate-400 text-sm mt-1">
            Who is currently inside the controlled intervention room.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {onlineUsers.map((user, index) => (
              <span
                key={index}
                className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm"
              >
                {user.name} — {displayRole(user.role)}
              </span>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-xl font-bold">Intervention Control</h2>
          <p className="text-slate-400 text-sm mt-1">
            Activate, monitor, and close the governed intervention.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={markActive}
              disabled={isClosed || isActive}
              className="bg-green-600 disabled:bg-slate-700 hover:bg-green-700 rounded-xl px-4 py-3 font-semibold"
            >
              Mark Intervention Active
            </button>

            <button
              onClick={completeLesson}
              disabled={isClosed}
              className="bg-red-600 disabled:bg-slate-700 hover:bg-red-700 rounded-xl px-4 py-3 font-semibold"
            >
              Complete Intervention
            </button>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-xl font-bold">Live Audio</h2>
          <p className="text-slate-400 text-sm mt-1">
            Low-data real-time voice support for controlled intervention coordination.
          </p>

          <div className="mt-4 rounded-xl border border-yellow-700 bg-yellow-900/30 p-4">
            <p className="font-semibold text-yellow-100">Mobile audio instruction</p>
            <p className="mt-1 text-sm text-yellow-100/80">
              Keep the phone screen awake during live audio. If the screen sleeps,
              mobile browsers may weaken or stop the connection.
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
                This browser may not support screen wake lock. Keep the screen on manually.
              </p>
            )}
          </div>

          <div className="mt-4 p-4 rounded-xl bg-slate-800 border border-slate-700">
            <p className="font-semibold">Connection</p>
            <p className="text-slate-300 mt-1">{callStateText(callState)}</p>

            {audioError && (
              <p className="mt-2 rounded-lg bg-red-950 p-3 text-sm text-red-100">
                {audioError}
              </p>
            )}
          </div>

          {callState === 'incoming' && (
            <div className="mt-4 p-4 rounded-xl bg-blue-950 border border-blue-700">
              <h3 className="font-bold">Incoming Audio Call</h3>
              <p className="text-blue-100 mt-1">{remoteCaller} is calling.</p>

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

          <div className="mt-4 flex flex-wrap gap-3">
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
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-xl font-bold">Intervention Communication</h2>

          <div className="mt-4 h-80 overflow-y-auto space-y-3 bg-slate-950 border border-slate-800 rounded-xl p-4">
            {messages.map(msg => (
              <div key={msg.id} className="bg-slate-800 rounded-xl p-3">
                <p className="text-sm text-blue-300 font-semibold">{msg.sender}</p>
                <p className="mt-1">{msg.message}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <input
              className="flex-1 p-3 rounded-xl bg-slate-800 border border-slate-700"
              placeholder={
                isClosed ? 'Intervention is locked' : 'Type an intervention message...'
              }
              value={message}
              onChange={e => setMessage(e.target.value)}
              disabled={isClosed}
            />

            <button
              onClick={sendMessage}
              disabled={isClosed}
              className="bg-blue-600 disabled:bg-slate-700 hover:bg-blue-700 rounded-xl px-5 font-semibold"
            >
              Send
            </button>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-xl font-bold">Files</h2>
          <p className="text-slate-400 text-sm mt-1">
            Upload and download intervention materials.
          </p>

          <input
            type="file"
            disabled={isClosed}
            onChange={uploadFile}
            className="mt-4 block w-full text-sm"
          />

          {uploadingFile && <p className="text-blue-300 mt-2">Uploading file...</p>}

          <div className="mt-4 space-y-3">
            {files.map(file => (
              <div
                key={file.id}
                className="flex justify-between items-center gap-3 bg-slate-800 border border-slate-700 rounded-xl p-3"
              >
                <div>
                  <p className="font-semibold">{file.file_name}</p>
                  <p className="text-sm text-slate-400">
                    Uploaded by {file.uploaded_by_name} ({displayRole(file.uploaded_by_role)})
                  </p>
                </div>

                <button
                  onClick={() => downloadFile(file)}
                  className="bg-slate-700 hover:bg-slate-600 rounded-xl px-4 py-2"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-xl font-bold">Voice Notes</h2>
          <p className="text-slate-400 text-sm mt-1">
            Record short intervention explanations for low-data continuity support.
          </p>

          <div className="mt-4 flex gap-3">
            {!recording ? (
              <button
                onClick={startRecording}
                disabled={isClosed}
                className="bg-purple-600 disabled:bg-slate-700 hover:bg-purple-700 rounded-xl px-4 py-3 font-semibold"
              >
                Record Voice Note
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="bg-red-600 hover:bg-red-700 rounded-xl px-4 py-3 font-semibold"
              >
                Stop Recording
              </button>
            )}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-xl font-bold">Audio Notes</h2>

          <div className="mt-4 space-y-3">
            {audioNotes.map(note => (
              <div
                key={note.id}
                className="flex justify-between items-center gap-3 bg-slate-800 border border-slate-700 rounded-xl p-3"
              >
                <div>
                  <p className="font-semibold">{note.audio_name}</p>
                  <p className="text-sm text-slate-400">
                    Recorded by {note.uploaded_by_name} ({displayRole(note.uploaded_by_role)})
                  </p>
                </div>

                <button
                  onClick={() => playAudioNote(note)}
                  className="bg-slate-700 hover:bg-slate-600 rounded-xl px-4 py-2"
                >
                  Play
                </button>
              </div>
            ))}
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

function displayRole(role: string) {
  if (role === 'student') return 'Beneficiary'
  if (role === 'teacher') return 'Responder'
  if (role === 'beneficiary') return 'Beneficiary'
  if (role === 'responder') return 'Responder'
  if (role === 'admin') return 'Admin'
  return role || 'Participant'
}

function callStateText(callState: CallState) {
  if (callState === 'idle') return 'Not connected'
  if (callState === 'calling') return 'Calling...'
  if (callState === 'incoming') return 'Incoming call'
  if (callState === 'connecting') return 'Connecting...'
  if (callState === 'connected') return 'Connected'
  if (callState === 'declined') return 'Call declined'
  if (callState === 'ended') return 'Call ended'
  if (callState === 'failed') return 'Connection failed'
  return 'Not connected'
}