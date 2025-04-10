"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Upload, Video, Phone, Mic, Settings } from "lucide-react"

interface FooterCallProps {
  isMuted: boolean
  isVideoOff: boolean
  toggleMute: () => void
  toggleVideo: () => void
  endCall: () => void
}

export default function FooterCall({ toggleMute, toggleVideo, endCall, isMuted, isVideoOff }: FooterCallProps) {
  return (
    <TooltipProvider>
      <footer className="py-3 px-6 flex items-center justify-between bg-[#3A3B3C]">
        <div>
          <Button
            variant="ghost"
            className="bg-black hover:bg-gray-900 text-white rounded-full px-4 h-12 flex items-center gap-2"
          >
            <Upload className="h-5 w-5" />
            <span className="font-medium">Upload files</span>
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={toggleVideo}
                size="icon"
                variant="ghost"
                className="w-12 h-12 rounded-full bg-black hover:bg-gray-900"
              >
                <Video className="h-5 w-5 text-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isVideoOff ? "Turn on camera" : "Turn off camera"}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={endCall}
                size="icon"
                variant="destructive"
                className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700"
              >
                <Phone className="h-5 w-5 text-white rotate-[135deg]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>End call</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={toggleMute}
                size="icon"
                variant="ghost"
                className="w-12 h-12 rounded-full bg-black hover:bg-gray-900"
              >
                <Mic className="h-5 w-5 text-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isMuted ? "Unmute" : "Mute"}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="w-12 h-12 rounded-full bg-black hover:bg-gray-900">
                <Settings className="h-5 w-5 text-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </footer>
    </TooltipProvider>
  )
}
