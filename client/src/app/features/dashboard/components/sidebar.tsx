"use client"

import type * as React from "react"
import {
  Clock,
  Calendar,
  Settings,
  MessageSquare,
  UserRound,
  LogOut,
  Stethoscope,

} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import Image from "next/image"
const navItems = [
  {
    title: "History",
    icon: "Clock.svg",
    url: "/history",
  },
  {
    title: "Scheduled",
    icon: "Scheduled.svg",
    url: "/scheduled",
  },
  {
    title: "Settings",
    icon: "Settings.svg",
    url: "/settings",
  },
  {
      icon: "Messages.svg",
    url: "/messages",
      title: "Messages",
  },
  {
    title: "My Doctors",
    icon: "Stethoscope.svg",
    url: "/doctors",
  },
  {
    title: "My Profile",
    icon: "profile.svg",
    url: "/profile",
  },
]

export function AppSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className={cn("border-r ", className)} {...props}>
      <SidebarHeader className="flex items-center justify-center py-6">
        <div className="pr-20">
            <Image src="logo.svg" alt="" width={100} height={100} ></Image>
            </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild className="h-15 w-15 p-8 font-extrabold h5">
                  <a href={item.url} className="text-teal-600 px-8">
                    <Image src={item.icon} alt="" className=" text-teal-600 " width={24} height={24}/>
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto">
        <SidebarMenu>
         
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/logout" className="text-teal-600">
                <LogOut className="h-5 w-5" />
                <span>Sign out</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
      <SidebarRail />
    </Sidebar>
  )
}
