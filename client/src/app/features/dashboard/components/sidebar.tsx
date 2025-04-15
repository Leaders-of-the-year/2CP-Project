import Image from "next/image"
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

interface NavItem {
  title: string
  icon: string
  url: string
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  navItems: NavItem[]
}

export function AppSidebar({ navItems, className, ...props }: AppSidebarProps) {
  return (
    <Sidebar className={cn("border-r", className)} {...props}>
      <SidebarHeader className="flex items-center justify-center py-6">
        <div className="pr-20">
          <Image src="/logo.svg" alt="Logo" width={100} height={100} />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild className="h-15 w-15 p-8 font-extrabold h5">
                  <a href={item.url} className="text-teal-600 px-8 flex items-center gap-2">
                    <Image src={item.icon} alt={item.title} width={24} height={24} />
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
              <a href="/logout" className="text-teal-600 flex items-center gap-2">
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
