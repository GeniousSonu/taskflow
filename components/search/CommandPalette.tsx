'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Folder, Hash, CheckSquare, User, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>({ projects: [], channels: [], tasks: [], members: [] })
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const { setSelectedProject, setSelectedChannel, openTaskModal } = useAppStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    };
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    setQuery('')
    setSelectedIndex(0)
    setResults({ projects: [], channels: [], tasks: [], members: [] })
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen])

  useEffect(() => {
    if (!query) {
      setResults({ projects: [], channels: [], tasks: [], members: [] })
      return
    }
    setLoading(true)
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => clearTimeout(delayDebounce)
  }, [query])

  const totalResults = [
    ...results.projects.map((p: any) => ({ ...p, type: 'project' })),
    ...results.channels.map((c: any) => ({ ...c, type: 'channel' })),
    ...results.tasks.map((t: any) => ({ ...t, type: 'task' })),
    ...results.members.map((m: any) => ({ ...m, type: 'member' })),
  ]

  const handleSelect = (item: any) => {
    setIsOpen(false)
    if (item.type === 'project') {
      setSelectedProject(item)
      router.push('/board')
    } else if (item.type === 'channel') {
      setSelectedProject(item.project || null)
      setSelectedChannel(item)
      router.push('/board')
    } else if (item.type === 'task') {
      setSelectedProject(item.channel?.project || null)
      setSelectedChannel(item.channel || null)
      openTaskModal(item)
    } else if (item.type === 'member') {
      router.push('/team')
    }
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % Math.max(totalResults.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + totalResults.length) % Math.max(totalResults.length, 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (totalResults[selectedIndex]) {
        handleSelect(totalResults[selectedIndex])
      }
    }
  }

  return (
    <>
      {/* Visual toggle hint in headers */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
        style={{ background: 'hsl(222 35% 12%)', border: '1px solid hsl(222 25% 18%)', color: 'hsl(215 15% 45%)' }}
      >
        <Search className="w-3.5 h-3.5" />
        <span>Search…</span>
        <kbd className="px-1.5 py-0.5 rounded text-[10px] font-sans" style={{ background: 'hsl(222 25% 20%)' }}>
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: 'hsl(222 40% 9%)', border: '1px solid hsl(222 25% 16%)' }}
            >
              {/* Input wrapper */}
              <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'hsl(222 25% 14%)' }}>
                <Search className="w-5 h-5" style={{ color: 'hsl(215 15% 45%)' }} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search projects, channels, tasks, members…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder-gray-600"
                />
                <button onClick={() => setIsOpen(false)} style={{ color: 'hsl(215 15% 45%)' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Results list */}
              <div className="max-h-72 overflow-y-auto p-2 space-y-1">
                {totalResults.length > 0 ? (
                  totalResults.map((item: any, idx) => {
                    const active = idx === selectedIndex
                    return (
                      <div
                        key={`${item.type}-${item.id}`}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                        style={active ? { background: 'rgba(99,102,241,0.15)', color: 'white' } : { color: 'hsl(215 20% 65%)' }}
                      >
                        {item.type === 'project' && <Folder className="w-4 h-4 text-blue-400" />}
                        {item.type === 'channel' && <Hash className="w-4 h-4 text-violet-400" />}
                        {item.type === 'task' && <CheckSquare className="w-4 h-4 text-emerald-400" />}
                        {item.type === 'member' && <User className="w-4 h-4 text-indigo-400" />}
                        <div className="flex-1 truncate">
                          <span className="text-sm font-medium text-white">{item.name || item.title}</span>
                          {item.type === 'task' && (
                            <span className="text-[10px] ml-2 font-semibold uppercase tracking-wider text-slate-500">
                              {item.status}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : query && !loading ? (
                  <div className="text-center py-8 text-sm" style={{ color: 'hsl(215 15% 45%)' }}>
                    No results found for &ldquo;{query}&rdquo;
                  </div>
                ) : (
                  <div className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Type to begin searching...
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
