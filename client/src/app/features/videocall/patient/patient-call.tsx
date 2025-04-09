"use client"
import { useEffect, useState, useRef } from "react"
import { io, type Socket } from "socket.io-client"
import { Mic, MicOff, Video, VideoOff, Info, Users, MessageSquare, Subtitles, Phone, Hand, BarChart, MoreHorizontal, Plus, Settings } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const socket: Socket = io("https://192.168.43.25:3001", {
  secure: true,
  rejectUnauthorized: false,
  query: { role: "patient" },
})

export default function Patient() {
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null)
  const [isCallStarted, setIsCallStarted] = useState<boolean>(false)
  const [isWaiting, setIsWaiting] = useState<boolean>(true)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [connectionState, setConnectionState] = useState<string>("new")
  const [streamError, setStreamError] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false)
  const [isRecording, setIsRecording] = useState<boolean>(true)
  const [recordingTime, setRecordingTime] = useState<string>("10:32")

  const hasRequestedCall = useRef<boolean>(false)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

  // Queue for storing ICE candidates received before peer connection is ready
  const pendingIceCandidates = useRef<RTCIceCandidateInit[]>([])
  // Store the offer until we're ready to handle it
  const pendingOffer = useRef<{ offer: RTCSessionDescriptionInit; from: string } | null>(null)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    console.log("🧑‍💼 Patient component initialized")

    const initialize = async () => {
      console.log("Starting initialization...")
      const stream = await setupLocalStream()
      console.log("Local stream after setup (direct):", stream)

      if (stream && !hasRequestedCall.current) {
        socket.emit("request-call")
        console.log("✅ Emitted request-call")
        hasRequestedCall.current = true
      } else if (!stream) {
        console.warn("⚠️ Did not emit request-call: stream is null")
      } else {
        console.log("ℹ️ Skipping request-call: Already requested")
      }
    }

    if (!hasRequestedCall.current) {
      initialize()
    } else {
      console.log("ℹ️ Component re-mounted, but request-call already sent")
    }

    socket.on("call-accepted", async (docId: string) => {
      console.log("✅ Call accepted by doctor:", docId)
      console.log("Local stream before setupCall:", localStreamRef.current)
      if (!localStreamRef.current) {
        console.warn("⚠️ Local stream is null, re-initializing...")
        const stream = await setupLocalStream()
        if (!stream) {
          console.error("❌ Failed to re-initialize localStream")
          setStreamError("Failed to access camera/microphone.")
          return
        }
      }
      setIsWaiting(false)
      setupCall(docId)

      // Process any pending offer
      if (pendingOffer.current) {
        console.log("Processing pending offer from:", pendingOffer.current.from)
        handleOffer(pendingOffer.current.offer, pendingOffer.current.from)
        pendingOffer.current = null
      }

      // Process any pending ICE candidates
      if (pendingIceCandidates.current.length > 0) {
        console.log(`Processing ${pendingIceCandidates.current.length} pending ICE candidates`)
        pendingIceCandidates.current.forEach((candidate) => {
          handleNewICECandidate(candidate)
        })
        pendingIceCandidates.current = []
      }
    })

    socket.on("receive-offer", ({ offer, from }: { offer: RTCSessionDescriptionInit; from: string }) => {
      console.log("📝 Received offer from doctor:", from)
      if (peerConnectionRef.current) {
        handleOffer(offer, from)
      } else {
        console.log("⏳ Storing offer until peer connection is ready")
        pendingOffer.current = { offer, from }
      }
    })

    socket.on("receive-ice-candidate", ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      console.log("❄️ Received ICE candidate from doctor")
      if (peerConnectionRef.current) {
        handleNewICECandidate(candidate)
      } else {
        console.log("⏳ Storing ICE candidate until peer connection is ready")
        pendingIceCandidates.current.push(candidate)
      }
    })

    socket.on("call-ended", () => {
      console.log("📞 Call ended by doctor")
      endCall()
    })

    return () => {
      console.log("Cleaning up Patient component...")
      socket.off("call-accepted")
      socket.off("receive-offer")
      socket.off("receive-ice-candidate")
      socket.off("call-ended")

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
      }
      setPeerConnection(null)
    }
  }, []) // Empty dependency array

  const setupLocalStream = async (): Promise<MediaStream | null> => {
    try {
      console.log("🎥 Setting up local stream...")
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      console.log("✅ Local stream obtained:", stream.id)
      console.log("Stream tracks:", stream.getTracks())

      // Store stream in state AND ref
      setLocalStream(stream)
      localStreamRef.current = stream

      if (localVideoRef.current) {
        console.log("📺 Setting local video source")
        localVideoRef.current.srcObject = stream
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

  const setupCall = (docId: string) => {
    console.log("🔄 Attempting to setup WebRTC connection with doctor:", docId)
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
        console.log("❄️ Sending ICE candidate to doctor")
        socket.emit("send-ice-candidate", { candidate: event.candidate, to: docId })
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

    setIsCallStarted(true)
  }

  const handleOffer = async (offer: RTCSessionDescriptionInit, docId: string) => {
    if (!peerConnectionRef.current) {
      console.error("❌ PeerConnection is null")
      return
    }
    console.log("Handling offer from doctor...")
    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer))
    const answer = await peerConnectionRef.current.createAnswer()
    await peerConnectionRef.current.setLocalDescription(answer)
    socket.emit("send-answer", { answer, to: docId })
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
    setIsWaiting(true)
    setConnectionState("new")
    hasRequestedCall.current = false
    pendingIceCandidates.current = []
    pendingOffer.current = null

    if (localStreamRef.current) {
      socket.emit("request-call")
      console.log("✅ Emitted request-call after ending call")
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

  return (
    <TooltipProvider>
      <div className="flex flex-col h-[100vh]  w-full  shadow-md overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b bg-main">
          <h1 className="text-xl font-semibold text-alt">Individual Counselling</h1>
          <div className="flex items-center gap-2">
            <Button variant="default" className="bg-main hover:bg-main/90 text-white">
              <Plus className="mr-2 h-4 w-4" />
              <span className="text-sm">Add Person</span>
            </Button>
            <div className="flex items-center gap-1 bg-white rounded-full px-2 py-1 border border-gray-200">
              <div className="flex -space-x-2">
                <Avatar className="h-6 w-6 border-2 border-white">
                  <AvatarFallback className="bg-main text-white text-xs">J</AvatarFallback>
                </Avatar>
                <Avatar className="h-6 w-6 border-2 border-white">
                  <AvatarFallback className="bg-second text-white text-xs">D</AvatarFallback>
                </Avatar>
              </div>
              <span className="text-sm ml-1 text-main">2 Persons</span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Video area */}
          <div className="flex-1 flex">
            {isWaiting ? (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-r from-[#e8eef0] to-[#d6e0e4]">
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden mx-auto mb-4 bg-gray-100">
                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                  </div>
                  <p className="text-main font-medium">Waiting for a doctor...</p>
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
            ) : isCallStarted ? (
              <div className="flex-1 grid grid-cols-2 gap-0">
                {/* Doctor's video */}
                <div className="relative flex items-center justify-center bg-gradient-to-r from-[#e8eef0] to-[#d6e0e4] p-4">
                  <Badge variant="secondary" className="absolute top-3 left-3 bg-main text-white">
                    Jane Cooper
                  </Badge>
                  <div className="absolute top-3 right-3 flex space-x-1">
                    <Button size="icon" variant="secondary" className="w-8 h-8 rounded-full">
                      <span className="sr-only">Audio</span>
                      <div className="w-5 h-5 text-main">JC</div>
                    </Button>
                    <Button size="icon" variant="secondary" className="w-8 h-8 rounded-full bg-main text-white">
                      <span className="sr-only">Settings</span>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="w-48 h-48 rounded-full border-4 border-white overflow-hidden bg-gray-100">
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Patient's video */}
                <div className="relative flex items-center justify-center bg-gradient-to-r from-[#d6e0e4] to-[#c5d2d8] p-4">
                  <Badge variant="secondary" className="absolute top-3 left-3 bg-main text-white">
                    You
                  </Badge>
                  <div className="absolute top-3 right-3">
                    <Button size="icon" variant="secondary" className="w-8 h-8 rounded-full bg-main text-white">
                      <span className="sr-only">Settings</span>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="w-48 h-48 rounded-full border-4 border-white overflow-hidden bg-gray-100">
                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                  </div>

                  {isRecording && (
                    <Badge variant="destructive" className="absolute bottom-8 flex items-center gap-1">
                      <span className="mr-1">REC</span>
                      <span>{recordingTime}</span>
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-r from-[#e8eef0] to-[#d6e0e4]">
                <div className="text-center">
                  <p className="text-main font-medium">Connecting to doctor...</p>
                  <Badge variant="outline" className="mt-2 text-xs bg-white">
                    Connection state: {connectionState}
                  </Badge>
                  {streamError && (
                    <Badge variant="destructive" className="mt-2">
                      Error: {streamError}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
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

        {/* Testimonial/feedback */}
        {isCallStarted && (
          <div className="relative mx-auto -mt-8 mb-4 z-10">
            <div className="bg-main text-white px-6 py-3 rounded-md max-w-md shadow-md">
              <p className="text-sm">The consultation gave me a renewed sense of self-compassion and understanding.</p>
            </div>
          </div>
        )}

        {/* Footer with controls */}
        <footer className="border-t py-3 px-4 flex items-center justify-between bg-main">
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
