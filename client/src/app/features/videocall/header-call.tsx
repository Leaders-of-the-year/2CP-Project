import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
export default function HeaderCall() {
  return <header className="flex items-center justify-between p-4 border-b bg-main">
<h1 className="text-xl font-semibold text-alt">Individual Counselling</h1>
<div className="flex items-center gap-2">
  <Button variant="default" className="bg-main hover:bg-main/90 text-white rounded-md mx-4">
    <Plus className="mr-2 h-4 w-4" />
    <span className="text-sm">Add Person</span>
  </Button>
  <div className="flex items-center gap-1 bg-white rounded-full px-2 py-3 border border-gray-200">
    <div className="flex -space-x-2">
      <Avatar className="h-6 w-6 border-2 border-white">
        <AvatarFallback className="bg-main text-white text-xs">J</AvatarFallback>
      </Avatar>
      <Avatar className="h-6 w-6 border-2 border-white">
        <AvatarFallback className="bg-second text-white text-xs">D</AvatarFallback>
      </Avatar>
    </div>
    <span className="text-sm ml-1 text-main">2 Persons</span>
  </div>
</div>
</header>}