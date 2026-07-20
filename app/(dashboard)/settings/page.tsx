'use client'

import { useState } from 'react'
import { Settings, User, Bell, Shield, Database } from 'lucide-react'

export default function SettingsPage() {
  const [activeSec, setActiveSec] = useState('workspace')

  const secs = [
    { id: 'workspace', label: 'Workspace Configuration', icon: Settings },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'notifications', label: 'Notifications & Alerts', icon: Bell },
    { id: 'database', label: 'Database & Backups', icon: Database },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4" style={{ borderColor: 'hsl(222 25% 14%)' }}>
        <h1 className="text-xl font-bold text-white">System Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Nav list */}
        <div className="space-y-1">
          {secs.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSec(s.id)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all text-left"
              style={activeSec === s.id
                ? { background: 'rgba(99,102,241,0.15)', color: 'hsl(239 84% 72%)' }
                : { color: 'hsl(215 15% 45%)' }
              }
            >
              <s.icon className="w-4 h-4" />
              {s.label}
            </button>
          ))}
        </div>

        {/* Configurations panel */}
        <div className="lg:col-span-3 p-6 rounded-xl space-y-6" style={{ background: 'hsl(222 35% 12%)', border: '1px solid hsl(222 25% 18%)' }}>
          {activeSec === 'workspace' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-white">Workspace Configuration</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Workspace Slug</label>
                  <input
                    readOnly
                    type="text"
                    value="blue-lane-cabinetry"
                    className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Workspace Name</label>
                  <input
                    type="text"
                    defaultValue="Blue Lane Cabinetry"
                    className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    rows={3}
                    defaultValue="WooCommerce storefront redesign — product templates, cart/checkout, PayPal integration, QA & handoff."
                    className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white outline-none resize-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSec === 'profile' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-white">My Profile Settings</h2>
              <p className="text-xs text-slate-400">Manage your profile details and role preferences</p>
            </div>
          )}

          {activeSec === 'notifications' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-white">Notifications & Alerts</h2>
              <p className="text-xs text-slate-400">Configure email and real-time socket alert channels</p>
            </div>
          )}

          {activeSec === 'database' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-white">Database & Backups</h2>
              <p className="text-xs text-slate-400">Prisma database management and export options</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
