'use client'

import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts'
import {
  CheckCircle2, Clock, AlertCircle, PlayCircle,
  CalendarDays, TrendingUp, Sparkles, CheckSquare, Heart
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { formatDate, getInitials } from '@/lib/utils'

async function fetchStats() {
  const res = await fetch('/api/tasks')
  return res.json()
}

export default function DashboardPage() {
  const { selectedProject } = useAppStore()

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['dashboard-tasks', selectedProject?.id],
    queryFn: async () => {
      let url = '/api/tasks'
      if (selectedProject?.id) {
        url += `?projectId=${selectedProject.id}`
      }
      const res = await fetch(url)
      return res.json()
    },
    enabled: !!selectedProject?.id,
  })

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-10 w-48 rounded bg-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    )
  }

  const allTasks = tasks || []
  const totalTasks = allTasks.length
  const completedTasks = allTasks.filter((t: any) => t.status === 'DONE').length
  const inProgressTasks = allTasks.filter((t: any) => t.status === 'IN_PROGRESS').length
  const blockedTasks = allTasks.filter((t: any) => t.status === 'BLOCKED').length
  const todoTasks = allTasks.filter((t: any) => t.status === 'TODO').length

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Project Health Calculation
  let healthBadge = { text: 'Healthy', color: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400' }
  if (blockedTasks > 0) {
    healthBadge = { text: 'At Risk', color: 'text-amber-400', bg: 'bg-amber-500/10', dot: 'bg-amber-400' }
  }
  if (allTasks.some((t: any) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE')) {
    healthBadge = { text: 'Delayed', color: 'text-red-400', bg: 'bg-red-500/10', dot: 'bg-red-400' }
  }

  // Calculate workloads per user
  const workloadMap: Record<string, { name: string; count: number; color: string }> = {}
  allTasks.forEach((t: any) => {
    t.assignees?.forEach(({ user }: any) => {
      if (!workloadMap[user.id]) {
        workloadMap[user.id] = { name: user.name, count: 0, color: user.color }
      }
      workloadMap[user.id].count += 1
    })
  })
  const workloadData = Object.values(workloadMap)

  // Status breakdown pie data
  const statusPieData = [
    { name: 'Completed', value: completedTasks, color: '#10b981' },
    { name: 'In Progress', value: inProgressTasks, color: '#3b82f6' },
    { name: 'Blocked', value: blockedTasks, color: '#ef4444' },
    { name: 'Todo', value: todoTasks, color: '#64748b' },
  ].filter(d => d.value > 0)

  // Recent activity logs
  const recentTasks = [...allTasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'hsl(239 84% 72%)' }} />
            Workspace Analytics
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            {selectedProject?.name || 'IbWorks'} Dashboard
          </h1>
        </div>

        {/* Project Health Badge */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${healthBadge.bg} ${healthBadge.color}`}>
            <span className={`w-2 h-2 rounded-full ${healthBadge.dot}`} />
            Project Health: {healthBadge.text}
          </div>
          <div className="text-xs px-3 py-1.5 rounded-lg border-default" style={{ background: 'hsl(222 35% 12%)', border: '1px solid hsl(222 25% 18%)', color: 'hsl(215 20% 65%)' }}>
            Updated {formatDate(new Date())}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: totalTasks, icon: CheckSquare, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'In Progress', value: inProgressTasks, icon: PlayCircle, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Blocked / Delayed', value: blockedTasks, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Completion Rate', value: `${completionRate}%`, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-xl flex items-center justify-between" style={{ background: 'hsl(222 35% 12%)', border: '1px solid hsl(222 25% 18%)' }}>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</div>
              <div className="text-3xl font-extrabold text-white mt-2">{stat.value}</div>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-xl space-y-4" style={{ background: 'hsl(222 35% 12%)', border: '1px solid hsl(222 25% 18%)' }}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Milestone Task Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: 'Todo', count: todoTasks }, { name: 'In Progress', count: inProgressTasks }, { name: 'Blocked', count: blockedTasks }, { name: 'Done', count: completedTasks }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="hsl(215 15% 40%)" fontSize={11} />
                <YAxis stroke="hsl(215 15% 40%)" fontSize={11} />
                <Tooltip contentStyle={{ background: 'hsl(222 40% 10%)', border: '1px solid hsl(222 25% 20%)', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Tasks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Allocation Breakdown */}
        <div className="p-6 rounded-xl space-y-4 flex flex-col justify-between" style={{ background: 'hsl(222 35% 12%)', border: '1px solid hsl(222 25% 18%)' }}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Task Status</h2>
          <div className="h-44 relative flex items-center justify-center">
            {statusPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusPieData} innerRadius={55} outerRadius={70} paddingAngle={4} dataKey="value">
                    {statusPieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(222 40% 10%)', border: '1px solid hsl(222 25% 20%)', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500">No data</div>
            )}
            <div className="absolute text-center">
              <div className="text-2xl font-black text-white">{completedTasks}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Done</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {statusPieData.map((s, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                <span className="text-slate-400 truncate">{s.name} ({s.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Workloads */}
        <div className="p-6 rounded-xl space-y-4" style={{ background: 'hsl(222 35% 12%)', border: '1px solid hsl(222 25% 18%)' }}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Team Workloads</h2>
          <div className="space-y-4">
            {workloadData.map((w: any) => (
              <div key={w.name} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: w.color }}>
                      {getInitials(w.name)}
                    </div>
                    <span className="text-white font-semibold">{w.name}</span>
                  </div>
                  <span className="text-slate-400">{w.count} active tasks</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(222 25% 20%)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((w.count / 8) * 100, 100)}%`, background: w.color }} />
                </div>
              </div>
            ))}
            {workloadData.length === 0 && (
              <div className="text-xs text-center py-6 text-slate-500">No active assignments</div>
            )}
          </div>
        </div>

        {/* Activity feed */}
        <div className="lg:col-span-2 p-6 rounded-xl space-y-4" style={{ background: 'hsl(222 35% 12%)', border: '1px solid hsl(222 25% 18%)' }}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Recent Task Updates</h2>
          <div className="divide-y divide-white/5 space-y-3">
            {recentTasks.map((t: any) => (
              <div key={t.id} className="pt-3 flex justify-between items-start gap-4">
                <div>
                  <div className="text-sm font-semibold text-white truncate max-w-sm">{t.title}</div>
                  <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
                    Status: <span style={{ color: t.status === 'DONE' ? '#10b981' : '#3b82f6' }}>{t.status}</span> · estimate: {t.estimatedHours || 0}h
                  </div>
                </div>
                <span className="text-[10px] text-slate-600 whitespace-nowrap">
                  {formatDate(t.updatedAt)}
                </span>
              </div>
            ))}
            {recentTasks.length === 0 && (
              <div className="text-xs text-slate-500 text-center py-6">No tasks added yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
