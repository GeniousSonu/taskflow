'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { STATUS_CONFIG } from '@/lib/utils'
import { TaskCard } from './TaskCard'
import { Plus } from 'lucide-react'

interface Task {
  id: string
  title: string
  status: string
  priority: string
  progress: number
  dueDate?: string
  assignees: any[]
  subtasks: any[]
  labels: any[]
  _count?: { comments: number }
}

interface KanbanColumnProps {
  status: string
  tasks: Task[]
}

const COLUMN_DOTS: Record<string, string> = {
  TODO: '#64748b',
  IN_PROGRESS: '#3b82f6',
  REVIEW: '#8b5cf6',
  BLOCKED: '#ef4444',
  DONE: '#10b981',
}

export function KanbanColumn({ status, tasks }: KanbanColumnProps) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="w-72 flex-shrink-0 flex flex-col max-h-full">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLUMN_DOTS[status] }} />
        <span className="text-sm font-semibold" style={{ color: 'hsl(210 40% 90%)' }}>
          {config.label}
        </span>
        <span
          className="ml-1 text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: 'hsl(222 35% 14%)', color: 'hsl(215 20% 55%)' }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto space-y-3 rounded-xl p-2 min-h-[200px] transition-colors"
        style={{
          background: isOver ? 'rgba(99,102,241,0.06)' : 'hsl(222 40% 8%)',
          border: isOver ? '2px dashed hsl(239 84% 67%)' : '2px dashed transparent',
        }}
      >
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {tasks.length === 0 && !isOver && (
          <div className="flex items-center justify-center h-24 rounded-lg text-sm"
            style={{ color: 'hsl(215 15% 40%)', border: '1px dashed hsl(222 25% 18%)' }}>
            No tasks
          </div>
        )}
      </div>
    </div>
  )
}
