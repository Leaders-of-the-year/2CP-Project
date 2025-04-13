"use client"
import { useEffect, useState, useRef } from "react"
import { io, type Socket } from "socket.io-client"

import { Button } from "@/components/ui/button"
import HeaderCall from "../header-call"
import FooterCall from "../footer-call"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SERVER_URL } from "../../../../../config"
const socket: Socket = io(SERVER_URL, {
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
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [recordingTime, setRecordingTime] = useState<string>("00:00")
  // Add state for waiting patients list
  const [waitingPatients, setWaitingPatients] = useState<string[]>([])

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
        
        // Request waiting patients list after registering
        socket.emit("get-waiting-patients")
        console.log("🔄 Requested waiting patients list")
      } else if (!stream) {
        console.warn("⚠️ Did not register doctor: stream is null")
      } else {
        console.log("ℹ️ Skipping registration: Doctor already registered")
        // Request waiting patients list anyway
        socket.emit("get-waiting-patients")
        console.log("🔄 Requested waiting patients list")
      }
    }

    if (!hasRegistered.current) {
      initialize()
    } else {
      console.log("ℹ️ Component re-mounted, but doctor already registered")
      // Request waiting patients list on remount
      socket.emit("get-waiting-patients")
      console.log("🔄 Requested waiting patients list")
    }

    // Listen for waiting patients updates
    socket.on("waiting-patients-updated", (patientsList: string[]) => {
      console.log("📋 Received waiting patients list:", patientsList)
      setWaitingPatients(patientsList)
    })

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
      socket.off("waiting-patients-updated") // Remove the new listener
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

  // Effect to periodically refresh waiting patients list
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (hasRegistered.current && !isCallStarted) {
        socket.emit("get-waiting-patients")
        console.log("🔄 Periodically refreshing waiting patients list")
      }
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(intervalId)
  }, [isCallStarted])

  // Log waitingPatients changes
  useEffect(() => {
    console.log("🧑‍💼 Current waiting patients state:", waitingPatients)
  }, [waitingPatients])

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
    
    // Refresh waiting patients list after call ends
    socket.emit("get-waiting-patients")
    console.log("🔄 Requesting waiting patients list after call end")
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
      <div className="flex flex-col h-screen w-full overflow-hidden bg-[#1E1F22]">
        {/* Header */}
        <HeaderCall />
    
        {/* Main content */}
        <div className="flex-1 p-4 flex items-center justify-center">
          {isCallStarted ? (
            <div className="grid grid-cols-2 gap-4 w-full max-w-6xl">
              {/* Patient's video */}
              <div className="relative">
                <div className="rounded-xl overflow-hidden aspect-video bg-gray-100">
                  <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                </div>
                <Badge className="absolute bottom-4 left-4 bg-teal-600 text-white px-3 py-1">
                  Dr Giraffe
                </Badge>
              </div>

              {/* Doctor's video (self view) */}
              <div className="relative">
                <div className="rounded-xl overflow-hidden aspect-video bg-gray-100">
                  <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                </div>
                <Badge className="absolute bottom-4 left-4 bg-teal-600 text-white px-3 py-1">
                  You
                </Badge>
              </div>
            </div>
          ) : waitingPatientId ? (
            <div className="text-center max-w-md">
              <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 mb-4">
                <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              </div>
              <p className="text-white font-medium mb-4">Patient waiting: {waitingPatientId}</p>
              <Button 
                onClick={acceptPatient} 
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                Accept Patient
              </Button>
              {streamError && (
                <p className="mt-4 text-red-500">Error: {streamError}</p>
              )}
            </div>
          ) : (
            <div className="text-center max-w-md">
              <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 mb-4">
                <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              </div>
              <p className="text-white font-medium">Waiting for patients...</p>
              {streamError && (
                <p className="mt-4 text-red-500">Error: {streamError}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer with controls */}
        <FooterCall 
          isMuted={isMuted} 
          isVideoOff={isVideoOff} 
          toggleVideo={toggleVideo} 
          toggleMute={toggleMute} 
          endCall={endCall}
        />
      </div>
    </TooltipProvider>
  )
}