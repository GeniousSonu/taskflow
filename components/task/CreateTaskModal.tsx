'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Search, Check } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PRIORITY_CONFIG, STATUS_CONFIG } from '@/lib/utils'
import { useAppStore } from '@/lib/store'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.string(),
  status: z.string(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().optional(),
})
type FormData = z.infer<typeof schema>

interface CreateTaskModalProps {
  onClose: () => void
}

export function CreateTaskModal({ onClose }: CreateTaskModalProps) {
  const queryClient = useQueryClient()
  const { selectedChannel } = useAppStore()
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
  const [memberSearch, setMemberSearch] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const { data: members } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const res = await fetch('/api/members')
      return res.json()
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { priority: 'MEDIUM', status: 'TODO' },
  })

  const createTask = useMutation({
    mutationFn: async (data: FormData & { assigneeIds: string[]; channelId?: string }) => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          channelId: selectedChannel?.id,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create task')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      onClose()
    },
    onError: (err: Error) => {
      setErrorMessage(err.message)
    },
  })

  function onSubmit(data: FormData) {
    setErrorMessage('')
    const payload = {
      ...data,
      estimatedHours: data.estimatedHours !== undefined && !isNaN(Number(data.estimatedHours)) ? Number(data.estimatedHours) : undefined,
      assigneeIds: selectedAssignees,
    }
    createTask.mutate(payload)
  }

  function toggleAssignee(id: string) {
    setSelectedAssignees(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const filteredMembers = (members || []).filter((m: any) =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.email.toLowerCase().includes(memberSearch.toLowerCase())
  )

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg rounded-2xl overflow-hidden border border-white/10"
          style={{ background: 'hsl(222 40% 10%)' }}
        >
          <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-bold text-white">Create Task</h2>
              {selectedChannel && (
                <span className="text-xs text-indigo-400 font-semibold">in #{selectedChannel.name}</span>
              )}
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {errorMessage && (
              <div className="p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Task Title *
              </label>
              <input
                {...register('title')}
                placeholder="Task title…"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-slate-600 outline-none focus:border-indigo-500"
              />
              {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Description
              </label>
              <textarea
                {...register('description')}
                placeholder="Optional description…"
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-slate-600 resize-none outline-none focus:border-indigo-500"
              />
            </div>

            {/* Priority + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Priority
                </label>
                <select
                  {...register('priority')}
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white outline-none"
                >
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white outline-none"
                >
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due date + hours */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Due Date
                </label>
                <input
                  {...register('dueDate')}
                  type="date"
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white outline-none"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Estimated Hours
                </label>
                <input
                  {...register('estimatedHours')}
                  type="number"
                  placeholder="e.g. 8"
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-slate-600 outline-none"
                />
              </div>
            </div>

            {/* Searchable Assignees */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Select Assignees
              </label>

              {/* Member Search input */}
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search members…"
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                {filteredMembers.map((m: any) => {
                  const selected = selectedAssignees.includes(m.id)
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleAssignee(m.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        selected
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 border'
                          : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white overflow-hidden flex-shrink-0"
                        style={{ background: m.color }}>
                        {m.avatar?.startsWith('http') || m.avatar?.startsWith('data:') ? (
                          <img src={m.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : m.avatar ? (
                          <span>{m.avatar}</span>
                        ) : (
                          <span>{m.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}</span>
                        )}
                      </div>
                      <span>{m.name}</span>
                      {selected && <Check className="w-3 h-3 text-indigo-400 stroke-[3]" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10">
                Cancel
              </button>
              <button type="submit" disabled={createTask.isPending}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {createTask.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Create Task
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
