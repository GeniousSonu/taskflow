'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core'
import { useAppStore } from '@/lib/store'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'

const COLUMNS = ['TODO', 'IN_PROGRESS', 'REVIEW', 'BLOCKED', 'DONE'] as const

export function KanbanBoard() {
  const { tasks, setTasks, updateTask, selectedChannel, selectedProject } = useAppStore()
  const [activeId, setActiveId] = useState<string | null>(null)

  // Fetch tasks matching selected channel or project
  const { data, isLoading } = useQuery({
    queryKey: ['tasks', selectedChannel?.id, selectedProject?.id],
    queryFn: async () => {
      let url = '/api/tasks'
      if (selectedChannel?.id) {
        url += `?channelId=${selectedChannel.id}`
      } else if (selectedProject?.id) {
        url += `?projectId=${selectedProject.id}`
      }
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch tasks')
      return res.json()
    },
    enabled: !!selectedProject?.id,
    refetchInterval: 30000,
  })

  useEffect(() => {
    if (data) setTasks(data)
  }, [data, setTasks])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over) return
    const taskId = active.id as string
    const newStatus = over.id as string

    if (!COLUMNS.includes(newStatus as any)) return

    const task = tasks.find(t => t.id === taskId)
    if (!task || task.status === newStatus) return

    updateTask({ id: taskId, status: newStatus })

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
    } catch {
      updateTask({ id: taskId, status: task.status })
    }
  }

  const activeTask = tasks.find(t => t.id === activeId) ?? null

  if (isLoading) {
    return (
      <div className="flex gap-4 p-6 h-full overflow-x-auto">
        {COLUMNS.map(col => (
          <div key={col} className="w-72 flex-shrink-0">
            <div className="h-8 rounded-lg mb-4 animate-shimmer" style={{ background: 'hsl(222 35% 12%)' }} />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 rounded-xl mb-3 animate-shimmer" style={{ background: 'hsl(222 35% 12%)' }} />
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 p-6 h-full overflow-x-auto pb-8">
        {COLUMNS.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasks.filter(t => t.status === status)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-2 opacity-90 scale-105">
            <TaskCard task={activeTask} overlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
