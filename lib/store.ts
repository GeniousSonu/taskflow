import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
  color: string
  role: string
  avatar?: string
}

interface Project {
  id: string
  name: string
  slug: string
  color: string
  emoji: string
  description?: string
}

interface Channel {
  id: string
  name: string
  icon: string
  projectId: string
  order: number
}

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  progress: number
  order: number
  channelId: string
  reporterId?: string
  dueDate?: string
  estimatedHours?: number
  timeSpent?: number
  assignees: { user: User }[]
  subtasks: Subtask[]
  labels: { label: { id: string; name: string; color: string } }[]
  _count?: { comments: number }
}

interface Subtask {
  id: string
  title: string
  completed: boolean
  status: string
  progress: number
  assigneeId?: string
  dueDate?: string
  order: number
}

interface TypingUser {
  userId: string
  userName: string
  context: string
}

interface AppState {
  projects: Project[]
  selectedProject: Project | null
  channels: Channel[]
  selectedChannel: Channel | null
  tasks: Task[]
  selectedTask: Task | null
  isTaskModalOpen: boolean
  onlineUsers: string[]
  typingUsers: TypingUser[]
  notifications: number
  sidebarCollapsed: boolean

  setProjects: (projects: Project[]) => void
  setSelectedProject: (project: Project | null) => void
  setChannels: (channels: Channel[]) => void
  setSelectedChannel: (channel: Channel | null) => void
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (task: Partial<Task> & { id: string }) => void
  removeTask: (id: string) => void
  setSelectedTask: (task: Task | null) => void
  openTaskModal: (task: Task) => void
  closeTaskModal: () => void
  setOnlineUsers: (users: string[]) => void
  addTypingUser: (user: TypingUser) => void
  removeTypingUser: (userId: string) => void
  setNotifications: (count: number) => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  projects: [],
  selectedProject: null,
  channels: [],
  selectedChannel: null,
  tasks: [],
  selectedTask: null,
  isTaskModalOpen: false,
  onlineUsers: [],
  typingUsers: [],
  notifications: 0,
  sidebarCollapsed: false,

  setProjects: (projects) => set({ projects }),
  setSelectedProject: (project) => set({ selectedProject: project }),
  setChannels: (channels) => set({ channels }),
  setSelectedChannel: (channel) => set({ selectedChannel: channel }),
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
  updateTask: (task) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === task.id ? { ...t, ...task } : t)),
      selectedTask: s.selectedTask?.id === task.id
        ? { ...s.selectedTask, ...task }
        : s.selectedTask,
    })),
  removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
  setSelectedTask: (task) => set({ selectedTask: task }),
  openTaskModal: (task) => set({ selectedTask: task, isTaskModalOpen: true }),
  closeTaskModal: () => set({ isTaskModalOpen: false, selectedTask: null }),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  addTypingUser: (user) =>
    set((s) => ({
      typingUsers: [...s.typingUsers.filter((u) => u.userId !== user.userId), user],
    })),
  removeTypingUser: (userId) =>
    set((s) => ({
      typingUsers: s.typingUsers.filter((u) => u.userId !== userId),
    })),
  setNotifications: (count) => set({ notifications: count }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}))
