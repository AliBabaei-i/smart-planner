import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from './index.js'
import logger from '../utils/logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const runMigrations = () => {
  try {
    logger.info('Running migrations...')
    
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf-8')
    
    exec(schema)
    
    logger.success('✅ All migrations completed')
    process.exit(0)
  } catch (error) {
    logger.error('❌ Migration failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

runMigrations()