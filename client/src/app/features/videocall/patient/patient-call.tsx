"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider } from "@/components/ui/tooltip"
import HeaderCall from "../header-call"
import FooterCall from "../footer-call"
import { useSocketIO } from "@/hooks/use-socket-io"
import { useWebRTC } from "@/hooks/use-webrtc"

export default function PatientCallPage() {
  const router = useRouter()
  const { socket, currentDoctorId, callStatus, requestCall } = useSocketIO("patient")
  const [isCallStarted, setIsCallStarted] = useState(false)
  const [isWaiting, setIsWaiting] = useState(true)
  const [doctorName, setDoctorName] = useState("Doctor")
  const [waitTime, setWaitTime] = useState(0)
  const [waitTimeInterval, setWaitTimeInterval] = useState<NodeJS.Timeout | null>(null)

  // Initialize WebRTC with the current doctor
  const { localVideoRef, remoteVideoRef, streamError, isMuted, isVideoOff, toggleMute, toggleVideo } = useWebRTC({
    socket,
    isCallStarted,
    remoteId: currentDoctorId,
  })

  // Request a call when component mounts
  useEffect(() => {
    if (callStatus === "idle") {
      requestCall()

      // Start a timer to track waiting time
      const interval = setInterval(() => {
        setWaitTime((prev) => prev + 1)
      }, 1000)
      setWaitTimeInterval(interval)
    }

    return () => {
      if (waitTimeInterval) {
        clearInterval(waitTimeInterval)
      }
    }
  }, [callStatus, requestCall])

  // Update call status
  useEffect(() => {
    if (callStatus === "waiting") {
      setIsWaiting(true)
      setIsCallStarted(false)
    } else if (callStatus === "connected") {
      setIsWaiting(false)
      setIsCallStarted(true)

      // Stop the wait timer
      if (waitTimeInterval) {
        clearInterval(waitTimeInterval)
        setWaitTimeInterval(null)
      }

      // Set doctor name if we have an ID
      if (currentDoctorId) {
        setDoctorName(`Dr. ${currentDoctorId.substring(0, 4)}`)
      }
    } else if (callStatus === "ended") {
      setIsWaiting(true)
      setIsCallStarted(false)

      // Reset wait time for new call
      setWaitTime(0)

      // Start a new timer
      if (!waitTimeInterval) {
        const interval = setInterval(() => {
          setWaitTime((prev) => prev + 1)
        }, 1000)
        setWaitTimeInterval(interval)
      }

      // Request a new call after the previous one ends
      requestCall()
    }
  }, [callStatus, currentDoctorId, requestCall, waitTimeInterval])

  const handleEndCall = () => {
    socket?.emit("end-call")
    router.push("/")
  }

  // Format wait time as minutes and seconds
  const formatWaitTime = () => {
    const minutes = Math.floor(waitTime / 60)
    const seconds = waitTime % 60
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

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
              <p className="text-white font-medium mb-2">Waiting for a doctor...</p>
              <p className="text-gray-400 text-sm">Wait time: {formatWaitTime()}</p>
              {streamError && <p className="mt-4 text-red-500">Error: {streamError}</p>}
            </div>
          ) : isCallStarted ? (
            <div className="grid grid-cols-2 gap-4 w-full max-w-6xl">
              {/* Doctor's video */}
              <div className="relative">
                <div className="rounded-xl overflow-hidden aspect-video bg-gray-100">
                  <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                </div>
                <Badge className="absolute bottom-4 left-4 bg-teal-600 text-white px-3 py-1">{doctorName}</Badge>
              </div>

              {/* Patient's video (self view) */}
              <div className="relative">
                <div className="rounded-xl overflow-hidden aspect-video bg-gray-100">
                  <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                </div>
                <Badge className="absolute bottom-4 left-4 bg-teal-600 text-white px-3 py-1">You</Badge>
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
          endCall={handleEndCall}
        />
      </div>
    </TooltipProvider>
  )
}
