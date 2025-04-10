"use client"
import { useEffect, useState, useRef } from "react"
import { io, type Socket } from "socket.io-client"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Info,
  Users,
  MessageSquare,
  Subtitles,
  Phone,
  Hand,
  BarChart,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import HeaderCall from "../header-call"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const socket: Socket = io("https://192.168.43.25:3001", {
  secure: true,
  rejectUnauthorized: false,
  query: { role: "doctor" },
})

export default function Doctor() {
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null)
  const [isCallStarted, setIsCallStarted] = useState<boolean>(false)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [patientId, setPatientId] = useState<string | null>(null)
  const [connectionState, setConnectionState] = useState<string>("new")
  const [waitingPatientId, setWaitingPatientId] = useState<string | null>(null)
  const [streamError, setStreamError] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false)
  const [isRecording, setIsRecording] = useState<boolean>(true)
  const [recordingTime, setRecordingTime] = useState<string>("10:32")

  const hasRegistered = useRef<boolean>(false)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

  // Queue for storing ICE candidates received before peer connection is ready
  const pendingIceCandidates = useRef<RTCIceCandidateInit[]>([])
  // Store the answer until we're ready to handle it
  const pendingAnswer = useRef<RTCSessionDescriptionInit | null>(null)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    console.log("👨‍⚕️ Doctor component initialized")

    const initialize = async () => {
      console.log("Starting initialization...")
      const stream = await setupLocalStream() // Get stream directly
      console.log("Local stream after setup (direct):", stream)

      if (stream && !hasRegistered.current) {
        socket.emit("register-doctor")
        console.log("👨‍⚕️ Doctor registered with socket ID:", socket.id)
        hasRegistered.current = true
      } else if (!stream) {
        console.warn("⚠️ Did not register doctor: stream is null")
      } else {
        console.log("ℹ️ Skipping registration: Doctor already registered")
      }
    }

    if (!hasRegistered.current) {
      initialize()
    } else {
      console.log("ℹ️ Component re-mounted, but doctor already registered")
    }

    socket.on("patient-waiting", (patId: string) => {
      console.log("🧑‍💼 New patient waiting:", patId)
      console.log("Local stream when patient is waiting:", localStreamRef.current)
      if (!isCallStarted && !waitingPatientId) {
        setWaitingPatientId(patId)
        console.log("✅ Updated UI to show patient", patId)
      } else {
        console.log("ℹ️ Ignoring patient request: Doctor is busy or already has a waiting patient")
      }
    })

    socket.on("call-accepted", (patId: string) => {
      console.log("✅ Call accepted with patient:", patId)
      console.log("Local stream before setupCall:", localStreamRef.current)
      setPatientId(patId)
      setupCall(patId)

      // Process any pending answer
      if (pendingAnswer.current && peerConnectionRef.current) {
        console.log("Processing pending answer")
        handleAnswer(pendingAnswer.current)
        pendingAnswer.current = null
      }

      // Process any pending ICE candidates
      if (pendingIceCandidates.current.length > 0 && peerConnectionRef.current) {
        console.log(`Processing ${pendingIceCandidates.current.length} pending ICE candidates`)
        pendingIceCandidates.current.forEach((candidate) => {
          handleNewICECandidate(candidate)
        })
        pendingIceCandidates.current = []
      }
    })

    socket.on("receive-answer", ({ answer, from }: { answer: RTCSessionDescriptionInit; from: string }) => {
      console.log("📝 Received answer from patient:", from)
      if (peerConnectionRef.current) {
        handleAnswer(answer)
      } else {
        console.log("⏳ Storing answer until peer connection is ready")
        pendingAnswer.current = answer
      }
    })

    socket.on("receive-ice-candidate", ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      console.log("❄️ Received ICE candidate from patient")
      if (peerConnectionRef.current) {
        handleNewICECandidate(candidate)
      } else {
        console.log("⏳ Storing ICE candidate until peer connection is ready")
        pendingIceCandidates.current.push(candidate)
      }
    })

    socket.on("call-ended", () => {
      console.log("📞 Call ended by patient")
      endCall()
    })

    return () => {
      console.log("Cleaning up Doctor component...")
      socket.off("patient-waiting")
      socket.off("call-accepted")
      socket.off("receive-answer")
      socket.off("receive-ice-candidate")
      socket.off("call-ended")

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
      }
      setPeerConnection(null)
    }
  }, [])

  // Fix the setupLocalStream function to ensure local video is properly displayed
  const setupLocalStream = async (): Promise<MediaStream | null> => {
    try {
      console.log("🎥 Setting up local stream...")
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      console.log("✅ Local stream obtained:", stream.id)
      console.log("Stream tracks:", stream.getTracks())

      // Store stream in state AND ref
      setLocalStream(stream)
      localStreamRef.current = stream

      // Ensure local video is displayed
      if (localVideoRef.current) {
        console.log("📺 Setting local video source")
        localVideoRef.current.srcObject = stream
        // Ensure the video plays
        localVideoRef.current.play().catch((e) => console.error("Error playing local video:", e))
      } else {
        console.warn("⚠️ localVideoRef is null")
      }
      return stream
    } catch (error) {
      console.error("❌ Error accessing media devices:", error)
      setStreamError(error instanceof Error ? error.message : "Unknown error")
      return null
    }
  }

  const setupCall = async (patId: string) => {
    console.log("🔄 Attempting to setup WebRTC connection with patient:", patId)
    console.log("Current localStream ref:", localStreamRef.current)
    if (!localStreamRef.current) {
      console.error("❌ Cannot setup call: localStream is not ready")
      setStreamError("Local stream not available. Please check camera/microphone permissions.")
      return
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
    })

    pc.onconnectionstatechange = () => {
      console.log("Connection state changed:", pc.connectionState)
      setConnectionState(pc.connectionState)
    }
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("❄️ Sending ICE candidate to patient")
        socket.emit("send-ice-candidate", { candidate: event.candidate, to: patId })
      }
    }
    pc.ontrack = (event) => {
      console.log("📹 Received remote track:", event.track.kind)
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0]
      } else {
        console.warn("⚠️ remoteVideoRef is null")
      }
    }

    console.log("Adding local tracks to peer connection...")
    localStreamRef.current.getTracks().forEach((track) => {
      console.log(`Adding track: ${track.kind}`)
      pc.addTrack(track, localStreamRef.current!)
    })

    // Store in both state and ref
    setPeerConnection(pc)
    peerConnectionRef.current = pc

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    socket.emit("send-offer", { offer, to: patId })

    setIsCallStarted(true)
  }

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) {
      console.error("❌ PeerConnection is null")
      return
    }
    console.log("Handling answer from patient...")
    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer))
  }

  const handleNewICECandidate = async (candidate: RTCIceCandidateInit) => {
    if (!peerConnectionRef.current) {
      console.error("❌ PeerConnection is null")
      return
    }
    console.log("Adding ICE candidate...")
    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate))
  }

  const endCall = () => {
    console.log("Ending call...")
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    setPeerConnection(null)
    setIsCallStarted(false)
    setPatientId(null)
    setWaitingPatientId(null)
    setConnectionState("new")
    pendingIceCandidates.current = []
    pendingAnswer.current = null
  }

  const acceptPatient = () => {
    if (waitingPatientId) {
      console.log("Accepting patient:", waitingPatientId)
      console.log("Local stream before accepting:", localStreamRef.current)
      socket.emit("accept-patient", waitingPatientId)
      setWaitingPatientId(null)
    } else {
      console.warn("⚠️ No waiting patient to accept")
    }
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks()
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks()
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsVideoOff(!isVideoOff)
    }
  }

  // Add this function to ensure video elements are properly set up when component mounts
  useEffect(() => {
    // Make sure local video is displayed if stream exists
    if (localStreamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current
    }

    // Make sure remote video is displayed if call is started
    if (isCallStarted && remoteVideoRef.current && remoteVideoRef.current.srcObject === null) {
      console.log("Attempting to recover remote video display")
      if (peerConnectionRef.current) {
        const receivers = peerConnectionRef.current.getReceivers()
        const videoReceiver = receivers.find((receiver) => receiver.track?.kind === "video")
        if (videoReceiver && videoReceiver.track) {
          const stream = new MediaStream([videoReceiver.track])
          remoteVideoRef.current.srcObject = stream
        }
      }
    }
  }, [isCallStarted])

  return (
    <TooltipProvider>
      <div className="flex flex-col h-[100vh]  w-full  shadow-md overflow-hidden">
        {/* Header */}
             <HeaderCall/>
    
        {/* Main content */}
        <div className="flex flex-1 overflow-hidden ">
          {/* Video area */}
          <div className="flex-1 flex">
            {isCallStarted ? (
              <div className="flex-1 grid grid-cols-2 gap-0">
                {/* Patient's video */}
                <div className="relative flex items-center justify-center bg-gradient-to-r from-[#e8eef0] to-[#d6e0e4] p-4">
                  <Badge variant="secondary" className="absolute top-3 left-3 bg-main text-white">
                    Jane Cooper
                  </Badge>
                  <div className="w-full aspect-video border-4 border-white overflow-hidden bg-gray-100">
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Doctor's video (self view) */}
                <div className="relative flex items-center justify-center bg-gradient-to-r from-[#d6e0e4] to-[#c5d2d8] p-4">
                  <Badge variant="secondary" className="absolute top-3 left-3 bg-main text-white">
                    You
                  </Badge>
                  <div className="w-full aspect-video border-4 border-white overflow-hidden bg-gray-100">
                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                  </div>

                  {isRecording && (
                    <Badge variant="destructive" className="absolute bottom-8 flex bg-main items-center gap-1">
                      <span className="mr-1">REC</span>
                      <span>{recordingTime}</span>
                    </Badge>
                  )}
                </div>
              </div>
            ) : waitingPatientId ? (
              // Fix the waiting patient view to properly show local video
              <div className="flex-1 flex items-center justify-center bg-gradient-to-r from-[#e8eef0] to-[#d6e0e4]">
                <div className="text-center">
                  <div className="w-full max-w-md mx-auto mb-4">
                    <div className="aspect-video border-4 border-white overflow-hidden bg-gray-100">
                      <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <p className="text-main font-medium mb-2">Patient waiting: {waitingPatientId}</p>
                  <Button onClick={acceptPatient} variant="default" className="bg-main hover:bg-main/90 text-white h-[40px]">
                    Accept Patient
                  </Button>
                  <Badge variant="outline" className="mt-2 text-xs bg-main text-alt  block mx-auto">
                    Connection state: {connectionState}
                  </Badge>
                  {streamError && (
                    <Badge variant="destructive" className="mt-2 block mx-auto">
                      Error: {streamError}
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-r from-[#e8eef0] to-[#d6e0e4]">
                <div className="text-center">
                  <div className="w-full max-w-md mx-auto mb-4">
                    <div className="aspect-video border-4 border-white overflow-hidden bg-gray-100">
                      <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <p className="text-main font-medium">Waiting for patients...</p>
                  <Badge variant="outline" className="mt-2 text-xs h-[40px] bg-main mx-2">
                    Connection state: {connectionState}
                  </Badge>
                  {streamError && (
                    <Badge variant="destructive" className="mt-2 h-[40px] bg-main">
                      Error: {streamError}
                    </Badge>
                  )}
                </div>
              </div>
            )}
            {/* Sidebar */}
          </div>

          <div className="w-16 border-l flex flex-col items-center py-4 bg-white">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-10 h-10 mb-6 rounded-full">
                  <Info className="h-5 w-5 text-main" />
                  <span className="sr-only">Info</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Info</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-10 h-10 mb-6 rounded-full">
                  <Users className="h-5 w-5 text-main" />
                  <span className="sr-only">Persons</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Persons</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-10 h-10 mb-6 rounded-full">
                  <MessageSquare className="h-5 w-5 text-main" />
                  <span className="sr-only">Chat</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Chat</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-10 h-10 mb-6 rounded-full">
                  <Subtitles className="h-5 w-5 text-main" />
                  <span className="sr-only">Subtitle</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Subtitle</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

     

        {/* Footer with controls */}
        <footer className="border-t  py-3 px-4 flex items-center  justify-between bg-main">
          <div className="text-main font-medium">00:16:54</div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={toggleMute}
                  size="icon"
                  variant={isMuted ? "secondary" : "outline"}
                  className="w-10 h-10 rounded-full"
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isMuted ? "Unmute" : "Mute"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={toggleVideo}
                  size="icon"
                  variant={isVideoOff ? "secondary" : "outline"}
                  className="w-10 h-10 rounded-full"
                >
                  {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isVideoOff ? "Turn on camera" : "Turn off camera"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="outline" className="w-10 h-10 rounded-full">
                  <Hand className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Raise hand</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="outline" className="w-10 h-10 rounded-full">
                  <BarChart className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Show stats</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="destructive" className="w-10 h-10 rounded-full">
                  <span className="h-3 w-3 rounded-full bg-white" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Record</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="w-10 h-10 rounded-full">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>More options</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Button onClick={endCall} variant="destructive" className="flex items-center gap-1 bg-red-500">
            <Phone className="h-4 w-4" />
            <span>End Meeting</span>
          </Button>
        </footer>
      </div>
    </TooltipProvider>
  )
}
