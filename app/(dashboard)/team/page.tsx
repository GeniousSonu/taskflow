'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Users, Mail, Shield, Trash2, Edit2, Check, X, Loader2 } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { useSession } from 'next-auth/react'

export default function TeamPage() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const currentUserRole = (session?.user as any)?.role || 'MEMBER'
  const currentUserId = (session?.user as any)?.id

  const [showAddMember, setShowAddMember] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'MEMBER', department: 'Development', color: '#6366f1' })
  const [editFormData, setEditFormData] = useState({ name: '', email: '', role: 'MEMBER', department: '', color: '#6366f1' })

  const { data: members, isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const res = await fetch('/api/members')
      return res.json()
    },
  })

  const addMemberMutation = useMutation({
    mutationFn: async (data: typeof newMember) => {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to add member')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] })
      setShowAddMember(false)
      setNewMember({ name: '', email: '', role: 'MEMBER', department: 'Development', color: '#6366f1' })
    },
  })

  const updateMemberMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof editFormData }) => {
      const res = await fetch(`/api/members/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update member')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] })
      setEditingMemberId(null)
    },
  })

  const deleteMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to delete member')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] })
    },
  })

  if (isLoading) {
    return <div className="p-6 text-center text-slate-400">Loading team members...</div>
  }

  const list = members || []

  const startEditing = (m: any) => {
    setEditingMemberId(m.id)
    setEditFormData({
      name: m.name,
      email: m.email,
      role: m.role || 'MEMBER',
      department: m.department || '',
      color: m.color || '#6366f1',
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4 border-white/10">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <h1 className="text-xl font-bold">Team Members</h1>
        </div>
        {currentUserRole === 'ADMIN' && (
          <button
            onClick={() => setShowAddMember(!showAddMember)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 bg-indigo-600 shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        )}
      </div>

      {/* Add Member Form */}
      {showAddMember && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            addMemberMutation.mutate(newMember)
          }}
          className="p-6 rounded-xl space-y-4 max-w-md border border-white/10"
          style={{ background: 'hsl(222 35% 12%)' }}
        >
          <h2 className="text-base font-semibold text-white">Add New Team Member</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name *</label>
              <input
                required
                type="text"
                value={newMember.name}
                onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="e.g. Sahinur Islam"
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address *</label>
              <input
                required
                type="email"
                value={newMember.email}
                onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                placeholder="e.g. sahinur@ibarts.in"
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Role</label>
                <select
                  value={newMember.role}
                  onChange={e => setNewMember({ ...newMember, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white outline-none"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Department</label>
                <input
                  type="text"
                  value={newMember.department}
                  onChange={e => setNewMember({ ...newMember, department: e.target.value })}
                  placeholder="e.g. Development"
                  className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white outline-none"
                />
              </div>
            </div>

            {addMemberMutation.isError && (
              <div className="p-2 text-xs rounded bg-red-500/10 border border-red-500/20 text-red-400">
                {(addMemberMutation.error as Error).message}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddMember(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addMemberMutation.isPending}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5"
              >
                {addMemberMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Create Member
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((m: any) => {
          const isEditing = editingMemberId === m.id
          const isSelf = currentUserId === m.id

          return (
            <div
              key={m.id}
              className="p-6 rounded-xl flex flex-col justify-between space-y-4 border border-white/10 shadow-lg relative transition-all"
              style={{ background: 'hsl(222 35% 12%)' }}
            >
              {isEditing ? (
                /* Edit Mode Form */
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Edit Member</div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Name</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded text-xs bg-white/5 border border-white/10 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Role</label>
                    <select
                      value={editFormData.role}
                      onChange={e => setEditFormData({ ...editFormData, role: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded text-xs bg-white/5 border border-white/10 text-white outline-none"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Department</label>
                    <input
                      type="text"
                      value={editFormData.department}
                      onChange={e => setEditFormData({ ...editFormData, department: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded text-xs bg-white/5 border border-white/10 text-white outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingMemberId(null)}
                      className="px-2.5 py-1 rounded text-xs bg-white/5 text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => updateMemberMutation.mutate({ id: m.id, data: editFormData })}
                      className="px-2.5 py-1 rounded text-xs bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                /* Card Display Mode */
                <>
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-extrabold text-white ring-4 ring-white/5 overflow-hidden flex-shrink-0"
                      style={{ background: m.color }}
                    >
                      {m.avatar?.startsWith('http') || m.avatar?.startsWith('data:') ? (
                        <img src={m.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : m.avatar ? (
                        <span>{m.avatar}</span>
                      ) : (
                        <span>{getInitials(m.name)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-bold truncate">{m.name}</h3>
                        {currentUserRole === 'ADMIN' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => startEditing(m)}
                              className="p-1 text-slate-400 hover:text-indigo-400 transition-colors"
                              title="Edit user"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {!isSelf && (
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete ${m.name}?`)) {
                                    deleteMemberMutation.mutate(m.id)
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-xs truncate flex items-center gap-1.5 mt-0.5 text-slate-400">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                        {m.email}
                      </p>
                      {m.department && (
                        <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded mt-2.5 bg-white/5 text-slate-300">
                          {m.department}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/10 pt-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Shield className={`w-3.5 h-3.5 ${m.role === 'ADMIN' ? 'text-amber-400' : 'text-indigo-400'}`} />
                      <span className="font-semibold text-white">{m.role}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </span>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
