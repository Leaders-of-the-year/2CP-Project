"use client"

import { useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Camera, Maximize2, Mic, PhoneOff, Plus, Settings, FileText } from "lucide-react"

export default function VideoCall() {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)

  return (
    <div className="relative w-full max-w-6xl bg-gray-400/20 rounded-lg overflow-hidden">
      <div className="p-4 flex justify-between items-center">
        <div className="text-sm text-gray-200">video call Primary()</div>
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            className="bg-black hover:bg-black/80 text-white rounded-full flex items-center gap-2 w-full"
          >
            <Plus size={16} />
            <span>Add Prescriptions</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-white rounded-full">
            <Maximize2 size={20} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 p-6">
        <div className="bg-white rounded-lg aspect-square flex items-center justify-center">
          <Avatar className="w-24 h-24 border-4 border-white">
            <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Patient" />
            <AvatarFallback>P</AvatarFallback>
          </Avatar>
        </div>

        <div className="bg-white rounded-lg aspect-square flex items-center justify-center">
          <Avatar className="w-24 h-24 border-4 border-white">
            <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Doctor" />
            <AvatarFallback>D</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="p-4 flex justify-between items-center">
        <Button variant="outline" className="bg-black/50 hover:bg-black/70 text-white border-none gap-2 w-80">
          <FileText size={16} />
          <span >Show Medical form</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full p-3 ${isVideoOn ? "bg-black/50" : "bg-red-600"}`}
            onClick={() => setIsVideoOn(!isVideoOn)}
          >
            <Camera size={20} />
          </Button>

          <Button variant="default" size="icon" className="rounded-full p-4 bg-red-600 hover:bg-red-700">
            <PhoneOff size={20} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full p-3 ${isMuted ? "bg-red-600" : "bg-black/50"}`}
            onClick={() => setIsMuted(!isMuted)}
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

