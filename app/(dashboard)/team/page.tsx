'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Users, Mail, UserCheck, Shield, Award, Trash2 } from 'lucide-react'
import { getInitials } from '@/lib/utils'

export default function TeamPage() {
  const queryClient = useQueryClient()
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'member', department: '', color: '#6366f1' })

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
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] })
      setShowAddMember(false)
      setNewMember({ name: '', email: '', role: 'member', department: '', color: '#6366f1' })
    },
  })

  if (isLoading) {
    return <div className="p-6 text-center text-slate-400">Loading team...</div>
  }

  const list = members || []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: 'hsl(222 25% 14%)' }}>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <h1 className="text-xl font-bold text-white">Team Members</h1>
        </div>
        <button
          onClick={() => setShowAddMember(!showAddMember)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'hsl(239 84% 67%)' }}
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Add Member Form */}
      {showAddMember && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            addMemberMutation.mutate(newMember)
          }}
          className="p-6 rounded-xl space-y-4 max-w-md"
          style={{ background: 'hsl(222 35% 12%)', border: '1px solid hsl(222 25% 18%)' }}
        >
          <h2 className="text-base font-semibold text-white">Add New Team Member</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
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
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
              <input
                required
                type="email"
                value={newMember.email}
                onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                placeholder="e.g. sahinur@bluelane.com"
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
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
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
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                Create Member
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((m: any) => (
          <div
            key={m.id}
            className="p-6 rounded-xl flex flex-col justify-between space-y-4 hover:shadow-lg transition-shadow"
            style={{ background: 'hsl(222 35% 12%)', border: '1px solid hsl(222 25% 18%)' }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white ring-4 ring-white/5"
                style={{ background: m.color }}
              >
                {getInitials(m.name)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold truncate">{m.name}</h3>
                <p className="text-xs truncate flex items-center gap-1.5 mt-0.5" style={{ color: 'hsl(215 15% 45%)' }}>
                  <Mail className="w-3.5 h-3.5" />
                  {m.email}
                </p>
                {m.department && (
                  <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded mt-2.5" style={{ background: 'rgba(255,255,255,0.06)', color: 'hsl(215 20% 70%)' }}>
                    {m.department}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center border-t pt-4" style={{ borderColor: 'hsl(222 25% 16%)' }}>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span className="capitalize">{m.role}</span>
              </div>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
