'use client'

import { useState } from 'react'
import { Settings, User, Bell, Palette, Moon, Sun, Check } from 'lucide-react'
import { useTheme, ACCENT_COLORS } from '@/components/theme/ThemeProvider'

export default function SettingsPage() {
  const [activeSec, setActiveSec] = useState('appearance')
  const { theme, accent, setTheme, setAccent } = useTheme()

  const secs = [
    { id: 'appearance', label: 'Theme & Appearance', icon: Palette },
    { id: 'workspace', label: 'Workspace Configuration', icon: Settings },
    { id: 'notifications', label: 'Notifications & Alerts', icon: Bell },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4 border-white/10">
        <h1 className="text-xl font-bold">System Settings</h1>
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
        <div className="lg:col-span-3 p-6 rounded-xl space-y-6 border border-white/10" style={{ background: 'hsl(222 35% 12%)' }}>
          {activeSec === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold">Theme & Appearance</h2>
                <p className="text-xs text-slate-400 mt-0.5">Customize your interface theme and color accents across IbWorks.</p>
              </div>

              {/* Theme Mode Switcher */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Interface Theme</label>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${theme === 'dark' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:bg-white/5'}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center">
                      <Moon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Dark Mode</div>
                      <div className="text-xs text-slate-400">Default dark theme</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${theme === 'light' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:bg-white/5'}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center">
                      <Sun className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Light Mode</div>
                      <div className="text-xs text-slate-400">Bright clean theme</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Accent Color Picker */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Accent Theme Color</label>
                <div className="flex flex-wrap gap-3">
                  {ACCENT_COLORS.map(c => {
                    const isSelected = accent.hex === c.hex
                    return (
                      <button
                        key={c.hex}
                        onClick={() => setAccent(c)}
                        className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${isSelected ? 'border-white bg-white/10 ring-2' : 'border-white/10 hover:bg-white/5'}`}
                        style={{ ringColor: c.hex }}
                      >
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-white" style={{ background: c.hex }}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </span>
                        <span>{c.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {activeSec === 'workspace' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold">Workspace Configuration</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Workspace Slug</label>
                  <input
                    readOnly
                    type="text"
                    value="blue-lane-cabinetry"
                    className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Workspace Name</label>
                  <input
                    type="text"
                    defaultValue="Blue Lane Cabinetry"
                    className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-500"
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

          {activeSec === 'notifications' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold">Notifications & Alerts</h2>
              <p className="text-xs text-slate-400">Configure email and real-time socket alert channels</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
