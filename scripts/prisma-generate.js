const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const dbUrl = process.env.DATABASE_URL || ''
const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')

const postgresSchema = path.resolve(__dirname, '../prisma/schema.postgresql.prisma')
const activeSchema = path.resolve(__dirname, '../prisma/schema.prisma')

if (isPostgres && fs.existsSync(postgresSchema)) {
  console.log('⚙️ Environment detected PostgreSQL (DATABASE_URL starts with postgresql://). Syncing schema.postgresql.prisma -> schema.prisma...')
  fs.copyFileSync(postgresSchema, activeSchema)
} else {
  console.log('⚙️ Environment detected SQLite (or fallback). Using SQLite schema.prisma...')
}

try {
  execSync('npx prisma generate', { stdio: 'inherit' })
} catch (err) {
  console.error('❌ Failed to run prisma generate:', err)
  process.exit(1)
}
