'use client'

import { KanbanBoard } from '@/components/board/KanbanBoard'

export default function BoardPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Subheader/Breadcrumb */}
      <div className="px-6 py-4 flex items-center justify-between border-b flex-shrink-0" style={{ borderColor: 'hsl(222 25% 14%)' }}>
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'hsl(215 15% 45%)' }}>
            Blue Lane Cabinetry Workspace
          </div>
          <h1 className="text-xl font-bold text-white mt-0.5">Kanban Board</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Active board filters could go here */}
          <div className="text-xs px-2.5 py-1 rounded-lg" style={{ background: 'hsl(222 35% 12%)', color: 'hsl(215 20% 60%)', border: '1px solid hsl(222 25% 18%)' }}>
            Milestone 5 active
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <KanbanBoard />
      </div>
    </div>
  )
}
