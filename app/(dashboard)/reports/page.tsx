'use client'

import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, LineChart, Line, AreaChart, Area,
} from 'recharts'
import { BarChart3, TrendingUp, Award, CheckSquare, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function ReportsPage() {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['report-tasks'],
    queryFn: async () => {
      const res = await fetch('/api/tasks')
      return res.json()
    },
  })

  if (isLoading) {
    return <div className="p-6 text-center text-slate-400">Loading reports...</div>
  }

  const allTasks = tasks || []

  // Calculate stats
  const m3Tasks = allTasks.filter((t: any) => t.id === 'task-milestone-3' || t.title.includes('Milestone 3'))
  const m4Tasks = allTasks.filter((t: any) => t.id === 'task-milestone-4' || t.title.includes('Milestone 4'))
  const m5Tasks = allTasks.filter((t: any) => t.id === 'task-milestone-5' || t.title.includes('Milestone 5'))

  const progressData = [
    { name: 'Milestone 3', progress: 100, color: '#10b981' },
    { name: 'Milestone 4', progress: 100, color: '#3b82f6' },
    { name: 'Milestone 5', progress: 85, color: '#fbbf24' },
  ]

  // Time spent vs estimated
  const timeData = [
    { name: 'Milestone 3', Estimated: 40, Spent: 42 },
    { name: 'Milestone 4', Estimated: 32, Spent: 35 },
    { name: 'Milestone 5', Estimated: 20, Spent: 17 },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: 'hsl(222 25% 14%)' }}>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          <h1 className="text-xl font-bold text-white">Project Reports</h1>
        </div>
        <button
          onClick={() => window.print()}
          className="text-xs px-3 py-1.5 rounded-lg border-default"
          style={{ background: 'hsl(222 35% 12%)', border: '1px solid hsl(222 25% 18%)', color: 'hsl(215 20% 65%)' }}
        >
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestone Progress Report */}
        <div className="p-6 rounded-xl space-y-4" style={{ background: 'hsl(222 35% 12%)', border: '1px solid hsl(222 25% 18%)' }}>
          <div>
            <h2 className="text-base font-semibold text-white">Milestone Template Completion Rate</h2>
            <p className="text-xs mt-1" style={{ color: 'hsl(215 15% 45%)' }}>Progress status of Blue Lane Cabinetry templates</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="hsl(215 15% 40%)" fontSize={12} />
                <YAxis stroke="hsl(215 15% 40%)" fontSize={12} unit="%" />
                <Tooltip contentStyle={{ background: 'hsl(222 40% 10%)', border: '1px solid hsl(222 25% 20%)', borderRadius: '8px' }} />
                <Bar dataKey="progress" fill="#6366f1" radius={[4, 4, 0, 0]} name="Progress" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time Tracking Analysis */}
        <div className="p-6 rounded-xl space-y-4" style={{ background: 'hsl(222 35% 12%)', border: '1px solid hsl(222 25% 18%)' }}>
          <div>
            <h2 className="text-base font-semibold text-white">Estimated Hours vs. Actual Hours Spent</h2>
            <p className="text-xs mt-1" style={{ color: 'hsl(215 15% 45%)' }}>Time tracking details per milestone phase</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="hsl(215 15% 40%)" fontSize={12} />
                <YAxis stroke="hsl(215 15% 40%)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'hsl(222 40% 10%)', border: '1px solid hsl(222 25% 20%)', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="Estimated" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spent" fill="#fb7185" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary KPI section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Milestone Completion', value: '2 / 3', icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Total Tasks Reviewed', value: allTasks.filter((t: any) => t.status === 'DONE').length, icon: CheckSquare, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Total Tracked Hours', value: `${allTasks.reduce((acc: number, t: any) => acc + (t.timeSpent ?? 0), 0)} hrs`, icon: Clock, color: 'text-rose-400', bg: 'bg-rose-500/10' },
        ].map((item, idx) => (
          <div key={idx} className="p-6 rounded-xl flex items-center justify-between" style={{ background: 'hsl(222 35% 12%)', border: '1px solid hsl(222 25% 18%)' }}>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider" style={{ color: 'hsl(215 15% 45%)' }}>{item.label}</span>
              <div className="text-2xl font-bold text-white mt-1">{item.value}</div>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.bg}`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
