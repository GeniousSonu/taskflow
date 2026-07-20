'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Edit3, Calendar, Clock, Users, Tag, CheckSquare,
  MessageSquare, Activity, Plus, Check, Trash2, MoreHorizontal,
  ChevronDown, ChevronUp, Flag, Loader2,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { formatDate, formatRelative, PRIORITY_CONFIG, STATUS_CONFIG, getInitials } from '@/lib/utils'
import { useSession } from 'next-auth/react'

export function TaskModal() {
  const { selectedTask, closeTaskModal, updateTask } = useAppStore()
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'subtasks' | 'comments' | 'activity'>('subtasks')
  const [newComment, setNewComment] = useState('')
  const [newSubtask, setNewSubtask] = useState('')
  const [isAddingSubtask, setIsAddingSubtask] = useState(false)

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', selectedTask?.id],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${selectedTask?.id}`)
      return res.json()
    },
    enabled: !!selectedTask?.id,
  })

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/tasks/${selectedTask?.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', selectedTask?.id] })
      setNewComment('')
    },
  })

  const toggleSubtask = useMutation({
    mutationFn: async ({ subtaskId, completed }: { subtaskId: string; completed: boolean }) => {
      const res = await fetch(`/api/subtasks/${subtaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', selectedTask?.id] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const addSubtaskMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch(`/api/tasks/${selectedTask?.id}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', selectedTask?.id] })
      setNewSubtask('')
      setIsAddingSubtask(false)
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`/api/tasks/${selectedTask?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      return res.json()
    },
    onSuccess: (data) => {
      updateTask(data)
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', selectedTask?.id] })
    },
  })

  if (!selectedTask) return null

  const t = task || selectedTask
  const priorityConfig = PRIORITY_CONFIG[t.priority as keyof typeof PRIORITY_CONFIG]
  const statusConfig = STATUS_CONFIG[t.status as keyof typeof STATUS_CONFIG]
  const completedSubtasks = t.subtasks?.filter((s: any) => s.completed).length ?? 0
  const totalSubtasks = t.subtasks?.length ?? 0
  const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : t.progress ?? 0

  const TAB_LABELS = [
    { id: 'subtasks', label: 'Subtasks', count: totalSubtasks },
    { id: 'comments', label: 'Comments', count: t.comments?.length ?? 0 },
    { id: 'activity', label: 'Activity', count: t.activityLogs?.length ?? 0 },
  ]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={closeTaskModal}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
          style={{ background: 'hsl(222 40% 10%)', border: '1px solid hsl(222 25% 18%)' }}
        >
          {/* Header */}
          <div className="flex items-start gap-4 p-6 pb-4 border-b" style={{ borderColor: 'hsl(222 25% 16%)' }}>
            <div className="flex-1 min-w-0">
              {/* Status + Priority row */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <select
                  value={t.status}
                  onChange={e => updateStatusMutation.mutate(e.target.value)}
                  className="text-xs px-2 py-1 rounded-lg font-medium cursor-pointer outline-none"
                  style={{
                    background: 'rgba(99,102,241,0.1)',
                    color: statusConfig?.color,
                    border: `1px solid ${statusConfig?.border}`,
                  }}
                >
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>

                <span className="text-xs px-2 py-1 rounded-lg font-medium"
                  style={{ background: priorityConfig?.bg, color: priorityConfig?.color, border: `1px solid ${priorityConfig?.border}` }}>
                  {priorityConfig?.label} Priority
                </span>

                {t.dueDate && (
                  <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                    style={{ background: 'hsl(222 35% 14%)', color: 'hsl(215 20% 60%)' }}>
                    <Calendar className="w-3 h-3" />
                    Due {formatDate(t.dueDate)}
                  </span>
                )}
              </div>

              <h2 className="text-lg font-bold text-white leading-snug">{t.title}</h2>
            </div>

            <button onClick={closeTaskModal} className="p-2 rounded-lg transition-colors flex-shrink-0"
              style={{ color: 'hsl(215 15% 45%)' }}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body — scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                {t.description && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(215 15% 45%)' }}>
                      Description
                    </div>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'hsl(215 20% 70%)' }}>
                      {t.description}
                    </div>
                  </div>
                )}

                {/* Progress */}
                {totalSubtasks > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(215 15% 45%)' }}>
                        Overall Progress
                      </div>
                      <span className="text-sm font-bold" style={{ color: progress === 100 ? '#10b981' : 'hsl(210 40% 90%)' }}>
                        {progress}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'hsl(222 25% 18%)' }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          background: progress === 100 ? '#10b981' : 'linear-gradient(90deg, hsl(239 84% 67%), hsl(270 84% 67%))',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Tabs */}
                <div>
                  <div className="flex gap-1 mb-4 p-1 rounded-lg" style={{ background: 'hsl(222 35% 12%)' }}>
                    {TAB_LABELS.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all"
                        style={activeTab === tab.id
                          ? { background: 'hsl(222 35% 18%)', color: 'white' }
                          : { color: 'hsl(215 15% 45%)' }
                        }
                      >
                        {tab.label}
                        {tab.count > 0 && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full"
                            style={{ background: activeTab === tab.id ? 'rgba(99,102,241,0.2)' : 'hsl(222 25% 18%)', color: activeTab === tab.id ? 'hsl(239 84% 72%)' : 'hsl(215 15% 45%)' }}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Subtasks tab */}
                  {activeTab === 'subtasks' && (
                    <div className="space-y-2 animate-fade-up">
                      {t.subtasks?.map((subtask: any) => (
                        <div key={subtask.id}
                          className="flex items-center gap-3 p-3 rounded-xl group transition-all"
                          style={{ background: 'hsl(222 35% 12%)', border: '1px solid hsl(222 25% 16%)' }}>
                          <button
                            onClick={() => toggleSubtask.mutate({ subtaskId: subtask.id, completed: !subtask.completed })}
                            className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                            style={{
                              background: subtask.completed ? '#10b981' : 'transparent',
                              border: subtask.completed ? '2px solid #10b981' : '2px solid hsl(222 25% 28%)',
                            }}
                          >
                            {subtask.completed && <Check className="w-3 h-3 text-white" />}
                          </button>
                          <span className={`text-sm flex-1 ${subtask.completed ? 'line-through' : ''}`}
                            style={{ color: subtask.completed ? 'hsl(215 15% 45%)' : 'hsl(210 40% 90%)' }}>
                            {subtask.title}
                          </span>
                          {subtask.progress > 0 && subtask.progress < 100 && (
                            <span className="text-xs" style={{ color: 'hsl(215 15% 45%)' }}>{subtask.progress}%</span>
                          )}
                        </div>
                      ))}

                      {isAddingSubtask ? (
                        <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'hsl(222 35% 12%)', border: '1px solid hsl(239 84% 50%)' }}>
                          <input
                            autoFocus
                            type="text"
                            placeholder="Subtask title…"
                            value={newSubtask}
                            onChange={e => setNewSubtask(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && newSubtask.trim()) addSubtaskMutation.mutate(newSubtask.trim())
                              if (e.key === 'Escape') { setIsAddingSubtask(false); setNewSubtask('') }
                            }}
                            className="flex-1 bg-transparent text-sm text-white outline-none"
                          />
                          <button onClick={() => { if (newSubtask.trim()) addSubtaskMutation.mutate(newSubtask.trim()) }}
                            className="text-xs px-3 py-1 rounded-lg font-medium text-white"
                            style={{ background: 'hsl(239 84% 67%)' }}>
                            Add
                          </button>
                          <button onClick={() => { setIsAddingSubtask(false); setNewSubtask('') }}
                            className="text-xs" style={{ color: 'hsl(215 15% 45%)' }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsAddingSubtask(true)}
                          className="flex items-center gap-2 w-full p-3 rounded-xl text-sm transition-all"
                          style={{ color: 'hsl(215 15% 45%)', border: '1px dashed hsl(222 25% 20%)' }}
                        >
                          <Plus className="w-4 h-4" />
                          Add subtask
                        </button>
                      )}
                    </div>
                  )}

                  {/* Comments tab */}
                  {activeTab === 'comments' && (
                    <div className="space-y-4 animate-fade-up">
                      {t.comments?.map((comment: any) => (
                        <div key={comment.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: comment.author?.color || '#6366f1' }}>
                            {getInitials(comment.author?.name || '?')}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-white">{comment.author?.name}</span>
                              <span className="text-xs" style={{ color: 'hsl(215 15% 45%)' }}>{formatRelative(comment.createdAt)}</span>
                            </div>
                            <div className="text-sm p-3 rounded-xl" style={{ background: 'hsl(222 35% 12%)', border: '1px solid hsl(222 25% 16%)', color: 'hsl(215 20% 80%)' }}>
                              {comment.content}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add comment */}
                      <div className="flex gap-3 pt-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: '#6366f1' }}>
                          {getInitials((session?.user?.name as string) || 'U')}
                        </div>
                        <div className="flex-1">
                          <textarea
                            placeholder="Write a comment… (mention with @name)"
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            rows={3}
                            className="w-full p-3 rounded-xl text-sm text-white placeholder-gray-600 resize-none outline-none transition-all"
                            style={{ background: 'hsl(222 35% 12%)', border: '1px solid hsl(222 25% 20%)' }}
                          />
                          <div className="flex justify-end mt-2">
                            <button
                              onClick={() => newComment.trim() && addCommentMutation.mutate(newComment.trim())}
                              disabled={!newComment.trim() || addCommentMutation.isPending}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                              style={{ background: 'hsl(239 84% 67%)' }}
                            >
                              {addCommentMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                              Comment
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Activity tab */}
                  {activeTab === 'activity' && (
                    <div className="space-y-3 animate-fade-up">
                      {t.activityLogs?.map((log: any) => (
                        <div key={log.id} className="flex gap-3 items-start">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                            style={{ background: log.user?.color || '#6366f1' }}>
                            {getInitials(log.user?.name || '?')}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm" style={{ color: 'hsl(215 20% 70%)' }}>
                              <span className="font-medium text-white">{log.user?.name}</span>
                              {' '}{log.description}
                            </div>
                            <div className="text-xs mt-0.5" style={{ color: 'hsl(215 15% 40%)' }}>
                              {formatRelative(log.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!t.activityLogs || t.activityLogs.length === 0) && (
                        <div className="text-sm text-center py-8" style={{ color: 'hsl(215 15% 40%)' }}>
                          No activity yet
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-5">
                {/* Assignees */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(215 15% 45%)' }}>
                    Assignees
                  </div>
                  <div className="space-y-2">
                    {t.assignees?.map(({ user }: any) => (
                      <div key={user.id} className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: user.color }}>
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <div className="text-sm text-white">{user.name}</div>
                          <div className="text-xs" style={{ color: 'hsl(215 15% 45%)' }}>{user.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meta */}
                <div className="space-y-3">
                  {t.estimatedHours && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'hsl(215 15% 45%)' }}>
                        Time Estimate
                      </div>
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'hsl(215 20% 70%)' }}>
                        <Clock className="w-4 h-4" />
                        {t.estimatedHours}h est · {t.timeSpent ?? 0}h spent
                      </div>
                    </div>
                  )}

                  {t.startDate && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'hsl(215 15% 45%)' }}>
                        Start Date
                      </div>
                      <div className="text-sm" style={{ color: 'hsl(215 20% 70%)' }}>{formatDate(t.startDate)}</div>
                    </div>
                  )}

                  {t.dueDate && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'hsl(215 15% 45%)' }}>
                        Due Date
                      </div>
                      <div className="text-sm" style={{ color: 'hsl(215 20% 70%)' }}>{formatDate(t.dueDate)}</div>
                    </div>
                  )}
                </div>

                {/* Labels */}
                {t.labels?.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(215 15% 45%)' }}>
                      Labels
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {t.labels.map(({ label }: any) => (
                        <span key={label.id} className="text-xs px-2 py-1 rounded-full"
                          style={{ background: label.color + '20', color: label.color, border: `1px solid ${label.color}30` }}>
                          {label.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
