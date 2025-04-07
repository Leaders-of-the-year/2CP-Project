"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Camera, Maximize2, Mic, PhoneOff, Plus, Settings, FileText } from "lucide-react"

export default function VideoCall() {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isCallActive, setIsCallActive] = useState(true)
  const [isFullScreen, setIsFullScreen] = useState(false)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

  // Initialize WebRTC
  useEffect(() => {
    const initWebRTC = async () => {
      try {
        // Get local media stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: isVideoOn,
          audio: true,
        })

        // Store the stream and display it
        localStreamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        // Create peer connection
        const configuration = {
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        }
        const peerConnection = new RTCPeerConnection(configuration)
        peerConnectionRef.current = peerConnection

        // Add local tracks to the peer connection
        stream.getTracks().forEach((track) => {
          if (peerConnectionRef.current) {
            peerConnectionRef.current.addTrack(track, stream)
          }
        })

        // Handle incoming remote tracks
        peerConnection.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0]
          }
        }

        // For demo purposes, we'll simulate a remote connection
        // In a real app, you would implement signaling with a server
        simulateRemoteConnection()
      } catch (error) {
        console.error("Error accessing media devices:", error)
      }
    }

    if (isCallActive) {
      initWebRTC()
    }

    // Cleanup function
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop())
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }
    }
  }, [isCallActive, isVideoOn])

  // Simulate a remote connection for demo purposes
  const simulateRemoteConnection = async () => {
    if (!peerConnectionRef.current) return

    try {
      // Create and set local description
      const offer = await peerConnectionRef.current.createOffer()
      await peerConnectionRef.current.setLocalDescription(offer)

      // In a real app, you would send this offer to the remote peer via a signaling server
      console.log("Local offer created:", offer)

      // Simulate receiving an answer from the remote peer
      setTimeout(async () => {
        if (!peerConnectionRef.current) return

        // For demo, we'll use a loopback (this wouldn't work in production)
        // This is just to show how the flow would work
        const answer = await peerConnectionRef.current.createAnswer()
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer))
        await peerConnectionRef.current.setLocalDescription(answer)

        console.log("Remote answer simulated")
      }, 1000)
    } catch (error) {
      console.error("Error creating offer:", error)
    }
  }

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks()
      audioTracks.forEach((track) => {
        track.enabled = !isMuted
      })
      setIsMuted(!isMuted)
    }
  }

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks()
      videoTracks.forEach((track) => {
        track.enabled = !isVideoOn
      })
      setIsVideoOn(!isVideoOn)
    }
  }

  // End call
  const endCall = () => {
    setIsCallActive(false)
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }
  }

  // Toggle fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
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
    <div className="relative w-full  bg-gray-400/20 rounded-lg overflow-hidden ">
      <div className="p-4 flex justify-between items-center">
        <div className="text-sm text-gray-200">video call Primary()</div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            className="bg-black hover:bg-black/80 text-white rounded-full flex items-center gap-2 w-full"
          >
            <Plus size={16} />
            <span>Add Prescriptions</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-white rounded-full" onClick={toggleFullScreen}>
            <Maximize2 size={20} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 p-6">
        <div className="bg-white rounded-lg aspect-square flex items-center justify-center relative overflow-hidden">
          {isVideoOn ? (
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          ) : (
            <Avatar className="w-24 h-24 border-4 border-white">
              <AvatarImage src="/placeholder.svg?height=96&width=96" alt="You" />
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
          )}
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">You</div>
        </div>

        <div className="bg-white rounded-lg aspect-square flex items-center justify-center relative overflow-hidden">
          {isCallActive ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <Avatar className="w-24 h-24 border-4 border-white">
              <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Doctor" />
              <AvatarFallback>Dr</AvatarFallback>
            </Avatar>
          )}
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Doctor</div>
        </div>
      </div>

      <div className="p-4 flex justify-between items-center">
        <Button variant="outline" className="bg-black/50 hover:bg-black/70 text-white border-none gap-2 w-80">
          <FileText size={16} />
          <span>Show Medical form</span>
        </Button>

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

