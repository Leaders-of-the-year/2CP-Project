import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Maximize2 } from "lucide-react"

export default function HeaderCall() {
  return (
    <header className="flex items-center justify-end p-4 bg-[#1E1F22]">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-black rounded-full px-4 py-2">
          <div className="flex -space-x-1 mr-1">
            <Avatar className="h-6 w-6 border-2 border-black">
              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs">
                J
              </AvatarFallback>
            </Avatar>
          </div>
          <span className="text-sm font-medium text-white">2 Personnes</span>
        </div>
        <button className="flex items-center justify-center h-10 w-10 rounded-full bg-black text-white hover:bg-gray-800 transition-colors">
          <Maximize2 size={18} />
        </button>
      </div>
    </header>
  )
}
