// layout.tsx
import type React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/app/features/dashboard/components/sidebar"
import { navItems } from "./navItem-data"
import ProtectedRoute from "@/components/protected-route"

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <ProtectedRoute allowedRoles={["doctor_specialty"]}>
      <SidebarProvider>
        <div className="flex w-full h-screen bg-gray-50">
          <AppSidebar navItems={navItems} />
          <SidebarInset className="flex-1 overflow-auto">
            {children}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}

export default Layout
