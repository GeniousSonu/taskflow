import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database for IbWorks...')

  // Clear existing data
  await prisma.user.deleteMany()
  await prisma.project.deleteMany()
  await prisma.channel.deleteMany()
  await prisma.task.deleteMany()
  await prisma.subtask.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.activityLog.deleteMany()

  // Create default 2 users
  const password = await bcrypt.hash('password123', 10)
  const sahinur = await prisma.user.create({
    data: {
      name: 'Sahinur Islam',
      email: 'sahinur@ibarts.in',
      password,
      role: 'ADMIN',
      color: '#6366f1',
      department: 'Management',
      avatar: 'SI',
    },
  })

  const faisal = await prisma.user.create({
    data: {
      name: 'Faisal',
      email: 'faisal@ibarts.in',
      password,
      role: 'MEMBER',
      color: '#10b981',
      department: 'Development',
      avatar: 'F',
    },
  })
  console.log('✅ Created default users: Sahinur & Faisal')

  // Create Projects
  const blueLane = await prisma.project.create({
    data: {
      name: 'Blue Lane Cabinetry',
      slug: 'blue-lane-cabinetry',
      color: '#3b82f6',
      emoji: '🟦',
      description: 'WooCommerce storefront redesign project',
    },
  })

  await prisma.project.create({
    data: {
      name: 'LynqCore',
      slug: 'lynqcore',
      color: '#8b5cf6',
      emoji: '🟪',
      description: 'Internal API & core messaging integration',
    },
  })

  await prisma.project.create({
    data: {
      name: 'Internal',
      slug: 'internal',
      color: '#eab308',
      emoji: '🟨',
      description: 'IbWorks platform tooling & optimization',
    },
  })
  console.log('✅ Created projects')

  // Create Channels for Blue Lane Cabinetry
  const chM3 = await prisma.channel.create({
    data: { name: 'Milestone 3', projectId: blueLane.id, order: 0, icon: '📂' },
  })
  const chM4 = await prisma.channel.create({
    data: { name: 'Milestone 4', projectId: blueLane.id, order: 1, icon: '📂' },
  })
  const chM5 = await prisma.channel.create({
    data: { name: 'Milestone 5', projectId: blueLane.id, order: 2, icon: '📂' },
  })
  const chQA = await prisma.channel.create({
    data: { name: 'QA', projectId: blueLane.id, order: 3, icon: '📂' },
  })
  const chLaunch = await prisma.channel.create({
    data: { name: 'Launch', projectId: blueLane.id, order: 4, icon: '📂' },
  })
  const chBlocked = await prisma.channel.create({
    data: { name: 'Blocked', projectId: blueLane.id, order: 5, icon: '📂' },
  })
  console.log('✅ Created channels for Blue Lane Cabinetry')

  // Create Labels
  const labels = [
    { name: 'Frontend', color: '#6366f1' },
    { name: 'Backend', color: '#10b981' },
    { name: 'QA', color: '#f59e0b' },
    { name: 'WordPress', color: '#3b82f6' },
  ]
  for (const l of labels) {
    await prisma.label.upsert({
      where: { id: l.name },
      update: {},
      create: l,
    })
  }

  // Seeding Milestone 3 Tasks inside "Milestone 3" Channel
  const tM3 = await prisma.task.create({
    data: {
      title: 'Milestone 3 — Product & Collection Templates',
      description: 'Restyle PDP, generic product template, dynamic eyebrow, ship_time logic, mobile swipeable gallery, and sticky Add to Cart.',
      status: 'DONE',
      priority: 'HIGH',
      channelId: chM3.id,
      progress: 100,
      reporterId: sahinur.id,
      estimatedHours: 40,
      timeSpent: 42,
    },
  })
  await prisma.taskAssignee.create({ data: { taskId: tM3.id, userId: sahinur.id } })
  await prisma.taskAssignee.create({ data: { taskId: tM3.id, userId: faisal.id } })

  const m3Subs = [
    { title: 'Restyle /product/wos/ PDP layout', completed: true },
    { title: 'Build generic single product template', completed: true },
    { title: 'Add dynamic eyebrow + .pdp-desc field', completed: true },
    { title: 'Implement ship_time show/hide logic', completed: true },
    { title: 'Add SKU search filter on collection pages', completed: true },
    { title: 'Mobile swipeable gallery (touch events)', completed: true },
    { title: 'Sticky Add to Cart on mobile scroll', completed: true },
  ]
  for (let i = 0; i < m3Subs.length; i++) {
    await prisma.subtask.create({ data: { ...m3Subs[i], taskId: tM3.id, order: i } })
  }

  // Seeding Milestone 4 Tasks inside "Milestone 4" Channel
  const tM4 = await prisma.task.create({
    data: {
      title: 'Milestone 4 — Cart, Checkout & PayPal Stack',
      description: 'Cart and checkout template overrides, multi-collection cart notice, PayPal SDK, mobile layout redesign, and full purchase flow QA.',
      status: 'DONE',
      priority: 'CRITICAL',
      channelId: chM4.id,
      progress: 100,
      reporterId: sahinur.id,
      estimatedHours: 32,
      timeSpent: 35,
    },
  })
  await prisma.taskAssignee.create({ data: { taskId: tM4.id, userId: faisal.id } })

  const m4Subs = [
    { title: 'Override cart template (woocommerce/cart/cart.php)', completed: true },
    { title: 'Override checkout template + billing/shipping fields', completed: true },
    { title: 'Multi-collection cart notice (banner logic)', completed: true },
    { title: 'PayPal SDK integration + Smart Buttons stack', completed: true },
    { title: 'Mobile cart card layout (responsive redesign)', completed: true },
    { title: 'Full purchase flow QA (add → cart → checkout → order)', completed: true },
  ]
  for (let i = 0; i < m4Subs.length; i++) {
    await prisma.subtask.create({ data: { ...m4Subs[i], taskId: tM4.id, order: i } })
  }

  // Seeding Milestone 5 Tasks inside "Milestone 5" Channel
  const tM5 = await prisma.task.create({
    data: {
      title: 'Milestone 5 — QA, Documentation & Handoff',
      description: 'Final cross-browser QA, asset cleanup, code documentation, and pre-deployment checklists.',
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      channelId: chM5.id,
      progress: 85,
      reporterId: sahinur.id,
      estimatedHours: 20,
      timeSpent: 17,
    },
  })
  await prisma.taskAssignee.create({ data: { taskId: tM5.id, userId: sahinur.id } })
  await prisma.taskAssignee.create({ data: { taskId: tM5.id, userId: faisal.id } })

  const m5Subs = [
    { title: 'iOS Safari QA — full app flow', completed: true },
    { title: 'Android Chrome QA — full app flow', completed: true },
    { title: 'iPad Safari QA — full app flow', completed: true },
    { title: 'Organize CSS/JS assets — no duplicates', completed: true },
    { title: 'Clean functions.php — add comments', completed: true },
    { title: 'Pre-deployment checklist review', completed: true },
    { title: 'Prepare README / Handoff document', completed: false, progress: 70 },
    { title: 'Production deployment', completed: false, progress: 0 },
  ]
  for (let i = 0; i < m5Subs.length; i++) {
    await prisma.subtask.create({ data: { ...m5Subs[i], taskId: tM5.id, order: i } })
  }

  console.log('✅ Preloaded all Milestone tasks and subtasks')
  console.log('🌱 Seed completed successfully.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
