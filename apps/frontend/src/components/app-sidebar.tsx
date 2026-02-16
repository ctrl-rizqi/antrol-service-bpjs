'use client'

import * as React from 'react'
import { Frame, HeartIcon, PieChart, Users } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

import { NavProjects } from '@/components/nav-projects'
import { NavUser } from '@/components/nav-user'
import { TeamSwitcher } from '@/components/team-switcher'
import { TokenStatusBadge } from '@/components/auth/TokenStatus'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isAdmin, logout, hasPermission } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate({ to: '/login' })
  }

  const userData = {
    name: user?.name || 'User',
    email: user?.username || '',
    avatar: '/avatars/shadcn.jpg',
    role: user?.role || 'user',
  }

  const teams = [
    {
      name: 'RS Prasetya Husada',
      logo: HeartIcon,
      plan: 'Enterprise',
    },
  ]

  const projects = [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: Frame,
    },
  ]

  if (hasPermission('task-id:access') || isAdmin) {
    projects.push({
      name: 'Daftar Registrasi',
      url: '/dashboard/task-id',
      icon: PieChart,
    })
  }

  if (hasPermission('poli:access') || isAdmin) {
    projects.push({
      name: 'Daftar Antrol',
      url: '/dashboard/visit-event',
      icon: PieChart,
    })
  }

  if (hasPermission('category:access') || isAdmin) {
    projects.push({
      name: 'Daftar Pengecualian Poli',
      url: '/dashboard/poli-exception/',
      icon: PieChart,
    })
  }

  if (isAdmin) {
    projects.push({
      name: 'Kelola User',
      url: '/dashboard/users',
      icon: Users,
    })
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        <div className="px-3 py-2">
          <TokenStatusBadge />
        </div>
        <NavUser user={userData} onLogout={handleLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
