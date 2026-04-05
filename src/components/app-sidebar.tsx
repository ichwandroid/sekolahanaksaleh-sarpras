"use client"

import * as React from "react"
import Link from "next/link"

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
import { 
  LayoutDashboard, 
  Database, 
  ReceiptText, 
  School,
  Settings,
} from "lucide-react"

const data = {
  user: {
    name: "Operator Sarpras",
    email: "sarpras@sd-anaksaleh.sch.id",
    avatar: "/avatars/operator.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
  ],
  navInventaris: [
    {
      title: "Data Inventaris",
      url: "/dashboard/data-table",
      icon: Database,
    },
    {
      title: "Data ARKAS",
      url: "/dashboard/arkas",
      icon: ReceiptText,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <School className="size-5" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-semibold">Sarpras SD Anak Saleh</span>
                <span className="text-xs text-muted-foreground">Malang, Indonesia</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} label="Navigasi" />
        <NavMain items={data.navInventaris} label="Manajemen Data" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
