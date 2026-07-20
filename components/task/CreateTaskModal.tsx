'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PRIORITY_CONFIG, STATUS_CONFIG } from '@/lib/utils'

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
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])

  const { data: members } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const res = await fetch('/api/members')
      return res.json()
    },
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'MEDIUM', status: 'TODO' },
  })

  const createTask = useMutation({
    mutationFn: async (data: FormData & { assigneeIds: string[] }) => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      onClose()
    },
  })

  function onSubmit(data: FormData) {
    createTask.mutate({ ...data, assigneeIds: selectedAssignees })
  }

  function toggleAssignee(id: string) {
    setSelectedAssignees(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

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
          className="relative w-full max-w-lg rounded-2xl overflow-hidden"
          style={{ background: 'hsl(222 40% 10%)', border: '1px solid hsl(222 25% 18%)' }}
        >
          <div className="flex items-center justify-between p-6 pb-4 border-b" style={{ borderColor: 'hsl(222 25% 16%)' }}>
            <h2 className="text-lg font-bold text-white">Create Task</h2>
            <button onClick={onClose} style={{ color: 'hsl(215 15% 45%)' }}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'hsl(215 15% 45%)' }}>
                Title *
              </label>
              <input
                {...register('title')}
                placeholder="Task title…"
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
                style={{ background: 'hsl(222 35% 12%)', border: '1px solid hsl(222 25% 20%)' }}
              />
              {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'hsl(215 15% 45%)' }}>
                Description
              </label>
              <textarea
                {...register('description')}
                placeholder="Optional description…"
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 resize-none outline-none"
                style={{ background: 'hsl(222 35% 12%)', border: '1px solid hsl(222 25% 20%)' }}
              />
            </div>

            {/* Priority + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'hsl(215 15% 45%)' }}>
                  Priority
                </label>
                <select
                  {...register('priority')}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: 'hsl(222 35% 12%)', border: '1px solid hsl(222 25% 20%)' }}
                >
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'hsl(215 15% 45%)' }}>
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: 'hsl(222 35% 12%)', border: '1px solid hsl(222 25% 20%)' }}
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
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'hsl(215 15% 45%)' }}>
                  Due Date
                </label>
                <input
                  {...register('dueDate')}
                  type="date"
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: 'hsl(222 35% 12%)', border: '1px solid hsl(222 25% 20%)', colorScheme: 'dark' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'hsl(215 15% 45%)' }}>
                  Estimated Hours
                </label>
                <input
                  {...register('estimatedHours', { valueAsNumber: true })}
                  type="number"
                  placeholder="e.g. 8"
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
                  style={{ background: 'hsl(222 35% 12%)', border: '1px solid hsl(222 25% 20%)' }}
                />
              </div>
            </div>

            {/* Assignees */}
            {members && members.length > 0 && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(215 15% 45%)' }}>
                  Assignees
                </label>
                <div className="flex flex-wrap gap-2">
                  {members.map((m: any) => {
                    const selected = selectedAssignees.includes(m.id)
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleAssignee(m.id)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-all"
                        style={{
                          background: selected ? 'rgba(99,102,241,0.15)' : 'hsl(222 35% 12%)',
                          border: `1px solid ${selected ? 'hsl(239 84% 60%)' : 'hsl(222 25% 20%)'}`,
                          color: selected ? 'hsl(239 84% 80%)' : 'hsl(215 20% 65%)',
                        }}
                      >
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: m.color }}>
                          {m.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </div>
                        {m.name.split(' ')[0]}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'hsl(222 35% 14%)', color: 'hsl(215 20% 65%)', border: '1px solid hsl(222 25% 20%)' }}>
                Cancel
              </button>
              <button type="submit" disabled={createTask.isPending}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2"
                style={{ background: 'hsl(239 84% 67%)' }}>
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
