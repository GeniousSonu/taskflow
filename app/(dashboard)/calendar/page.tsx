'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isToday, isSameDay, addMonths, subMonths,
} from 'date-fns'
import { useAppStore } from '@/lib/store'
import { PRIORITY_CONFIG } from '@/lib/utils'

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const { openTaskModal } = useAppStore()

  const { data: tasks } = useQuery({
    queryKey: ['calendar-tasks'],
    queryFn: async () => {
      const res = await fetch('/api/tasks')
      return res.json()
    },
  })

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const allTasks = tasks || []

  return (
    <div className="p-6 h-full flex flex-col space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between border-b pb-4 flex-shrink-0" style={{ borderColor: 'hsl(222 25% 14%)' }}>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" style={{ color: 'hsl(239 84% 72%)' }} />
          <h1 className="text-xl font-bold text-white">Task Calendar</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'hsl(215 15% 45%)' }}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-white min-w-[120px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button onClick={nextMonth} className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'hsl(215 15% 45%)' }}>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 min-h-0 overflow-auto border rounded-xl" style={{ borderColor: 'hsl(222 25% 16%)', background: 'hsl(222 40% 8%)' }}>
        <div className="grid grid-cols-7 border-b text-center py-2.5 font-semibold text-xs uppercase tracking-wider" style={{ borderColor: 'hsl(222 25% 16%)', color: 'hsl(215 15% 45%)' }}>
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 min-h-[500px]">
          {/* Pad prefix empty blocks if first day is not Sunday */}
          {Array.from({ length: days[0].getDay() }).map((_, idx) => (
            <div key={`pad-${idx}`} className="border-r border-b p-2" style={{ borderColor: 'hsl(222 25% 16%)' }} />
          ))}

          {days.map(day => {
            const dayTasks = allTasks.filter((t: any) => t.dueDate && isSameDay(new Date(t.dueDate), day))
            const today = isToday(day)

            return (
              <div
                key={day.toString()}
                className="border-r border-b p-2 min-h-[100px] flex flex-col justify-between group transition-colors hover:bg-white/[0.01]"
                style={{ borderColor: 'hsl(222 25% 16%)' }}
              >
                {/* Day num */}
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center ${today ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}>
                    {format(day, 'd')}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'hsl(222 35% 12%)', color: 'hsl(215 15% 45%)' }}>
                      {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Day tasks */}
                <div className="flex-1 mt-2 space-y-1.5 overflow-y-auto max-h-[80px]">
                  {dayTasks.map((t: any) => {
                    const priorityConfig = PRIORITY_CONFIG[t.priority as keyof typeof PRIORITY_CONFIG]
                    return (
                      <div
                        key={t.id}
                        onClick={() => openTaskModal(t)}
                        className="text-[11px] p-1.5 rounded border truncate cursor-pointer hover:opacity-90 active:scale-[0.98]"
                        style={{
                          background: priorityConfig?.bg || 'hsl(222 35% 12%)',
                          borderColor: priorityConfig?.border || 'hsl(222 25% 18%)',
                          color: priorityConfig?.color || 'white',
                        }}
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    )}
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
