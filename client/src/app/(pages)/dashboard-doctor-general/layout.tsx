// layout.tsx
import type React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/app/features/dashboard/components/sidebar"
import { navItems } from "./navItem-data"
import ProtectedRoute from "@/components/protected-route"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Phone } from "lucide-react"
interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <ProtectedRoute allowedRoles={["doctor_general"]}>
      <SidebarProvider>
        <div className="flex w-full h-screen bg-gray-50">
          <AppSidebar navItems={navItems} />
          <SidebarInset className="flex-1 overflow-auto">
            {children}
          </SidebarInset>
          <Link href="/videocall/doctor">
                      <Button
                        className="fixed bottom-6 right-6 h-14 px-6 bg-main rounded-2xl hover:bg-main/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 z-50"
                        size="lg"
                      >
                        <Phone className="w-5 h-5 mr-2" />
                        Start Call
                      </Button>
                    </Link>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}

export default Layout
