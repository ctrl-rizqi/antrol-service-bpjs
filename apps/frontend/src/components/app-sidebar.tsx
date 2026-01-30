'use client'

import * as React from 'react'
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  HeartIcon,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from 'lucide-react'

import { NavMain } from '@/components/nav-main'
import { NavProjects } from '@/components/nav-projects'
import { NavUser } from '@/components/nav-user'
import { TeamSwitcher } from '@/components/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

// This is sample data.
const data = {
  user: {
    name: 'admin',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'RS Prasetya Husada',
      logo: HeartIcon,
      plan: 'Enterprise',
    },
  ],
  // navMain: [
  //   {
  //     title: 'Main',
  //     url: '#',
  //     icon: SquareTerminal,
  //     isActive: false,
  //     items: [
  //       {
  //         title: 'Dashboard',
  //         url: '/dashboard',
  //       },
  //       {
  //         title: 'Daftar Antrol',
  //         url: '/dashboard/visit-event',
  //       },
  //     ],
  //   },
  // ],
  projects: [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: Frame,
    },
    {
      name: 'Daftar Antrol',
      url: '/dashboard/visit-event',
      icon: PieChart,
    },
    {
      name: 'Daftar Pengecualian Poli',
      url: '/dashboard/poli-exception/',
      icon: PieChart,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {/* <NavMain items={data.navMain} /> */}
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
