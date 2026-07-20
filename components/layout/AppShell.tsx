'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  LayoutDashboard, Kanban, Calendar, Users, BarChart3,
  Settings, Bell, Plus, Zap, ChevronLeft, ChevronRight,
  LogOut, Menu, X, Hash, Folder, Trash2, Edit2, Loader2, Sparkles, Check
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useAppStore } from '@/lib/store'
import { TaskModal } from '@/components/task/TaskModal'
import { NotificationPanel } from '@/components/notifications/NotificationPanel'
import { CreateTaskModal } from '@/components/task/CreateTaskModal'
import { CommandPalette } from '@/components/search/CommandPalette'
import { cn } from '@/lib/utils'

interface AppShellProps {
  user: { id: string; name: string; email: string; color: string; role: string }
  children: React.ReactNode
}

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    projects, setProjects, selectedProject, setSelectedProject,
    channels, setChannels, selectedChannel, setSelectedChannel,
    notifications, sidebarCollapsed, toggleSidebar, isTaskModalOpen
  } = useAppStore()

  const [showNotifications, setShowNotifications] = useState(false)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [showAddChannel, setShowAddChannel] = useState(false)

  // Fetch Projects
  const { data: projData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects')
      return res.json()
    },
  })

  // Fetch Channels of selected project
  const { data: chanData } = useQuery({
    queryKey: ['channels', selectedProject?.id],
    queryFn: async () => {
      if (!selectedProject) return []
      const res = await fetch(`/api/projects/${selectedProject.id}/channels`)
      return res.json()
    },
    enabled: !!selectedProject?.id,
  })

  useEffect(() => {
    if (projData) {
      setProjects(projData)
      if (!selectedProject && projData.length > 0) {
        setSelectedProject(projData[0])
      }
    }
  }, [projData, setProjects, selectedProject, setSelectedProject])

  useEffect(() => {
    if (chanData) {
      setChannels(chanData)
      if (!selectedChannel && chanData.length > 0) {
        setSelectedChannel(chanData[0])
      }
    }
  }, [chanData, setChannels, selectedChannel, setSelectedChannel])

  const createChannelMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!selectedProject) return
      const res = await fetch(`/api/projects/${selectedProject.id}/channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels', selectedProject?.id] })
      setNewChannelName('')
      setShowAddChannel(false)
    },
  })

  const deleteChannelMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/channels/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels', selectedProject?.id] })
    },
  })

  const initials = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()

  const handleProjectSelect = (p: any) => {
    setSelectedProject(p)
    setSelectedChannel(null)
    router.push('/board')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'hsl(222 47% 6%)' }}>
      {/* Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 z-20',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
        style={{
          background: 'hsl(222 40% 8%)',
          borderRight: '1px solid hsl(222 25% 14%)',
        }}
      >
        {/* Branding header: IbWorks by SAHINUR */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b flex-shrink-0 gap-3 justify-between',
          sidebarCollapsed ? 'justify-center' : ''
        )} style={{ borderColor: 'hsl(222 25% 14%)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <div className="text-sm font-extrabold text-white tracking-wider flex items-center gap-1.5">
                  IbWorks
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-normal">v2</span>
                </div>
                <div className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  by SAHINUR
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {/* Main Links */}
          <div className="p-2 space-y-1">
            {[
              { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { href: '/board', icon: Kanban, label: 'Board' },
              { href: '/calendar', icon: Calendar, label: 'Calendar' },
              { href: '/team', icon: Users, label: 'Team' },
              { href: '/reports', icon: BarChart3, label: 'Reports' },
              { href: '/settings', icon: Settings, label: 'Settings' },
            ].map(item => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all',
                    sidebarCollapsed ? 'justify-center' : '',
                    active ? 'text-white' : 'hover:text-white'
                  )}
                  style={active ? { background: 'rgba(99,102,241,0.15)', color: 'hsl(239 84% 72%)' } : { color: 'hsl(215 15% 45%)' }}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </div>

          <hr className="border-white/5 mx-2 my-2" />

          {/* Discord-Style Workspace / Project list */}
          <div className="px-3 py-2 flex flex-col gap-2">
            {!sidebarCollapsed && (
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex justify-between items-center">
                Projects
              </div>
            )}
            {projects.map(p => {
              const active = selectedProject?.id === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => handleProjectSelect(p)}
                  className={cn(
                    'flex items-center gap-3 w-full p-2 rounded-xl text-left transition-all',
                    sidebarCollapsed ? 'justify-center' : '',
                    active ? 'bg-white/5 border border-white/10' : 'border border-transparent hover:bg-white/[0.02]'
                  )}
                >
                  <span className="text-base flex-shrink-0">{p.emoji || '🟦'}</span>
                  {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Active</div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Channels (Task Groups) inside Project */}
          {selectedProject && !sidebarCollapsed && (
            <div className="px-3 py-4 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex justify-between items-center">
                Channels
                <button onClick={() => setShowAddChannel(!showAddChannel)} className="hover:text-white transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {showAddChannel && (
                <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded-lg border border-white/10">
                  <input
                    type="text"
                    placeholder="New channel…"
                    value={newChannelName}
                    onChange={e => setNewChannelName(e.target.value)}
                    className="flex-1 bg-transparent text-[11px] text-white outline-none placeholder-gray-600"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newChannelName.trim()) {
                        createChannelMutation.mutate(newChannelName.trim())
                      }
                    }}
                  />
                  <button
                    onClick={() => newChannelName.trim() && createChannelMutation.mutate(newChannelName.trim())}
                    className="p-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[10px]"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="space-y-1 max-h-56 overflow-y-auto">
                {channels.map(c => {
                  const active = selectedChannel?.id === c.id
                  return (
                    <div
                      key={c.id}
                      className={cn(
                        'flex items-center justify-between group px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all',
                        active ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
                      )}
                      onClick={() => setSelectedChannel(c)}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Hash className="w-3.5 h-3.5 opacity-60" />
                        <span className="truncate">{c.name}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteChannelMutation.mutate(c.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* User + footer toggle */}
        <div className="p-2 space-y-1 border-t" style={{ borderColor: 'hsl(222 25% 14%)' }}>
          <div className={cn('flex items-center gap-3 p-2 rounded-lg', sidebarCollapsed ? 'justify-center' : '')}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 cursor-pointer"
              style={{ background: user.color || '#6366f1' }}
              title={user.name}
            >
              {initials}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">{user.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{user.role}</div>
              </div>
            )}
            {!sidebarCollapsed && (
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="p-1.5 rounded-lg transition-colors hover:text-white"
                style={{ color: 'hsl(215 15% 45%)' }}
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative w-64 flex flex-col" style={{ background: 'hsl(222 40% 8%)', borderRight: '1px solid hsl(222 25% 14%)' }}>
            <div className="flex items-center justify-between h-16 px-4 border-b" style={{ borderColor: 'hsl(222 25% 14%)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'hsl(239 84% 67%)' }}>
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">IbWorks</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} style={{ color: 'hsl(215 15% 45%)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 px-2 space-y-1">
              {/* Project choices for mobile */}
              <div className="px-2 py-1 text-slate-500 text-[10px] uppercase font-bold mb-2">Projects</div>
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => { handleProjectSelect(p); setMobileMenuOpen(false) }}
                  className="flex items-center gap-2.5 w-full p-2 rounded-lg text-slate-400 hover:text-white"
                >
                  <span>{p.emoji}</span>
                  <span className="text-xs font-semibold">{p.name}</span>
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-16 flex items-center gap-4 px-4 lg:px-6 flex-shrink-0" style={{
          background: 'hsl(222 40% 8%)',
          borderBottom: '1px solid hsl(222 25% 14%)',
        }}>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg"
            style={{ color: 'hsl(215 20% 55%)' }}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Palette toggle component */}
          <div className="flex-1 max-w-xs sm:max-w-md">
            <CommandPalette />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Create task button */}
            <button
              onClick={() => setShowCreateTask(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
              style={{ background: 'hsl(239 84% 67%)' }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Task</span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg relative transition-colors"
                style={{ color: 'hsl(215 20% 55%)', background: showNotifications ? 'hsl(222 35% 14%)' : 'transparent' }}
              >
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs font-bold text-white flex items-center justify-center"
                    style={{ background: 'hsl(239 84% 67%)', fontSize: '10px' }}>
                    {notifications}
                  </span>
                )}
              </button>
              {showNotifications && (
                <NotificationPanel onClose={() => setShowNotifications(false)} />
              )}
            </div>

            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: user.color || '#6366f1' }}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto pb-12">
          {children}
        </main>

        {/* Global sticky link footer */}
        <footer className="absolute bottom-0 left-0 right-0 h-10 border-t flex items-center justify-center text-xs z-10"
          style={{ background: 'hsl(222 40% 7%)', borderColor: 'hsl(222 25% 12%)', color: 'hsl(215 15% 45%)' }}>
          <span>
            &copy; 2026 IbWorks &mdash;{' '}
            <a
              href="https://genioussonu.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-indigo-400 hover:text-indigo-300 underline transition-colors"
            >
              Built by Sahinur
            </a>
          </span>
        </footer>
      </div>

      {/* Modals */}
      {isTaskModalOpen && <TaskModal />}
      {showCreateTask && <CreateTaskModal onClose={() => setShowCreateTask(false)} />}
    </div>
  )
}
