"use client"
import Image from "next/image"
import type React from "react"
import { usePathname } from "next/navigation"

import { LogOut } from "lucide-react"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useAuth } from "@/app/providers"
interface NavItem {
  title: string
  icon: string
  url: string
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  navItems: NavItem[]
}

export function AppSidebar({ navItems, className, ...props }: AppSidebarProps) {
  const { logout } = useAuth()
  const pathname = usePathname()

  // Function to check if a menu item is active
  const isActive = (url: string) => {
    // Handle home page special case
    if (url === "/" && pathname === "/") return true
    // For other pages, check if the pathname starts with the URL
    // This handles both exact matches and sub-pages
    return url !== "/" && pathname.startsWith(url)
  }

  return (
    <Sidebar className={cn("border-r border-gray-200 bg-white", className)} {...props}>
      <SidebarHeader className="flex items-center justify-center py-6 mb-2">
        <div className="px-8">
          <Image src="/logo.svg" alt="Logo" width={100} height={40} priority />
        </div>
      </SidebarHeader>
      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => {
              const active = isActive(item.url)
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "h-15 w-15 py-5  px-8 my-2 mx-6  font-extrabold transition-all duration-200 rounded-2xl",
                      active && "bg-main rounded-2xl",
                    )}
                  >
                    <a
                      href={item.url}
                      className={cn("px-8 flex h5 items-center gap-2", active ? "text-alt h5" : "text-main")}
                    >
                      <Image
                        src={item.icon || "/placeholder.svg"}
                        alt={item.title}
                        width={24}
                        height={24}
                        className={active ? "filter brightness-0 invert" : ""}
                      />
                      <span className={active ? "h5" : ""}>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto mb-6 ">
  <SidebarMenu>
    <SidebarMenuItem>
      <SidebarMenuButton asChild className="h-15 w-15 p-8 font-extrabold">
        <a href="/login" className="text-[#00223C] px-8 flex items-center gap-2" onClick={() => logout()}>
          <LogOut
            style={{ width: '20px', height: '18.66666603088379px' }}
          />
          <span className="h5">Sign out</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
</div>

      <SidebarRail />
    </Sidebar>
  )
}
