import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  // Online active users cache
  const activeRooms: Record<string, Set<string>> = {}

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`)

    socket.on('join-workspace', ({ workspaceId, userId, userName }) => {
      socket.join(workspaceId)
      console.log(`👤 ${userName} joined workspace: ${workspaceId}`)

      if (!activeRooms[workspaceId]) {
        activeRooms[workspaceId] = new Set()
      }
      activeRooms[workspaceId].add(userId)

      io.to(workspaceId).emit('workspace-presence', Array.from(activeRooms[workspaceId]))
    })

    socket.on('typing-start', ({ workspaceId, userId, userName, context }) => {
      socket.to(workspaceId).emit('user-typing', { userId, userName, context })
    })

    socket.on('typing-stop', ({ workspaceId, userId }) => {
      socket.to(workspaceId).emit('user-stopped-typing', { userId })
    })

    socket.on('task-updated', ({ workspaceId, task }) => {
      socket.to(workspaceId).emit('task-sync', task)
    })

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`)
    })
  })

  httpServer.once('error', (err) => {
    console.error(err)
    process.exit(1)
  })

  httpServer.listen(port, () => {
    console.log(`🚀 Ready on http://${hostname}:${port}`)
  })
})
