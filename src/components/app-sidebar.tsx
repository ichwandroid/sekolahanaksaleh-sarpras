"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { DatabaseIcon, ReceiptText } from "lucide-react"

const data = {
  user: {
    name: "Operator SD Anak Saleh",
    email: "operator@sekolahanaksaleh.sch.id",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Data Inventaris",
      url: "/dashboard/data-table",
      icon: <DatabaseIcon />
    },
    {
      title: "Data ARKAS",
      url: "/dashboard/arkas",
      icon: <ReceiptText />
    },
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#" />}
            >
              <span className="text-base font-semibold">Sarpras Anak Saleh</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
