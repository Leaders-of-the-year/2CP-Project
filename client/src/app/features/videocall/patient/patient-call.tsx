/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { useEffect, useState, useRef } from "react"
import { io, type Socket } from "socket.io-client"

import { Badge } from "@/components/ui/badge"
import { TooltipProvider } from "@/components/ui/tooltip"
import HeaderCall from "../header-call"
import FooterCall from "../footer-call"
import { SERVER_URL } from "../../../../../config"
const socket: Socket = io(SERVER_URL, {
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
          {isWaiting ? (
            <div className="text-center max-w-md">
              <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 mb-4">
                <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              </div>
              <p className="text-white font-medium">Waiting for a doctor...</p>
              {streamError && <p className="mt-4 text-red-500">Error: {streamError}</p>}
            </div>
          ) : isCallStarted ? (
            <div className="grid grid-cols-2 gap-4 w-full max-w-6xl">
              {/* Doctor's video */}
              <div className="relative">
                <div className="rounded-xl overflow-hidden aspect-video bg-gray-100">
                  <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                </div>
                <Badge className="absolute bottom-4 left-4 bg-main/90 text-white px-3 py-1">Dr Giraffe</Badge>
              </div>

              {/* Patient's video (self view) */}
              <div className="relative">
                <div className="rounded-xl overflow-hidden aspect-video bg-gray-100">
                  <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                </div>
                <Badge className="absolute bottom-4 left-4 bg-main/90 text-white px-3 py-1">You</Badge>
              </div>
            </div>
          ) : (
            <div className="text-center max-w-md">
              <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 mb-4">
                <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              </div>
              <p className="text-white font-medium">Connecting to doctor...</p>
              {streamError && <p className="mt-4 text-red-500">Error: {streamError}</p>}
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