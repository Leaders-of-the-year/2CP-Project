"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Camera, Maximize2, Mic, PhoneOff, Plus, Settings, FileText } from 'lucide-react'
import { io, Socket } from "socket.io-client"

type UserRole = "doctor" | "patient"

export default function VideoCall({ role = "doctor" }: { role?: UserRole }) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isCallActive, setIsCallActive] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [status, setStatus] = useState<string>(role === "doctor" ? "Waiting for patients..." : "Requesting doctor...")
  const [waitingPatientId, setWaitingPatientId] = useState<string | null>(null)
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const socketRef = useRef<Socket | null>(null)
  
  // Initialize media and socket connection
  useEffect(() => {
    const initMedia = async () => {
      try {
        // Get local media stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: isVideoOn,
          audio: true
        })
        
        // Store the stream and display it
        localStreamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
        
        // Initialize socket connection to HTTPS server
        // Make sure to update this URL to your actual server URL
        const socket = io("https://localhost:3000", {
          rejectUnauthorized: false, // Only for development with self-signed certificates
          secure: true,
          transports: ['websocket']
        })
        
        socketRef.current = socket
        
        // Register as doctor or patient
        if (role === "doctor") {
          socket.emit("register-doctor")
        } else {
          socket.emit("request-call")
        }
        
        // Set up socket event listeners
        setupSocketListeners(socket)
        
      } catch (error) {
        console.error("Error accessing media devices:", error)
        setStatus("Error accessing camera/microphone")
      }
    }
    
    initMedia()
    
    // Cleanup function
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
      }
      
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }
      
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [role, isVideoOn])
  
  // Set up socket event listeners
  const setupSocketListeners = (socket: Socket) => {
    // For doctors: notification when a patient is waiting
    socket.on("patient-waiting", (patientId: string) => {
      setWaitingPatientId(patientId)
      setStatus("Patient waiting...")
    })
    
    // For both: when a call is accepted
    socket.on("call-accepted", (remoteId: string) => {
      setIsCallActive(true)
      setStatus(`Connected to ${role === "doctor" ? "patient" : "doctor"}`)
      createPeerConnection(remoteId, role === "doctor")
    })
    
    // Handle WebRTC signaling
    socket.on("offer", async ({ offer, from }: { offer: RTCSessionDescriptionInit, from: string }) => {
      if (!peerConnectionRef.current) {
        createPeerConnection(from, false)
      }
      
      await peerConnectionRef.current!.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await peerConnectionRef.current!.createAnswer()
      await peerConnectionRef.current!.setLocalDescription(answer)
      socket.emit("answer", { answer, to: from })
    })
    
    socket.on("answer", ({ answer, from }: { answer: RTCSessionDescriptionInit, from: string }) => {
      peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(answer))
    })
    
    socket.on("ice-candidate", ({ candidate, from }: { candidate: RTCIceCandidateInit, from: string }) => {
      peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate))
    })
    
    socket.on("call-ended", () => {
      endCall()
    })
    
    // Handle connection errors
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
      setStatus("Connection error. Please check server.")
    })
  }
  
  // Create WebRTC peer connection
  const createPeerConnection = (remoteId: string, isInitiator: boolean) => {
    const config = { 
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ] 
    }
    
    const peerConnection = new RTCPeerConnection(config)
    peerConnectionRef.current = peerConnection
    
    // Add local tracks to the peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        if (localStreamRef.current) {
          peerConnection.addTrack(track, localStreamRef.current)
        }
      })
    }
    
    // Handle ICE candidates
    peerConnection.onicecandidate = ({ candidate }) => {
      if (candidate && socketRef.current) {
        socketRef.current.emit("ice-candidate", { candidate, to: remoteId })
      }
    }
    
    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      switch(peerConnection.connectionState) {
        case "connected":
          setStatus("WebRTC connected")
          break
        case "disconnected":
        case "failed":
          setStatus("Connection lost")
          break
        case "closed":
          setStatus("Connection closed")
          break
      }
    }
    
    // Handle incoming tracks
    peerConnection.ontrack = ({ streams }) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = streams[0]
      }
    }
    
    // If we're the initiator (doctor), create and send an offer
    if (isInitiator) {
      peerConnection.createOffer()
        .then(offer => peerConnection.setLocalDescription(offer))
        .then(() => {
          if (socketRef.current) {
            socketRef.current.emit("offer", { 
              offer: peerConnection.localDescription, 
              to: remoteId 
            })
          }
        })
        .catch(err => console.error("Error creating offer:", err))
    }
  }
  
  // Accept waiting patient (for doctors only)
  const acceptPatient = () => {
    if (role === "doctor" && waitingPatientId && socketRef.current) {
      socketRef.current.emit("accept-patient", waitingPatientId)
      setWaitingPatientId(null)
    }
  }
  
  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks()
      audioTracks.forEach(track => {
        track.enabled = isMuted
      })
      setIsMuted(!isMuted)
    }
  }
  
  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks()
      videoTracks.forEach(track => {
        track.enabled = !isVideoOn
      })
      setIsVideoOn(!isVideoOn)
    }
  }
  
  // End call
  const endCall = () => {
    setIsCallActive(false)
    setStatus(role === "doctor" ? "Waiting for patients..." : "Call ended. Refresh to try again.")
    
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
  }
  
  // Toggle fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullScreen(!isFullScreen)
  }

  return (
    <div className="relative w-full max-w-6xl bg-gray-400/20 rounded-lg overflow-hidden">
      <div className="p-4 flex justify-between items-center">
        <div className="text-sm text-gray-200">video call Primary() - {status}</div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            className="bg-black hover:bg-black/80 text-white rounded-full flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Add Prescriptions</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white rounded-full"
            onClick={toggleFullScreen}
          >
            <Maximize2 size={20} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 p-6">
        <div className="bg-white rounded-lg aspect-square flex items-center justify-center relative overflow-hidden">
          {isVideoOn ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <Avatar className="w-24 h-24 border-4 border-white">
              <AvatarImage 
                src="/placeholder.svg?height=96&width=96" 
                alt="You" 
              />
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
          )}
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            You ({role})
          </div>
        </div>

        <div className="bg-white rounded-lg aspect-square flex items-center justify-center relative overflow-hidden">
          {isCallActive ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <Avatar className="w-24 h-24 border-4 border-white">
              <AvatarImage 
                src="/placeholder.svg?height=96&width=96" 
                alt={role === "doctor" ? "Patient" : "Doctor"} 
              />
              <AvatarFallback>{role === "doctor" ? "P" : "Dr"}</AvatarFallback>
            </Avatar>
          )}
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {role === "doctor" ? "Patient" : "Doctor"}
          </div>
        </div>
      </div>

      <div className="p-4 flex justify-between items-center">
        {role === "doctor" && waitingPatientId ? (
          <Button 
            variant="outline" 
            className="bg-green-600 hover:bg-green-700 text-white border-none"
            onClick={acceptPatient}
          >
            Accept Patient
          </Button>
        ) : (
          <Button variant="outline" className="bg-black/50 hover:bg-black/70 text-white border-none gap-2">
            <FileText size={16} />
            <span>Show Medical form</span>
          </Button>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full p-3 ${isVideoOn ? "bg-black/50" : "bg-red-600"}`}
            onClick={toggleVideo}
          >
            <Camera size={20} />
          </Button>

          <Button 
            variant="default" 
            size="icon" 
            className="rounded-full p-4 bg-red-600 hover:bg-red-700"
            onClick={endCall}
          >
            <PhoneOff size={20} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full p-3 ${isMuted ? "bg-red-600" : "bg-black/50"}`}
            onClick={toggleMute}
          >
            <Mic size={20} />
          </Button>

          <Button variant="ghost" size="icon" className="rounded-full p-3 bg-black/50">
            <Settings size={20} />
          </Button>
        </div>
      </div>

      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded-t-md">
        1920 x 970.58 Hug
      </div>
    </div>
  )
}
