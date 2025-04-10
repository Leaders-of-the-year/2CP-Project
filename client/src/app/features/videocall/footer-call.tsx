import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    Phone,
    Hand,
    BarChart,
    MoreHorizontal,
  } from "lucide-react"
interface FooterCallProps {
    isMuted:boolean;
    isVideoOff:boolean;
    toggleMute: () => void;
    toggleVideo: () => void;
    endCall: () => void;
}
export default function FooterCall({toggleMute, toggleVideo, endCall,isMuted, isVideoOff}:FooterCallProps) {
    return (
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
    );
}