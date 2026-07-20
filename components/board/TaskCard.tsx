'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import {
  MessageSquare, AlertTriangle, CheckSquare, Calendar,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import {
  cn, formatDate, isOverdue, PRIORITY_CONFIG, getInitials,
} from '@/lib/utils'

interface Task {
  id: string
  title: string
  status: string
  priority: string
  progress: number
  dueDate?: string
  assignees: { user: { id: string; name: string; color: string } }[]
  subtasks: { completed: boolean }[]
  labels: { label: { id: string; name: string; color: string } }[]
  _count?: { comments: number }
}

interface TaskCardProps {
  task: Task
  overlay?: boolean
}

const PRIORITY_ICONS: Record<string, string> = {
  LOW: '↓',
  MEDIUM: '→',
  HIGH: '↑',
  CRITICAL: '⚡',
}

export function TaskCard({ task, overlay }: TaskCardProps) {
  const { openTaskModal } = useAppStore()
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const priorityConfig = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG]
  const completedSubtasks = task.subtasks?.filter(s => s.completed).length ?? 0
  const totalSubtasks = task.subtasks?.length ?? 0
  const overdue = isOverdue(task.dueDate) && task.status !== 'DONE'
  const commentCount = task._count?.comments ?? 0

  // Circular progress math
  const radius = 14
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (task.progress / 100) * circumference

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <motion.div
        initial={overlay ? undefined : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -1 }}
        onClick={() => !overlay && openTaskModal(task as any)}
        className={cn(
          'group rounded-xl p-4 cursor-pointer transition-all select-none',
          overlay ? 'shadow-2xl' : 'hover:shadow-lg',
        )}
        style={{
          background: overlay ? 'hsl(222 35% 16%)' : 'hsl(222 35% 12%)',
          border: `1px solid ${overlay ? 'hsl(239 84% 50%)' : 'hsl(222 25% 18%)'}`,
        }}
      >
        {/* Labels */}
        {task.labels?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.labels.slice(0, 3).map(({ label }) => (
              <span
                key={label.id}
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: label.color + '20', color: label.color, border: `1px solid ${label.color}30` }}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}

        {/* Title & Circular Progress SVG */}
        <div className="flex justify-between items-start gap-3 mb-3">
          <div className="text-sm font-semibold text-white leading-snug line-clamp-2">
            {task.title}
          </div>

          {/* SVG Circle Progress */}
          <div className="relative w-8 h-8 flex-shrink-0 flex items-center justify-center">
            <svg className="w-8 h-8 transform -rotate-90">
              <circle
                cx="16"
                cy="16"
                r={radius}
                className="stroke-white/10 fill-none"
                strokeWidth="2.5"
              />
              <circle
                cx="16"
                cy="16"
                r={radius}
                className="stroke-indigo-500 fill-none transition-all duration-300"
                strokeWidth="2.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[8px] font-bold text-slate-300">{task.progress}%</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Priority Badge */}
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-bold"
              style={{
                background: priorityConfig?.bg,
                color: priorityConfig?.color,
                border: `1px solid ${priorityConfig?.border}`,
              }}
            >
              {PRIORITY_ICONS[task.priority]} {priorityConfig?.label}
            </span>

            {/* Due Date */}
            {task.dueDate && (
              <span
                className="flex items-center gap-1 text-[10px]"
                style={{ color: overdue ? '#f87171' : 'hsl(215 15% 45%)' }}
              >
                {overdue ? <AlertTriangle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {totalSubtasks > 0 && (
              <span className="flex items-center gap-1 text-xs" style={{ color: 'hsl(215 15% 45%)' }}>
                <CheckSquare className="w-3 h-3" />
                {completedSubtasks}/{totalSubtasks}
              </span>
            )}
            {commentCount > 0 && (
              <span className="flex items-center gap-1 text-xs" style={{ color: 'hsl(215 15% 45%)' }}>
                <MessageSquare className="w-3 h-3" />
                {commentCount}
              </span>
            )}

            {/* Assignee avatars */}
            {task.assignees?.length > 0 && (
              <div className="flex -space-x-1.5">
                {task.assignees.slice(0, 3).map(({ user }) => (
                  <div
                    key={user.id}
                    title={user.name}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white ring-2 ring-indigo-950"
                    style={{
                      background: user.color,
                      outline: '2px solid hsl(222 35% 12%)',
                    }}
                  >
                    {getInitials(user.name)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
