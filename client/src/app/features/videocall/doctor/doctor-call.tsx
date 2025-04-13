"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { TooltipProvider } from "@/components/ui/tooltip"
import HeaderCall from "../header-call"
import FooterCall from "../footer-call"
import { useSocketIO } from "@/hooks/use-socket-io"
import { useWebRTC } from "@/hooks/use-webrtc"

export default function DoctorCallPage() {
  const router = useRouter()
  const { socket, currentPatientId, callStatus } = useSocketIO("doctor")
  const [isCallStarted, setIsCallStarted] = useState(false)

  // Initialize WebRTC with the current patient
  const {
    localVideoRef,
    remoteVideoRef,
    streamError,
    isMuted,
    isVideoOff,
    toggleMute,
    toggleVideo,
    createAndSendOffer,
  } = useWebRTC({
    socket,
    isCallStarted,
    remoteId: currentPatientId,
  })

  // Start call when patient is connected
  useEffect(() => {
    if (callStatus === "connected" && currentPatientId) {
      setIsCallStarted(true)
      // Create and send offer to patient
      createAndSendOffer()
    } else if (callStatus === "ended") {
      setIsCallStarted(false)
      router.push("/doctor/waiting-patients")
    }
  }, [callStatus, currentPatientId, createAndSendOffer, router])

  const handleEndCall = () => {
    socket?.emit("end-call")
    router.push("/doctor/waiting-patients")
  }

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
                <Badge className="absolute bottom-4 left-4 bg-teal-600 text-white px-3 py-1">Patient</Badge>
              </div>

              {/* Doctor's video (self view) */}
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
              <p className="text-white font-medium">Connecting to patient...</p>
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
