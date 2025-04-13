"use client"

import { useEffect, useRef, useState } from "react"
import type { Socket } from "socket.io-client"

type WebRTCHookProps = {
  socket: Socket | null
  isCallStarted: boolean
  remoteId: string | null
}

export function useWebRTC({ socket, isCallStarted, remoteId }: WebRTCHookProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [connectionState, setConnectionState] = useState<string>("new")
  const [streamError, setStreamError] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false)

  const localStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const pendingIceCandidates = useRef<RTCIceCandidateInit[]>([])
  const pendingRemoteDescription = useRef<RTCSessionDescriptionInit | null>(null)

  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)

  // Initialize local stream
  useEffect(() => {
    const setupLocalStream = async () => {
      try {
        console.log("🎥 Setting up local stream...")
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        console.log("✅ Local stream obtained:", stream.id)

        setLocalStream(stream)
        localStreamRef.current = stream

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
          localVideoRef.current.play().catch((e) => console.error("Error playing local video:", e))
        }

        return stream
      } catch (error) {
        console.error("❌ Error accessing media devices:", error)
        setStreamError(error instanceof Error ? error.message : "Unknown error")
        return null
      }
    }

    setupLocalStream()

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // Setup WebRTC when call starts
  useEffect(() => {
    if (!isCallStarted || !socket || !remoteId || !localStreamRef.current) return

    const setupPeerConnection = async () => {
      console.log("🔄 Setting up WebRTC peer connection with:", remoteId)

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
      })

      pc.onconnectionstatechange = () => {
        console.log("Connection state changed:", pc.connectionState)
        setConnectionState(pc.connectionState)
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("❄️ Sending ICE candidate")
          socket.emit("send-ice-candidate", { candidate: event.candidate, to: remoteId })
        }
      }

      pc.ontrack = (event) => {
        console.log("📹 Received remote track:", event.track.kind)
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]
        }
      }

      // Add local tracks to peer connection
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!)
      })

      peerConnectionRef.current = pc

      // Process any pending ICE candidates
      if (pendingIceCandidates.current.length > 0) {
        console.log(`Processing ${pendingIceCandidates.current.length} pending ICE candidates`)
        pendingIceCandidates.current.forEach((candidate) => {
          pc.addIceCandidate(new RTCIceCandidate(candidate))
        })
        pendingIceCandidates.current = []
      }

      // Process any pending remote description
      if (pendingRemoteDescription.current) {
        console.log("Processing pending remote description")
        await pc.setRemoteDescription(new RTCSessionDescription(pendingRemoteDescription.current))
        pendingRemoteDescription.current = null
      }

      return pc
    }

    setupPeerConnection()

    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
      }
    }
  }, [isCallStarted, socket, remoteId])

  // Setup socket event listeners for WebRTC signaling
  useEffect(() => {
    if (!socket) return

    const handleOffer = async (offer: RTCSessionDescriptionInit, from: string) => {
      console.log("📝 Received offer from:", from)

      if (!peerConnectionRef.current) {
        console.log("⏳ Storing offer until peer connection is ready")
        pendingRemoteDescription.current = offer
        return
      }

      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await peerConnectionRef.current.createAnswer()
      await peerConnectionRef.current.setLocalDescription(answer)
      socket.emit("send-answer", { answer, to: from })
    }

    const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
      console.log("📝 Received answer")

      if (!peerConnectionRef.current) {
        console.log("⏳ Storing answer until peer connection is ready")
        pendingRemoteDescription.current = answer
        return
      }

      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer))
    }

    const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
      console.log("❄️ Received ICE candidate")

      if (!peerConnectionRef.current) {
        console.log("⏳ Storing ICE candidate until peer connection is ready")
        pendingIceCandidates.current.push(candidate)
        return
      }

      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate))
    }

    socket.on("receive-offer", ({ offer, from }) => handleOffer(offer, from))
    socket.on("receive-answer", ({ answer }) => handleAnswer(answer))
    socket.on("receive-ice-candidate", ({ candidate }) => handleIceCandidate(candidate))

    return () => {
      socket.off("receive-offer")
      socket.off("receive-answer")
      socket.off("receive-ice-candidate")
    }
  }, [socket])

  // Create and send offer (for initiator)
  const createAndSendOffer = async () => {
    if (!socket || !peerConnectionRef.current || !remoteId) return

    try {
      const offer = await peerConnectionRef.current.createOffer()
      await peerConnectionRef.current.setLocalDescription(offer)
      socket.emit("send-offer", { offer, to: remoteId })
    } catch (error) {
      console.error("Error creating offer:", error)
    }
  }

  // Media controls
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

  return {
    localStream,
    connectionState,
    streamError,
    isMuted,
    isVideoOff,
    localVideoRef,
    remoteVideoRef,
    toggleMute,
    toggleVideo,
    createAndSendOffer,
  }
}
