import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'No date'
  const d = new Date(date)
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  return format(d, 'MMM d, yyyy')
}

export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false
  return isPast(new Date(date))
}

export const PRIORITY_CONFIG = {
  LOW: { label: 'Low', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20', dot: '#94a3b8' },
  MEDIUM: { label: 'Medium', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', dot: '#60a5fa' },
  HIGH: { label: 'High', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', dot: '#fbbf24' },
  CRITICAL: { label: 'Critical', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', dot: '#f87171' },
} as const

export const STATUS_CONFIG = {
  TODO: { label: 'Todo', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', dot: '#64748b' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: '#3b82f6' },
  REVIEW: { label: 'Review', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', dot: '#8b5cf6' },
  BLOCKED: { label: 'Blocked', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', dot: '#ef4444' },
  DONE: { label: 'Done', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: '#10b981' },
} as const

export type Priority = keyof typeof PRIORITY_CONFIG
export type Status = keyof typeof STATUS_CONFIG

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function generateAvatarColor(name: string): string {
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
    '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
